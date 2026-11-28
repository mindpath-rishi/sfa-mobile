package com.salesstream.app.location

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import io.socket.client.Ack
import io.socket.client.IO
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.net.URI
import java.util.concurrent.CountDownLatch
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class SalesStreamLocationService : Service() {
  companion object {
    private const val TAG = "SalesStreamLocation"
    const val ACTION_START = "com.salesstream.app.location.START"
    const val ACTION_STOP = "com.salesstream.app.location.STOP"
    const val ACTION_SYNC = "com.salesstream.app.location.SYNC"

    const val EXTRA_TOKEN = "token"
    const val EXTRA_WORK_SESSION_ID = "workSessionId"
    const val EXTRA_BASE_URL = "baseUrl"
    const val EXTRA_INTERVAL_MS = "intervalMs"
    const val EXTRA_DISTANCE_METERS = "distanceMeters"
    const val EXTRA_ACCURACY = "accuracy"
    const val EXTRA_MAX_ACCURACY_M = "maxAccuracyM"
    const val EXTRA_NOTIFICATION_TITLE = "notificationTitle"
    const val EXTRA_NOTIFICATION_BODY = "notificationBody"

    private const val CHANNEL_ID = "sales_stream_live_location"
    private const val NOTIFICATION_ID = 112233

    private const val PREFS_NAME = "sales_stream_native_location"
    private const val KEY_TOKEN = "token"
    private const val KEY_WORK_SESSION_ID = "workSessionId"
    private const val KEY_BASE_URL = "baseUrl"
    private const val KEY_PENDING_LOCATIONS = "pendingLocations"
    /** Tracking was started and not stopped (work day still running). */
    private const val KEY_ACTIVE = "active"
    private const val KEY_STARTED_AT = "startedAt"
    private const val KEY_INTERVAL_MS = "intervalMs"
    private const val KEY_DISTANCE_METERS = "distanceMeters"
    private const val KEY_ACCURACY = "accuracy"
    private const val KEY_MAX_ACCURACY_M = "maxAccuracyM"
    private const val KEY_NOTIFICATION_TITLE = "notificationTitle"
    private const val KEY_NOTIFICATION_BODY = "notificationBody"
    /** A day that was never ended is not resumed after this long (forgotten end-day). */
    private const val MAX_RESTORE_AGE_MS = 16 * 60 * 60 * 1000L // mobile access token lasts ~16.7 h

    /** Resume tracking from the saved start options (service restart, reboot, app update). */
    const val ACTION_RESTORE = "com.salesstream.app.location.RESTORE"

    private const val DEFAULT_TITLE = "Sales Stream live location active"
    private const val DEFAULT_BODY = "Your live location is shared while your work day is active."

    /**
     * Start intent rebuilt from the saved options, or null when there is no
     * running work day to resume.
     */
    fun restoreIntent(context: Context): Intent? {
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      if (!prefs.getBoolean(KEY_ACTIVE, false)) return null
      val startedAt = prefs.getLong(KEY_STARTED_AT, 0L)
      if (startedAt <= 0L || System.currentTimeMillis() - startedAt > MAX_RESTORE_AGE_MS) return null
      val token = prefs.getString(KEY_TOKEN, "") ?: ""
      val workSessionId = prefs.getString(KEY_WORK_SESSION_ID, "") ?: ""
      val baseUrl = prefs.getString(KEY_BASE_URL, "") ?: ""
      if (token.isBlank() || workSessionId.isBlank() || baseUrl.isBlank()) return null
      return Intent(context, SalesStreamLocationService::class.java).apply {
        action = ACTION_RESTORE
        putExtra(EXTRA_TOKEN, token)
        putExtra(EXTRA_WORK_SESSION_ID, workSessionId)
        putExtra(EXTRA_BASE_URL, baseUrl)
        putExtra(EXTRA_INTERVAL_MS, prefs.getLong(KEY_INTERVAL_MS, 5000L))
        putExtra(EXTRA_DISTANCE_METERS, prefs.getFloat(KEY_DISTANCE_METERS, 5f))
        putExtra(EXTRA_ACCURACY, prefs.getString(KEY_ACCURACY, "HIGH"))
        putExtra(EXTRA_MAX_ACCURACY_M, prefs.getFloat(KEY_MAX_ACCURACY_M, DEFAULT_MAX_ACCURACY_M))
        putExtra(EXTRA_NOTIFICATION_TITLE, prefs.getString(KEY_NOTIFICATION_TITLE, DEFAULT_TITLE))
        putExtra(EXTRA_NOTIFICATION_BODY, prefs.getString(KEY_NOTIFICATION_BODY, DEFAULT_BODY))
      }
    }

    // Same limits as the JS tracker and the server's live filter.
    private const val DEFAULT_MAX_ACCURACY_M = 50f
    /** Background fixes arrive batched/late on many phones; keep them for 10 min. */
    private const val MAX_LOCATION_AGE_MS = 10 * 60_000L
    /** Background fixes are often Wi-Fi / cell; never use a tighter limit than this. */
    private const val MIN_ACCURACY_LIMIT_M = 150f
    /** Largest jump that can still be written off as GPS drift. */
    private const val MAX_DRIFT_DISTANCE_METERS = 200f
    /** Above this reported speed (about 5 km/h) the phone is really moving. */
    private const val MOVING_SPEED_MPS = 1.4f
    private const val MAX_SPEED_MPS = 200f / 3.6f
    private const val MIN_STATIONARY_DISTANCE_METERS = 5f
    private const val MAX_STATIONARY_DISTANCE_METERS = 25f
    private const val JUMP_MIN_METERS = 300f
    private const val JUMP_RESET_MS = 5 * 60_000L
    private const val JUMP_CONFIRMATIONS = 3
  }

  /** Fixes worse than this (metres) are dropped; admin setting "Max accuracy". */
  private var maxAccuracyM = DEFAULT_MAX_ACCURACY_M
  private var lastAcceptedLocation: Location? = null
  private var jumpRejects = 0

  private lateinit var fusedClient: FusedLocationProviderClient
  private val httpClient: OkHttpClient =
    OkHttpClient.Builder()
      .connectTimeout(15, TimeUnit.SECONDS)
      .readTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .build()

  private val executor: ExecutorService = Executors.newSingleThreadExecutor()

  private var locationCallback: LocationCallback? = null
  private var started = false

  private var locationSocket: io.socket.client.Socket? = null
  private var locationSocketToken: String = ""
  private var locationSocketUrl: String = ""

  override fun onCreate() {
    super.onCreate()
    fusedClient = LocationServices.getFusedLocationProviderClient(this)
    createNotificationChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      null, ACTION_RESTORE -> if (!started) restoreTracking()

      ACTION_START -> {
        persistStartOptions(intent)
        val title = intent.getStringExtra(EXTRA_NOTIFICATION_TITLE)
          ?: "Sales Stream live location active"
        val body = intent.getStringExtra(EXTRA_NOTIFICATION_BODY)
          ?: "Your live location is shared while your work day is active."
        startForeground(NOTIFICATION_ID, buildNotification(title, body))
        startLocationUpdates(intent)
      }

      ACTION_STOP -> {
        markStopped()
        stopLocationUpdates()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
      }

      ACTION_SYNC -> {
        /**
         * Do not replace the live tracking notification with
         * "Pending live location records are being synced."
         *
         * If the service is already running, just sync silently.
         * If Android started this service only for sync, keep a normal live-location
         * foreground notification so the user does not think live tracking stopped.
         */
        if (!started) {
          startForeground(
            NOTIFICATION_ID,
            buildNotification(
              "Sales Stream live location active",
              "Your live location is shared while your work day is active."
            )
          )
        }

        syncPendingLocations()
      }
    }

    return START_STICKY
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onDestroy() {
    stopLocationUpdates()
    disconnectLocationSocket()
    executor.shutdownNow()
    super.onDestroy()
  }

  private fun persistStartOptions(intent: Intent) {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit()
      .putString(KEY_TOKEN, intent.getStringExtra(EXTRA_TOKEN) ?: "")
      .putString(KEY_WORK_SESSION_ID, intent.getStringExtra(EXTRA_WORK_SESSION_ID) ?: "")
      .putString(KEY_BASE_URL, intent.getStringExtra(EXTRA_BASE_URL) ?: "")
      .putBoolean(KEY_ACTIVE, true)
      .putLong(KEY_STARTED_AT, System.currentTimeMillis())
      .putLong(KEY_INTERVAL_MS, intent.getLongExtra(EXTRA_INTERVAL_MS, 5000L))
      .putFloat(KEY_DISTANCE_METERS, intent.getFloatExtra(EXTRA_DISTANCE_METERS, 5f))
      .putString(KEY_ACCURACY, intent.getStringExtra(EXTRA_ACCURACY) ?: "HIGH")
      .putFloat(KEY_MAX_ACCURACY_M, intent.getFloatExtra(EXTRA_MAX_ACCURACY_M, DEFAULT_MAX_ACCURACY_M))
      .putString(KEY_NOTIFICATION_TITLE, intent.getStringExtra(EXTRA_NOTIFICATION_TITLE) ?: DEFAULT_TITLE)
      .putString(KEY_NOTIFICATION_BODY, intent.getStringExtra(EXTRA_NOTIFICATION_BODY) ?: DEFAULT_BODY)
      .apply()
  }

  private fun markStopped() {
    getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putBoolean(KEY_ACTIVE, false).apply()
  }

  /**
   * Android restarted the service by itself (null intent after it was killed),
   * or the boot / app-update receiver asked to resume. Must reach
   * startForeground quickly, or Android kills the service again.
   */
  private fun restoreTracking() {
    val restore = restoreIntent(this)
    try {
      startForeground(
        NOTIFICATION_ID,
        buildNotification(
          restore?.getStringExtra(EXTRA_NOTIFICATION_TITLE) ?: DEFAULT_TITLE,
          restore?.getStringExtra(EXTRA_NOTIFICATION_BODY) ?: DEFAULT_BODY,
        ),
      )
    } catch (error: Exception) {
      // Android 12+ blocks some background starts; Android 14 needs "Allow all the time".
      Log.e(TAG, "Restore failed: cannot start foreground service", error)
      queueError("Tracking restore blocked: ${error.message ?: "unknown"}")
      stopSelf()
      return
    }
    if (restore == null) {
      Log.d(TAG, "Restore skipped: no running work day")
      stopForeground(STOP_FOREGROUND_REMOVE)
      stopSelf()
      return
    }
    Log.d(TAG, "Restoring tracking after restart")
    startLocationUpdates(restore)
    syncPendingLocations()
  }

  private fun startLocationUpdates(intent: Intent) {
    if (started) return

    if (
      ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) !=
      PackageManager.PERMISSION_GRANTED &&
      ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      queueError("Location permission missing")
      stopSelf()
      return
    }

    val intervalMs = intent.getLongExtra(EXTRA_INTERVAL_MS, 5000L)
    val distanceMeters = intent.getFloatExtra(EXTRA_DISTANCE_METERS, 5f)
    maxAccuracyM =
      maxOf(intent.getFloatExtra(EXTRA_MAX_ACCURACY_M, DEFAULT_MAX_ACCURACY_M), MIN_ACCURACY_LIMIT_M)
    lastAcceptedLocation = null
    jumpRejects = 0
    // Admin controlled: HIGH (GPS), BALANCED (Wi-Fi / cell, ~100 m), LOW (~10 km)
    val priority =
      when (intent.getStringExtra(EXTRA_ACCURACY)) {
        "BALANCED" -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
        "LOW" -> Priority.PRIORITY_LOW_POWER
        else -> Priority.PRIORITY_HIGH_ACCURACY
      }

    val request =
      LocationRequest.Builder(priority, intervalMs)
        .setMinUpdateIntervalMillis(1000L)
        .setMinUpdateDistanceMeters(distanceMeters)
        // HIGH: wait for a real GPS fix instead of sending the first Wi-Fi / cell guess.
        .setWaitForAccurateLocation(priority == Priority.PRIORITY_HIGH_ACCURACY)
        .build()

    locationCallback =
      object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
          for (location in result.locations) {
            handleLocation(location)
          }
        }
      }

    fusedClient.requestLocationUpdates(
      request,
      locationCallback!!,
      Looper.getMainLooper()
    )

    started = true

    Log.d(TAG, "Native location updates started intervalMs=$intervalMs distanceMeters=$distanceMeters")
  }

  private fun stopLocationUpdates() {
    locationCallback?.let {
      fusedClient.removeLocationUpdates(it)
    }
    locationCallback = null
    started = false
  }

  private fun isMockLocation(location: Location): Boolean =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      location.isMock
    } else {
      @Suppress("DEPRECATION")
      location.isFromMockProvider
    }

  /** Returns a stable fix, or null when the raw fix must be rejected. */
  private fun stabilizeLocation(location: Location): Location? {
    if (isMockLocation(location)) {
      Log.d(TAG, "Native location rejected: mock location")
      return null
    }
    if (location.hasAccuracy() && location.accuracy > maxAccuracyM) {
      Log.d(TAG, "Native location rejected: accuracy ${location.accuracy}m exceeds ${maxAccuracyM}m")
      return null
    }
    val ageMs = System.currentTimeMillis() - location.time
    if (ageMs > MAX_LOCATION_AGE_MS) {
      Log.d(TAG, "Native location rejected: stale (${ageMs}ms old)")
      return null
    }

    val previous = lastAcceptedLocation
    if (previous == null) {
      return Location(location).apply { speed = 0f }
    }
    if (location.time <= previous.time) {
      Log.d(TAG, "Native location rejected: older than the last sent fix")
      return null
    }

    val elapsedMs = location.time - previous.time
    val meters = previous.distanceTo(location)
    val accuracies = listOfNotNull(
      if (previous.hasAccuracy() && previous.accuracy > 0f) previous.accuracy else null,
      if (location.hasAccuracy() && location.accuracy > 0f) location.accuracy else null,
    )
    val accuracyThreshold = accuracies.maxOrNull() ?: MIN_STATIONARY_DISTANCE_METERS
    val stationaryThreshold = accuracyThreshold.coerceIn(
      MIN_STATIONARY_DISTANCE_METERS,
      MAX_STATIONARY_DISTANCE_METERS,
    )

    if (meters <= stationaryThreshold) {
      Log.d(TAG, "Native stationary GPS jitter suppressed distance=${meters}m threshold=${stationaryThreshold}m")
      return Location(location).apply {
        latitude = previous.latitude
        longitude = previous.longitude
        speed = 0f
      }
    }

    // GPS drift while standing still: a jump inside the fixes' own accuracy
    // radius with no real reported speed (Wi-Fi / cell fixes indoors jump 100 m+).
    val reportedMoving = location.hasSpeed() && location.speed > MOVING_SPEED_MPS
    if (meters <= MAX_DRIFT_DISTANCE_METERS && !reportedMoving && meters <= accuracyThreshold) {
      Log.d(TAG, "Native GPS drift held distance=${meters}m accuracy=${accuracyThreshold}m")
      return Location(location).apply {
        latitude = previous.latitude
        longitude = previous.longitude
        speed = 0f
        // Keep the held position's accuracy so one bad fix does not widen later checks
        if (previous.hasAccuracy()) accuracy = previous.accuracy
      }
    }

    val speed = meters / (elapsedMs / 1000f)
    if (
      elapsedMs < JUMP_RESET_MS &&
      meters > JUMP_MIN_METERS &&
      speed > MAX_SPEED_MPS &&
      jumpRejects + 1 < JUMP_CONFIRMATIONS
    ) {
      // A device that keeps reporting the new place was right; trust it after a few fixes.
      jumpRejects += 1
      Log.d(TAG, "Native location rejected: impossible jump (${speed.toInt()} m/s)")
      return null
    }
    return Location(location)
  }

  private fun handleLocation(location: Location) {
    Log.d(
      TAG,
      "Native location received lat=${location.latitude}, lng=${location.longitude}, accuracy=${if (location.hasAccuracy()) location.accuracy else -1f}"
    )

    val stableLocation = stabilizeLocation(location) ?: return
    lastAcceptedLocation = stableLocation
    jumpRejects = 0

    val payload = buildLocationPayload(stableLocation)

    // Save first so no location is lost if Android pauses network after sleep.
    savePendingLocation(payload)

    executor.execute {
      val uploaded = uploadSingle(payload)

      Log.d(
        TAG,
        "Native live upload result uploaded=$uploaded clientLocationId=${payload.optString("clientLocationId")}"
      )

      if (uploaded) {
        removePendingLocation(payload.optString("clientLocationId"))
      }

      // Try syncing older queued points also. This does not change notification.
      syncPendingLocationsInternal()
    }
  }

  private fun buildLocationPayload(location: Location): JSONObject {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val workSessionId = prefs.getString(KEY_WORK_SESSION_ID, "") ?: ""

    val capturedAt = isoNow(location.time)
    val clientLocationId =
      "${capturedAt}:${location.latitude}:${location.longitude}"

    val locationJson =
      JSONObject()
        .put("latitude", location.latitude)
        .put("longitude", location.longitude)
        .put("accuracy", if (location.hasAccuracy()) location.accuracy.toDouble() else JSONObject.NULL)
        .put("altitude", if (location.hasAltitude()) location.altitude else JSONObject.NULL)
        .put("speed", if (location.hasSpeed()) location.speed.toDouble() else JSONObject.NULL)
        .put("heading", if (location.hasBearing()) location.bearing.toDouble() else JSONObject.NULL)
        .put("capturedAt", capturedAt)

    return JSONObject()
      .put("clientLocationId", clientLocationId)
      .put("workSessionId", workSessionId)
      .put("source", "NATIVE_BACKGROUND")
      .put("location", locationJson)
  }

  private fun uploadSingle(payload: JSONObject): Boolean {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val token = prefs.getString(KEY_TOKEN, "") ?: ""
    val baseUrl = prefs.getString(KEY_BASE_URL, "") ?: ""

    Log.d(
      TAG,
      "Native upload started tokenAvailable=${token.isNotBlank()} baseUrl=$baseUrl workSessionId=${payload.optString("workSessionId")}"
    )

    if (token.isBlank() || baseUrl.isBlank()) {
      queueError("Native upload missing token/baseUrl")
      Log.e(TAG, "Native upload missing token/baseUrl")
      return false
    }

    // Native background delivery rule:
    // 1. Try Socket.IO first for live manager updates.
    // 2. If socket connect/ack fails quickly, fallback to HTTP.
    // 3. If HTTP fails, point remains in local native queue.
    val socketSent = emitLocationOverSocket(payload, token, getSocketBaseUrl(baseUrl))

    Log.d(TAG, "Native socket sent=$socketSent")

    if (socketSent) {
      return true
    }

    val httpSent = uploadSingleOverHttp(payload, token, baseUrl)

    Log.d(TAG, "Native HTTP fallback sent=$httpSent")

    return httpSent
  }

  private fun uploadSingleOverHttp(
    payload: JSONObject,
    token: String,
    baseUrl: String
  ): Boolean {
    return try {
      val url = baseUrl.trimEnd('/') + "/live-location-tracking/track"

      val body =
        payload.toString()
          .toRequestBody("application/json; charset=utf-8".toMediaType())

      val request =
        Request.Builder()
          .url(url)
          .addHeader("Authorization", "Bearer $token")
          .addHeader("Content-Type", "application/json")
          .post(body)
          .build()

      httpClient.newCall(request).execute().use { response ->
        val responseText = response.body?.string() ?: ""
        Log.d(
          TAG,
          "HTTP fallback response code=${response.code} success=${response.isSuccessful} body=${responseText.take(300)}"
        )
        response.isSuccessful
      }
    } catch (error: Exception) {
      queueError("HTTP fallback failed: ${error.message ?: "unknown"}")
      false
    }
  }

  private fun emitLocationOverSocket(
    payload: JSONObject,
    token: String,
    socketUrl: String
  ): Boolean {
    if (socketUrl.isBlank()) return false

    return try {
      val socket = getOrCreateLocationSocket(token, socketUrl) ?: return false

      if (!socket.connected()) {
        socket.connect()

        if (!waitForSocketConnect(socket, 2500L)) {
          queueError("Socket connect timeout; HTTP fallback active")
          return false
        }
      }

      val latch = CountDownLatch(1)
      var accepted = false

      socket.emit(
        "live-location:track",
        payload,
        Ack { args ->
          accepted = parseSocketAck(args)
          latch.countDown()
        }
      )

      val completed = latch.await(3000L, TimeUnit.MILLISECONDS)

      if (!completed) {
        Log.e(TAG, "Socket ack timeout; HTTP fallback active")
        queueError("Socket ack timeout; HTTP fallback active")
        return false
      }

      Log.d(TAG, "Socket ack accepted=$accepted")
      accepted
    } catch (error: Exception) {
      queueError("Socket upload failed: ${error.message ?: "unknown"}")
      false
    }
  }

  private fun getOrCreateLocationSocket(
    token: String,
    socketUrl: String
  ): io.socket.client.Socket? {
    val existing = locationSocket

    if (
      existing != null &&
      locationSocketToken == token &&
      locationSocketUrl == socketUrl
    ) {
      return existing
    }

    disconnectLocationSocket()

    return try {
      val options = IO.Options().apply {
        transports = arrayOf("websocket")
        reconnection = true
        reconnectionDelay = 1000
        reconnectionDelayMax = 10000
        timeout = 5000
        forceNew = false

        /**
         * NestJS gateway reads client.handshake.auth?.token first.
         * Keep Authorization header also as fallback.
         */
        auth = mapOf(
          "token" to token
        )

        extraHeaders = mapOf(
          "Authorization" to listOf("Bearer $token")
        )
      }

      val socket = IO.socket(URI.create(socketUrl), options)

      socket.on(io.socket.client.Socket.EVENT_CONNECT) {
        Log.d(TAG, "Socket connected url=$socketUrl")
      }

      socket.on(io.socket.client.Socket.EVENT_DISCONNECT) { args ->
        val message = args.firstOrNull()?.toString() ?: "unknown"
        Log.d(TAG, "Socket disconnected: $message")
      }

      socket.on(io.socket.client.Socket.EVENT_CONNECT_ERROR) { args ->
        val message = args.firstOrNull()?.toString() ?: "unknown"
        Log.e(TAG, "Socket connect error: $message")
        queueError("Socket connect error: $message")
      }

      locationSocket = socket
      locationSocketToken = token
      locationSocketUrl = socketUrl

      socket
    } catch (error: Exception) {
      queueError("Socket create failed: ${error.message ?: "unknown"}")
      null
    }
  }

  private fun waitForSocketConnect(
    socket: io.socket.client.Socket,
    timeoutMs: Long
  ): Boolean {
    if (socket.connected()) return true

    val latch = CountDownLatch(1)

    val listener = io.socket.emitter.Emitter.Listener {
      latch.countDown()
    }

    socket.once(io.socket.client.Socket.EVENT_CONNECT, listener)

    return try {
      latch.await(timeoutMs, TimeUnit.MILLISECONDS) || socket.connected()
    } catch (_: Exception) {
      false
    }
  }

  private fun parseSocketAck(args: Array<Any>): Boolean {
    if (args.isEmpty()) return true

    val first = args[0]

    if (first is JSONObject) {
      val success = !first.has("success") || first.optBoolean("success", true)
      val statusCode = first.optInt("statusCode", 200)
      return success && statusCode < 400
    }

    return true
  }

  private fun disconnectLocationSocket() {
    try {
      locationSocket?.disconnect()
      locationSocket?.off()
    } catch (_: Exception) {
      // Ignore cleanup failure.
    }

    locationSocket = null
    locationSocketToken = ""
    locationSocketUrl = ""
  }

  private fun getSocketBaseUrl(baseUrl: String): String {
    return baseUrl
      .trimEnd('/')
      .replace(Regex("""/api/v\d+$""", RegexOption.IGNORE_CASE), "")
  }

  private fun syncPendingLocations() {
    executor.execute {
      syncPendingLocationsInternal()
    }
  }

  private fun syncPendingLocationsInternal() {
    val pending = getPendingLocations()

    if (pending.length() == 0) {
      Log.d(TAG, "Native pending sync skipped: no pending locations")
      return
    }

    Log.d(TAG, "Native pending sync started count=${pending.length()}")

    val uploadedIds = mutableListOf<String>()

    for (index in 0 until pending.length()) {
      val item = pending.optJSONObject(index) ?: continue
      val uploaded = uploadSingle(item)

      if (uploaded) {
        uploadedIds.add(item.optString("clientLocationId"))
      } else {
        // Stop early to avoid wasting battery/network in Doze.
        break
      }
    }

    if (uploadedIds.isNotEmpty()) {
      uploadedIds.forEach { removePendingLocation(it) }
    }
  }

  private fun savePendingLocation(payload: JSONObject) {
    val clientLocationId = payload.optString("clientLocationId")
    if (clientLocationId.isBlank()) return

    val pending = getPendingLocations()

    for (index in 0 until pending.length()) {
      val existing = pending.optJSONObject(index) ?: continue
      if (existing.optString("clientLocationId") == clientLocationId) {
        return
      }
    }

    pending.put(payload)

    // Keep latest 2000 native pending points.
    val trimmed =
      if (pending.length() > 2000) {
        val next = JSONArray()
        for (i in pending.length() - 2000 until pending.length()) {
          next.put(pending.getJSONObject(i))
        }
        next
      } else {
        pending
      }

    savePendingLocations(trimmed)
  }

  private fun removePendingLocation(clientLocationId: String) {
    if (clientLocationId.isBlank()) return

    val pending = getPendingLocations()
    val next = JSONArray()

    for (index in 0 until pending.length()) {
      val item = pending.optJSONObject(index) ?: continue
      if (item.optString("clientLocationId") != clientLocationId) {
        next.put(item)
      }
    }

    savePendingLocations(next)
  }

  private fun getPendingLocations(): JSONArray {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_PENDING_LOCATIONS, "[]") ?: "[]"

    return try {
      JSONArray(raw)
    } catch (_: Exception) {
      JSONArray()
    }
  }

  private fun savePendingLocations(array: JSONArray) {
    val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_PENDING_LOCATIONS, array.toString()).apply()
  }

  private fun queueError(message: String) {
    getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString("lastError", message)
      .apply()
  }

  private fun isoNow(timestampMillis: Long): String {
    val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
    format.timeZone = TimeZone.getTimeZone("UTC")
    return format.format(Date(timestampMillis))
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val manager = getSystemService(NotificationManager::class.java)

    val channel =
      NotificationChannel(
        CHANNEL_ID,
        "Sales Stream Live Location",
        NotificationManager.IMPORTANCE_LOW
      ).apply {
        description = "Used while salesman work day live location tracking is active."
        setShowBadge(false)
      }

    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(title: String, body: String): Notification {
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle(title)
      .setContentText(body)
      .setSmallIcon(applicationInfo.icon)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }
}