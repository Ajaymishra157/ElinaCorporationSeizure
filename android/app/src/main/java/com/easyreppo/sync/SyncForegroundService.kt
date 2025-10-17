package com.elinacorporationreact.sync

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat

class SyncForegroundService : Service() {

    override fun onCreate() {
        super.onCreate()
        Log.d("SyncForegroundService", "➡️ onCreate called")
        // Ensure notification channel exists
        NotificationHelper.ensureChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val title = intent?.getStringExtra("title") ?: "Downloading data"
        val message = intent?.getStringExtra("message") ?: "Starting…"
        val targetScreen = intent?.getStringExtra("targetScreen")

        Log.d("SyncForegroundService", "➡️ onStartCommand called with title=$title, message=$message")

        val notif = NotificationHelper.build(
            this,
            title,
            message,
            0,
            indeterminate = true,
            targetScreen = targetScreen
        )

        // Start foreground service with persistent notification
        startForeground(NotificationHelper.NOTIF_ID, notif)

        // If app process is killed, service will be recreated only if explicitly restarted
        return START_NOT_STICKY
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        Log.d("SyncForegroundService", "🛑 onTaskRemoved called → stopping service")
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() {
        Log.d("SyncForegroundService", "🛑 onDestroy called → stopping service & cancelling notification")
        stopSelf()
        NotificationHelper.cancel(this)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        fun start(context: Context, title: String, message: String, targetScreen: String) {
            Log.d("SyncForegroundService", "▶️ start() called → title=$title, message=$message, screen=$targetScreen")
            val i = Intent(context, SyncForegroundService::class.java).apply {
                putExtra("title", title)
                putExtra("message", message)
                putExtra("targetScreen", targetScreen)
            }
            ContextCompat.startForegroundService(context, i)
        }

        fun stop(context: Context) {
            Log.d("SyncForegroundService", "🛑 stop() called → stopping service & cancelling notification")
            context.stopService(Intent(context, SyncForegroundService::class.java))
            NotificationHelper.cancel(context)
        }
    }
}
