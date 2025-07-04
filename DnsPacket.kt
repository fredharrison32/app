package com.fredh32.bird

import java.nio.ByteBuffer
import kotlin.experimental.and

class DnsPacket(private val data: ByteBuffer) {
    var domain: String? = null

    init {
        parseDomain()
    }

    private fun parseDomain() {
        try {
            // DNS queries start with a 12-byte header
            if (data.limit() < 12) {
                domain = null
                return
            }

            data.position(12)
            val domainParts = mutableListOf<String>()

            while (data.hasRemaining()) {
                val len = data.get().toInt() and 0xFF
                if (len == 0) break
                if (data.remaining() < len) {
                    domain = null
                    return
                }

                val labelBytes = ByteArray(len)
                data.get(labelBytes)
                val label = String(labelBytes)
                domainParts.add(label)
            }

            domain = domainParts.joinToString(".")
        } catch (e: Exception) {
            domain = null
        }
    }
}
