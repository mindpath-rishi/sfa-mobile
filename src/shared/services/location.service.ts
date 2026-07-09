// import Constants from 'expo-constants';
// import * as Location from 'expo-location';
// import * as Network from 'expo-network';
// import * as TaskManager from 'expo-task-manager';
// import { jwtDecode } from 'jwt-decode';
// import { Alert, AppState, Linking, Platform } from 'react-native';
// import * as Application from 'expo-application';
// import * as IntentLauncher from 'expo-intent-launcher';
// import { io } from 'socket.io-client';

// import { isSalesman } from '@/core/navigation/role.utils';
// import { useOfflineStore } from '@/core/offline/offline.store';
// import { storage } from '@/core/storage';
// import { useAuthStore } from '@/core/store/auth.store';
// import { repositories } from '@/repositories';

// import { getAccessToken } from './tokenStorage';
// import {
//   isNativeLocationAvailable,
//   startNativeBackgroundLocation,
//   stopNativeBackgroundLocation,
//   syncNativePendingLocationUploads,
// } from './native-location.service';

// export const SALESMAN_BACKGROUND_LOCATION_TASK = 'salesman-background-location';

// const locationTrackingKey = (ownerId: string) => `location_tracking_enabled:${ownerId}`;
// const ACTIVE_LOCATION_SESSION_KEY = 'active_location_work_session_id';
// const LAST_BACKGROUND_LOCATION_KEY = 'last_background_location';
// const LAST_BACKGROUND_LOCATION_ERROR_KEY = 'last_background_location_error';
// const BATTERY_OPTIMIZATION_PROMPTED_KEY = 'battery_optimization_prompted';

// /**
//  * Real-time tracking settings
//  * ---------------------------
//  * NOTE:
//  * 0 interval is not reliable on Android background services.
//  * OS/GPS may still throttle updates in background depending on device/battery/vendor.
//  */
// const FOREGROUND_TRACKING_INTERVAL_MS = 1_000;
// const FOREGROUND_TRACKING_DISTANCE_METERS = 1;

// const BACKGROUND_TRACKING_INTERVAL_MS = 2_000;
// const BACKGROUND_TRACKING_DISTANCE_METERS = 1;

// /**
//  * Native Android service interval.
//  * 5s/5m is more stable than 1-2s in sleep mode and saves battery.
//  */
// const NATIVE_BACKGROUND_TRACKING_INTERVAL_MS = 5_000;
// /**
//  * Keep 0 while testing background delivery. Android will still throttle in deep sleep,
//  * but this avoids missing updates when the phone moves less than 5 metres.
//  * After testing, you can change this to 3 or 5 to save battery.
//  */
// const NATIVE_BACKGROUND_TRACKING_DISTANCE_METERS = 0;

// const FOREGROUND_HEARTBEAT_INTERVAL_MS = 5_000;
// const BACKGROUND_HEARTBEAT_INTERVAL_MS = 10_000;

// /**
//  * Background callbacks can arrive late on some Android devices.
//  * Do not keep this too low, otherwise valid background points get rejected as stale.
//  */
// const LOCATION_MAX_AGE_MS = 120_000;
// const LOCATION_MAX_ACCURACY_METERS = 100;

// const MAX_SPEED_METERS_PER_SECOND = 200 / 3.6;
// const UPLOAD_TIMEOUT_MS = 15_000;
// const BACKGROUND_SOCKET_CONNECT_TIMEOUT_MS = 2_500;
// const RETRY_DELAYS_MS = [5_000, 10_000, 20_000, 40_000, 60_000] as const;

// const OFFLINE_BATCH_SIZE = 50;
// const MAX_OFFLINE_LOCATIONS = 1_000;
// const OFFLINE_LOCATION_DISTANCE_METERS = 3;

// const requestBatteryOptimizationPermission = async () => {
//   if (Platform.OS !== 'android') return;

//   const alreadyPrompted = await storage.getItem(BATTERY_OPTIMIZATION_PROMPTED_KEY);

//   if (alreadyPrompted === 'true') return;

//   await storage.setItem(BATTERY_OPTIMIZATION_PROMPTED_KEY, 'true');

//   console.info(
//     '[Battery] Background tracking may be interrupted by Android battery optimization. Please allow unrestricted battery usage for this app.',
//   );
// };

// export const resetBatteryOptimizationPrompt = async () => {
//   await storage.removeItem(BATTERY_OPTIMIZATION_PROMPTED_KEY);
// };

// export const isLocationTrackingEnabled = async (ownerId: string) => {
//   if (!ownerId) return true;
//   const value = await storage.getItem(locationTrackingKey(ownerId));
//   return value !== 'false';
// };

// export const saveLocationTrackingPreference = async (ownerId: string, enabled: boolean) => {
//   if (!ownerId) return;
//   await storage.setItem(locationTrackingKey(ownerId), String(enabled));
// };

// export type CapturedLocation = {
//   latitude: number;
//   longitude: number;
//   accuracy?: number | null;
//   altitude?: number | null;
//   speed?: number | null;
//   heading?: number | null;
//   capturedAt: string;
// };

// type LocationTaskData = {
//   locations?: Location.LocationObject[];
// };

// type LocationOwner = {
//   userId?: string;
//   employeeId?: string;
//   role?: string | null;
//   roleId?: string | null;
// } | null;

// type AttendanceLocationRecord = Record<string, unknown> & {
//   uuid: string;
//   workSessionId?: string;
//   backgroundLocations?: CapturedLocation[];
// };

// type StoredLocationDiagnostics = CapturedLocation & { uploadedAt?: string };

// type LocationDeliveryItem = {
//   location: CapturedLocation;
//   workSessionId?: string;
//   emittedRealtime: boolean;
// };

// let webLocationWatchId: number | null = null;
// let lastWebLocation: CapturedLocation | null = null;

// let foregroundLocationSubscription: Location.LocationSubscription | null = null;
// let foregroundHeadingSubscription: Location.LocationSubscription | null = null;
// let foregroundTrackingStartPromise: Promise<void> | null = null;

// let networkSubscription: { remove: () => void } | null = null;
// let appStateSubscription: { remove: () => void } | null = null;
// let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

// let currentAppState = AppState.currentState;

// let locationSocket: ReturnType<typeof io> | null = null;
// let locationSocketToken: string | null = null;

// let offlineSyncPromise: Promise<void> | null = null;
// let locationTrackingStartPromise: Promise<void> | null = null;
// let nativeBackgroundTrackingStarted = false;

// let activeLocationDelivery: Promise<void> | null = null;
// let locationDeliveryQueue: LocationDeliveryItem[] = [];

// let latestCapturedLocation: CapturedLocation | null = null;
// let latestDeviceHeading: number | null = null;
// let lastAcceptedLocation: CapturedLocation | null = null;
// let lastUploadError: string | null = null;

// const acceptedLocationKeys = new Set<string>();

// const logLocation = (message: string, details?: Record<string, unknown>) => {
//   if (details) console.info(`[Location] ${message}`, details);
//   else console.info(`[Location] ${message}`);
// };

// const errorMessage = (error: unknown) =>
//   error instanceof Error ? error.message : String(error || 'Unknown location error');

// const delay = (milliseconds: number) =>
//   new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

// const normalizeHeading = (value?: number | null) => {
//   if (value == null || !Number.isFinite(value) || value < 0) return null;
//   return ((value % 360) + 360) % 360;
// };

// const getApiBaseUrl = () => {
//   const extra = Constants.expoConfig?.extra as { api?: { baseURL?: string } } | undefined;
//   return extra?.api?.baseURL || 'https://order.tradekings.app:4001/api/v1';
// };

// const getSocketBaseUrl = () =>
//   getApiBaseUrl()
//     .replace(/\/+$/, '')
//     .replace(/\/api\/v\d+$/i, '');

// const locationKey = ({ capturedAt, latitude, longitude }: CapturedLocation) =>
//   `${capturedAt}:${latitude.toFixed(7)}:${longitude.toFixed(7)}`;

// const distanceInMeters = (from: CapturedLocation, to: CapturedLocation) => {
//   const earthRadius = 6_371_000;
//   const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

//   const latitudeDelta = toRadians(to.latitude - from.latitude);
//   const longitudeDelta = toRadians(to.longitude - from.longitude);
//   const fromLatitude = toRadians(from.latitude);
//   const toLatitude = toRadians(to.latitude);

//   const haversine =
//     Math.sin(latitudeDelta / 2) ** 2 +
//     Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

//   return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
// };

// const toCapturedLocation = (location: Location.LocationObject): CapturedLocation => ({
//   latitude: location.coords.latitude,
//   longitude: location.coords.longitude,
//   accuracy: location.coords.accuracy,
//   altitude: location.coords.altitude,
//   speed: location.coords.speed,
//   heading: normalizeHeading(location.coords.heading) ?? latestDeviceHeading,
//   capturedAt: new Date(location.timestamp).toISOString(),
// });

// const rejectLocation = (reason: string, location: CapturedLocation) => {
//   logLocation('GPS rejected', {
//     reason,
//     capturedAt: location.capturedAt,
//     accuracy: location.accuracy,
//   });
//   return null;
// };

// const validateLocation = (
//   location: CapturedLocation,
//   options: { compareWithPrevious?: boolean; registerAcceptance?: boolean } = {},
// ): CapturedLocation | null => {
//   const { latitude, longitude, accuracy, speed, capturedAt } = location;
//   const timestamp = new Date(capturedAt).getTime();

//   if (
//     !Number.isFinite(latitude) ||
//     !Number.isFinite(longitude) ||
//     latitude < -90 ||
//     latitude > 90 ||
//     longitude < -180 ||
//     longitude > 180 ||
//     !Number.isFinite(timestamp)
//   ) {
//     return rejectLocation('invalid coordinates or timestamp', location);
//   }

