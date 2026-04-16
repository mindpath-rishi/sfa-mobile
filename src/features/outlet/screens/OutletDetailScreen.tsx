// app/customers/[id].tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
  RefreshControl,
  ActivityIndicator,
  Platform,
  FlatList,
  Modal,
  TextInput,
  NativeScrollEvent,
  NativeSyntheticEvent,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { useOutletDetailStyles } from '../styles/OutletDetail.styles';
import { OutletAvatar, OutletStatusBadge } from '../components/outlet';
import { outletService } from '../services/outlet.service';
import { useAuthStore } from '@/core/store/auth.store';
import { Outlet } from '../types/outlet.types';
import { useOutletStore } from '@/core/store/outlet.store';
import { useRouteStore } from '@/core/store/route.store';
import moment from 'moment';
import { saleService } from '@/shared/services/sale.service';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

// Types
interface SaleItem {
  saleId: string;
  vanId: string;
  vanName: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  date: string;
  totalCases: number;
  totalPieces: number;
  totalQty: number;
  totalWeight: number;
  totalValue: number;
  totalReturnCases: number;
  totalReturnPieces: number;
  totalReturnQty: number;
  type: 'CASH' | 'CREDIT';
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paidAmount: number;
  pendingAmount: number;
  remark?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'RETURNED' | 'CANCELLED';
}

interface PaymentTransaction {
  paymentId: string;
  customerId: string;
  vanId: string;
  employeeId: string;
  amount: number;
  paymentMode: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'UPI';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  date: string;
  sales: {
    saleId: string;
    amount: number;
  }[];
  referenceNo?: string;
  remark?: string;
}

interface Activity {
  activityId: string;
  workSessionId: string;
  userId: string;
  userName: string;
  vanId: string;
  vanName: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  category: string;
  subCategory: string;
  startTime: string;
  endTime?: string;
}

type TabType = 'overview' | 'sales' | 'transactions' | 'contacts' | 'activity';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: 'information-circle-outline' },
  { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
  { key: 'transactions', label: 'Transactions', icon: 'swap-horizontal-outline' },
  { key: 'contacts', label: 'Contacts', icon: 'people-outline' },
  { key: 'activity', label: 'Activity', icon: 'time-outline' },
];

const PAGE_SIZE = 20;

