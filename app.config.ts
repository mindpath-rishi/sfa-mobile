import 'dotenv/config';

export default ({ config }: any) => {
  console.log(process.env.EXPO_PUBLIC_API_URL); // ✅ Logs the correct value at build time
  return {
    ...config,

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/sales-stream-splash.png',
          resizeMode: 'cover',
          backgroundColor: '#FFFFFF',
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
          locationAlwaysAndWhenInUsePermission:
            'Allow Sales Stream to capture salesman location while the work day is active.',
          locationAlwaysPermission:
            'Allow Sales Stream to capture salesman location while the work day is active.',
          locationWhenInUsePermission:
            'Allow Sales Stream to capture your location for day and visit tracking.',
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      //   {
      //     locationAlwaysAndWhenInUsePermission:
      //       'Allow $(PRODUCT_NAME) to use your location for route optimization.',
      //   },
    ],

    name: 'Sales Stream',
    slug: 'expo-jwt-tabs-template-ultimate',
    scheme: 'expojwttabsultimate',
    version: '1.0.0',
    icon: './assets/images/sales-stream-logo.png',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/Sales Stream-splash.png',
      resizeMode: 'cover',
      backgroundColor: '#FFFFFF',
    },

    jsEngine: 'hermes', // ✅ FIX: prevents Hermes web transform issues
    // web: {
    //   bundler: "metro",
    // },

    android: {
      softwareKeyboardLayoutMode: 'resize',
      package: 'com.salesstream.app',
      versionCode: 2,
      adaptiveIcon: {
        foregroundImage: './assets/images/sales-stream-logo.png',
        backgroundColor: '#FFFFFF',
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: [
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
      ],
    },

    ios: {
      bundleIdentifier: 'com.salesstream.app',
      icon: './assets/images/sales-stream-logo.png',
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist',
      config: {
        googleMapsApiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        UIBackgroundModes: ['location'],
      },
    },

    extra: {
      localization: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi', 'ur', 'ar'],
        rtlLanguages: ['ur', 'ar'],
      },
      api: {
        baseURL: process.env.EXPO_PUBLIC_API_URL,
      },
    },
    // expo: {
    //   androidNavigationBar: {
    //     // backgroundColor: '#ff0000',
    //     barStyle: 'dark-content',
    //   },
    // },
  };
};