//   const age = Date.now() - timestamp;

//   if (age < -10_000 || age > LOCATION_MAX_AGE_MS) {
//     return rejectLocation(`stale location (${age}ms old)`, location);
//   }

//   if (accuracy != null && (!Number.isFinite(accuracy) || accuracy > LOCATION_MAX_ACCURACY_METERS)) {
//     return rejectLocation(`accuracy ${accuracy}m exceeds limit`, location);
//   }

//   const duplicateKey = locationKey(location);

//   if (acceptedLocationKeys.has(duplicateKey)) {
//     return rejectLocation('duplicate timestamp and coordinates', location);
//   }

//   if (speed != null && Number.isFinite(speed) && speed > MAX_SPEED_METERS_PER_SECOND) {
//     return rejectLocation(`reported speed ${speed}m/s exceeds limit`, location);
//   }

//   if (options.compareWithPrevious !== false && lastAcceptedLocation) {
//     const previousTimestamp = new Date(lastAcceptedLocation.capturedAt).getTime();
//     const elapsedSeconds = (timestamp - previousTimestamp) / 1_000;

//     if (elapsedSeconds > 0) {
//       const calculatedSpeed = distanceInMeters(lastAcceptedLocation, location) / elapsedSeconds;

//       if (calculatedSpeed > MAX_SPEED_METERS_PER_SECOND) {
//         return rejectLocation(`impossible GPS jump (${calculatedSpeed.toFixed(1)}m/s)`, location);
//       }
//     }
//   }

//   if (options.registerAcceptance !== false) {
//     acceptedLocationKeys.add(duplicateKey);

//     if (acceptedLocationKeys.size > 300) {
//       const oldest = acceptedLocationKeys.values().next().value;
//       if (oldest) acceptedLocationKeys.delete(oldest);
//     }

//     lastAcceptedLocation = location;
//     latestCapturedLocation = location;
//   }

//   logLocation('GPS acquired', {
//     latitude,
//     longitude,
//     accuracy,
//     capturedAt,
//   });

//   return location;
// };

// export const isValidLocation = (location: CapturedLocation) =>
//   validateLocation(location, { registerAcceptance: false }) !== null;

// const resolveOwnerId = async () => {
//   const user = useAuthStore.getState().user;
//   const stateOwnerId = user?.userId || user?.employeeId;

//   if (stateOwnerId) return String(stateOwnerId);

//   const token = await getAccessToken();
//   if (!token) return '';

//   try {
//     const payload = jwtDecode<{ sub?: string; userId?: string; employeeId?: string }>(token);
//     return String(payload.sub || payload.userId || payload.employeeId || '');
//   } catch {
//     return '';
//   }
// };

// const getActiveSessionId = async (workSessionId?: string) =>
//   workSessionId ||
//   useAuthStore.getState().workSessionId ||
//   (await storage.getItem(ACTIVE_LOCATION_SESSION_KEY)) ||
//   undefined;

// const setLastUploadError = async (error: unknown) => {
//   lastUploadError = errorMessage(error);

//   await storage.setItem(
//     LAST_BACKGROUND_LOCATION_ERROR_KEY,
//     JSON.stringify({
//       message: lastUploadError,
//       occurredAt: new Date().toISOString(),
//     }),
//   );
// };

// const clearLastUploadError = async () => {
//   lastUploadError = null;
//   await storage.removeItem(LAST_BACKGROUND_LOCATION_ERROR_KEY);
// };

// const connectLocationSocket = async () => {
//   const token = await getAccessToken();

//   if (!token) {
//     logLocation('Socket unavailable', { reason: 'missing token' });
//     return null;
//   }

//   if (locationSocket && locationSocketToken === token) {
//     if (!locationSocket.connected && !locationSocket.active) {
//       locationSocket.connect();
//     }

//     return locationSocket;
//   }

//   locationSocket?.disconnect();

//   locationSocketToken = token;

//   locationSocket = io(getSocketBaseUrl(), {
//     auth: { token },
//     extraHeaders: { Authorization: `Bearer ${token}` },
//     transports: ['websocket'],
//     reconnection: true,
//     reconnectionDelay: 1_000,
//     reconnectionDelayMax: 10_000,
//     timeout: 5_000,
//   });

//   locationSocket.on('connect', () => {
//     logLocation('Socket connected');
//   });

//   locationSocket.on('disconnect', (reason) => {
//     logLocation('Socket disconnected', { reason });
//   });

//   locationSocket.on('connect_error', (error) => {
//     logLocation('Socket unavailable; HTTP fallback active', { error: error.message });
//   });

//   return locationSocket;
// };

// const isLocationSocketConnected = () =>
//   locationSocket?.connected === true && useOfflineStore.getState().offlineEnabled !== true;

// const waitForSocketConnection = async (timeoutMs = BACKGROUND_SOCKET_CONNECT_TIMEOUT_MS) => {
//   if (isLocationSocketConnected()) return true;

//   const socket = await connectLocationSocket();

//   if (!socket) return false;

//   if (socket.connected) return true;

//   socket.connect();

//   return new Promise<boolean>((resolve) => {
//     let settled = false;

//     const cleanup = () => {
//       socket.off('connect', onConnect);
//       socket.off('connect_error', onError);
//     };

//     const finish = (connected: boolean) => {
//       if (settled) return;
//       settled = true;
//       cleanup();
//       resolve(connected);
//     };

//     const onConnect = () => finish(true);
//     const onError = () => finish(false);

//     socket.once('connect', onConnect);
//     socket.once('connect_error', onError);

//     setTimeout(() => finish(socket.connected === true), timeoutMs);
//   });
// };

// const emitLocationOverSocket = async (payload: Record<string, unknown>) => {
//   /**
//    * Background rule:
//    * Try socket first, but only wait briefly. If socket is unavailable,
//    * immediately fall back to HTTP so background delivery is not blocked.
//    */
//   const socketReady = isLocationSocketConnected() || (await waitForSocketConnection());

//   if (!socketReady || !locationSocket?.connected) {
//     logLocation('Socket not connected; HTTP fallback active', {
//       source: String(payload.source || 'UNKNOWN'),
//     });
//     return false;
//   }

//   return new Promise<boolean>((resolve) => {
//     locationSocket!
//       .timeout(3_000)
//       .emit(
//         'live-location:track',
//         payload,
//         (error: Error | null, response?: { success?: boolean; statusCode?: number }) => {
//           if (error) {
//             logLocation('Socket location upload failed; HTTP fallback active', {
//               error: error.message,
//             });
//             return resolve(false);
//           }

//           const accepted = response?.success !== false && (response?.statusCode ?? 200) < 400;

//           if (!accepted) {
//             logLocation('Socket location upload rejected; HTTP fallback active', {
//               statusCode: response?.statusCode,
//             });
//           }

//           resolve(accepted);
//         },
//       );
//   });
// };

// const postLocationPayload = async (payload: Record<string, unknown>) => {
//   const token = await getAccessToken();

//   if (!token) {
//     throw new Error('Location upload requires an authenticated session');
//   }

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

//   try {
//     const response = await fetch(`${getApiBaseUrl()}/live-location-tracking/track`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//       signal: controller.signal,
//     });

//     const responseText = await response.text().catch(() => '');

//     logLocation('HTTP location upload response', {
//       status: response.status,
//       ok: response.ok,
//       body: responseText.slice(0, 300),
//     });

//     return {
//       ok: response.ok,
//       status: response.status,
//       text: responseText,
//     };
//   } catch (error) {
//     if (controller.signal.aborted) {
//       throw new Error('Location upload timed out');
//     }

//     throw error;
//   } finally {
//     clearTimeout(timeout);
//   }
// };

// const uploadLocationRequest = async (location: CapturedLocation, workSessionId: string) => {
//   const payload = {
//     workSessionId,
//     source: currentAppState === 'active' ? 'FOREGROUND' : 'BACKGROUND',
//     location,
//   };

//   /**
//    * Delivery rule:
//    * 1. If socket is connected, use socket and wait for acknowledgement.
//    * 2. If socket is not connected or ack fails, immediately use HTTP.
//    * This works for both foreground and background callbacks.
//    */
//   if (await emitLocationOverSocket(payload)) {
//     logLocation('Socket location upload success', {
//       source: payload.source,
//       capturedAt: location.capturedAt,
//     });
//     return;
//   }

//   const response = await postLocationPayload(payload);

//   if (!response.ok) {
//     throw new Error(`Location upload failed (${response.status}) ${response.text || ''}`);
//   }
// };

// const uploadLocationBatchRequest = async (locations: CapturedLocation[], workSessionId: string) => {
//   const response = await postLocationPayload({
//     workSessionId,
//     source: 'BACKGROUND',
//     locations,
//   });

//   if (!response.ok) {
//     throw new Error(`Location batch upload failed (${response.status}) ${response.text || ''}`);
//   }
// };

// const uploadWithRetry = async (
//   location: CapturedLocation,
//   workSessionId: string,
//   options: { background?: boolean } = {},
// ) => {
//   const retryDelays = options.background ? [3_000] : RETRY_DELAYS_MS;
//   let failure: unknown;

//   for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
//     try {
//       await uploadLocationRequest(location, workSessionId);

//       await storage.setItem(
//         LAST_BACKGROUND_LOCATION_KEY,
//         JSON.stringify({
//           ...location,
//           uploadedAt: new Date().toISOString(),
//         }),
//       );

//       await clearLastUploadError();

//       logLocation('Upload success', {
//         capturedAt: location.capturedAt,
//         attempt: attempt + 1,
//         background: options.background === true,
//       });

//       return true;
//     } catch (error) {
//       failure = error;

//       if (attempt === retryDelays.length) break;

//       const retryDelay = retryDelays[attempt];

