import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
  Linking,
  TextInput,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppButton, AppModal } from '@/core/components';
import { outletService } from '@/features/outlet/services/outlet.service';
import { homeService } from '@/features/home/services/home.service';
import { router, useFocusEffect } from 'expo-router';
import {
  getRouteCustomerCategoryId,
  getRouteLocationIds,
  useRouteStore,
} from '@/core/store/route.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';
import { CustomerCreateModal } from '@/shared/components/models/CustomerCreateModal';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { FilterModal } from '@/shared/components/models/Filter.modal';
import { FilterSection } from '@/shared/types/filter.types';
import {
  DEFAULT_CURRENT_LOCATION,
  ROUTE_OUTLETS_LIMIT,
} from '@/features/routes/constants/route.constants';
import { useRouteScreenStyles } from '@/features/routes/styles/RouteScreen.styles';
import type { Outlet } from '@/features/routes/types/route.types';
import { getDistance, isInsideGeofence } from '@/shared/utils/geofence.utils';
import { captureCurrentLocation } from '@/shared/services/location.service';
import { useLoaderStore } from '@/core/loader/loader.store';
import { OutletCardComponent } from '@/features/routes/components/OutletCard';
import {
  EmptyStateComponent,
  LoadingSkeleton,
} from '@/features/routes/components/RouteScreenStates';
import {
  formatCurrency,
  getOutletCoordinate,
  getOutletDisplayName,
  hasNoOrderInLast30Days,
  normalizeFilterText,
} from '@/features/routes/utils/route-outlet.utils';

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
type QuickFilterType = 'all' | 'visited' | 'not_visited' | 'no_order' | 'no_order_30d';

type RouteAccessMessage = {
  icon: string;
  title: string;
  message: string;
};

