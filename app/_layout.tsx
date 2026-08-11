import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useRootNavigationState, useSegments } from 'expo-router';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import Toast from 'react-native-toast-message';

import ThemeProvider from '@/shared/providers/ThemeProvider';
import { AppProviders } from '@/shared/providers/AppProviders';
import { FilterProvider } from '@/shared/contexts/FilterContext';
import { HeaderProvider } from '@/shared/contexts/HeaderContext';

import { useThemeStore } from '@/core/store/theme.store';
import { useLanguageStore } from '@/core/store/language.store';
import { useAuthStore } from '@/core/store/auth.store';
import { useCartStore } from '@/core/store/cart.store';
import { useRouteStore } from '@/core/store/route.store';
import { useGlobalErrorStore } from '@/core/store/error.store';

import AppErrorScreen from '@/core/screens/error/Error';
import LoaderOverlay from '@/core/screens/LoaderOverlay';
import { useTheme } from '@/shared/hooks/useTheme';

import {
  addFirebaseNotificationListeners,
  addNotificationResponseListener,
  addPushTokenRefreshListener,
  getPushNotificationTokenAsync,
  isPushNotificationsEnabledAsync,
  setupNotificationChannelAsync,
  setupBackgroundMessageHandler,
} from '@/shared/services/push-notification.service';

import { authService } from '@/features/auth/services/auth.service';
import { getClientDeviceIdAsync } from '@/shared/services/device.service';

import {
  debugLocationTrackingStatus,
  startSalesmanBackgroundLocation,
  syncPendingLocationUploads,
} from '@/shared/services/location.service';

import {
  initialiseOffline,
  OfflineSyncGate,
  subscribeToOfflineSync,
  syncOfflineQueue,
} from '@/core/offline';

setupBackgroundMessageHandler();