//       logLocation('Upload retry', {
//         attempt: attempt + 1,
//         delayMs: retryDelay,
//         background: options.background === true,
//         error: errorMessage(error),
//       });

//       await delay(retryDelay);
//     }
//   }

//   await setLastUploadError(failure);

//   logLocation('Upload failure', {
//     error: errorMessage(failure),
//     background: options.background === true,
//   });

//   return false;
// };

// const getAttendanceRecord = async (ownerId: string, workSessionId: string) =>
//   repositories.attendance.findById(
//     ownerId,
//     workSessionId,
//   ) as Promise<AttendanceLocationRecord | null>;

// const saveBackgroundLocationOffline = async (
//   location: CapturedLocation,
//   workSessionId?: string,
// ) => {
//   const sessionId = await getActiveSessionId(workSessionId);
//   const ownerId = await resolveOwnerId();

//   if (!ownerId || !sessionId) {
//     await setLastUploadError('Unable to save offline location: owner or work session missing');
//     return;
//   }

//   const existing = await getAttendanceRecord(ownerId, sessionId);

//   const previousLocations = Array.isArray(existing?.backgroundLocations)
//     ? existing.backgroundLocations
//     : [];

//   if (previousLocations.some((item) => locationKey(item) === locationKey(location))) {
//     return;
//   }

//   const previousLocation = previousLocations[previousLocations.length - 1];

//   if (
//     previousLocation &&
//     distanceInMeters(previousLocation, location) < OFFLINE_LOCATION_DISTANCE_METERS
//   ) {
//     return;
//   }

//   const backgroundLocations = [...previousLocations, location].slice(-MAX_OFFLINE_LOCATIONS);

//   if (existing) {
//     await repositories.attendance.updateLocal(ownerId, existing.uuid, {
//       backgroundLocations,
//     });
//   } else {
//     const user = useAuthStore.getState().user;

//     await repositories.attendance.create(ownerId, {
//       uuid: sessionId,
//       workSessionId: sessionId,
//       userId: ownerId,
//       vanId: user?.vanId,
//       dayStartTime: new Date().toISOString(),
//       status: 'ACTIVE',
//       backgroundLocations,
//     });
//   }

//   logLocation('Offline saved', {
//     capturedAt: location.capturedAt,
//   });
// };

// const removeBackgroundLocationOffline = async (
//   location: CapturedLocation,
//   workSessionId?: string,
// ) => {
//   const sessionId = await getActiveSessionId(workSessionId);
//   const ownerId = await resolveOwnerId();

//   if (!ownerId || !sessionId) return;

//   const existing = await getAttendanceRecord(ownerId, sessionId);
//   const previousLocations = Array.isArray(existing?.backgroundLocations)
//     ? existing.backgroundLocations
//     : [];

//   if (!existing || previousLocations.length === 0) return;

//   const keyToRemove = locationKey(location);
//   const backgroundLocations = previousLocations.filter((item) => locationKey(item) !== keyToRemove);

//   if (backgroundLocations.length === previousLocations.length) return;

//   await repositories.attendance.updateLocal(ownerId, existing.uuid, {
//     backgroundLocations,
//   });

//   logLocation('Offline removed after upload', {
//     capturedAt: location.capturedAt,
//     remaining: backgroundLocations.length,
//   });
// };

// const hasNetworkConnection = async () => {
//   try {
//     const state = await Network.getNetworkStateAsync();

//     const isConnected = state.isConnected === true;
//     const isInternetReachable = isConnected && state.isInternetReachable !== false;

//     useOfflineStore.getState().setConnection(isConnected, isInternetReachable);

//     return isInternetReachable;
//   } catch {
//     const state = useOfflineStore.getState();
//     return state.isConnected && state.isInternetReachable;
//   }
// };

// const shouldStoreLocationOffline = async () =>
//   useOfflineStore.getState().offlineEnabled || !(await hasNetworkConnection());

// const processAcceptedLocation = async (accepted: CapturedLocation, workSessionId?: string) => {
//   const sessionId = await getActiveSessionId(workSessionId);

//   if (!sessionId) {
//     await setLastUploadError('Location upload requires an active work session');
//     return;
//   }

//   const isBackground = currentAppState !== 'active';

//   /**
//    * Important for Android background mode:
//    * After a few minutes, Android may throttle JS/network work.
//    * Save the point first so it is not lost, then try socket/HTTP upload.
//    */
//   if (isBackground) {
//     await saveBackgroundLocationOffline(accepted, sessionId);
//   }

//   if (await shouldStoreLocationOffline()) {
//     if (!isBackground) {
//       await saveBackgroundLocationOffline(accepted, sessionId);
//     }
//     return;
//   }

//   const uploaded = await uploadWithRetry(accepted, sessionId, {
//     background: isBackground,
//   });

//   if (uploaded) {
//     if (isBackground) {
//       await removeBackgroundLocationOffline(accepted, sessionId);
//     }
//     return;
//   }

//   if (!isBackground) {
//     await saveBackgroundLocationOffline(accepted, sessionId);
//   }
// };

// const drainLocationDeliveryQueue = async () => {
//   if (activeLocationDelivery) return activeLocationDelivery;

//   activeLocationDelivery = (async () => {
//     while (locationDeliveryQueue.length > 0) {
//       const item = locationDeliveryQueue.shift();

//       if (!item) continue;

//       try {
//         await processAcceptedLocation(item.location, item.workSessionId);
//       } catch (error) {
//         await setLastUploadError(error);
//       }
//     }
//   })().finally(() => {
//     activeLocationDelivery = null;
//   });

//   return activeLocationDelivery;
// };

// const queueLocation = (location: CapturedLocation, workSessionId?: string) => {
//   const accepted = validateLocation(location);

//   if (!accepted) return Promise.resolve();

//   /**
//    * Do not fire-and-forget socket here.
//    * Confirmed delivery is handled in uploadLocationRequest():
//    * socket if connected, otherwise HTTP, otherwise offline save.
//    */
//   locationDeliveryQueue.push({
//     location: accepted,
//     workSessionId,
//     emittedRealtime: false,
//   });

//   /**
//    * Prevent unbounded memory growth on very poor networks.
//    * Keep latest 300 pending locations.
//    */
//   if (locationDeliveryQueue.length > 300) {
//     locationDeliveryQueue = locationDeliveryQueue.slice(-300);
//   }

//   return drainLocationDeliveryQueue();
// };

// export const syncPendingLocationUploads = async () => {
//   if (offlineSyncPromise) return offlineSyncPromise;

//   offlineSyncPromise = (async () => {
//     if (await shouldStoreLocationOffline()) return;

//     const ownerId = await resolveOwnerId();
//     const workSessionId = await getActiveSessionId();

//     if (!ownerId || !workSessionId) return;

//     while (true) {
//       const record = await getAttendanceRecord(ownerId, workSessionId);
//       const queued = Array.isArray(record?.backgroundLocations) ? record.backgroundLocations : [];

//       const batch = queued.slice(0, OFFLINE_BATCH_SIZE);

//       if (!record || !batch.length) return;

//       try {
//         await uploadLocationBatchRequest(batch, workSessionId);
//       } catch (error) {
//         await setLastUploadError(error);

//         logLocation('Upload failure', {
//           type: 'offline batch',
//           error: errorMessage(error),
//         });

//         return;
//       }

//       const uploadedLocationKeys = new Set(batch.map(locationKey));

//       const remainingLocations = queued.filter(
//         (location) => !uploadedLocationKeys.has(locationKey(location)),
//       );

//       await repositories.attendance.updateLocal(ownerId, record.uuid, {
//         backgroundLocations: remainingLocations,
//       });

//       await clearLastUploadError();

//       logLocation('Offline sync completed', {
//         uploaded: batch.length,
//         remaining: remainingLocations.length,
//       });

//       if (remainingLocations.length === 0) return;
//     }
//   })().finally(() => {
//     offlineSyncPromise = null;
//   });

//   return offlineSyncPromise;
// };

// const startConnectivitySync = () => {
//   if (networkSubscription) return;

//   networkSubscription = Network.addNetworkStateListener((state) => {
//     const online = state.isConnected === true && state.isInternetReachable === true;

//     if (online && !useOfflineStore.getState().offlineEnabled) {
//       void syncPendingLocationUploads();
//       void syncNativePendingLocationUploads();
//     }
//   });
// };

// const startWebLocationTracking = () => {
//   if (webLocationWatchId !== null || typeof navigator === 'undefined' || !navigator.geolocation) {
//     return;
//   }

//   webLocationWatchId = navigator.geolocation.watchPosition(
//     (position) => {
//       const location: CapturedLocation = {
//         latitude: position.coords.latitude,
//         longitude: position.coords.longitude,
//         accuracy: position.coords.accuracy,
//         altitude: position.coords.altitude,
//         speed: position.coords.speed,
//         heading: normalizeHeading(position.coords.heading),
//         capturedAt: new Date(position.timestamp).toISOString(),
//       };

//       const intervalReached =
//         !lastWebLocation ||
//         position.timestamp - new Date(lastWebLocation.capturedAt).getTime() >=
//           FOREGROUND_TRACKING_INTERVAL_MS;

//       const distanceReached =
//         !!lastWebLocation &&
//         distanceInMeters(lastWebLocation, location) >= FOREGROUND_TRACKING_DISTANCE_METERS;

//       if (intervalReached || distanceReached) {
//         lastWebLocation = location;
//         void queueLocation(location);
//       }
//     },
//     (error) => console.warn('[Location] Browser location tracking error:', error.message),
//     {
//       enableHighAccuracy: true,
//       maximumAge: LOCATION_MAX_AGE_MS,
//       timeout: 10_000,
//     },
//   );

//   logLocation('Foreground tracking started', {
//     platform: 'web',
//   });
// };

