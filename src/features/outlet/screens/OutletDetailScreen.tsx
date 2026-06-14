// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   ScrollView,
//   TouchableOpacity,
//   Linking,
//   Alert,
//   RefreshControl,
//   ActivityIndicator,
//   Platform,
//   FlatList,
//   NativeScrollEvent,
//   NativeSyntheticEvent,
//   BackHandler,
//   AppState,
//   StatusBar,
//   Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { AppText, Skeleton } from '@/core/components';

// import { outletService } from '../services/outlet.service';
// import { useAuthStore } from '@/core/store/auth.store';
// import { Outlet } from '../types/outlet.types';
// import { useOutletStore } from '@/core/store/outlet.store';
// import { useRouteStore } from '@/core/store/route.store';
// import moment from 'moment';
// import { saleService } from '@/shared/services/sale.service';
// import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
// import { OutletAvatar, OutletStatusBadge } from '../components/outlet';
// import { useOutletDetailStyles } from '../styles/OutletDetail.styles';
// import { getDistance, isInsideGeofence } from '@/shared/utils/geofence.utils';
// import { useHeader } from '@/shared/contexts/HeaderContext';

// // Types
// export enum ShopVisitType {
//   ON_SITE = 'ON_SITE',
//   OFF_SITE = 'OFF_SITE',
// }

// interface SaleItemDetail {
//   productId: string;
//   productName: string;
//   productCategory?: string;
//   category?: string;
//   quantity: number;
//   cases: number;
//   pieces: number;
//   price: number;
//   total: number;
//   caseQty?: number;
//   pieceQty?: number;
//   totalValue?: number;
//   casePrice?: number;
//   piecePrice?: number;
// }

// interface SaleItem {
//   saleId: string;
//   vanId: string;
//   vanName: string;
//   customerId: string;
//   customerName: string;
//   employeeId: string;
//   employeeName: string;
//   date: string;
//   totalCases: number;
//   totalPieces: number;
//   totalQty: number;
//   totalWeight: number;
//   totalValue: number;
//   totalReturnCases: number;
//   totalReturnPieces: number;
//   totalReturnQty: number;
//   type: 'CASH' | 'CREDIT';
//   paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
//   paidAmount: number;
//   pendingAmount: number;
//   remark?: string;
//   status: 'DRAFT' | 'CONFIRMED' | 'RETURNED' | 'CANCELLED';
//   items?: SaleItemDetail[];
//   productCategory?: string;
// }

// interface VisitHistory {
//   visitId: string;
//   outletId: string;
//   outletName?: string;
//   checkInTime: string;
//   checkOutTime?: string;
//   status: string;
//   note?: string;
//   visitType?: ShopVisitType;
//   orderCount?: number;
//   paymentCount?: number;
// }

// type TabType = 'summary' | 'sales' | 'invoices' | 'visits';

// const TABS: { key: TabType; label: string; icon: string }[] = [
//   { key: 'summary', label: 'Summary', icon: 'stats-chart-outline' },
//   { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
//   { key: 'invoices', label: 'Last 10 Invoice', icon: 'document-text-outline' },
//   { key: 'visits', label: 'Visits', icon: 'time-outline' },
// ];

// const PAGE_SIZE = 10;
// const GEOFENCE_RADIUS = 100; // meters

// export default function CustomerDetailScreen() {
//   const customerRef = useRef<Outlet | null>(null);
//   const { colors } = useTheme();
//   const styles = useOutletDetailStyles();
//   const { id } = useLocalSearchParams<{ id: string }>();

//   const [activeTab, setActiveTab] = useState<TabType>('summary');
//   const [refreshing, setRefreshing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [customer, setCustomer] = useState<Outlet | null>(null);
//   const [isTabScrolled, setIsTabScrolled] = useState(false);
//   const clearVisit = useOutletStore((s) => s.clearVisit);

//   // Geofencing states
//   const [currentLocation, setCurrentLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);
//   const [isInsideGeofenceArea, setIsInsideGeofenceArea] = useState(false);
//   const [distanceToOutlet, setDistanceToOutlet] = useState<number | null>(null);
//   const [autoStartAttempted, setAutoStartAttempted] = useState(false);
//   const [isAutoStarting, setIsAutoStarting] = useState(false);

//   // Sales states
//   const [sales, setSales] = useState<SaleItem[]>([]);
//   const [salesLoading, setSalesLoading] = useState(false);
//   const [salesTotal, setSalesTotal] = useState(0);

//   // Visit history states
//   const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
//   const [visitsLoading, setVisitsLoading] = useState(false);
//   const [visitsTotal, setVisitsTotal] = useState(0);

//   // Refs
//   const locationInterval = useRef<NodeJS.Timeout | null>(null);
//   const appStateListener = useRef<any>(null);
//   const autoStartTimeout = useRef<NodeJS.Timeout | null>(null);
//   const scrollViewRef = useRef<ScrollView>(null);

//   const route = useRouteStore((s) => s.selectedRoute);
//   const van = useRouteStore((s) => s.van);
//   const user = useAuthStore((s) => s.user);
//   const activeVisit = useOutletStore((s) => s.activeVisit);
//   const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
//   const { setSelectedOutlet } = useOutletStore();
//   const { setHeader } = useHeader();
//   const selectedRoute = useRouteStore((s) => s.selectedRoute);
//   const hasTriggeredRef = useRef(false);

//   useEffect(() => {
//     if (activeVisit?.customerId === customer?.customerId) {
//       hasTriggeredRef.current = true;
//     }
//   }, [activeVisit, customer]);

//   // Load customer data
//   useEffect(() => {
//     loadCustomerData();
//   }, [id]);

//   useFocusEffect(
//     useCallback(() => {
//       if (customer) {
//         checkActiveVisit();
//         loadSalesHistory();
//         loadVisitHistory();
//       }
//     }, [customer]),
//   );

//   useFocusEffect(
//     useCallback(() => {
//       setHeader({
//         title: route?.routeName || customer?.name || 'Outlet Details',
//         showBack: true,
//         showMenu: false,
//         backgroundColor: colors.primary,
//       });
//     }, [colors.primary, customer?.name, route?.routeName, setHeader]),
//   );

//   useEffect(() => {
//     customerRef.current = customer;
//   }, [customer]);

//   // Reset auto-start attempt when customer changes or visit ends
//   useEffect(() => {
//     setAutoStartAttempted(false);
//     setIsAutoStarting(false);
//   }, [customer?.customerId, activeVisit]);

//   // Start/stop geofence tracking
//   useEffect(() => {
//     if (customer?.geoTag?.lat && customer?.geoTag?.lng) {
//       startLocationTracking();
//     } else {
//       stopLocationTracking();
//     }

//     return () => {
//       stopLocationTracking();
//     };
//   }, [customer]);

//   useEffect(() => {
//     hasTriggeredRef.current = false;
//   }, [customer?.customerId]);

//   // Auto-start visit when inside geofence OR outside geofence (always auto-start if no active visit)
//   useEffect(() => {
//     // Auto-start visit when there's no active visit, regardless of geofence status
//     const shouldAutoStart = !activeVisit && customer && !hasTriggeredRef.current;

//     if (shouldAutoStart) {
//       autoStartVisit();
//     }
//   }, [customer]);

//   // App state listener
//   useEffect(() => {
//     appStateListener.current = AppState.addEventListener('change', (nextAppState) => {
//       if (nextAppState === 'active' && customer?.geoTag?.lat) {
//         getCurrentLocation();
//       }
//     });

//     return () => {
//       appStateListener.current?.remove();
//     };
//   }, [customer]);

//   useEffect(() => {
//     setIsTabScrolled(false);
//   }, [activeTab]);

//   // Location tracking functions
//   const getCurrentLocation = useCallback(() => {
//     if (Platform.OS === 'web' && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setCurrentLocation({ latitude, longitude });
//           checkGeofenceStatus(latitude, longitude);
//         },
//         (error) => console.warn('Error getting location:', error),
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
//       );
//     }
//   }, []);

//   const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
//     const currentCustomer = customerRef.current;

//     if (!currentCustomer?.geoTag?.lat || !currentCustomer?.geoTag?.lng) {
//       return;
//     }

//     const distance = getDistance(lat, lng, currentCustomer.geoTag.lat, currentCustomer.geoTag.lng);
//     setDistanceToOutlet(distance);

//     const geofence = {
//       id: currentCustomer.customerId,
//       latitude: currentCustomer.geoTag.lat,
//       longitude: currentCustomer.geoTag.lng,
//       radius: GEOFENCE_RADIUS,
//     };

//     const inside = isInsideGeofence(lat, lng, geofence);
//     setIsInsideGeofenceArea(inside);
//   }, []);

//   const startLocationTracking = useCallback(() => {
//     if (locationInterval.current) {
//       clearInterval(locationInterval.current);
//     }

//     getCurrentLocation();
//     locationInterval.current = setInterval(() => {
//       getCurrentLocation();
//     }, 3000);
//   }, [getCurrentLocation]);

//   const stopLocationTracking = useCallback(() => {
//     if (locationInterval.current) {
//       clearInterval(locationInterval.current);
//       locationInterval.current = null;
//     }
//   }, []);

//   // Determine visit type based on geotag and geofence status
//   const getVisitType = useCallback((): ShopVisitType => {
//     // If customer has geotag and user is inside geofence, it's ON_SITE
//     if (customer?.geoTag?.lat && customer?.geoTag?.lng && isInsideGeofenceArea) {
//       return ShopVisitType.ON_SITE;
//     }
//     // Otherwise it's OFF_SITE (no geotag OR outside geofence)
//     return ShopVisitType.OFF_SITE;
//   }, [customer?.geoTag?.lat, customer?.geoTag?.lng, isInsideGeofenceArea]);

//   // Check if there's an active visit and set it
//   const checkActiveVisit = async () => {
//     if (!customer?.customerId) return;

//     try {
//       const query: any = {
//         workSessionId: selectedRoute?.workSessionId,
//         vanId: van?.vanId,
//         routeSessionId: selectedRoute?.routeSessionId,
//         outletId: customer.customerId,
//       };

//       const response = await outletService.visitStatus(query);
//       const visit: any = response?.data;

//       if (visit?.visitId && visit?.status === 'ACTIVE') {
//         // Get current visit type based on location
//         const visitType = getVisitType();

//         setActiveVisit({
//           visitId: visit.visitId,
//           outlet: customer as any,
//           checkInTime: new Date(visit.checkInTime),
//           checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
//           status: visit.status,
//           routeSessionId: visit?.routeSessionId,
//           customerId: visit?.customerId,
//           visitType: visitType,
//         });
//         hasTriggeredRef.current = true;
//       } else if (!visit?.visitId) {
//         clearVisit();
//       }
//     } catch (error) {
//       console.error('checkActiveVisit error:', error);
//     }
//   };

//   // Auto-start visit - Automatically starts ON_SITE or OFF_SITE visit
//   const autoStartVisit = useCallback(async () => {
//     if (!customer || autoStartAttempted || isAutoStarting) {
//       return;
//     }

//     setIsAutoStarting(true);
//     setAutoStartAttempted(true);

//     if (autoStartTimeout.current) {
//       clearTimeout(autoStartTimeout.current);
//     }

//     autoStartTimeout.current = setTimeout(async () => {
//       try {
//         // First check if there's already an active visit for this customer
//         const visitStatusQuery: any = {
//           workSessionId: selectedRoute?.workSessionId,
//           vanId: van?.vanId,
//           routeSessionId: selectedRoute?.routeSessionId,
//           outletId: customer.customerId,
//         };

//         const visitStatusResponse = await outletService.visitStatus(visitStatusQuery);
//         const existingVisit: any = visitStatusResponse?.data;

//         // If there's an active visit, set it and don't start a new one
//         if (existingVisit?.visitId && existingVisit?.status === 'ACTIVE') {
//           const visitType = getVisitType();

//           setActiveVisit({
//             visitId: existingVisit.visitId,
//             outlet: customer as any,
//             checkInTime: new Date(existingVisit.checkInTime),
//             checkOutTime: existingVisit.checkOutTime
//               ? new Date(existingVisit.checkOutTime)
//               : undefined,
//             status: existingVisit.status,
//             routeSessionId: existingVisit?.routeSessionId,
//             customerId: existingVisit?.customerId,
//             visitType: visitType,
//           });

//           setIsAutoStarting(false);
//           return;
//         }

//         // If no active visit exists, determine visit type based on current location
//         const visitType = getVisitType();

//         // Start a new visit with the determined visit type (ON_SITE or OFF_SITE)
//         const payload: any = {
//           routeSessionId: route?.routeSessionId,
//           workSessionId: route?.workSessionId,
//           vanId: van?.vanId,
//           outletId: customer.customerId,
//           visitType: visitType,
//         };

