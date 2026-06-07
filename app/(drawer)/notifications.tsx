import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  notificationService,
  type NotificationItem as ApiNotificationItem,
} from '@/features/notification/services/notification.service';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'route' | 'target' | 'system';
  unread?: boolean;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapNotification = (item: ApiNotificationItem): NotificationItem => {
  const category = String(item.category || item.data?.category || 'system').toLowerCase();

  return {
    id: item._id || item.id || `${item.title}-${item.createdAt || item.sentAt || Date.now()}`,
    title: item.title,
    message: item.body || item.message || '',
    time: formatRelativeTime(item.createdAt || item.sentAt),
    type: ['order', 'route', 'target'].includes(category)
      ? (category as NotificationItem['type'])
      : 'system',
    unread: !item.isRead,
  };
};

const getNotificationIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'order':
      return 'receipt-outline';
    case 'route':
      return 'map-outline';
    case 'target':
      return 'flag-outline';
    case 'system':
    default:
      return 'checkmark-circle-outline';
  }
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await notificationService.getNotifications();
      setNotifications((response.data || []).map(mapNotification));
    } catch (error) {
      console.warn('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Notifications',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
      loadNotifications();
    }, [colors.primary, loadNotifications, setHeader]),
  );

  const unreadCount = notifications.filter((item) => item.unread).length;

  const handleNotificationPress = async (item: NotificationItem) => {
    if (!item.unread) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id ? { ...notification, unread: false } : notification,
      ),
    );

    try {
      await notificationService.markAsRead(item.id);
    } catch (error) {
      console.warn('Failed to mark notification read:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} />
      }
    >
      <View style={styles.summaryBand}>
        <View>
          <AppText style={styles.summaryLabel}>Unread</AppText>
          <AppText style={styles.summaryValue}>{unreadCount}</AppText>
        </View>
        <View style={styles.summaryIcon}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={28} color={colors.textTertiary} />
          <AppText style={styles.emptyText}>No notifications yet</AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => handleNotificationPress(item)}
              style={[styles.card, item.unread && styles.unreadCard]}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={getNotificationIcon(item.type)} size={18} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <AppText style={styles.title}>{item.title}</AppText>
                  {item.unread && <View style={styles.unreadDot} />}
                </View>
                <AppText style={styles.message}>{item.message}</AppText>
                <AppText style={styles.time}>{item.time}</AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 14,
      paddingBottom: 32,
      gap: 12,
    },
    summaryBand: {
      minHeight: 76,
      borderRadius: 8,
      padding: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    summaryLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    summaryValue: {
      marginTop: 3,
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '900',
    },
    summaryIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.infoLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: {
      gap: 10,
    },
    emptyState: {
      minHeight: 160,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    emptyText: {
      color: colors.textTertiary,
      fontSize: 12,
      fontWeight: '700',
    },
    card: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      padding: 12,
      flexDirection: 'row',
      gap: 10,
    },
    unreadCard: {
      borderColor: colors.primary,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.infoLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '900',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    message: {
      marginTop: 5,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    time: {
      marginTop: 8,
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
    },
  });
