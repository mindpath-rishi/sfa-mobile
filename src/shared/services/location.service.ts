import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as TaskManager from 'expo-task-manager';
import { jwtDecode } from 'jwt-decode';
import { AppState, Platform } from 'react-native';
import { io } from 'socket.io-client';

import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode, useOfflineStore } from '@/core/offline/offline.store';
import { storage } from '@/core/storage';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

import { getAccessToken } from './tokenStorage';

export const SALESMAN_BACKGROUND_LOCATION_TASK = 'salesman-background-location';
const locationTrackingKey = (ownerId: string) => `location_tracking_enabled:${ownerId}`;
const ACTIVE_LOCATION_SESSION_KEY = 'active_location_work_session_id';
const LAST_BACKGROUND_LOCATION_KEY = 'last_background_location';
const LAST_BACKGROUND_LOCATION_ERROR_KEY = 'last_background_location_error';

const FOREGROUND_TRACKING_INTERVAL_MS = 2_000;
const FOREGROUND_TRACKING_DISTANCE_METERS = 5;
const BACKGROUND_TRACKING_INTERVAL_MS = 10_000;
const BACKGROUND_TRACKING_DISTANCE_METERS = 10;
const FOREGROUND_HEARTBEAT_INTERVAL_MS = 5_000;
const BACKGROUND_HEARTBEAT_INTERVAL_MS = 10_000;
const LOCATION_MAX_AGE_MS = 15_000;
const LOCATION_MAX_ACCURACY_METERS = 50;
const MAX_SPEED_METERS_PER_SECOND = 200 / 3.6;
const UPLOAD_TIMEOUT_MS = 15_000;
const RETRY_DELAYS_MS = [5_000, 10_000, 20_000, 40_000, 60_000] as const;
const OFFLINE_BATCH_SIZE = 50;
const MAX_OFFLINE_LOCATIONS = 1_000;

export const isLocationTrackingEnabled = async (ownerId: string) => {
  if (!ownerId) return true;
  const value = await storage.getItem(locationTrackingKey(ownerId));
  return value !== 'false';
};

export const saveLocationTrackingPreference = async (ownerId: string, enabled: boolean) => {
  if (!ownerId) return;
  await storage.setItem(locationTrackingKey(ownerId), String(enabled));
};

export type CapturedLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  capturedAt: string;
};

type LocationTaskData = {
  locations?: Location.LocationObject[];
};

type LocationOwner = {
  userId?: string;
  employeeId?: string;
  role?: string | null;
  roleId?: string | null;
} | null;

type AttendanceLocationRecord = Record<string, unknown> & {
  uuid: string;
  workSessionId?: string;
  backgroundLocations?: CapturedLocation[];
};

type StoredLocationDiagnostics = CapturedLocation & { uploadedAt?: string };

let webLocationWatchId: number | null = null;
let lastWebLocation: CapturedLocation | null = null;
let foregroundLocationSubscription: Location.LocationSubscription | null = null;
let foregroundHeadingSubscription: Location.LocationSubscription | null = null;
let foregroundTrackingStartPromise: Promise<void> | null = null;
let networkSubscription: { remove: () => void } | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let currentAppState = AppState.currentState;
let locationSocket: ReturnType<typeof io> | null = null;
let locationSocketToken: string | null = null;
let offlineSyncPromise: Promise<void> | null = null;
let locationTrackingStartPromise: Promise<void> | null = null;
let activeLocationDelivery: Promise<void> | null = null;
let pendingLocationDelivery: { location: CapturedLocation; workSessionId?: string } | null = null;
let latestCapturedLocation: CapturedLocation | null = null;
let latestDeviceHeading: number | null = null;
let lastAcceptedLocation: CapturedLocation | null = null;
let lastUploadError: string | null = null;
const acceptedLocationKeys = new Set<string>();