//         const response = await outletService.startVisit(payload);

//         if (response.success && response?.data) {
//           const visit = response.data;

//           setActiveVisit({
//             visitId: visit.visitId,
//             outlet: customer as any,
//             checkInTime: new Date(visit.checkInTime),
//             checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
//             status: visit.status,
//             routeSessionId: visit?.routeSessionId,
//             customerId: visit?.customerId,
//             visitType: visitType,
//           });
//         } else {
//           setAutoStartAttempted(false);
//         }
//       } catch (error) {
//         console.error('Auto-start visit failed:', error);
//         setAutoStartAttempted(false);
//       } finally {
//         setIsAutoStarting(false);
//       }
//     }, 1000);
//   }, [
//     customer,
//     autoStartAttempted,
//     isAutoStarting,
//     route,
//     setActiveVisit,
//     selectedRoute,
//     van,
//     getVisitType,
//   ]);

//   const loadCustomerData = async () => {
//     setIsLoading(true);
//     const response = await outletService.getOutletDetail(id);
//     if (response?.data) {
//       setCustomer(response.data);
//       setSelectedOutlet(response?.data);
//     } else {
//       setCustomer(null);
//     }
//     setIsLoading(false);
//   };

//   const loadSalesHistory = async () => {
//     if (!customer?.customerId) return;

//     setSalesLoading(true);
//     try {
//       const params: any = {
//         page: 1,
//         limit: PAGE_SIZE,
//         customerId: customer.customerId,
//         vanId: van?.vanId,
//         employeeId: user?.userId,
//       };
//       const response: any = await saleService.fetchSales(params);

//       const salesData = response?.data || [];
//       setSales(salesData);
//       setSalesTotal(response?.meta?.total || response?.total || salesData.length);
//     } catch (error) {
//       console.error('Failed to load sales:', error);
//     } finally {
//       setSalesLoading(false);
//     }
//   };

//   const loadVisitHistory = async () => {
//     if (!customer?.customerId) return;

//     setVisitsLoading(true);
//     try {
//       const response = await outletService.getVisitHistory({
//         outletId: customer.customerId,
//         limit: 10,
//         page: 1,
//         vanId: van?.vanId,
//       });

//       const visits = response?.data || [];
//       setVisitHistory(visits);
//       setVisitsTotal((response as any)?.total || 0);
//     } catch (error) {
//       console.error('Failed to load visit history:', error);
//     } finally {
//       setVisitsLoading(false);
//     }
//   };

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await checkActiveVisit();
//     await loadCustomerData();
//     await loadSalesHistory();
//     await loadVisitHistory();
//     setRefreshing(false);
//   }, [customer]);

//   const handleProceedToSale = useCallback(() => {
//     if (customer) {
//       router.push(`/checkin`);
//     }
//   }, [customer]);

//   const handleTabScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const offsetY = event.nativeEvent.contentOffset.y;
//     setIsTabScrolled((previous) => {
//       if (offsetY > 24 && !previous) return true;
//       if (offsetY <= 12 && previous) return false;
//       return previous;
//     });
//   }, []);

//   const formatCurrency = (amount: number): string => {
//     return `ZMW ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
//   };

//   if (isLoading) return <LoadingState styles={styles} />;
//   if (!customer) return <EmptyState styles={styles} colors={colors} />;

//   // Use data from API response
//   const lastOrderDate =
//     customer?.summary?.lastOrderDate || (sales.length > 0 ? sales[0]?.date : null);
//   const lastVisitDate = customer?.summary?.lastVisitDate || customer?.lastVisitedAt;
//   const hasActiveVisit = activeVisit && activeVisit?.customerId === customer.customerId;
//   const currentVisitType = getVisitType();

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

//       {/* Main ScrollView that contains everything except footer */}
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.mainScrollView}
//         contentContainerStyle={styles.mainScrollContent}
//         showsVerticalScrollIndicator={true}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         onScroll={handleTabScroll}
//         scrollEventThrottle={16}
//       >
//         {/* Customer Header - Scrollable */}
//         <CustomerHeader
//           customer={customer}
//           styles={styles}
//           colors={colors}
//           compact={isTabScrolled}
//         />

//         {/* Last Visit and Last Order - Scrollable */}
//         <View style={styles.lastInfoContainer}>
//           <View style={styles.lastInfoCard}>
//             <View style={styles.lastInfoItem}>
//               <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
//               <AppText style={styles.lastInfoLabel}>Last Visit:</AppText>
//               <AppText style={styles.lastInfoValue}>
//                 {lastVisitDate ? moment(lastVisitDate).format('DD MMM YYYY') : 'Never'}
//               </AppText>
//             </View>
//             <View style={styles.lastInfoDivider} />
//             <View style={styles.lastInfoItem}>
//               <Ionicons name="cart-outline" size={16} color={colors.textSecondary} />
//               <AppText style={styles.lastInfoLabel}>Last Order:</AppText>
//               <AppText style={styles.lastInfoValue}>
//                 {lastOrderDate ? moment(lastOrderDate).format('DD MMM YYYY') : 'Never'}
//               </AppText>
//             </View>
//           </View>
//         </View>

//         {/* Debug geofence info - Scrollable */}
//         {__DEV__ && distanceToOutlet !== null && (
//           <View style={styles.debugGeofenceContainer}>
//             <AppText style={styles.debugGeofenceText}>
//               {isInsideGeofenceArea ? '✓ Inside geofence' : '○ Outside geofence'} - Distance:{' '}
//               {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
//               {isAutoStarting && ' - Auto-starting...'}
//             </AppText>
//           </View>
//         )}

//         {/* TAB BAR - Scrollable (moves with content) */}
//         <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />

//         {/* TAB CONTENT - Scrollable */}
//         <TabContent
//           activeTab={activeTab}
//           customer={customer}
//           sales={sales}
//           salesLoading={salesLoading}
//           salesTotal={salesTotal}
//           visitHistory={visitHistory}
//           visitsLoading={visitsLoading}
//           visitsTotal={visitsTotal}
//           styles={styles}
//           colors={colors}
//           formatCurrency={formatCurrency}
//           van={van}
//         />
//       </ScrollView>

//       {/* FIXED FOOTER BUTTON - Always at bottom, outside ScrollView */}
//       <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
//         <Animated.View entering={FadeInUp.duration(400)} style={styles.fullWidthButtonContainer}>
//           <TouchableOpacity
//             style={[styles.fullWidthButton, { backgroundColor: colors.primary }]}
//             onPress={handleProceedToSale}
//             activeOpacity={0.85}
//           >
//             <View style={styles.fullWidthButtonContent}>
//               <Ionicons name="cart-outline" size={24} color="#FFF" />
//               <View style={styles.fullWidthButtonTextContainer}>
//                 <AppText style={styles.fullWidthButtonTitle}>Proceed to Sale</AppText>
//               </View>
//               <Ionicons name="arrow-forward-outline" size={20} color="#FFF" />
//             </View>
//           </TouchableOpacity>
//         </Animated.View>
//       </SafeAreaView>

//       {/* Auto-starting indicator */}
//       {!hasActiveVisit && isAutoStarting && (
//         <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
//           <View style={styles.fullWidthButtonContainer}>
//             <View
//               style={[
//                 styles.fullWidthAutoStartIndicator,
//                 { backgroundColor: colors.primary + '10' },
//               ]}
//             >
//               <ActivityIndicator size="small" color={colors.primary} />
//               <AppText style={[styles.autoStartText, { color: colors.primary }]}>
//                 Auto-starting visit...
//               </AppText>
//             </View>
//           </View>
//         </SafeAreaView>
//       )}
//     </View>
//   );
// }

// // Sub-components
// const LoadingState = ({ styles }: any) => (
//   <View style={styles.container}>
//     <ScrollView
//       style={styles.mainScrollView}
//       contentContainerStyle={styles.mainScrollContent}
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={styles.detailHeader}>
//         <View style={styles.detailHeroCard}>
//           <View style={styles.detailHeroTop}>
//             <Skeleton height={50} width={50} variant="circle" />
//             <View style={[styles.detailHeaderInfo, { gap: 8 }]}>
//               <View style={styles.detailTitleRow}>
//                 <Skeleton height={18} width="64%" borderRadius={8} />
//                 <Skeleton height={24} width={72} borderRadius={12} />
//               </View>
//               <Skeleton height={12} width="42%" borderRadius={6} />
//               <View style={styles.detailMetaRow}>
//                 <Skeleton height={24} width={98} borderRadius={12} />
//                 <Skeleton height={24} width={110} borderRadius={12} />
//               </View>
//             </View>
//           </View>
//           <View style={styles.detailLocationCard}>
//             <Skeleton height={16} width={16} variant="circle" />
//             <Skeleton height={14} width="72%" borderRadius={7} style={{ marginLeft: 8 }} />
//           </View>
//         </View>
//       </View>

//       <View style={styles.lastInfoContainer}>
//         <View style={styles.lastInfoCard}>
//           <View style={styles.lastInfoItem}>
//             <Skeleton height={16} width={16} variant="circle" />
//             <Skeleton height={11} width={62} borderRadius={6} />
//             <Skeleton height={12} width={74} borderRadius={6} />
//           </View>
//           <View style={styles.lastInfoDivider} />
//           <View style={styles.lastInfoItem}>
//             <Skeleton height={16} width={16} variant="circle" />
//             <Skeleton height={11} width={62} borderRadius={6} />
//             <Skeleton height={12} width={74} borderRadius={6} />
//           </View>
//         </View>
//       </View>

//       <View style={styles.tabBar}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           {[92, 84, 128, 78].map((width) => (
//             <Skeleton
//               key={width}
//               height={36}
//               width={width}
//               borderRadius={18}
//               style={{ marginRight: 8 }}
//             />
//           ))}
//         </ScrollView>
//       </View>

//       <View style={styles.tabContentContainer}>
//         <View style={styles.summaryContainer}>
//           <View style={styles.salesSectionCard}>
//             <View style={styles.statsGrid}>
//               {[1, 2].map((item) => (
//                 <View key={item} style={styles.statCard}>
//                   <Skeleton height={24} width={24} variant="circle" />
//                   <Skeleton height={18} width="70%" borderRadius={8} style={{ marginTop: 10 }} />
//                   <Skeleton height={11} width="78%" borderRadius={6} style={{ marginTop: 8 }} />
//                 </View>
//               ))}
//             </View>
//             <View style={styles.statsDivider} />
//             <Skeleton height={14} width={166} borderRadius={7} style={{ alignSelf: 'center' }} />
//             <View style={styles.statsGridSmall}>
//               {[1, 2, 3].map((item) => (
//                 <View key={item} style={styles.statCardSmall}>
//                   <Skeleton height={20} width={20} variant="circle" />
//                   <Skeleton height={16} width="70%" borderRadius={8} style={{ marginTop: 8 }} />
//                   <Skeleton height={10} width="74%" borderRadius={5} style={{ marginTop: 6 }} />
//                 </View>
//               ))}
//             </View>
//           </View>

//           <View style={styles.insightsCard}>
//             <View style={styles.insightsHeader}>
//               <Skeleton height={20} width={20} variant="circle" />
//               <Skeleton height={16} width={156} borderRadius={8} />
//             </View>
//             {[1, 2, 3].map((item) => (
//               <View key={item} style={styles.insightItem}>
//                 <Skeleton height={8} width={8} variant="circle" />
//                 <Skeleton height={13} width={`${74 - item * 8}%`} borderRadius={7} />
//               </View>
//             ))}
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   </View>
// );

// const DetailListSkeleton = ({ styles, rows = 3 }: any) => (
//   <View>
//     <View style={styles.listHeader}>
//       <Skeleton height={18} width={150} borderRadius={8} />
//       <Skeleton height={12} width={118} borderRadius={6} style={{ marginTop: 8 }} />
//     </View>
//     {Array.from({ length: rows }).map((_, index) => (
//       <View key={index} style={styles.invoiceCard}>
//         <View style={styles.invoiceTopRow}>
//           <View style={styles.invoiceMeta}>
//             <Skeleton height={12} width={96} borderRadius={6} />
//             <Skeleton height={14} width={132} borderRadius={7} style={{ marginTop: 8 }} />
//           </View>
//           <View style={styles.invoiceAmountCol}>
//             <Skeleton height={18} width={82} borderRadius={8} />
//             <Skeleton height={10} width={76} borderRadius={5} style={{ marginTop: 6 }} />
//           </View>
//         </View>
//         <View style={styles.invoiceDetailGrid}>
//           {[1, 2, 3].map((item) => (
//             <View key={item} style={styles.invoiceDetailItem}>
//               <Skeleton height={10} width={42} borderRadius={5} />
//               <Skeleton height={14} width={54} borderRadius={7} style={{ marginTop: 6 }} />
//             </View>
//           ))}
//         </View>
//       </View>
//     ))}
//   </View>
// );

