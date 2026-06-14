import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Skeleton } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  notificationService,
  type NotificationItem as ApiNotificationItem,
} from '@/features/notification/services/notification.service';
import { toast } from '@/core/utils';
import { useAuthStore } from '@/core/store/auth.store';
import { TopupActionConfirmSheet } from '@/features/topup/components/TopupActionConfirmSheet';

// ─── Constants ─────────────────────────────────────────────────────────────

/** Role names/IDs that can approve/reject van change requests */
const MANAGER_ROLES = ['manager', 'admin', 'supervisor'];

const isManagerRole = (role?: string) => !!role && MANAGER_ROLES.includes(role.toLowerCase());

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'order' | 'route' | 'target' | 'system' | 'van_change' | 'topup';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  rawDate?: string;
  type: NotificationType;
  unread?: boolean;
  data?: Record<string, any>;
  category?: string;
};

type Screen = 'list' | 'detail';

type NotificationsModalProps = {
  visible: boolean;
  onClose: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFullDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapNotification = (item: ApiNotificationItem): NotificationItem => {
  const category = String(item.category || item.data?.category || 'system').toLowerCase();
  const type: NotificationType = ['order', 'route', 'target', 'van_change', 'topup'].includes(category)
    ? (category as NotificationType)
    : 'system';

  return {
    id: item._id || item.id || `${item.title}-${item.createdAt || item.sentAt || Date.now()}`,
    title: item.title,
    message: item.body || item.message || '',
    time: formatRelativeTime(item.createdAt || item.sentAt),
    rawDate: item.createdAt || item.sentAt,
    type,
    category,
    unread: !item.isRead,
    data: item.data as Record<string, any> | undefined,
  };
};

const ICON_MAP: Record<NotificationType, string> = {
  order: 'receipt-outline',
  route: 'map-outline',
  target: 'flag-outline',
  van_change: 'car-outline',
  topup: 'cube-outline',
  system: 'checkmark-circle-outline',
};

const TYPE_LABEL: Record<NotificationType, string> = {
  order: 'Order',
  route: 'Route',
  target: 'Target',
  van_change: 'Van Change',
  topup: 'Top-up',
  system: 'System',
};

const isPendingVanChangeApproval = (item: NotificationItem) => {
  const category = String(item.data?.category || item.category || '').toLowerCase();
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.vanChangeStatus || item.data?.status || '').toUpperCase();

  return (
    category === 'van_change' && action === 'APPROVAL_REQUIRED' && (!status || status === 'PENDING')
  );
};

const getDataText = (data: Record<string, any> | undefined, keys: string[]) => {
  if (!data) return '';

  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

const getVanChangeReason = (item: NotificationItem) =>
  getDataText(item.data, ['reason', 'vanChangeReason', 'vanChangeNote']);

const getVanChangeStatus = (item: NotificationItem) => {
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.vanChangeStatus || item.data?.status || '').toUpperCase();

  if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) return status;
  if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(action)) return action;
  return '';
};

const getVanChangeStatusLabel = (status: string) => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'CANCELLED') return 'Cancelled';
  return 'Rejected';
};

const isPendingTopupAcceptance = (item: NotificationItem) => {
  const category = String(item.data?.category || item.category || '').toLowerCase();
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.status || '').toUpperCase();

  return category === 'topup' && action === 'ACCEPTANCE_REQUIRED' && status === 'APPROVED';
};

