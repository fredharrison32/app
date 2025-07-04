package com.fredh32.bird

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.edit
import com.facebook.react.modules.core.DeviceEventManagerModule

class FocusControlModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        var instance: FocusControlModule? = null
    }

    init {
        instance = this
    }
    override fun getName() = "FocusControl"

    // Optional for JS warning suppression — not used here but required by NativeEventEmitter
    @ReactMethod
    fun addListener(eventName: String?) {
        // No-op
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // No-op
    }

    fun sendFocusSessionEndedEvent() {
        Log.d("FocusModule", "Sending focusSessionEnded event")
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("focusSessionEnded", null)
    }

    @ReactMethod
    fun startFocusSession(config: ReadableMap, promise: Promise) {
        try {
            val mode = config.getString("mode") ?: "standard"
            if (mode != "standard") {
                promise.reject("INVALID_MODE", "Only 'standard' mode supported in this version.")
                return
            }

            val duration = config.getInt("durationMinutes")
            val appsToBlock = config.getArray("appsToBlock")?.toArrayList()?.mapNotNull { it as? String } ?: listOf()
            val domainsToBlock = config.getArray("domainsToBlock")?.toArrayList()?.mapNotNull { it as? String } ?: listOf()
            val sessionId = config.getString("sessionId") ?: "default"
            val difficulty = config.getString("difficulty") ?: "easy"

            val prefs = reactApplicationContext.getSharedPreferences("FocusPrefs", Context.MODE_PRIVATE)
            prefs.edit() {
                putBoolean("focus_active", true)
                    .putString("session_id", sessionId)
                    .putInt("duration_minutes", duration)
                    .putStringSet("blocked_apps", appsToBlock.toSet())
                    .putStringSet("blocked_domains", domainsToBlock.toSet())
                    .putString("difficulty", difficulty).apply()
            }

            // 🔥 Start Foreground Service (next step)
            val intent = Intent(reactApplicationContext, FocusVpnService::class.java)
            intent.putExtra("duration", duration)
            reactApplicationContext.startForegroundService(intent)

            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("SESSION_ERROR", e.message)
        }
    }

    //@ReactMethod
    //fun startFocusSession(start: String, end: String, days: ReadableArray, difficulty: String, promise: Promise) {
    //    promise.resolve(null)
    //}

    @ReactMethod
    fun stopFocusSession(promise: Promise) {
        promise.resolve(null)
    }

    @ReactMethod
    fun setAppTimeLimit(apps: ReadableArray, minutes: Int, difficulty: String, promise: Promise) {
        promise.resolve(null)
    }

    @ReactMethod
    fun setMaxAppOpens(apps: ReadableArray, maxOpens: Int, interval: Int, days: ReadableArray, difficulty: String, promise: Promise) {
        promise.resolve(null)
    }

    @ReactMethod
    fun getSessionStatus(promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("FocusPrefs", Context.MODE_PRIVATE)
        val active = prefs.getBoolean("focus_active", false)
        val wasCompleted = prefs.getBoolean("last_session_completed", false)

        val result = Arguments.createMap().apply {
            putBoolean("isActive", active)
            putBoolean("wasCompleted", wasCompleted)
        }

        promise.resolve(result)
    }

    @ReactMethod
    fun clearSessionCompletionFlag() {
        val prefs = reactApplicationContext.getSharedPreferences("FocusPrefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("last_session_completed", false).apply()
    }

    @ReactMethod
    fun getRemainingTime(promise: Promise) {
        promise.resolve(900)
    }

    @ReactMethod
    fun getBlockedAttempts(promise: Promise) {
        promise.resolve(0)
    }

    @ReactMethod
    fun requestVpnPermission() {
        val activity = currentActivity
        if (activity is MainActivity) {
            activity.requestVpnPermission()
        } else {
            Log.e("FocusControl", "Cannot get MainActivity for VPN permission request")
        }
    }

}