const logLocation = (message: string, details?: Record<string, unknown>) => {
  if (details) console.info(`[Location] ${message}`, details);
  else console.info(`[Location] ${message}`);
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || 'Unknown location error');

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const normalizeHeading = (value?: number | null) => {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return ((value % 360) + 360) % 360;
};

const getApiBaseUrl = () => {
  const extra = Constants.expoConfig?.extra as { api?: { baseURL?: string } } | undefined;
  return extra?.api?.baseURL || 'https://order.tradekings.app:4001/api/v1';
};

const getSocketBaseUrl = () =>
  getApiBaseUrl()
    .replace(/\/+$/, '')
    .replace(/\/api\/v\d+$/i, '');

const locationKey = ({ capturedAt, latitude, longitude }: CapturedLocation) =>
  `${capturedAt}:${latitude.toFixed(7)}:${longitude.toFixed(7)}`;

const distanceInMeters = (from: CapturedLocation, to: CapturedLocation) => {
  const earthRadius = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const toCapturedLocation = (location: Location.LocationObject): CapturedLocation => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy,
  altitude: location.coords.altitude,
  speed: location.coords.speed,
  heading: normalizeHeading(location.coords.heading) ?? latestDeviceHeading,
  capturedAt: new Date(location.timestamp).toISOString(),
});

const rejectLocation = (reason: string, location: CapturedLocation) => {
  logLocation('GPS rejected (stale/inaccurate)', {
    reason,
    capturedAt: location.capturedAt,
    accuracy: location.accuracy,
  });
  return null;
};

const validateLocation = (
  location: CapturedLocation,
  options: { compareWithPrevious?: boolean; registerAcceptance?: boolean } = {},
): CapturedLocation | null => {
  const { latitude, longitude, accuracy, speed, capturedAt } = location;
  const timestamp = new Date(capturedAt).getTime();

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(timestamp)
  ) {
    return rejectLocation('invalid coordinates or timestamp', location);
  }

  const age = Date.now() - timestamp;
  if (age < -5_000 || age > LOCATION_MAX_AGE_MS) {
    return rejectLocation(`stale location (${age}ms old)`, location);
  }
  if (accuracy != null && (!Number.isFinite(accuracy) || accuracy > LOCATION_MAX_ACCURACY_METERS)) {
    return rejectLocation(`accuracy ${accuracy}m exceeds limit`, location);
  }
  const duplicateKey = locationKey(location);
  if (acceptedLocationKeys.has(duplicateKey)) {
    return rejectLocation('duplicate timestamp and coordinates', location);
  }
  if (speed != null && Number.isFinite(speed) && speed > MAX_SPEED_METERS_PER_SECOND) {
    return rejectLocation(`reported speed ${speed}m/s exceeds limit`, location);
  }

  if (options.compareWithPrevious !== false && lastAcceptedLocation) {
    const previousTimestamp = new Date(lastAcceptedLocation.capturedAt).getTime();
    const elapsedSeconds = (timestamp - previousTimestamp) / 1_000;
    if (elapsedSeconds > 0) {
      const calculatedSpeed = distanceInMeters(lastAcceptedLocation, location) / elapsedSeconds;
      if (calculatedSpeed > MAX_SPEED_METERS_PER_SECOND) {
        return rejectLocation(`impossible GPS jump (${calculatedSpeed.toFixed(1)}m/s)`, location);
      }
    }
  }

  if (options.registerAcceptance !== false) {
    acceptedLocationKeys.add(duplicateKey);
    if (acceptedLocationKeys.size > 200) {
      const oldest = acceptedLocationKeys.values().next().value;
      if (oldest) acceptedLocationKeys.delete(oldest);
    }
    lastAcceptedLocation = location;
    latestCapturedLocation = location;
  }
  logLocation('GPS acquired', {
    latitude,
    longitude,
    accuracy,
    capturedAt,
  });
  return location;
};

