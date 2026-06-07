import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'route' | 'target' | 'system';
  unread?: boolean;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notification-1',
    title: 'Order approved',
    message: 'Order ORD-5663-001 has been approved and is ready for dispatch.',
    time: 'Just now',
    type: 'order',
    unread: true,
  },
  {
    id: 'notification-2',
    title: 'Route update',
    message: 'MIKOMFWA route has 3 planned outlets pending for today.',
    time: '12 min ago',
    type: 'route',
    unread: true,
  },
  {
    id: 'notification-3',
    title: 'Target reminder',
    message: 'Team productivity is tracking at 89% against today\'s target.',
    time: '45 min ago',
    type: 'target',
  },
  {
    id: 'notification-4',
    title: 'Sync completed',
    message: 'Latest field user summaries were synced successfully.',
    time: 'Today, 09:20 AM',
    type: 'system',
  },
];

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

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Notifications',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, setHeader]),
  );

  const unreadCount = NOTIFICATIONS.filter((item) => item.unread).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryBand}>
        <View>
          <AppText style={styles.summaryLabel}>Unread</AppText>
          <AppText style={styles.summaryValue}>{unreadCount}</AppText>
        </View>
        <View style={styles.summaryIcon}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        </View>
      </View>

      <View style={styles.list}>
        {NOTIFICATIONS.map((item) => (
          <View key={item.id} style={[styles.card, item.unread && styles.unreadCard]}>
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
          </View>
        ))}
      </View>
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
