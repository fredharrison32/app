package com.fredh32.bird

import android.net.VpnService
import android.content.Intent
import android.content.Context
import android.util.Log
import android.os.Handler
import android.os.Looper
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.core.app.NotificationCompat
import android.os.ParcelFileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer
import java.util.concurrent.Executors

class FocusVpnService : VpnService() {
    private var tunInterface: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val prefs = getSharedPreferences("FocusPrefs", Context.MODE_PRIVATE)
        val isActive = prefs.getBoolean("focus_active", false)
        val duration = prefs.getInt("duration_minutes", 0)

        if (isActive && duration > 0) {
            val blockedDomains = prefs.getStringSet("blocked_domains", setOf()) ?: setOf()
            Log.d("FocusService", "Blocking domains: $blockedDomains for $duration minutes")

            // Start foreground service
            startForeground(1, buildFocusNotification(this))

            // Build VPN — only route DNS servers
            val builder = Builder()
                .addAddress("10.0.0.2", 32) // Local virtual address
                .addDnsServer("8.8.8.8") // DNS server used for forwarding (when not blocked)
                .addDnsServer("1.1.1.1")
                .addRoute("8.8.8.8", 32)    // Route DNS queries
                .addRoute("1.1.1.1", 32)

            tunInterface = builder.establish()
            if (tunInterface == null) {
                Log.e("FocusVPN", "Failed to establish VPN interface")
                stopSelf()
                return START_NOT_STICKY
            }

            Log.d("FocusVPN", "VPN interface established")

            // Read DNS packets and forward/block
            Executors.newSingleThreadExecutor().execute {
                tunInterface?.let {
                    // read/write raw network packets from VPN
                    val input = FileInputStream(it.fileDescriptor)
                    val output = FileOutputStream(it.fileDescriptor)
                    val buffer = ByteArray(32767)

                    while (true) {
                        val len = input.read(buffer)
                        if (len <= 0) continue

                        val packet = ByteBuffer.wrap(buffer, 0, len)
                        val copy = buffer.copyOfRange(0, len) // used for sending packet back untouched
                        packet.order(java.nio.ByteOrder.BIG_ENDIAN)

                        try {
                            // Check if only IPv4 is supported
                            val ipVersion = (packet.get(0).toInt() shr 4) and 0x0F
                            if (ipVersion != 4) continue

                            // Check if it's UDP
                            val protocol = packet.get(9).toInt() and 0xFF
                            if (protocol != 17) continue

                            // Get the start of the UDP header and extract the destination port
                            val ipHeaderLength = (packet.get(0).toInt() and 0x0F) * 4
                            val udpStart = ipHeaderLength
                            val dstPort = ((packet.get(udpStart + 2).toInt() and 0xFF) shl 8) or
                                    (packet.get(udpStart + 3).toInt() and 0xFF)

                            // Check if DNS
                            if (dstPort != 53) continue

                            // Figure out where DNS payload starts, skip if invalid
                            val dnsStart = udpStart + 8
                            val dnsLength = len - dnsStart
                            if (dnsLength <= 0) continue

                            // Parse the DNS payload, and extract domain name being queried
                            val dnsData = ByteArray(dnsLength)
                            System.arraycopy(buffer, dnsStart, dnsData, 0, dnsLength)

                            val dnsPacket = DnsPacket(ByteBuffer.wrap(dnsData))
                            val domain = dnsPacket.domain?.lowercase()?.removePrefix("www.")

                            Log.d("FocusVPN", "DNS query: $domain")
                            // if domain is blocked, drop it
                            if (domain != null && blockedDomains.contains(domain)) {
                                Log.d("FocusVPN", "Blocked DNS request to $domain")
                                continue
                            }

                            // Forward the allowed DNS
                            val response = forwardDnsQuery(copy)
                            if (response != null) {
                                output.write(response)
                                output.flush()
                                Log.d("FocusVPN", "Forwarded DNS for $domain")
                            }

                        } catch (e: Exception) {
                            Log.e("FocusVPN", "DNS parsing error", e)
                            output.write(copy)
                            output.flush()
                        }
                    }
                }
            }

            prefs.edit().putBoolean("focus_active", true).apply()

            // End session after duration
            val stopAfterMillis = duration * 60 * 1000L
            Handler(Looper.getMainLooper()).postDelayed({
                Log.d("FocusService", "Focus session ended after $duration minutes")
                showSessionEndedNotification()
                prefs.edit()
                    .putBoolean("last_session_completed", true)
                    .putBoolean("focus_active", false)
                    .apply()
                FocusControlModule.instance?.sendFocusSessionEndedEvent()
                stopSelf()
            }, stopAfterMillis)
        } else {
            Log.w("FocusService", "VPN not started: active=$isActive, duration=$duration")
            FocusControlModule.instance?.sendFocusSessionEndedEvent()
            stopSelf()
        }

        return START_STICKY
    }

    private fun buildFocusNotification(context: Context): Notification {
        val channelId = "focus_session_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Focus Session", NotificationManager.IMPORTANCE_LOW)
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(context, channelId)
            .setContentTitle("Focus Session Active")
            .setContentText("Blocking distractions...")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setOngoing(true)
            .build()
    }

    private fun showSessionEndedNotification() {
        val channelId = "focus_channel"
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Focus Session Alerts", NotificationManager.IMPORTANCE_DEFAULT)
            manager.createNotificationChannel(channel)
        }
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Focus session complete")
            .setContentText("Good job! Your focus session has ended.")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setAutoCancel(true)
            .build()
        manager.notify(1002, notification)
    }

    private fun forwardDnsQuery(query: ByteArray): ByteArray? {
        return try {
            val socket = DatagramSocket() // Create new UDP socket to send/receive packets
            protect(socket) // tell system to allow this socket to bypass VPN
            socket.soTimeout = 2000
            val address = InetAddress.getByName("8.8.8.8") // resolve the IP address for the target DNS server (Googles public DNS)
            socket.send(DatagramPacket(query, query.size, address, 53))  // create and send UDP packet that contains original DNS query

            val responseBuffer = ByteArray(512)
            val receivePacket = DatagramPacket(responseBuffer, responseBuffer.size)
            socket.receive(receivePacket)
            socket.close()
            responseBuffer.copyOf(receivePacket.length) // Trim the buffer to the actual response length and return it
        } catch (e: Exception) {
            Log.e("FocusVPN", "DNS forward failed", e)
            null
        }
    }
}
