import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Alert, View, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/core/store/auth.store';
import { useCartStore } from '@/core/store/cart.store';
import { useOfflineStore } from '@/core/offline/offline.store';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components';
import { EmptyState } from '@/core/components/EmptyState';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { vanService } from '@/shared/services/van.service';
import { toast } from '@/shared/utils/toast';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { Ionicons } from '@expo/vector-icons';

import { TopupDetailHeader } from '../components/TopupDetailHeader';
import { TopupDetailProducts } from '../components/TopupDetailProducts';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { ActiveTab, TopupDetail } from '../types/topupDetail.types';
import { TopupDetailOverview } from '../components/TopupDetailOverview';
import { TopupActionConfirmSheet } from '../components/TopupActionConfirmSheet';

export const VanInventoryTopupDetail: React.FC = () => {
  const { colors } = useTheme();
  const styles = createTopupDetailStyles(colors);
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route?.params as { id: string };

  const [detail, setDetail] = useState<TopupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { setHeader } = useHeader();
  const user = useAuthStore((state) => state.user);
  const offline = useOfflineStore((state) => !state.isConnected || !state.isInternetReachable);

  const isSuccessResponse = (response: any) =>
    response?.success === true || [200, 201].includes(Number(response?.statusCode));

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setIsLoading(true);

      const response = await vanService.fetchInventoryTopupRequest(id);

      if (isSuccessResponse(response) && response?.data) {
        setDetail(response.data);
      } else {
        Alert.alert('Error', response?.message || 'Failed to load details');
      }
    } catch (error) {
      console.error('Error fetching topup detail:', error);
      Alert.alert('Error', 'Failed to load top-up details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        hidden: true,
      });
    }, [setHeader]),
  );

  // Reload when returning to this screen (e.g. after editing the request)
  const hasFocusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) void fetchDetail(true);
      hasFocusedOnce.current = true;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
  }, []);

  const performTopupAction = useCallback(async () => {
    if (!detail?.vanInventoryTopupId || !confirmAction || actionLoading) return;

    const action = confirmAction;
    setActionLoading(action);
    try {
      const response =
        action === 'accept'
          ? await vanService.acceptInventoryTopupRequest(detail.vanInventoryTopupId)
          : await vanService.rejectInventoryTopupRequest(detail.vanInventoryTopupId, {
              reason: 'Rejected by salesman',
            });

      if (!isSuccessResponse(response)) {
        Alert.alert('Error', response?.message || `Failed to ${action} top-up`);
        return;
      }

      toast.success(action === 'accept' ? 'Top-up accepted' : 'Top-up rejected');
      setConfirmAction(null);
      await fetchDetail(true);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || `Failed to ${action} top-up`);
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, confirmAction, detail?.vanInventoryTopupId]);

  // A requested (not yet approved) top-up can be edited by the salesman who raised it
  const canEdit = detail?.status === 'SUBMITTED' && detail?.employeeId === user?.userId;

  const startEditing = useCallback(() => {
    if (!detail) return;
    if (offline) {
      toast.error('Top-up requests are unavailable offline. Please reconnect and try again.');
      return;
    }

    const open = () => {
      const { clearCart, addItems } = useCartStore.getState();
      clearCart();
      addItems(
        (detail.items ?? []).map((item) => ({
          productId: item.productId,
          productName: item.productName,
          casePrice: Number(item.casePrice) || 0,
          piecePrice: Number(item.piecePrice) || 0,
          unitQtyInCase: Math.max(Number(item.unitQtyInCase) || 1, 1),
          caseQty: Number(item.requestedCaseQty) || 0,
          pieceQty: Number(item.requestedPieceQty) || 0,
          caseNetWeight: Number(item.caseNetWeight) || 0,
          pieceNetWeight: Number(item.pieceNetWeight) || 0,
          stock: 0,
        })),
      );
      router.push({
        pathname: '/topup/create',
        params: { editTopupId: detail.vanInventoryTopupId },
      });
    };

    if (useCartStore.getState().items.length) {
      Alert.alert(
        'Edit top-up request',
        'Items currently in your cart will be replaced with this request.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: open },
        ],
      );
      return;
    }
    open();
  }, [detail, offline]);

  const handleAcceptTopup = useCallback(() => {
    if (!detail?.vanInventoryTopupId || actionLoading) return;
    setConfirmAction('accept');
  }, [actionLoading, detail?.vanInventoryTopupId]);

  const handleRejectTopup = useCallback(() => {
    if (!detail?.vanInventoryTopupId || actionLoading) return;
    setConfirmAction('reject');
  }, [actionLoading, detail?.vanInventoryTopupId]);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!detail) {
    return (
      <EmptyState
        title="No Data Found"
        description="The top-up request you're looking for doesn't exist or has been removed."
        icon="document-text-outline"
        actionLabel="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <TopupDetailHeader
        detail={detail}
        colors={colors}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {activeTab === 'overview' ? (
        <TopupDetailOverview detail={detail} colors={colors} />
      ) : (
        <TopupDetailProducts items={detail.items} colors={colors} />
      )}

      {canEdit && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startEditing}
            style={styles.acceptButton}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <AppText style={styles.acceptButtonText}>Edit Request</AppText>
          </TouchableOpacity>
        </View>
      )}

      {detail.status === 'APPROVED' && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!!actionLoading}
            onPress={handleRejectTopup}
            style={[styles.rejectButton, actionLoading && styles.actionDisabled]}
          >
            {actionLoading === 'reject' ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={19} color={colors.error} />
                <AppText style={styles.rejectButtonText}>Decline</AppText>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!!actionLoading}
            onPress={handleAcceptTopup}
            style={[styles.acceptButton, actionLoading && styles.actionDisabled]}
          >
            {actionLoading === 'accept' ? (
              <ActivityIndicator size="small" color={colors.primaryContrast} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <AppText style={styles.acceptButtonText}>Accept stock</AppText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TopupActionConfirmSheet
        visible={!!confirmAction}
        action={confirmAction}
        loading={!!actionLoading}
        onClose={() => setConfirmAction(null)}
        onConfirm={performTopupAction}
      />
    </SafeAreaView>
  );
};

export default VanInventoryTopupDetail;
