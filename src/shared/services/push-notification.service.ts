import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { Router } from 'expo-router';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  setBackgroundMessageHandler,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

type NotificationRouteData = {
  url?: unknown;
  route?: unknown;
};

const ANDROID_CHANNEL_ID = 'default';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const messaging = () => getMessaging(getApp());

const normalizeData = (data?: Record<string, unknown>) => {
  if (!data) return {};

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value ?? ''),
    ]),
  );
};

const getNotificationTarget = (
  data?: NotificationRouteData | FirebaseMessagingTypes.RemoteMessage['data'],
) => {
  const target = data?.url ?? data?.route;

  return typeof target === 'string' && target.startsWith('/') ? target : null;
};

const navigateFromRemoteMessage = (
  router: Router,
  message: FirebaseMessagingTypes.RemoteMessage | null,
) => {
  const target = getNotificationTarget(message?.data);

  if (target) {
    router.push(target as never);
  }
};

export const setupNotificationChannelAsync = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563EB',
  });
};

export const getPushNotificationTokenAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'web' || !Device.isDevice) return null;

  await setupNotificationChannelAsync();
  await Notifications.requestPermissionsAsync();

  const permission = await requestPermission(messaging());
  const enabled =
    permission === AuthorizationStatus.AUTHORIZED ||
    permission === AuthorizationStatus.PROVISIONAL;

  if (!enabled) return null;

  try {
    await registerDeviceForRemoteMessages(messaging());

    return getToken(messaging());
  } catch (error) {
    console.warn('FCM token registration failed:', error);
    return null;
  }
};

export const addNotificationResponseListener = (router: Router) => {
  const navigateFromResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationRouteData;
    const target = data.url ?? data.route;

    if (typeof target === 'string' && target.startsWith('/')) {
      router.push(target as never);
    }
  };

  const subscription = Notifications.addNotificationResponseReceivedListener(navigateFromResponse);

  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) navigateFromResponse(response);
    })
    .catch((error) => console.warn('Failed to read initial notification response:', error));

  return () => {
    subscription.remove();
  };
};

export const addFirebaseNotificationListeners = (router: Router) => {
  if (Platform.OS === 'web') return () => undefined;

  const unsubscribeForeground = onMessage(messaging(), async (message) => {
    await setupNotificationChannelAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.notification?.title ?? 'Notification',
        body: message.notification?.body ?? '',
        data: normalizeData(message.data),
      },
      trigger: null,
    });
  });

  const unsubscribeOpened = onNotificationOpenedApp(messaging(), (message) => {
    navigateFromRemoteMessage(router, message);
  });

  getInitialNotification(messaging())
    .then((message) => navigateFromRemoteMessage(router, message))
    .catch((error) => console.warn('Failed to read initial FCM notification:', error));

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
  };
};

export const addPushTokenRefreshListener = (listener: (token: string) => void | Promise<void>) =>
  Platform.OS === 'web' ? () => undefined : onTokenRefresh(messaging(), listener);

export const setupBackgroundMessageHandler = () => {
  if (Platform.OS === 'web') return;

  setBackgroundMessageHandler(messaging(), async () => undefined);
};
