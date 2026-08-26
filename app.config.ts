import 'dotenv/config';
import { withAndroidManifest, AndroidConfig } from 'expo/config-plugins';
import packageJson from './package.json';

/**
 * ML Kit's face-detection model ships via Google Play Services' unbundled/dynamic
 * delivery. Without this manifest entry, Play Services only fetches the model lazily
 * on first use, so `detectFaces` can fail (or hang) on real devices until it finishes
 * downloading in the background.
 * https://developers.google.com/ml-kit/vision/face-detection/android#include_dependencies
 *
 * `expo-camera`'s own manifest already declares this same meta-data with `barcode_ui`
 * (for its barcode scanning feature), so this must declare BOTH models (comma-separated)
 * and force-override via `tools:replace`, otherwise the Android manifest merger fails
 * with a hard conflict between the two declared values.
 */
const withMlkitFaceDetectionDependency = (config: any) =>
  withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    mainApplication['meta-data'] = mainApplication['meta-data'] || [];

    const metaDataName = 'com.google.mlkit.vision.DEPENDENCIES';
    const metaDataValue = 'barcode_ui,face';
    const existing = mainApplication['meta-data'].find(
      (item: any) => item.$['android:name'] === metaDataName,
    );

    if (existing) {
      existing.$['android:value'] = metaDataValue;
      existing.$['tools:replace'] = 'android:value';
    } else {
      mainApplication['meta-data'].push({
        $: {
          'android:name': metaDataName,
          'android:value': metaDataValue,
          'tools:replace': 'android:value',
        },
      });
    }

    return config;
  });

const apiBaseURL = process.env.EXPO_PUBLIC_API_URL || 'https://order.tradekings.app:4001/api/v1';

const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export default ({ config }: any) => {
  console.log('EXPO_PUBLIC_API_URL:', apiBaseURL);

  const expoConfig = {
    ...config,

    name: 'Sales Stream',
    slug: 'expo-jwt-tabs-template-ultimate',
    scheme: 'expojwttabsultimate',
    version: '1.0.1',
    icon: './assets/images/sales-stream-logo.png',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    jsEngine: 'hermes',

    plugins: [
      'expo-router',

      [
        'expo-splash-screen',
        {
          image: './assets/images/sales-stream-splash.png',
          imageWidth: 941,
          resizeMode: 'cover',
          backgroundColor: '#0B46F6',
        },
      ],

      'expo-secure-store',
      'expo-localization',
      'expo-mail-composer',
      'expo-notifications',
      'expo-web-browser',
      'expo-sqlite',

      [
        'expo-location',
        {
          /**
           * iOS permission text
           */
          locationWhenInUsePermission:
            'Allow Sales Stream to capture your location for day and visit tracking.',
          locationAlwaysAndWhenInUsePermission:
            'Allow Sales Stream to capture salesman location in the background while the work day is active.',

          /**
           * Older iOS permission key kept for compatibility.
           */
          locationAlwaysPermission:
            'Allow Sales Stream to capture salesman location in the background while the work day is active.',

          /**
           * Required for iOS/CoreLocation background tracking.
           */
          isIosBackgroundLocationEnabled: true,

          /**
           * Required for Android background location.
           * Even if Android now uses native Kotlin tracking, keep this enabled
           * because Expo foreground/background fallback can still be used.
           */
          isAndroidBackgroundLocationEnabled: true,

          /**
           * Required for Android foreground-service location notification.
           */
          isAndroidForegroundServiceEnabled: true,
        },
      ],

      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
    ],

    android: {
      softwareKeyboardLayoutMode: 'resize',
      package: 'com.salesstream.app',
      versionCode: 6,

      adaptiveIcon: {
        foregroundImage: './assets/images/sales-stream-logo.png',
        backgroundColor: '#FFFFFF',
      },

      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',

      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },

      permissions: [
        /**
         * Network
         */
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',

        /**
         * Notification permission for Android 13+.
         * Required for visible foreground-service notification.
         */
        'android.permission.POST_NOTIFICATIONS',

        /**
         * Foreground location
         */
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',

        /**
         * Background location
         */
        'android.permission.ACCESS_BACKGROUND_LOCATION',

        /**
         * Required for Android foreground service.
         */
        'android.permission.FOREGROUND_SERVICE',

        /**
         * Required for Android 14+ location foreground service type.
         */
        'android.permission.FOREGROUND_SERVICE_LOCATION',

        /**
         * Used to open/request battery optimization exemption screen.
         */
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',

        /**
         * Helps app know network changes for pending location sync.
         */
        'android.permission.CHANGE_NETWORK_STATE',
      ],
    },

    ios: {
      bundleIdentifier: 'com.salesstream.app',
      icon: './assets/images/sales-stream-logo.png',

      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',

      config: {
        googleMapsApiKey: googleMapsApiKey,
      },

      infoPlist: {
        /**
         * Required for iOS background location updates.
         * Do not use only "fetch" for live location; "location" is the important one.
         */
        UIBackgroundModes: ['location'],

        /**
         * Required by react-native-vision-camera (used for the live face-detection
         * selfie capture flow).
         */
        NSCameraUsageDescription: 'Allow Sales Stream to use the camera to capture your selfie.',

        NSLocationWhenInUseUsageDescription:
          'Allow Sales Stream to capture your location for day and visit tracking.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Allow Sales Stream to capture salesman location in the background while the work day is active.',
        NSLocationAlwaysUsageDescription:
          'Allow Sales Stream to capture salesman location in the background while the work day is active.',

        /**
         * Optional but useful if your app needs temporary precise location.
         * Safe to keep; iOS may show this reason when requesting precise location.
         */
        NSLocationTemporaryUsageDescriptionDictionary: {
          SalesStreamLiveTracking:
            'Sales Stream needs precise location while the work day is active for live route tracking.',
        },
      },
    },

    extra: {
      localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi', 'ur', 'ar'],
        rtlLanguages: ['ur', 'ar'],
      },

      api: {
        baseURL: apiBaseURL,
      },

      /**
       * Keep these available to app code if needed.
       */
      googleMapsApiKey,
    },
  };

  return withMlkitFaceDetectionDependency(expoConfig);
};
