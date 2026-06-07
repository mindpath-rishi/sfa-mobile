import { Platform } from 'react-native';
import * as Application from 'expo-application';

export const getClientDeviceIdAsync = async () => {
  if (Platform.OS === 'web') return 'web-device';
  if (Platform.OS === 'android') return Application.getAndroidId() ?? 'android-device';

  return (await Application.getIosIdForVendorAsync()) ?? 'ios-device';
};