export default function RootLayout() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const segments = useSegments();

  const locationStartInProgressRef = useRef(false);
  const lastLocationStartAtRef = useRef(0);

  /* ======================================================
   * STORES
   * ====================================================== */

  const { hydrate: hydrateTheme, hydrated: themeHydrated } = useThemeStore();
  const { hydrate: hydrateLanguage, hydrated: languageHydrated } = useLanguageStore();

  const { hydrate: hydrateAuth, isHydrated: authHydrated, accessToken: token } = useAuthStore();
  const hydrateCart = useCartStore((state) => state.hydrate);
  const hydrateRoute = useRouteStore((state) => state.hydrate);

  const authUser = useAuthStore((state) => state.user);
  const workSessionId = useAuthStore((state) => state.workSessionId);

  const errorType = useGlobalErrorStore((state) => state.type);
  const clearError = useGlobalErrorStore((state) => state.clear);

  const { colors, isDark } = useTheme();

  /* ======================================================
   * HYDRATION
   * ====================================================== */

  useEffect(() => {
    hydrateTheme();
    hydrateLanguage();
    hydrateAuth();
  }, [hydrateTheme, hydrateLanguage, hydrateAuth]);

  /* ======================================================
   * OFFLINE INITIALIZATION
   * ====================================================== */

  useEffect(() => {
    void initialiseOffline();

    const subscription = subscribeToOfflineSync();

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!authHydrated || !authUser?.userId) return;

    void (async () => {
      await hydrateRoute(authUser.userId);
      await hydrateCart();
    })();
    void initialiseOffline();
  }, [authHydrated, authUser?.userId, hydrateCart, hydrateRoute]);

  useEffect(() => {
    if (!token) return;

    void syncOfflineQueue();

    const timer = setInterval(() => {
      void syncOfflineQueue();
    }, 5 * 60_000);

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncOfflineQueue();
      }
    });

    return () => {
      clearInterval(timer);
      appStateSubscription.remove();
    };
  }, [token]);

  /* ======================================================
   * LOCATION TRACKING RECOVERY
   * ====================================================== */

  useEffect(() => {
    if (!authHydrated || !token || !authUser) return;

    const resumeLocationTracking = async () => {
      /**
       * Prevent duplicate native start calls.
       * AppState can fire multiple active events quickly.
       */
      if (locationStartInProgressRef.current) return;

      const now = Date.now();

      /**
       * Throttle repeated start attempts.
       */
      if (now - lastLocationStartAtRef.current < 10_000) return;

      locationStartInProgressRef.current = true;
      lastLocationStartAtRef.current = now;

      try {
        await startSalesmanBackgroundLocation(authUser);
        await syncPendingLocationUploads();

        if (__DEV__) {
          await debugLocationTrackingStatus();
        }
      } catch (error) {
        console.warn('[RootLayout] Location tracking resume failed:', error);
      } finally {
        locationStartInProgressRef.current = false;
      }
    };

    void resumeLocationTracking();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void resumeLocationTracking();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [
    authHydrated,
    token,
    authUser?.userId,
    authUser?.employeeId,
    authUser?.role,
    authUser?.roleId,
    workSessionId,
  ]);

  /* ======================================================
   * NOTIFICATION SETUP
   * ====================================================== */

  useEffect(() => {
    setupNotificationChannelAsync().catch((error) =>
      console.warn('Notification channel setup failed:', error),
    );
  }, []);

  useEffect(() => {
    return addNotificationResponseListener(router);
  }, [router]);

  useEffect(() => {
    return addFirebaseNotificationListeners(router);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const syncPushToken = async () => {
      try {
        if (!(await isPushNotificationsEnabledAsync())) return;

        const fcmToken = await getPushNotificationTokenAsync();

        if (!fcmToken || cancelled) return;

        await authService.updatePushToken({
          deviceId: await getClientDeviceIdAsync(),
          fcmToken,
        });
      } catch (error) {
        console.warn('Push token sync failed:', error);
      }
    };

    void syncPushToken();

    const unsubscribeTokenRefresh = addPushTokenRefreshListener(async (fcmToken) => {
      try {
        if (!(await isPushNotificationsEnabledAsync())) return;

        await authService.updatePushToken({
          deviceId: await getClientDeviceIdAsync(),
          fcmToken,
        });
      } catch (error) {
        console.warn('Push token refresh sync failed:', error);
      }
    });

    return () => {
      cancelled = true;
      unsubscribeTokenRefresh();
    };
  }, [token]);

  /* ======================================================
   * NAVIGATION BAR - ANDROID
   * ====================================================== */

  useEffect(() => {
    if (Platform.OS === 'android' && themeHydrated) {
      NavigationBar.setBackgroundColorAsync(colors.background + '00').catch((error) =>
        console.error('NavBar BG error:', error),
      );
    }
  }, [themeHydrated, colors.background]);

  useEffect(() => {
    if (Platform.OS === 'android' && themeHydrated) {
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark').catch((error) =>
        console.error('NavBar Style error:', error),
      );
    }
  }, [isDark, themeHydrated]);

  /* ======================================================
   * AUTH REDIRECT
   * ====================================================== */

  useEffect(() => {
    if (!navigationState?.key) return;

    if (!themeHydrated || !languageHydrated || !authHydrated) return;

    const currentToken = useAuthStore.getState().accessToken;
    const currentGroup = segments[0];
    const isAuthRoute = currentGroup === '(auth)';

    if (!currentToken && !isAuthRoute) {
      router.replace('/(auth)');
    } else if (currentToken && isAuthRoute) {
      router.replace('/(drawer)/(tabs)/home');
    }
  }, [
    navigationState?.key,
    themeHydrated,
    languageHydrated,
    authHydrated,
    token,
    segments,
    router,
  ]);

  /* ======================================================
   * LOADING STATE
   * ====================================================== */

  if (!themeHydrated || !languageHydrated || !authHydrated) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  /* ======================================================
   * ERROR STATE
   * ====================================================== */

  if (errorType) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <AppErrorScreen type={errorType} onRetry={clearError} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  /* ======================================================
   * MAIN APP
   * ====================================================== */

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProviders>
          <FilterProvider>
            <HeaderProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(drawer)" />
              </Stack>
            </HeaderProvider>

            <OfflineSyncGate />
            <LoaderOverlay />
            <Toast position="top" />
          </FilterProvider>
        </AppProviders>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
