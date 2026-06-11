import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Platform,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  BackHandler,
  AppState,
  StatusBar,
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
import { useHeader } from '@/shared/contexts/HeaderContext';

// Types
export enum ShopVisitType {
  ON_SITE = 'ON_SITE',
  OFF_SITE = 'OFF_SITE',
}

interface SaleItemDetail {
  productId: string;
  productName: string;
  productCategory?: string;
  category?: string;
  quantity: number;
  cases: number;
  pieces: number;
  price: number;
  total: number;
}

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
  items?: SaleItemDetail[];
  productCategory?: string;
}

interface VisitHistory {
  visitId: string;
  outletId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  note?: string;
  visitType?: ShopVisitType;
}

type TabType = 'summary' | 'sales' | 'invoices' | 'visits';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'summary', label: 'Summary', icon: 'stats-chart-outline' },
  { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
  { key: 'invoices', label: 'Last 10 Invoice', icon: 'document-text-outline' },
  { key: 'visits', label: 'Visits', icon: 'time-outline' },
];

const PAGE_SIZE = 10;
const GEOFENCE_RADIUS = 100; // meters

export default function CustomerDetailScreen() {
  const customerRef = useRef<Outlet | null>(null);
  const { colors } = useTheme();
  const styles = useOutletDetailStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<Outlet | null>(null);
  const [isTabScrolled, setIsTabScrolled] = useState(false);
  const clearVisit = useOutletStore((s) => s.clearVisit);

  // Geofencing states
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isInsideGeofenceArea, setIsInsideGeofenceArea] = useState(false);
  const [distanceToOutlet, setDistanceToOutlet] = useState<number | null>(null);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [isAutoStarting, setIsAutoStarting] = useState(false);

  // Sales states
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);

  // Visit history states
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsTotal, setVisitsTotal] = useState(0);

  // Refs
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateListener = useRef<any>(null);
  const autoStartTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const route = useRouteStore((s) => s.selectedRoute);
  const van = useRouteStore((s) => s.van);
  const user = useAuthStore((s) => s.user);
  const activeVisit = useOutletStore((s) => s.activeVisit);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const { setSelectedOutlet } = useOutletStore();
  const { setHeader } = useHeader();
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (activeVisit?.customerId === customer?.customerId) {
      hasTriggeredRef.current = true;
    }
  }, [activeVisit, customer]);

  // Load customer data
  useEffect(() => {
    loadCustomerData();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (customer) {
        checkActiveVisit();
        loadSalesHistory();
        loadVisitHistory();
      }
    }, [customer]),
  );

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: route?.routeName || customer?.name || 'Outlet Details',
        showBack: true,
        showMenu: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, customer?.name, route?.routeName, setHeader]),
  );

  useEffect(() => {
    customerRef.current = customer;
  }, [customer]);

  // Reset auto-start attempt when customer changes or visit ends
  useEffect(() => {
    setAutoStartAttempted(false);
    setIsAutoStarting(false);
  }, [customer?.customerId, activeVisit]);

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

  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [customer?.customerId]);

  // Auto-start visit when inside geofence OR outside geofence (always auto-start if no active visit)
  useEffect(() => {
    // Auto-start visit when there's no active visit, regardless of geofence status
    const shouldAutoStart = !activeVisit && customer && !hasTriggeredRef.current;

    if (shouldAutoStart) {
      autoStartVisit();
    }
  }, [customer]);

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

  // Location tracking functions
  const getCurrentLocation = useCallback(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          checkGeofenceStatus(latitude, longitude);
        },
        (error) => console.warn('Error getting location:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    }
  }, []);

  const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
    const currentCustomer = customerRef.current;

    if (!currentCustomer?.geoTag?.lat || !currentCustomer?.geoTag?.lng) {
      return;
    }

    const distance = getDistance(lat, lng, currentCustomer.geoTag.lat, currentCustomer.geoTag.lng);
    setDistanceToOutlet(distance);

    const geofence = {
      id: currentCustomer.customerId,
      latitude: currentCustomer.geoTag.lat,
      longitude: currentCustomer.geoTag.lng,
      radius: GEOFENCE_RADIUS,
    };

    const inside = isInsideGeofence(lat, lng, geofence);
    setIsInsideGeofenceArea(inside);
  }, []);

  const startLocationTracking = useCallback(() => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }

    getCurrentLocation();
    locationInterval.current = setInterval(() => {
      getCurrentLocation();
    }, 3000);
  }, [getCurrentLocation]);

  const stopLocationTracking = useCallback(() => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  }, []);

  // Determine visit type based on geotag and geofence status
  const getVisitType = useCallback((): ShopVisitType => {
    // If customer has geotag and user is inside geofence, it's ON_SITE
    if (customer?.geoTag?.lat && customer?.geoTag?.lng && isInsideGeofenceArea) {
      return ShopVisitType.ON_SITE;
    }
    // Otherwise it's OFF_SITE (no geotag OR outside geofence)
    return ShopVisitType.OFF_SITE;
  }, [customer?.geoTag?.lat, customer?.geoTag?.lng, isInsideGeofenceArea]);

  // Check if there's an active visit and set it
  const checkActiveVisit = async () => {
    if (!customer?.customerId) return;

    try {
      const query: any = {
        workSessionId: selectedRoute?.workSessionId,
        vanId: van?.vanId,
        routeSessionId: selectedRoute?.routeSessionId,
        outletId: customer.customerId,
      };

      const response = await outletService.visitStatus(query);
      const visit: any = response?.data;

      if (visit?.visitId && visit?.status === 'ACTIVE') {
        // Get current visit type based on location
        const visitType = getVisitType();

        setActiveVisit({
          visitId: visit.visitId,
          outlet: customer as any,
          checkInTime: new Date(visit.checkInTime),
          checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
          status: visit.status,
          routeSessionId: visit?.routeSessionId,
          customerId: visit?.customerId,
          visitType: visitType,
        });
        hasTriggeredRef.current = true;
      } else if (!visit?.visitId) {
        clearVisit();
      }
    } catch (error) {
      console.error('checkActiveVisit error:', error);
    }
  };

  // Auto-start visit - Automatically starts ON_SITE or OFF_SITE visit
  const autoStartVisit = useCallback(async () => {
    if (!customer || autoStartAttempted || isAutoStarting) {
      return;
    }

    setIsAutoStarting(true);
    setAutoStartAttempted(true);

    if (autoStartTimeout.current) {
      clearTimeout(autoStartTimeout.current);
    }

    autoStartTimeout.current = setTimeout(async () => {
      try {
        // First check if there's already an active visit for this customer
        const visitStatusQuery: any = {
          workSessionId: selectedRoute?.workSessionId,
          vanId: van?.vanId,
          routeSessionId: selectedRoute?.routeSessionId,
          outletId: customer.customerId,
        };

        const visitStatusResponse = await outletService.visitStatus(visitStatusQuery);
        const existingVisit: any = visitStatusResponse?.data;

        // If there's an active visit, set it and don't start a new one
        if (existingVisit?.visitId && existingVisit?.status === 'ACTIVE') {
          const visitType = getVisitType();

          setActiveVisit({
            visitId: existingVisit.visitId,
            outlet: customer as any,
            checkInTime: new Date(existingVisit.checkInTime),
            checkOutTime: existingVisit.checkOutTime
              ? new Date(existingVisit.checkOutTime)
              : undefined,
            status: existingVisit.status,
            routeSessionId: existingVisit?.routeSessionId,
            customerId: existingVisit?.customerId,
            visitType: visitType,
          });

          setIsAutoStarting(false);
          return;
        }

        // If no active visit exists, determine visit type based on current location
        const visitType = getVisitType();

        // Start a new visit with the determined visit type (ON_SITE or OFF_SITE)
        const payload: any = {
          routeSessionId: route?.routeSessionId,
          workSessionId: route?.workSessionId,
          vanId: van?.vanId,
          outletId: customer.customerId,
          visitType: visitType,
        };

        const response = await outletService.startVisit(payload);

        if (response.success && response?.data) {
          const visit = response.data;

          setActiveVisit({
            visitId: visit.visitId,
            outlet: customer as any,
            checkInTime: new Date(visit.checkInTime),
            checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
            status: visit.status,
            routeSessionId: visit?.routeSessionId,
            customerId: visit?.customerId,
            visitType: visitType,
          });
        } else {
          setAutoStartAttempted(false);
        }
      } catch (error) {
        console.error('Auto-start visit failed:', error);
        setAutoStartAttempted(false);
      } finally {
        setIsAutoStarting(false);
      }
    }, 1000);
  }, [
    customer,
    autoStartAttempted,
    isAutoStarting,
    route,
    setActiveVisit,
    selectedRoute,
    van,
    getVisitType,
  ]);

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

  const loadSalesHistory = async () => {
    if (!customer?.customerId) return;

    setSalesLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: PAGE_SIZE,
        customerId: customer.customerId,
        vanId: van?.vanId,
        employeeId: user?.userId,
      };
      const response: any = await saleService.fetchSales(params);

      const salesData = response?.data || [];
      setSales(salesData);
      setSalesTotal(response?.meta?.total || response?.total || salesData.length);
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
        outletId: customer.customerId,
        limit: 10,
        page: 1,
        vanId: van?.vanId,
      });

      const visits = response?.data || [];
      setVisitHistory(visits);
      setVisitsTotal((response as any)?.total || 0);
    } catch (error) {
      console.error('Failed to load visit history:', error);
    } finally {
      setVisitsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkActiveVisit();
    await loadCustomerData();
    await loadSalesHistory();
    await loadVisitHistory();
    setRefreshing(false);
  }, [customer]);

  const handleProceedToSale = useCallback(() => {
    if (customer) {
      router.push(`/checkin`);
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

  // Use data from API response
  const lastOrderDate =
    customer?.summary?.lastOrderDate || (sales.length > 0 ? sales[0]?.date : null);
  const lastVisitDate = customer?.summary?.lastVisitDate || customer?.lastVisitedAt;
  const hasActiveVisit = activeVisit && activeVisit?.customerId === customer.customerId;
  const currentVisitType = getVisitType();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Main ScrollView that contains everything except footer */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleTabScroll}
        scrollEventThrottle={16}
      >
        {/* Customer Header - Scrollable */}
        <CustomerHeader
          customer={customer}
          styles={styles}
          colors={colors}
          compact={isTabScrolled}
        />

        {/* Last Visit and Last Order - Scrollable */}
        <View style={styles.lastInfoContainer}>
          <View style={styles.lastInfoCard}>
            <View style={styles.lastInfoItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <AppText style={styles.lastInfoLabel}>Last Visit:</AppText>
              <AppText style={styles.lastInfoValue}>
                {lastVisitDate ? moment(lastVisitDate).format('DD MMM YYYY') : 'Never'}
              </AppText>
            </View>
            <View style={styles.lastInfoDivider} />
            <View style={styles.lastInfoItem}>
              <Ionicons name="cart-outline" size={16} color={colors.textSecondary} />
              <AppText style={styles.lastInfoLabel}>Last Order:</AppText>
              <AppText style={styles.lastInfoValue}>
                {lastOrderDate ? moment(lastOrderDate).format('DD MMM YYYY') : 'Never'}
              </AppText>
            </View>
          </View>
        </View>

        {/* Debug geofence info - Scrollable */}
        {__DEV__ && distanceToOutlet !== null && (
          <View style={styles.debugGeofenceContainer}>
            <AppText style={styles.debugGeofenceText}>
              {isInsideGeofenceArea ? '✓ Inside geofence' : '○ Outside geofence'} - Distance:{' '}
              {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
              {isAutoStarting && ' - Auto-starting...'}
            </AppText>
          </View>
        )}

        {/* TAB BAR - Scrollable (moves with content) */}
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />

        {/* TAB CONTENT - Scrollable */}
        <TabContent
          activeTab={activeTab}
          customer={customer}
          sales={sales}
          salesLoading={salesLoading}
          salesTotal={salesTotal}
          visitHistory={visitHistory}
          visitsLoading={visitsLoading}
          visitsTotal={visitsTotal}
          styles={styles}
          colors={colors}
          formatCurrency={formatCurrency}
          van={van}
        />
      </ScrollView>

      {/* FIXED FOOTER BUTTON - Always at bottom, outside ScrollView */}
      <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.fullWidthButtonContainer}>
          <TouchableOpacity
            style={[styles.fullWidthButton, { backgroundColor: colors.primary }]}
            onPress={handleProceedToSale}
            activeOpacity={0.85}
          >
            <View style={styles.fullWidthButtonContent}>
              <Ionicons name="cart-outline" size={24} color="#FFF" />
              <View style={styles.fullWidthButtonTextContainer}>
                <AppText style={styles.fullWidthButtonTitle}>Proceed to Sale</AppText>
              </View>
              <Ionicons name="arrow-forward-outline" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* Auto-starting indicator */}
      {!hasActiveVisit && isAutoStarting && (
        <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
          <View style={styles.fullWidthButtonContainer}>
            <View
              style={[
                styles.fullWidthAutoStartIndicator,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText style={[styles.autoStartText, { color: colors.primary }]}>
                Auto-starting visit...
              </AppText>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
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
  <View style={{ flex: 1 }}>
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
  </View>
);

const CustomerHeader = ({ customer, styles, colors, compact }: any) => (
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}>
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
  sales,
  salesLoading,
  salesTotal,
  visitHistory,
  visitsLoading,
  visitsTotal,
  styles,
  colors,
  formatCurrency,
  van,
}: any) => (
  <View style={styles.tabContentContainer}>
    {activeTab === 'summary' && (
      <SummaryTab
        customer={customer}
        styles={styles}
        colors={colors}
        formatCurrency={formatCurrency}
      />
    )}
    {activeTab === 'sales' && (
      <SalesTab styles={styles} colors={colors} customerId={customer?.customerId} van={van} />
    )}
    {activeTab === 'invoices' && (
      <InvoicesTab
        invoices={sales}
        loading={salesLoading}
        total={salesTotal}
        styles={styles}
        colors={colors}
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
      />
    )}
  </View>
);

// Summary Tab
const SummaryTab = ({ customer, styles, colors, formatCurrency }: any) => {
  const summary = customer?.summary || {
    mtd: {
      orderValue: 0,
      orderQuantity: 0,
      orderCount: 0,
    },
    last5Orders: {
      avgOrderValue: 0,
      avgOrderQuantity: 0,
      avgLPC: 0,
      orders: [],
    },
    lastOrderDate: null,
    lastVisitDate: null,
  };

  const mtdOrderValue = summary.mtd?.orderValue || 0;
  const mtdOrderQuantity = summary.mtd?.orderQuantity || 0;
  const mtdOrderCount = summary.mtd?.orderCount || 0;
  const avgOrderValue = summary.last5Orders?.avgOrderValue || 0;
  const avgOrderQuantity = summary.last5Orders?.avgOrderQuantity || 0;
  const avgLPC = summary.last5Orders?.avgLPC || 0;
  const recentOrders = summary.last5Orders?.orders || [];

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.salesSectionCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="bar-chart-outline" size={24} color={colors.success} />
            <AppText style={styles.statValue}>{formatCurrency(mtdOrderValue)}</AppText>
            <AppText style={styles.statLabel}>MTD Order Value</AppText>
            {mtdOrderCount > 0 && (
              <AppText style={styles.statSubLabel}>
                {mtdOrderCount} order{mtdOrderCount !== 1 ? 's' : ''}
              </AppText>
            )}
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={24} color={colors.info} />
            <AppText style={styles.statValue}>{mtdOrderQuantity.toFixed(1)}</AppText>
            <AppText style={styles.statLabel}>MTD Total Cases</AppText>
          </View>
        </View>

        <View style={styles.statsDivider} />
        <AppText style={styles.statsSubtitle}>
          Last {recentOrders.length} {recentOrders.length === 1 ? 'Order' : 'Orders'} Average
        </AppText>

        <View style={styles.statsGridSmall}>
          <View style={styles.statCardSmall}>
            <Ionicons name="cash-outline" size={20} color={colors.warning} />
            <AppText style={styles.statValueSmall}>{formatCurrency(avgOrderValue)}</AppText>
            <AppText style={styles.statLabelSmall}>Avg. Value</AppText>
          </View>

          <View style={styles.statCardSmall}>
            <Ionicons name="layers-outline" size={20} color={colors.warning} />
            <AppText style={styles.statValueSmall}>{avgOrderQuantity.toFixed(1)}</AppText>
            <AppText style={styles.statLabelSmall}>Avg. Quantity</AppText>
          </View>

          <View style={styles.statCardSmall}>
            <Ionicons name="pricetag-outline" size={20} color={colors.warning} />
            <AppText style={styles.statValueSmall}>{avgLPC.toFixed(2)}</AppText>
            <AppText style={styles.statLabelSmall}>LPC</AppText>
          </View>
        </View>
      </View>

      <View style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Ionicons name="bulb-outline" size={20} color={colors.primary} />
          <AppText style={styles.insightsTitle}>Performance Insights</AppText>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightDot} />
          <AppText style={styles.insightText}>
            MTD total value: {formatCurrency(mtdOrderValue)} from {mtdOrderCount} order
            {mtdOrderCount !== 1 ? 's' : ''}
          </AppText>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightDot} />
          <AppText style={styles.insightText}>
            Average order value: {formatCurrency(avgOrderValue)} per transaction
          </AppText>
        </View>

        <View style={styles.insightItem}>
          <View style={styles.insightDot} />
          <AppText style={styles.insightText}>
            LPC: {avgLPC.toFixed(2)} cases per PC
            {avgLPC > 10 ? ' (Good)' : avgLPC > 5 ? ' (Average)' : ' (Needs Improvement)'}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const SalesTab = ({ styles, colors, customerId, van }: any) => {
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch category-wise sales data
  const fetchCategoryWiseSales = async () => {
    if (!customerId) return;

    setIsLoading(true);
    try {
      const response = await saleService.getCategoryWiseSales({
        outletId: customerId,
        vanId: van?.vanId,
      });

      if (response.statusCode === 200 && response.data) {
        setCategorySales(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch category-wise sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryWiseSales();
  }, [van?.vanId, customerId]);

  const categories = [...new Set(categorySales.map((item) => item.categoryName))];
  const months = [
    ...new Map(
      categorySales.map((item) => [
        item.month,
        { short: item.month, key: `${item.year}-${item.monthNumber}` },
      ]),
    ).values(),
  ];

  const getValueForMonth = (categoryName: string, month: string) => {
    const sale = categorySales.find(
      (item) => item.categoryName === categoryName && item.month === month,
    );
    return sale ? sale.totalQtyInCases : 0;
  };

  const renderTableHeader = () => (
    <View style={styles.salesTableHeader}>
      <View style={[styles.salesTableCell, styles.salesTableCellCategory]}>
        <AppText style={styles.salesTableHeaderText}>Category</AppText>
      </View>
      {months.map((month) => (
        <View key={month.key} style={styles.salesTableCell}>
          <AppText style={styles.salesTableHeaderText}>{month.short}</AppText>
        </View>
      ))}
      <View style={[styles.salesTableCell, styles.salesTableCellTotal]}>
        <AppText style={styles.salesTableHeaderText}>Total</AppText>
      </View>
    </View>
  );

  const renderTableRow = (category: string) => {
    const total = months.reduce((sum, month) => sum + getValueForMonth(category, month.short), 0);

    return (
      <View key={category} style={styles.salesTableRow}>
        <View style={[styles.salesTableCell, styles.salesTableCellCategory]}>
          <AppText style={styles.salesTableCategoryText}>{category}</AppText>
          <AppText style={styles.salesTableUnitText}>Cases</AppText>
        </View>
        {months.map((month) => {
          const value = getValueForMonth(category, month.short);
          const hasData = value > 0;
          return (
            <View key={month.key} style={styles.salesTableCell}>
              <AppText
                style={[styles.salesTableCellValue, hasData && styles.salesTableCellValueHighlight]}
              >
                {value}
              </AppText>
            </View>
          );
        })}
        <View style={[styles.salesTableCell, styles.salesTableCellTotal]}>
          <AppText style={styles.salesTableCellTotalValue}>{total}</AppText>
        </View>
      </View>
    );
  };

  if (isLoading && categorySales.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Loading sales data...</AppText>
      </View>
    );
  }

  if (categorySales.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyTabContainer}>
        <Ionicons name="receipt-outline" size={56} color={colors.textTertiary} />
        <AppText style={styles.emptyTabTitle}>No Sales Data</AppText>
        <AppText style={styles.emptyTabText}>No sales records found for this customer</AppText>
      </View>
    );
  }

  return (
    <View style={styles.salesTableContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {renderTableHeader()}
          {categories.map((category) => renderTableRow(category))}
        </View>
      </ScrollView>
    </View>
  );
};

const InvoicesTab = ({ invoices, loading, total, styles, colors, formatCurrency }: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD MMM YYYY');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return colors.success;
      case 'PARTIAL':
        return colors.warning;
      case 'OVERDUE':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderInvoiceCard = (invoice: SaleItem) => {
    const invoiceNo = invoice.saleId || 'N/A';
    const paymentStatus = invoice.paymentStatus || 'UNPAID';
    const statusColor = getStatusColor(paymentStatus);

    return (
      <View key={invoiceNo} style={styles.invoiceCard}>
        <View style={styles.invoiceTopRow}>
          <View style={styles.invoiceMeta}>
            <AppText style={styles.invoiceDate}>{formatDate(invoice.date)}</AppText>
            <AppText style={styles.invoiceNumber} numberOfLines={1}>
              {invoiceNo}
            </AppText>
          </View>
          <View style={styles.invoiceAmountCol}>
            <AppText style={[styles.invoiceAmount, { color: colors.primary }]}>
              {formatCurrency(invoice.totalValue || 0)}
            </AppText>
            <AppText style={styles.invoiceAmountLabel}>invoice amount</AppText>
          </View>
        </View>

        <View style={styles.invoiceDetailGrid}>
          <View style={styles.invoiceDetailItem}>
            <AppText style={styles.invoiceDetailLabel}>Type</AppText>
            <AppText style={styles.invoiceDetailValue}>{invoice.type || 'N/A'}</AppText>
          </View>
          <View style={styles.invoiceDetailItem}>
            <AppText style={styles.invoiceDetailLabel}>Cases</AppText>
            <AppText style={styles.invoiceDetailValue}>{invoice.totalCases || 0}</AppText>
          </View>
          <View style={styles.invoiceDetailItem}>
            <AppText style={styles.invoiceDetailLabel}>Pieces</AppText>
            <AppText style={styles.invoiceDetailValue}>{invoice.totalPieces || 0}</AppText>
          </View>
        </View>

        <View style={styles.invoiceFooter}>
          <View style={[styles.invoiceStatusBadge, { backgroundColor: statusColor + '14' }]}>
            <View style={[styles.invoiceStatusDot, { backgroundColor: statusColor }]} />
            <AppText style={[styles.invoiceStatusText, { color: statusColor }]}>
              {paymentStatus}
            </AppText>
          </View>
          {invoice.pendingAmount > 0 && (
            <AppText style={styles.invoicePendingText}>
              Pending {formatCurrency(invoice.pendingAmount)}
            </AppText>
          )}
        </View>
      </View>
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>Loading invoices...</AppText>
      </View>
    );
  }

  return (
    <View>
      {invoices.length > 0 && (
        <View style={styles.listHeader}>
          <AppText style={styles.listHeaderTitle}>
            Last {Math.min(invoices.length, PAGE_SIZE)}{' '}
            {invoices.length === 1 ? 'Invoice' : 'Invoices'}
          </AppText>
          {total > PAGE_SIZE && (
            <AppText style={styles.listHeaderSubtitle}>
              Showing last {PAGE_SIZE} of {total} total
            </AppText>
          )}
        </View>
      )}
      {invoices.map((invoice: SaleItem) => renderInvoiceCard(invoice))}
      {!loading && invoices.length === 0 && (
        <View style={styles.emptyTabContainer}>
          <Ionicons name="document-text-outline" size={56} color={colors.textTertiary} />
          <AppText style={styles.emptyTabTitle}>No Invoices</AppText>
          <AppText style={styles.emptyTabText}>No invoices found for this customer</AppText>
        </View>
      )}
    </View>
  );
};

// Visits Tab
const VisitsTab = ({ visits, loading, total, styles, colors }: any) => {
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
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return colors.success;
      case 'ACTIVE':
        return colors.primary;
      default:
        return colors.warning;
    }
  };

  const renderVisitCard = (item: VisitHistory) => (
    <View key={item.visitId} style={styles.visitCard}>
      <View style={styles.visitCardHeader}>
        <View style={[styles.visitStatusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <AppText style={styles.visitDate}>{formatDate(item.checkInTime)}</AppText>
        <View style={[styles.visitDurationBadge, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="time-outline" size={12} color={colors.primary} />
          <AppText style={styles.visitDuration}>
            {getDuration(item.checkInTime, item.checkOutTime)}
          </AppText>
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
    <View>
      {visits.length > 0 && (
        <View style={styles.listHeader}>
          <AppText style={styles.listHeaderTitle}>
            Last {Math.min(visits.length, 10)} Visits
          </AppText>
          {total > 10 && (
            <AppText style={styles.listHeaderSubtitle}>Showing last 10 of {total} total</AppText>
          )}
        </View>
      )}
      {visits.map((item: VisitHistory) => renderVisitCard(item))}
      {!loading && visits.length === 0 && (
        <View style={styles.emptyTabContainer}>
          <Ionicons name="time-outline" size={56} color={colors.textTertiary} />
          <AppText style={styles.emptyTabTitle}>No Visits</AppText>
          <AppText style={styles.emptyTabText}>No visit history found for this customer</AppText>
        </View>
      )}
    </View>
  );
};