// const stopWebLocationTracking = () => {
//   if (webLocationWatchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
//     navigator.geolocation.clearWatch(webLocationWatchId);
//   }

//   webLocationWatchId = null;
//   lastWebLocation = null;
// };

// if (!TaskManager.isTaskDefined(SALESMAN_BACKGROUND_LOCATION_TASK)) {
//   TaskManager.defineTask<LocationTaskData>(
//     SALESMAN_BACKGROUND_LOCATION_TASK,
//     async ({ data, error }) => {
//       if (error) {
//         await setLastUploadError(error);
//         console.warn('[Location] Background location task error:', error);
//         return;
//       }

//       const workSessionId = await storage.getItem(ACTIVE_LOCATION_SESSION_KEY);

//       if (!workSessionId) {
//         await setLastUploadError('Background location task has no persisted work session');
//         return;
//       }

//       const locations = data?.locations || [];

//       logLocation('Background task received locations', {
//         count: locations.length,
//         workSessionId,
//       });

//       /**
//        * Must await delivery in a background task.
//        * If this function returns early, Android may suspend JS before upload/offline save finishes.
//        */
//       for (const nativeLocation of locations) {
//         await queueLocation(toCapturedLocation(nativeLocation), workSessionId);
//       }
//     },
//   );
// }

// const withLocationTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
//   let timeout: ReturnType<typeof setTimeout> | undefined;

//   try {
//     return await Promise.race([
//       promise,
//       new Promise<never>((_, reject) => {
//         timeout = setTimeout(() => reject(new Error('GPS location request timed out')), timeoutMs);
//       }),
//     ]);
//   } finally {
//     if (timeout) clearTimeout(timeout);
//   }
// };

// let activeLocationCapture: Promise<CapturedLocation | undefined> | null = null;

// const performLocationCapture = async (
//   preferCached = true,
// ): Promise<CapturedLocation | undefined> => {
//   try {
//     if (preferCached && latestCapturedLocation) {
//       const age = Date.now() - new Date(latestCapturedLocation.capturedAt).getTime();
//       const accuracy = latestCapturedLocation.accuracy;

//       if (
//         age >= 0 &&
//         age <= LOCATION_MAX_AGE_MS &&
//         (accuracy == null || accuracy <= LOCATION_MAX_ACCURACY_METERS)
//       ) {
//         logLocation('Using recent tracked GPS fix', {
//           ageMs: age,
//           accuracy,
//         });

//         return latestCapturedLocation;
//       }
//     }

//     const foreground = await Location.requestForegroundPermissionsAsync();

//     if (foreground.status !== Location.PermissionStatus.GRANTED) {
//       logLocation('Permission denied', {
//         permission: 'foreground',
//       });

//       return undefined;
//     }

//     if (!(await Location.hasServicesEnabledAsync())) {
//       logLocation('GPS disabled');
//       return undefined;
//     }

//     try {
//       const nativeLocation = await withLocationTimeout(
//         Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.BestForNavigation,
//           mayShowUserSettingsDialog: true,
//         }),
//         10_000,
//       );

//       const captured = toCapturedLocation(nativeLocation);

//       const validated = validateLocation(captured, {
//         registerAcceptance: false,
//       });

//       if (validated) return validated;

//       if (latestCapturedLocation && locationKey(latestCapturedLocation) === locationKey(captured)) {
//         return latestCapturedLocation;
//       }

//       return undefined;
//     } catch (freshLocationError) {
//       console.warn('[Location] Fresh GPS fix unavailable:', freshLocationError);

//       if (latestCapturedLocation) {
//         const age = Date.now() - new Date(latestCapturedLocation.capturedAt).getTime();
//         const accuracy = latestCapturedLocation.accuracy;

//         if (
//           age <= LOCATION_MAX_AGE_MS &&
//           accuracy != null &&
//           accuracy <= LOCATION_MAX_ACCURACY_METERS
//         ) {
//           return latestCapturedLocation;
//         }
//       }

//       const lastKnown = await Location.getLastKnownPositionAsync({
//         maxAge: LOCATION_MAX_AGE_MS,
//         requiredAccuracy: LOCATION_MAX_ACCURACY_METERS,
//       });

//       if (!lastKnown) throw freshLocationError;

//       return (
//         validateLocation(toCapturedLocation(lastKnown), {
//           registerAcceptance: false,
//         }) || undefined
//       );
//     }
//   } catch (error) {
//     console.warn('[Location] Unable to capture current location:', error);
//     return undefined;
//   }
// };

// export const captureCurrentLocation = async (
//   options: { preferCached?: boolean; timeoutMs?: number } = {},
// ): Promise<CapturedLocation | undefined> => {
//   if (activeLocationCapture) return activeLocationCapture;

//   activeLocationCapture = withLocationTimeout(
//     performLocationCapture(options.preferCached !== false),
//     options.timeoutMs ?? 12_000,
//   ).catch((error) => {
//     console.warn('[Location] Complete GPS capture timed out:', error);
//     return undefined;
//   });

//   try {
//     return await activeLocationCapture;
//   } finally {
//     activeLocationCapture = null;
//   }
// };

// const startForegroundTracking = async () => {
//   if (foregroundLocationSubscription && foregroundHeadingSubscription) return;

//   if (foregroundTrackingStartPromise) return foregroundTrackingStartPromise;

//   foregroundTrackingStartPromise = (async () => {
//     if (!foregroundLocationSubscription) {
//       foregroundLocationSubscription = await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.BestForNavigation,
//           timeInterval: FOREGROUND_TRACKING_INTERVAL_MS,
//           distanceInterval: FOREGROUND_TRACKING_DISTANCE_METERS,
//           mayShowUserSettingsDialog: true,
//         },
//         (location) => void queueLocation(toCapturedLocation(location)),
//       );

//       logLocation('Foreground tracking started', {
//         intervalMs: FOREGROUND_TRACKING_INTERVAL_MS,
//         distanceMeters: FOREGROUND_TRACKING_DISTANCE_METERS,
//       });
//     }

//     if (!foregroundHeadingSubscription) {
//       foregroundHeadingSubscription = await Location.watchHeadingAsync((heading) => {
//         const nextHeading = normalizeHeading(
//           heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading,
//         );

//         if (nextHeading != null) latestDeviceHeading = nextHeading;
//       });
//     }
//   })().finally(() => {
//     foregroundTrackingStartPromise = null;
//   });

//   return foregroundTrackingStartPromise;
// };

// const stopForegroundTracking = () => {
//   foregroundLocationSubscription?.remove();
//   foregroundLocationSubscription = null;

//   foregroundHeadingSubscription?.remove();
//   foregroundHeadingSubscription = null;
// };

// const restartHeartbeat = (workSessionId: string) => {
//   if (heartbeatTimer) clearInterval(heartbeatTimer);

//   heartbeatTimer = null;

//   const interval =
//     currentAppState === 'active'
//       ? FOREGROUND_HEARTBEAT_INTERVAL_MS
//       : BACKGROUND_HEARTBEAT_INTERVAL_MS;

//   if (interval <= 0) return;

//   heartbeatTimer = setInterval(() => {
//     const lastUpdateAt = latestCapturedLocation
//       ? new Date(latestCapturedLocation.capturedAt).getTime()
//       : 0;

//     if (Date.now() - lastUpdateAt < interval) return;

//     void captureCurrentLocation({ preferCached: false }).then((location) => {
//       if (location) void queueLocation(location, workSessionId);
//     });
//   }, interval);
// };

// const startLocationLifecycle = (workSessionId: string) => {
//   restartHeartbeat(workSessionId);

//   if (appStateSubscription) return;

//   appStateSubscription = AppState.addEventListener('change', (nextState) => {
//     currentAppState = nextState;

//     restartHeartbeat(workSessionId);

//     if (nextState === 'active') {
//       void connectLocationSocket();
//       void startForegroundTracking();
//       void syncPendingLocationUploads();
//       void syncNativePendingLocationUploads();
//     } else {
//       /**
//        * Background tracking is platform-specific:
//        * Android -> native service continues outside JS.
//        * iOS -> Expo/CoreLocation background task continues when allowed.
//        *
//        * Stop foreground watcher to avoid duplicate foreground callbacks.
//        */
//       stopForegroundTracking();
//     }
//   });
// };

// export const debugLocationTrackingStatus = async () => {
//   const gpsEnabled = Platform.OS === 'web' ? true : await Location.hasServicesEnabledAsync();

//   const foregroundPermission =
//     Platform.OS === 'web'
//       ? { status: Location.PermissionStatus.GRANTED, canAskAgain: false }
//       : await Location.getForegroundPermissionsAsync();

//   const backgroundPermission =
//     Platform.OS === 'web'
//       ? { status: Location.PermissionStatus.GRANTED, canAskAgain: false }
//       : await Location.getBackgroundPermissionsAsync();

//   const backgroundTaskRunning =
//     Platform.OS === 'web'
//       ? webLocationWatchId !== null
//       : await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);

//   const activeSessionId = await getActiveSessionId();
//   const ownerId = await resolveOwnerId();

//   const result = {
//     gpsEnabled,
//     foregroundPermission: foregroundPermission.status,
//     foregroundCanAskAgain: foregroundPermission.canAskAgain,
//     backgroundPermission: backgroundPermission.status,
//     backgroundCanAskAgain: backgroundPermission.canAskAgain,
//     backgroundTaskRunning,
//     nativeLocationAvailable: isNativeLocationAvailable(),
//     nativeBackgroundTrackingStarted,
//     socketConnected: isLocationSocketConnected(),
//     activeSessionId,
//     ownerId,
//     currentAppState,
//     lastUploadError,
//   };

//   console.log('[Location Debug Status]', result);

//   return result;
// };

// const startNativeAndroidBackgroundTracking = async (workSessionId: string) => {
//   if (Platform.OS !== 'android' || !isNativeLocationAvailable()) {
//     return false;
//   }

