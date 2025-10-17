package com.elinacorporationreact.sync

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent  
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.TaskStackBuilder
import com.elinacorporationreact.MainActivity
import com.elinacorporationreact.R

object NotificationHelper {
    const val CHANNEL_ID = "easyreppo_sync_channel"
    const val CHANNEL_NAME = "Sync Progress"
    const val NOTIF_ID = 1001

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val mgr = context.getSystemService(NotificationManager::class.java)
            if (mgr?.getNotificationChannel(CHANNEL_ID) == null) {
                val ch = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    setShowBadge(false)
                    description = "Shows sync progress"
                }
                mgr?.createNotificationChannel(ch)
            }
        }
    }

    fun build(
    context: Context,
    title: String,
    text: String,
    progress: Int = -1,
    indeterminate: Boolean = false,
    targetScreen: String? = null
): Notification {
    val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("targetScreen", targetScreen)
            action = System.currentTimeMillis().toString() 
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }

       val pendingIntent: PendingIntent = PendingIntent.getActivity(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val builder = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(R.mipmap.ic_launcher)
        .setContentTitle(if (progress >= 0) "$title - $progress%" else title) // 👈 show % in title
        .setContentText(text)
        .setContentIntent(pendingIntent)
        .setOngoing(true)
        .setAutoCancel(false)
        .setOnlyAlertOnce(true)
        .setPriority(NotificationCompat.PRIORITY_LOW)

    if (progress >= 0) {
        builder.setProgress(100, progress.coerceIn(0, 100), indeterminate)
    }
    return builder.build()
}

    fun update(context: Context, title: String, text: String, progress: Int) {
        NotificationManagerCompat.from(context)
            .notify(NOTIF_ID, build(context, title, text, progress, false))
    }

    fun cancel(context: Context) {
        NotificationManagerCompat.from(context).cancel(NOTIF_ID)
    }
}
