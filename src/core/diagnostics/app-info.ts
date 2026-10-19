import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/** Version the server compares against the minimum set in MIS. */
export const APP_VERSION =
  Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '0.0.0';

export const APP_BUILD = Application.nativeBuildVersion ?? '';

export const DEVICE_INFO = {
  platform: Platform.OS,
  osVersion: Device.osVersion ?? String(Platform.Version ?? ''),
  deviceModel: [Device.manufacturer, Device.modelName].filter(Boolean).join(' ') || 'unknown',
};
