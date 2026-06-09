import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { EmptyState } from '@/core/components/EmptyState';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useRouteStore } from '@/core/store/route.store';
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

export default function ChangeRoute() {
  const { colors } = useTheme();
  const { setHeader } = useHeader();
  const { selectedRoute, setSelectedRoute, van } = useRouteStore();
  const workSessionId = useAuthStore((state) => state.workSessionId);
  const insets = useSafeAreaInsets();

  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const [routes, setRoutes] = useState<VanRoute[]>([]);
  const [selectedVanRoute, setSelectedVanRoute] = useState<VanRoute | null>(null);
  const [outlets, setOutlets] = useState<RouteOutlet[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'routes' | 'outlets' | 'confirmation'>('routes');
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
      setHeader({
        title: 'Change Route',
        showBack: true,
        showMenu: false,
      });

      startAnimations();

      return () => {
        isMountedRef.current = false;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (validateWorkSession()) {
        setCurrentStep('routes');
        fetchRoutes();
      }
    }, []),
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
        }));

        const filteredRoutes = transformedRoutes.filter(
          (route: VanRoute) => route.routeId !== selectedRoute?.routeId,
        );
        setRoutes(filteredRoutes);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      if (isMountedRef.current) {
        toast.error('Error', 'Failed to load routes. Please try again.');
      }
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [selectedRoute?.routeId, workSessionId, validateWorkSession]);

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

  const handleRouteSelect = async (route: VanRoute) => {
    if (!validateWorkSession()) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedVanRoute(route);
    await fetchRouteOutlets(route);
    setCurrentStep('outlets');
  };

  const handleProceedToConfirmation = () => {
    if (!validateWorkSession()) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setCurrentStep('confirmation');
  };

  const handleSubmitChange = async () => {
    if (!validateWorkSession()) return;

    if (!selectedVanRoute) {
      toast.error('Error', 'Please select a route first');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        workSessionId: workSessionId || '',
        routeId: selectedVanRoute.routeId,
        routeName: selectedVanRoute.routeName,
        totalShops: selectedVanRoute.totalShops,
      };

      const response: any = await outletService.changeRoute(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        setSelectedRoute({
          routeId: selectedVanRoute.routeId,
          name: selectedRoute?.name,
          routeName: selectedVanRoute.routeName,
          routeCode: selectedVanRoute.routeCode,
          routeSessionId: response.data?.routeSessionId || selectedVanRoute.routeSessionId,
          workSessionId: workSessionId || '',
          totalShops: selectedVanRoute.totalShops,
          distance: selectedRoute?.distance || '',
          vanId: selectedRoute?.vanId,
          marketId: selectedRoute?.marketId,
          provinceId: selectedRoute?.provinceId,
          countryId: selectedRoute?.countryId,
        });

        if (!isWeb) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        toast.success('Success', `Route changed to "${selectedVanRoute.routeName}"`);
        setCurrentStep('routes');
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

  const handleGoBack = () => {
    if (currentStep === 'confirmation') {
      setCurrentStep('outlets');
    } else if (currentStep === 'outlets') {
      setCurrentStep('routes');
      setSearchQuery('');
      setSelectedVanRoute(null);
      setOutlets([]);
    } else {
      router.back();
    }
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

  const filteredRoutes = routes.filter((route) =>
    route.routeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const styles = getStyles(colors, insets);

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
            actionLabel="Start Work Day"
            onAction={() => {
              if (!isWeb) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/work-session');
            }}
            secondaryActionLabel="Contact Support"
            onSecondaryAction={() => {
              toast.info('Contact Support', 'Please contact your supervisor for assistance');
            }}
          />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );

  const renderRouteCard = (route: VanRoute) => (
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search routes..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {isLoadingRoutes ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText style={styles.loadingText}>Loading routes...</AppText>
            </View>
          ) : filteredRoutes.length === 0 ? (
            <EmptyState
              title={searchQuery ? 'No Routes Found' : 'No Routes Available'}
              icon="map-outline"
            />
          ) : (
            <View style={styles.routesGrid}>
              {filteredRoutes.map((route) => renderRouteCard(route))}
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
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText style={styles.loadingText}>Loading outlets...</AppText>
          </View>
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
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Confirmation Header */}
            <View style={styles.confirmationHeader}>
              <View style={styles.confirmationIconContainer}>
                <Ionicons name="swap-horizontal" size={48} color={colors.primary} />
              </View>
              <AppText style={styles.confirmationTitle}>Review Route Change</AppText>
              <AppText style={styles.confirmationSubtitle}>
                Please review the details before confirming
              </AppText>
            </View>

            {/* Current Route Card */}
            <View style={styles.comparisonSection}>
              <View style={[styles.comparisonCard, styles.currentRouteCard]}>
                <View style={styles.comparisonBadge}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <AppText style={styles.comparisonBadgeText}>Current</AppText>
                </View>
                <AppText style={styles.comparisonRouteName}>
                  {summary.currentRoute?.routeName || 'No route'}
                </AppText>
                <View style={styles.comparisonStats}>
                  <View style={styles.comparisonStat}>
                    <Ionicons name="business-outline" size={13} color={colors.textSecondary} />
                    <AppText style={styles.comparisonStatText}>
                      {summary.currentRoute?.totalShops || 0} outlets
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Arrow */}
              <View style={styles.arrowSection}>
                <View style={[styles.arrowIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="arrow-down" size={20} color={colors.primary} />
                </View>
              </View>

              {/* New Route Card */}
              <View style={[styles.comparisonCard, styles.newRouteCard]}>
                <View style={[styles.comparisonBadge, styles.newBadge]}>
                  <Ionicons name="star-outline" size={14} color="#FFF" />
                  <AppText style={[styles.comparisonBadgeText, styles.newBadgeText]}>New</AppText>
                </View>
                <AppText style={[styles.comparisonRouteName, styles.newRouteName]}>
                  {summary.newRoute?.routeName || 'N/A'}
                </AppText>
                <View style={styles.comparisonStats}>
                  <View style={styles.comparisonStat}>
                    <Ionicons name="business-outline" size={13} color={colors.primary} />
                    <AppText style={[styles.comparisonStatText, { color: colors.primary }]}>
                      {summary.newRoute?.totalShops || 0} outlets
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            {/* Statistics Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCardWrapper}>
                <LinearGradient
                  colors={[colors.primary + '15', colors.primary + '08']}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="business-outline" size={24} color={colors.primary} />
                  <AppText style={styles.statCardValue}>{summary.totalOutlets}</AppText>
                  <AppText style={styles.statCardLabel}>Outlets</AppText>
                </LinearGradient>
              </View>

              <View style={styles.statCardWrapper}>
                <LinearGradient
                  colors={[colors.warning + '15', colors.warning + '08']}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="time-outline" size={24} color={colors.warning} />
                  <AppText style={styles.statCardValue}>{summary.estimatedTime}</AppText>
                  <AppText style={styles.statCardLabel}>Est. Time</AppText>
                </LinearGradient>
              </View>

              <View style={styles.statCardWrapper}>
                <LinearGradient
                  colors={[colors.success + '15', colors.success + '08']}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="checkmark-outline" size={24} color={colors.success} />
                  <AppText style={styles.statCardValue}>{summary.outletsToVisit.length}</AppText>
                  <AppText style={styles.statCardLabel}>Pending</AppText>
                </LinearGradient>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningCard}>
              <Ionicons name="information-circle-outline" size={18} color={colors.warning} />
              <AppText style={styles.warningText}>
                Your current progress will be reset. Unvisited outlets will be marked as pending.
              </AppText>
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
    emptyStateContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      minHeight: Dimensions.get('window').height - 100,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 20,
      marginTop: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.divider,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.textPrimary,
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
    confirmationHeader: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      gap: 12,
    },
    confirmationIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    confirmationTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    confirmationSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
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
      gap: 10,
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    statCardWrapper: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    statCardGradient: {
      paddingVertical: 12,
      paddingHorizontal: 10,
      alignItems: 'center',
      gap: 6,
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
    warningCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 20,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: colors.warning + '10',
      borderRadius: 12,
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: colors.warning,
      lineHeight: 18,
      fontWeight: '500',
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
