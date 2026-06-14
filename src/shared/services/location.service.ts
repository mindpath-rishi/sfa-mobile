import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

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

const postBackgroundLocation = async (location: CapturedLocation, workSessionId?: string) => {
  const token = await getAccessToken();
  if (!token) return;

  await fetch(`${getApiBaseUrl()}/work-session/location`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workSessionId,
      source: 'BACKGROUND',
      location,
    }),
  });
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
  if (Platform.OS === 'web' || !isSalesmanUser(user)) return;

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
  if (Platform.OS === 'web') return;

  try {
    const started = await Location.hasStartedLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);
    if (started) {
      await Location.stopLocationUpdatesAsync(SALESMAN_BACKGROUND_LOCATION_TASK);
    }
  } catch (error) {
    console.warn('Unable to stop background location:', error);
  }
};