export const isValidLocation = (location: CapturedLocation) =>
  validateLocation(location, { registerAcceptance: false }) !== null;

const resolveOwnerId = async () => {
  const user = useAuthStore.getState().user;
  const stateOwnerId = user?.userId || user?.employeeId;
  if (stateOwnerId) return String(stateOwnerId);

  const token = await getAccessToken();
  if (!token) return '';
  try {
    const payload = jwtDecode<{ sub?: string; userId?: string; employeeId?: string }>(token);
    return String(payload.sub || payload.userId || payload.employeeId || '');
  } catch {
    return '';
  }
};

const getActiveSessionId = async (workSessionId?: string) =>
  workSessionId ||
  useAuthStore.getState().workSessionId ||
  (await storage.getItem(ACTIVE_LOCATION_SESSION_KEY)) ||
  undefined;

const setLastUploadError = async (error: unknown) => {
  lastUploadError = errorMessage(error);
  await storage.setItem(
    LAST_BACKGROUND_LOCATION_ERROR_KEY,
    JSON.stringify({ message: lastUploadError, occurredAt: new Date().toISOString() }),
  );
};

const clearLastUploadError = async () => {
  lastUploadError = null;
  await storage.removeItem(LAST_BACKGROUND_LOCATION_ERROR_KEY);
};

const connectLocationSocket = async () => {
  const token = await getAccessToken();
  if (!token) return null;

  if (locationSocket && locationSocketToken === token) {
    if (!locationSocket.connected && !locationSocket.active) locationSocket.connect();
    return locationSocket;
  }

  locationSocket?.disconnect();
  locationSocketToken = token;
  locationSocket = io(getSocketBaseUrl(), {
    auth: { token },
    extraHeaders: { Authorization: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    timeout: 5_000,
  });
  locationSocket.on('connect_error', (error) => {
    logLocation('Socket unavailable; HTTP fallback active', { error: error.message });
  });
  return locationSocket;
};

const emitLocationOverSocket = async (payload: Record<string, unknown>) => {
  const socket = await connectLocationSocket();
  if (!socket?.connected) return false;

  return new Promise<boolean>((resolve) => {
    socket
      .timeout(3_000)
      .emit(
        'live-location:track',
        payload,
        (error: Error | null, response?: { success?: boolean; statusCode?: number }) => {
          if (error) return resolve(false);
          resolve(response?.success !== false && (response?.statusCode ?? 200) < 400);
        },
      );
  });
};

const postLocationPayload = async (payload: Record<string, unknown>) => {
  const token = await getAccessToken();
  if (!token) throw new Error('Location upload requires an authenticated session');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    return await fetch(`${getApiBaseUrl()}/live-location-tracking/track`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Location upload timed out');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const uploadLocationRequest = async (location: CapturedLocation, workSessionId: string) => {
  const payload = {
    workSessionId,
    source: currentAppState === 'active' ? 'FOREGROUND' : 'BACKGROUND',
    location,
  };
  if (await emitLocationOverSocket(payload)) return;

  const response = await postLocationPayload(payload);

  if (!response.ok) throw new Error(`Location upload failed (${response.status})`);
};

const uploadLocationBatchRequest = async (locations: CapturedLocation[], workSessionId: string) => {
  const response = await postLocationPayload({ workSessionId, source: 'BACKGROUND', locations });

  if (!response.ok) throw new Error(`Location batch upload failed (${response.status})`);
};

const uploadWithRetry = async (location: CapturedLocation, workSessionId: string) => {
  let failure: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await uploadLocationRequest(location, workSessionId);
      await storage.setItem(
        LAST_BACKGROUND_LOCATION_KEY,
        JSON.stringify({ ...location, uploadedAt: new Date().toISOString() }),
      );
      await clearLastUploadError();
      logLocation('Upload success', { capturedAt: location.capturedAt, attempt: attempt + 1 });
      return true;
    } catch (error) {
      failure = error;
      if (attempt === RETRY_DELAYS_MS.length) break;
      const retryDelay = RETRY_DELAYS_MS[attempt];
      logLocation('Upload retry', {
        attempt: attempt + 1,
        delayMs: retryDelay,
        error: errorMessage(error),
      });
      await delay(retryDelay);
    }
  }

  await setLastUploadError(failure);
  logLocation('Upload failure', { error: errorMessage(failure) });
  return false;
};

