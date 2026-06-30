import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { isOfflineMode } from '@/core/offline/offline.store';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

import { getAccessToken } from './tokenStorage';

export const SALESMAN_BACKGROUND_LOCATION_TASK = 'salesman-background-location';

export type CapturedLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  capturedAt: string;
};

type LocationTaskData = {
  locations?: Location.LocationObject[];
};

let webLocationWatchId: number | null = null;
let lastWebLocation: CapturedLocation | null = null;

const WEB_LOCATION_INTERVAL_MS = 60_000;
const WEB_LOCATION_DISTANCE_METERS = 100;

const getApiBaseUrl = () => {
  const extra = Constants.expoConfig?.extra as { api?: { baseURL?: string } } | undefined;
  return extra?.api?.baseURL || 'https://order.tradekings.app:4001/api/v1';
};

const toCapturedLocation = (location: Location.LocationObject): CapturedLocation => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy,
  altitude: location.coords.altitude,
  speed: location.coords.speed,
  capturedAt: new Date(location.timestamp).toISOString(),
});

const isSalesmanUser = (user?: {
  role?: string;
  roleId?: string;
  designation?: string;
  employeeName?: string;
  name?: string;
} | null) => {
  const label = [user?.role, user?.roleId, user?.designation, user?.employeeName, user?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  return label.includes('salesman') || label.includes('sales executive');
};

const saveBackgroundLocationOffline = async (
  location: CapturedLocation,
  workSessionId?: string,
) => {
  const { user, workSessionId: storedWorkSessionId } = useAuthStore.getState();
  const sessionId = workSessionId || storedWorkSessionId || undefined;
  const ownerId = user?.userId ?? '';
  if (!ownerId || !sessionId) return;

  const existing = await repositories.attendance.findById(ownerId, sessionId);
  const previousLocations = Array.isArray(existing?.backgroundLocations)
    ? existing.backgroundLocations
    : [];
  const backgroundLocations = [...previousLocations, location].slice(-1000);

  if (existing) {
    await repositories.attendance.update(ownerId, existing.uuid, {
      backgroundLocations,
    });
    return;
  }

  await repositories.attendance.create(ownerId, {
    uuid: sessionId,
    workSessionId: sessionId,
    userId: ownerId,
    vanId: user?.vanId,
    status: 'ACTIVE',
    backgroundLocations,
  });
};

const postBackgroundLocation = async (location: CapturedLocation, workSessionId?: string) => {
  if (isOfflineMode()) {
    await saveBackgroundLocationOffline(location, workSessionId);
    return;
  }

  const token = await getAccessToken();
  if (!token) {
    await saveBackgroundLocationOffline(location, workSessionId);
    return;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/work-session/location`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workSessionId: workSessionId || useAuthStore.getState().workSessionId,
        source: 'BACKGROUND',
        location,
      }),
    });

    if (!response.ok) throw new Error(`Location upload failed (${response.status})`);
  } catch {
    await saveBackgroundLocationOffline(location, workSessionId);
  }
};

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
        capturedAt: new Date(position.timestamp).toISOString(),
      };

      const lastCapturedAt = lastWebLocation
        ? new Date(lastWebLocation.capturedAt).getTime()
        : Number.NEGATIVE_INFINITY;
      const intervalReached = position.timestamp - lastCapturedAt >= WEB_LOCATION_INTERVAL_MS;
      const distanceReached =
        !!lastWebLocation &&
        distanceInMeters(lastWebLocation, location) >= WEB_LOCATION_DISTANCE_METERS;

      if (!lastWebLocation || intervalReached || distanceReached) {
        lastWebLocation = location;
        void postBackgroundLocation(location).catch((error) =>
          console.warn('Unable to send browser location:', error),
        );
      }
    },
    (error) => console.warn('Browser location tracking error:', error.message),
    {
      enableHighAccuracy: true,
      maximumAge: 15_000,
      timeout: 30_000,
    },
  );
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
        console.warn('Background location task error:', error);
        return;
      }

      const locations = data?.locations || [];
      await Promise.all(
        locations.map((location) => postBackgroundLocation(toCapturedLocation(location))),
      );
    },
  );
}

export const captureCurrentLocation = async (): Promise<CapturedLocation | undefined> => {
  try {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) return undefined;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return toCapturedLocation(location);
  } catch (error) {
    console.warn('Unable to capture current location:', error);
    return undefined;
  }
};

export const startSalesmanBackgroundLocation = async (
  user: Parameters<typeof isSalesmanUser>[0],
) => {
  if (!isSalesmanUser(user)) return;

  if (Platform.OS === 'web') {
    startWebLocationTracking();
    return;
  }

  try {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) return;

    const background = await Location.requestBackgroundPermissionsAsync();
    if (background.status !== Location.PermissionStatus.GRANTED) return;

    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
      SALESMAN_BACKGROUND_LOCATION_TASK,
    );

    if (alreadyStarted) return;

    await Location.startLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000,
      distanceInterval: 100,
      pausesUpdatesAutomatically: true,
      showsBackgroundLocationIndicator: false,
      foregroundService: {
        notificationTitle: 'SFA location active',
        notificationBody: 'Location is captured while your day is active.',
      },
    });
  } catch (error) {
    console.warn('Unable to start background location:', error);
  }
};

export const stopSalesmanBackgroundLocation = async () => {
  if (Platform.OS === 'web') {
    stopWebLocationTracking();
    return;
  }

  try {
    const started = await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);
    if (started) {
      await Location.stopLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);
    }
  } catch (error) {
    console.warn('Unable to stop background location:', error);
  }
};
