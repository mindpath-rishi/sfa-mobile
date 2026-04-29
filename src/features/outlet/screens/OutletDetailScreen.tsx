// app/customers/[id].tsx

import React, { useCallback, useEffect, useState, useRef } from 'react';
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
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';

import { outletService } from '../services/outlet.service';
import { useAuthStore } from '@/core/store/auth.store';
import { Outlet } from '../types/outlet.types';
import { useOutletStore } from '@/core/store/outlet.store';
import { useRouteStore } from '@/core/store/route.store';
import moment from 'moment';
import { saleService } from '@/shared/services/sale.service';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { OutletAvatar, OutletStatusBadge } from '../components/outlet';
import { useOutletDetailStyles } from '../styles/OutletDetail.styles';
import { getDistance, isInsideGeofence } from '@/shared/utils/geofence.utils';

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

interface VisitHistory {
  visitId: string;
  outletId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  note?: string;
}

type TabType = 'summary' | 'sales' | 'visits';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'summary', label: 'Summary', icon: 'stats-chart-outline' },
  { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
  { key: 'visits', label: 'Visits', icon: 'time-outline' },
];

const PAGE_SIZE = 10;
const GEOFENCE_RADIUS = 100;

export default function CustomerDetailScreen() {
  const { colors } = useTheme();
  const styles = useOutletDetailStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<Outlet | null>(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitNote, setVisitNote] = useState('');
  const [isStartingVisit, setIsStartingVisit] = useState(false);
  const [isTabScrolled, setIsTabScrolled] = useState(false);
  
  // Geofencing states
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isInsideGeofence, setIsInsideGeofence] = useState(false);
  const [distanceToOutlet, setDistanceToOutlet] = useState<number | null>(null);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);

  // Sales states
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  
  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    mySales: {
      mtdOrderValue: 0,
      mtdOrderQty: 0,
      avgOrderValue: 0,
      avgOrderQty: 0,
      lpc: 0,
    },
    outletSales: {
      mtdOrderValue: 0,
      mtdOrderQty: 0,
      avgOrderValue: 0,
      avgOrderQty: 0,
      lpc: 0,
    },
  });

  // Visit history states
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsTotal, setVisitsTotal] = useState(0);

  // Refs
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateListener = useRef<any>(null);

  const route = useRouteStore((s) => s.selectedRoute);
  const van = useRouteStore((s) => s.van);
  const user = useAuthStore((s) => s.user);
  const activeVisit = useOutletStore((s) => s.activeVisit);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const { setSelectedOutlet } = useOutletStore();

  // Load customer data
  useEffect(() => {
    loadCustomerData();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (customer) {
        loadSalesHistory();
        loadVisitHistory();
        loadSummaryStats();
      }
    }, [customer]),
  );

  // Start/stop geofence tracking
  useEffect(() => {
    if (customer?.geoTag?.lat && customer?.geoTag?.lng) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [customer]);

  // Auto-start visit when inside geofence
  useEffect(() => {
    if (isInsideGeofence && !activeVisit && !autoStartAttempted && customer) {
      autoStartVisit();
    }
  }, [isInsideGeofence, activeVisit, autoStartAttempted, customer]);

  // App state listener
  useEffect(() => {
    appStateListener.current = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && customer?.geoTag?.lat) {
        getCurrentLocation();
      }
    });

    return () => {
      appStateListener.current?.remove();
    };
  }, [customer]);

  useEffect(() => {
    setIsTabScrolled(false);
  }, [activeTab]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace(`/beats`);
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Location tracking functions
  const getCurrentLocation = useCallback(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position, "got location from web geolocation");
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          checkGeofenceStatus(latitude, longitude);
        },
        (error) => {
          console.log('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
  }, []);

  const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
    console.log(`Checking geofence status for location: ${lat}, ${lng}`);
    if (!customer?.geoTag?.lat || !customer?.geoTag?.lng) return;

    const distance = getDistance(lat, lng, customer.geoTag.lat, customer.geoTag.lng);
    console.log(`Distance to outlet: ${distance} meters`);
    setDistanceToOutlet(distance);
    console.log(`Geofence status for location: ${lat}, ${lng}, ${customer}`);
    const inside = distance <= GEOFENCE_RADIUS;
    setIsInsideGeofence(inside);
  }, [customer]);

  const startLocationTracking = useCallback(() => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }

    getCurrentLocation();
    locationInterval.current = setInterval(() => {
      getCurrentLocation();
    }, 5000);
  }, [getCurrentLocation]);

  const stopLocationTracking = useCallback(() => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  }, []);

  // Auto-start visit
  const autoStartVisit = useCallback(async () => {
    if (!customer || activeVisit || autoStartAttempted) return;

    setAutoStartAttempted(true);

    try {
      const payload: any = {
        routeSessionId: route?.routeSessionId,
        workSessionId: route?.workSessionId,
        vanId: route?.vanId,
        outletId: customer.customerId,
        autoStarted: true,
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
      }
    } catch (error) {
      console.error('Auto-start visit failed:', error);
      setAutoStartAttempted(false);
    }
  }, [customer, activeVisit, autoStartAttempted, route, setActiveVisit]);

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

  const loadSummaryStats = async () => {
    if (!customer?.customerId) return;
    
    try {
      const params = {
        customerId: customer.customerId,
        vanId: van?.vanId,
        employeeId: user?.userId,
      };
      
      const response = await saleService.getCustomerSummaryStats(params);
      if (response?.data) {
        setSummaryStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load summary stats:', error);
    }
  };

  const loadSalesHistory = async () => {
    if (!customer?.customerId) return;
    
    setSalesLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 10,
        customerId: customer.customerId,
        vanId: van?.vanId,
        employeeId: user?.userId,
      };
      const response: any = await saleService.fetchSales(params);
      
      const salesData = response?.data || [];
      setSales(salesData);
      setSalesTotal(response?.total || 0);
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      setSalesLoading(false);
    }
  };

  const loadVisitHistory = async () => {
    if (!customer?.customerId) return;
    
    setVisitsLoading(true);
    try {
      const response = await outletService.getVisitHistory({
        customerId: customer.customerId,
        limit: 10,
        page: 1,
      });
      
      const visits = response?.data || [];
      setVisitHistory(visits);
      setVisitsTotal(response?.total || 0);
    } catch (error) {
      console.error('Failed to load visit history:', error);
    } finally {
      setVisitsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomerData();
    await loadSalesHistory();
    await loadVisitHistory();
    await loadSummaryStats();
    setRefreshing(false);
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
        router.push(`/route/${customer?.customerId}/visit`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start visit');
    } finally {
      setIsStartingVisit(false);
    }
  }, [customer, route]);

  const handleContinueVisit = useCallback(() => {
    if (activeVisit && customer) {
      router.push(`/route/${customer?.customerId}/visit`);
    }
  }, [activeVisit, customer]);

  const handleContinueToSale = useCallback(() => {
    if (customer) {
      router.push(`/sales/create?customerId=${customer.customerId}`);
    }
  }, [customer]);

  const handleTabScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsTabScrolled((previous) => {
      if (offsetY > 24 && !previous) return true;
      if (offsetY <= 12 && previous) return false;
      return previous;
    });
  }, []);

  const formatCurrency = (amount: number): string => {
    return `ZMW ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
  };

  if (isLoading) return <LoadingState styles={styles} colors={colors} />;
  if (!customer) return <EmptyState styles={styles} colors={colors} />;

  const lastOrderDate = sales.length > 0 ? sales[0]?.date : customer.lastOrderDate;
  const lastVisitDate = customer.lastVisitedAt;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomerHeader
        customer={customer}
        styles={styles}
        colors={colors}
        compact={isTabScrolled}
        lastVisitDate={lastVisitDate}
        lastOrderDate={lastOrderDate}
      />

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />

      <TabContent
        activeTab={activeTab}
        customer={customer}
        summaryStats={summaryStats}
        sales={sales}
        salesLoading={salesLoading}
        salesTotal={salesTotal}
        visitHistory={visitHistory}
        visitsLoading={visitsLoading}
        visitsTotal={visitsTotal}
        styles={styles}
        colors={colors}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleTabScroll}
        formatCurrency={formatCurrency}
      />

      {/* Footer Buttons */}
      {activeVisit && activeVisit?.customerId === customer?.customerId &&<View style={styles.footerButtons}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: colors.success }]}
          onPress={handleContinueToSale}
        >
          <Ionicons name="cart-outline" size={20} color="#FFF" />
          <AppText style={styles.footerButtonText}>Continue to Sale</AppText>
        </TouchableOpacity>
      </View>}

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

const CustomerHeader = ({ customer, styles, colors, compact, lastVisitDate, lastOrderDate }: any) => (
  <Animated.View entering={FadeInDown.duration(400)} style={styles.detailHeader}>
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
            {customer.ownerName || 'Unknown'}
          </AppText>
          
          <View style={styles.detailDatesRow}>
            <View style={styles.detailDateChip}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <AppText style={styles.detailDateLabel}>Last Visited:</AppText>
              <AppText style={styles.detailDateValue}>
                {lastVisitDate ? moment(lastVisitDate).format('DD MMM YYYY') : 'Never'}
              </AppText>
            </View>
            <View style={styles.detailDateChip}>
              <Ionicons name="receipt-outline" size={12} color={colors.textSecondary} />
              <AppText style={styles.detailDateLabel}>Last Ordered:</AppText>
              <AppText style={styles.detailDateValue}>
                {lastOrderDate ? moment(lastOrderDate).format('DD MMM YYYY') : 'Never'}
              </AppText>
            </View>
          </View>

          <View style={styles.detailMetaRow}>
            <View style={styles.detailMetaChip}>
              <Ionicons name="business-outline" size={12} color={colors.primary} />
              <AppText style={styles.detailMetaChipText}>
                {customer.customerTypeId || 'Van Sales'}
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
          {customer.address?.line1 || customer.address || 'Address not available'}
        </AppText>
      </View>
    </View>
  </Animated.View>
);

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
  summaryStats,
  sales,
  salesLoading,
  salesTotal,
  visitHistory,
  visitsLoading,
  visitsTotal,
  styles,
  colors,
  refreshing,
  onRefresh,
  onScroll,
  formatCurrency,
}: any) => (
  <>
    {activeTab === 'summary' && (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <SummaryTab 
          customer={customer}
          summaryStats={summaryStats}
          styles={styles}
          colors={colors}
          formatCurrency={formatCurrency}
        />
      </ScrollView>
    )}
    {activeTab === 'sales' && (
      <SalesTab
        sales={sales}
        loading={salesLoading}
        total={salesTotal}
        styles={styles}
        colors={colors}
        onScroll={onScroll}
        refreshing={refreshing}
        onRefresh={onRefresh}
        formatCurrency={formatCurrency}
      />
    )}
    {activeTab === 'visits' && (
      <VisitsTab
        visits={visitHistory}
        loading={visitsLoading}
        total={visitsTotal}
        styles={styles}
        colors={colors}
        onScroll={onScroll}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    )}
  </>
);

// Summary Tab
const SummaryTab = ({ customer, summaryStats, styles, colors, formatCurrency }: any) => (
  <View style={styles.summaryContainer}>
    <View style={styles.salesSectionCard}>
      <AppText style={styles.sectionTitle}>My Sales</AppText>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <AppText style={styles.statValue}>{formatCurrency(summaryStats.mySales.mtdOrderValue)}</AppText>
          <AppText style={styles.statLabel}>MTD</AppText>
          <AppText style={styles.statSubLabel}>TOTAL ORDER VALUE</AppText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <AppText style={styles.statValue}>{summaryStats.mySales.mtdOrderQty}</AppText>
          <AppText style={styles.statLabel}>MTD</AppText>
          <AppText style={styles.statSubLabel}>TOTAL ORDER QTY</AppText>
        </View>
      </View>

      <View style={styles.statsRowSmall}>
        <View style={styles.statBoxSmall}>
          <AppText style={styles.statValueSmall}>{formatCurrency(summaryStats.mySales.avgOrderValue)}</AppText>
          <AppText style={styles.statLabelSmall}>LAST 5 ORDERS</AppText>
          <AppText style={styles.statSubLabelSmall}>AVG. ORDER VALUE</AppText>
        </View>
        <View style={styles.statBoxSmall}>
          <AppText style={styles.statValueSmall}>{summaryStats.mySales.avgOrderQty}</AppText>
          <AppText style={styles.statLabelSmall}>LAST 5 ORDERS</AppText>
          <AppText style={styles.statSubLabelSmall}>AVG. ORDER QTY</AppText>
        </View>
        <View style={styles.statBoxSmall}>
          <AppText style={styles.statValueSmall}>{summaryStats.mySales.lpc}</AppText>
          <AppText style={styles.statLabelSmall}>LAST 5 ORDERS</AppText>
          <AppText style={styles.statSubLabelSmall}>LPC</AppText>
        </View>
      </View>
    </View>

    <View style={styles.salesSectionCard}>
      <AppText style={styles.sectionTitle}>Outlet Sales</AppText>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <AppText style={styles.statValue}>{formatCurrency(summaryStats.outletSales.mtdOrderValue)}</AppText>
          <AppText style={styles.statLabel}>MTD</AppText>
          <AppText style={styles.statSubLabel}>TOTAL ORDER VALUE</AppText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <AppText style={styles.statValue}>{summaryStats.outletSales.mtdOrderQty}</AppText>
          <AppText style={styles.statLabel}>MTD</AppText>
          <AppText style={styles.statSubLabel}>TOTAL ORDER QTY</AppText>
        </View>
      </View>

      <View style={styles.statsRowSmall}>
        <View style={styles.statBoxSmall}>
          <AppText style={styles.statValueSmall}>{formatCurrency(summaryStats.outletSales.avgOrderValue)}</AppText>
          <AppText style={styles.statLabelSmall}>LAST 5 ORDERS</AppText>
          <AppText style={styles.statSubLabelSmall}>AVG. ORDER VALUE</AppText>
        </View>
        <View style={styles.statBoxSmall}>
          <AppText style={styles.statValueSmall}>{summaryStats.outletSales.avgOrderQty}</AppText>
          <AppText style={styles.statLabelSmall}>LAST 5 ORDERS</AppText>
          <AppText style={styles.statSubLabelSmall}>AVG. ORDER QTY</AppText>
        </View>
        <View style={styles.statBoxSmall}>
          <AppText style={styles.statValueSmall}>{summaryStats.outletSales.lpc}</AppText>
          <AppText style={styles.statLabelSmall}>LAST 5 ORDERS</AppText>
          <AppText style={styles.statSubLabelSmall}>LPC</AppText>
        </View>
      </View>
    </View>
  </View>
);

// Sales Tab
const SalesTab = ({ sales, loading, total, styles, colors, onScroll, refreshing, onRefresh, formatCurrency }: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD MMM YYYY');
  };

  const renderSaleCard = ({ item }: { item: SaleItem }) => (
    <View style={styles.saleCard}>
      <View style={styles.saleCardHeader}>
        <View>
          <AppText style={styles.saleId}>#{item.saleId?.slice(-8)}</AppText>
          <AppText style={styles.saleDate}>{formatDate(item.date)}</AppText>
        </View>
        <AppText style={[styles.saleAmount, { color: colors.primary }]}>
          {formatCurrency(item.totalValue)}
        </AppText>
      </View>
      
      <View style={styles.saleCardBody}>
        <View style={styles.saleStat}>
          <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
          <AppText style={styles.saleStatText}>{item.totalCases} Cases</AppText>
        </View>
        <View style={styles.saleStat}>
          <Ionicons name="albums-outline" size={14} color={colors.textSecondary} />
          <AppText style={styles.saleStatText}>{item.totalPieces || 0} PCS</AppText>
        </View>
      </View>
    </View>
  );

  if (loading && sales.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Loading sales...</AppText>
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
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        sales.length > 0 && (
          <View style={styles.listHeader}>
            <AppText style={styles.listHeaderTitle}>Last {Math.min(sales.length, 10)} Sales</AppText>
            {total > 10 && (
              <AppText style={styles.listHeaderSubtitle}>Showing last 10 of {total} total</AppText>
            )}
          </View>
        )
      }
      ListEmptyComponent={
        !loading && (
          <View style={styles.emptyTabContainer}>
            <Ionicons name="receipt-outline" size={56} color={colors.textTertiary} />
            <AppText style={styles.emptyTabTitle}>No Sales</AppText>
            <AppText style={styles.emptyTabText}>No sales found for this customer</AppText>
          </View>
        )
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

// Visits Tab
const VisitsTab = ({ visits, loading, total, styles, colors, onScroll, refreshing, onRefresh }: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD MMM YYYY, hh:mm A');
  };

  const getDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return 'In progress';
    const start = moment(checkIn);
    const end = moment(checkOut);
    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.success;
      case 'ACTIVE':
        return colors.primary;
      default:
        return colors.warning;
    }
  };

  const renderVisitCard = ({ item }: { item: VisitHistory }) => (
    <View style={styles.visitCard}>
      <View style={styles.visitCardHeader}>
        <View style={[styles.visitStatusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <AppText style={styles.visitDate}>{formatDate(item.checkInTime)}</AppText>
        <View style={[styles.visitDurationBadge, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="time-outline" size={12} color={colors.primary} />
          <AppText style={styles.visitDuration}>{getDuration(item.checkInTime, item.checkOutTime)}</AppText>
        </View>
      </View>
      {item.note && (
        <View style={styles.visitNote}>
          <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
          <AppText style={styles.visitNoteText}>{item.note}</AppText>
        </View>
      )}
    </View>
  );

  if (loading && visits.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Loading visits...</AppText>
      </View>
    );
  }

  return (
    <FlatList
      data={visits}
      keyExtractor={(item) => item.visitId}
      renderItem={renderVisitCard}
      contentContainerStyle={styles.tabContentContainer}
      style={styles.tabContent}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        visits.length > 0 && (
          <View style={styles.listHeader}>
            <AppText style={styles.listHeaderTitle}>Last {Math.min(visits.length, 10)} Visits</AppText>
            {total > 10 && (
              <AppText style={styles.listHeaderSubtitle}>Showing last 10 of {total} total</AppText>
            )}
          </View>
        )
      }
      ListEmptyComponent={
        !loading && (
          <View style={styles.emptyTabContainer}>
            <Ionicons name="time-outline" size={56} color={colors.textTertiary} />
            <AppText style={styles.emptyTabTitle}>No Visits</AppText>
            <AppText style={styles.emptyTabText}>No visit history found for this customer</AppText>
          </View>
        )
      }
      showsVerticalScrollIndicator={false}
    />
  );
};