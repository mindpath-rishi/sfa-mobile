// app/(drawer)/(tabs)/_layout.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, useFocusEffect, useSegments } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';
import { NotificationsModal } from '@/features/home/components/NotificationsModal';
import { notificationService } from '@/features/notification/services/notification.service';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { setHeader } = useHeader();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const salesman = isSalesman(user);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 50 });
      const count = (response.data || []).filter((item) => !item.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.warn('Failed to load notification badge count:', error);
      setUnreadCount(0);
    }
  }, []);

  const configureTabHeader = useCallback(() => {
    if (!segments.includes('(tabs)')) return;

    const activeTab = segments.filter((segment) => !segment.startsWith('('))[0] || 'home';
    if (activeTab === 'daily-summary' || activeTab === 'quick-viz') return;

    setHeader({
      showFilter: false,
      showBack: false,
      showMenu: true,
      title:
        activeTab === 'home'
          ? user?.name || (salesman ? 'Sales Executive' : 'Manager')
          : '',
      rightIcon: activeTab === 'home' ? 'bell' : undefined,
      badgeCount: activeTab === 'home' ? unreadCount : 0,
      onRightPress:
        activeTab === 'home'
          ? () => {
              setNotificationsVisible(true);
            }
          : undefined,
    });
  }, [salesman, segments, setHeader, setNotificationsVisible, unreadCount, user?.name]);

  useFocusEffect(configureTabHeader);

  useFocusEffect(
    useCallback(() => {
      if (!segments.includes('(tabs)')) return;

      const activeTab = segments.filter((segment) => !segment.startsWith('('))[0] || 'home';
      if (activeTab === 'home') {
        void loadUnreadCount();
      }
    }, [loadUnreadCount, segments]),
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let isMounted = true;
    let handledNotificationId: string | null = null;

    const openNotificationModal = async (data: any) => {
      if (!isMounted || !data) return;

      const shouldOpen = data.openAsModal === true || data.openAsModal === 'true';

      if (!shouldOpen) return;

      const notificationId = data.notificationId || data.messageId || JSON.stringify(data);

      if (handledNotificationId === notificationId) {
        return;
      }

      handledNotificationId = notificationId;

      // Give Expo Router time to mount
      setTimeout(async () => {
        if (!isMounted) return;

        setNotificationsVisible(true);

        try {
          await loadUnreadCount();
        } catch (error) {
          console.warn('Failed to refresh notification count', error);
        }
      }, 1000);
    };

    const checkInitialNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();

        if (!response) return;

        const data = response.notification.request.content.data;

        await openNotificationModal(data);

        // Clear handled response
        await Notifications.clearLastNotificationResponseAsync?.();
      } catch (error) {
        console.warn('Failed to process launch notification', error);
      }
    };

    void checkInitialNotification();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data;

        await openNotificationModal(data);
      },
    );

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const data = notification.request.content.data;

        await openNotificationModal(data);
      },
    );

    return () => {
      isMounted = false;
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [loadUnreadCount]);

  useEffect(() => {
    configureTabHeader();
  }, [configureTabHeader]);

  return (
    <>
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
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => {
          setNotificationsVisible(false);
          void loadUnreadCount();
        }}
      />
    </>
  );
}
