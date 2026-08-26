import type { Router } from 'expo-router';

export const setupNotificationChannelAsync = async () => {};

export const isPushNotificationsEnabledAsync = async () => false;

export const setPushNotificationsEnabledAsync = async (_enabled: boolean) => {};

export const getPushNotificationTokenAsync = async (): Promise<string | null> => null;

export const addNotificationResponseListener = (_router: Router) => () => undefined;

export const addFirebaseNotificationListeners = (_router: Router) => () => undefined;

export const addPushTokenRefreshListener = (
  _listener: (token: string) => void | Promise<void>,
) => () => undefined;

export const setupBackgroundMessageHandler = () => {};