//   try {
//     const started = await startNativeBackgroundLocation({
//       workSessionId,
//       intervalMs: NATIVE_BACKGROUND_TRACKING_INTERVAL_MS,
//       distanceMeters: NATIVE_BACKGROUND_TRACKING_DISTANCE_METERS,
//     });

//     nativeBackgroundTrackingStarted = started === true;

//     logLocation('Native background tracking start result', {
//       started: nativeBackgroundTrackingStarted,
//       intervalMs: NATIVE_BACKGROUND_TRACKING_INTERVAL_MS,
//       distanceMeters: NATIVE_BACKGROUND_TRACKING_DISTANCE_METERS,
//     });

//     return nativeBackgroundTrackingStarted;
//   } catch (error) {
//     nativeBackgroundTrackingStarted = false;
//     await setLastUploadError(error);

//     console.warn('[Location] Native background tracking start failed:', error);

//     return false;
//   }
// };

// const startBackgroundTracking = async () => {
//   if (Platform.OS === 'web') return;

//   const foreground = await Location.getForegroundPermissionsAsync();

//   if (foreground.status !== Location.PermissionStatus.GRANTED) {
//     await setLastUploadError(
//       'Foreground location permission is required before background tracking',
//     );

//     logLocation('Permission denied', {
//       permission: 'foreground-before-background',
//       status: foreground.status,
//       canAskAgain: foreground.canAskAgain,
//     });

//     return;
//   }

//   const background = await Location.requestBackgroundPermissionsAsync();

//   if (background.status !== Location.PermissionStatus.GRANTED) {
//     await setLastUploadError(
//       'Background location permission denied. Please allow location permission all the time.',
//     );

//     logLocation('Permission denied', {
//       permission: 'background',
//       status: background.status,
//       canAskAgain: background.canAskAgain,
//     });

//     return;
//   }

//   const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
//     SALESMAN_BACKGROUND_LOCATION_TASK,
//   );

//   if (alreadyStarted) {
//     logLocation('Background task already running');
//     return;
//   }

//   const baseOptions: Location.LocationTaskOptions = {
//     accuracy: Location.Accuracy.BestForNavigation,
//     activityType: Location.ActivityType.AutomotiveNavigation,
//     timeInterval: BACKGROUND_TRACKING_INTERVAL_MS,
//     distanceInterval: BACKGROUND_TRACKING_DISTANCE_METERS,
//     deferredUpdatesInterval: BACKGROUND_TRACKING_INTERVAL_MS,
//     deferredUpdatesDistance: BACKGROUND_TRACKING_DISTANCE_METERS,
//     pausesUpdatesAutomatically: false,
//     showsBackgroundLocationIndicator: true,
//   };

//   const androidOptions: Location.LocationTaskOptions = {
//     ...baseOptions,
//     foregroundService: {
//       notificationTitle: 'Sales Stream live location active',
//       notificationBody: 'Your live location is shared while your work day is active.',
//       killServiceOnDestroy: false,
//     },
//   };

//   await Location.startLocationUpdatesAsync(
//     SALESMAN_BACKGROUND_LOCATION_TASK,
//     Platform.OS === 'android' ? androidOptions : baseOptions,
//   );

//   const started = await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);

//   logLocation('Background task start result', {
//     started,
//     platform: Platform.OS,
//     intervalMs: BACKGROUND_TRACKING_INTERVAL_MS,
//     distanceMeters: BACKGROUND_TRACKING_DISTANCE_METERS,
//   });
// };

// const performStartSalesmanBackgroundLocation = async (user?: LocationOwner) => {
//   if (!isSalesman(user)) {
//     console.warn('[Location] Unable to start live location: current user is not a salesman');
//     return;
//   }

//   const activeSessionId = await getActiveSessionId();

//   if (!activeSessionId) {
//     console.warn('[Location] Unable to start background location: no active work session');
//     return;
//   }

//   await storage.setItem(ACTIVE_LOCATION_SESSION_KEY, activeSessionId);

//   startConnectivitySync();

//   /**
//    * Android battery optimization can stop background tracking after a few minutes.
//    * Ask the user to set the app to Unrestricted when live tracking starts.
//    */
//   void requestBatteryOptimizationPermission();

//   if (Platform.OS === 'web') {
//     startWebLocationTracking();
//     return;
//   }

//   try {
//     const foreground = await Location.requestForegroundPermissionsAsync();

//     if (foreground.status !== Location.PermissionStatus.GRANTED) {
//       logLocation('Permission denied', {
//         permission: 'foreground',
//         status: foreground.status,
//         canAskAgain: foreground.canAskAgain,
//       });

//       return;
//     }

//     if (!(await Location.hasServicesEnabledAsync())) {
//       logLocation('GPS disabled');
//       return;
//     }

//     await connectLocationSocket();

//     /**
//      * Platform background strategy:
//      * Android: use native ForegroundService only. It captures GPS and sends
//      *          socket first, then HTTP fallback from Kotlin. Expo background
//      *          is intentionally disabled on Android to avoid duplicate points.
//      *
//      * iOS: use Expo/CoreLocation background updates. iOS does not reliably
//      *      keep a Socket.IO connection alive in background, so this JS flow
//      *      tries socket when available and then HTTP fallback. Your backend
//      *      should emit manager socket updates after HTTP receives a location.
//      */
//     if (Platform.OS === 'android') {
//       await startNativeAndroidBackgroundTracking(activeSessionId);
//     } else if (Platform.OS === 'ios') {
//       await startBackgroundTracking();
//     }

//     /**
//      * Foreground tracking is still useful while the app is open.
//      * When app goes background, startLocationLifecycle() stops this watcher
//      * to avoid duplicate callbacks. Native/Expo background continues.
//      */
//     await startForegroundTracking();

//     startLocationLifecycle(activeSessionId);

//     void syncPendingLocationUploads();
//     void syncNativePendingLocationUploads();

//     void captureCurrentLocation({ preferCached: false }).then((location) => {
//       if (location) return queueLocation(location, activeSessionId);
//     });

//     // await debugLocationTrackingStatus();
//   } catch (error) {
//     await setLastUploadError(error);
//     console.warn('[Location] Unable to start location tracking:', error);
//   }
// };

// export const startSalesmanBackgroundLocation = async (user?: LocationOwner) => {
//   if (locationTrackingStartPromise) return locationTrackingStartPromise;

//   locationTrackingStartPromise = performStartSalesmanBackgroundLocation(user).finally(() => {
//     locationTrackingStartPromise = null;
//   });

//   return locationTrackingStartPromise;
// };

// export const stopSalesmanBackgroundLocation = async () => {
//   await storage.removeItem(ACTIVE_LOCATION_SESSION_KEY);

//   networkSubscription?.remove();
//   networkSubscription = null;

//   if (Platform.OS === 'web') {
//     stopWebLocationTracking();
//     return;
//   }

//   try {
//     stopForegroundTracking();

//     appStateSubscription?.remove();
//     appStateSubscription = null;

//     if (heartbeatTimer) clearInterval(heartbeatTimer);
//     heartbeatTimer = null;

//     locationSocket?.disconnect();
//     locationSocket = null;
//     locationSocketToken = null;

//     latestDeviceHeading = null;

//     locationDeliveryQueue = [];

//     acceptedLocationKeys.clear();
//     lastAcceptedLocation = null;

//     if (Platform.OS === 'android' && isNativeLocationAvailable()) {
//       try {
//         await stopNativeBackgroundLocation();
//         nativeBackgroundTrackingStarted = false;
//         logLocation('Native background tracking stopped');
//       } catch (nativeStopError) {
//         console.warn('[Location] Unable to stop native background tracking:', nativeStopError);
//       }
//     }

//     if (await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK)) {
//       await Location.stopLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);
//       logLocation('Background task stopped');
//     }
//   } catch (error) {
//     console.warn('[Location] Unable to stop background location:', error);
//   }
// };

// export const getBackgroundLocationDiagnostics = async () => {
//   const [gpsEnabled, foregroundPermission, backgroundPermission, backgroundTaskRunning] =
//     await Promise.all([
//       Platform.OS === 'web' ? Promise.resolve(true) : Location.hasServicesEnabledAsync(),
//       Location.getForegroundPermissionsAsync(),
//       Platform.OS === 'web'
//         ? Promise.resolve({ status: Location.PermissionStatus.GRANTED })
//         : Location.getBackgroundPermissionsAsync(),
//       Platform.OS === 'web'
//         ? Promise.resolve(webLocationWatchId !== null)
//         : Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK),
//     ]);

//   const storedLocation = await storage.getItem(LAST_BACKGROUND_LOCATION_KEY);
//   const storedError = await storage.getItem(LAST_BACKGROUND_LOCATION_ERROR_KEY);

//   let lastLocation: StoredLocationDiagnostics | null = latestCapturedLocation;
//   let persistedError: { message?: string } | null = null;

//   try {
//     if (!lastLocation && storedLocation) lastLocation = JSON.parse(storedLocation);
//     if (storedError) persistedError = JSON.parse(storedError);
//   } catch {
//     // Diagnostics must never interfere with tracking.
//   }

//   const ownerId = await resolveOwnerId();
//   const workSessionId = await getActiveSessionId();

//   const attendance =
//     ownerId && workSessionId ? await getAttendanceRecord(ownerId, workSessionId) : null;

//   const pendingUploadCount = Array.isArray(attendance?.backgroundLocations)
//     ? attendance.backgroundLocations.length
//     : 0;

//   const foregroundTrackingRunning =
//     Platform.OS === 'web' ? webLocationWatchId !== null : foregroundLocationSubscription !== null;