// const EmptyState = ({ styles, colors }: any) => (
//   <View style={{ flex: 1 }}>
//     <View style={styles.emptyState}>
//       <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
//       <AppText style={styles.emptyStateTitle}>Customer Not Found</AppText>
//       <AppText style={styles.emptyStateText}>The customer doesn't exist or was removed.</AppText>
//       <TouchableOpacity
//         onPress={() => router.back()}
//         style={styles.emptyStateButton}
//         activeOpacity={0.8}
//       >
//         <AppText style={styles.emptyStateButtonText}>Go Back</AppText>
//       </TouchableOpacity>
//     </View>
//   </View>
// );

// const CustomerHeader = ({ customer, styles, colors, compact }: any) => (
//   <Animated.View entering={FadeInDown.duration(400)} style={styles.detailHeader}>
//     <View style={[styles.detailHeroCard, compact && styles.detailHeroCardCompact]}>
//       <View style={styles.detailHeroTop}>
//         <View style={styles.detailAvatarWrap}>
//           <OutletAvatar outlet={customer} />
//         </View>
//         <View style={styles.detailHeaderInfo}>
//           <View style={styles.detailTitleRow}>
//             <AppText style={styles.detailName} numberOfLines={2}>
//               {customer.name}
//             </AppText>
//             <OutletStatusBadge status={customer.status} />
//           </View>
//           <AppText style={styles.detailOwner} numberOfLines={1}>
//             {customer.ownerName || 'Unknown'}
//           </AppText>

//           <View style={styles.detailMetaRow}>
//             <View style={styles.detailMetaChip}>
//               <Ionicons name="business-outline" size={12} color={colors.primary} />
//               <AppText style={styles.detailMetaChipText}>
//                 {customer.customerTypeId || 'Van Sales'}
//               </AppText>
//             </View>
//             <View style={styles.detailMetaChip}>
//               <Ionicons name="call-outline" size={12} color={colors.primary} />
//               <AppText style={styles.detailMetaChipText}>
//                 {customer.phoneNumber || 'No phone'}
//               </AppText>
//             </View>
//           </View>
//         </View>
//       </View>

//       <View style={styles.detailLocationCard}>
//         <Ionicons name="location-outline" size={16} color={colors.primary} />
//         <AppText style={styles.detailLocation} numberOfLines={2}>
//           {customer.address?.line1 || customer.address || 'Address not available'}
//         </AppText>
//       </View>
//     </View>
//   </Animated.View>
// );

// const TabBar = ({ activeTab, setActiveTab, styles, colors }: any) => (
//   <View style={styles.tabBar}>
//     <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={16}>
//       {TABS.map((tab) => (
//         <TouchableOpacity
//           key={tab.key}
//           style={[styles.tab, activeTab === tab.key && styles.tabActive]}
//           onPress={() => setActiveTab(tab.key)}
//           activeOpacity={0.7}
//         >
//           <Ionicons
//             name={tab.icon as any}
//             size={18}
//             color={activeTab === tab.key ? colors.primary : colors.textSecondary}
//           />
//           <AppText style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
//             {tab.label}
//           </AppText>
//         </TouchableOpacity>
//       ))}
//     </ScrollView>
//   </View>
// );

// const TabContent = ({
//   activeTab,
//   customer,
//   sales,
//   salesLoading,
//   salesTotal,
//   visitHistory,
//   visitsLoading,
//   visitsTotal,
//   styles,
//   colors,
//   formatCurrency,
//   van,
// }: any) => (
//   <View style={styles.tabContentContainer}>
//     {activeTab === 'summary' && (
//       <SummaryTab
//         customer={customer}
//         styles={styles}
//         colors={colors}
//         formatCurrency={formatCurrency}
//       />
//     )}
//     {activeTab === 'sales' && (
//       <SalesTab styles={styles} colors={colors} customerId={customer?.customerId} van={van} />
//     )}
//     {activeTab === 'invoices' && (
//       <InvoicesTab
//         invoices={sales}
//         loading={salesLoading}
//         total={salesTotal}
//         styles={styles}
//         colors={colors}
//         formatCurrency={formatCurrency}
//       />
//     )}
//     {activeTab === 'visits' && (
//       <VisitsTab
//         visits={visitHistory}
//         loading={visitsLoading}
//         total={visitsTotal}
//         styles={styles}
//         colors={colors}
//       />
//     )}
//   </View>
// );

// // Summary Tab
// const SummaryTab = ({ customer, styles, colors, formatCurrency }: any) => {
//   const summary = customer?.summary || {
//     mtd: {
//       orderValue: 0,
//       orderQuantity: 0,
//       orderCount: 0,
//     },
//     last5Orders: {
//       avgOrderValue: 0,
//       avgOrderQuantity: 0,
//       avgLPC: 0,
//       orders: [],
//     },
//     lastOrderDate: null,
//     lastVisitDate: null,
//   };

//   const mtdOrderValue = summary.mtd?.orderValue || 0;
//   const mtdOrderQuantity = summary.mtd?.orderQuantity || 0;
//   const mtdOrderCount = summary.mtd?.orderCount || 0;
//   const avgOrderValue = summary.last5Orders?.avgOrderValue || 0;
//   const avgOrderQuantity = summary.last5Orders?.avgOrderQuantity || 0;
//   const avgLPC = summary.last5Orders?.avgLPC || 0;
//   const recentOrders = summary.last5Orders?.orders || [];

//   return (
//     <View style={styles.summaryContainer}>
//       <View style={styles.salesSectionCard}>
//         <View style={styles.statsGrid}>
//           <View style={styles.statCard}>
//             <Ionicons name="bar-chart-outline" size={24} color={colors.success} />
//             <AppText style={styles.statValue}>{formatCurrency(mtdOrderValue)}</AppText>
//             <AppText style={styles.statLabel}>MTD Order Value</AppText>
//             {mtdOrderCount > 0 && (
//               <AppText style={styles.statSubLabel}>
//                 {mtdOrderCount} order{mtdOrderCount !== 1 ? 's' : ''}
//               </AppText>
//             )}
//           </View>

//           <View style={styles.statCard}>
//             <Ionicons name="cube-outline" size={24} color={colors.info} />
//             <AppText style={styles.statValue}>{mtdOrderQuantity.toFixed(1)}</AppText>
//             <AppText style={styles.statLabel}>MTD Total Cases</AppText>
//           </View>
//         </View>

//         <View style={styles.statsDivider} />
//         <AppText style={styles.statsSubtitle}>
//           Last {recentOrders.length} {recentOrders.length === 1 ? 'Order' : 'Orders'} Average
//         </AppText>

//         <View style={styles.statsGridSmall}>
//           <View style={styles.statCardSmall}>
//             <Ionicons name="cash-outline" size={20} color={colors.warning} />
//             <AppText style={styles.statValueSmall}>{formatCurrency(avgOrderValue)}</AppText>
//             <AppText style={styles.statLabelSmall}>Avg. Value</AppText>
//           </View>

//           <View style={styles.statCardSmall}>
//             <Ionicons name="layers-outline" size={20} color={colors.warning} />
//             <AppText style={styles.statValueSmall}>{avgOrderQuantity.toFixed(1)}</AppText>
//             <AppText style={styles.statLabelSmall}>Avg. Quantity</AppText>
//           </View>

//           <View style={styles.statCardSmall}>
//             <Ionicons name="pricetag-outline" size={20} color={colors.warning} />
//             <AppText style={styles.statValueSmall}>{avgLPC.toFixed(2)}</AppText>
//             <AppText style={styles.statLabelSmall}>LPC</AppText>
//           </View>
//         </View>
//       </View>

//       <View style={styles.insightsCard}>
//         <View style={styles.insightsHeader}>
//           <Ionicons name="bulb-outline" size={20} color={colors.primary} />
//           <AppText style={styles.insightsTitle}>Performance Insights</AppText>
//         </View>

//         <View style={styles.insightItem}>
//           <View style={styles.insightDot} />
//           <AppText style={styles.insightText}>
//             MTD total value: {formatCurrency(mtdOrderValue)} from {mtdOrderCount} order
//             {mtdOrderCount !== 1 ? 's' : ''}
//           </AppText>
//         </View>

//         <View style={styles.insightItem}>
//           <View style={styles.insightDot} />
//           <AppText style={styles.insightText}>
//             Average order value: {formatCurrency(avgOrderValue)} per transaction
//           </AppText>
//         </View>

//         <View style={styles.insightItem}>
//           <View style={styles.insightDot} />
//           <AppText style={styles.insightText}>
//             LPC: {avgLPC.toFixed(2)} cases per PC
//             {avgLPC > 10 ? ' (Good)' : avgLPC > 5 ? ' (Average)' : ' (Needs Improvement)'}
//           </AppText>
//         </View>
//       </View>
//     </View>
//   );
// };

// const SalesTab = ({ styles, colors, customerId, van }: any) => {
//   const [categorySales, setCategorySales] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   // Fetch category-wise sales data
//   const fetchCategoryWiseSales = async () => {
//     if (!customerId) return;

//     setIsLoading(true);
//     try {
//       const response = await saleService.getCategoryWiseSales({
//         outletId: customerId,
//         vanId: van?.vanId,
//       });

//       if (response.statusCode === 200 && response.data) {
//         setCategorySales(response.data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch category-wise sales:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategoryWiseSales();
//   }, [van?.vanId, customerId]);

//   const categories = [...new Set(categorySales.map((item) => item.categoryName))];
//   const months = [
//     ...new Map(
//       categorySales.map((item) => [
//         item.month,
//         { short: item.month, key: `${item.year}-${item.monthNumber}` },
//       ]),
//     ).values(),
//   ];

//   const getValueForMonth = (categoryName: string, month: string) => {
//     const sale = categorySales.find(
//       (item) => item.categoryName === categoryName && item.month === month,
//     );
//     return sale ? sale.totalQtyInCases : 0;
//   };

//   const renderTableHeader = () => (
//     <View style={styles.salesTableHeader}>
//       <View style={[styles.salesTableCell, styles.salesTableCellCategory]}>
//         <AppText style={styles.salesTableHeaderText}>Category</AppText>
//       </View>
//       {months.map((month) => (
//         <View key={month.key} style={styles.salesTableCell}>
//           <AppText style={styles.salesTableHeaderText}>{month.short}</AppText>
//         </View>
//       ))}
//       <View style={[styles.salesTableCell, styles.salesTableCellTotal]}>
//         <AppText style={styles.salesTableHeaderText}>Total</AppText>
//       </View>
//     </View>
//   );

//   const renderTableRow = (category: string) => {
//     const total = months.reduce((sum, month) => sum + getValueForMonth(category, month.short), 0);

//     return (
//       <View key={category} style={styles.salesTableRow}>
//         <View style={[styles.salesTableCell, styles.salesTableCellCategory]}>
//           <AppText style={styles.salesTableCategoryText}>{category}</AppText>
//           <AppText style={styles.salesTableUnitText}>Cases</AppText>
//         </View>
//         {months.map((month) => {
//           const value = getValueForMonth(category, month.short);
//           const hasData = value > 0;
//           return (
//             <View key={month.key} style={styles.salesTableCell}>
//               <AppText
//                 style={[styles.salesTableCellValue, hasData && styles.salesTableCellValueHighlight]}
//               >
//                 {value}
//               </AppText>
//             </View>
//           );
//         })}
//         <View style={[styles.salesTableCell, styles.salesTableCellTotal]}>
//           <AppText style={styles.salesTableCellTotalValue}>{total}</AppText>
//         </View>
//       </View>
//     );
//   };

//   if (isLoading && categorySales.length === 0) {
//     return <DetailListSkeleton styles={styles} rows={4} />;
//   }

//   if (categorySales.length === 0 && !isLoading) {
//     return (
//       <View style={styles.emptyTabContainer}>
//         <Ionicons name="receipt-outline" size={56} color={colors.textTertiary} />
//         <AppText style={styles.emptyTabTitle}>No Sales Data</AppText>
//         <AppText style={styles.emptyTabText}>No sales records found for this customer</AppText>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.salesTableContainer}>
//       <ScrollView horizontal showsHorizontalScrollIndicator={true}>
//         <View>
//           {renderTableHeader()}
//           {categories.map((category) => renderTableRow(category))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const InvoicesTab = ({ invoices, loading, total, styles, colors, formatCurrency }: any) => {
//   const [selectedInvoice, setSelectedInvoice] = useState<SaleItem | null>(null);