const getAttendanceRecord = async (ownerId: string, workSessionId: string) =>
  repositories.attendance.findById(
    ownerId,
    workSessionId,
  ) as Promise<AttendanceLocationRecord | null>;

const saveBackgroundLocationOffline = async (
  location: CapturedLocation,
  workSessionId?: string,
) => {
  const sessionId = await getActiveSessionId(workSessionId);
  const ownerId = await resolveOwnerId();
  if (!ownerId || !sessionId) {
    await setLastUploadError('Unable to save offline location: owner or work session missing');
    return;
  }

  const existing = await getAttendanceRecord(ownerId, sessionId);
  const previousLocations = Array.isArray(existing?.backgroundLocations)
    ? existing.backgroundLocations
    : [];
  if (previousLocations.some((item) => locationKey(item) === locationKey(location))) return;
  const backgroundLocations = [...previousLocations, location].slice(-MAX_OFFLINE_LOCATIONS);

  if (existing) {
    await repositories.attendance.updateLocal(ownerId, existing.uuid, { backgroundLocations });
  } else {
    const user = useAuthStore.getState().user;
    await repositories.attendance.create(ownerId, {
      uuid: sessionId,
      workSessionId: sessionId,
      userId: ownerId,
      vanId: user?.vanId,
      dayStartTime: new Date().toISOString(),
      status: 'ACTIVE',
      backgroundLocations,
    });
  }
  logLocation('Offline saved', { capturedAt: location.capturedAt });
};

const hasNetworkConnection = async () => {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return !isOfflineMode();
  }
};

const processAcceptedLocation = async (accepted: CapturedLocation, workSessionId?: string) => {
  const sessionId = await getActiveSessionId(workSessionId);
  if (!sessionId) {
    await setLastUploadError('Location upload requires an active work session');
    return;
  }

  if (isOfflineMode() || !(await hasNetworkConnection())) {
    await saveBackgroundLocationOffline(accepted, sessionId);
    return;
  }

  const uploaded = await uploadWithRetry(accepted, sessionId);
  if (!uploaded) await saveBackgroundLocationOffline(accepted, sessionId);
};

const queueLocation = (location: CapturedLocation, workSessionId?: string) => {
  // Validate at receipt time. Upload retries can intentionally take longer
  // than the freshness window, but a point that was fresh when received must
  // still be persisted rather than discarded while waiting behind a retry.
  const accepted = validateLocation(location);
  if (!accepted) return Promise.resolve();

  // Bound delivery work: on a poor connection, starting a multi-retry promise
  // every two seconds eventually exhausts the Android process.
  pendingLocationDelivery = { location: accepted, workSessionId };
  if (activeLocationDelivery) return activeLocationDelivery;

  activeLocationDelivery = (async () => {
    while (pendingLocationDelivery) {
      const pending = pendingLocationDelivery;
      pendingLocationDelivery = null;
      try {
        await processAcceptedLocation(pending.location, pending.workSessionId);
      } catch (error) {
        await setLastUploadError(error);
      }
    }
  })().finally(() => {
    activeLocationDelivery = null;
  });
  return activeLocationDelivery;
};

