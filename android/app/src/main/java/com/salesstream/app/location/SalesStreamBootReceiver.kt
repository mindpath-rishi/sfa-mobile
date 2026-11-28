package com.salesstream.app.location

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat

/**
 * Resumes live tracking after a phone restart or an app update (both stop the
 * tracking service) when a work day was still running.
 */
class SalesStreamBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      "android.intent.action.QUICKBOOT_POWERON",
      "com.htc.intent.action.QUICKBOOT_POWERON" -> resume(context)
    }
  }

  private fun resume(context: Context) {
    val restore = SalesStreamLocationService.restoreIntent(context) ?: return

    // Starting location tracking without the app open needs "Allow all the time".
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
      ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      Log.w(TAG, "Not resuming tracking: background location permission missing")
      return
    }

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(restore)
      } else {
        context.startService(restore)
      }
      Log.d(TAG, "Resuming tracking")
    } catch (error: Exception) {
      Log.e(TAG, "Could not resume tracking", error)
    }
  }

  private companion object {
    const val TAG = "SalesStreamBoot"
  }
}