//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     return moment(dateString).format('DD MMM YYYY');
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toUpperCase()) {
//       case 'PAID':
//         return colors.success;
//       case 'PARTIAL':
//         return colors.warning;
//       case 'OVERDUE':
//         return colors.error;
//       default:
//         return colors.textSecondary;
//     }
//   };

//   const getItemCases = (item: SaleItemDetail) => Number(item.cases ?? item.caseQty ?? 0);
//   const getItemPieces = (item: SaleItemDetail) => Number(item.pieces ?? item.pieceQty ?? 0);
//   const getItemTotal = (item: SaleItemDetail) => Number(item.total ?? item.totalValue ?? 0);

//   const renderInvoiceCard = (invoice: SaleItem) => {
//     const invoiceNo = invoice.saleId || 'N/A';
//     const paymentStatus = invoice.paymentStatus || 'UNPAID';
//     const statusColor = getStatusColor(paymentStatus);

//     return (
//       <TouchableOpacity
//         key={invoiceNo}
//         style={styles.invoiceCard}
//         activeOpacity={0.78}
//         onPress={() => setSelectedInvoice(invoice)}
//       >
//         <View style={styles.invoiceTopRow}>
//           <View style={styles.invoiceMeta}>
//             <AppText style={styles.invoiceDate}>{formatDate(invoice.date)}</AppText>
//             <AppText style={styles.invoiceNumber} numberOfLines={1}>
//               {invoiceNo}
//             </AppText>
//           </View>
//           <View style={styles.invoiceAmountCol}>
//             <AppText style={[styles.invoiceAmount, { color: colors.primary }]}>
//               {formatCurrency(invoice.totalValue || 0)}
//             </AppText>
//             <AppText style={styles.invoiceAmountLabel}>invoice amount</AppText>
//           </View>
//         </View>

//         <View style={styles.invoiceDetailGrid}>
//           <View style={styles.invoiceDetailItem}>
//             <AppText style={styles.invoiceDetailLabel}>Type</AppText>
//             <AppText style={styles.invoiceDetailValue}>{invoice.type || 'N/A'}</AppText>
//           </View>
//           <View style={styles.invoiceDetailItem}>
//             <AppText style={styles.invoiceDetailLabel}>Cases</AppText>
//             <AppText style={styles.invoiceDetailValue}>{invoice.totalCases || 0}</AppText>
//           </View>
//           <View style={styles.invoiceDetailItem}>
//             <AppText style={styles.invoiceDetailLabel}>Pieces</AppText>
//             <AppText style={styles.invoiceDetailValue}>{invoice.totalPieces || 0}</AppText>
//           </View>
//           <View style={styles.invoiceDetailItem}>
//             <AppText style={styles.invoiceDetailLabel}>Status</AppText>
//             <AppText
//               style={[styles.invoiceDetailStatus, { color: statusColor }]}
//               numberOfLines={1}
//             >
//               {paymentStatus}
//             </AppText>
//           </View>
//         </View>

//         {invoice.pendingAmount > 0 && (
//           <View style={styles.invoiceFooter}>
//             <AppText style={styles.invoicePendingText}>
//               Pending {formatCurrency(invoice.pendingAmount)}
//             </AppText>
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   if (loading && invoices.length === 0) {
//     return <DetailListSkeleton styles={styles} rows={3} />;
//   }

//   return (
//     <View>
//       {invoices.length > 0 && (
//         <View style={styles.listHeader}>
//           <AppText style={styles.listHeaderTitle}>
//             Last {Math.min(invoices.length, PAGE_SIZE)}{' '}
//             {invoices.length === 1 ? 'Invoice' : 'Invoices'}
//           </AppText>
//           {total > PAGE_SIZE && (
//             <AppText style={styles.listHeaderSubtitle}>
//               Showing last {PAGE_SIZE} of {total} total
//             </AppText>
//           )}
//         </View>
//       )}
//       {invoices.map((invoice: SaleItem) => renderInvoiceCard(invoice))}
//       <Modal
//         visible={!!selectedInvoice}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setSelectedInvoice(null)}
//       >
//         <View style={styles.invoiceModalOverlay}>
//           <TouchableOpacity
//             style={styles.invoiceModalBackdrop}
//             activeOpacity={1}
//             onPress={() => setSelectedInvoice(null)}
//           />
//           <View style={styles.invoiceModalContent}>
//             <View style={styles.invoiceModalHeader}>
//               <View style={styles.invoiceModalTitleBlock}>
//                 <AppText style={styles.invoiceModalTitle}>Product Details</AppText>
//                 <AppText style={styles.invoiceModalSubtitle} numberOfLines={1}>
//                   {selectedInvoice?.saleId || 'Invoice'}
//                 </AppText>
//               </View>
//               <TouchableOpacity
//                 style={styles.invoiceModalCloseButton}
//                 onPress={() => setSelectedInvoice(null)}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="close" size={20} color={colors.textPrimary} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.invoiceModalSummaryRow}>
//               <View style={styles.invoiceModalSummaryItem}>
//                 <AppText style={styles.invoiceModalSummaryLabel}>Cases</AppText>
//                 <AppText style={styles.invoiceModalSummaryValue}>
//                   {selectedInvoice?.totalCases || 0}
//                 </AppText>
//               </View>
//               <View style={styles.invoiceModalSummaryItem}>
//                 <AppText style={styles.invoiceModalSummaryLabel}>Pieces</AppText>
//                 <AppText style={styles.invoiceModalSummaryValue}>
//                   {selectedInvoice?.totalPieces || 0}
//                 </AppText>
//               </View>
//               <View style={styles.invoiceModalSummaryItem}>
//                 <AppText style={styles.invoiceModalSummaryLabel}>Amount</AppText>
//                 <AppText style={styles.invoiceModalSummaryValue} numberOfLines={1}>
//                   {formatCurrency(selectedInvoice?.totalValue || 0)}
//                 </AppText>
//               </View>
//             </View>

//             <ScrollView style={styles.invoiceProductsList} showsVerticalScrollIndicator={false}>
//               {selectedInvoice?.items?.length ? (
//                 selectedInvoice.items.map((item, index) => (
//                   <View
//                     key={`${item.productId || item.productName || 'product'}-${index}`}
//                     style={styles.invoiceProductRow}
//                   >
//                     <View style={styles.invoiceProductInfo}>
//                       <AppText style={styles.invoiceProductName} numberOfLines={2}>
//                         {item.productName || 'Product'}
//                       </AppText>
//                       <AppText style={styles.invoiceProductCategory} numberOfLines={1}>
//                         {item.productCategory || item.category || 'Uncategorized'}
//                       </AppText>
//                     </View>
//                     <View style={styles.invoiceProductQtyBlock}>
//                       <AppText style={styles.invoiceProductQty}>
//                         {getItemCases(item)} C / {getItemPieces(item)} P
//                       </AppText>
//                       <AppText style={styles.invoiceProductAmount} numberOfLines={1}>
//                         {formatCurrency(getItemTotal(item))}
//                       </AppText>
//                     </View>
//                   </View>
//                 ))
//               ) : (
//                 <View style={styles.invoiceNoProducts}>
//                   <Ionicons name="cube-outline" size={36} color={colors.textTertiary} />
//                   <AppText style={styles.emptyTabTitle}>No Product Details</AppText>
//                   <AppText style={styles.emptyTabText}>
//                     Product line items are not available for this invoice.
//                   </AppText>
//                 </View>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//       {!loading && invoices.length === 0 && (
//         <View style={styles.emptyTabContainer}>
//           <Ionicons name="document-text-outline" size={56} color={colors.textTertiary} />
//           <AppText style={styles.emptyTabTitle}>No Invoices</AppText>
//           <AppText style={styles.emptyTabText}>No invoices found for this customer</AppText>
//         </View>
//       )}
//     </View>
//   );
// };

// // Visits Tab
// const VisitsTab = ({ visits, loading, total, styles, colors }: any) => {
//   const [selectedVisit, setSelectedVisit] = useState<VisitHistory | null>(null);

//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     return moment(dateString).format('DD MMM YYYY, hh:mm A');
//   };

//   const formatTime = (dateString?: string) => {
//     if (!dateString) return 'Not ended';
//     return moment(dateString).format('hh:mm A');
//   };

//   const formatVisitDate = (dateString?: string) => {
//     if (!dateString) return 'N/A';
//     return moment(dateString).format('DD MMM YYYY');
//   };

//   const getDuration = (checkIn: string, checkOut?: string) => {
//     if (!checkOut) return 'In progress';
//     const start = moment(checkIn);
//     const end = moment(checkOut);
//     const duration = moment.duration(end.diff(start));
//     const hours = Math.floor(duration.asHours());
//     const minutes = duration.minutes();
//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }
//     return `${minutes}m`;
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toUpperCase()) {
//       case 'COMPLETED':
//         return colors.success;
//       case 'ACTIVE':
//         return colors.primary;
//       default:
//         return colors.warning;
//     }
//   };

//   const getVisitOutcome = (visit: VisitHistory) => {
//     const orderCount = Number(visit.orderCount || 0);
//     if (orderCount > 0) return 'Order';
//     return 'No Order';
//   };

//   const renderTimelineItem = ({
//     title,
//     subtitle,
//     time,
//     icon,
//     color,
//     isLast = false,
//   }: {
//     title: string;
//     subtitle: string;
//     time: string;
//     icon: string;
//     color: string;
//     isLast?: boolean;
//   }) => (
//     <View style={styles.visitTimelineItem}>
//       <View style={styles.visitTimelineMarkerWrap}>
//         <View style={[styles.visitTimelineMarker, { backgroundColor: color + '18' }]}>
//           <Ionicons name={icon as any} size={15} color={color} />
//         </View>
//         {!isLast && <View style={styles.visitTimelineLine} />}
//       </View>
//       <View style={styles.visitTimelineContent}>
//         <View style={styles.visitTimelineTitleRow}>
//           <AppText style={styles.visitTimelineTitle}>{title}</AppText>
//           <AppText style={styles.visitTimelineTime}>{time}</AppText>
//         </View>
//         <AppText style={styles.visitTimelineSubtitle}>{subtitle}</AppText>
//       </View>
//     </View>
//   );

//   const renderVisitCard = (item: VisitHistory) => (
//     <TouchableOpacity
//       key={item.visitId}
//       style={styles.visitCard}
//       activeOpacity={0.78}
//       onPress={() => setSelectedVisit(item)}
//     >
//       <View style={styles.visitCardHeader}>
//         <View style={[styles.visitStatusDot, { backgroundColor: getStatusColor(item.status) }]} />
//         <AppText style={styles.visitDate}>{formatDate(item.checkInTime)}</AppText>
//         <View style={[styles.visitDurationBadge, { backgroundColor: colors.primary + '10' }]}>
//           <Ionicons name="time-outline" size={12} color={colors.primary} />
//           <AppText style={styles.visitDuration}>
//             {getDuration(item.checkInTime, item.checkOutTime)}
//           </AppText>
//         </View>
//       </View>
//       <View style={styles.visitDetailGrid}>
//         <View style={styles.visitDetailItem}>
//           <AppText style={styles.visitDetailLabel}>Start</AppText>
//           <AppText style={styles.visitDetailValue}>{formatTime(item.checkInTime)}</AppText>
//         </View>
//         <View style={styles.visitDetailItem}>
//           <AppText style={styles.visitDetailLabel}>End</AppText>
//           <AppText style={styles.visitDetailValue}>{formatTime(item.checkOutTime)}</AppText>
//         </View>
//         <View style={styles.visitDetailItem}>
//           <AppText style={styles.visitDetailLabel}>Status</AppText>
//           <AppText
//             style={[styles.visitDetailStatus, { color: getStatusColor(item.status) }]}
//             numberOfLines={1}
//           >
//             {item.status || 'N/A'}
//           </AppText>
//         </View>
//       </View>
//       {item.note && (
//         <View style={styles.visitNote}>
//           <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
//           <AppText style={styles.visitNoteText}>{item.note}</AppText>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   if (loading && visits.length === 0) {
//     return <DetailListSkeleton styles={styles} rows={3} />;
//   }

//   return (
//     <View>
//       {visits.length > 0 && (
//         <View style={styles.listHeader}>
//           <AppText style={styles.listHeaderTitle}>
//             Last {Math.min(visits.length, 10)} Visits
//           </AppText>
//           {total > 10 && (
//             <AppText style={styles.listHeaderSubtitle}>Showing last 10 of {total} total</AppText>
//           )}
//         </View>
//       )}
//       {visits.map((item: VisitHistory) => renderVisitCard(item))}
//       <Modal
//         visible={!!selectedVisit}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setSelectedVisit(null)}
//       >
//         <View style={styles.invoiceModalOverlay}>
//           <TouchableOpacity
//             style={styles.invoiceModalBackdrop}
//             activeOpacity={1}
//             onPress={() => setSelectedVisit(null)}
//           />
//           <View style={styles.invoiceModalContent}>
//             <View style={styles.invoiceModalHeader}>
//               <View style={styles.invoiceModalTitleBlock}>
//                 <AppText style={styles.invoiceModalTitle}>
//                   {selectedVisit ? getVisitOutcome(selectedVisit) : 'Visit'} Timeline
//                 </AppText>
//                 <AppText style={styles.invoiceModalSubtitle} numberOfLines={1}>
//                   {selectedVisit?.outletName || selectedVisit?.outletId || 'Visit'} -{' '}
//                   {formatVisitDate(selectedVisit?.checkInTime)}
//                 </AppText>
//               </View>
//               <TouchableOpacity
//                 style={styles.invoiceModalCloseButton}
//                 onPress={() => setSelectedVisit(null)}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="close" size={20} color={colors.textPrimary} />
//               </TouchableOpacity>
//             </View>

//             {selectedVisit && (
//               <View style={styles.visitTimelineList}>
//                 {renderTimelineItem({
//                   title: 'Visit Started',
//                   subtitle: `Status: ${selectedVisit.status || 'N/A'}`,
//                   time: formatTime(selectedVisit.checkInTime),
//                   icon: 'log-in-outline',
//                   color: colors.primary,
//                 })}
//                 {Number(selectedVisit.orderCount || 0) > 0
//                   ? renderTimelineItem({
//                       title: 'Order Placed',
//                       subtitle: `${selectedVisit.orderCount || 0} order${
//                         Number(selectedVisit.orderCount || 0) === 1 ? '' : 's'
//                       } recorded during this visit`,
//                       time: formatTime(selectedVisit.checkOutTime || selectedVisit.checkInTime),
//                       icon: 'cart-outline',
//                       color: colors.success,
//                     })
//                   : renderTimelineItem({
//                       title: 'No Order',
//                       subtitle: selectedVisit.note || 'Visit completed without an order',
//                       time: formatTime(selectedVisit.checkOutTime || selectedVisit.checkInTime),
//                       icon: 'remove-circle-outline',
//                       color: colors.warning,
//                     })}
//                 {Number(selectedVisit.paymentCount || 0) > 0 &&
//                   renderTimelineItem({
//                     title: 'Payment Collected',
//                     subtitle: `${selectedVisit.paymentCount || 0} payment${
//                       Number(selectedVisit.paymentCount || 0) === 1 ? '' : 's'
//                     } recorded`,
//                     time: formatTime(selectedVisit.checkOutTime || selectedVisit.checkInTime),
//                     icon: 'cash-outline',
//                     color: colors.info || colors.primary,
//                   })}
//                 {renderTimelineItem({
//                   title: selectedVisit.checkOutTime ? 'Visit Ended' : 'Visit In Progress',
//                   subtitle: `Duration: ${getDuration(
//                     selectedVisit.checkInTime,
//                     selectedVisit.checkOutTime,
//                   )}`,
//                   time: formatTime(selectedVisit.checkOutTime),
//                   icon: selectedVisit.checkOutTime ? 'log-out-outline' : 'hourglass-outline',
//                   color: selectedVisit.checkOutTime ? colors.textSecondary : colors.primary,
//                   isLast: true,
//                 })}
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>
//       {!loading && visits.length === 0 && (
//         <View style={styles.emptyTabContainer}>
//           <Ionicons name="time-outline" size={56} color={colors.textTertiary} />
//           <AppText style={styles.emptyTabTitle}>No Visits</AppText>
//           <AppText style={styles.emptyTabText}>No visit history found for this customer</AppText>
//         </View>
//       )}
//     </View>
//   );
// };



import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Platform, NativeScrollEvent,
  NativeSyntheticEvent, AppState, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText, Skeleton } from '@/core/components';
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

// ── Types ─────────────────────────────────────────────────────────────────────
export enum ShopVisitType { ON_SITE = 'ON_SITE', OFF_SITE = 'OFF_SITE' }

interface SaleItemDetail {
  productId: string; productName: string; productCategory?: string; category?: string;
  quantity: number; cases: number; pieces: number; price: number; total: number;
  caseQty?: number; pieceQty?: number; totalValue?: number;
  casePrice?: number; piecePrice?: number;
}

interface SaleItem {
  saleId: string; vanId: string; vanName: string; customerId: string; customerName: string;
  employeeId: string; employeeName: string; date: string;
  totalCases: number; totalPieces: number; totalQty: number; totalWeight: number; totalValue: number;
  totalReturnCases: number; totalReturnPieces: number; totalReturnQty: number;
  type: 'CASH' | 'CREDIT'; paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paidAmount: number; pendingAmount: number; remark?: string;
  status: 'DRAFT' | 'CONFIRMED' | 'RETURNED' | 'CANCELLED';
  items?: SaleItemDetail[]; productCategory?: string;
}

interface VisitHistory {
  visitId: string; outletId: string; outletName?: string;
  checkInTime: string; checkOutTime?: string; status: string;
  note?: string; visitType?: ShopVisitType;
  orderCount?: number; paymentCount?: number;
  orderValue?: number; orderCases?: number; orderWeight?: number;
}

type TabType = 'summary' | 'sales' | 'invoices' | 'visits';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'summary',  label: 'Summary',  icon: 'stats-chart-outline' },
  { key: 'sales',    label: 'Sales',    icon: 'receipt-outline' },
  { key: 'invoices', label: 'Invoices', icon: 'document-text-outline' },
  { key: 'visits',   label: 'Visits',   icon: 'time-outline' },
];

