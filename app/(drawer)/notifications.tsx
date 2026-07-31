import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { AppText, Skeleton } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  notificationService,
  type NotificationItem as ApiNotificationItem,
} from '@/features/notification/services/notification.service';
import { toast } from '@/core/utils';
import { TopupActionConfirmSheet } from '@/features/topup/components/TopupActionConfirmSheet';
import { outletService } from '@/features/outlet/services/outlet.service';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type:
    | 'order'
    | 'route'
    | 'route_change'
    | 'target'
    | 'van_change'
    | 'stock_unload'
    | 'topup'
    | 'outlet_approval'
    | 'system';
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
  const rawCategory = String(item.category || item.data?.category || 'system').toLowerCase();
  const category = rawCategory === 'outlet_approval_result' ? 'outlet_approval' : rawCategory;

  return {
    id: item._id || item.id || `${item.title}-${item.createdAt || item.sentAt || Date.now()}`,
    title: item.title,
    message: item.body || item.message || '',
    time: formatRelativeTime(item.createdAt || item.sentAt),
    type: [
      'order',
      'route',
      'route_change',
      'target',
      'van_change',
      'stock_unload',
      'topup',
      'outlet_approval',
    ].includes(category)
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
    case 'route_change':
      return 'map-outline';
    case 'target':
      return 'flag-outline';
    case 'van_change':
      return 'car-outline';
    case 'stock_unload':
      return 'archive-outline';
    case 'topup':
      return 'cube-outline';
    case 'outlet_approval':
      return 'storefront-outline';
    case 'system':
    default:
      return 'checkmark-circle-outline';
  }
};

const isPendingTopupAcceptance = (item: NotificationItem) => {
  const category = String(item.data?.category || '').toLowerCase();
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.status || '').toUpperCase();

  return category === 'topup' && action === 'ACCEPTANCE_REQUIRED' && status === 'APPROVED';
};

const getTopupStatus = (item: NotificationItem) => {
  const status = String(item.data?.status || '').toUpperCase();
  return ['ACCEPTED', 'DECLINED'].includes(status) ? status : '';
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
  if (String(item.data?.category || '').toLowerCase() !== 'van_change') return '';

  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.vanChangeStatus || item.data?.status || '').toUpperCase();

  if (['APPROVED', 'REJECTED'].includes(status)) return status;
  if (['APPROVED', 'REJECTED'].includes(action)) return action;
  return '';
};

const isPendingRouteChangeApproval = (item: NotificationItem) => {
  const category = String(item.data?.category || '').toLowerCase();
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.status || '').toUpperCase();

  return (
    category === 'route_change' &&
    action === 'APPROVAL_REQUIRED' &&
    (!status || status === 'PENDING')
  );
};

const getRouteChangeStatus = (item: NotificationItem) => {
  if (String(item.data?.category || '').toLowerCase() !== 'route_change') return '';

  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.status || '').toUpperCase();

  if (['APPROVED', 'REJECTED'].includes(status)) return status;
  if (['APPROVED', 'REJECTED'].includes(action)) return action;
  return '';
};

const isPendingStockUnloadApproval = (item: NotificationItem) => {
  const category = String(item.data?.category || '').toLowerCase();
  const action = String(item.data?.action || '').toUpperCase();
  const status = String(item.data?.status || '').toUpperCase();
  return (
    category === 'stock_unload' &&
    action === 'APPROVAL_REQUIRED' &&
    (!status || status === 'PENDING')
  );
};

const getStockUnloadStatus = (item: NotificationItem) => {
  if (String(item.data?.category || '').toLowerCase() !== 'stock_unload') return '';
  const status = String(item.data?.status || item.data?.action || '').toUpperCase();
  return ['APPROVED', 'REJECTED'].includes(status) ? status : '';
};

const isPendingOutletApproval = (item: NotificationItem) =>
  String(item.data?.category || '').toLowerCase() === 'outlet_approval' &&
  String(item.data?.action || '').toUpperCase() === 'APPROVAL_REQUIRED' &&
  String(item.data?.status || 'PENDING').toUpperCase() === 'PENDING';