//   return {
//     gpsEnabled,
//     foregroundPermission: foregroundPermission.status,
//     backgroundPermission: backgroundPermission.status,
//     trackingRunning:
//       foregroundTrackingRunning || backgroundTaskRunning || nativeBackgroundTrackingStarted,
//     foregroundTrackingRunning,
//     backgroundTaskRunning,
//     nativeLocationAvailable: isNativeLocationAvailable(),
//     nativeBackgroundTrackingStarted,
//     lastLocationAge: lastLocation
//       ? Math.max(0, Date.now() - new Date(lastLocation.capturedAt).getTime())
//       : null,
//     lastLocationAccuracy: lastLocation?.accuracy ?? null,
//     pendingUploadCount,
//     queueLength: locationDeliveryQueue.length,
//     socketConnected: locationSocket?.connected === true,
//     lastUploadError: lastUploadError || persistedError?.message || null,
//   };
// };

// export const getLocationHealth = async () => {
//   const diagnostics = await getBackgroundLocationDiagnostics();

//   return {
//     gpsEnabled: diagnostics.gpsEnabled,
//     foregroundPermission: diagnostics.foregroundPermission,
//     backgroundPermission: diagnostics.backgroundPermission,
//     trackingRunning: diagnostics.trackingRunning,
//     foregroundTrackingRunning: diagnostics.foregroundTrackingRunning,
//     backgroundTaskRunning: diagnostics.backgroundTaskRunning,
//     nativeLocationAvailable: diagnostics.nativeLocationAvailable,
//     nativeBackgroundTrackingStarted: diagnostics.nativeBackgroundTrackingStarted,
//   };
// };