const PAGE_SIZE = 10;
const GEOFENCE_RADIUS = 100;

// ── Shared token map (avoids prop-drilling colors for inline styles) ───────────
const T = {
  display: { fontSize: 18, fontWeight: '700' as const },
  title:   { fontSize: 15, fontWeight: '600' as const },
  section: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  value:   { fontSize: 16, fontWeight: '700' as const },
  valueS:  { fontSize: 14, fontWeight: '700' as const },
  body:    { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  bodyM:   { fontSize: 13, fontWeight: '500' as const },
  label:   { fontSize: 11, fontWeight: '500' as const },
  micro:   { fontSize: 10, fontWeight: '600' as const },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (amount: number) =>
  `ZMW ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;

const fmtDate   = (s?: string | null) => s ? moment(s).format('DD MMM YYYY') : 'Never';
const fmtTime   = (s?: string | null) => s ? moment(s).format('hh:mm A') : '--';
const fmtDT     = (s?: string | null) => s ? moment(s).format('DD MMM YYYY, hh:mm A') : 'N/A';

const getDuration = (checkIn: string, checkOut?: string) => {
  if (!checkOut) return 'In progress';
  const d = moment.duration(moment(checkOut).diff(moment(checkIn)));
  const h = Math.floor(d.asHours()), m = d.minutes();
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getItemCases  = (i: SaleItemDetail) => Number(i.cases   ?? i.caseQty  ?? 0);
const getItemPieces = (i: SaleItemDetail) => Number(i.pieces  ?? i.pieceQty ?? 0);
const getItemTotal  = (i: SaleItemDetail) => Number(i.total   ?? i.totalValue ?? 0);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getFilterRange = (filter: string, custom: { startDate: Date; endDate: Date }) => {
  const today = startOfDay(new Date());
  if (filter === 'today') return { startDate: today, endDate: today };
  if (filter === 'week') {
    const s = new Date(today); s.setDate(today.getDate() - today.getDay());
    return { startDate: s, endDate: today };
  }
  if (filter === 'month') return { startDate: new Date(today.getFullYear(), today.getMonth(), 1), endDate: today };
  return custom;
};

// ── Shared bottom-sheet modal ─────────────────────────────────────────────────
const BottomSheet = ({
  visible, onClose, title, subtitle, children, colors: c,
}: {
  visible: boolean; onClose: () => void; title: string; subtitle?: string;
  children: React.ReactNode; colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View style={{
        backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        maxHeight: '80%', borderTopWidth: 1, borderTopColor: c.border,
      }}>
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: c.border }} />
        </View>

        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingBottom: 12,
          borderBottomWidth: 1, borderBottomColor: c.border,
        }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText style={{ ...T.title, color: c.textPrimary }}>{title}</AppText>
            {subtitle ? <AppText numberOfLines={1} style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>{subtitle}</AppText> : null}
          </View>
          <TouchableOpacity
            onPress={onClose} activeOpacity={0.7}
            style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: c.background,
              alignItems: 'center', justifyContent: 'center', marginLeft: 12,
            }}
          >
            <Ionicons name="close" size={18} color={c.textPrimary} />
          </TouchableOpacity>
        </View>

        {children}
      </View>
    </View>
  </Modal>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export default function CustomerDetailScreen() {
  const customerRef = useRef<Outlet | null>(null);
  const { colors } = useTheme();
  const styles = useOutletDetailStyles();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab]                 = useState<TabType>('summary');
  const [refreshing, setRefreshing]               = useState(false);
  const [isLoading, setIsLoading]                 = useState(false);
  const [customer, setCustomer]                   = useState<Outlet | null>(null);
  const [isTabScrolled, setIsTabScrolled]         = useState(false);
  const clearVisit                                = useOutletStore((s) => s.clearVisit);

  const [isInsideGeofenceArea, setIsInsideGeofenceArea] = useState(false);
  const [distanceToOutlet, setDistanceToOutlet]         = useState<number | null>(null);
  const [autoStartAttempted, setAutoStartAttempted]     = useState(false);
  const [isAutoStarting, setIsAutoStarting]             = useState(false);

  const [sales, setSales]           = useState<SaleItem[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const [visitHistory, setVisitHistory]     = useState<VisitHistory[]>([]);
  const [visitsLoading, setVisitsLoading]   = useState(false);
  const [visitsTotal, setVisitsTotal]       = useState(0);
  const [visitsLoaded, setVisitsLoaded] = useState(false);

  const locationInterval  = useRef<NodeJS.Timeout | null>(null);
  const appStateListener  = useRef<any>(null);
  const autoStartTimeout  = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef     = useRef<ScrollView>(null);

  const route         = useRouteStore((s) => s.selectedRoute);
  const van           = useRouteStore((s) => s.van);
  const user          = useAuthStore((s) => s.user);
  const activeVisit   = useOutletStore((s) => s.activeVisit);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const { setSelectedOutlet } = useOutletStore();
  const { setHeader } = useHeader();
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (activeVisit?.customerId === customer?.customerId) hasTriggeredRef.current = true;
  }, [activeVisit, customer]);

  useEffect(() => { loadCustomerData(); }, [id]);

  useFocusEffect(useCallback(() => {
    if (customer) checkActiveVisit();
  }, [customer]));

  useFocusEffect(useCallback(() => {
    setHeader({ title: route?.routeName || customer?.name || 'Outlet Details', showBack: true, showMenu: false, backgroundColor: colors.primary });
  }, [colors.primary, customer?.name, route?.routeName, setHeader]));

  useEffect(() => { customerRef.current = customer; }, [customer]);
  useEffect(() => { setAutoStartAttempted(false); setIsAutoStarting(false); }, [customer?.customerId, activeVisit]);
  useEffect(() => {
    setSales([]);
    setSalesTotal(0);
    setSalesLoaded(false);
    setVisitHistory([]);
    setVisitsTotal(0);
    setVisitsLoaded(false);
  }, [customer?.customerId, van?.vanId]);

  useEffect(() => {
    if (customer?.geoTag?.lat && customer?.geoTag?.lng) startLocationTracking();
    else stopLocationTracking();
    return () => stopLocationTracking();
  }, [customer]);

  useEffect(() => { hasTriggeredRef.current = false; }, [customer?.customerId]);

  useEffect(() => {
    if (!activeVisit && customer && !hasTriggeredRef.current) autoStartVisit();
  }, [customer]);

  useEffect(() => {
    appStateListener.current = AppState.addEventListener('change', (s) => {
      if (s === 'active' && customer?.geoTag?.lat) getCurrentLocation();
    });
    return () => appStateListener.current?.remove();
  }, [customer]);

  useEffect(() => { setIsTabScrolled(false); }, [activeTab]);

  const getCurrentLocation = useCallback(() => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => { checkGeofenceStatus(latitude, longitude); },
        (e) => console.warn('Location error:', e),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    }
  }, []);

  const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
    const c = customerRef.current;
    if (!c?.geoTag?.lat || !c?.geoTag?.lng) return;
    setDistanceToOutlet(getDistance(lat, lng, c.geoTag.lat, c.geoTag.lng));
    setIsInsideGeofenceArea(isInsideGeofence(lat, lng, { id: c.customerId, latitude: c.geoTag.lat, longitude: c.geoTag.lng, radius: GEOFENCE_RADIUS }));
  }, []);

  const startLocationTracking = useCallback(() => {
    if (locationInterval.current) clearInterval(locationInterval.current);
    getCurrentLocation();
    locationInterval.current = setInterval(getCurrentLocation, 3000);
  }, [getCurrentLocation]);

  const stopLocationTracking = useCallback(() => {
    if (locationInterval.current) { clearInterval(locationInterval.current); locationInterval.current = null; }
  }, []);

  const getVisitType = useCallback((): ShopVisitType =>
    customer?.geoTag?.lat && customer?.geoTag?.lng && isInsideGeofenceArea
      ? ShopVisitType.ON_SITE : ShopVisitType.OFF_SITE,
  [customer?.geoTag?.lat, customer?.geoTag?.lng, isInsideGeofenceArea]);

  const checkActiveVisit = async () => {
    if (!customer?.customerId) return;
    try {
      const query: any = { workSessionId: selectedRoute?.workSessionId, vanId: van?.vanId, routeSessionId: selectedRoute?.routeSessionId, outletId: customer.customerId };
      const visit: any = (await outletService.visitStatus(query))?.data;
      if (visit?.visitId && visit?.status === 'ACTIVE') {
        setActiveVisit({ visitId: visit.visitId, outlet: customer as any, checkInTime: new Date(visit.checkInTime), checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined, status: visit.status, routeSessionId: visit?.routeSessionId, customerId: visit?.customerId, visitType: getVisitType() });
        hasTriggeredRef.current = true;
      } else if (!visit?.visitId) clearVisit();
    } catch (e) { console.error('checkActiveVisit error:', e); }
  };

  const autoStartVisit = useCallback(async () => {
    if (!customer || autoStartAttempted || isAutoStarting) return;
    setIsAutoStarting(true); setAutoStartAttempted(true);
    if (autoStartTimeout.current) clearTimeout(autoStartTimeout.current);
    autoStartTimeout.current = setTimeout(async () => {
      try {
        const q: any = { workSessionId: selectedRoute?.workSessionId, vanId: van?.vanId, routeSessionId: selectedRoute?.routeSessionId, outletId: customer.customerId };
        const existing: any = (await outletService.visitStatus(q))?.data;
        if (existing?.visitId && existing?.status === 'ACTIVE') {
          setActiveVisit({ visitId: existing.visitId, outlet: customer as any, checkInTime: new Date(existing.checkInTime), checkOutTime: existing.checkOutTime ? new Date(existing.checkOutTime) : undefined, status: existing.status, routeSessionId: existing?.routeSessionId, customerId: existing?.customerId, visitType: getVisitType() });
          setIsAutoStarting(false); return;
        }
        const visitType = getVisitType();
        const res = await outletService.startVisit({ routeSessionId: route?.routeSessionId, workSessionId: route?.workSessionId, vanId: van?.vanId, outletId: customer.customerId, visitType });
        if (res.success && res?.data) {
          const v = res.data;
          setActiveVisit({ visitId: v.visitId, outlet: customer as any, checkInTime: new Date(v.checkInTime), checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined, status: v.status, routeSessionId: v?.routeSessionId, customerId: v?.customerId, visitType });
        } else setAutoStartAttempted(false);
      } catch (e) { console.error('Auto-start failed:', e); setAutoStartAttempted(false); }
      finally { setIsAutoStarting(false); }
    }, 1000);
  }, [customer, autoStartAttempted, isAutoStarting, route, setActiveVisit, selectedRoute, van, getVisitType]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    const res = await outletService.getOutletDetail(id);
    if (res?.data) { setCustomer(res.data); setSelectedOutlet(res?.data); } else setCustomer(null);
    setIsLoading(false);
  };

  const loadSalesHistory = async () => {
    if (!customer?.customerId) return;
    setSalesLoading(true);
    try {
      const res: any = await saleService.fetchSales({ page: 1, limit: PAGE_SIZE, customerId: customer.customerId, vanId: van?.vanId, employeeId: user?.userId });
      const data = res?.data || [];
      setSales(data); setSalesTotal(res?.meta?.total || res?.total || data.length);
    } catch (e) { console.error('Failed to load sales:', e); } finally { setSalesLoaded(true); setSalesLoading(false); }
  };

  const loadVisitHistory = async () => {
    if (!customer?.customerId) return;
    setVisitsLoading(true);
    try {
      const res = await outletService.getVisitHistory({ outletId: customer.customerId, limit: 10, page: 1, vanId: van?.vanId });
      const visits = res?.data || [];
      setVisitHistory(visits); setVisitsTotal((res as any)?.meta?.total || (res as any)?.total || 0);
    } catch (e) { console.error('Failed to load visits:', e); } finally { setVisitsLoaded(true); setVisitsLoading(false); }
  };

  useEffect(() => {
    if (!customer?.customerId) return;

    if (activeTab === 'invoices') {
      setSalesLoaded(false);
      void loadSalesHistory();
    }

    if (activeTab === 'visits') {
      setVisitsLoaded(false);
      void loadVisitHistory();
    }
  }, [activeTab, customer?.customerId, van?.vanId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await checkActiveVisit();
    await loadCustomerData();

    if (activeTab === 'invoices') {
      setSalesLoaded(false);
      await loadSalesHistory();
    }

    if (activeTab === 'visits') {
      setVisitsLoaded(false);
      await loadVisitHistory();
    }

    setRefreshing(false);
  }, [customer, activeTab]);

  const handleProceedToSale = useCallback(() => { if (customer) router.push('/checkin'); }, [customer]);

  const handleTabScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setIsTabScrolled((prev) => { if (y > 24 && !prev) return true; if (y <= 12 && prev) return false; return prev; });
  }, []);

  if (isLoading) return <LoadingState />;
  if (!customer) return <EmptyState colors={colors} />;

  const lastOrderDate  = customer?.summary?.lastOrderDate || (sales.length > 0 ? sales[0]?.date : null);
  const lastVisitDate  = customer?.summary?.lastVisitDate || customer?.lastVisitedAt;
  const hasActiveVisit = activeVisit && activeVisit?.customerId === customer.customerId;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleTabScroll}
        scrollEventThrottle={16}
      >
        <CustomerHeader customer={customer} colors={colors} compact={isTabScrolled} />

        {/* Last visit / last order */}
        <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 8 }}>
          <View style={{
            flexDirection: 'row', backgroundColor: colors.surface,
            borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border,
          }}>
            {([
              { icon: 'time-outline',  label: 'Last Visit',  value: fmtDate(lastVisitDate) },
              { icon: 'cart-outline',  label: 'Last Order',  value: fmtDate(lastOrderDate) },
            ] as const).map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 12 }} />}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{
                    width: 30, height: 30, borderRadius: 8,
                    backgroundColor: colors.primary + '12',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Ionicons name={item.icon as any} size={14} color={colors.primary} />
                  </View>
                  <View>
                    <AppText style={{ ...T.label, color: colors.textSecondary }}>{item.label}</AppText>
                    <AppText style={{ ...T.bodyM, color: colors.textPrimary, marginTop: 1 }}>{item.value}</AppText>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Dev geofence pill */}
        {__DEV__ && distanceToOutlet !== null && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: isInsideGeofenceArea ? colors.success : colors.warning,
            marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 8,
          }}>
            <Ionicons
              name={isInsideGeofenceArea ? 'checkmark-circle-outline' : 'radio-outline'}
              size={13} color={colors.primaryContrast}
            />
            <AppText style={{ ...T.label, color: colors.primaryContrast }}>
              {isInsideGeofenceArea ? 'Inside' : 'Outside'} geofence · {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
              {isAutoStarting ? ' · starting…' : ''}
            </AppText>
          </View>
        )}

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}>
          {activeTab === 'summary'  && <SummaryTab  customer={customer} colors={colors} />}
          {activeTab === 'sales'    && <SalesTab    colors={colors} customerId={customer?.customerId} van={van} />}
          {activeTab === 'invoices' && <InvoicesTab invoices={sales} loading={salesLoading || !salesLoaded} total={salesTotal} colors={colors} />}
          {activeTab === 'visits'   && <VisitsTab   visits={visitHistory} loading={visitsLoading || !visitsLoaded} total={visitsTotal} colors={colors} />}
        </View>
      </ScrollView>

      {/* Fixed footer — single SafeAreaView, no overlap */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
        {isAutoStarting && !hasActiveVisit ? (
          <View style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText style={{ ...T.bodyM, color: colors.primary }}>Starting visit…</AppText>
          </View>
        ) : (
          <Animated.View entering={FadeInUp.duration(300)} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <TouchableOpacity
              onPress={handleProceedToSale}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.primary, borderRadius: 14,
                padding: 8,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                shadowColor: colors.primary, shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.35, shadowRadius: 12, elevation: 7,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Ionicons name="cart-outline" size={20} color="#FFF" />
                </View>
                <View>
                  <AppText style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>Proceed to Sale</AppText>
                  <AppText style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 1 }}>
                    {hasActiveVisit ? 'Visit active' : 'Tap to start'}
                  </AppText>
                </View>
              </View>
              <View style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Ionicons name="arrow-forward" size={17} color="#FFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

// ── Skeleton states ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton height={52} width={52} variant="circle" />
            <View style={{ flex: 1, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Skeleton height={16} width="55%" borderRadius={8} />
                <Skeleton height={22} width={68} borderRadius={11} />
              </View>
              <Skeleton height={12} width="36%" borderRadius={6} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Skeleton height={24} width={94} borderRadius={12} />
                <Skeleton height={24} width={106} borderRadius={12} />
              </View>
            </View>
          </View>
          <Skeleton height={34} width="100%" borderRadius={10} style={{ marginTop: 12 }} />
        </View>
        <Skeleton height={56} width="100%" borderRadius={12} />
        <Skeleton height={42} width="100%" borderRadius={0} />
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1,2].map(i => (
              <View key={i} style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 14, gap: 10, alignItems: 'center' }}>
                <Skeleton height={22} width={22} variant="circle" />
                <Skeleton height={20} width="72%" borderRadius={8} />
                <Skeleton height={11} width="80%" borderRadius={6} />
              </View>
            ))}
          </View>
          {[1,2,3].map(i => <Skeleton key={i} height={40} width="100%" borderRadius={8} />)}
        </View>
      </View>
    </ScrollView>
  </View>
);

const DetailListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <View style={{ gap: 10 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <View key={i} style={{ backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden' }}>
        <View style={{ height: 3, backgroundColor: '#E5E5E5' }} />
        <View style={{ padding: 14, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ gap: 7 }}>
              <Skeleton height={11} width={88} borderRadius={6} />
              <Skeleton height={14} width={128} borderRadius={7} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 5 }}>
              <Skeleton height={17} width={76} borderRadius={8} />
              <Skeleton height={10} width={70} borderRadius={5} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1,2,3].map(j => (
              <View key={j} style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 8, gap: 5 }}>
                <Skeleton height={10} width={36} borderRadius={5} />
                <Skeleton height={13} width="80%" borderRadius={6} />
              </View>
            ))}
          </View>
        </View>
      </View>
    ))}
  </View>
);

const EmptyState = ({ colors }: { colors: any }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
    <Ionicons name="alert-circle-outline" size={60} color={colors.textTertiary} />
    <AppText style={{ ...T.title, color: colors.textPrimary, marginTop: 16, marginBottom: 8, textAlign: 'center' }}>Customer not found</AppText>
    <AppText style={{ ...T.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>This customer doesn't exist or was removed.</AppText>
    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}
      style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 }}>
      <AppText style={{ color: colors.primaryContrast, fontWeight: '600', fontSize: 13 }}>Go back</AppText>
    </TouchableOpacity>
  </View>
);

// ── Customer Header ────────────────────────────────────────────────────────────
const CustomerHeader = ({ customer, colors: c, compact }: any) => (
  <Animated.View entering={FadeInDown.duration(300)} style={{ paddingHorizontal: 16, paddingTop: 12 }}>
    <View style={{
      backgroundColor: c.surface, borderRadius: 18,
      padding: 16, borderWidth: 1, borderColor: c.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: c.primary + '12',
          justifyContent: 'center', alignItems: 'center', flexShrink: 0,
        }}>
          <OutletAvatar outlet={customer} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
            <AppText numberOfLines={1} style={{ ...T.title, color: c.textPrimary, flex: 1 }}>
              {customer.name}
            </AppText>
            <OutletStatusBadge status={customer.status} />
          </View>
          <AppText numberOfLines={1} style={{ ...T.body, color: c.textSecondary, marginBottom: 8 }}>
            {customer.ownerName || 'Owner unknown'}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {[
              { icon: 'business-outline', text: customer.customerTypeId || 'Van Sales' },
              { icon: 'call-outline',     text: customer.phoneNumber     || 'No phone' },
            ].map(chip => (
              <View key={chip.icon} style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: c.primary + '0D', paddingHorizontal: 8,
                paddingVertical: 4, borderRadius: 20,
                borderWidth: 1, borderColor: c.primary + '1E',
              }}>
                <Ionicons name={chip.icon as any} size={11} color={c.primary} />
                <AppText style={{ ...T.micro, color: c.primary }}>{chip.text}</AppText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Address — hidden when compact */}
      {!compact && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          marginTop: 12, paddingTop: 12,
          borderTopWidth: 1, borderTopColor: c.border,
        }}>
          <Ionicons name="location-outline" size={14} color={c.primary} />
          <AppText numberOfLines={2} style={{ ...T.body, color: c.textSecondary, flex: 1 }}>
            {customer.address?.line1 || customer.address || 'Address not available'}
          </AppText>
        </View>
      )}
    </View>
  </Animated.View>
);

// ── Tab bar ────────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, setActiveTab, colors: c }: any) => (
  <View style={{ backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border, borderBottomWidth: 1, borderBottomColor: c.border, marginTop: 8 }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }}>
      {TABS.map(tab => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              paddingVertical: 12, paddingHorizontal: 12,
              borderBottomWidth: 2, borderBottomColor: active ? c.primary : 'transparent',
            }}
          >
            <Ionicons name={tab.icon as any} size={14} color={active ? c.primary : c.textSecondary} />
            <AppText style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? c.primary : c.textSecondary }}>
              {tab.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

// ── Summary Tab ───────────────────────────────────────────────────────────────
const SummaryTab = ({ customer, colors: c }: any) => {
  const summary        = customer?.summary || {};
  const mtdValue       = summary.mtd?.orderValue    || 0;
  const mtdQty         = summary.mtd?.orderQuantity || 0;
  const mtdCount       = summary.mtd?.orderCount    || 0;
  const avgValue       = summary.last5Orders?.avgOrderValue    || 0;
  const avgQty         = summary.last5Orders?.avgOrderQuantity || 0;
  const avgLPC         = summary.last5Orders?.avgLPC           || 0;
  const recentOrders   = summary.last5Orders?.orders           || [];
  const lpcRating      = avgLPC > 10 ? { label: 'Good', color: c.success } : avgLPC > 5 ? { label: 'Average', color: c.warning } : { label: 'Low', color: c.error };

  return (
    <View style={{ gap: 12 }}>
      {/* MTD card */}
      <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <View style={{ backgroundColor: c.primary + '12', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
            <AppText style={{ ...T.section, color: c.primary }}>MTD</AppText>
          </View>
          <AppText style={{ ...T.label, color: c.textSecondary }}>Month-to-date summary</AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { icon: 'bar-chart-outline', color: c.success, value: fmt(mtdValue),        label: 'Order Value', sub: `${mtdCount} order${mtdCount !== 1 ? 's' : ''}` },
            { icon: 'cube-outline',      color: c.info,    value: mtdQty.toFixed(1),    label: 'Cases',       sub: null },
          ].map(s => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: c.background, borderRadius: 12,
              padding: 12, borderLeftWidth: 3, borderLeftColor: s.color,
            }}>
              <Ionicons name={s.icon as any} size={18} color={s.color} style={{ marginBottom: 8 }} />
              <AppText style={{ ...T.value, color: c.textPrimary }}>{s.value}</AppText>
              <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 3 }}>{s.label}</AppText>
              {s.sub && <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>{s.sub}</AppText>}
            </View>
          ))}
        </View>

        {/* Divider + averages */}
        <View style={{ height: 1, backgroundColor: c.border, marginVertical: 14 }} />
        <AppText style={{ ...T.label, color: c.textSecondary, marginBottom: 10 }}>
          Last {recentOrders.length || 5} orders — averages
        </AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { icon: 'cash-outline',     color: c.warning,        value: fmt(avgValue),      label: 'Avg Value'  },
            { icon: 'layers-outline',   color: c.warning,        value: avgQty.toFixed(1),  label: 'Avg Qty'    },
            { icon: 'pricetag-outline', color: lpcRating.color,  value: avgLPC.toFixed(2),  label: 'LPC'        },
          ].map(s => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: c.background, borderRadius: 10,
              padding: 10, alignItems: 'center', gap: 5,
            }}>
              <Ionicons name={s.icon as any} size={15} color={s.color} />
              <AppText style={{ ...T.valueS, color: c.textPrimary, textAlign: 'center' }}>{s.value}</AppText>
              <AppText style={{ ...T.micro, color: c.textSecondary, textAlign: 'center' }}>{s.label}</AppText>
            </View>
          ))}
        </View>
      </View>

      {/* LPC insight pill */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: lpcRating.color + '0E',
        borderWidth: 1, borderColor: lpcRating.color + '22',
        borderRadius: 12, padding: 12,
      }}>
        <View style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: lpcRating.color + '1A',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Ionicons
            name={lpcRating.label === 'Good' ? 'trending-up' : lpcRating.label === 'Average' ? 'remove-outline' : 'trending-down'}
            size={15} color={lpcRating.color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ ...T.bodyM, color: c.textPrimary }}>
            Lines Per Call: {avgLPC.toFixed(2)} — <AppText style={{ color: lpcRating.color, fontWeight: '700' }}>{lpcRating.label}</AppText>
          </AppText>
          <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
            {fmt(mtdValue)} across {mtdCount} {mtdCount === 1 ? 'order' : 'orders'} this month
          </AppText>
        </View>
      </View>
    </View>
  );
};

// ── Sales Tab (category matrix) ────────────────────────────────────────────────
const SalesTab = ({ colors: c, customerId, van }: any) => {
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    saleService.getCategoryWiseSales({ outletId: customerId, vanId: van?.vanId })
      .then(r => { if (r.statusCode === 200 && r.data) setCategorySales(r.data); })
      .catch(e => console.error('Category sales error:', e))
      .finally(() => setLoading(false));
  }, [van?.vanId, customerId]);

  const categories = [...new Set(categorySales.map(i => i.categoryName))];
  const months     = [...new Map(categorySales.map(i => [i.month, { short: i.month, key: `${i.year}-${i.monthNumber}` }])).values()];
  const getCellData = (cat: string, month: string) => categorySales.find(i => i.categoryName === cat && i.month === month);
  const getValue   = (cat: string, month: string) => getCellData(cat, month)?.totalQtyInCases || 0;

  const loadCellDetail = async (cell: any, categoryName: string, month: string) => {
    const nextCell = { ...cell, month, categoryName, products: [] };
    setSelectedCell(nextCell);
    setDetailLoading(true);

    try {
      const response = await saleService.getCategoryWiseSalesDetail({
        outletId: customerId,
        vanId: van?.vanId,
        categoryName,
        year: cell.year,
        monthNumber: cell.monthNumber,
      });

      if (response?.statusCode === 200 && response.data) {
        setSelectedCell((current: any) => {
          const sameCell =
            current?.categoryName === categoryName &&
            current?.year === cell.year &&
            current?.monthNumber === cell.monthNumber;

          return sameCell ? { ...current, ...response.data, month } : current;
        });
      }
    } catch (error) {
      console.error('Category sales detail error:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading && categorySales.length === 0) return <DetailListSkeleton rows={4} />;

  if (!loading && categorySales.length === 0) return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
      <Ionicons name="receipt-outline" size={48} color={c.textTertiary} />
      <AppText style={{ ...T.title, color: c.textPrimary }}>No Sales Data</AppText>
      <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>No category sales found for this customer</AppText>
    </View>
  );

  return (
    <View style={{ backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* Header */}
          <View style={{ flexDirection: 'row', backgroundColor: c.background, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <View style={{ width: 120, padding: 10 }}>
              <AppText style={{ ...T.section, color: c.textSecondary }}>CATEGORY</AppText>
            </View>
            {months.map(m => (
              <View key={m.key} style={{ width: 70, padding: 10, borderLeftWidth: 1, borderLeftColor: c.border, alignItems: 'center' }}>
                <AppText style={{ ...T.section, color: c.textSecondary }}>{m.short.toUpperCase()}</AppText>
              </View>
            ))}
            <View style={{ width: 80, padding: 10, borderLeftWidth: 1, borderLeftColor: c.border, alignItems: 'center', backgroundColor: c.background }}>
              <AppText style={{ ...T.section, color: c.textSecondary }}>TOTAL</AppText>
            </View>
          </View>

          {/* Rows — alternating background */}
          {categories.map((cat, catIdx) => {
            const total = months.reduce((s, m) => s + getValue(cat, m.short), 0);
            const isEven = catIdx % 2 === 0;
            return (
              <View key={cat} style={{
                flexDirection: 'row',
                backgroundColor: isEven ? c.surface : c.background,
                borderBottomWidth: catIdx < categories.length - 1 ? 1 : 0,
                borderBottomColor: c.border,
              }}>
                <View style={{ width: 120, padding: 12, justifyContent: 'center' }}>
                  <AppText style={{ ...T.bodyM, color: c.textPrimary }} numberOfLines={2}>{cat}</AppText>
                  <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>Cases</AppText>
                </View>
                {months.map(m => {
                  const cell = getCellData(cat, m.short);
                  const val = Number(cell?.totalQtyInCases || 0);
                  return (
                    <TouchableOpacity
                      key={m.key}
                      activeOpacity={val > 0 ? 0.7 : 1}
                      onPress={() => {
                        if (val > 0) void loadCellDetail(cell, cat, m.short);
                      }}
                      style={{
                        width: 70, borderLeftWidth: 1, borderLeftColor: c.border,
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <AppText style={{
                        fontSize: 13, textAlign: 'center',
                        fontWeight: val > 0 ? '700' : '400',
                        color: val > 0 ? c.success : c.textSecondary,
                      }}>{val}</AppText>
                    </TouchableOpacity>
                  );
                })}
                <View style={{
                  width: 80, borderLeftWidth: 1, borderLeftColor: c.border,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: c.background,
                }}>
                  <AppText style={{ ...T.valueS, color: c.textPrimary }}>{total}</AppText>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomSheet
        visible={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        title={selectedCell?.categoryName || 'Sales Summary'}
        subtitle={selectedCell ? `${selectedCell.month} ${selectedCell.year || ''}` : ''}
        colors={c}
      >
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
          {[
            { label: 'Cases', value: Number(selectedCell?.totalQtyInCases || 0).toFixed(3), icon: 'cube-outline', color: c.success },
            { label: 'Value', value: fmt(Number(selectedCell?.totalValue || 0)), icon: 'cash-outline', color: c.primary },
            { label: 'Weight', value: Number(selectedCell?.totalWeight || 0).toFixed(2), icon: 'scale-outline', color: c.warning },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: s.color + '10', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: s.color + '24' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Ionicons name={s.icon as any} size={12} color={s.color} />
                <AppText style={{ ...T.micro, color: c.textSecondary }}>{s.label}</AppText>
              </View>
              <AppText numberOfLines={1} style={{ ...T.valueS, color: c.textPrimary }}>{s.value}</AppText>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: c.border }} />

        <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          {detailLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <ActivityIndicator size="small" color={c.primary} />
              <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 10 }}>Loading products...</AppText>
            </View>
          ) : (selectedCell?.products || []).length ? selectedCell.products.map((product: any, index: number) => (
            <View key={`${product.productId || product.productName || 'product'}-${index}`} style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: index % 2 === 0 ? c.surface : c.background,
            }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.success + '12', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cube-outline" size={17} color={c.success} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText numberOfLines={2} style={{ ...T.bodyM, color: c.textPrimary, lineHeight: 18 }}>
                  {product.productName || 'Product'}
                </AppText>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                  <View style={{ backgroundColor: c.success + '12', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7 }}>
                    <AppText style={{ ...T.micro, color: c.success }}>{Number(product.cases || 0).toFixed(1)} C</AppText>
                  </View>
                  <View style={{ backgroundColor: c.info + '12', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7 }}>
                    <AppText style={{ ...T.micro, color: c.info }}>{Number(product.pieces || 0)} P</AppText>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', maxWidth: 112 }}>
                <AppText numberOfLines={1} style={{ ...T.valueS, color: c.primary }}>{fmt(Number(product.value || 0))}</AppText>
                <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>{Number(product.weight || 0).toFixed(2)} wt</AppText>
              </View>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Ionicons name="cube-outline" size={36} color={c.textTertiary} />
              <AppText style={{ ...T.bodyM, color: c.textPrimary, marginTop: 10 }}>No products</AppText>
              <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}>No product sales found for this month</AppText>
            </View>
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

// ── Invoices Tab ───────────────────────────────────────────────────────────────
const InvoicesTab = ({ invoices, loading, total, colors: c }: any) => {
  const [selectedInvoice, setSelectedInvoice] = useState<SaleItem | null>(null);

  const paymentConfig = (status: string) => ({
    PAID:    { color: c.success, icon: 'checkmark-circle-outline' as const },
    PARTIAL: { color: c.warning, icon: 'time-outline' as const },
    OVERDUE: { color: c.error,   icon: 'alert-circle-outline' as const },
    UNPAID:  { color: c.textSecondary, icon: 'ellipse-outline' as const },
  }[status?.toUpperCase()] ?? { color: c.textSecondary, icon: 'ellipse-outline' as const });

  if (loading && invoices.length === 0) return <DetailListSkeleton rows={3} />;

  if (!loading && invoices.length === 0) return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
      <Ionicons name="document-text-outline" size={48} color={c.textTertiary} />
      <AppText style={{ ...T.title, color: c.textPrimary }}>No Invoices</AppText>
      <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>No invoices found for this customer</AppText>
    </View>
  );

  return (
    <View style={{ gap: 10 }}>
      {invoices.length > 0 && (
        <View style={{ marginBottom: 4 }}>
          <AppText style={{ ...T.title, color: c.textPrimary }}>
            Last {Math.min(invoices.length, PAGE_SIZE)} {invoices.length === 1 ? 'Invoice' : 'Invoices'}
          </AppText>
          {total > PAGE_SIZE && <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>Showing last {PAGE_SIZE} of {total}</AppText>}
        </View>
      )}

      {invoices.map((inv: SaleItem) => {
        const cfg = paymentConfig(inv.paymentStatus);
        return (
          <TouchableOpacity
            key={inv.saleId} activeOpacity={0.78}
            onPress={() => setSelectedInvoice(inv)}
            style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}
          >
            {/* Status strip at top */}
            <View style={{ height: 3, backgroundColor: cfg.color }} />
            <View style={{ padding: 14 }}>
              {/* Date + amount */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <AppText style={{ ...T.label, color: c.textSecondary }}>{fmtDate(inv.date)}</AppText>
                  <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary, marginTop: 3, maxWidth: 180 }}>{inv.saleId || 'N/A'}</AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText style={{ ...T.value, color: c.primary }}>{fmt(inv.totalValue || 0)}</AppText>
                  <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>invoice total</AppText>
                </View>
              </View>

              {/* Pills */}
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
                {[
                  { label: 'Type',   value: inv.type || 'N/A' },
                  { label: 'Cases',  value: String(inv.totalCases  || 0) },
                  { label: 'Pieces', value: String(inv.totalPieces || 0) },
                  {
                    label: 'Paid',
                    value: inv.paymentStatus || 'N/A',
                    color: cfg.color,
                    icon: cfg.icon,
                  },
                ].map(d => (
                  <View key={d.label} style={{ flex: 1, backgroundColor: c.background, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 }}>
                    <AppText style={{ ...T.micro, color: c.textSecondary, marginBottom: 3 }}>{d.label}</AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {'icon' in d && d.icon ? <Ionicons name={d.icon as any} size={11} color={d.color as string} /> : null}
                      <AppText numberOfLines={1} style={{ ...T.bodyM, color: ('color' in d && d.color ? d.color : c.textPrimary) as string }}>{d.value}</AppText>
                    </View>
                  </View>
                ))}
              </View>

              {/* Pending */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                {inv.pendingAmount > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="alert-circle-outline" size={12} color={c.warning} />
                    <AppText style={{ ...T.label, color: c.warning }}>Pending {fmt(inv.pendingAmount)}</AppText>
                  </View>
                )}
                {!(inv.pendingAmount > 0) && <View />}
                <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Invoice detail bottom sheet */}
      <BottomSheet
        visible={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Product Details"
        subtitle={selectedInvoice?.saleId || 'Invoice'}
        colors={c}
      >
        {/* Summary row */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
          {[
            { label: 'Cases',  value: String(selectedInvoice?.totalCases  || 0), icon: 'cube-outline', color: c.info || c.primary },
            { label: 'Pieces', value: String(selectedInvoice?.totalPieces || 0), icon: 'layers-outline', color: c.warning },
            { label: 'Amount', value: fmt(selectedInvoice?.totalValue     || 0), icon: 'cash-outline', color: c.success },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: s.color + '10', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: s.color + '24' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Ionicons name={s.icon as any} size={12} color={s.color} />
                <AppText style={{ ...T.micro, color: c.textSecondary }}>{s.label}</AppText>
              </View>
              <AppText numberOfLines={1} style={{ ...T.valueS, color: c.textPrimary }}>{s.value}</AppText>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: c.border }} />

        <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {selectedInvoice?.items?.length ? selectedInvoice.items.map((item, i) => (
            <View key={`${item.productId || item.productName}-${i}`} style={{
              flexDirection: 'row', alignItems: 'center',
              marginTop: 10, padding: 12, gap: 10,
              borderRadius: 12, borderWidth: 1, borderColor: c.border,
              backgroundColor: i % 2 === 0 ? c.surface : c.background,
            }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.primary + '12', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cube-outline" size={17} color={c.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <AppText numberOfLines={2} style={{ ...T.bodyM, color: c.textPrimary, lineHeight: 18 }}>{item.productName || 'Product'}</AppText>
                <AppText numberOfLines={1} style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>{item.productCategory || item.category || 'Uncategorized'}</AppText>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: c.success + '12', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7 }}>
                    <Ionicons name="albums-outline" size={10} color={c.success} />
                    <AppText style={{ ...T.micro, color: c.success }}>{getItemCases(item)} C</AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: c.info + '12', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7 }}>
                    <Ionicons name="layers-outline" size={10} color={c.info} />
                    <AppText style={{ ...T.micro, color: c.info }}>{getItemPieces(item)} P</AppText>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', flexShrink: 0, maxWidth: 110 }}>
                <AppText numberOfLines={1} style={{ ...T.valueS, color: c.primary }}>{fmt(getItemTotal(item))}</AppText>
                <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>line total</AppText>
              </View>
            </View>
          )) : (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Ionicons name="cube-outline" size={36} color={c.textTertiary} />
              <AppText style={{ ...T.bodyM, color: c.textPrimary, marginTop: 10 }}>No product details</AppText>
              <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}>Product line items are not available for this invoice</AppText>
            </View>
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

// ── Visits Tab ────────────────────────────────────────────────────────────────
const VisitsTab = ({ visits, loading, total, colors: c }: any) => {
  const [selectedVisit, setSelectedVisit] = useState<VisitHistory | null>(null);

  const statusConfig = (status: string) => ({
    COMPLETED: { color: c.success, label: 'Completed' },
    ACTIVE:    { color: c.primary, label: 'Active' },
  }[status?.toUpperCase()] ?? { color: c.warning, label: status });

  if (loading && visits.length === 0) return <DetailListSkeleton rows={3} />;

  if (!loading && visits.length === 0) return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
      <Ionicons name="time-outline" size={48} color={c.textTertiary} />
      <AppText style={{ ...T.title, color: c.textPrimary }}>No visits yet</AppText>
      <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>No visit history found for this customer</AppText>
    </View>
  );

  return (
    <View style={{ gap: 10 }}>
      {visits.length > 0 && (
        <View style={{ marginBottom: 4 }}>
          <AppText style={{ ...T.title, color: c.textPrimary }}>Last {Math.min(visits.length, 10)} Visits</AppText>
          {total > 10 && <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>Showing last 10 of {total}</AppText>}
        </View>
      )}

      {visits.map((item: VisitHistory) => {
        const cfg        = statusConfig(item.status);
        const duration   = getDuration(item.checkInTime, item.checkOutTime);
        const orderCount = Number(item.orderCount || 0);
        const hasOrder   = orderCount > 0;
        const orderValue = Number(item.orderValue || 0);
        const orderCases = Number(item.orderCases || 0);
        const orderWeight = Number(item.orderWeight || 0);

        return (
          <TouchableOpacity
            key={item.visitId} activeOpacity={0.78}
            onPress={() => setSelectedVisit(item)}
            style={{
              backgroundColor: c.surface, borderRadius: 14,
              borderWidth: 1, borderColor: c.border,
              overflow: 'hidden',
              // Left strip = status colour
              borderLeftWidth: 3, borderLeftColor: cfg.color,
            }}
          >
            <View style={{ padding: 14 }}>
              {/* Top row */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View>
                  <AppText style={{ ...T.bodyM, color: c.textPrimary }}>{fmtDate(item.checkInTime)}</AppText>
                  <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
                    {fmtTime(item.checkInTime)}{item.checkOutTime ? ` – ${fmtTime(item.checkOutTime)}` : ''}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <View style={{ backgroundColor: cfg.color + '14', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                    <AppText style={{ ...T.micro, color: cfg.color }}>{cfg.label}</AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time-outline" size={11} color={c.textSecondary} />
                    <AppText style={{ ...T.micro, color: c.textSecondary, fontWeight: '500' }}>{duration}</AppText>
                  </View>
                </View>
              </View>

              {/* Outcome summary */}
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  backgroundColor: hasOrder ? c.success + '12' : c.background,
                  paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
                  borderWidth: 1, borderColor: hasOrder ? c.success + '22' : c.border,
                }}>
                  <Ionicons name={hasOrder ? 'cart' : 'cart-outline'} size={11} color={hasOrder ? c.success : c.textSecondary} />
                  <AppText style={{ ...T.micro, color: hasOrder ? c.success : c.textSecondary }}>
                    {hasOrder ? 'Order' : 'No order'}
                  </AppText>
                </View>
              </View>

              {hasOrder && (
                <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
                  <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }}>
                    <AppText style={{ ...T.micro, color: c.textSecondary }}>Value</AppText>
                    <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>{fmt(orderValue)}</AppText>
                  </View>
                  <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }}>
                    <AppText style={{ ...T.micro, color: c.textSecondary }}>Cases</AppText>
                    <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>{orderCases.toFixed(1)}</AppText>
                  </View>
                  <View style={{ flex: 1, backgroundColor: c.background, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 }}>
                    <AppText style={{ ...T.micro, color: c.textSecondary }}>Weight</AppText>
                    <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>{orderWeight.toFixed(2)}</AppText>
                  </View>
                </View>
              )}

              {/* Note */}
              {item.note && (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border }}>
                  <Ionicons name="chatbubble-outline" size={12} color={c.textSecondary} style={{ marginTop: 1 }} />
                  <AppText style={{ ...T.label, color: c.textSecondary, flex: 1, lineHeight: 17 }}>{item.note}</AppText>
                </View>
              )}

              {/* Tap affordance */}
              <View style={{ position: 'absolute', right: 12, bottom: 12 }}>
                <Ionicons name="chevron-forward" size={13} color={c.textSecondary} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Visit timeline bottom sheet */}
      <BottomSheet
        visible={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        title={`${Number(selectedVisit?.orderCount || 0) > 0 ? 'Order' : 'No Order'} Visit`}
        subtitle={`${fmtDate(selectedVisit?.checkInTime)} · ${selectedVisit?.outletName || ''}`}
        colors={c}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}>
          {selectedVisit && (() => {
            const items = [
              { title: 'Visit Started', sub: `Type: ${selectedVisit.visitType || 'N/A'}`, time: fmtTime(selectedVisit.checkInTime), icon: 'log-in-outline', color: c.primary },
              Number(selectedVisit.orderCount || 0) > 0
                ? { title: 'Order Placed', sub: `${fmt(Number(selectedVisit.orderValue || 0))} value, ${Number(selectedVisit.orderCases || 0).toFixed(1)} cases`, time: fmtTime(selectedVisit.checkInTime), icon: 'cart-outline', color: c.success }
                : { title: 'No Order', sub: selectedVisit.note || 'Visit without an order', time: fmtTime(selectedVisit.checkInTime), icon: 'remove-circle-outline', color: c.warning },
              { title: selectedVisit.checkOutTime ? 'Visit Ended' : 'In Progress', sub: `Duration: ${getDuration(selectedVisit.checkInTime, selectedVisit.checkOutTime)}`, time: fmtTime(selectedVisit.checkOutTime), icon: selectedVisit.checkOutTime ? 'log-out-outline' : 'hourglass-outline', color: selectedVisit.checkOutTime ? c.textSecondary : c.primary },
            ];
            return items.map((tl, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ alignItems: 'center', width: 32 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: (tl.color as string) + '18', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={tl.icon as any} size={15} color={tl.color as string} />
                  </View>
                  {idx < items.length - 1 && <View style={{ width: 1, flex: 1, minHeight: 24, backgroundColor: c.border, marginTop: 4 }} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText style={{ ...T.bodyM, color: c.textPrimary }}>{tl.title}</AppText>
                    <AppText style={{ ...T.label, color: c.textSecondary }}>{tl.time}</AppText>
                  </View>
                  <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 3, lineHeight: 17 }}>{tl.sub}</AppText>
                </View>
              </View>
            ));
          })()}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};
