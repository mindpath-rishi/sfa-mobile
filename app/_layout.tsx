import React, { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { ActivityIndicator, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import ThemeProvider from '@/shared/providers/ThemeProvider';
import { AppProviders } from '@/shared/providers/AppProviders';
import { FilterProvider } from '@/shared/contexts/FilterContext';

import { useThemeStore } from '@/core/store/theme.store';
import { useLanguageStore } from '@/core/store/language.store';
import { useAuthStore } from '@/core/store/auth.store';
import { useGlobalErrorStore } from '@/core/store/error.store';

import AppErrorScreen from '@/core/screens/error/Error';
import { useTheme } from '@/shared/hooks/useTheme';
import { HeaderProvider } from '@/shared/contexts/HeaderContext';

export default function RootLayout() {
  const router = useRouter();
  const navigationState = useRootNavigationState();

  /* ======================================================
   * STORES
   * ====================================================== */

  const { hydrate: hydrateTheme, hydrated: themeHydrated } = useThemeStore();
  const { hydrate: hydrateLanguage, hydrated: languageHydrated } = useLanguageStore();

  const { hydrate: hydrateAuth, isHydrated: authHydrated, accessToken: token } = useAuthStore();

  const errorType = useGlobalErrorStore((s) => s.type);
  const clearError = useGlobalErrorStore((s) => s.clear);

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
   * NAVIGATION BAR (ANDROID)
   * ====================================================== */

  useEffect(() => {
    if (Platform.OS === 'android' && themeHydrated) {
      NavigationBar.setBackgroundColorAsync(colors.background + '00').catch((error) =>
        console.error('NavBar BG error:', error),
      );
    }
  }, [themeHydrated, colors]);

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

    if (!currentToken) {
      router.replace('/(auth)');
    } else {
      router.replace('/(drawer)/(tabs)/home');
    }
  }, [navigationState, themeHydrated, languageHydrated, authHydrated, router]);

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
      {/* App Content */}
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
            <Toast position="top" />
          </FilterProvider>
        </AppProviders>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
