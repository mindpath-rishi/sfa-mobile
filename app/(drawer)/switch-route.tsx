import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  FlatList,
  BackHandler,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText, SearchBar, Skeleton } from '@/core/components';
import { EmptyState } from '@/core/components/EmptyState';
import { useHeader } from '@/shared/contexts/HeaderContext';
import {
  getRouteCustomerCategoryId,
  getRouteLocationIds,
  useRouteStore,
} from '@/core/store/route.store';
import { useAuthStore } from '@/core/store/auth.store';
import { homeService } from '@/features/home/services/home.service';
import { outletService } from '@/features/outlet/services/outlet.service';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const toast = {
  success: (title: string, message?: string) =>
    Toast.show({ type: 'success', text1: title, text2: message }),
  error: (title: string, message?: string) =>
    Toast.show({ type: 'error', text1: title, text2: message }),
  info: (title: string, message?: string) =>
    Toast.show({ type: 'info', text1: title, text2: message }),
};

interface VanRoute {
  routeId: string;
  routeName: string;
  routeCode?: string;
  routeSessionId: string;
  workSessionId: string;
  vanId: string;
  name: string;
  totalShops: number;
  distance: string;
  stops: number;
  customerCategoryId?: string;
  marketId?: string;
  provinceId?: string;
  countryId?: string;
}

interface RouteOutlet {
  outletId: string;
  outletName: string;
  outletCode?: string;
  address: string;
  phoneNumber: string;
  ownerName: string;
  customerType?: string;
  visitStatus: 'PENDING' | 'VISITED' | 'SKIPPED' | 'NOT_VISITED' | 'ACTIVE';
  visitOrder: number;
  distance?: number;
  sequence: number;
  isVisited: boolean;
  hasSale: boolean;
  geoTag?: {
    lat: number;
    lng: number;
  };
}

interface ChangeRouteSummary {
  currentRoute: VanRoute | null;
  newRoute: VanRoute | null;
  outletsToVisit: RouteOutlet[];
  totalOutlets: number;
  estimatedTime: string;
}

const ROUTE_OUTLETS_LIMIT = 100;
const ESTIMATED_TIME_PER_OUTLET = 5;

