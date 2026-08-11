import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

import { getAccessToken } from './tokenStorage';

type StartNativeLocationOptions = {
  workSessionId: string;
  intervalMs?: number;
  distanceMeters?: number;
};

type SalesStreamLocationModule = {
  startNativeTracking: (options: {
    token: string;
    workSessionId: string;
    baseUrl: string;
    intervalMs: number;
    distanceMeters: number;
    notificationTitle: string;
    notificationBody: string;
  }) => Promise<boolean>;
  stopNativeTracking: () => Promise<boolean>;
  syncPendingNativeLocations: () => Promise<boolean>;
};

const nativeModule = NativeModules.SalesStreamLocation as SalesStreamLocationModule | undefined;

const getApiBaseUrl = () => {
  const extra = Constants.expoConfig?.extra as { api?: { baseURL?: string } } | undefined;
  return extra?.api?.baseURL || 'https://order.tradekings.app:4001/api/v1';
};

export const isNativeLocationAvailable = () => Platform.OS === 'android' && !!nativeModule;

export const startNativeBackgroundLocation = async ({
  workSessionId,
  intervalMs = 1000,
  distanceMeters = 1,
}: StartNativeLocationOptions) => {
  if (!isNativeLocationAvailable()) return false;

  const token = await getAccessToken();

  if (!token || !workSessionId) return false;

  return nativeModule!.startNativeTracking({
    token,
    workSessionId,
    baseUrl: getApiBaseUrl(),
    intervalMs,
    distanceMeters,
    notificationTitle: 'Sales Stream live location active',
    notificationBody: 'Your live location is shared while your work day is active.',
  });
};

export const stopNativeBackgroundLocation = async () => {
  if (!isNativeLocationAvailable()) return false;
  return nativeModule!.stopNativeTracking();
};

export const syncNativePendingLocationUploads = async () => {
  if (!isNativeLocationAvailable()) return false;
  return nativeModule!.syncPendingNativeLocations();
};