// ============= MAIN COMPONENT =============
export default function RouteScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useRouteScreenStyles();
  const activeRoute = useRouteStore((s) => s.selectedRoute);
  const setSelectedRoute = useRouteStore((s) => s.setSelectedRoute);
  const workSessionId = useAuthStore((s) => s.workSessionId);
  const setWorkSessionId = useAuthStore((s) => s.setWorkSessionId);

  // ========== STATE ==========
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: DEFAULT_CURRENT_LOCATION.latitude,
    longitude: DEFAULT_CURRENT_LOCATION.longitude,
  });
  const [hasCurrentLocation, setHasCurrentLocation] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(Platform.OS === 'web');
  const [isMapReady, setIsMapReady] = useState(false);
  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [, setGeofenceStatus] = useState<Record<string, boolean>>({});
  const [autoStartInProgress, setAutoStartInProgress] = useState<Record<string, boolean>>({});
  const [showCustomerCreteModal, setShowCustomerCreateModal] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const showLoader = useLoaderStore((state) => state.show);
  const hideLoader = useLoaderStore((state) => state.hide);
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('not_visited');
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingRouteAccess, setIsCheckingRouteAccess] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeAccessMessage, setRouteAccessMessage] = useState<RouteAccessMessage | null>(null);

  // Refs to prevent infinite loops
  const lastOsrmKeyRef = useRef<string>('');
  const osrmDisabledUntilRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const routeIdRef = useRef<string | undefined>(undefined);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const isDataLoadedRef = useRef(false);
  const mapRef = useRef<any>(null);
  const activeVisist = useOutletStore((s) => s.activeVisit);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const setSelectedOutlet = useOutletStore((s) => s.setSelectedOutlet);
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

  useEffect(() => {
    if (Platform.OS === 'web') {
      setMapsLoaded(true);
      return;
    }

    if (MapView && Marker && Polyline) {
      setMapsLoaded(true);
      return;
    }

    try {
      const Maps = require('react-native-maps');
      MapView = Maps.default;
      Marker = Maps.Marker;
      Polyline = Maps.Polyline;
      PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
      setMapsLoaded(true);
    } catch (error) {
      console.log('Error loading maps:', error);
      setMapsLoaded(false);
    }
  }, []);

  // ========== SUMMARY STATS ==========
  const summaryStats = useMemo(() => {
    const visitedCount = outlets.filter((o) => o.isVisited).length;
    const activeCount = outlets.filter((o) => o.visitStatus === 'ACTIVE').length;
    const notVisitedCount = outlets.filter(
      (o) => o.visitStatus === 'NOT_VISITED' || !o.visitStatus,
    ).length;
    const noOrderCount = outlets.filter((o) => !o.hasSale && o.visitStatus === 'COMPLETED').length;
    const noOrder30DaysCount = outlets.filter(hasNoOrderInLast30Days).length;

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
      noOrder30DaysCount,
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
        id: 'VERIFICATION_PENDING',
        label: 'Verification Pending',
        count: outlets.filter((o) => o.status === 'VERIFICATION_PENDING').length,
      },
      {
        id: 'REJECTED',
        label: 'Rejected',
        count: outlets.filter((o) => o.status === 'REJECTED').length,
      },
    ].filter((opt) => opt.count > 0);

    const visitStatusOptions = [
      {
        id: 'COMPLETED',
        label: 'Completed',
        count: outlets.filter((o) => o.isVisited).length,
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
  // Keep this as derived data instead of state. The previous setFilteredOutlets()
  // useEffect caused one extra render every time a tab/search/filter changed.
  const filteredOutlets = useMemo(() => {
    let filtered = [...outlets];
    const searchLower = normalizeFilterText(searchText);

    if (searchLower) {
      filtered = filtered.filter((outlet) => {
        const searchableText = [
          getOutletDisplayName(outlet),
          outlet.ownerName,
          outlet.phoneNumber,
          outlet.address?.line1,
        ]
          .map(normalizeFilterText)
          .join(' ');

        return searchableText.includes(searchLower);
      });
    } else if (quickFilter !== 'all') {
      switch (quickFilter) {
        case 'visited':
          filtered = filtered.filter(
            (outlet) => outlet.isVisited || outlet.visitStatus === 'COMPLETED',
          );
          break;
        case 'not_visited':
          filtered = filtered.filter(
            (outlet) => outlet.visitStatus === 'NOT_VISITED' || !outlet.visitStatus,
          );
          break;
        case 'no_order':
          filtered = filtered.filter(
            (outlet) => !outlet.hasSale && outlet.visitStatus === 'COMPLETED',
          );
          break;
        case 'no_order_30d':
          filtered = filtered.filter(hasNoOrderInLast30Days);
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

    return filtered;
  }, [outlets, searchText, filters.status, filters.visitStatus, filters.priority, quickFilter]);

  // ========== GEOFENCE FUNCTIONS ==========
  const checkAllGeofences = useCallback(
    (lat: number, lng: number) => {
      const newStatus: Record<string, boolean> = {};

      outlets.forEach((outlet) => {
        const coordinate = getOutletCoordinate(outlet);

        if (coordinate) {
          const inside = isInsideGeofence(lat, lng, {
            id: outlet._id,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            radius: 100,
          });
          newStatus[outlet._id] = inside;
        }
      });

      setGeofenceStatus((previousStatus) => {
        const previousKeys = Object.keys(previousStatus);
        const nextKeys = Object.keys(newStatus);
        const unchanged =
          previousKeys.length === nextKeys.length &&
          nextKeys.every((key) => previousStatus[key] === newStatus[key]);

        return unchanged ? previousStatus : newStatus;
      });
    },
    [outlets],
  );

  const getUserLocation = useCallback(async () => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation((previous) => {
            if (previous.latitude === latitude && previous.longitude === longitude) return previous;
            return { latitude, longitude };
          });
          setHasCurrentLocation((previous) => previous || true);
          checkAllGeofences(latitude, longitude);
        },
        (error) => console.log('Error getting location:', error),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 },
      );
      return;
    }

    const location = await captureCurrentLocation();
    if (location) {
      setCurrentLocation((previous) => {
        if (previous.latitude === location.latitude && previous.longitude === location.longitude) {
          return previous;
        }
        return {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      });
      setHasCurrentLocation((previous) => previous || true);
      checkAllGeofences(location.latitude, location.longitude);
    }
  }, [checkAllGeofences]);

  useEffect(() => {
    if (activeRoute && outlets.length > 0) {
      void getUserLocation();
      const interval = setInterval(getUserLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [activeRoute, outlets.length, getUserLocation]);

  // ========== COMPUTED VALUES ==========
  const outletsWithDistance = useMemo(() => {
    return [...filteredOutlets]
      .sort((a, b) => a.sequence - b.sequence)
      .map((outlet) => {
        const coordinate = getOutletCoordinate(outlet);

        return {
          ...outlet,
          distance: coordinate
            ? getDistance(
                currentLocation.latitude,
                currentLocation.longitude,
                coordinate.latitude,
                coordinate.longitude,
              )
            : 0,
          isInsideGeofence: coordinate
            ? isInsideGeofence(currentLocation.latitude, currentLocation.longitude, {
                id: outlet._id,
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                radius: 100,
              })
            : false,
        };
      });
  }, [filteredOutlets, currentLocation]);

  const mapOutlets = useMemo(
    () => outletsWithDistance.filter((outlet) => getOutletCoordinate(outlet)),
    [outletsWithDistance],
  );

  const mapCoordinates = useMemo(() => {
    const outletCoordinates = mapOutlets.reduce<Array<{ latitude: number; longitude: number }>>(
      (coordinates, outlet) => {
        const coordinate = getOutletCoordinate(outlet);
        if (coordinate) coordinates.push(coordinate);
        return coordinates;
      },
      [],
    );

    return hasCurrentLocation ? [currentLocation, ...outletCoordinates] : outletCoordinates;
  }, [currentLocation, hasCurrentLocation, mapOutlets]);

  const fitMapToRoute = useCallback(() => {
    if (!mapRef.current || !mapCoordinates.length) return;

    requestAnimationFrame(() => {
      mapRef.current?.fitToCoordinates(mapCoordinates, {
        edgePadding: { top: 80, right: 60, bottom: 120, left: 60 },
        animated: true,
      });
    });
  }, [mapCoordinates]);

  useEffect(() => {
    if (showMapModal && mapsLoaded && isMapReady) {
      fitMapToRoute();
    }
  }, [showMapModal, mapsLoaded, isMapReady, fitMapToRoute]);

  // ========== HEADER SETUP ==========
  const handleRightPress = useCallback(() => setShowMapModal(true), []);
  const handleRightPress2 = useCallback(() => setShowCustomerCreateModal(true), []);
  const handleFilterPress = useCallback(() => setShowFilters(true), []);

  useFocusEffect(
    React.useCallback(() => {
      setHeader({
        onRightPress: handleRightPress2,
        onRightPress2: handleRightPress,
        onFilterPress: handleFilterPress,
        showBack: true,
        rightIcon: 'plus',
        rightIcon2: 'map',
        title: activeRoute?.routeName || 'Active Route',
      });
    }, [handleRightPress2, handleRightPress, handleFilterPress, activeRoute?.routeName]),
  );

  const checkRouteAccess = useCallback(async () => {
    setIsCheckingRouteAccess(true);

    const stopRouteLoading = (message: RouteAccessMessage) => {
      setRouteAccessMessage(message);
      setOutlets([]);
      setError(null);
      setIsLoading(false);
      setRefreshing(false);
      setIsCheckingRouteAccess(false);
    };

    try {
      // A page/app refresh clears the in-memory route/session stores. Resolve
      // both from Today Activity instead of requiring a dashboard visit first.
      const response: any = await homeService.getDayStatus(workSessionId ?? '');
      const data = response?.data;
      const activeActivityName = data?.activeActivity?.name || data?.currentActivity?.name || '';
      const normalizedActivityName = activeActivityName.trim().toLowerCase();
      const isDayActive = response?.statusCode === 200 && data?.status === 'ACTIVE';
      const resolvedRoute = data?.selectedRoute ?? activeRoute ?? null;

      if (data?.workSessionId && data.status === 'ACTIVE') {
        setWorkSessionId(data.workSessionId);
      }

      if (!activeRoute?.routeId && resolvedRoute?.routeId) {
        setSelectedRoute(resolvedRoute);
      }

      if (!isDayActive) {
        stopRouteLoading({
          icon: 'sunny-outline',
          title: 'Work Day Not Started',
          message: 'Please start your work day and choose Retailing to view your route.',
        });
        return null;
      }

      if (normalizedActivityName !== 'retailing') {
        stopRouteLoading({
          icon: 'storefront-outline',
          title: 'Retailing Not Active',
          message: activeActivityName
            ? `You are currently doing ${activeActivityName}. Switch to Retailing to view your route.`
            : 'Switch to Retailing to view your route.',
        });
        return null;
      }

      if (!resolvedRoute?.routeId) {
        stopRouteLoading({
          icon: 'map-outline',
          title: 'No Active Route',
          message: 'Please select a route for your Retailing activity to view route outlets.',
        });
        return null;
      }

      setRouteAccessMessage(null);
      setIsCheckingRouteAccess(false);
      return resolvedRoute;
    } catch (error) {
      console.error('Error checking route access:', error);
      stopRouteLoading({
        icon: 'alert-circle-outline',
        title: 'Unable to Check Route Status',
        message: 'Please refresh and try again.',
      });
      return null;
    }
  }, [activeRoute, setSelectedRoute, setWorkSessionId, workSessionId]);

  // ========== DATA LOADING - UPDATED FOR NEW RESPONSE ==========
  const getRouteOutlets = useCallback(
    async (forceRefresh = false) => {
      const resolvedRoute = await checkRouteAccess();
      if (!resolvedRoute) return;

      const currentRouteId = resolvedRoute.routeId;
      // Prevent API call if no route ID or already loaded this route
      if (!currentRouteId) return;
      if (!forceRefresh && routeIdRef.current === currentRouteId && isDataLoadedRef.current) return;

      routeIdRef.current = currentRouteId;
      isDataLoadedRef.current = false;
      setIsLoading(true);
      setError(null);

      const payload: any = {
        routeId: currentRouteId,
        page: 1,
        limit: ROUTE_OUTLETS_LIMIT,
        filters: [],
        searchText: '',
        routeSessionId: resolvedRoute.routeSessionId,
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
            name: getOutletDisplayName(outlet),
            ownerName: outlet.ownerName,
            phoneNumber: outlet.phoneNumber,
            address: outlet.address,
            geoTag: outlet.geoTag,
            status: outlet.status,
            sequence: outlet.sequence || index + 1,
            visitStatus: outlet.isVisited ? 'COMPLETED' : 'NOT_VISITED',
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
          isDataLoadedRef.current = true;
          setError(null);
        } else {
          setError(response.message || 'Failed to load outlets');
        }
      } catch (error) {
        console.error('Error fetching route outlets:', error);
        if (isMountedRef.current) {
          setError('Failed to load outlets. Please check your connection and try again.');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setRefreshing(false);
        }
      }
    },
    [activeRoute?.routeId, activeRoute?.routeSessionId, checkRouteAccess],
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    isDataLoadedRef.current = false;
    routeIdRef.current = undefined;
    await getRouteOutlets(true);
  }, [getRouteOutlets]);

  // Use useFocusEffect with proper cleanup and prevent multiple calls
  useFocusEffect(
    useCallback(() => {
      // Visits and sales may change while another screen is open, so refresh
      // route flags and summary on every navigation back to My Route.
      isDataLoadedRef.current = false;
      routeIdRef.current = undefined;
      void getRouteOutlets(true).catch((error) => {
        console.error('Failed to refresh route outlets on focus:', error);
      });

      return () => {
        // No cleanup needed
      };
    }, [activeRoute?.routeId, getRouteOutlets]),
  );

  // ========== ACTIONS ==========
  const handleCardPress = useCallback(
    (outlet: Outlet) => {
      if (outlet.status === 'VERIFICATION_PENDING') {
        Alert.alert(
          'Verification Pending',
          'This outlet is awaiting verification. You can open and visit it after it has been approved.',
        );
        return;
      }
      if (outlet.status === 'REJECTED') {
        Alert.alert(
          'Outlet Rejected',
          'This outlet was rejected during verification and cannot be opened. Please contact your supervisor for help.',
        );
        return;
      }

      // Keep the route-list data available as a fallback. The detail endpoint does
      // not always include geoTag, but interaction creation requires it.
      setSelectedOutlet(outlet as any);
      router.push(`/route/${outlet.customerId}`);
    },
    [setSelectedOutlet],
  );

  const handleCreateCustomer = useCallback(
    async (formValue: any, photos?: string[]) => {
      if (isCreatingCustomer) return;
      setIsCreatingCustomer(true);
      showLoader({ message: 'Preparing customer creation…' });

      try {
        let resolvedRoute = activeRoute;
        let routeLocationIds = getRouteLocationIds(resolvedRoute);

        if (
          activeRoute?.routeId &&
          (!routeLocationIds.marketId ||
            !routeLocationIds.provinceId ||
            !routeLocationIds.countryId)
        ) {
          try {
            const mappedRoutesResponse: any = await homeService.getVanMappedRoutes();
            const mappedRoute = mappedRoutesResponse?.data?.routes?.find(
              (item: any) =>
                item?.routeId === activeRoute.routeId ||
                item?.route?.routeId === activeRoute.routeId,
            );
            if (mappedRoute) {
              resolvedRoute = { ...activeRoute, ...mappedRoute, route: mappedRoute.route };
              routeLocationIds = getRouteLocationIds(resolvedRoute);
              useRouteStore.getState().setSelectedRoute(resolvedRoute);
            }
          } catch (error) {
            console.warn('Failed to resolve route location IDs before customer creation:', error);
          }
        }

        if (
          !routeLocationIds.marketId ||
          !routeLocationIds.provinceId ||
          !routeLocationIds.countryId
        ) {
          toast.error(
            'Route location missing',
            'The selected route does not contain country, province, and market IDs. Please reselect the route.',
          );
          return;
        }

        formValue.routeId = activeRoute?.routeId;
        formValue.marketId = routeLocationIds.marketId || formValue.marketId;
        formValue.provinceId = routeLocationIds.provinceId || formValue.provinceId;
        formValue.countryId = routeLocationIds.countryId || formValue.countryId;
        formValue.customerCategoryId =
          getRouteCustomerCategoryId(resolvedRoute) || formValue.customerCategoryId;
        showLoader({ message: 'Getting customer location…' });
        const location = await captureCurrentLocation();
        if (location) {
          formValue.geoTag = { lat: location.latitude, lng: location.longitude };
        }
        let response;
        try {
          showLoader({ message: 'Creating customer…' });
          response = await outletService.createCustomer(formValue);
        } catch (error: any) {
          console.error('Failed to create customer:', error);
          toast.error(
            'Error',
            error?.response?.data?.message || error?.message || 'Failed to create customer',
          );
          return;
        }

        const isCustomerCreated =
          response?.success === true && [200, 201, 202].includes(Number(response?.statusCode));

        if (isCustomerCreated) {
          // Customer creation responses have used both a direct data object and
          // a nested data object. Resolve either shape so media is not silently
          // skipped after a successful creation.
          const createdCustomer = response.data?.data ?? response.data?.customer ?? response.data;
          const customerId =
            createdCustomer?.customerId ??
            createdCustomer?._id ??
            createdCustomer?.uuid ??
            response.data?.customerId;

          if (photos?.length && customerId) {
            showLoader({
              message:
                photos.length === 1
                  ? 'Uploading customer image…'
                  : `Uploading ${photos.length} customer images…`,
            });
            try {
              const uploadResponses = await Promise.all(
                photos.map((photo, index) =>
                  outletService.uploadCustomerImage(customerId, photo, index === 0),
                ),
              );
              const failedUpload = uploadResponses.find(
                (uploadResponse) => uploadResponse?.success !== true,
              );
              if (failedUpload) {
                throw new Error(failedUpload.message || 'Photo upload failed');
              }
            } catch (error) {
              console.error('Outlet created but photo upload failed:', error);
              toast.error(
                'Photo upload',
                'Outlet was created, but its photo could not be uploaded.',
              );
            }
          } else if (photos?.length) {
            console.error('Outlet created but no customer ID was returned:', response.data);
            toast.error(
              'Photo upload',
              'Outlet was created, but the server did not return an ID for its photo upload.',
            );
          }
          showLoader({ message: 'Refreshing route outlets…' });
          // Reset data loaded flag to allow reload
          isDataLoadedRef.current = false;
          routeIdRef.current = undefined;
          await getRouteOutlets();
          toast.success(response.message || 'Customer created successfully');
          setShowCustomerCreateModal(false);
        } else {
          toast.error('Error', response?.message || 'Failed to create customer');
        }
      } finally {
        setIsCreatingCustomer(false);
        hideLoader();
      }
    },
    [activeRoute, getRouteOutlets, hideLoader, isCreatingCustomer, showLoader],
  );

  const handleNavigation = useCallback((outlet: Outlet) => {
    if (outlet.status === 'VERIFICATION_PENDING' || outlet.status === 'REJECTED') {
      Alert.alert(
        outlet.status === 'REJECTED' ? 'Outlet Rejected' : 'Verification Pending',
        outlet.status === 'REJECTED'
          ? 'Navigation is unavailable because this outlet was rejected during verification.'
          : 'Navigation will be available after this outlet has been verified and approved.',
      );
      return;
    }
    if (!outlet.geoTag?.lat || !outlet.geoTag?.lng) {
      Alert.alert('Error', 'Location not available for this outlet');
      return;
    }

    const url = Platform.select({
      ios: `maps:${outlet.geoTag.lat},${outlet.geoTag.lng}?q=${encodeURIComponent(getOutletDisplayName(outlet))}`,
      android: `geo:${outlet.geoTag.lat},${outlet.geoTag.lng}?q=${outlet.geoTag.lat},${outlet.geoTag.lng}(${encodeURIComponent(getOutletDisplayName(outlet))})`,
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
        void getRouteOutlets().catch((error) => {
          console.error('Failed to refresh route outlets after completing visit:', error);
        });
      }
    },
    [activeVisist, setActiveVisit, getRouteOutlets],
  );

  // ========== QUICK FILTER TABS ==========
  const QuickFilterTabs = useMemo(() => {
    const tabItems = [
      {
        key: 'not_visited',
        label: 'Not Visited',
        count: summaryStats.notVisitedCount,
        icon: 'time',
      },
      {
        key: 'visited',
        label: 'Visited',
        count: summaryStats.visitedCount,
        icon: 'checkmark-circle',
      },
      {
        key: 'no_order',
        label: 'No Order',
        count: summaryStats.noOrderCount,
        icon: 'cash-outline',
      },
      {
        key: 'no_order_30d',
        label: 'No Order 30d',
        count: summaryStats.noOrder30DaysCount,
        icon: 'calendar-outline',
      },
      { key: 'all', label: 'All', count: summaryStats.totalOutlets, icon: 'apps' },
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
    summaryStats.noOrder30DaysCount,
    quickFilter,
    colors,
    styles,
    applyQuickFilter,
  ]);

  // Show loading state
  // Outlet cards are virtualised: routes can hold hundreds of outlets
  const renderOutletCard = useCallback(
    ({ item, index }: { item: (typeof outletsWithDistance)[number]; index: number }) => (
      <OutletCardComponent
        outlet={item}
        index={index}
        onPress={handleCardPress}
        onNavigate={handleNavigation}
        onComplete={markComplete}
        colors={colors}
        styles={styles}
      />
    ),
    [handleCardPress, handleNavigation, markComplete, colors, styles],
  );

  if ((isLoading || isCheckingRouteAccess) && !refreshing && !routeAccessMessage) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSkeleton colors={colors} styles={styles} />
      </SafeAreaView>
    );
  }

  if (routeAccessMessage && !isCheckingRouteAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyStateComponent
          icon={routeAccessMessage.icon}
          title={routeAccessMessage.title}
          message={routeAccessMessage.message}
          colors={colors}
          styles={styles}
        />
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !isLoading && outlets.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyStateComponent
          icon="alert-circle-outline"
          title="Failed to Load Route"
          message={error}
          actionText="Try Again"
          onAction={onRefresh}
          colors={colors}
          styles={styles}
        />
      </SafeAreaView>
    );
  }

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={outletsWithDistance}
        keyExtractor={(outlet) => outlet._id}
        renderItem={renderOutletCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 48 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Today's Progress</Text>
                  <Text style={styles.progressPercent}>
                    {Math.round(summaryStats.completionRate)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${summaryStats.completionRate}%` }]}
                  />
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
                  <Text style={styles.headerMetricValue}>
                    {summaryStats.totalQuantity.toFixed(1)}
                  </Text>
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
                        {filters.status.length +
                          filters.visitStatus.length +
                          filters.priority.length}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Filter Tabs */}
            {QuickFilterTabs}
            <View style={{ marginTop: styles.outletList.marginTop }} />
          </>
        }
        ListEmptyComponent={
          isLoading ? null : outlets.length === 0 ? (
            <EmptyStateComponent
              icon="storefront-outline"
              title="No outlets found"
              message="Try adjusting your search or filters"
              actionText="Clear all filters"
              onAction={clearAllFilters}
              colors={colors}
              styles={styles}
            />
          ) : (
            <EmptyStateComponent
              icon="filter-outline"
              title="No results found"
              message="No outlets match your current filters"
              actionText="Clear all filters"
              onAction={clearAllFilters}
              colors={colors}
              styles={styles}
            />
          )
        }
        ListFooterComponent={<View style={{ paddingBottom: styles.outletList.paddingBottom }} />}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />

      {/* End Route Modal */}
      <Modal
        visible={showEndRouteConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
      >
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
        onClose={() => {
          if (!isCreatingCustomer) setShowCustomerCreateModal(false);
        }}
        onSubmit={handleCreateCustomer}
        loading={isCreatingCustomer}
      />

      <Modal
        visible={showMapModal}
        animationType="slide"
        hardwareAccelerated
        onRequestClose={() => {
          setIsMapReady(false);
          setShowMapModal(false);
        }}
      >
        <View style={styles.fullScreenContainer}>
          {mapsLoaded && MapView ? (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.fullScreenMap}
              initialRegion={{
                latitude: mapCoordinates[0]?.latitude ?? currentLocation.latitude,
                longitude: mapCoordinates[0]?.longitude ?? currentLocation.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
              onMapReady={() => setIsMapReady(true)}
            >
              {hasCurrentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="Current Location"
                  pinColor={colors.primary}
                  tracksViewChanges={false}
                />
              )}

              {mapOutlets.map((outlet) => {
                const coordinate = getOutletCoordinate(outlet);
                if (!coordinate) return null;

                return (
                  <Marker
                    key={outlet._id}
                    coordinate={coordinate}
                    title={getOutletDisplayName(outlet)}
                    description={`${outlet.address?.line1 || ''}${outlet.distance ? ` · ${(outlet.distance / 1000).toFixed(1)} km` : ''}`}
                    pinColor={outlet.isVisited ? colors.success : colors.error}
                    tracksViewChanges={false}
                  />
                );
              })}

              {mapCoordinates.length > 1 && (
                <Polyline
                  coordinates={mapCoordinates}
                  strokeColor={colors.primary}
                  strokeWidth={4}
                />
              )}
            </MapView>
          ) : (
            <View style={styles.fullScreenMapPlaceholder}>
              <Ionicons name="map-outline" size={64} color={colors.surface} />
              <Text style={styles.fullScreenMapText}>
                {Platform.OS === 'web' ? 'Map is not available on web' : 'Map is loading...'}
              </Text>
            </View>
          )}

          <View
            style={{
              position: 'absolute',
              top: insets.top + 16,
              left: 16,
              right: 72,
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 14 }}>
              {mapOutlets.length} shops on route
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              Distances are from your current location
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setIsMapReady(false);
              setShowMapModal(false);
            }}
            style={{
              position: 'absolute',
              top: insets.top + 16,
              right: 16,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </Modal>

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
