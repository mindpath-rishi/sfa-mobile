import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
  Linking,
  TextInput,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppButton, AppModal } from '@/core/components';
import { outletService } from '@/features/outlet/services/outlet.service';
import { router, useFocusEffect } from 'expo-router';
import { useRouteStore } from '@/core/store/route.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { toast } from '@/core/utils';
import { CustomerCreateModal } from '@/shared/components/models/CustomerCreateModal';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { FilterSection } from '@/shared/types/filter.types';
import { formatCurrency as formatCurrencyCommon } from '@/shared/utils/currenty.utils';
import { ConfirmationModal } from '@/features/routes/components/ConfirmationModal';
import {
  DEFAULT_CURRENT_LOCATION,
  ROUTE_OUTLETS_LIMIT,
} from '@/features/routes/constants/route.constants';
import { useRouteScreenStyles } from '@/features/routes/styles/RouteScreen.styles';
import type { Outlet } from '@/features/routes/types/route.types';
import { detectGeofenceEvents, getDistance, isInsideGeofence } from '@/shared/utils/geofence.utils';

// ============= UTILITY FUNCTIONS =============
const formatCurrency = (amount: number): string => {
  return formatCurrencyCommon(amount, {
    prefix: 'K',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const loadMaps = async () => {
    try {
      const Maps = require('react-native-maps');
      MapView = Maps.default;
      Marker = Maps.Marker;
      Polyline = Maps.Polyline;
      PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    } catch (error) {
      console.log('Error loading maps:', error);
    }
  };
  loadMaps();
}

// ============= QUICK FILTER TYPES =============
type QuickFilterType = 'all' | 'visited' | 'not_visited' | 'no_order';

// ============= SEPARATE OUTLET CARD COMPONENT =============
const OutletCardComponent = React.memo(
  ({
    outlet,
    index,
    onPress,
    onNavigate,
    onComplete,
    colors,
    styles,
  }: {
    outlet: any;
    index: number;
    onPress: (outlet: Outlet) => void;
    onNavigate: (outlet: Outlet) => void;
    onComplete: (outletId: string) => Promise<void>;
    colors: any;
    styles: any;
  }) => {
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const visitStatus = outlet.visitStatus;
    const isActive = visitStatus === 'ACTIVE';
    const isCompleted = visitStatus === 'COMPLETED';
    const isInside = outlet.isInsideGeofence;

    const statusColors = isCompleted
      ? { bg: colors.success + '15', text: colors.success }
      : isActive
        ? { bg: colors.primary + '15', text: colors.primary }
        : { bg: colors.warning + '15', text: colors.warning };

    const handleComplete = useCallback(() => {
      setShowCompleteConfirm(false);
      onComplete(outlet._id);
    }, [outlet._id, onComplete]);

    return (
      <View
        style={[
          styles.expandableCard,
          isActive && styles.expandableCardCurrent,
          isCompleted && styles.expandableCardCompleted,
          isInside && !isCompleted && !isActive && styles.expandableCardNearby,
        ]}
      >
        <ConfirmationModal
          visible={showCompleteConfirm}
          title="Complete Visit"
          message={`Mark "${outlet.name}" as completed?`}
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteConfirm(false)}
          confirmText="Yes, Complete"
          cancelText="Cancel"
          confirmVariant="success"
        />

        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => onPress(outlet)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColors.bg }]}>
              {isCompleted ? (
                <Ionicons name="checkmark-circle" size={24} color={statusColors.text} />
              ) : (
                <Text style={[styles.statusNumber, { color: statusColors.text }]}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.outletName} numberOfLines={1}>
                  {outlet.name}
                </Text>
                {/* {outstanding && outstanding > 0 && (
                  <View style={styles.outstandingBadge}>
                    <Ionicons name="alert-circle" size={12} color={colors.error} />
                    <Text style={styles.outstandingText}>K{outstanding?.toFixed(0)}</Text>
                  </View>
                )} */}
                {isInside && !isCompleted && !isActive && (
                  <View style={styles.nearbyBadge}>
                    <Ionicons name="location" size={12} color={colors.success} />
                    <Text style={styles.nearbyBadgeText}>Nearby</Text>
                  </View>
                )}
                <View style={styles.headerIconsRow}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (outlet.phoneNumber) {
                        Linking.openURL(`tel:${outlet.phoneNumber}`);
                      } else {
                        Alert.alert('Error', 'Phone number not available');
                      }
                    }}
                    style={styles.headerIconButton}
                  >
                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onNavigate(outlet);
                    }}
                    style={styles.headerIconButton}
                  >
                    <Ionicons name="navigate-outline" size={20} color={colors.info} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.stopAddress} numberOfLines={1}>
                  {outlet.address?.line1}
                </Text>
                <View style={styles.distanceBadge}>
                  <Feather name="map-pin" size={12} color={colors.textSecondary} />
                  <Text style={styles.distanceText}>{outlet.distance?.toFixed(1)} km</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                {isCompleted ? 'Done' : isActive ? 'Active' : 'Pending'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
);

