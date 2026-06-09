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
import { toast } from '@/core/utils';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'route' | 'target' | 'system';
  unread?: boolean;
  data?: Record<string, any>;
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
    data: item.data as Record<string, any> | undefined,
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

const isPendingVanChangeApproval = (item: NotificationItem) => {
  const category = String(item.data?.category || '').toLowerCase();
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.vanChangeStatus || item.data?.status || '').toUpperCase();

  return (
    category === 'van_change' && action === 'APPROVAL_REQUIRED' && (!status || status === 'PENDING')
  );
};

const getVanChangeReason = (item: NotificationItem) =>
  String(item.data?.reason || item.data?.vanChangeReason || '').trim();

const getVanChangeStatus = (item: NotificationItem) => {
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.vanChangeStatus || item.data?.status || '').toUpperCase();

  if (['APPROVED', 'REJECTED'].includes(status)) return status;
  if (['APPROVED', 'REJECTED'].includes(action)) return action;
  return '';
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleVanChangeAction = async (item: NotificationItem, action: 'approve' | 'reject') => {
    const workSessionId = item.data?.workSessionId;
    if (!workSessionId || processingId) return;

    setProcessingId(item.id);
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveVanChange(String(workSessionId))
          : await notificationService.rejectVanChange(String(workSessionId));

      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} request`);
        return;
      }

      if (action === 'approve') {
        toast.success('Van change approved');
      } else {
        toast.success('Van change rejected');
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                unread: false,
                data: {
                  ...notification.data,
                  action: action === 'approve' ? 'APPROVED' : 'REJECTED',
                  vanChangeStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
                },
              }
            : notification,
        ),
      );

      await notificationService.markAsRead(item.id);
      await loadNotifications(true);
    } catch (error: any) {
      console.warn(`Failed to ${action} van change:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
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
          {notifications.map((item) => {
            const vanChangeReason = getVanChangeReason(item);
            const vanChangeStatus = getVanChangeStatus(item);

            return (
              <View key={item.id} style={[styles.card, item.unread && styles.unreadCard]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleNotificationPress(item)}
                  style={styles.cardPressArea}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name={getNotificationIcon(item.type)}
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                      <AppText style={styles.title}>{item.title}</AppText>
                      {item.unread && <View style={styles.unreadDot} />}
                    </View>
                    <AppText style={styles.message}>{item.message}</AppText>
                    {vanChangeReason && (
                      <AppText style={styles.reasonText}>Reason: {vanChangeReason}</AppText>
                    )}
                    {vanChangeStatus && (
                      <AppText
                        style={[
                          styles.statusText,
                          {
                            color: vanChangeStatus === 'APPROVED' ? colors.success : colors.error,
                          },
                        ]}
                      >
                        {vanChangeStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </AppText>
                    )}
                    <AppText style={styles.time}>{item.time}</AppText>
                  </View>
                </TouchableOpacity>

                {isPendingVanChangeApproval(item) && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      disabled={processingId === item.id}
                      onPress={() => handleVanChangeAction(item, 'reject')}
                      style={[styles.actionButton, styles.rejectButton]}
                    >
                      <AppText style={[styles.actionButtonText, { color: colors.error }]}>
                        Reject
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={processingId === item.id}
                      onPress={() => handleVanChangeAction(item, 'approve')}
                      style={[styles.actionButton, styles.approveButton]}
                    >
                      <AppText style={[styles.actionButtonText, { color: colors.success }]}>
                        Approve
                      </AppText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
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
      gap: 10,
    },
    cardPressArea: {
      flexDirection: 'row',
      gap: 10,
    },
    unreadCard: {
      borderColor: colors.primary,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      paddingLeft: 42,
    },
    actionButton: {
      minWidth: 86,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    approveButton: {
      borderColor: colors.success,
      backgroundColor: colors.success + '10',
    },
    rejectButton: {
      borderColor: colors.error,
      backgroundColor: colors.error + '10',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '800',
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
    reasonText: {
      marginTop: 4,
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
    },
    statusText: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    time: {
      marginTop: 8,
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
    },
  });
