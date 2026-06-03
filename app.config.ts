import 'dotenv/config';

export default ({ config }: any) => {
  console.log(process.env.EXPO_PUBLIC_API_URL); // ✅ Logs the correct value at build time
  return {
    ...config,

    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-localization',
      'expo-mail-composer',
      'expo-web-browser',
      'expo-sqlite',
      'expo-location',
      //   {
      //     locationAlwaysAndWhenInUsePermission:
      //       'Allow $(PRODUCT_NAME) to use your location for route optimization.',
      //   },
    ],

    name: 'SFA',
    slug: 'expo-jwt-tabs-template-ultimate',
    scheme: 'expojwttabsultimate',
    version: '2.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',

    jsEngine: 'hermes', // ✅ FIX: prevents Hermes web transform issues
    // web: {
    //   bundler: "metro",
    // },

    android: {
      softwareKeyboardLayoutMode: 'resize',
      package: 'com.anonymous.expojwttabstemplateultimate',
    },

    ios: {
      bundleIdentifier: 'com.anonymous.expojwttabstemplateultimate',
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