import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as TaskManager from 'expo-task-manager';
import { jwtDecode } from 'jwt-decode';
import { Alert, AppState, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { io } from 'socket.io-client';

import { isSalesman } from '@/core/navigation/role.utils';
import { useOfflineStore } from '@/core/offline/offline.store';
import { storage } from '@/core/storage';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

import { getAccessToken } from './tokenStorage';
import {
  isNativeLocationAvailable,
  startNativeBackgroundLocation,
  stopNativeBackgroundLocation,
  syncNativePendingLocationUploads,
} from './native-location.service';

export const SALESMAN_BACKGROUND_LOCATION_TASK = 'salesman-background-location';

const locationTrackingKey = (ownerId: string) => `location_tracking_enabled:${ownerId}`;
const ACTIVE_LOCATION_SESSION_KEY = 'active_location_work_session_id';
const LAST_BACKGROUND_LOCATION_KEY = 'last_background_location';
const LAST_BACKGROUND_LOCATION_ERROR_KEY = 'last_background_location_error';
const BATTERY_OPTIMIZATION_PROMPTED_KEY = 'battery_optimization_prompted';

/**
 * Real-time tracking settings
 * ---------------------------
 * NOTE:
 * 0 interval is not reliable on Android background services.
 * OS/GPS may still throttle updates in background depending on device/battery/vendor.
 */
const FOREGROUND_TRACKING_INTERVAL_MS = 1_000;
const FOREGROUND_TRACKING_DISTANCE_METERS = 1;

const BACKGROUND_TRACKING_INTERVAL_MS = 2_000;
const BACKGROUND_TRACKING_DISTANCE_METERS = 1;

/**
 * Native Android service interval.
 * 5s/5m is more stable than 1-2s in sleep mode and saves battery.
 */
const NATIVE_BACKGROUND_TRACKING_INTERVAL_MS = 5_000;
/**
 * Keep 0 while testing background delivery. Android will still throttle in deep sleep,
 * but this avoids missing updates when the phone moves less than 5 metres.
 * After testing, you can change this to 3 or 5 to save battery.
 */
const NATIVE_BACKGROUND_TRACKING_DISTANCE_METERS = 0;

const FOREGROUND_HEARTBEAT_INTERVAL_MS = 5_000;
const BACKGROUND_HEARTBEAT_INTERVAL_MS = 10_000;

/**
 * Background callbacks can arrive late on some Android devices.
 * Do not keep this too low, otherwise valid background points get rejected as stale.
 */
const LOCATION_MAX_AGE_MS = 120_000;
const LOCATION_MAX_ACCURACY_METERS = 100;

const MAX_SPEED_METERS_PER_SECOND = 200 / 3.6;
const UPLOAD_TIMEOUT_MS = 15_000;
const BACKGROUND_SOCKET_CONNECT_TIMEOUT_MS = 2_500;
const RETRY_DELAYS_MS = [5_000, 10_000, 20_000, 40_000, 60_000] as const;

const OFFLINE_BATCH_SIZE = 50;
const MAX_OFFLINE_LOCATIONS = 1_000;
const OFFLINE_LOCATION_DISTANCE_METERS = 3;

const requestBatteryOptimizationPermission = async () => {
  if (Platform.OS !== 'android') return;

  const alreadyPrompted = await storage.getItem(BATTERY_OPTIMIZATION_PROMPTED_KEY);

  if (alreadyPrompted === 'true') return;

  await storage.setItem(BATTERY_OPTIMIZATION_PROMPTED_KEY, 'true');

  console.info(
    '[Battery] Background tracking may be interrupted by Android battery optimization. Please allow unrestricted battery usage for this app.',
  );
};

export const resetBatteryOptimizationPrompt = async () => {
  await storage.removeItem(BATTERY_OPTIMIZATION_PROMPTED_KEY);
};

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

type LocationDeliveryItem = {
  location: CapturedLocation;
  workSessionId?: string;
  emittedRealtime: boolean;
};

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
let nativeBackgroundTrackingStarted = false;

let activeLocationDelivery: Promise<void> | null = null;
let locationDeliveryQueue: LocationDeliveryItem[] = [];

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
  logLocation('GPS rejected', {
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

  if (age < -10_000 || age > LOCATION_MAX_AGE_MS) {
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

    if (acceptedLocationKeys.size > 300) {
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
    JSON.stringify({
      message: lastUploadError,
      occurredAt: new Date().toISOString(),
    }),
  );
};

const clearLastUploadError = async () => {
  lastUploadError = null;
  await storage.removeItem(LAST_BACKGROUND_LOCATION_ERROR_KEY);
};

const safeRun = (promise: Promise<unknown>, label: string) => {
  void promise.catch(async (error) => {
    try {
      await setLastUploadError(error);
    } catch (storageError) {
      console.warn('[Location] Unable to persist async error:', storageError);
    }

    console.warn(`[Location] ${label}:`, error);
  });
};

const connectLocationSocket = async () => {
  const token = await getAccessToken();

  if (!token) {
    logLocation('Socket unavailable', { reason: 'missing token' });
    return null;
  }

  if (locationSocket && locationSocketToken === token) {
    if (!locationSocket.connected && !locationSocket.active) {
      locationSocket.connect();
    }

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

  locationSocket.on('connect', () => {
    logLocation('Socket connected');
  });

  locationSocket.on('disconnect', (reason) => {
    logLocation('Socket disconnected', { reason });
  });

  locationSocket.on('connect_error', (error) => {
    logLocation('Socket unavailable; HTTP fallback active', { error: error.message });
  });

  return locationSocket;
};

const isLocationSocketConnected = () =>
  locationSocket?.connected === true && useOfflineStore.getState().offlineEnabled !== true;

const waitForSocketConnection = async (timeoutMs = BACKGROUND_SOCKET_CONNECT_TIMEOUT_MS) => {
  if (isLocationSocketConnected()) return true;

  const socket = await connectLocationSocket();

  if (!socket) return false;

  if (socket.connected) return true;

  socket.connect();

  return new Promise<boolean>((resolve) => {
    let settled = false;

    const cleanup = () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
    };

    const finish = (connected: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(connected);
    };

    const onConnect = () => finish(true);
    const onError = () => finish(false);

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);

    setTimeout(() => finish(socket.connected === true), timeoutMs);
  });
};

const emitLocationOverSocket = async (payload: Record<string, unknown>) => {
  /**
   * Background rule:
   * Try socket first, but only wait briefly. If socket is unavailable,
   * immediately fall back to HTTP so background delivery is not blocked.
   */
  const socketReady = isLocationSocketConnected() || (await waitForSocketConnection());

  if (!socketReady || !locationSocket?.connected) {
    logLocation('Socket not connected; HTTP fallback active', {
      source: String(payload.source || 'UNKNOWN'),
    });
    return false;
  }

  return new Promise<boolean>((resolve) => {
    locationSocket!
      .timeout(3_000)
      .emit(
        'live-location:track',
        payload,
        (error: Error | null, response?: { success?: boolean; statusCode?: number }) => {
          if (error) {
            logLocation('Socket location upload failed; HTTP fallback active', {
              error: error.message,
            });
            return resolve(false);
          }

          const accepted = response?.success !== false && (response?.statusCode ?? 200) < 400;

          if (!accepted) {
            logLocation('Socket location upload rejected; HTTP fallback active', {
              statusCode: response?.statusCode,
            });
          }

          resolve(accepted);
        },
      );
  });
};

const postLocationPayload = async (payload: Record<string, unknown>) => {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Location upload requires an authenticated session');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}/live-location-tracking/track`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseText = await response.text().catch(() => '');

    logLocation('HTTP location upload response', {
      status: response.status,
      ok: response.ok,
      body: responseText.slice(0, 300),
    });

    return {
      ok: response.ok,
      status: response.status,
      text: responseText,
    };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Location upload timed out');
    }

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

  /**
   * Delivery rule:
   * 1. If socket is connected, use socket and wait for acknowledgement.
   * 2. If socket is not connected or ack fails, immediately use HTTP.
   * This works for both foreground and background callbacks.
   */
  if (await emitLocationOverSocket(payload)) {
    logLocation('Socket location upload success', {
      source: payload.source,
      capturedAt: location.capturedAt,
    });
    return;
  }

  const response = await postLocationPayload(payload);

  if (!response.ok) {
    throw new Error(`Location upload failed (${response.status}) ${response.text || ''}`);
  }
};

const uploadLocationBatchRequest = async (locations: CapturedLocation[], workSessionId: string) => {
  const response = await postLocationPayload({
    workSessionId,
    source: 'BACKGROUND',
    locations,
  });

  if (!response.ok) {
    throw new Error(`Location batch upload failed (${response.status}) ${response.text || ''}`);
  }
};

const uploadWithRetry = async (
  location: CapturedLocation,
  workSessionId: string,
  options: { background?: boolean } = {},
) => {
  const retryDelays = options.background ? [3_000] : RETRY_DELAYS_MS;
  let failure: unknown;

  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    try {
      await uploadLocationRequest(location, workSessionId);

      await storage.setItem(
        LAST_BACKGROUND_LOCATION_KEY,
        JSON.stringify({
          ...location,
          uploadedAt: new Date().toISOString(),
        }),
      );

      await clearLastUploadError();

      logLocation('Upload success', {
        capturedAt: location.capturedAt,
        attempt: attempt + 1,
        background: options.background === true,
      });

      return true;
    } catch (error) {
      failure = error;

      if (attempt === retryDelays.length) break;

      const retryDelay = retryDelays[attempt];

      logLocation('Upload retry', {
        attempt: attempt + 1,
        delayMs: retryDelay,
        background: options.background === true,
        error: errorMessage(error),
      });

      await delay(retryDelay);
    }
  }

  await setLastUploadError(failure);

  logLocation('Upload failure', {
    error: errorMessage(failure),
    background: options.background === true,
  });

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

  if (previousLocations.some((item) => locationKey(item) === locationKey(location))) {
    return;
  }

  const previousLocation = previousLocations[previousLocations.length - 1];

  if (
    previousLocation &&
    distanceInMeters(previousLocation, location) < OFFLINE_LOCATION_DISTANCE_METERS
  ) {
    return;
  }

  const backgroundLocations = [...previousLocations, location].slice(-MAX_OFFLINE_LOCATIONS);

  if (existing) {
    await repositories.attendance.updateLocal(ownerId, existing.uuid, {
      backgroundLocations,
    });
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

  logLocation('Offline saved', {
    capturedAt: location.capturedAt,
  });
};

const removeBackgroundLocationOffline = async (
  location: CapturedLocation,
  workSessionId?: string,
) => {
  const sessionId = await getActiveSessionId(workSessionId);
  const ownerId = await resolveOwnerId();

  if (!ownerId || !sessionId) return;

  const existing = await getAttendanceRecord(ownerId, sessionId);
  const previousLocations = Array.isArray(existing?.backgroundLocations)
    ? existing.backgroundLocations
    : [];

  if (!existing || previousLocations.length === 0) return;

  const keyToRemove = locationKey(location);
  const backgroundLocations = previousLocations.filter((item) => locationKey(item) !== keyToRemove);

  if (backgroundLocations.length === previousLocations.length) return;

  await repositories.attendance.updateLocal(ownerId, existing.uuid, {
    backgroundLocations,
  });

  logLocation('Offline removed after upload', {
    capturedAt: location.capturedAt,
    remaining: backgroundLocations.length,
  });
};

const hasNetworkConnection = async () => {
  try {
    const state = await Network.getNetworkStateAsync();

    const isConnected = state.isConnected === true;
    const isInternetReachable = isConnected && state.isInternetReachable !== false;

    useOfflineStore.getState().setConnection(isConnected, isInternetReachable);

    return isInternetReachable;
  } catch {
    const state = useOfflineStore.getState();
    return state.isConnected && state.isInternetReachable;
  }
};

const shouldStoreLocationOffline = async () =>
  useOfflineStore.getState().offlineEnabled || !(await hasNetworkConnection());

const processAcceptedLocation = async (accepted: CapturedLocation, workSessionId?: string) => {
  const sessionId = await getActiveSessionId(workSessionId);

  if (!sessionId) {
    await setLastUploadError('Location upload requires an active work session');
    return;
  }

  const isBackground = currentAppState !== 'active';

  /**
   * Important for Android background mode:
   * After a few minutes, Android may throttle JS/network work.
   * Save the point first so it is not lost, then try socket/HTTP upload.
   */
  if (isBackground) {
    await saveBackgroundLocationOffline(accepted, sessionId);
  }

  if (await shouldStoreLocationOffline()) {
    if (!isBackground) {
      await saveBackgroundLocationOffline(accepted, sessionId);
    }
    return;
  }

  const uploaded = await uploadWithRetry(accepted, sessionId, {
    background: isBackground,
  });

  if (uploaded) {
    if (isBackground) {
      await removeBackgroundLocationOffline(accepted, sessionId);
    }
    return;
  }

  if (!isBackground) {
    await saveBackgroundLocationOffline(accepted, sessionId);
  }
};

const drainLocationDeliveryQueue = async () => {
  if (activeLocationDelivery) return activeLocationDelivery;

  activeLocationDelivery = (async () => {
    while (locationDeliveryQueue.length > 0) {
      const item = locationDeliveryQueue.shift();

      if (!item) continue;

      try {
        await processAcceptedLocation(item.location, item.workSessionId);
      } catch (error) {
        await setLastUploadError(error);
      }
    }
  })().finally(() => {
    activeLocationDelivery = null;
  });

  return activeLocationDelivery;
};

const queueLocation = (location: CapturedLocation, workSessionId?: string) => {
  const accepted = validateLocation(location);

  if (!accepted) return Promise.resolve();

  /**
   * Do not fire-and-forget socket here.
   * Confirmed delivery is handled in uploadLocationRequest():
   * socket if connected, otherwise HTTP, otherwise offline save.
   */
  locationDeliveryQueue.push({
    location: accepted,
    workSessionId,
    emittedRealtime: false,
  });

  /**
   * Prevent unbounded memory growth on very poor networks.
   * Keep latest 300 pending locations.
   */
  if (locationDeliveryQueue.length > 300) {
    locationDeliveryQueue = locationDeliveryQueue.slice(-300);
  }

  return drainLocationDeliveryQueue();
};

export const syncPendingLocationUploads = async () => {
  if (offlineSyncPromise) return offlineSyncPromise;

  offlineSyncPromise = (async () => {
    if (await shouldStoreLocationOffline()) return;

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

        logLocation('Upload failure', {
          type: 'offline batch',
          error: errorMessage(error),
        });

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

    if (online && !useOfflineStore.getState().offlineEnabled) {
      safeRun(syncPendingLocationUploads(), 'Pending location sync failed');
      safeRun(syncNativePendingLocationUploads(), 'Native pending location sync failed');
    }
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
        safeRun(queueLocation(location), 'Web location queue failed');
      }
    },
    (error) => console.warn('[Location] Browser location tracking error:', error.message),
    {
      enableHighAccuracy: true,
      maximumAge: LOCATION_MAX_AGE_MS,
      timeout: 10_000,
    },
  );

  logLocation('Foreground tracking started', {
    platform: 'web',
  });
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

      const locations = data?.locations || [];

      logLocation('Background task received locations', {
        count: locations.length,
        workSessionId,
      });

      /**
       * Must await delivery in a background task.
       * If this function returns early, Android may suspend JS before upload/offline save finishes.
       */
      for (const nativeLocation of locations) {
        await queueLocation(toCapturedLocation(nativeLocation), workSessionId);
      }
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

const performLocationCapture = async (
  preferCached = true,
): Promise<CapturedLocation | undefined> => {
  try {
    if (preferCached && latestCapturedLocation) {
      const age = Date.now() - new Date(latestCapturedLocation.capturedAt).getTime();
      const accuracy = latestCapturedLocation.accuracy;

      if (
        age >= 0 &&
        age <= LOCATION_MAX_AGE_MS &&
        (accuracy == null || accuracy <= LOCATION_MAX_ACCURACY_METERS)
      ) {
        logLocation('Using recent tracked GPS fix', {
          ageMs: age,
          accuracy,
        });

        return latestCapturedLocation;
      }
    }

    const foreground = await Location.requestForegroundPermissionsAsync();

    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      logLocation('Permission denied', {
        permission: 'foreground',
      });

      return undefined;
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      logLocation('GPS disabled');
      return undefined;
    }

    try {
      const nativeLocation = await withLocationTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          mayShowUserSettingsDialog: true,
        }),
        10_000,
      );

      const captured = toCapturedLocation(nativeLocation);

      const validated = validateLocation(captured, {
        registerAcceptance: false,
      });

      if (validated) return validated;

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
        validateLocation(toCapturedLocation(lastKnown), {
          registerAcceptance: false,
        }) || undefined
      );
    }
  } catch (error) {
    console.warn('[Location] Unable to capture current location:', error);
    return undefined;
  }
};

