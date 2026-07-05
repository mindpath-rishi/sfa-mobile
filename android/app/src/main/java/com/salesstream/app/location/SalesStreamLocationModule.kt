package com.salesstream.app.location

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class SalesStreamLocationModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "SalesStreamLocation"

  @ReactMethod
  fun startNativeTracking(options: ReadableMap, promise: Promise) {
    try {
      val token = options.getString("token") ?: ""
      val workSessionId = options.getString("workSessionId") ?: ""
      val baseUrl = options.getString("baseUrl") ?: ""
      val intervalMs =
        if (options.hasKey("intervalMs")) options.getDouble("intervalMs").toLong() else 5000L
      val distanceMeters =
        if (options.hasKey("distanceMeters")) options.getDouble("distanceMeters").toFloat() else 5f
      val notificationTitle =
        if (options.hasKey("notificationTitle")) options.getString("notificationTitle") else
          "Sales Stream live location active"
      val notificationBody =
        if (options.hasKey("notificationBody")) options.getString("notificationBody") else
          "Your live location is shared while your work day is active."

      if (token.isBlank()) {
        promise.reject("MISSING_TOKEN", "Native location requires token")
        return
      }

      if (workSessionId.isBlank()) {
        promise.reject("MISSING_WORK_SESSION", "Native location requires workSessionId")
        return
      }

      if (baseUrl.isBlank()) {
        promise.reject("MISSING_BASE_URL", "Native location requires baseUrl")
        return
      }

      val intent = Intent(reactContext, SalesStreamLocationService::class.java).apply {
        action = SalesStreamLocationService.ACTION_START
        putExtra(SalesStreamLocationService.EXTRA_TOKEN, token)
        putExtra(SalesStreamLocationService.EXTRA_WORK_SESSION_ID, workSessionId)
        putExtra(SalesStreamLocationService.EXTRA_BASE_URL, baseUrl)
        putExtra(SalesStreamLocationService.EXTRA_INTERVAL_MS, intervalMs)
        putExtra(SalesStreamLocationService.EXTRA_DISTANCE_METERS, distanceMeters)
        putExtra(SalesStreamLocationService.EXTRA_NOTIFICATION_TITLE, notificationTitle)
        putExtra(SalesStreamLocationService.EXTRA_NOTIFICATION_BODY, notificationBody)
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(intent)
      } else {
        reactContext.startService(intent)
      }

      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("START_NATIVE_LOCATION_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun stopNativeTracking(promise: Promise) {
    try {
      val intent = Intent(reactContext, SalesStreamLocationService::class.java).apply {
        action = SalesStreamLocationService.ACTION_STOP
      }

      reactContext.startService(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("STOP_NATIVE_LOCATION_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun syncPendingNativeLocations(promise: Promise) {
    try {
      val intent = Intent(reactContext, SalesStreamLocationService::class.java).apply {
        action = SalesStreamLocationService.ACTION_SYNC
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        reactContext.startForegroundService(intent)
      } else {
        reactContext.startService(intent)
      }

      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("SYNC_NATIVE_LOCATION_FAILED", error.message, error)
    }
  }
}