export const syncPendingLocationUploads = async () => {
  if (offlineSyncPromise) return offlineSyncPromise;
  offlineSyncPromise = (async () => {
    const ownerId = await resolveOwnerId();
    const workSessionId = await getActiveSessionId();
    if (!ownerId || !workSessionId) return;

    while (true) {
      const record = await getAttendanceRecord(ownerId, workSessionId);
      const queued = Array.isArray(record?.backgroundLocations) ? record.backgroundLocations : [];
      const batch = queued.slice(0, OFFLINE_BATCH_SIZE);
      if (!record || !batch.length) return;

      try {
        await uploadLocationBatchRequest(batch, workSessionId);
      } catch (error) {
        await setLastUploadError(error);
        logLocation('Upload failure', { type: 'offline batch', error: errorMessage(error) });
        return;
      }

      const uploadedLocationKeys = new Set(batch.map(locationKey));
      const remainingLocations = queued.filter(
        (location) => !uploadedLocationKeys.has(locationKey(location)),
      );
      await repositories.attendance.updateLocal(ownerId, record.uuid, {
        backgroundLocations: remainingLocations,
      });
      await clearLastUploadError();
      logLocation('Offline sync completed', {
        uploaded: batch.length,
        remaining: remainingLocations.length,
      });
      if (remainingLocations.length === 0) return;
    }
  })().finally(() => {
    offlineSyncPromise = null;
  });
  return offlineSyncPromise;
};

const startConnectivitySync = () => {
  if (networkSubscription) return;
  networkSubscription = Network.addNetworkStateListener((state) => {
    const online = state.isConnected === true && state.isInternetReachable === true;
    if (online) void syncPendingLocationUploads();
  });
};

const startWebLocationTracking = () => {
  if (webLocationWatchId !== null || typeof navigator === 'undefined' || !navigator.geolocation) {
    return;
  }
  webLocationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: CapturedLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        heading: normalizeHeading(position.coords.heading),
        capturedAt: new Date(position.timestamp).toISOString(),
      };
      const intervalReached =
        !lastWebLocation ||
        position.timestamp - new Date(lastWebLocation.capturedAt).getTime() >=
          FOREGROUND_TRACKING_INTERVAL_MS;
      const distanceReached =
        !!lastWebLocation &&
        distanceInMeters(lastWebLocation, location) >= FOREGROUND_TRACKING_DISTANCE_METERS;
      if (intervalReached || distanceReached) {
        lastWebLocation = location;
        void queueLocation(location);
      }
    },
    (error) => console.warn('[Location] Browser location tracking error:', error.message),
    { enableHighAccuracy: true, maximumAge: LOCATION_MAX_AGE_MS, timeout: 10_000 },
  );
  logLocation('Foreground tracking started', { platform: 'web' });
};

const stopWebLocationTracking = () => {
  if (webLocationWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.clearWatch(webLocationWatchId);
  }
  webLocationWatchId = null;
  lastWebLocation = null;
};

if (!TaskManager.isTaskDefined(SALESMAN_BACKGROUND_LOCATION_TASK)) {
  TaskManager.defineTask<LocationTaskData>(
    SALESMAN_BACKGROUND_LOCATION_TASK,
    async ({ data, error }) => {
      if (error) {
        await setLastUploadError(error);
        console.warn('[Location] Background location task error:', error);
        return;
      }

      const workSessionId = await storage.getItem(ACTIVE_LOCATION_SESSION_KEY);
      if (!workSessionId) {
        await setLastUploadError('Background location task has no persisted work session');
        return;
      }

      logLocation('Background task received locations', {
        count: data?.locations?.length ?? 0,
      });

      await Promise.all(
        (data?.locations || []).map((nativeLocation) =>
          // This path intentionally does not depend on hydrated React/Zustand state.
          queueLocation(toCapturedLocation(nativeLocation), workSessionId),
        ),
      );
    },
  );
}

const withLocationTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('GPS location request timed out')), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

let activeLocationCapture: Promise<CapturedLocation | undefined> | null = null;