const getOutletApprovalStatus = (item: NotificationItem) => {
  const status = String(item.data?.status || '').toUpperCase();
  return ['ACTIVE', 'REJECTED'].includes(status) ? status : '';
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmTopupAction, setConfirmTopupAction] = useState<{
    item: NotificationItem;
    action: 'accept' | 'reject';
  } | null>(null);

  const loadNotifications = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await notificationService.getNotifications();
      const items = (response.data || []).map(mapNotification);
      setNotifications(items);
      void Promise.all(
        items.filter(isPendingOutletApproval).map(async (item) => {
          const customerId = String(item.data?.customerId || '');
          if (!customerId) return;
          const media = await outletService.getOutletMedia(customerId);
          const imageUrls = Array.isArray(media?.data)
            ? media.data.map((entry: any) => entry?.url).filter(Boolean)
            : [];
          setNotifications((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, data: { ...entry.data, imageUrls } } : entry,
            ),
          );
        }),
      );
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

  const handleNotificationPress = async (item: NotificationItem) => {
    const unloadRequestId = item.data?.unloadRequestId || item.data?.requestId;
    const target =
      item.type === 'stock_unload' && unloadRequestId
        ? `/stock-unload-detail?unloadRequestId=${encodeURIComponent(String(unloadRequestId))}`
        : item.data?.route || item.data?.url;
    if (typeof target === 'string' && target.startsWith('/')) {
      router.push(target as never);
    }

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

  const handleTopupAction = async (item: NotificationItem, action: 'accept' | 'reject') => {
    const topupId = item.data?.vanInventoryTopupId;
    if (!topupId || processingId) return;
    setConfirmTopupAction({ item, action });
  };

  const performTopupAction = async (item: NotificationItem, action: 'accept' | 'reject') => {
    const topupId = item.data?.vanInventoryTopupId;
    if (!topupId || processingId) return;

    setProcessingId(item.id);
    try {
      const response =
        action === 'accept'
          ? await notificationService.acceptTopup(String(topupId))
          : await notificationService.rejectTopup(String(topupId), {
              reason: 'Rejected by salesman',
            });

      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} top-up`);
        return;
      }

      toast.success(action === 'accept' ? 'Top-up accepted' : 'Top-up rejected');
      setConfirmTopupAction(null);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                unread: false,
                data: {
                  ...notification.data,
                  action: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
                  status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
                },
              }
            : notification,
        ),
      );

      await notificationService.markAsRead(item.id);
      await loadNotifications(true);
    } catch (error: any) {
      console.warn(`Failed to ${action} top-up:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} top-up`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleVanChangeAction = async (item: NotificationItem, action: 'approve' | 'reject') => {
    const vanChangeRequestId = item.data?.vanChangeRequestId || item.data?.requestId;
    if (!vanChangeRequestId || processingId) {
      toast.error('Van change request ID not found');
      return;
    }

    setProcessingId(item.id);
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveVanChange(String(vanChangeRequestId))
          : await notificationService.rejectVanChange(String(vanChangeRequestId));

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

  const handleRouteChangeAction = async (item: NotificationItem, action: 'approve' | 'reject') => {
    const routeChangeRequestId = item.data?.routeChangeRequestId || item.data?.requestId;
    if (!routeChangeRequestId || processingId) {
      toast.error('Route change request ID not found');
      return;
    }

    setProcessingId(item.id);
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveRouteChange(String(routeChangeRequestId))
          : await notificationService.rejectRouteChange(String(routeChangeRequestId));

      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} route change`);
        return;
      }

      toast.success(action === 'approve' ? 'Route change approved' : 'Route change rejected');
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                unread: false,
                data: {
                  ...notification.data,
                  action: action === 'approve' ? 'APPROVED' : 'REJECTED',
                  status: action === 'approve' ? 'APPROVED' : 'REJECTED',
                },
              }
            : notification,
        ),
      );

      await notificationService.markAsRead(item.id);
      await loadNotifications(true);
    } catch (error: any) {
      console.warn(`Failed to ${action} route change:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} route change`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOutletAction = async (item: NotificationItem, action: 'approve' | 'reject') => {
    const customerId = String(item.data?.customerId || '');
    const outletVerificationId = String(item.data?.outletVerificationId || '') || undefined;
    if (!customerId || processingId) return;
    setProcessingId(item.id);
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveOutlet(customerId, outletVerificationId)
          : await notificationService.rejectOutlet(
              customerId,
              'Rejected by reporting manager',
              outletVerificationId,
            );
      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} outlet`);
        return;
      }
      toast.success(`Outlet ${action === 'approve' ? 'approved' : 'rejected'}`);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                unread: false,
                data: {
                  ...notification.data,
                  action: action === 'approve' ? 'ACTIVE' : 'REJECTED',
                  status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
                },
              }
            : notification,
        ),
      );
      await notificationService.markAsRead(item.id);
      await loadNotifications(true);
    } catch (error: any) {
      console.warn(`Failed to ${action} outlet:`, error);
      toast.error(error?.response?.data?.message || `Failed to ${action} outlet`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleStockUnloadAction = async (item: NotificationItem, action: 'approve' | 'reject') => {
    const unloadRequestId = item.data?.unloadRequestId || item.data?.requestId;
    if (!unloadRequestId || processingId) {
      toast.error('Stock unload request ID not found');
      return;
    }

    setProcessingId(item.id);
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveStockUnload(String(unloadRequestId))
          : await notificationService.rejectStockUnload(String(unloadRequestId));
      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} stock unload request`);
        return;
      }
      toast.success(
        action === 'approve'
          ? 'Stock unload approved and van stock reset'
          : 'Stock unload request rejected',
      );
      await notificationService.markAsRead(item.id);
      await loadNotifications(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${action} stock unload request`);
    } finally {
      setProcessingId(null);
    }
  };

  const renderNotificationSkeleton = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton height={42} width={42} variant="circle" />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonHeader}>
              <Skeleton height={16} width="68%" borderRadius={8} />
              <Skeleton height={8} width={8} variant="circle" />
            </View>
            <Skeleton height={12} width="92%" borderRadius={6} style={{ marginTop: 10 }} />
            <Skeleton height={12} width="74%" borderRadius={6} style={{ marginTop: 7 }} />
            <Skeleton height={10} width={72} borderRadius={5} style={{ marginTop: 12 }} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} />
        }
      >
        {loading ? (
          renderNotificationSkeleton()
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={30} color={colors.textTertiary} />
            </View>
            <AppText style={styles.emptyText}>No notifications yet</AppText>
            <AppText style={styles.emptySubtext}>
              New alerts and approvals will appear here.
            </AppText>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((item) => {
              const vanChangeReason = getVanChangeReason(item);
              const vanChangeStatus = getVanChangeStatus(item);
              const routeChangeStatus = getRouteChangeStatus(item);
              const stockUnloadStatus = getStockUnloadStatus(item);
              const topupStatus = getTopupStatus(item);
              const outletApprovalStatus = getOutletApprovalStatus(item);

              return (
                <View key={item.id} style={[styles.card, item.unread && styles.unreadCard]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleNotificationPress(item)}
                    style={styles.cardPressArea}
                  >
                    <View style={[styles.iconWrap, item.unread && styles.unreadIconWrap]}>
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
                      {item.type === 'outlet_approval' && (
                        <View style={styles.outletDetails}>
                          <AppText style={styles.outletName}>{item.data?.outletName}</AppText>
                          <AppText style={styles.detailText}>Owner: {item.data?.ownerName}</AppText>
                          <AppText style={styles.detailText}>
                            Phone: {item.data?.phoneNumber}
                          </AppText>
                          <AppText style={styles.detailText}>
                            Address: {item.data?.address?.line1}
                            {item.data?.address?.line2 ? `, ${item.data.address.line2}` : ''}
                          </AppText>
                          {!!item.data?.imageUrls?.length && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {item.data.imageUrls.map((url: string) => (
                                <Image key={url} source={{ uri: url }} style={styles.outletImage} />
                              ))}
                            </ScrollView>
                          )}
                          {item.data?.geoTag?.lat && item.data?.geoTag?.lng && (
                            <TouchableOpacity
                              onPress={() =>
                                Linking.openURL(
                                  `https://www.google.com/maps/search/?api=1&query=${item.data?.geoTag?.lat},${item.data?.geoTag?.lng}`,
                                )
                              }
                            >
                              <AppText style={styles.locationLink}>View outlet location</AppText>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      {vanChangeReason && (
                        <AppText style={styles.reasonText}>Reason: {vanChangeReason}</AppText>
                      )}
                      {item.type === 'route_change' && (
                        <View style={styles.routeChangeDetails}>
                          {!!item.data?.currentRouteName && (
                            <AppText style={styles.detailText}>
                              Current: {item.data.currentRouteName}
                            </AppText>
                          )}
                          {!!item.data?.requestedRouteName && (
                            <AppText style={styles.detailText}>
                              Requested: {item.data.requestedRouteName}
                            </AppText>
                          )}
                        </View>
                      )}
                      {item.type === 'stock_unload' && (
                        <View style={styles.routeChangeDetails}>
                          <AppText style={styles.detailText}>
                            Salesman: {item.data?.employeeName || item.data?.employeeId || '—'}
                          </AppText>
                          <AppText style={styles.detailText}>
                            Van: {item.data?.vanId || '—'}
                          </AppText>
                          <AppText style={styles.detailText}>
                            Quantity: {Number(item.data?.totalQuantity || 0).toLocaleString()}
                          </AppText>
                        </View>
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
                      {routeChangeStatus && (
                        <AppText
                          style={[
                            styles.statusText,
                            {
                              color:
                                routeChangeStatus === 'APPROVED' ? colors.success : colors.error,
                            },
                          ]}
                        >
                          {routeChangeStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </AppText>
                      )}
                      {stockUnloadStatus && (
                        <AppText
                          style={[
                            styles.statusText,
                            {
                              color:
                                stockUnloadStatus === 'APPROVED' ? colors.success : colors.error,
                            },
                          ]}
                        >
                          {stockUnloadStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </AppText>
                      )}
                      {topupStatus && (
                        <AppText
                          style={[
                            styles.statusText,
                            {
                              color: topupStatus === 'ACCEPTED' ? colors.success : colors.error,
                            },
                          ]}
                        >
                          {topupStatus === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                        </AppText>
                      )}
                      {outletApprovalStatus && (
                        <AppText
                          style={[
                            styles.statusText,
                            {
                              color:
                                outletApprovalStatus === 'ACTIVE' ? colors.success : colors.error,
                            },
                          ]}
                        >
                          {outletApprovalStatus === 'ACTIVE'
                            ? 'Outlet Approved'
                            : 'Outlet Rejected'}
                        </AppText>
                      )}
                      {outletApprovalStatus === 'REJECTED' && item.data?.reason && (
                        <AppText style={styles.reasonText}>Reason: {item.data.reason}</AppText>
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

                  {isPendingRouteChangeApproval(item) && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleRouteChangeAction(item, 'reject')}
                        style={[styles.actionButton, styles.rejectButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.error }]}>
                          Reject
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleRouteChangeAction(item, 'approve')}
                        style={[styles.actionButton, styles.approveButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.success }]}>
                          Approve
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isPendingStockUnloadApproval(item) && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleStockUnloadAction(item, 'reject')}
                        style={[styles.actionButton, styles.rejectButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.error }]}>
                          Reject
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleStockUnloadAction(item, 'approve')}
                        style={[styles.actionButton, styles.approveButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.success }]}>
                          Approve
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isPendingOutletApproval(item) && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleOutletAction(item, 'reject')}
                        style={[styles.actionButton, styles.rejectButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.error }]}>
                          Reject
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleOutletAction(item, 'approve')}
                        style={[styles.actionButton, styles.approveButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.success }]}>
                          Approve
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isPendingTopupAcceptance(item) && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleTopupAction(item, 'reject')}
                        style={[styles.actionButton, styles.rejectButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.error }]}>
                          Reject
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={processingId === item.id}
                        onPress={() => handleTopupAction(item, 'accept')}
                        style={[styles.actionButton, styles.approveButton]}
                      >
                        <AppText style={[styles.actionButtonText, { color: colors.success }]}>
                          Accept Stock
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

      <TopupActionConfirmSheet
        visible={!!confirmTopupAction}
        action={confirmTopupAction?.action || null}
        loading={!!processingId}
        onClose={() => setConfirmTopupAction(null)}
        onConfirm={() => {
          if (!confirmTopupAction) return;
          void performTopupAction(confirmTopupAction.item, confirmTopupAction.action);
        }}
      />
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 12,
    },
    list: {
      gap: 12,
    },
    emptyState: {
      minHeight: 280,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 10,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    emptyText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    emptySubtext: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
    skeletonCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      padding: 14,
      flexDirection: 'row',
      gap: 12,
    },
    skeletonBody: {
      flex: 1,
      minWidth: 0,
    },
    skeletonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    cardPressArea: {
      flexDirection: 'row',
      gap: 12,
    },
    unreadCard: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '06',
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      paddingLeft: 42,
    },
    outletDetails: { gap: 5, marginTop: 10 },
    routeChangeDetails: { gap: 4, marginTop: 8 },
    outletName: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
    detailText: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
    outletImage: { width: 120, height: 82, borderRadius: 8, marginRight: 8, marginTop: 5 },
    locationLink: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 3 },
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
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.infoLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadIconWrap: {
      backgroundColor: colors.primary + '14',
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
      fontSize: 15,
      fontWeight: '800',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    message: {
      marginTop: 6,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    reasonText: {
      marginTop: 8,
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
      marginTop: 10,
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '700',
    },
  });
