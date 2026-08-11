import * as Application from 'expo-application';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Linking, Platform } from 'react-native';

import { storage } from '@/core/storage';

const BATTERY_OPTIMIZATION_PROMPTED_KEY = 'battery_optimization_prompted';

const ANDROID_SETTINGS_ACTIONS = {
  REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: 'android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
  IGNORE_BATTERY_OPTIMIZATION_SETTINGS: 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS',
  APPLICATION_DETAILS_SETTINGS: 'android.settings.APPLICATION_DETAILS_SETTINGS',
};

export const resetBatteryOptimizationPromptAsync = async () => {
  await storage.removeItem(BATTERY_OPTIMIZATION_PROMPTED_KEY);
};

export const requestIgnoreBatteryOptimizationsAsync = async () => {
  if (Platform.OS !== 'android') return;

  const packageName = Application.applicationId;

  if (!packageName) {
    Alert.alert(
      'Battery Permission Required',
      'Please open app settings and set Battery usage to Unrestricted.',
    );
    return;
  }

  try {
    await IntentLauncher.startActivityAsync(
      ANDROID_SETTINGS_ACTIONS.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
      {
        data: `package:${packageName}`,
      },
    );
  } catch (error) {
    console.warn('[Battery] Direct optimization request failed:', error);

    try {
      await IntentLauncher.startActivityAsync(
        ANDROID_SETTINGS_ACTIONS.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
      );
    } catch (settingsError) {
      console.warn('[Battery] Battery settings open failed:', settingsError);

      Alert.alert(
        'Battery Permission Required',
        'Please open App Info → Battery → set Sales Stream to Unrestricted.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open App Settings',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
    }
  }
};

export const showBatteryOptimizationHelp = async (
  options: {
    force?: boolean;
  } = {},
) => {
  if (Platform.OS !== 'android') return;

  const alreadyPrompted = await storage.getItem(BATTERY_OPTIMIZATION_PROMPTED_KEY);

  /**
   * Show only once by default.
   * Pass { force: true } from a debug/settings button if you want to show again.
   */
  if (!options.force && alreadyPrompted === 'true') return;

  await storage.setItem(BATTERY_OPTIMIZATION_PROMPTED_KEY, 'true');

  Alert.alert(
    'Allow Background Tracking',
    'For reliable live location tracking, please set Sales Stream battery usage to Unrestricted and allow background activity.',
    [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          void requestIgnoreBatteryOptimizationsAsync();
        },
      },
    ],
  );
};
