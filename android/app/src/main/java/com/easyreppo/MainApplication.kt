package com.elinacorporationreact

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.elinacorporationreact.sync.ForegroundServicePackage;
import android.content.Intent
import com.elinacorporationreact.sync.SyncForegroundService
import com.elinacorporationreact.sync.NotificationHelper
import kotlin.system.exitProcess
import android.content.Context
import android.app.NotificationManager
import android.util.Log


class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(ForegroundServicePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }

    // --- GLOBAL CRASH HANDLER ---
    val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            try {
                Log.e("CrashHandler", "Uncaught exception detected: ${throwable.message}")

                // 1️⃣ Stop foreground service
                val intent = Intent(this, SyncForegroundService::class.java)
                stopService(intent)
                Log.d("CrashHandler", "Foreground service stop attempted")

                // 2️⃣ Cancel notification forcibly
                val notificationManager =
                    getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(NotificationHelper.NOTIF_ID)
                Log.d("CrashHandler", "Notification canceled")

            } catch (e: Exception) {
                e.printStackTrace()
            }

            // 3️⃣ Pass exception to default handler (for crash logs)
            defaultHandler?.uncaughtException(thread, throwable)

            // 4️⃣ Kill process
            android.os.Process.killProcess(android.os.Process.myPid())
            exitProcess(10)
        }
  }
}
