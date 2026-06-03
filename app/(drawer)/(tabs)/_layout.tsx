// app/(drawer)/(tabs)/_layout.tsx

import React, { useCallback } from 'react';
import { Tabs, useFocusEffect, useSegments } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { setHeader } = useHeader();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const salesman = isSalesman(user);
  useFocusEffect(
    useCallback(() => {
      const activeTab = segments.filter((segment) => !segment.startsWith('('))[0];
      if (activeTab === 'daily-summary' || activeTab === 'quick-viz') return;

      setHeader({
        showFilter: false,
        showBack: false,
        showMenu: true,
        title: '',
      });
    }, [segments, setHeader]),
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // ✅ we use Drawer Header
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="daily-summary"
        options={{
          title: 'Daily Summary',
          href: salesman ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'pulse' : 'pulse-outline'} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="quick-viz"
        options={{
          title: 'Quick Viz',
          href: salesman ? null : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'analytics' : 'analytics-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