export const captureCurrentLocation = async (
  options: { preferCached?: boolean; timeoutMs?: number } = {},
): Promise<CapturedLocation | undefined> => {
  if (activeLocationCapture) return activeLocationCapture;

  activeLocationCapture = withLocationTimeout(
    performLocationCapture(options.preferCached !== false),
    options.timeoutMs ?? 12_000,
  ).catch((error) => {
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
        (location) =>
          safeRun(queueLocation(toCapturedLocation(location)), 'Foreground location queue failed'),
      );

      logLocation('Foreground tracking started', {
        intervalMs: FOREGROUND_TRACKING_INTERVAL_MS,
        distanceMeters: FOREGROUND_TRACKING_DISTANCE_METERS,
      });
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

  heartbeatTimer = null;

  const interval =
    currentAppState === 'active'
      ? FOREGROUND_HEARTBEAT_INTERVAL_MS
      : BACKGROUND_HEARTBEAT_INTERVAL_MS;

  if (interval <= 0) return;

  heartbeatTimer = setInterval(() => {
    const lastUpdateAt = latestCapturedLocation
      ? new Date(latestCapturedLocation.capturedAt).getTime()
      : 0;

    if (Date.now() - lastUpdateAt < interval) return;

    safeRun(
      captureCurrentLocation({ preferCached: false }).then((location) => {
        if (location) return queueLocation(location, workSessionId);
      }),
      'Heartbeat location capture failed',
    );
  }, interval);
};

const startLocationLifecycle = (workSessionId: string) => {
  restartHeartbeat(workSessionId);

  if (appStateSubscription) return;

  appStateSubscription = AppState.addEventListener('change', (nextState) => {
    currentAppState = nextState;

    restartHeartbeat(workSessionId);

    if (nextState === 'active') {
      safeRun(connectLocationSocket(), 'Socket connect failed');
      safeRun(startForegroundTracking(), 'Foreground tracking restart failed');
      safeRun(syncPendingLocationUploads(), 'Pending location sync failed');
      safeRun(syncNativePendingLocationUploads(), 'Native pending location sync failed');
    } else {
      /**
       * Background tracking is platform-specific:
       * Android -> native service continues outside JS.
       * iOS -> Expo/CoreLocation background task continues when allowed.
       *
       * Stop foreground watcher to avoid duplicate foreground callbacks.
       */
      stopForegroundTracking();
    }
  });
};

export const debugLocationTrackingStatus = async () => {
  const gpsEnabled = Platform.OS === 'web' ? true : await Location.hasServicesEnabledAsync();

  const foregroundPermission =
    Platform.OS === 'web'
      ? { status: Location.PermissionStatus.GRANTED, canAskAgain: false }
      : await Location.getForegroundPermissionsAsync();

  const backgroundPermission =
    Platform.OS === 'web'
      ? { status: Location.PermissionStatus.GRANTED, canAskAgain: false }
      : await Location.getBackgroundPermissionsAsync();

  const backgroundTaskRunning =
    Platform.OS === 'web'
      ? webLocationWatchId !== null
      : await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);

  const activeSessionId = await getActiveSessionId();
  const ownerId = await resolveOwnerId();

  const result = {
    gpsEnabled,
    foregroundPermission: foregroundPermission.status,
    foregroundCanAskAgain: foregroundPermission.canAskAgain,
    backgroundPermission: backgroundPermission.status,
    backgroundCanAskAgain: backgroundPermission.canAskAgain,
    backgroundTaskRunning,
    nativeLocationAvailable: isNativeLocationAvailable(),
    nativeBackgroundTrackingStarted,
    socketConnected: isLocationSocketConnected(),
    activeSessionId,
    ownerId,
    currentAppState,
    lastUploadError,
  };

  console.log('[Location Debug Status]', result);

  return result;
};

const startNativeAndroidBackgroundTracking = async (workSessionId: string) => {
  if (Platform.OS !== 'android' || !isNativeLocationAvailable()) {
    return false;
  }

  try {
    const started = await startNativeBackgroundLocation({
      workSessionId,
      intervalMs: NATIVE_BACKGROUND_TRACKING_INTERVAL_MS,
      distanceMeters: NATIVE_BACKGROUND_TRACKING_DISTANCE_METERS,
    });

    nativeBackgroundTrackingStarted = started === true;

    logLocation('Native background tracking start result', {
      started: nativeBackgroundTrackingStarted,
      intervalMs: NATIVE_BACKGROUND_TRACKING_INTERVAL_MS,
      distanceMeters: NATIVE_BACKGROUND_TRACKING_DISTANCE_METERS,
    });

    return nativeBackgroundTrackingStarted;
  } catch (error) {
    nativeBackgroundTrackingStarted = false;
    await setLastUploadError(error);

    console.warn('[Location] Native background tracking start failed:', error);

    return false;
  }
};

const startBackgroundTracking = async () => {
  if (Platform.OS === 'web') return;

  const foreground = await Location.getForegroundPermissionsAsync();

  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    await setLastUploadError(
      'Foreground location permission is required before background tracking',
    );

    logLocation('Permission denied', {
      permission: 'foreground-before-background',
      status: foreground.status,
      canAskAgain: foreground.canAskAgain,
    });

    return;
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  if (background.status !== Location.PermissionStatus.GRANTED) {
    await setLastUploadError(
      'Background location permission denied. Please allow location permission all the time.',
    );

    logLocation('Permission denied', {
      permission: 'background',
      status: background.status,
      canAskAgain: background.canAskAgain,
    });

    return;
  }

  const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
    SALESMAN_BACKGROUND_LOCATION_TASK,
  );

  if (alreadyStarted) {
    logLocation('Background task already running');
    return;
  }

  const baseOptions: Location.LocationTaskOptions = {
    accuracy: Location.Accuracy.BestForNavigation,
    activityType: Location.ActivityType.AutomotiveNavigation,
    timeInterval: BACKGROUND_TRACKING_INTERVAL_MS,
    distanceInterval: BACKGROUND_TRACKING_DISTANCE_METERS,
    deferredUpdatesInterval: BACKGROUND_TRACKING_INTERVAL_MS,
    deferredUpdatesDistance: BACKGROUND_TRACKING_DISTANCE_METERS,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
  };

  const androidOptions: Location.LocationTaskOptions = {
    ...baseOptions,
    foregroundService: {
      notificationTitle: 'Sales Stream live location active',
      notificationBody: 'Your live location is shared while your work day is active.',
      killServiceOnDestroy: false,
    },
  };

  await Location.startLocationUpdatesAsync(
    SALESMAN_BACKGROUND_LOCATION_TASK,
    Platform.OS === 'android' ? androidOptions : baseOptions,
  );

  const started = await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);

  logLocation('Background task start result', {
    started,
    platform: Platform.OS,
    intervalMs: BACKGROUND_TRACKING_INTERVAL_MS,
    distanceMeters: BACKGROUND_TRACKING_DISTANCE_METERS,
  });
};

const performStartSalesmanBackgroundLocation = async (user?: LocationOwner) => {
  if (!isSalesman(user)) {
    console.warn('[Location] Unable to start live location: current user is not a salesman');
    return;
  }

  const activeSessionId = await getActiveSessionId();

  if (!activeSessionId) {
    console.warn('[Location] Unable to start background location: no active work session');
    return;
  }

  await storage.setItem(ACTIVE_LOCATION_SESSION_KEY, activeSessionId);

  startConnectivitySync();

  /**
   * Android battery optimization can stop background tracking after a few minutes.
   * Ask the user to set the app to Unrestricted when live tracking starts.
   */
  safeRun(requestBatteryOptimizationPermission(), 'Battery optimization prompt check failed');

  if (Platform.OS === 'web') {
    startWebLocationTracking();
    return;
  }

  try {
    const foreground = await Location.requestForegroundPermissionsAsync();

    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      logLocation('Permission denied', {
        permission: 'foreground',
        status: foreground.status,
        canAskAgain: foreground.canAskAgain,
      });

      return;
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      logLocation('GPS disabled');
      return;
    }

    await connectLocationSocket();

    /**
     * Platform background strategy:
     * Android: use native ForegroundService only. It captures GPS and sends
     *          socket first, then HTTP fallback from Kotlin. Expo background
     *          is intentionally disabled on Android to avoid duplicate points.
     *
     * iOS: use Expo/CoreLocation background updates. iOS does not reliably
     *      keep a Socket.IO connection alive in background, so this JS flow
     *      tries socket when available and then HTTP fallback. Your backend
     *      should emit manager socket updates after HTTP receives a location.
     */
    if (Platform.OS === 'android') {
      await startNativeAndroidBackgroundTracking(activeSessionId);
    } else if (Platform.OS === 'ios') {
      await startBackgroundTracking();
    }

    /**
     * Foreground tracking is still useful while the app is open.
     * When app goes background, startLocationLifecycle() stops this watcher
     * to avoid duplicate callbacks. Native/Expo background continues.
     */
    await startForegroundTracking();

    startLocationLifecycle(activeSessionId);

    safeRun(syncPendingLocationUploads(), 'Pending location sync failed');
    safeRun(syncNativePendingLocationUploads(), 'Native pending location sync failed');

    safeRun(
      captureCurrentLocation({ preferCached: false }).then((location) => {
        if (location) return queueLocation(location, activeSessionId);
      }),
      'Initial location capture failed',
    );

    // await debugLocationTrackingStatus();
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

    locationDeliveryQueue = [];

    acceptedLocationKeys.clear();
    lastAcceptedLocation = null;

    if (Platform.OS === 'android' && isNativeLocationAvailable()) {
      try {
        await stopNativeBackgroundLocation();
        nativeBackgroundTrackingStarted = false;
        logLocation('Native background tracking stopped');
      } catch (nativeStopError) {
        console.warn('[Location] Unable to stop native background tracking:', nativeStopError);
      }
    }

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
    trackingRunning:
      foregroundTrackingRunning || backgroundTaskRunning || nativeBackgroundTrackingStarted,
    foregroundTrackingRunning,
    backgroundTaskRunning,
    nativeLocationAvailable: isNativeLocationAvailable(),
    nativeBackgroundTrackingStarted,
    lastLocationAge: lastLocation
      ? Math.max(0, Date.now() - new Date(lastLocation.capturedAt).getTime())
      : null,
    lastLocationAccuracy: lastLocation?.accuracy ?? null,
    pendingUploadCount,
    queueLength: locationDeliveryQueue.length,
    socketConnected: locationSocket?.connected === true,
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
    foregroundTrackingRunning: diagnostics.foregroundTrackingRunning,
    backgroundTaskRunning: diagnostics.backgroundTaskRunning,
    nativeLocationAvailable: diagnostics.nativeLocationAvailable,
    nativeBackgroundTrackingStarted: diagnostics.nativeBackgroundTrackingStarted,
  };
};