export default function CustomerDetailScreen() {
  const { colors } = useTheme();
  const styles = useOutletDetailStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<Outlet | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitNote, setVisitNote] = useState('');
  const [isStartingVisit, setIsStartingVisit] = useState(false);
  const [isTabScrolled, setIsTabScrolled] = useState(false);

  // Pagination states
  const [orders, setOrders] = useState<SaleItem[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersHasMore, setOrdersHasMore] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersTotal, setOrdersTotal] = useState(0);

  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [paymentsHasMore, setPaymentsHasMore] = useState(true);
  const [transactionsLoading] = useState(false);
  const [paymentsTotal] = useState(0);

  const [activities] = useState<Activity[]>([]);
  const [activitiesHasMore] = useState(true);
  const [activitiesLoading] = useState(false);
  const [activitiesTotal] = useState(0);

  const route = useRouteStore((s) => s.selectedRoute);
  const van = useRouteStore((s) => s.van);
  const user = useAuthStore((s) => s.user);
  const activeVisit = useOutletStore((s) => s.activeVisit);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const { setSelectedOutlet } = useOutletStore();

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  useEffect(() => {
    if (customer) {
      loadOrders(1, true);
      loadPayments(1, true);
    }
  }, [customer]);

  useEffect(() => {
    setIsTabScrolled(false);
  }, [activeTab]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackNavigation();
      return true;
    });

    return () => backHandler.remove();
  }, [customer]);

  const handleBackNavigation = () => {
    router.replace(`/beats`);
    return true;
  };

  const loadCustomerData = async () => {
    setIsLoading(true);
    const response = await outletService.getOutletDetail(id);
    if (response?.data) {
      setCustomer(response.data);
      setSelectedOutlet(response?.data);
    } else {
      setCustomer(null);
    }
    setIsLoading(false);
  };

  const loadOrders = async (page: number, reset: boolean = false) => {
    if (ordersLoading || (!ordersHasMore && !reset)) return;
    try {
      setOrdersLoading(true);
      const params: any = {
        page: reset ? 1 : page,
        limit: PAGE_SIZE,
        customerId: customer?.customerId,
        vanId: van?.vanId,
        employeeId: user?.userId,
      };
      const response: any = await saleService.fetchSales(params);

      const newOrders = response?.data || [];
      const total = response?.total || 0;

      if (reset) {
        setOrders(newOrders);
        setOrdersPage(1);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
      }

      setOrdersTotal(total);
      setOrdersHasMore(
        newOrders.length === PAGE_SIZE &&
          (reset ? newOrders.length : orders.length + newOrders.length) < total,
      );
      if (!reset) setOrdersPage(page);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadMorePayments = () => {
    if (ordersHasMore && !ordersLoading) {
      loadOrders(ordersPage + 1);
    }
  };

  const loadPayments = async (page: number, reset: boolean = false) => {
    if (ordersLoading || (!ordersHasMore && !reset)) return;
    try {
      setOrdersLoading(true);
      const params: any = {
        page: reset ? 1 : page,
        limit: PAGE_SIZE,
        customerId: customer?.customerId,
        vanId: van?.vanId,
        employeeId: user?.userId,
      };
      const response: any = await saleService.fetchPayments(params);

      const newPayments = response?.data || [];
      const total = response?.total || 0;

      if (reset) {
        setPayments(newPayments);
        // setOr(1);
      } else {
        setPayments((prev) => [...prev, ...newPayments]);
      }

      setOrdersTotal(total);
      setOrdersHasMore(
        newPayments.length === PAGE_SIZE &&
          (reset ? newPayments.length : orders.length + newPayments.length) < total,
      );
      // if (!reset) setPayments(page);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadMoreOrders = () => {
    if (ordersHasMore && !ordersLoading) {
      loadOrders(ordersPage + 1);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomerData();
    await loadOrders(1, true);
    await loadPayments(1, true);
    setRefreshing(false);
  }, [id, customer]);

  const handleShare = useCallback(async () => {
    if (!customer) return;
    const {
      name,
      ownerName,
      address,
      phoneNumber,
      creditLimit,
      outstanding,
      segmentation,
      status,
    } = customer;

    await Share.share({
      message: `📋 *Customer Details*\n━━━━━━━━━━━━━━━━━━━━━\n🏢 *Name:* ${name}\n👤 *Owner:* ${ownerName}\n📍 *Address:* ${address?.line1 || 'N/A'}${address?.line2 ? ', ' + address.line2 : ''}\n📞 *Phone:* ${phoneNumber}\n🏷️ *Type:* ${segmentation || 'N/A'}\n💰 *Credit Limit:* ${creditLimit ? `K${creditLimit.toLocaleString()}` : 'N/A'}\n💵 *Outstanding:* ${outstanding ? `K${outstanding.toLocaleString()}` : 'N/A'}\n📊 *Status:* ${status}`,
      title: name,
    });
  }, [customer]);

  const handleEdit = useCallback(() => {
    if (customer?.customerId) {
      router.push(`/customers/edit/${customer.customerId}`);
    }
  }, [customer]);

  const handleStartVisit = useCallback(async () => {
    if (!customer) return;
    setIsStartingVisit(true);

    try {
      const payload: any = {
        routeSessionId: route?.routeSessionId,
        workSessionId: route?.workSessionId,
        vanId: route?.vanId,
        outletId: customer.customerId,
        // note: visitNote,
      };

      const response = await outletService.startVisit(payload);
      if (response.success) {
        const visit = response?.data;
        setActiveVisit({
          visitId: visit.visitId,
          outlet: customer as any,
          checkInTime: new Date(visit.checkInTime),
          checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
          status: visit.status,
          routeSessionId: visit?.routeSessionId,
          customerId: visit?.customerId,
        });
        setShowVisitModal(false);
        setVisitNote('');
        router.push(`/route/visit`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start visit');
    } finally {
      setIsStartingVisit(false);
    }
  }, [customer, route, visitNote]);

  const handleVisitAction = useCallback(() => {
    if (activeVisit) {
      router.push(`/route/visit`);
    } else {
      // setShowVisitModal(true);
      handleStartVisit();
    }
  }, [activeVisit, customer]);

  const handleTabScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsTabScrolled((previous) => {
      if (offsetY > 24 && !previous) return true;
      if (offsetY <= 12 && previous) return false;
      return previous;
    });
  }, []);

  if (isLoading) return <LoadingState styles={styles} colors={colors} />;
  if (!customer) return <EmptyState styles={styles} colors={colors} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomerHeader
        customer={customer}
        styles={styles}
        colors={colors}
        onBack={() => router.back()}
        onEdit={handleEdit}
        onShare={handleShare}
        compact={isTabScrolled}
      />

      {!isTabScrolled ? (
        <VisitBanner
          activeVisit={activeVisit}
          customer={customer}
          onStartVisit={handleVisitAction}
          styles={styles}
          colors={colors}
        />
      ) : null}

      {/* {!isTabScrolled ? <StatsRow customer={customer} styles={styles} colors={colors} /> : null} */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />

      <TabContent
        activeTab={activeTab}
        customer={customer}
        orders={orders}
        ordersLoading={ordersLoading}
        ordersHasMore={ordersHasMore}
        ordersTotal={ordersTotal}
        onLoadMoreOrders={loadMoreOrders}
        payments={payments}
        transactionsLoading={transactionsLoading}
        transactionsHasMore={paymentsHasMore}
        transactionsTotal={paymentsTotal}
        onLoadMoreTransactions={() => {}}
        activities={activities}
        activitiesLoading={activitiesLoading}
        activitiesHasMore={activitiesHasMore}
        activitiesTotal={activitiesTotal}
        onLoadMoreActivities={() => {}}
        styles={styles}
        colors={colors}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleTabScroll}
      />

      {/* Visit Modal */}
      <Modal
        visible={showVisitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVisitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(300)} style={styles.visitModalContent}>
            <View style={styles.visitModalHeader}>
              <AppText style={styles.visitModalTitle}>Start Visit</AppText>
              <TouchableOpacity onPress={() => setShowVisitModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.visitModalBody}>
              <View style={styles.visitCustomerInfo}>
                <OutletAvatar outlet={customer} />
                <View>
                  <AppText style={styles.visitCustomerName}>{customer.name}</AppText>
                  <AppText style={styles.visitCustomerAddress}>{customer.address?.line1}</AppText>
                </View>
              </View>

              <View style={styles.visitNoteContainer}>
                <AppText style={styles.visitNoteLabel}>Add Note (Optional)</AppText>
                <TextInput
                  style={styles.visitNoteInput}
                  placeholder="Add any notes about this visit..."
                  placeholderTextColor={colors.textTertiary}
                  value={visitNote}
                  onChangeText={setVisitNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.visitModalFooter}>
              <TouchableOpacity
                style={[styles.visitModalButton, styles.visitModalCancelButton]}
                onPress={() => setShowVisitModal(false)}
              >
                <AppText style={styles.visitModalCancelText}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.visitModalButton, styles.visitModalStartButton]}
                onPress={handleStartVisit}
                disabled={isStartingVisit}
              >
                {isStartingVisit ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <AppText style={styles.visitModalStartText}>Start Visit</AppText>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Sub-components
const LoadingState = ({ styles, colors }: any) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <AppText style={styles.loadingText}>Loading customer details...</AppText>
  </View>
);

const EmptyState = ({ styles, colors }: any) => (
  <View style={styles.emptyState}>
    <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
    <AppText style={styles.emptyStateTitle}>Customer Not Found</AppText>
    <AppText style={styles.emptyStateText}>The customer doesn't exist or was removed.</AppText>
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.emptyStateButton}
      activeOpacity={0.8}
    >
      <AppText style={styles.emptyStateButtonText}>Go Back</AppText>
    </TouchableOpacity>
  </View>
);