const performLocationCapture = async (): Promise<CapturedLocation | undefined> => {
  try {
    // Live tracking normally already has a recent high-quality point. Reusing
    // it makes actions such as van settlement immediate instead of forcing the
    // GPS chipset to acquire another fix.
    if (latestCapturedLocation) {
      const age = Date.now() - new Date(latestCapturedLocation.capturedAt).getTime();
      const accuracy = latestCapturedLocation.accuracy;
      if (
        age >= 0 &&
        age <= LOCATION_MAX_AGE_MS &&
        (accuracy == null || accuracy <= LOCATION_MAX_ACCURACY_METERS)
      ) {
        logLocation('Using recent tracked GPS fix', { ageMs: age, accuracy });
        return latestCapturedLocation;
      }
    }

    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      logLocation('Permission denied', { permission: 'foreground' });
      return undefined;
    }
    if (!(await Location.hasServicesEnabledAsync())) {
      logLocation('GPS disabled');
      return undefined;
    }

    try {
      const nativeLocation = await withLocationTimeout(
        Location.getCurrentPositionAsync({
          accuracy: currentAppState === 'active' ? Location.Accuracy.High : Location.Accuracy.High,
          mayShowUserSettingsDialog: true,
        }),
        10_000,
      );
      const captured = toCapturedLocation(nativeLocation);
      const validated = validateLocation(captured, {
        registerAcceptance: false,
      });
      if (validated) return validated;

      // Expo may return the exact point already received by watchPositionAsync.
      // That point is correctly rejected for another live upload, but it is
      // still a valid fresh fix for day-end/check-in metadata.
      if (latestCapturedLocation && locationKey(latestCapturedLocation) === locationKey(captured)) {
        return latestCapturedLocation;
      }
      return undefined;
    } catch (freshLocationError) {
      console.warn('[Location] Fresh GPS fix unavailable:', freshLocationError);
      if (latestCapturedLocation) {
        const age = Date.now() - new Date(latestCapturedLocation.capturedAt).getTime();
        const accuracy = latestCapturedLocation.accuracy;
        if (
          age <= LOCATION_MAX_AGE_MS &&
          accuracy != null &&
          accuracy <= LOCATION_MAX_ACCURACY_METERS
        ) {
          return latestCapturedLocation;
        }
      }

      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: LOCATION_MAX_AGE_MS,
        requiredAccuracy: LOCATION_MAX_ACCURACY_METERS,
      });
      if (!lastKnown) throw freshLocationError;
      return (
        validateLocation(toCapturedLocation(lastKnown), { registerAcceptance: false }) || undefined
      );
    }
  } catch (error) {
    console.warn('[Location] Unable to capture current location:', error);
    return undefined;
  }
};

export const captureCurrentLocation = async (): Promise<CapturedLocation | undefined> => {
  if (activeLocationCapture) return activeLocationCapture;
  // Bound the complete native flow, including permission and GPS-service
  // checks. Timing only getCurrentPositionAsync still allowed callers such as
  // online van settlement to wait forever before their HTTP request began.
  activeLocationCapture = withLocationTimeout(performLocationCapture(), 12_000).catch((error) => {
    console.warn('[Location] Complete GPS capture timed out:', error);
    return undefined;
  });
  try {
    return await activeLocationCapture;
  } finally {
    activeLocationCapture = null;
  }
};

const startForegroundTracking = async () => {
  if (foregroundLocationSubscription && foregroundHeadingSubscription) return;
  if (foregroundTrackingStartPromise) return foregroundTrackingStartPromise;

  foregroundTrackingStartPromise = (async () => {
    if (!foregroundLocationSubscription) {
      foregroundLocationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: FOREGROUND_TRACKING_INTERVAL_MS,
          distanceInterval: FOREGROUND_TRACKING_DISTANCE_METERS,
          mayShowUserSettingsDialog: true,
        },
        (location) => void queueLocation(toCapturedLocation(location)),
      );
      logLocation('Foreground tracking started');
    }

    if (!foregroundHeadingSubscription) {
      foregroundHeadingSubscription = await Location.watchHeadingAsync((heading) => {
        const nextHeading = normalizeHeading(
          heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading,
        );
        if (nextHeading != null) latestDeviceHeading = nextHeading;
      });
    }
  })().finally(() => {
    foregroundTrackingStartPromise = null;
  });
  return foregroundTrackingStartPromise;
};

