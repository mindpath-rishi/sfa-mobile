import React, { useEffect } from 'react';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';

import ThemeProvider from '@/shared/providers/ThemeProvider';
import { AppProviders } from '@/shared/providers/AppProviders';
import { FilterProvider } from '@/shared/contexts/FilterContext'; // Import FilterProvider

import { useThemeStore } from '@/core/store/theme.store';
import { useLanguageStore } from '@/core/store/language.store';
import { useAuthStore } from '@/core/store/auth.store';
import { useGlobalErrorStore } from '@/core/store/error.store';
import AppErrorScreen from '@/core/screens/error/Error';
import { useTheme } from '@/shared/hooks/useTheme';
import LoaderOverlay from '@/core/screens/LoaderOverlay';
import { useLoaderStore } from '@/core/loader/loader.store';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const { hydrate: hydrateTheme, hydrated: themeHydrated } = useThemeStore();
  const { colors, isDark } = useTheme();
  const { hydrate: hydrateLanguage, hydrated: languageHydrated } = useLanguageStore();

  const token = useAuthStore((s) => s.accessToken);
  const errorType = useGlobalErrorStore((s) => s.type);
  const clearError = useGlobalErrorStore((s) => s.clear);

  useEffect(() => {
    hydrateTheme();
    hydrateLanguage();
  }, [hydrateTheme, hydrateLanguage]);

  // Handle navigation bar for edge-to-edge mode
  useEffect(() => {
    if (Platform.OS === 'android' && themeHydrated) {
      const setupNavigationBar = async () => {
        try {
          await NavigationBar.setBackgroundColorAsync(colors.background + '00');
          console.log('Navigation bar button style set to:', isDark ? 'light' : 'dark');
        } catch (error) {
          console.error('Failed to configure navigation bar:', error);
        }
      };

      setupNavigationBar();
    }
  }, [themeHydrated, isDark]);

  // Update button style when theme changes
  useEffect(() => {
    if (Platform.OS === 'android' && themeHydrated) {
      NavigationBar.setButtonStyleAsync(isDark ? 'dark' : 'dark').catch((error) =>
        console.error('Failed to update button style:', error),
      );
    }
  }, [isDark, themeHydrated]);

  // Auth redirect effect
  useEffect(() => {
    if (!navigationState?.key) return;
    if (!themeHydrated || !languageHydrated) return;

    if (token) {
      router.replace('/(auth)');
    } else {
      router.replace('/(tabs)/home');
    }
  }, [navigationState, token, themeHydrated, languageHydrated, router]);

  if (errorType) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <AppErrorScreen type={errorType} onRetry={clearError} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        translucent={false}
        backgroundColor={colors.background}
      />

      {/* Main container with background color */}
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Gradient Overlay */}
        <LinearGradient
          colors={[colors.primary + '30', colors.primary + '10', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          pointerEvents="none"
        />

        {/* Main Content */}
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <ThemeProvider>
            <AppProviders>
              {/* Add FilterProvider here to wrap all screens */}
              <FilterProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(drawer)" /> {/* Add this if you have a drawer layout */}
                </Stack>
                <LoaderOverlay />
                <Toast position="bottom" />
              </FilterProvider>
            </AppProviders>
          </ThemeProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