const CustomerHeader = ({ customer, styles, colors, onBack, onEdit, onShare, compact }: any) => (
  <Animated.View entering={FadeInDown.duration(400)} style={styles.detailHeader}>
    <View style={[styles.headerTopRow, compact && styles.headerTopRowCompact]}>
      {/* <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity> */}
    </View>

    <View style={[styles.detailHeroCard, compact && styles.detailHeroCardCompact]}>
      <View style={styles.detailHeroTop}>
        <View style={styles.detailAvatarWrap}>
          <OutletAvatar outlet={customer} />
        </View>
        <View style={styles.detailHeaderInfo}>
          <View style={styles.detailTitleRow}>
            <AppText style={styles.detailName} numberOfLines={2}>
              {customer.name}
            </AppText>
            <OutletStatusBadge status={customer.status} />
          </View>
          <AppText style={styles.detailOwner} numberOfLines={1}>
            Managed by {customer.ownerName || 'Unknown'}
          </AppText>
          <View style={styles.detailMetaRow}>
            <View style={styles.detailMetaChip}>
              <Ionicons name="pricetag-outline" size={12} color={colors.primary} />
              <AppText style={styles.detailMetaChipText}>
                {customer.segmentation || customer.customerTypeId || 'General'}
              </AppText>
            </View>
            <View style={styles.detailMetaChip}>
              <Ionicons name="call-outline" size={12} color={colors.primary} />
              <AppText style={styles.detailMetaChipText}>
                {customer.phoneNumber || 'No phone'}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.detailLocationCard}>
        <Ionicons name="location-outline" size={16} color={colors.primary} />
        <AppText style={styles.detailLocation} numberOfLines={2}>
          {customer.address?.line1 || 'Address not available'}
        </AppText>
      </View>
      {/* <View style={styles.detailHeroActions}>
        <TouchableOpacity
          style={[styles.headerActionButtonOutline, { borderColor: colors.primary }]}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <AppText style={[styles.headerActionButtonOutlineText, { color: colors.primary }]}>
            Edit
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerActionButtonOutline, { borderColor: colors.error + '45' }]}
          onPress={onShare}
        >
          <Ionicons name="share-social-outline" size={16} color={colors.error} />
          <AppText style={[styles.headerActionButtonOutlineText, { color: colors.error }]}>
            Share
          </AppText>
        </TouchableOpacity>
      </View> */}
    </View>
  </Animated.View>
);