const getTopupStatus = (item: NotificationItem) => {
  const status = String(item.data?.status || '').toUpperCase();
  return ['ACCEPTED', 'DECLINED'].includes(status) ? status : '';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        chipStyles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.borderLight,
        },
      ]}
    >
      <AppText
        style={[chipStyles.chipText, { color: active ? colors.surface : colors.textSecondary }]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

// ─── Detail Page ──────────────────────────────────────────────────────────────

function NotificationDetail({
  item,
  processing,
  onBack,
  onApprove,
  onReject,
  colors,
  insets,
}: {
  item: NotificationItem;
  processing: { id: string; action: 'approve' | 'reject' } | null;
  onBack: () => void;
  onApprove: (item: NotificationItem) => void;
  onReject: (item: NotificationItem) => void;
  colors: any;
  insets: { top: number; bottom: number };
}) {
  const styles = createDetailStyles(colors, insets);
  const { user } = useAuthStore();
  const isManager = isManagerRole(user?.role ?? user?.roleId);
  const isVanChange = isPendingVanChangeApproval(item);
  const isTopupAcceptance = isPendingTopupAcceptance(item);
  const isApprovingThis = processing?.id === item.id && processing?.action === 'approve';
  const isRejectingThis = processing?.id === item.id && processing?.action === 'reject';
  const vanChangeStatus = getVanChangeStatus(item);
  const topupStatus = getTopupStatus(item);

  // Metadata rows extracted from item.data
  const metaRows: { label: string; value: string }[] = [];
  if (item.data) {
    const driverName = getDataText(item.data, ['driverName', 'salesmanName']);
    const currentVan = getDataText(item.data, ['currentVan', 'oldVanName', 'oldVanId']);
    const requestedVan = getDataText(item.data, [
      'requestedVan',
      'requestedVanName',
      'requestedVanId',
    ]);
    const reason = getVanChangeReason(item);

    if (driverName) metaRows.push({ label: 'Driver', value: driverName });
    if (currentVan) metaRows.push({ label: 'Current Van', value: currentVan });
    if (requestedVan) metaRows.push({ label: 'Requested Van', value: requestedVan });
    if (reason) metaRows.push({ label: 'Reason', value: reason });
    if (vanChangeStatus) {
      metaRows.push({
        label: 'Status',
        value: getVanChangeStatusLabel(vanChangeStatus),
      });
    }
    if (item.data.vanInventoryTopupId)
      metaRows.push({ label: 'Top-up ID', value: String(item.data.vanInventoryTopupId) });
    if (item.data.vanName) metaRows.push({ label: 'Van', value: String(item.data.vanName) });
    if (topupStatus) {
      metaRows.push({
        label: 'Top-up Status',
        value: topupStatus === 'ACCEPTED' ? 'Accepted' : 'Declined',
      });
    }
    if (item.data.workSessionId)
      metaRows.push({ label: 'Session ID', value: String(item.data.workSessionId) });
    if (item.data.routeCode) metaRows.push({ label: 'Route', value: item.data.routeCode });
    if (item.data.orderId) metaRows.push({ label: 'Order ID', value: String(item.data.orderId) });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={colors.surface} />
        </Pressable>
        <AppText style={styles.headerTitle}>Notification Detail</AppText>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Type badge + icon */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { backgroundColor: colors.infoLight }]}>
            <Ionicons name={ICON_MAP[item.type] as any} size={28} color={colors.primary} />
          </View>
          <View style={styles.heroBadge}>
            <AppText style={[styles.heroBadgeText, { color: colors.primary }]}>
              {TYPE_LABEL[item.type]}
            </AppText>
          </View>
          {item.unread && (
            <View style={[styles.unreadPill, { backgroundColor: colors.primary }]}>
              <AppText style={styles.unreadPillText}>Unread</AppText>
            </View>
          )}
        </View>

        {/* Title + message */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <AppText style={[styles.detailTitle, { color: colors.textPrimary }]}>
            {item.title}
          </AppText>
          <AppText style={[styles.detailMessage, { color: colors.textSecondary }]}>
            {item.message}
          </AppText>
        </View>

        {/* Timestamp */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <AppText style={[styles.sectionLabel, { color: colors.textTertiary }]}>Received</AppText>
          <AppText style={[styles.sectionValue, { color: colors.textPrimary }]}>
            {formatFullDate(item.rawDate)}
          </AppText>
        </View>

        {/* Metadata */}
        {metaRows.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <AppText style={[styles.sectionLabel, { color: colors.textTertiary }]}>Details</AppText>
            {metaRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.metaRow,
                  i < metaRows.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <AppText style={[styles.metaLabel, { color: colors.textTertiary }]}>
                  {row.label}
                </AppText>
                <AppText style={[styles.metaValue, { color: colors.textPrimary }]}>
                  {row.value}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* Approval/acceptance actions */}
        {((isManager && isVanChange) || isTopupAcceptance) && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <AppText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
              Action Required
            </AppText>
            <AppText style={[styles.approvalNote, { color: colors.textSecondary }]}>
              {isTopupAcceptance
                ? 'This approved top-up is waiting for your acceptance. Accepting will add the approved quantity to your van stock.'
                : 'This van change request is pending your approval. Please review the details above before taking action.'}
            </AppText>
            <View style={styles.approvalButtons}>
              <Pressable
                disabled={!!processing}
                onPress={() => onReject(item)}
                style={[
                  styles.approvalBtn,
                  styles.rejectBtn,
                  { borderColor: colors.error, opacity: isRejectingThis ? 0.5 : 1 },
                ]}
              >
                {isRejectingThis ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={16} color={colors.error} />
                    <AppText style={[styles.approvalBtnText, { color: colors.error }]}>
                      {isTopupAcceptance ? 'Reject Top-up' : 'Reject Request'}
                    </AppText>
                  </>
                )}
              </Pressable>
              <Pressable
                disabled={!!processing}
                onPress={() => onApprove(item)}
                style={[
                  styles.approvalBtn,
                  styles.approveBtn,
                  { backgroundColor: colors.success, opacity: isApprovingThis ? 0.5 : 1 },
                ]}
              >
                {isApprovingThis ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={16} color={colors.surface} />
                    <AppText style={[styles.approvalBtnText, { color: colors.surface }]}>
                      {isTopupAcceptance ? 'Accept Stock' : 'Approve Request'}
                    </AppText>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createDetailStyles = (colors: any, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSecondary },
    header: {
      paddingTop: insets.top,
      minHeight: insets.top + 56,
      paddingHorizontal: 12,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '900',
    },
    scroll: {
      padding: 14,
      gap: 10,
      paddingBottom: Math.max(insets.bottom, 18) + 18,
    },
    heroCard: {
      alignItems: 'center',
      paddingVertical: 28,
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    heroIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    heroBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    unreadPill: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
    },
    unreadPillText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    section: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 14,
      gap: 6,
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    sectionValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    detailTitle: {
      fontSize: 17,
      fontWeight: '900',
      lineHeight: 23,
    },
    detailMessage: {
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      gap: 12,
    },
    metaLabel: {
      fontSize: 12,
      fontWeight: '600',
    },
    metaValue: {
      fontSize: 12,
      fontWeight: '700',
      flexShrink: 1,
      textAlign: 'right',
    },
    approvalNote: {
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 8,
    },
    approvalButtons: {
      gap: 10,
      marginTop: 4,
    },
    approvalBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 13,
      borderRadius: 10,
    },
    rejectBtn: {
      borderWidth: 1.5,
      backgroundColor: 'transparent',
    },
    approveBtn: {},
    approvalBtnText: {
      fontSize: 14,
      fontWeight: '800',
    },
  });

// ─── Main Modal ───────────────────────────────────────────────────────────────

const FILTER_OPTIONS = ['All', 'Unread', 'Order', 'Route', 'Target', 'Van Change', 'Top-up', 'System'];

export function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);

  const [screen, setScreen] = useState<Screen>('list');
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isManager = isManagerRole(user?.role ?? user?.roleId);
  const [processing, setProcessing] = useState<{ id: string; action: 'approve' | 'reject' } | null>(
    null,
  );
  const [confirmTopupAction, setConfirmTopupAction] = useState<{
    item: NotificationItem;
    action: 'approve' | 'reject';
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return n.unread;
    return TYPE_LABEL[n.type] === activeFilter;
  });

  const loadNotifications = () => {
    let isMounted = true;
    setLoading(true);
    notificationService
      .getNotifications({ limit: 20 })
      .then((response) => {
        if (isMounted) setNotifications((response.data || []).map(mapNotification));
      })
      .catch((error) => {
        console.warn('Failed to load notifications:', error);
        if (isMounted) setNotifications([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    if (!visible) {
      setScreen('list');
      setSelectedItem(null);
      return;
    }
    return loadNotifications();
  }, [visible]);

  const navigateToDetail = (item: NotificationItem) => {
    setSelectedItem(item);
    setScreen('detail');
    // Optimistic mark-as-read
    if (item.unread) {
      setNotifications((curr) => curr.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
      notificationService.markAsRead(item.id).catch(() => {});
    }
  };

  const navigateBack = () => {
    setScreen('list');
    setSelectedItem(null);
  };

  const handleNotificationAction = async (
    item: NotificationItem,
    action: 'approve' | 'reject',
    confirmed = false,
  ) => {
    if (isPendingTopupAcceptance(item)) {
      const topupId = item.data?.vanInventoryTopupId;
      if (!topupId || processing) return;

      if (!confirmed) {
        setConfirmTopupAction({ item, action });
        return;
      }

      setProcessing({ id: item.id, action });
      try {
        const response =
          action === 'approve'
            ? await notificationService.acceptTopup(String(topupId))
            : await notificationService.rejectTopup(String(topupId), {
                reason: 'Rejected by salesman',
              });

        if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
          toast.error(response?.message || `Failed to ${action === 'approve' ? 'accept' : 'reject'} top-up`);
          return;
        }

        toast.success(action === 'approve' ? 'Top-up accepted' : 'Top-up rejected');
        setConfirmTopupAction(null);
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === item.id
              ? {
                  ...notification,
                  unread: false,
                  data: {
                    ...notification.data,
                    action: action === 'approve' ? 'ACCEPTED' : 'DECLINED',
                    status: action === 'approve' ? 'ACCEPTED' : 'DECLINED',
                  },
                }
              : notification,
          ),
        );
        await notificationService.markAsRead(item.id);
        navigateBack();
        loadNotifications();
      } catch (error: any) {
        console.warn(`Failed to ${action} top-up:`, error);
        toast.error(error?.response?.data?.message || `Failed to ${action === 'approve' ? 'accept' : 'reject'} top-up`);
      } finally {
        setProcessing(null);
      }
      return;
    }

    const workSessionId = item.data?.workSessionId;
    if (!workSessionId || processing) return;

    setProcessing({ id: item.id, action });
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveVanChange(String(workSessionId))
          : await notificationService.rejectVanChange(String(workSessionId));

      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} request`);
        return;
      }

      toast.success(action === 'approve' ? 'Van change approved' : 'Van change rejected');
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
      navigateBack();
      loadNotifications();
    } catch (error: any) {
      console.warn(`Failed to ${action} van change:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  };

  const renderNotificationSkeleton = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton height={40} width={40} variant="circle" />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonTop}>
              <Skeleton height={16} width="62%" borderRadius={8} />
              <Skeleton height={10} width={54} borderRadius={5} />
            </View>
            <Skeleton height={12} width="94%" borderRadius={6} style={{ marginTop: 10 }} />
            <Skeleton height={12} width="72%" borderRadius={6} style={{ marginTop: 7 }} />
            <Skeleton height={22} width={76} borderRadius={11} style={{ marginTop: 12 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={screen === 'detail' ? navigateBack : onClose}
    >
      <View style={styles.root}>
        {screen === 'list' ? (
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable style={styles.headerBtn} onPress={onClose}>
                <Ionicons name="chevron-back" size={24} color={colors.surface} />
              </Pressable>
              <AppText style={styles.headerTitle}>Notifications</AppText>
              <View style={styles.headerBtn} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* Filter chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTER_OPTIONS.map((f) => (
                  <FilterChip
                    key={f}
                    label={f}
                    active={activeFilter === f}
                    onPress={() => setActiveFilter(f)}
                    colors={colors}
                  />
                ))}
              </ScrollView>

              {/* List */}
              {loading ? (
                renderNotificationSkeleton()
              ) : filteredNotifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={32}
                    color={colors.textTertiary}
                  />
                  <AppText style={styles.emptyText}>No notifications</AppText>
                  {activeFilter !== 'All' && (
                    <Pressable onPress={() => setActiveFilter('All')}>
                      <AppText style={[styles.emptyAction, { color: colors.primary }]}>
                        Clear filter
                      </AppText>
                    </Pressable>
                  )}
                </View>
              ) : (
                <View style={styles.list}>
                  {filteredNotifications.map((item) => {
                    const isVanChange = isPendingVanChangeApproval(item);
                    const isTopupAcceptance = isPendingTopupAcceptance(item);
                    const vanChangeReason = getVanChangeReason(item);
                    const vanChangeStatus = getVanChangeStatus(item);

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => navigateToDetail(item)}
                        style={[styles.card, item.unread && styles.unreadCard]}
                      >
                        {/* Left accent bar for unread */}
                        {item.unread && (
                          <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
                        )}

                        <View style={[styles.iconWrap, { backgroundColor: colors.infoLight }]}>
                          <Ionicons
                            name={ICON_MAP[item.type] as any}
                            size={18}
                            color={colors.primary}
                          />
                        </View>

                        <View style={styles.cardBody}>
                          <View style={styles.cardTop}>
                            <AppText style={styles.cardTitle} numberOfLines={1}>
                              {item.title}
                            </AppText>
                            <View style={styles.cardMeta}>
                              {item.unread && (
                                <View
                                  style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                                />
                              )}
                              <AppText style={[styles.cardTime, { color: colors.textTertiary }]}>
                                {item.time}
                              </AppText>
                            </View>
                          </View>
                          <AppText
                            style={[styles.cardMessage, { color: colors.textSecondary }]}
                            numberOfLines={2}
                          >
                            {item.message}
                          </AppText>
                          {vanChangeReason && (
                            <AppText
                              style={[styles.cardReason, { color: colors.textSecondary }]}
                              numberOfLines={2}
                            >
                              Reason: {vanChangeReason}
                            </AppText>
                          )}
                          {vanChangeStatus && (
                            <AppText
                              style={[
                                styles.cardStatus,
                                {
                                  color:
                                    vanChangeStatus === 'APPROVED'
                                      ? colors.success
                                      : vanChangeStatus === 'CANCELLED'
                                        ? colors.warning
                                        : colors.error,
                                },
                              ]}
                            >
                              {getVanChangeStatusLabel(vanChangeStatus)}
                            </AppText>
                          )}

                          <View style={styles.cardFooter}>
                            <View style={[styles.typePill, { backgroundColor: colors.infoLight }]}>
                              <AppText style={[styles.typePillText, { color: colors.primary }]}>
                                {TYPE_LABEL[item.type]}
                              </AppText>
                            </View>

                            {/* Inline approval actions — managers only */}
                            {isManager && isVanChange && (
                              <View style={styles.inlineActions}>
                                <Pressable
                                  disabled={!!processing}
                                  onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleNotificationAction(item, 'reject');
                                  }}
                                  style={[
                                    styles.inlineBtn,
                                    styles.inlineReject,
                                    { borderColor: colors.error },
                                  ]}
                                >
                                  {processing?.id === item.id && processing?.action === 'reject' ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                  ) : (
                                    <AppText
                                      style={[styles.inlineBtnText, { color: colors.error }]}
                                    >
                                      Reject
                                    </AppText>
                                  )}
                                </Pressable>
                                <Pressable
                                  disabled={!!processing}
                                  onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleNotificationAction(item, 'approve');
                                  }}
                                  style={[
                                    styles.inlineBtn,
                                    styles.inlineApprove,
                                    { backgroundColor: colors.success },
                                  ]}
                                >
                                  {processing?.id === item.id &&
                                  processing?.action === 'approve' ? (
                                    <ActivityIndicator size="small" color={colors.surface} />
                                  ) : (
                                    <AppText
                                      style={[styles.inlineBtnText, { color: colors.surface }]}
                                    >
                                      Approve
                                    </AppText>
                                  )}
                                </Pressable>
                              </View>
                            )}

                            {isTopupAcceptance && (
                              <View style={styles.inlineActions}>
                                <Pressable
                                  disabled={!!processing}
                                  onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleNotificationAction(item, 'reject');
                                  }}
                                  style={[
                                    styles.inlineBtn,
                                    styles.inlineReject,
                                    { borderColor: colors.error },
                                  ]}
                                >
                                  {processing?.id === item.id && processing?.action === 'reject' ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                  ) : (
                                    <AppText
                                      style={[styles.inlineBtnText, { color: colors.error }]}
                                    >
                                      Reject
                                    </AppText>
                                  )}
                                </Pressable>
                                <Pressable
                                  disabled={!!processing}
                                  onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleNotificationAction(item, 'approve');
                                  }}
                                  style={[
                                    styles.inlineBtn,
                                    styles.inlineApprove,
                                    { backgroundColor: colors.success },
                                  ]}
                                >
                                  {processing?.id === item.id &&
                                  processing?.action === 'approve' ? (
                                    <ActivityIndicator size="small" color={colors.surface} />
                                  ) : (
                                    <AppText
                                      style={[styles.inlineBtnText, { color: colors.surface }]}
                                    >
                                      Accept
                                    </AppText>
                                  )}
                                </Pressable>
                              </View>
                            )}

                            <Ionicons
                              name="chevron-forward"
                              size={14}
                              color={colors.textTertiary}
                              style={styles.chevron}
                            />
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        ) : (
          selectedItem && (
            <NotificationDetail
              item={selectedItem}
              processing={processing}
              onBack={navigateBack}
              onApprove={(item) => handleNotificationAction(item, 'approve')}
              onReject={(item) => handleNotificationAction(item, 'reject')}
              colors={colors}
              insets={insets}
            />
          )
        )}
        <TopupActionConfirmSheet
          visible={!!confirmTopupAction}
          action={
            confirmTopupAction
              ? confirmTopupAction.action === 'approve'
                ? 'accept'
                : 'reject'
              : null
          }
          loading={!!processing}
          onClose={() => setConfirmTopupAction(null)}
          onConfirm={() => {
            if (!confirmTopupAction) return;
            void handleNotificationAction(
              confirmTopupAction.item,
              confirmTopupAction.action,
              true,
            );
          }}
        />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: any, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    header: {
      paddingTop: insets.top,
      minHeight: insets.top + 56,
      paddingHorizontal: 12,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerBtn: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '900',
    },
    content: {
      padding: 14,
      paddingBottom: Math.max(insets.bottom, 18) + 18,
      gap: 12,
    },
    // Filters
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingRight: 4,
    },
    // List
    list: {
      gap: 10,
    },
    skeletonCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      padding: 12,
      flexDirection: 'row',
      gap: 10,
    },
    skeletonBody: {
      flex: 1,
      minWidth: 0,
    },
    skeletonTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    emptyState: {
      minHeight: 180,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    emptyText: {
      color: colors.textTertiary,
      fontSize: 13,
      fontWeight: '700',
    },
    emptyAction: {
      fontSize: 12,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    // Card
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      padding: 12,
      flexDirection: 'row',
      gap: 10,
      overflow: 'hidden',
    },
    unreadCard: {
      borderColor: colors.primary,
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardBody: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    cardTitle: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      flexShrink: 0,
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    cardTime: {
      fontSize: 10,
      fontWeight: '600',
    },
    cardMessage: {
      fontSize: 12,
      lineHeight: 17,
    },
    cardReason: {
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
    },
    cardStatus: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    typePill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    typePillText: {
      fontSize: 10,
      fontWeight: '700',
    },
    // Inline manager actions on list
    inlineActions: {
      flexDirection: 'row',
      gap: 6,
      marginLeft: 'auto',
    },
    inlineBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      minWidth: 60,
      alignItems: 'center',
    },
    inlineReject: {
      borderWidth: 1.5,
      backgroundColor: 'transparent',
    },
    inlineApprove: {},
    inlineBtnText: {
      fontSize: 11,
      fontWeight: '800',
    },
    chevron: {
      marginLeft: 'auto',
    },
  });