const stopForegroundTracking = () => {
  foregroundLocationSubscription?.remove();
  foregroundLocationSubscription = null;
  foregroundHeadingSubscription?.remove();
  foregroundHeadingSubscription = null;
};

const restartHeartbeat = (workSessionId: string) => {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  const interval =
    currentAppState === 'active'
      ? FOREGROUND_HEARTBEAT_INTERVAL_MS
      : BACKGROUND_HEARTBEAT_INTERVAL_MS;

  heartbeatTimer = setInterval(() => {
    const lastUpdateAt = latestCapturedLocation
      ? new Date(latestCapturedLocation.capturedAt).getTime()
      : 0;
    if (Date.now() - lastUpdateAt < interval) return;

    void captureCurrentLocation().then((location) => {
      if (location) void queueLocation(location, workSessionId);
    });
  }, interval);
};

const startLocationLifecycle = (workSessionId: string) => {
  restartHeartbeat(workSessionId);
  if (appStateSubscription) return;

  appStateSubscription = AppState.addEventListener('change', (nextState) => {
    currentAppState = nextState;
    restartHeartbeat(workSessionId);
    if (nextState === 'active') {
      void startForegroundTracking();
      void syncPendingLocationUploads();
    } else {
      // TaskManager owns background delivery and avoids duplicate callbacks.
      stopForegroundTracking();
    }
  });
};

const startBackgroundTracking = async () => {
  const background = await Location.requestBackgroundPermissionsAsync();
  if (background.status !== Location.PermissionStatus.GRANTED) {
    logLocation('Permission denied', { permission: 'background' });
    return;
  }

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
    SALESMAN_BACKGROUND_LOCATION_TASK,
  );
  if (!alreadyStarted) {
    await Location.startLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      activityType: Location.ActivityType.AutomotiveNavigation,
      timeInterval: BACKGROUND_TRACKING_INTERVAL_MS,
      distanceInterval: BACKGROUND_TRACKING_DISTANCE_METERS,
      deferredUpdatesInterval: 0,
      deferredUpdatesDistance: 0,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Sales Stream live location active',
        notificationBody: 'Your live location is shared while your work day is active.',
        killServiceOnDestroy: false,
      },
    });
    logLocation('Background task started');
  }
};

const performStartSalesmanBackgroundLocation = async (user?: LocationOwner) => {
  if (!isSalesman(user)) {
    console.warn('[Location] Unable to start live location: current user is not a salesman');
    return;
  }
  const ownerId = String(user?.userId ?? user?.employeeId ?? '');
  if (!(await isLocationTrackingEnabled(ownerId))) return;

  const activeSessionId = await getActiveSessionId();
  if (!activeSessionId) {
    console.warn('[Location] Unable to start background location: no active work session');
    return;
  }
  await storage.setItem(ACTIVE_LOCATION_SESSION_KEY, activeSessionId);
  startConnectivitySync();

  if (Platform.OS === 'web') {
    startWebLocationTracking();
    return;
  }

  try {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      logLocation('Permission denied', { permission: 'foreground' });
      return;
    }
    if (!(await Location.hasServicesEnabledAsync())) {
      logLocation('GPS disabled');
      return;
    }

    await startForegroundTracking();
    await startBackgroundTracking();
    startLocationLifecycle(activeSessionId);
    void connectLocationSocket();
    void syncPendingLocationUploads();
    void captureCurrentLocation().then((location) => {
      if (location) return queueLocation(location, activeSessionId);
    });
  } catch (error) {
    await setLastUploadError(error);
    console.warn('[Location] Unable to start location tracking:', error);
  }
};