const VisitBanner = ({ activeVisit, customer, onStartVisit, styles, colors }: any) => {
  if (activeVisit) {
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={[styles.visitBanner, styles.visitBannerActive]}
      >
        <View style={styles.visitBannerContent}>
          <View style={styles.visitBannerIcon}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.visitBannerInfo}>
            <AppText style={styles.visitBannerTitle}>Visit in Progress</AppText>
            <AppText style={styles.visitBannerSubtitle}>
              Started {moment(activeVisit.checkInTime).fromNow()}
            </AppText>
          </View>
          <TouchableOpacity style={styles.visitBannerButton} onPress={onStartVisit}>
            <AppText style={styles.visitBannerButtonText}>Continue</AppText>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.visitBanner}>
      <View style={styles.visitBannerContent}>
        <View style={[styles.visitBannerIcon, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="navigate-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.visitBannerInfo}>
          <AppText style={styles.visitBannerTitle}>Ready to visit?</AppText>
          <AppText style={styles.visitBannerSubtitle}>Start your visit to {customer.name}</AppText>
        </View>
        <TouchableOpacity
          style={[styles.visitBannerButton, { backgroundColor: colors.primary }]}
          onPress={onStartVisit}
        >
          <AppText style={styles.visitBannerButtonText}>Start Visit</AppText>
          <Ionicons name="arrow-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const TabBar = ({ activeTab, setActiveTab, styles, colors }: any) => (
  <View style={styles.tabBar}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => setActiveTab(tab.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={tab.icon as any}
            size={18}
            color={activeTab === tab.key ? colors.primary : colors.textSecondary}
          />
          <AppText style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
            {tab.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const TabContent = ({
  activeTab,
  customer,
  orders,
  ordersLoading,
  ordersHasMore,
  ordersTotal,
  onLoadMoreOrders,
  styles,
  colors,
  refreshing,
  onRefresh,
  onScroll,
  payments,
}: any) => (
  <>
    {activeTab === 'overview' && (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <OverviewTab customer={customer} styles={styles} colors={colors} />
      </ScrollView>
    )}
    {activeTab === 'sales' && (
      <SalesTab
        sales={orders}
        loading={ordersLoading}
        hasMore={ordersHasMore}
        total={ordersTotal}
        onLoadMore={onLoadMoreOrders}
        styles={styles}
        colors={colors}
        onScroll={onScroll}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    )}
    {activeTab === 'transactions' && (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <TransactionsTab
          transactions={payments}
          loading={false}
          hasMore={false}
          total={0}
          onLoadMore={() => {}}
          styles={styles}
          colors={colors}
        />
      </ScrollView>
    )}
    {activeTab === 'contacts' && (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <ContactsTab contacts={customer.contacts || []} styles={styles} colors={colors} />
      </ScrollView>
    )}
    {activeTab === 'activity' && (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <ActivityTab
          activities={[]}
          loading={false}
          hasMore={false}
          total={0}
          onLoadMore={() => {}}
          styles={styles}
          colors={colors}
        />
      </ScrollView>
    )}
  </>
);

// Orders Tab Component
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mapSaleStatus = (status: string): 'COMPLETED' | 'RETURNED' | 'CANCELLED' => {
  switch (status) {
    case 'CONFIRMED':
      return 'COMPLETED';
    case 'RETURNED':
      return 'RETURNED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'COMPLETED';
  }
};

const CURRENCY_CONFIG = {
  code: 'K',
  position: 'prefix' as 'prefix' | 'suffix',
  decimalPlaces: 0,
};

const formatCurrency = (amount: number): string => {
  const formattedAmount = amount.toLocaleString('en-IN', {
    minimumFractionDigits: CURRENCY_CONFIG.decimalPlaces,
    maximumFractionDigits: CURRENCY_CONFIG.decimalPlaces,
  });
  return CURRENCY_CONFIG.position === 'prefix'
    ? `${CURRENCY_CONFIG.code}${formattedAmount}`
    : `${formattedAmount}${CURRENCY_CONFIG.code}`;
};

const SalesTab = ({
  sales,
  loading,
  hasMore,
  total,
  onLoadMore,
  styles,
  colors,
  onSalePress,
  onScroll,
  refreshing,
  onRefresh,
}: any) => {
  const getSaleStatusConfig = useCallback(
    (status: string) => {
      const statusMap: Record<string, { label: string; icon: string; color: string }> = {
        COMPLETED: { label: 'Completed', icon: 'checkmark-circle-outline', color: colors.success },
        RETURNED: { label: 'Returned', icon: 'refresh-circle-outline', color: colors.warning },
        CANCELLED: { label: 'Cancelled', icon: 'close-circle-outline', color: colors.error },
      };
      return statusMap[mapSaleStatus(status)] || statusMap.COMPLETED;
    },
    [colors],
  );

  const getTypeConfig = useCallback(
    (type: SaleItem['type']) =>
      type === 'CREDIT'
        ? { label: 'Credit', icon: 'card-outline', color: colors.warning }
        : { label: 'Cash', icon: 'cash-outline', color: colors.success },
    [colors],
  );

  const getPaymentStatusConfig = useCallback(
    (paymentStatus: SaleItem['paymentStatus']) => {
      const statusMap: Record<string, { label: string; icon: string; color: string }> = {
        PAID: { label: 'Paid', icon: 'wallet-outline', color: colors.success },
        UNPAID: { label: 'Unpaid', icon: 'alert-circle-outline', color: colors.error },
        PARTIAL: { label: 'Partial', icon: 'time-outline', color: colors.warning },
        OVERDUE: { label: 'Overdue', icon: 'warning-outline', color: colors.error },
      };
      return statusMap[paymentStatus] || statusMap.UNPAID;
    },
    [colors],
  );

  const renderSaleCard = ({ item }: { item: SaleItem }) => {
    const saleStatusConfig = getSaleStatusConfig(item.status);
    const typeConfig = getTypeConfig(item.type);
    const paymentStatusConfig = getPaymentStatusConfig(item.paymentStatus);
    const hasPendingAmount = item.type === 'CREDIT' && item.pendingAmount > 0;

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => onSalePress?.(item.saleId)}>
        <View style={styles.orderCardHeader}>
          <View>
            <AppText style={styles.orderNumber}> #{item.saleId}</AppText>
            <AppText style={styles.orderDate}>{formatDate(item.date)}</AppText>
          </View>
          <AppText style={styles.orderAmount}>{formatCurrency(item.totalValue)}</AppText>
        </View>

        <View style={styles.saleTagsRow}>
          {[saleStatusConfig, typeConfig, paymentStatusConfig].map((tag, index) => (
            <View
              key={`${tag.label}-${index}`}
              style={[
                styles.saleTag,
                { backgroundColor: tag.color + '12', borderColor: tag.color + '24' },
              ]}
            >
              <Ionicons name={tag.icon as any} size={12} color={tag.color} />
              <AppText style={[styles.saleTagText, { color: tag.color }]}>{tag.label}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.orderCardBody}>
          <View style={styles.orderStat}>
            <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
            <AppText style={styles.orderStatText}>{item.totalQty} items</AppText>
          </View>
          <View style={styles.orderStat}>
            <Ionicons name="albums-outline" size={14} color={colors.textSecondary} />
            <AppText style={styles.orderStatText}>{item.totalCases || 0} cases</AppText>
          </View>
        </View>

        {hasPendingAmount && (
          <View style={styles.orderPendingBadge}>
            <Ionicons name="alert-circle-outline" size={12} color={colors.warning} />
            <AppText style={styles.orderPendingText}>
              Pending: {formatCurrency(item.pendingAmount)}
            </AppText>
          </View>
        )}

        <View style={styles.orderCardFooter}>
          <AppText style={styles.orderViewDetails}>View Sale</AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (sales.length === 0 && !loading) {
    return (
      <View style={styles.emptyTabContainer}>
        <Ionicons name="receipt-outline" size={56} color={colors.textTertiary} />
        <AppText style={styles.emptyTabTitle}>No Sales</AppText>
        <AppText style={styles.emptyTabText}>No sales found for this customer</AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={sales}
      keyExtractor={(item) => item.saleId}
      renderItem={renderSaleCard}
      contentContainerStyle={styles.tabContentContainer}
      style={styles.tabContent}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListFooterComponent={() =>
        loading && (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

const TransactionsTab = ({
  transactions,
  loading,
  hasMore,
  total,
  onLoadMore,
  styles,
  colors,
}: any) => {
  const formatCurrency = (amount: number) => {
    return `K${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPaymentModeConfig = (mode: string) => {
    const configs: Record<string, { label: string; icon: string; color: string; bgColor: string }> =
      {
        CASH: {
          label: 'Cash',
          icon: 'cash-outline',
          color: '#10B981',
          bgColor: '#10B98112',
        },
        CHEQUE: {
          label: 'Cheque',
          icon: 'document-text-outline',
          color: '#3B82F6',
          bgColor: '#3B82F612',
        },
        BANK_TRANSFER: {
          label: 'Bank Transfer',
          icon: 'business-outline',
          color: '#8B5CF6',
          bgColor: '#8B5CF612',
        },
        UPI: {
          label: 'UPI',
          icon: 'phone-portrait-outline',
          color: '#EC4899',
          bgColor: '#EC489912',
        },
      };
    return configs[mode] || configs.CASH;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: string; color: string; bgColor: string }> =
      {
        SUCCESS: {
          label: 'Success',
          icon: 'checkmark-circle',
          color: '#10B981',
          bgColor: '#10B98112',
        },
        FAILED: {
          label: 'Failed',
          icon: 'close-circle',
          color: '#EF4444',
          bgColor: '#EF444412',
        },
        PENDING: {
          label: 'Pending',
          icon: 'time-outline',
          color: '#F59E0B',
          bgColor: '#F59E0B12',
        },
      };
    return configs[status] || configs.PENDING;
  };

  const renderTransactionCard = ({ item }: { item: any }) => {
    const paymentModeConfig = getPaymentModeConfig(item.paymentMode);
    const statusConfig = getStatusConfig(item.status);
    const isSuccess = item.status === 'SUCCESS';

    return (
      <Animated.View entering={FadeInUp.duration(400).delay(0)}>
        <TouchableOpacity
          style={styles.transactionCard}
          activeOpacity={0.7}
          onPress={() => {
            // Handle transaction details if needed
            console.log('Transaction pressed:', item.paymentId);
          }}
        >
          {/* Header with Icon and Amount */}
          <View style={styles.transactionHeader}>
            <View
              style={[
                styles.transactionIconContainer,
                { backgroundColor: paymentModeConfig.bgColor },
              ]}
            >
              <Ionicons
                name={paymentModeConfig.icon as any}
                size={22}
                color={paymentModeConfig.color}
              />
            </View>
            <View style={styles.transactionInfo}>
              <View style={styles.transactionTitleRow}>
                <AppText style={styles.transactionTitle}>{paymentModeConfig.label}</AppText>
                <View
                  style={[styles.transactionStatusBadge, { backgroundColor: statusConfig.bgColor }]}
                >
                  <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
                  <AppText style={[styles.transactionStatusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </AppText>
                </View>
              </View>
              <AppText style={styles.transactionId}>ID: {item.paymentId}</AppText>
            </View>
            <View style={styles.transactionAmountContainer}>
              <AppText
                style={[
                  styles.transactionAmount,
                  { color: isSuccess ? colors.success : colors.error },
                ]}
              >
                {isSuccess ? '+' : '-'} {formatCurrency(item.amount)}
              </AppText>
              <AppText style={styles.transactionDate}>{formatDate(item.date)}</AppText>
            </View>
          </View>

          {/* Sales Reference Section */}
          {item.sales && item.sales.length > 0 && (
            <View style={styles.transactionSalesSection}>
              <View style={styles.transactionSalesHeader}>
                <Ionicons name="receipt-outline" size={14} color={colors.textSecondary} />
                <AppText style={styles.transactionSalesTitle}>Applied to Sales</AppText>
              </View>
              {item.sales.map((sale: any, index: number) => (
                <View key={sale.saleId || index} style={styles.transactionSaleItem}>
                  <AppText style={styles.transactionSaleId}>#{sale.saleId?.slice(-8)}</AppText>
                  <AppText style={styles.transactionSaleAmount}>
                    {formatCurrency(sale.amount)}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {/* Remark Section */}
          {item.remark && (
            <View style={styles.transactionRemarkSection}>
              <Ionicons name="chatbubble-outline" size={14} color={colors.textTertiary} />
              <AppText style={styles.transactionRemark} numberOfLines={2}>
                {item.remark}
              </AppText>
            </View>
          )}

          {/* Footer with Metadata */}
          <View style={styles.transactionFooter}>
            <View style={styles.transactionMetaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
              <AppText style={styles.transactionMetaText}>
                {new Date(item.createdAt).toLocaleString()}
              </AppText>
            </View>
            {item.referenceNo && (
              <View style={styles.transactionMetaItem}>
                <Ionicons name="document-outline" size={12} color={colors.textTertiary} />
                <AppText style={styles.transactionMetaText}>Ref: {item.referenceNo}</AppText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Loading transactions...</AppText>
      </View>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <View style={styles.emptyTabContainer}>
        <View style={styles.emptyStateIconContainer}>
          <Ionicons name="swap-horizontal-outline" size={56} color={colors.textTertiary} />
        </View>
        <AppText style={styles.emptyTabTitle}>No Transactions</AppText>
        <AppText style={styles.emptyTabText}>No transactions found for this customer</AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.paymentId || item._id}
      renderItem={renderTransactionCard}
      contentContainerStyle={styles.tabContentContainer}
      style={styles.tabContent}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        total > 0 ? (
          <View style={styles.transactionListHeader}>
            <View>
              <AppText style={styles.transactionListTitle}>Payment History</AppText>
              <AppText style={styles.transactionListSubtitle}>
                {total} transaction{total !== 1 ? 's' : ''} found
              </AppText>
            </View>
            <View style={styles.transactionStatsBadge}>
              <Ionicons name="stats-chart-outline" size={14} color={colors.primary} />
              <AppText style={styles.transactionStatsText}>
                Total:{' '}
                {formatCurrency(transactions.reduce((sum: number, t: any) => sum + t.amount, 0))}
              </AppText>
            </View>
          </View>
        ) : null
      }
      ListFooterComponent={() =>
        loading && transactions.length > 0 ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText style={styles.loadingMoreText}>Loading more transactions...</AppText>
          </View>
        ) : hasMore ? (
          <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
            <AppText style={[styles.loadMoreButtonText, { color: colors.primary }]}>
              Load More
            </AppText>
          </TouchableOpacity>
        ) : transactions.length > 0 ? (
          <View style={styles.endOfListContainer}>
            <View style={styles.endOfListLine} />
            <View style={styles.endOfListBadge}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.textTertiary} />
              <AppText style={styles.endOfListText}>End of transactions</AppText>
            </View>
            <View style={styles.endOfListLine} />
          </View>
        ) : null
      }
    />
  );
};

const ContactsTab = ({ contacts, styles, colors }: any) => {
  if (!contacts || contacts.length === 0) {
    return (
      <View style={styles.emptyTabContainer}>
        <Ionicons name="people-outline" size={56} color={colors.textTertiary} />
        <AppText style={styles.emptyTabTitle}>No Contacts</AppText>
        <AppText style={styles.emptyTabText}>No contacts found for this customer</AppText>
      </View>
    );
  }

  return (
    <View style={styles.tabContentContainer}>
      {contacts.map((contact: any, index: number) => (
        <View key={`${contact.phone}-${index}`} style={styles.contactCard}>
          <View style={styles.contactAvatar}>
            <AppText style={styles.contactInitials}>
              {contact.name
                ?.split(' ')
                .map((part: string) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AppText>
          </View>
          <View style={styles.contactInfo}>
            <View style={styles.contactNameRow}>
              <AppText style={styles.contactName}>{contact.name}</AppText>
              {contact.role ? (
                <View style={styles.contactRoleBadge}>
                  <AppText style={styles.contactRoleBadgeText}>{contact.role}</AppText>
                </View>
              ) : null}
            </View>
            <AppText style={styles.contactRole}>{contact.phone}</AppText>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactActionButton}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              >
                <Ionicons name="call-outline" size={14} color={colors.primary} />
                <AppText style={styles.contactActionText}>Call</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactActionButton}
                onPress={() =>
                  Linking.openURL(`https://wa.me/${contact.phone?.replace(/[^0-9]/g, '')}`)
                }
              >
                <Ionicons name="logo-whatsapp" size={14} color={colors.success} />
                <AppText style={styles.contactActionText}>WhatsApp</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const ActivityTab = ({ activities, loading, hasMore, total, onLoadMore, styles, colors }: any) => {
  if (activities.length === 0 && !loading) {
    return (
      <View style={styles.emptyTabContainer}>
        <Ionicons name="time-outline" size={56} color={colors.textTertiary} />
        <AppText style={styles.emptyTabTitle}>No Activity</AppText>
        <AppText style={styles.emptyTabText}>No recent activity found</AppText>
      </View>
    );
  }
  return null;
};

const OverviewTab = ({ customer, styles, colors }: any) => (
  <View style={styles.overviewContainer}>
    {/* Stats Row - Credit Limit, Credit Days, Outstanding, Last Visit */}
    {/* <StatsRow customer={customer} styles={styles} colors={colors} /> */}

    {/* Financial Overview Section */}
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionHeaderIcon, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="wallet-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.sectionHeaderText}>
          <AppText style={styles.sectionTitle}>Financial Overview</AppText>
          <AppText style={styles.sectionSubtitle}>Credit and payment summary</AppText>
        </View>
      </View>

      <View style={styles.financialGrid}>
        <View style={styles.financialCard}>
          <AppText style={styles.financialLabel}>Credit Limit</AppText>
          <AppText style={[styles.financialValue, { color: colors.primary }]}>
            {customer.creditLimit ? formatCurrency(customer.creditLimit) : 'K 0'}
          </AppText>
        </View>
        <View style={styles.financialCard}>
          <AppText style={styles.financialLabel}>Credit Days</AppText>
          <AppText style={[styles.financialValue, { color: colors.info }]}>
            {customer.creditDays ? `${customer.creditDays} days` : 'N/A'}
          </AppText>
        </View>
        <View style={styles.financialCard}>
          <AppText style={styles.financialLabel}>Outstanding</AppText>
          <AppText style={[styles.financialValue, { color: colors.warning }]}>
            {customer.outstanding ? formatCurrency(customer.outstanding) : 'K 0'}
          </AppText>
        </View>
        <View style={styles.financialCard}>
          <AppText style={styles.financialLabel}>Last Visit</AppText>
          <AppText style={[styles.financialValue, { color: colors.success }]}>
            {customer.lastVisitedAt ? moment(customer.lastVisitedAt).format('DD MMM YYYY') : 'Never'}
          </AppText>
        </View>
      </View>

      {/* {customer.outstanding && customer.creditLimit && (
        <View style={styles.creditUtilization}>
          <View style={styles.creditUtilizationHeader}>
            <AppText style={styles.creditUtilizationLabel}>Credit Utilization</AppText>
            <AppText style={styles.creditUtilizationPercent}>
              {Math.round((customer.outstanding / customer.creditLimit) * 100)}%
            </AppText>
          </View>
          <View style={styles.creditUtilizationBar}>
            <View 
              style={[
                styles.creditUtilizationFill, 
                { 
                  width: `${Math.min((customer.outstanding / customer.creditLimit) * 100, 100)}%`,
                  backgroundColor: (customer.outstanding / customer.creditLimit) > 0.8 ? colors.error : colors.success
                }
              ]} 
            />
          </View>
        </View>
      )} */}
    </View>

    {/* Business Details Section */}
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionHeaderIcon, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="business-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.sectionHeaderText}>
          <AppText style={styles.sectionTitle}>Business Details</AppText>
          <AppText style={styles.sectionSubtitle}>Classification and account settings</AppText>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Business Type</AppText>
          <AppText style={styles.infoValue}>{customer.customerTypeId || 'N/A'}</AppText>
        </View>
        
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Category</AppText>
          <AppText style={styles.infoValue}>{customer.customerCategoryId || 'N/A'}</AppText>
        </View>
        
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Channel</AppText>
          <AppText style={styles.infoValue}>{customer.channelId || 'N/A'}</AppText>
        </View>
        
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Market</AppText>
          <AppText style={styles.infoValue}>{customer.marketId || 'N/A'}</AppText>
        </View>
        
        <View style={styles.infoRow}>
          <AppText style={styles.infoLabel}>Segmentation</AppText>
          <View style={[styles.segmentationBadge, { backgroundColor: getSegmentationColor(customer.segmentation) + '15' }]}>
            <AppText style={[styles.segmentationText, { color: getSegmentationColor(customer.segmentation) }]}>
              {customer.segmentation || 'Standard'}
            </AppText>
          </View>
        </View>
      </View>
    </View>

    {/* Contact Information Section */}
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionHeaderIcon, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="call-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.sectionHeaderText}>
          <AppText style={styles.sectionTitle}>Contact Information</AppText>
          <AppText style={styles.sectionSubtitle}>Quick actions for calling and navigation</AppText>
        </View>
      </View>

      {customer.phoneNumber && (
        <TouchableOpacity 
          style={styles.contactRow} 
          onPress={() => Linking.openURL(`tel:${customer.phoneNumber}`)}
          activeOpacity={0.7}
        >
          <View style={styles.detailContactIcon}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
          </View>
          <AppText style={styles.detailContactText}>{customer.phoneNumber}</AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {customer.phoneNumber && (
        <TouchableOpacity 
          style={styles.contactRow} 
          onPress={() => Linking.openURL(`https://wa.me/${customer.phoneNumber.replace(/[^0-9]/g, '')}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.detailContactIcon, { backgroundColor: colors.success + '10' }]}>
            <Ionicons name="logo-whatsapp" size={18} color={colors.success} />
          </View>
          <AppText style={styles.detailContactText}>{customer.phoneNumber}</AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {customer.address?.line1 && (
        <TouchableOpacity 
          style={styles.contactRow} 
          onPress={() => Linking.openURL(getMapUrl(customer.address))}
          activeOpacity={0.7}
        >
          <View style={[styles.detailContactIcon, { backgroundColor: colors.info + '10' }]}>
            <Ionicons name="location-outline" size={18} color={colors.info} />
          </View>
          <AppText style={styles.detailContactText} numberOfLines={1}>
            {customer.address.line1}{customer.address.line2 ? `, ${customer.address.line2}` : ''}
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {customer.email && (
        <TouchableOpacity 
          style={styles.contactRow} 
          onPress={() => Linking.openURL(`mailto:${customer.email}`)}
          activeOpacity={0.7}
        >
          <View style={[styles.detailContactIcon, { backgroundColor: colors.warning + '10' }]}>
            <Ionicons name="mail-outline" size={18} color={colors.warning} />
          </View>
          <AppText style={styles.detailContactText} numberOfLines={1}>{customer.email}</AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// StatsRow Component - Shows Credit Limit, Credit Days, Outstanding, Last Visit
const StatsRow = ({ customer, styles, colors }: any) => (
  <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.detailStatsRow}>
    {[
      {
        icon: 'cash-outline',
        value: customer.creditLimit ? formatCurrency(customer.creditLimit) : 'N/A',
        label: 'Credit Limit',
        color: colors.primary,
      },
      {
        icon: 'calendar-outline',
        value: customer.creditDays ? `${customer.creditDays}d` : 'N/A',
        label: 'Credit Days',
        color: colors.info,
      },
      {
        icon: 'wallet-outline',
        value: customer.outstanding ? formatCurrency(customer.outstanding) : 'K 0',
        label: 'Outstanding',
        color: colors.warning,
      },
      {
        icon: 'time-outline',
        value: customer.lastVisitedAt ? moment(customer.lastVisitedAt).format('DD MMM') : 'Never',
        label: 'Last Visit',
        color: colors.success,
      },
    ].map((stat, i) => (
      <View key={i} style={styles.detailStatCard}>
        <View style={[styles.detailStatIconWrap, { backgroundColor: stat.color + '10' }]}>
          <Ionicons name={stat.icon as any} size={20} color={stat.color} />
        </View>
        <AppText style={styles.detailStatValue} numberOfLines={1}>
          {stat.value}
        </AppText>
        <AppText style={styles.detailStatLabel}>{stat.label}</AppText>
      </View>
    ))}
  </Animated.View>
);

// Helper function for segmentation colors
const getSegmentationColor = (segmentation: string): string => {
  const { colors } = useTheme();
  switch (segmentation?.toLowerCase()) {
    case 'platinum':
    case 'premium':
      return colors?.success || '#10B981';
    case 'gold':
    case 'high':
      return colors?.warning || '#F59E0B';
    case 'silver':
    case 'medium':
      return colors?.info || '#3B82F6';
    case 'bronze':
    case 'low':
      return colors?.error || '#EF4444';
    default:
      return colors?.primary || '#8B5CF6';
  }
};



const Section = ({ title, subtitle, icon, children, styles, colors }: any) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.sectionHeaderText}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        {subtitle ? <AppText style={styles.sectionSubtitle}>{subtitle}</AppText> : null}
      </View>
    </View>
    {children}
  </View>
);

const InfoRow = ({ label, value, styles }: any) => (
  <View style={styles.infoRow}>
    <AppText style={styles.infoLabel}>{label}</AppText>
    <AppText style={styles.infoValue}>{value}</AppText>
  </View>
);

const getMapUrl = (address: { line1: string; line2?: string } | undefined) => {
  if (!address || !address.line1) return 'https://maps.google.com';
  const addressString = `${address.line1}${address.line2 ? ', ' + address.line2 : ''}`;
  const encoded = encodeURIComponent(addressString);
  return Platform.select({
    ios: `maps:0,0?q=${encoded}`,
    android: `geo:0,0?q=${encoded}`,
    default: `https://maps.google.com/?q=${encoded}`,
  });
};
