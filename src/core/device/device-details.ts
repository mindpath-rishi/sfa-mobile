/**
 * Hardware / build details sent with every login (stored per user + device
 * and in the login history). Every field is best effort.
 */
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import * as Network from 'expo-network';
import { Dimensions, Platform } from 'react-native';

const safe = async <T>(read: () => Promise<T> | T): Promise<T | undefined> => {
  try {
    return await read();
  } catch {
    return undefined;
  }
};

export const getDeviceDetails = async () => {
  const screen = Dimensions.get('screen');
  const [isRooted, network] = await Promise.all([
    Platform.OS === 'web' ? undefined : safe(() => Device.isRootedExperimentalAsync()),
    safe(() => Network.getNetworkStateAsync()),
  ]);
  const locale = safe(() => Localization.getLocales()[0]?.languageTag);
  const timezone = safe(() => Localization.getCalendars()[0]?.timeZone ?? undefined);

  const details = {
    brand: Device.brand ?? undefined,
    manufacturer: Device.manufacturer ?? undefined,
    modelName: Device.modelName ?? undefined,
    modelId: Device.modelId ?? undefined,
    deviceName: Device.deviceName ?? undefined,
    osBuildId: Device.osBuildId ?? undefined,
    totalMemoryMb: Device.totalMemory ? Math.round(Device.totalMemory / (1024 * 1024)) : undefined,
    isPhysicalDevice: Platform.OS === 'web' ? undefined : Device.isDevice,
    isRooted: isRooted ?? undefined,
    appBuildVersion: Application.nativeBuildVersion ?? undefined,
    applicationId: Application.applicationId ?? undefined,
    locale: (await locale) ?? undefined,
    timezone: (await timezone) ?? undefined,
    screenWidth: Math.round(screen.width * screen.scale),
    screenHeight: Math.round(screen.height * screen.scale),
    networkType: network?.type ? String(network.type) : undefined,
    userAgent:
      Platform.OS === 'web' && typeof navigator !== 'undefined'
        ? navigator.userAgent.slice(0, 300)
        : undefined,
  };
  // Drop empty values (the server validates types)
  return Object.fromEntries(
    Object.entries(details).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
};