export const startSalesmanBackgroundLocation = async (user?: LocationOwner) => {
  if (locationTrackingStartPromise) return locationTrackingStartPromise;
  locationTrackingStartPromise = performStartSalesmanBackgroundLocation(user).finally(() => {
    locationTrackingStartPromise = null;
  });
  return locationTrackingStartPromise;
};

export const stopSalesmanBackgroundLocation = async () => {
  await storage.removeItem(ACTIVE_LOCATION_SESSION_KEY);
  networkSubscription?.remove();
  networkSubscription = null;

  if (Platform.OS === 'web') {
    stopWebLocationTracking();
    return;
  }

  try {
    stopForegroundTracking();
    appStateSubscription?.remove();
    appStateSubscription = null;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    locationSocket?.disconnect();
    locationSocket = null;
    locationSocketToken = null;
    latestDeviceHeading = null;
    pendingLocationDelivery = null;
    acceptedLocationKeys.clear();
    lastAcceptedLocation = null;

    if (await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK)) {
      await Location.stopLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);
      logLocation('Background task stopped');
    }
  } catch (error) {
    console.warn('[Location] Unable to stop background location:', error);
  }
};

export const getBackgroundLocationDiagnostics = async () => {
  const [gpsEnabled, foregroundPermission, backgroundPermission, backgroundTaskRunning] =
    await Promise.all([
      Platform.OS === 'web' ? Promise.resolve(true) : Location.hasServicesEnabledAsync(),
      Location.getForegroundPermissionsAsync(),
      Platform.OS === 'web'
        ? Promise.resolve({ status: Location.PermissionStatus.GRANTED })
        : Location.getBackgroundPermissionsAsync(),
      Platform.OS === 'web'
        ? Promise.resolve(webLocationWatchId !== null)
        : Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK),
    ]);

  const storedLocation = await storage.getItem(LAST_BACKGROUND_LOCATION_KEY);
  const storedError = await storage.getItem(LAST_BACKGROUND_LOCATION_ERROR_KEY);
  let lastLocation: StoredLocationDiagnostics | null = latestCapturedLocation;
  let persistedError: { message?: string } | null = null;
  try {
    if (!lastLocation && storedLocation) lastLocation = JSON.parse(storedLocation);
    if (storedError) persistedError = JSON.parse(storedError);
  } catch {
    // Diagnostics must never interfere with tracking.
  }

  const ownerId = await resolveOwnerId();
  const workSessionId = await getActiveSessionId();
  const attendance =
    ownerId && workSessionId ? await getAttendanceRecord(ownerId, workSessionId) : null;
  const pendingUploadCount = Array.isArray(attendance?.backgroundLocations)
    ? attendance.backgroundLocations.length
    : 0;
  const foregroundTrackingRunning =
    Platform.OS === 'web' ? webLocationWatchId !== null : foregroundLocationSubscription !== null;

  return {
    gpsEnabled,
    foregroundPermission: foregroundPermission.status,
    backgroundPermission: backgroundPermission.status,
    trackingRunning: foregroundTrackingRunning || backgroundTaskRunning,
    backgroundTaskRunning,
    lastLocationAge: lastLocation
      ? Math.max(0, Date.now() - new Date(lastLocation.capturedAt).getTime())
      : null,
    lastLocationAccuracy: lastLocation?.accuracy ?? null,
    pendingUploadCount,
    lastUploadError: lastUploadError || persistedError?.message || null,
  };
};

export const getLocationHealth = async () => {
  const diagnostics = await getBackgroundLocationDiagnostics();
  return {
    gpsEnabled: diagnostics.gpsEnabled,
    foregroundPermission: diagnostics.foregroundPermission,
    backgroundPermission: diagnostics.backgroundPermission,
    trackingRunning: diagnostics.trackingRunning,
    backgroundTaskRunning: diagnostics.backgroundTaskRunning,
  };
};