// ============= MAIN COMPONENT =============
export default function RouteScreen() {
  const { colors } = useTheme();
  const styles = useRouteScreenStyles();
  const activeRoute = useRouteStore((s) => s.selectedRoute);

  // ========== STATE ==========
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [filteredOutlets, setFilteredOutlets] = useState<Outlet[]>([]);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: DEFAULT_CURRENT_LOCATION.latitude,
    longitude: DEFAULT_CURRENT_LOCATION.longitude,
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(Platform.OS === 'web');
  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [geofenceStatus, setGeofenceStatus] = useState<Record<string, boolean>>({});
  const [autoStartInProgress, setAutoStartInProgress] = useState<Record<string, boolean>>({});
  const [showCustomerCreteModal, setShowCustomerCreateModal] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [filters, setFilters] = useState({
    status: [] as string[],
    visitStatus: [] as string[],
    priority: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [routeSummary, setRouteSummary] = useState({
    totalOrderValue: 0,
    totalCases: 0,
    totalVisitedShop: 0,
    totalProductiveCall: 0,
    LPSC: 0,
  });

  // Refs to prevent infinite loops
  const lastOsrmKeyRef = useRef<string>('');
  const osrmDisabledUntilRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const routeIdRef = useRef<string | undefined>(undefined);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const isDataLoadedRef = useRef(false);
  const activeVisist = useOutletStore.getState().activeVisit;
  const { setActiveVisit } = useOutletStore();
  const { setHeader } = useHeader();

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, []);

  // ========== SUMMARY STATS ==========
  const summaryStats = useMemo(() => {
    const visitedCount = outlets.filter((o) => o.visitStatus === 'COMPLETED').length;
    const activeCount = outlets.filter((o) => o.visitStatus === 'ACTIVE').length;
    const notVisitedCount = outlets.filter(
      (o) => o.visitStatus === 'NOT_VISITED' || !o.visitStatus,
    ).length;
    const noOrderCount = outlets.filter((o) => !o.hasSale && o.visitStatus === 'COMPLETED').length;

    // Use API summary data for totals
    const totalOrderValue = routeSummary.totalOrderValue;
    const totalQuantity = routeSummary.totalCases;
    const productiveCalls = routeSummary.totalProductiveCall;
    const lpsc = routeSummary.LPSC;

    return {
      visitedCount,
      activeCount,
      notVisitedCount,
      noOrderCount,
      productiveCalls,
      lpsc,
      totalOrderValue,
      totalQuantity,
      totalOutlets: outlets.length,
      completionRate: outlets.length > 0 ? (visitedCount / outlets.length) * 100 : 0,
    };
  }, [outlets, routeSummary]);

  // ========== QUICK FILTER APPLY ==========
  const applyQuickFilter = useCallback((filter: QuickFilterType) => {
    setQuickFilter(filter);
    setSearchText('');
  }, []);

  // ========== FILTER SECTIONS ==========
  const filterSections = useMemo((): FilterSection[] => {
    const statusOptions = [
      { id: 'ACTIVE', label: 'Active', count: outlets.filter((o) => o.status === 'ACTIVE').length },
      {
        id: 'INACTIVE',
        label: 'Inactive',
        count: outlets.filter((o) => o.status === 'INACTIVE').length,
      },
      {
        id: 'PENDING',
        label: 'Pending',
        count: outlets.filter((o) => o.status === 'PENDING').length,
      },
    ].filter((opt) => opt.count > 0);

    const visitStatusOptions = [
      {
        id: 'COMPLETED',
        label: 'Completed',
        count: outlets.filter((o) => o.visitStatus === 'COMPLETED').length,
      },
      {
        id: 'ACTIVE',
        label: 'Active Visit',
        count: outlets.filter((o) => o.visitStatus === 'ACTIVE').length,
      },
      {
        id: 'NOT_VISITED',
        label: 'Not Visited',
        count: outlets.filter((o) => o.visitStatus === 'NOT_VISITED' || !o.visitStatus).length,
      },
    ].filter((opt) => opt.count > 0);

    const priorityOptions = [
      {
        id: 'high',
        label: 'High Priority',
        count: outlets.filter((o) => o.priority === 'high').length,
      },
      {
        id: 'medium',
        label: 'Medium Priority',
        count: outlets.filter((o) => o.priority === 'medium').length,
      },
      {
        id: 'low',
        label: 'Low Priority',
        count: outlets.filter((o) => o.priority === 'low').length,
      },
    ].filter((opt) => opt.count > 0);

    const sections: FilterSection[] = [];

    if (statusOptions.length > 0) {
      sections.push({
        id: 'status',
        title: 'Outlet Status',
        type: 'multiple',
        options: statusOptions,
        selectedIds: filters.status,
      });
    }

    if (visitStatusOptions.length > 0) {
      sections.push({
        id: 'visitStatus',
        title: 'Visit Status',
        type: 'multiple',
        options: visitStatusOptions,
        selectedIds: filters.visitStatus,
      });
    }

    if (priorityOptions.length > 0) {
      sections.push({
        id: 'priority',
        title: 'Priority',
        type: 'multiple',
        options: priorityOptions,
        selectedIds: filters.priority,
      });
    }

    return sections;
  }, [outlets, filters.status, filters.visitStatus, filters.priority]);

  // ========== APPLY FILTERS ==========
  const handleApplyFilters = useCallback((sections: FilterSection[]) => {
    const newFilters = {
      status: [] as string[],
      visitStatus: [] as string[],
      priority: [] as string[],
    };

    sections.forEach((section) => {
      if (section.id === 'status' && section.selectedIds) {
        newFilters.status = section.selectedIds;
      } else if (section.id === 'visitStatus' && section.selectedIds) {
        newFilters.visitStatus = section.selectedIds;
      } else if (section.id === 'priority' && section.selectedIds) {
        newFilters.priority = section.selectedIds;
      }
    });

    setFilters(newFilters);
    setShowFilters(false);
    setQuickFilter('all');
  }, []);

  // ========== CLEAR ALL FILTERS ==========
  const clearAllFilters = useCallback(() => {
    setSearchText('');
    setQuickFilter('all');
    setFilters({ status: [], visitStatus: [], priority: [] });
  }, []);

  // ========== APPLY FILTERS TO OUTLETS ==========
  useEffect(() => {
    let filtered = [...outlets];

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (outlet) =>
          outlet.name?.toLowerCase().includes(searchLower) ||
          outlet.ownerName?.toLowerCase().includes(searchLower) ||
          outlet.phoneNumber?.toLowerCase().includes(searchLower) ||
          outlet.address?.line1?.toLowerCase().includes(searchLower),
      );
    } else if (quickFilter !== 'all') {
      switch (quickFilter) {
        case 'visited':
          filtered = filtered.filter((o) => o.visitStatus === 'COMPLETED');
          break;
        case 'not_visited':
          filtered = filtered.filter((o) => o.visitStatus === 'NOT_VISITED' || !o.visitStatus);
          break;
        case 'no_order':
          filtered = filtered.filter((o) => !o.hasSale && o.visitStatus === 'COMPLETED');
          break;
      }
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter((outlet) => filters.status.includes(outlet.status));
    }

    if (filters.visitStatus.length > 0) {
      filtered = filtered.filter((outlet) => {
        const visitStatus = outlet.visitStatus || 'NOT_VISITED';
        return filters.visitStatus.includes(visitStatus);
      });
    }
    if (filters.priority.length > 0) {
      filtered = filtered.filter((outlet) => filters.priority.includes(outlet.priority || 'low'));
    }

    setFilteredOutlets(filtered);
  }, [outlets, searchText, filters.status, filters.visitStatus, filters.priority, quickFilter]);

  // ========== GEOFENCE FUNCTIONS ==========
  const autoStartVisitIfNeeded = useCallback(
    async (currentLat: number, currentLng: number) => {
      if (activeVisist) return;

      const pendingOutlets = outlets.filter(
        (o) => o.visitStatus !== 'COMPLETED' && o.visitStatus !== 'ACTIVE',
      );

      for (const outlet of pendingOutlets) {
        if (autoStartInProgress[outlet._id]) continue;
        if (!outlet.geoTag?.lat || !outlet.geoTag?.lng) continue;

        const distance = getDistance(currentLat, currentLng, outlet.geoTag.lat, outlet.geoTag.lng);
        const isInside = distance <= 100;

        // if (isInside && !geofenceStatus[outlet._id]) {
        //   setAutoStartInProgress((prev) => ({ ...prev, [outlet._id]: true }));
        //   toast.info(`Auto-starting ${outlet.name}`);
        //   router.push(`/route/${outlet.customerId}`);
        //   setTimeout(() => {
        //     setAutoStartInProgress((prev) => ({ ...prev, [outlet._id]: false }));
        //   }, 8000);
        //   break;
        // }
      }
    },
    [outlets, activeVisist, autoStartInProgress, geofenceStatus],
  );

  const checkAllGeofences = useCallback(
    (lat: number, lng: number) => {
      const newStatus: Record<string, boolean> = {};

      outlets.forEach((outlet) => {
        if (outlet.geoTag?.lat && outlet.geoTag?.lng) {
          const inside = isInsideGeofence(lat, lng, {
            id: outlet._id,
            latitude: outlet.geoTag.lat,
            longitude: outlet.geoTag.lng,
            radius: 100,
          });
          newStatus[outlet._id] = inside;
        }
      });

      const events = detectGeofenceEvents(geofenceStatus, newStatus);
      events.forEach((event) => {
        const outlet = outlets.find((o) => o._id === event.id);
        if (outlet && event.type === 'ENTER') {
          toast.info(`Entering ${outlet.name} area`, { duration: 2000 });
        }
      });

      setGeofenceStatus(newStatus);
      autoStartVisitIfNeeded(lat, lng);
    },
    [outlets, geofenceStatus, autoStartVisitIfNeeded],
  );

  const getUserLocation = useCallback(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          checkAllGeofences(latitude, longitude);
        },
        (error) => console.log('Error getting location:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    }
  }, [checkAllGeofences]);

  useEffect(() => {
    if (activeRoute && outlets.length > 0 && Platform.OS === 'web') {
      getUserLocation();
      const interval = setInterval(getUserLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [activeRoute, outlets.length, getUserLocation]);

  // ========== COMPUTED VALUES ==========
  const outletsWithDistance = useMemo(() => {
    return filteredOutlets
      .sort((a, b) => a.sequence - b.sequence)
      .map((outlet) => ({
        ...outlet,
        distance:
          outlet.geoTag?.lat && outlet.geoTag?.lng
            ? getDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                outlet.geoTag.lat,
                outlet.geoTag.lng,
              )
            : 0,
        isInsideGeofence:
          outlet.geoTag?.lat && outlet.geoTag?.lng
            ? isInsideGeofence(currentLocation.latitude, currentLocation.longitude, {
                id: outlet._id,
                latitude: outlet.geoTag.lat,
                longitude: outlet.geoTag.lng,
                radius: 100,
              })
            : false,
        // outstanding: outlet.outstanding || 0,
      }));
  }, [filteredOutlets, currentLocation]);

  // ========== HEADER SETUP ==========
  const handleRightPress = useCallback(() => setShowMapModal(true), []);
  const handleRightPress2 = useCallback(() => setShowCustomerCreateModal(true), []);
  const handleFilterPress = useCallback(() => setShowFilters(true), []);

  useEffect(() => {
    setHeader({
      onRightPress: handleRightPress2,
      onRightPress2: handleRightPress,
      onFilterPress: handleFilterPress,
      showBack: true,
      showFilter: true,
      rightIcon: 'plus',
      rightIcon2: 'map',
      title: activeRoute?.routeName || 'Active Route',
    });
  }, [setHeader, activeRoute?.routeName, handleRightPress, handleRightPress2, handleFilterPress]);

  // ========== DATA LOADING - UPDATED FOR NEW RESPONSE ==========
  const getRouteOutlets = useCallback(async () => {
    const currentRouteId = activeRoute?.routeId;

    // Prevent API call if no route ID or already loaded this route
    if (!currentRouteId) return;
    if (routeIdRef.current === currentRouteId && isDataLoadedRef.current) return;

    routeIdRef.current = currentRouteId;
    isDataLoadedRef.current = false;

    const payload: any = {
      routeId: currentRouteId,
      page: 1,
      limit: ROUTE_OUTLETS_LIMIT,
      filters: [],
      searchText: '',
      routeSessionId: activeRoute?.routeSessionId,
    };

    try {
      const response = await outletService.getRouteOutlets(payload);
      if (!isMountedRef.current) return;

      if (response.statusCode === 200) {
        const outletsData = response.data?.data || [];
        const summary = response.data?.summary || {};

        // Update route summary from API response
        setRouteSummary({
          totalOrderValue: summary.totalOrderValue || 0,
          totalCases: summary.totalCases || 0,
          totalVisitedShop: summary.totalVisitedShop || 0,
          totalProductiveCall: summary.totalProductiveCall || 0,
          LPSC: summary.LPSC || 0,
        });

        const transformedOutlets: Outlet[] = outletsData.map((outlet: any, index: number) => ({
          ...outlet,
          _id: outlet._id,
          customerId: outlet.customerId,
          name: outlet.name,
          ownerName: outlet.ownerName,
          phoneNumber: outlet.phoneNumber,
          address: outlet.address,
          geoTag: outlet.geoTag,
          status: outlet.status,
          sequence: outlet.sequence || index + 1,
          visitStatus: outlet.visitStatus || 'NOT_VISITED',
          isVisited: outlet.isVisited || false,
          hasSale: outlet.hasSale || false,
          hasNonSale: outlet.hasNonSale || false,
          isNonSale: outlet.isNonSale || false,
          sale: outlet.sale,
          saleItems: outlet.saleItems || [],
          outstanding: outlet.outstanding || 0,
          creditLimit: outlet.creditLimit || 0,
          creditDays: outlet.creditDays || 0,
          lastVisitedAt: outlet.lastVisitedAt,
          priority:
            outlet.priority || (index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low'),
          geofenceRadius: 100,
        }));

        setOutlets(transformedOutlets);
        setFilteredOutlets(transformedOutlets);
        isDataLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching route outlets:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to load outlets for this route');
      }
    }
  }, [activeRoute?.routeId, activeRoute?.routeSessionId]);

  // Use useFocusEffect with proper cleanup and prevent multiple calls
  useFocusEffect(
    useCallback(() => {
      // Reset only when route changes
      if (activeRoute?.routeId !== routeIdRef.current) {
        isDataLoadedRef.current = false;
        routeIdRef.current = undefined;
        getRouteOutlets();
      }

      return () => {
        // No cleanup needed
      };
    }, [activeRoute?.routeId, getRouteOutlets]),
  );

  // ========== ACTIONS ==========
  const handleCardPress = useCallback((outlet: Outlet) => {
    router.push(`/route/${outlet.customerId}`);
  }, []);

  const handleCreateCustomer = useCallback(
    async (formValue: any) => {
      formValue.routeId = activeRoute?.routeId;
      const response = await outletService?.createCustomer(formValue);
      if (response?.success) {
        toast.success(response.message as any);
        setShowCustomerCreateModal(false);
        // Reset data loaded flag to allow reload
        isDataLoadedRef.current = false;
        routeIdRef.current = undefined;
        getRouteOutlets();
      }
    },
    [activeRoute?.routeId, getRouteOutlets],
  );

  const handleNavigation = useCallback((outlet: Outlet) => {
    if (!outlet.geoTag?.lat || !outlet.geoTag?.lng) {
      Alert.alert('Error', 'Location not available for this outlet');
      return;
    }

    const url = Platform.select({
      ios: `maps:${outlet.geoTag.lat},${outlet.geoTag.lng}?q=${encodeURIComponent(outlet.name)}`,
      android: `geo:${outlet.geoTag.lat},${outlet.geoTag.lng}?q=${outlet.geoTag.lat},${outlet.geoTag.lng}(${encodeURIComponent(outlet.name)})`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${outlet.geoTag.lat},${outlet.geoTag.lng}&travelmode=driving`,
    });

    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open maps application'));
    }
  }, []);

  const endRoute = useCallback(() => {
    setShowEndRouteConfirm(false);
    Alert.alert(
      'Route Completed',
      `Great job! You have completed ${summaryStats.visitedCount} out of ${outlets.length} visits.\nTotal Order Value: ${formatCurrency(summaryStats.totalOrderValue)}`,
    );
  }, [summaryStats.visitedCount, outlets.length, summaryStats.totalOrderValue]);

  const markComplete = useCallback(
    async (currentOutletId: string) => {
      const response = await outletService.completeVisit(activeVisist?.visitId);
      if (response?.success) {
        toast.success('Visit successfully completed.');
        setActiveVisit(null);
        // Reset data loaded flag to allow reload
        isDataLoadedRef.current = false;
        routeIdRef.current = undefined;
        getRouteOutlets();
      }
    },
    [activeVisist, setActiveVisit, getRouteOutlets],
  );

  // ========== QUICK FILTER TABS ==========
  const QuickFilterTabs = useMemo(() => {
    const tabItems = [
      { key: 'all', label: 'All', count: summaryStats.totalOutlets, icon: 'apps' },
      {
        key: 'visited',
        label: 'Visited',
        count: summaryStats.visitedCount,
        icon: 'checkmark-circle',
      },
      {
        key: 'not_visited',
        label: 'Not Visited',
        count: summaryStats.notVisitedCount,
        icon: 'time',
      },
      {
        key: 'no_order',
        label: 'No Order',
        count: summaryStats.noOrderCount,
        icon: 'cash-outline',
      },
    ];

    return (
      <View style={styles.quickFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.quickFilterTab,
                quickFilter === item.key && styles.quickFilterTabActive,
                { backgroundColor: quickFilter === item.key ? colors.primary : colors.surface },
              ]}
              onPress={() => applyQuickFilter(item.key as QuickFilterType)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={quickFilter === item.key ? colors.surface : colors.textSecondary}
              />
              <Text
                style={[
                  styles.quickFilterLabel,
                  { color: quickFilter === item.key ? colors.surface : colors.textSecondary },
                ]}
              >
                {item.label}
              </Text>
              <View
                style={[
                  styles.quickFilterBadge,
                  {
                    backgroundColor:
                      quickFilter === item.key ? colors.surface + '20' : colors.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.quickFilterCount,
                    { color: quickFilter === item.key ? colors.surface : colors.textPrimary },
                  ]}
                >
                  {item.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [
    summaryStats.totalOutlets,
    summaryStats.visitedCount,
    summaryStats.notVisitedCount,
    summaryStats.noOrderCount,
    quickFilter,
    colors,
    styles,
    applyQuickFilter,
  ]);

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(summaryStats.completionRate)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${summaryStats.completionRate}%` }]} />
            </View>
            <Text style={styles.progressStats}>
              {summaryStats.visitedCount} of {summaryStats.totalOutlets} outlets completed
            </Text>
          </View>

          {/* Metrics Grid */}
          <View style={styles.headerMetricsGrid}>
            <View style={styles.headerMetricItem}>
              <Ionicons name="call" size={16} color={colors.surface} />
              <Text style={styles.headerMetricValue}>{summaryStats.productiveCalls}</Text>
              <Text style={styles.headerMetricLabel}>PC</Text>
            </View>
            <View style={styles.headerMetricDivider} />
            <View style={styles.headerMetricItem}>
              <MaterialIcons name="attach-money" size={16} color={colors.surface} />
              <Text style={styles.headerMetricValue}>
                {formatCurrency(summaryStats.totalOrderValue)}
              </Text>
              <Text style={styles.headerMetricLabel}>Pipeline</Text>
            </View>
            <View style={styles.headerMetricDivider} />
            <View style={styles.headerMetricItem}>
              <Feather name="package" size={16} color={colors.surface} />
              <Text style={styles.headerMetricValue}>{summaryStats.totalQuantity.toFixed(1)}</Text>
              <Text style={styles.headerMetricLabel}>Cases</Text>
            </View>
            <View style={styles.headerMetricDivider} />
            <View style={styles.headerMetricItem}>
              <MaterialIcons name="inventory" size={16} color={colors.surface} />
              <Text style={styles.headerMetricValue}>{summaryStats.lpsc.toFixed(1)}</Text>
              <Text style={styles.headerMetricLabel}>LPSC</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchBar, { borderColor: colors.divider }]}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, owner, or phone..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.filterGradient}
            >
              <Ionicons name="filter-outline" size={18} color={colors.surface} />
              {(filters.status.length > 0 ||
                filters.visitStatus.length > 0 ||
                filters.priority.length > 0) && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {filters.status.length + filters.visitStatus.length + filters.priority.length}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Filter Tabs */}
        {QuickFilterTabs}

        {/* Outlet List */}
        <View style={styles.outletList}>
          {outlets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>No outlets found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
                  Clear all filters
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            outletsWithDistance.map((outlet, index) => (
              <OutletCardComponent
                key={outlet._id}
                outlet={outlet}
                index={index}
                onPress={handleCardPress}
                onNavigate={handleNavigation}
                onComplete={markComplete}
                colors={colors}
                styles={styles}
              />
            ))
          )}
        </View>
      </Animated.ScrollView>

      {/* End Route Modal */}
      <Modal visible={showEndRouteConfirm} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowEndRouteConfirm(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <View style={[styles.confirmIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="flag-outline" size={48} color={colors.error} />
              </View>
              <Text style={styles.confirmTitle}>End Route?</Text>
              <Text style={styles.confirmText}>
                You have completed {summaryStats.visitedCount} out of {outlets.length} visits.
                {'\n'}Total pipeline value: {formatCurrency(summaryStats.totalOrderValue)}
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmCancel}
                  onPress={() => setShowEndRouteConfirm(false)}
                >
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmEnd} onPress={endRoute}>
                  <Text style={styles.confirmEndText}>End Route</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CustomerCreateModal
        visible={showCustomerCreteModal}
        onClose={() => setShowCustomerCreateModal(false)}
        onSubmit={handleCreateCustomer}
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sections={filterSections}
        onApply={handleApplyFilters}
        onReset={clearAllFilters}
        title="Filter Outlets"
        applyButtonText="Apply Filters"
        resetButtonText="Reset"
        showCount={true}
        maxHeight={600}
      />
    </SafeAreaView>
  );
}
