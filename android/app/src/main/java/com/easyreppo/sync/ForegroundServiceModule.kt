package com.elinacorporationreact.sync

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ForegroundServiceModule.NAME)
class ForegroundServiceModule(private val reactCtx: ReactApplicationContext)
    : ReactContextBaseJavaModule(reactCtx) {

    companion object { const val NAME = "ForegroundService" }
    override fun getName() = NAME

    @ReactMethod
    fun start(title: String, message: String, targetScreen: String, promise: Promise) {
        try {
            NotificationHelper.ensureChannel(reactCtx)
            SyncForegroundService.start(reactCtx, title, message, targetScreen)
            promise.resolve(null)
        } catch (e: Exception) { promise.reject("START_ERR", e) }
    }

    @ReactMethod
    fun updateProgress(progress: Int, message: String?, promise: Promise) {
        try {
            val text = message ?: "$progress% completed"
            NotificationHelper.update(reactCtx, "Downloading data", text, progress)
            promise.resolve(null)
        } catch (e: Exception) { promise.reject("UPDATE_ERR", e) }
    }

    @ReactMethod
    fun stop(promise: Promise) {
        try {
            SyncForegroundService.stop(reactCtx)
            promise.resolve(null)
        } catch (e: Exception) { promise.reject("STOP_ERR", e) }
    }
}