export default function Routes() {
  const { colors } = useTheme();
  const { setHeader } = useHeader();
  const { selectedRoute, setSelectedRoute, van } = useRouteStore();
  const workSessionId = useAuthStore((state) => state.workSessionId);
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ route?: string }>();

  const routeStep: 'routes' | 'outlets' | 'confirmation' = pathname.endsWith('/confirmation')
    ? 'confirmation'
    : pathname.endsWith('/outlets')
      ? 'outlets'
      : 'routes';

  const handleGoBack = useCallback(() => {
    if (routeStep === 'confirmation') {
      router.navigate({
        pathname: '/switch-route/outlets' as any,
        params: params.route ? { route: params.route } : undefined,
      });
      return;
    }

    if (routeStep === 'outlets') {
      router.navigate('/switch-route');
      return;
    }

    router.back();
  }, [params.route, routeStep]);

  const routeFromParams = React.useMemo<VanRoute | null>(() => {
    if (!params.route) return null;
    try {
      return JSON.parse(params.route) as VanRoute;
    } catch {
      return null;
    }
  }, [params.route]);

  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const [routes, setRoutes] = useState<VanRoute[]>([]);
  const [selectedVanRoute, setSelectedVanRoute] = useState<VanRoute | null>(routeFromParams);
  const [outlets, setOutlets] = useState<RouteOutlet[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const currentStep = routeStep;
  const [searchQuery, setSearchQuery] = useState('');
  const [hasValidSession, setHasValidSession] = useState(true);

  const routeIdRef = useRef<string>('');
  const isDataLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const validateWorkSession = useCallback((): boolean => {
    if (!workSessionId) {
      setHasValidSession(false);
      return false;
    }
    setHasValidSession(true);
    return true;
  }, [workSessionId]);

  useFocusEffect(
    useCallback(() => {
      if (!workSessionId) {
        setHasValidSession(false);
      } else {
        setHasValidSession(true);
      }
    }, [workSessionId]),
  );

  useFocusEffect(
    React.useCallback(() => {
      isMountedRef.current = true;
      setHeader({
        title:
          routeStep === 'confirmation'
            ? 'Review Route'
            : routeStep === 'outlets'
              ? 'Route Outlets'
              : 'Routes',
        showBack: true,
        showMenu: false,
        size: 'small',
        onBackPress: handleGoBack,
      });

      startAnimations();

      return () => {
        isMountedRef.current = false;
      };
    }, [handleGoBack, routeStep, setHeader]),
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web' || routeStep === 'routes') return;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleGoBack();
        return true;
      });

      return () => subscription.remove();
    }, [handleGoBack, routeStep]),
  );

  const startAnimations = () => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const fetchRoutes = useCallback(async () => {
    if (!validateWorkSession()) {
      setIsLoadingRoutes(false);
      return;
    }

    setIsLoadingRoutes(true);
    const currentRouteFromStore: VanRoute | null = selectedRoute?.routeId
      ? {
          routeId: selectedRoute.routeId,
          routeName: selectedRoute.routeName || selectedRoute.name || 'Current route',
          routeCode: selectedRoute.routeCode,
          routeSessionId: selectedRoute.routeSessionId || '',
          workSessionId: selectedRoute.workSessionId || workSessionId || '',
          vanId: selectedRoute.vanId || van?.vanId || '',
          name: selectedRoute.routeName || selectedRoute.name || 'Current route',
          totalShops: selectedRoute.totalShops || 0,
          distance: selectedRoute.distance || 'N/A',
          stops: selectedRoute.totalShops || 0,
          customerCategoryId: selectedRoute.customerCategoryId,
          marketId: selectedRoute.marketId ? String(selectedRoute.marketId) : undefined,
          provinceId: selectedRoute.provinceId ? String(selectedRoute.provinceId) : undefined,
          countryId: selectedRoute.countryId ? String(selectedRoute.countryId) : undefined,
        }
      : null;

    try {
      const response: any = await homeService.getVanMappedRoutes();

      if (response.statusCode === 200 && response?.data?.routes?.length) {
        const transformedRoutes = response.data.routes.map((item: any) => ({
          routeId: item.routeId,
          routeName: item.route.name,
          routeCode: item.route.code || '',
          routeSessionId: item.routeSessionId,
          workSessionId: item.workSessionId,
          vanId: item.vanId,
          name: item.route.name,
          totalShops: item.route?.outletCount || 0,
          distance: item.route.distance || 'N/A',
          stops: item.route?.outletCount || 0,
          ...getRouteLocationIds({ ...item, route: item.route }),
          customerCategoryId: getRouteCustomerCategoryId({
            customerCategoryId: item.customerCategoryId,
            customerCategory: item.customerCategory,
            route: item.route,
          }),
        }));

        const hasCurrentRoute = transformedRoutes.some(
          (route: VanRoute) => route.routeId === selectedRoute?.routeId,
        );
        const availableRoutes =
          currentRouteFromStore && !hasCurrentRoute
            ? [currentRouteFromStore, ...transformedRoutes]
            : transformedRoutes;

        setRoutes(
          availableRoutes.sort((left: VanRoute, right: VanRoute) => {
            if (left.routeId === selectedRoute?.routeId) return -1;
            if (right.routeId === selectedRoute?.routeId) return 1;
            return left.routeName.localeCompare(right.routeName);
          }),
        );
      } else {
        setRoutes(currentRouteFromStore ? [currentRouteFromStore] : []);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      if (isMountedRef.current) {
        toast.error('Error', 'Failed to load routes. Please try again.');
      }
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [selectedRoute, van?.vanId, workSessionId, validateWorkSession]);

  useFocusEffect(
    useCallback(() => {
      if (routeStep === 'routes' && validateWorkSession()) {
        setSelectedVanRoute(null);
        setOutlets([]);
        setSearchQuery('');
        void fetchRoutes();
      }
    }, [fetchRoutes, routeStep, validateWorkSession]),
  );

  const fetchRouteOutlets = useCallback(
    async (route: VanRoute) => {
      if (!validateWorkSession()) {
        setIsLoadingOutlets(false);
        return;
      }

      const currentRouteId = route.routeId;
      if (!currentRouteId) return;

      routeIdRef.current = currentRouteId;
      isDataLoadedRef.current = false;
      setIsLoadingOutlets(true);

      const payload = {
        routeId: currentRouteId,
        page: 1,
        limit: ROUTE_OUTLETS_LIMIT,
        filters: {},
        searchText: '',
        routeSessionId: route.routeSessionId,
        workSessionId: workSessionId || '',
      };

      try {
        const response = await outletService.getRouteOutlets(payload);

        if (response.statusCode === 200) {
          const outletsData = response.data?.data || [];
          const transformedOutlets = transformOutletsData(outletsData);
          setOutlets(transformedOutlets);
          isDataLoadedRef.current = true;
        } else {
          setOutlets([]);
          toast.error('Error', 'Failed to load outlets for this route');
        }
      } catch (error) {
        console.error('Error fetching route outlets:', error);
        if (isMountedRef.current) {
          toast.error('Error', 'Failed to load outlets for this route');
        }
      } finally {
        setIsLoadingOutlets(false);
      }
    },
    [workSessionId, validateWorkSession],
  );

  useFocusEffect(
    useCallback(() => {
      if (routeStep === 'routes' || !routeFromParams || !validateWorkSession()) return;

      setSelectedVanRoute(routeFromParams);
      void fetchRouteOutlets(routeFromParams);
    }, [fetchRouteOutlets, routeFromParams, routeStep, validateWorkSession]),
  );

  const transformOutletsData = (outletsData: any[]): RouteOutlet[] => {
    return outletsData.map((outlet: any, index: number) => ({
      outletId: outlet.customerId || outlet._id,
      outletName: outlet.name,
      outletCode: outlet.code || '',
      address: outlet.address?.line1 || outlet.address || '',
      phoneNumber: outlet.phoneNumber,
      ownerName: outlet.ownerName,
      customerType: outlet.customerType,
      visitStatus: getVisitStatus(outlet),
      visitOrder: outlet.sequence || index + 1,
      distance: outlet.distance || 0,
      sequence: outlet.sequence || index + 1,
      isVisited: outlet.isVisited || false,
      hasSale: outlet.hasSale || false,
      geoTag: outlet.geoTag,
    }));
  };

  const getVisitStatus = (outlet: any): RouteOutlet['visitStatus'] => {
    if (outlet.visitStatus === 'VISITED') return 'VISITED';
    if (outlet.visitStatus === 'SKIPPED') return 'SKIPPED';
    if (outlet.visitStatus === 'ACTIVE') return 'ACTIVE';
    return 'PENDING';
  };

  const handleRouteSelect = (route: VanRoute) => {
    if (!validateWorkSession()) return;

    if (route.routeId === selectedRoute?.routeId) {
      router.push('/route');
      return;
    }

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedVanRoute(route);
    router.push({
      pathname: '/switch-route/outlets' as any,
      params: { route: JSON.stringify(route) },
    });
  };

  const handleProceedToConfirmation = () => {
    if (!validateWorkSession()) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!selectedVanRoute) return;

    router.push({
      pathname: '/switch-route/confirmation' as any,
      params: { route: JSON.stringify(selectedVanRoute) },
    });
  };

  const handleSubmitChange = async () => {
    if (!validateWorkSession()) return;

    if (!selectedVanRoute) {
      toast.error('Error', 'Please select a route first');
      return;
    }

    setIsSubmitting(true);
    try {
      const vanId =
        selectedVanRoute.vanId || van?.vanId || selectedRoute?.vanId || user?.vanId || '';

      if (!vanId) {
        toast.error('Error', 'Van is required to change route');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        workSessionId: workSessionId || '',
        routeId: selectedVanRoute.routeId,
        routeName: selectedVanRoute.routeName,
        totalShops: selectedVanRoute.totalShops,
        vanId,
        vanName: selectedVanRoute.name || van?.name || van?.vanName || van?.vanNumber,
      };

      const response: any = await outletService.changeRoute(payload);

      if ([200, 201, 202].includes(Number(response.statusCode))) {
        setSelectedRoute({
          routeId: selectedVanRoute.routeId,
          name: selectedVanRoute.routeName,
          routeName: selectedVanRoute.routeName,
          routeCode: selectedVanRoute.routeCode,
          routeSessionId: response.data?.routeSessionId || selectedVanRoute.routeSessionId,
          workSessionId: workSessionId || '',
          totalShops: selectedVanRoute.totalShops,
          distance: selectedVanRoute.distance || '',
          vanId,
          marketId: selectedVanRoute.marketId || selectedRoute?.marketId,
          provinceId: selectedVanRoute.provinceId || selectedRoute?.provinceId,
          countryId: selectedVanRoute.countryId || selectedRoute?.countryId,
          customerCategoryId:
            selectedVanRoute.customerCategoryId || selectedRoute?.customerCategoryId,
        });

        if (!isWeb) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        toast.success('Success', `Route changed to "${selectedVanRoute.routeName}"`);
        setTimeout(() => {
          router.push('/route');
        }, 500);
      } else {
        if (!isWeb) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        toast.error('Error', response.message || 'Failed to change route');
      }
    } catch (error) {
      console.error('Failed to change route:', error);
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      toast.error('Error', 'Failed to change route. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRefresh = async () => {
    if (!validateWorkSession()) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    routeIdRef.current = '';
    isDataLoadedRef.current = false;
    await fetchRoutes();
    if (selectedVanRoute) {
      await fetchRouteOutlets(selectedVanRoute);
    }
    setRefreshing(false);
  };

  const getVisitStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      VISITED: colors.success,
      SKIPPED: colors.warning,
      PENDING: colors.textTertiary,
      NOT_VISITED: colors.textTertiary,
      ACTIVE: colors.primary,
    };
    return statusColors[status] || colors.textTertiary;
  };

  const getVisitStatusIcon = (status: string, isVisited: boolean): string => {
    if (isVisited) return 'checkmark-circle';
    if (status === 'SKIPPED') return 'close-circle';
    return 'time-outline';
  };

  const calculateEstimatedTime = (outletCount: number): string => {
    const minutes = Math.ceil(outletCount * ESTIMATED_TIME_PER_OUTLET);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const currentRoute = routes.find((route) => route.routeId === selectedRoute?.routeId) || null;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredRoutes = routes.filter((route) => {
    if (route.routeId === selectedRoute?.routeId) return false;
    if (!normalizedSearchQuery) return true;

    return [route.routeName, route.routeCode].some((value) =>
      value?.toLowerCase().includes(normalizedSearchQuery),
    );
  });

  const styles = getStyles(colors, insets);

  const renderRouteListSkeleton = () => (
    <View style={styles.routesGrid}>
      {[1, 2, 3, 4, 5].map((item) => (
        <View key={item} style={styles.routeCard}>
          <View style={styles.routeCardInner}>
            <View style={styles.routeIconSection}>
              <Skeleton height={48} width={48} borderRadius={12} />
            </View>
            <View style={styles.routeContent}>
              <Skeleton height={16} width="72%" borderRadius={8} />
              <View style={styles.routeMetaRow}>
                <Skeleton height={24} width={86} borderRadius={8} />
                <Skeleton height={24} width={62} borderRadius={8} />
              </View>
            </View>
            <Skeleton height={20} width={20} variant="circle" />
          </View>
        </View>
      ))}
    </View>
  );

  const renderOutletListSkeleton = () => (
    <View style={styles.outletsListContainer}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} style={styles.outletListItem}>
          <View style={styles.outletListLeft}>
            <Skeleton height={28} width={28} variant="circle" />
            <View style={styles.outletListInfo}>
              <Skeleton height={14} width="68%" borderRadius={7} />
              <Skeleton height={11} width="48%" borderRadius={6} style={{ marginTop: 6 }} />
            </View>
          </View>
          <Skeleton height={24} width={76} borderRadius={8} />
        </View>
      ))}
    </View>
  );

  const renderNoSessionView = () => (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>
        <ScrollView
          contentContainerStyle={styles.emptyStateContainer}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState
            title="Work Day Not Started"
            description="You need to start your work day before you can change routes. This helps us track your activities accurately and maintain proper records."
            icon="alert-circle-outline"
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );

  const renderRouteCard = (route: VanRoute) => {
    return (
      <TouchableOpacity
        key={route.routeId}
        style={styles.routeCard}
        onPress={() => handleRouteSelect(route)}
        activeOpacity={0.7}
      >
        <View style={styles.routeCardInner}>
          <View style={styles.routeIconSection}>
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '10']}
              style={styles.routeIcon}
            >
              <Ionicons name="map-outline" size={24} color={colors.primary} />
            </LinearGradient>
          </View>

          <View style={styles.routeContent}>
            <AppText style={styles.routeName} numberOfLines={2}>
              {route.routeName}
            </AppText>
            <View style={styles.routeMetaRow}>
              <View style={styles.routeMetaItem}>
                <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
                <AppText style={styles.routeMetaText}>{route.totalShops} outlets</AppText>
              </View>
              {route.distance !== 'N/A' && (
                <View style={styles.routeMetaItem}>
                  <Ionicons name="navigate-outline" size={12} color={colors.textSecondary} />
                  <AppText style={styles.routeMetaText}>{route.distance}</AppText>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderOutletItem = ({ item, index }: { item: RouteOutlet; index: number }) => {
    const statusColor = getVisitStatusColor(item.visitStatus);
    const statusIcon = getVisitStatusIcon(item.visitStatus, item.isVisited);
    const statusText = item.isVisited ? 'VISITED' : item.visitStatus;

    return (
      <View style={styles.outletListItem}>
        <View style={styles.outletListLeft}>
          <View style={styles.outletListNumber}>
            <AppText style={styles.outletListNumberText}>{item.visitOrder || index + 1}</AppText>
          </View>
          <View style={styles.outletListInfo}>
            <AppText style={styles.outletListName} numberOfLines={1}>
              {item.outletName}
            </AppText>
            <AppText style={styles.outletListAddress} numberOfLines={1}>
              {item.address}
            </AppText>
          </View>
        </View>
        <View style={[styles.outletListStatus, { backgroundColor: statusColor + '15' }]}>
          <Ionicons name={statusIcon as any} size={12} color={statusColor} />
          <AppText style={[styles.outletListStatusText, { color: statusColor }]}>
            {statusText}
          </AppText>
        </View>
      </View>
    );
  };

  const renderRoutesList = () => (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>
        <View style={styles.fixedSearchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search routes..."
            clearable
            debounceDelay={0}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={[styles.scrollContainer, styles.routesScrollContainer]}
        >
          {!isLoadingRoutes && currentRoute && (
            <View style={styles.routeSection}>
              <View style={styles.sectionHeadingRow}>
                <AppText style={styles.sectionHeading}>Selected route</AppText>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <AppText style={styles.liveBadgeText}>ACTIVE</AppText>
                </View>
              </View>
              <View style={styles.routesGrid}>{renderRouteCard(currentRoute)}</View>
            </View>
          )}

          {isLoadingRoutes ? (
            renderRouteListSkeleton()
          ) : (
            <View style={styles.routeSection}>
              <View style={styles.sectionHeadingRow}>
                <AppText style={styles.sectionHeading}>Available routes</AppText>
                <AppText style={styles.sectionCount}>{filteredRoutes.length}</AppText>
              </View>
              {filteredRoutes.length === 0 ? (
                <EmptyState
                  title={searchQuery ? 'No routes found' : 'No routes available'}
                  description={
                    searchQuery
                      ? 'Try a different route name or code'
                      : 'No other routes are assigned'
                  }
                  icon={searchQuery ? 'search-outline' : 'map-outline'}
                  actionLabel={searchQuery ? 'Clear search' : undefined}
                  onAction={searchQuery ? () => setSearchQuery('') : undefined}
                  size="small"
                />
              ) : (
                <View style={styles.routesGrid}>
                  {filteredRoutes.map((route) => renderRouteCard(route))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );

  const renderOutletsList = () => (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoIcon}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.routeInfoContent}>
            <AppText style={styles.routeInfoName}>{selectedVanRoute?.routeName}</AppText>
            <AppText style={styles.routeInfoCount}>
              {outlets.length} outlets · {calculateEstimatedTime(outlets.length)}
            </AppText>
          </View>
        </View>

        {isLoadingOutlets ? (
          renderOutletListSkeleton()
        ) : outlets.length === 0 ? (
          <EmptyState
            title="No Outlets Found"
            description="No outlets are available for this route"
            icon="business-outline"
          />
        ) : (
          <FlatList
            data={outlets}
            keyExtractor={(item) => item.outletId}
            renderItem={renderOutletItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.outletsListContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );

  const renderConfirmation = () => {
    const summary: ChangeRouteSummary = {
      currentRoute: selectedRoute as any,
      newRoute: selectedVanRoute,
      outletsToVisit: outlets.filter((o) => o.isVisited === false),
      totalOutlets: outlets.length,
      estimatedTime: calculateEstimatedTime(outlets.length),
    };

    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContainer, styles.reviewScrollContainer]}
          >
            <View style={styles.reviewSection}>
              <View style={styles.routeChangeCard}>
                <View style={styles.routeChangeRow}>
                  <View style={[styles.routeMarker, styles.currentRouteMarker]}>
                    <Ionicons name="location-outline" size={19} color={colors.textSecondary} />
                  </View>
                  <View style={styles.routeChangeContent}>
                    <AppText style={styles.routeChangeLabel}>CURRENT ROUTE</AppText>
                    <AppText style={styles.routeChangeName} numberOfLines={2}>
                      {summary.currentRoute?.routeName || 'No active route'}
                    </AppText>
                    <AppText style={styles.routeChangeMeta}>
                      {summary.currentRoute?.totalShops || 0} outlets
                    </AppText>
                  </View>
                </View>

                <View style={styles.routeChangeDivider}>
                  <View style={styles.dividerLine} />
                  <View style={styles.swapIndicator}>
                    <Ionicons name="arrow-down" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.routeChangeRow}>
                  <View style={[styles.routeMarker, styles.newRouteMarker]}>
                    <Ionicons name="navigate" size={19} color={colors.primary} />
                  </View>
                  <View style={styles.routeChangeContent}>
                    <View style={styles.newRouteLabelRow}>
                      <AppText style={[styles.routeChangeLabel, { color: colors.primary }]}>
                        NEW ROUTE
                      </AppText>
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={11} color={colors.primary} />
                        <AppText style={styles.selectedBadgeText}>SELECTED</AppText>
                      </View>
                    </View>
                    <AppText
                      style={[styles.routeChangeName, { color: colors.primary }]}
                      numberOfLines={2}
                    >
                      {summary.newRoute?.routeName || 'Not selected'}
                    </AppText>
                    <AppText style={styles.routeChangeMeta}>
                      {summary.totalOutlets} outlets assigned
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.reviewSection}>
              <AppText style={styles.reviewSectionTitle}>New route summary</AppText>
              <View style={styles.statsGrid}>
                <View style={styles.statCardWrapper}>
                  <View style={[styles.statIcon, { backgroundColor: colors.primary + '12' }]}>
                    <Ionicons name="storefront-outline" size={19} color={colors.primary} />
                  </View>
                  <AppText style={styles.statCardValue}>{summary.totalOutlets}</AppText>
                  <AppText style={styles.statCardLabel}>Total outlets</AppText>
                </View>

                <View style={styles.statCardWrapper}>
                  <View style={[styles.statIcon, { backgroundColor: colors.warning + '12' }]}>
                    <Ionicons name="time-outline" size={19} color={colors.warning} />
                  </View>
                  <AppText style={styles.statCardValue}>{summary.estimatedTime}</AppText>
                  <AppText style={styles.statCardLabel}>Est. Time</AppText>
                </View>

                <View style={styles.statCardWrapper}>
                  <View style={[styles.statIcon, { backgroundColor: colors.success + '12' }]}>
                    <Ionicons name="hourglass-outline" size={19} color={colors.success} />
                  </View>
                  <AppText style={styles.statCardValue}>{summary.outletsToVisit.length}</AppText>
                  <AppText style={styles.statCardLabel}>To visit</AppText>
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  };

  const renderFooter = () => {
    if (currentStep === 'routes' || !hasValidSession || !workSessionId) {
      return null;
    }

    const isLastStep = currentStep === 'confirmation';

    return (
      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.divider,
            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 12) : insets.bottom + 8,
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back-outline" size={22} color={colors.textSecondary} />
          <AppText style={styles.backButtonText}>Back</AppText>
        </TouchableOpacity>

        {/* Next / Submit Button */}
        <TouchableOpacity
          style={[styles.nextButton, isLastStep && styles.submitButton]}
          onPress={isLastStep ? handleSubmitChange : handleProceedToConfirmation}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <AppText style={styles.nextButtonText}>
            {isLastStep ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
          </AppText>
          <Ionicons
            name={isLastStep ? 'checkmark-outline' : 'arrow-forward-outline'}
            size={18}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (!hasValidSession || !workSessionId) {
    return renderNoSessionView();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {currentStep === 'routes' && renderRoutesList()}
      {currentStep === 'outlets' && renderOutletsList()}
      {currentStep === 'confirmation' && renderConfirmation()}
      {renderFooter()}
      <Toast />
    </View>
  );
}

const getStyles = (colors: any, insets: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingBottom: 100,
    },
    routesScrollContainer: {
      paddingTop: 16,
    },
    emptyStateContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      minHeight: Dimensions.get('window').height - 100,
    },
    routeSection: {
      marginBottom: 18,
    },
    sectionHeadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 24,
      marginHorizontal: 16,
      marginBottom: 10,
    },
    sectionHeading: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '800',
      lineHeight: 18,
      letterSpacing: 0.2,
      textTransform: 'uppercase',
    },
    sectionCount: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      backgroundColor: colors.surface,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: 'hidden',
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      minHeight: 24,
      paddingHorizontal: 9,
      borderRadius: 12,
      backgroundColor: colors.success + '15',
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
    },
    liveBadgeText: {
      color: colors.success,
      fontSize: 9,
      fontWeight: '800',
      lineHeight: 12,
      letterSpacing: 0.5,
    },
    fixedSearchContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
      gap: 16,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    routesGrid: {
      gap: 12,
      paddingHorizontal: 16,
    },
    routeCard: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 4,
    },
    routeCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: 16,
    },
    routeIconSection: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    routeIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    routeContent: {
      flex: 1,
      minWidth: 0,
      gap: 6,
    },
    routeName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    routeMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    routeMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    routeMetaText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    routeInfoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.primary + '10',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary + '25',
    },
    routeInfoIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    routeInfoContent: {
      flex: 1,
      gap: 2,
    },
    routeInfoName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    routeInfoCount: {
      fontSize: 12,
      color: colors.primary + '80',
    },
    outletsListContainer: {
      paddingHorizontal: 16,
      paddingBottom: 120, // Extra padding for footer
    },
    outletListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    outletListLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    outletListNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
    },
    outletListNumberText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    outletListInfo: {
      flex: 1,
    },
    outletListName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    outletListAddress: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    outletListStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    outletListStatusText: {
      fontSize: 10,
      fontWeight: '600',
    },
    reviewSection: {
      paddingHorizontal: 16,
      marginBottom: 20,
      gap: 10,
    },
    reviewScrollContainer: {
      paddingTop: 16,
    },
    reviewSectionTitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    routeChangeCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: 14,
    },
    routeChangeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 2,
    },
    routeMarker: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    currentRouteMarker: {
      backgroundColor: colors.background,
    },
    newRouteMarker: {
      backgroundColor: colors.primary + '12',
    },
    routeChangeContent: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    routeChangeLabel: {
      color: colors.textTertiary,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
    },
    routeChangeName: {
      color: colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '700',
    },
    routeChangeMeta: {
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
    },
    routeChangeDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginVertical: 10,
      marginLeft: 52,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.divider,
    },
    swapIndicator: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '12',
    },
    newRouteLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    selectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 7,
      backgroundColor: colors.primary + '12',
    },
    selectedBadgeText: {
      color: colors.primary,
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    comparisonSection: {
      gap: 16,
      marginHorizontal: 16,
      marginBottom: 20,
    },
    comparisonCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      gap: 10,
    },
    currentRouteCard: {
      opacity: 0.7,
    },
    newRouteCard: {
      borderColor: colors.primary + '30',
      backgroundColor: colors.primary + '08',
      borderWidth: 2,
    },
    comparisonBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: colors.textSecondary + '15',
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    newBadge: {
      backgroundColor: colors.primary,
    },
    comparisonBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    newBadgeText: {
      color: '#FFF',
    },
    comparisonRouteName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: -0.3,
    },
    newRouteName: {
      color: colors.primary,
    },
    comparisonStats: {
      flexDirection: 'row',
      gap: 12,
    },
    comparisonStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    comparisonStatText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    arrowSection: {
      alignItems: 'center',
      marginVertical: 8,
    },
    arrowIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    statCardWrapper: {
      flex: 1,
      minHeight: 116,
      padding: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
    },
    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    statCardValue: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    statCardLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      gap: 16,
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      minWidth: 100,
    },
    submitButton: {
      backgroundColor: colors.success,
    },
    nextButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFF',
    },
  });
