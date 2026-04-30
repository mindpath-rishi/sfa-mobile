// // app/customers/[id].tsx

// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   ScrollView,
//   TouchableOpacity,
//   Linking,
//   Alert,
//   Share,
//   RefreshControl,
//   ActivityIndicator,
//   Platform,
//   FlatList,
//   Modal,
//   TextInput,
//   NativeScrollEvent,
//   NativeSyntheticEvent,
//   BackHandler,
//   AppState,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { AppText } from '@/core/components';

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
// }

// interface VisitHistory {
//   visitId: string;
//   outletId: string;
//   checkInTime: string;
//   checkOutTime?: string;
//   status: string;
//   note?: string;
// }

// type TabType = 'summary' | 'sales' | 'visits';

// const TABS: { key: TabType; label: string; icon: string }[] = [
//   { key: 'summary', label: 'Summary', icon: 'stats-chart-outline' },
//   { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
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

//   // Summary stats
//   const [summaryStats, setSummaryStats] = useState({
//     mySales: {
//       mtdOrderValue: 0,
//       mtdOrderQty: 0,
//       avgOrderValue: 0,
//       avgOrderQty: 0,
//       lpc: 0,
//     },
//     outletSales: {
//       mtdOrderValue: 0,
//       mtdOrderQty: 0,
//       avgOrderValue: 0,
//       avgOrderQty: 0,
//       lpc: 0,
//     },
//   });

//   // Visit history states
//   const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
//   const [visitsLoading, setVisitsLoading] = useState(false);
//   const [visitsTotal, setVisitsTotal] = useState(0);

//   // Refs
//   const locationInterval = useRef<NodeJS.Timeout | null>(null);
//   const appStateListener = useRef<any>(null);
//   const autoStartTimeout = useRef<NodeJS.Timeout | null>(null);

//   const route = useRouteStore((s) => s.selectedRoute);
//   const van = useRouteStore((s) => s.van);
//   const user = useAuthStore((s) => s.user);
//   const activeVisit = useOutletStore((s) => s.activeVisit);
//   const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
//   const { setSelectedOutlet } = useOutletStore();
//   const { setHeader } = useHeader();

//   // Load customer data
//   useEffect(() => {
//     loadCustomerData();
//   }, [id]);

//   useFocusEffect(
//     useCallback(() => {
//       if (customer) {
//         loadSalesHistory();
//         loadVisitHistory();
//         loadSummaryStats();
//       }
//     }, [customer]),
//   );

//   useEffect(() => {
//     setHeader({
//       title: route?.routeName || customer?.name || 'Outlet Details',
//       showBack: true,
//       showMenu: false,
//       backgroundColor: colors.primary,
//     });
//   }, [setHeader]);

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

//   // Auto-start visit when inside geofence - NO MANUAL OPTION
//   useEffect(() => {
//     console.log('Auto-start check:', {
//       isInsideGeofenceArea,
//       hasActiveVisit: !!activeVisit,
//       hasCustomer: !!customer,
//       autoStartAttempted,
//       isAutoStarting,
//       activeVisitCustomerId: activeVisit?.customerId,
//       currentCustomerId: customer?.customerId,
//     });

//     // Check if we should auto-start
//     const shouldAutoStart =
//       isInsideGeofenceArea && !activeVisit && customer && !autoStartAttempted && !isAutoStarting;

//     if (shouldAutoStart) {
//       console.log('Conditions met for auto-start, calling autoStartVisit');
//       autoStartVisit();
//     }
//   }, [isInsideGeofenceArea, activeVisit, autoStartAttempted, customer, isAutoStarting]);

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

//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//       router.replace(`/beats`);
//       return true;
//     });

//     return () => backHandler.remove();
//   }, []);

//   // Location tracking functions
//   const getCurrentLocation = useCallback(() => {
//     if (Platform.OS === 'web' && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           console.log(`Got location: ${latitude}, ${longitude}`);
//           setCurrentLocation({ latitude, longitude });
//           checkGeofenceStatus(latitude, longitude);
//         },
//         (error) => {
//           console.log('Error getting location:', error);
//         },
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
//       );
//     }
//   }, []);

//   const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
//     const currentCustomer = customerRef.current;

//     console.log(`Checking geofence: lat=${lat}, lng=${lng}`);
//     console.log(`Customer geotag:`, currentCustomer?.geoTag);

//     if (!currentCustomer?.geoTag?.lat || !currentCustomer?.geoTag?.lng) {
//       console.log('Customer has no geotag');
//       return;
//     }

//     // Calculate distance using getDistance
//     const distance = getDistance(lat, lng, currentCustomer.geoTag.lat, currentCustomer.geoTag.lng);

//     console.log(`Distance to outlet: ${distance} meters`);

//     setDistanceToOutlet(distance);

//     // Using isInsideGeofence with correct signature
//     const geofence = {
//       id: currentCustomer.customerId,
//       latitude: currentCustomer.geoTag.lat,
//       longitude: currentCustomer.geoTag.lng,
//       radius: GEOFENCE_RADIUS,
//     };

//     const inside = isInsideGeofence(lat, lng, geofence);

//     console.log(`Inside geofence: ${inside} (radius: ${GEOFENCE_RADIUS}m)`);

//     setIsInsideGeofenceArea(inside);
//   }, []);

//   const startLocationTracking = useCallback(() => {
//     if (locationInterval.current) {
//       clearInterval(locationInterval.current);
//     }

//     // Run immediately
//     getCurrentLocation();

//     // Then every 3 seconds for quicker response
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

//   // Auto-start visit - automatically starts when inside geofence
//   const autoStartVisit = useCallback(async () => {
//     if (!customer || activeVisit || autoStartAttempted || isAutoStarting) {
//       console.log('Auto-start prevented:', {
//         hasCustomer: !!customer,
//         hasActiveVisit: !!activeVisit,
//         autoStartAttempted,
//         isAutoStarting,
//       });
//       return;
//     }

//     console.log('Attempting to auto-start visit for customer:', customer.customerId);
//     setIsAutoStarting(true);
//     setAutoStartAttempted(true);

//     // Clear any existing timeout
//     if (autoStartTimeout.current) {
//       clearTimeout(autoStartTimeout.current);
//     }

//     // Add a small delay to ensure location is stable
//     autoStartTimeout.current = setTimeout(async () => {
//       try {
//         const payload: any = {
//           routeSessionId: route?.routeSessionId,
//           workSessionId: route?.workSessionId,
//           vanId: route?.vanId,
//           outletId: customer.customerId,
//         };

//         console.log('Auto-start payload:', payload);

//         const response = await outletService.startVisit(payload);

//         if (response.success && response?.data) {
//           const visit = response.data;
//           console.log('Auto-start successful:', visit);

//           setActiveVisit({
//             visitId: visit.visitId,
//             outlet: customer as any,
//             checkInTime: new Date(visit.checkInTime),
//             checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
//             status: visit.status,
//             routeSessionId: visit?.routeSessionId,
//             customerId: visit?.customerId,
//           });

//           // Show success message with option to proceed to sale
//           Alert.alert(
//             'Visit Started ✓',
//             `You have been automatically checked in at ${customer.name}`,
//             [
//               {
//                 text: 'Proceed to Sale',
//                 onPress: () => router.push(`/checkin/sale`),
//               },
//               { text: 'Later', style: 'cancel' },
//             ],
//           );
//         } else {
//           console.error('Auto-start failed: Invalid response', response);
//           setAutoStartAttempted(false);
//           setIsAutoStarting(false);
//         }
//       } catch (error) {
//         console.error('Auto-start visit failed:', error);
//         setAutoStartAttempted(false);
//         setIsAutoStarting(false);
//       }
//     }, 1000);
//   }, [customer, activeVisit, autoStartAttempted, isAutoStarting, route, setActiveVisit]);

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

//   const loadSummaryStats = async () => {
//     if (!customer?.customerId) return;

//     try {
//       // Uncomment when API is ready
//       // const params = {
//       //   customerId: customer.customerId,
//       //   vanId: van?.vanId,
//       //   employeeId: user?.userId,
//       // };
//       // const response = await saleService.getCustomerSummaryStats(params);
//       // if (response?.data) {
//       //   setSummaryStats(response.data);
//       // }
//     } catch (error) {
//       console.error('Failed to load summary stats:', error);
//     }
//   };

//   const loadSalesHistory = async () => {
//     if (!customer?.customerId) return;

//     setSalesLoading(true);
//     try {
//       const params: any = {
//         page: 1,
//         limit: 10,
//         customerId: customer.customerId,
//         vanId: van?.vanId,
//         employeeId: user?.userId,
//       };
//       const response: any = await saleService.fetchSales(params);

//       const salesData = response?.data || [];
//       setSales(salesData);
//       setSalesTotal(response?.total || 0);
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
//         customerId: customer.customerId,
//         limit: 10,
//         page: 1,
//       });

//       const visits = response?.data || [];
//       setVisitHistory(visits);
//       setVisitsTotal(response?.total || 0);
//     } catch (error) {
//       console.error('Failed to load visit history:', error);
//     } finally {
//       setVisitsLoading(false);
//     }
//   };

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadCustomerData();
//     await loadSalesHistory();
//     await loadVisitHistory();
//     await loadSummaryStats();
//     setRefreshing(false);
//   }, [customer]);

//   const handleProceedToSale = useCallback(() => {
//     if (customer) {
//       router.push(`/checkin`); // Navigate to sale screen without customerId param
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

//   if (isLoading) return <LoadingState styles={styles} colors={colors} />;
//   if (!customer) return <EmptyState styles={styles} colors={colors} />;

//   const lastOrderDate = sales.length > 0 ? sales[0]?.date : customer.lastOrderDate;
//   const lastVisitDate = customer.lastVisitedAt;

//   // Check if current active visit is for this customer
//   const hasActiveVisit = activeVisit && activeVisit?.outlet?.customerId === customer.customerId;

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <CustomerHeader customer={customer} styles={styles} colors={colors} compact={isTabScrolled} />

//       {/* Last Visit and Last Order - Outside the card */}
//       <View style={styles.lastInfoContainer}>
//         <View style={styles.lastInfoCard}>
//           <View style={styles.lastInfoItem}>
//             <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
//             <AppText style={styles.lastInfoLabel}>Last Visit:</AppText>
//             <AppText style={styles.lastInfoValue}>
//               {lastVisitDate ? moment(lastVisitDate).format('DD MMM YYYY') : 'Never'}
//             </AppText>
//           </View>
//           <View style={styles.lastInfoDivider} />
//           <View style={styles.lastInfoItem}>
//             <Ionicons name="cart-outline" size={16} color={colors.textSecondary} />
//             <AppText style={styles.lastInfoLabel}>Last Order:</AppText>
//             <AppText style={styles.lastInfoValue}>
//               {lastOrderDate ? moment(lastOrderDate).format('DD MMM YYYY') : 'Never'}
//             </AppText>
//           </View>
//         </View>
//       </View>

//       {/* Show geofence status for debugging - optional, remove in production */}
//       {__DEV__ && distanceToOutlet !== null && (
//         <View
//           style={{
//             backgroundColor: isInsideGeofenceArea ? '#4CAF50' : '#FF9800',
//             padding: 4,
//             alignItems: 'center',
//             marginHorizontal: 16,
//             marginBottom: 8,
//             borderRadius: 8,
//           }}
//         >
//           <AppText style={{ color: '#FFF', fontSize: 12 }}>
//             {isInsideGeofenceArea ? '✓ Inside geofence' : '○ Outside geofence'} - Distance:{' '}
//             {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
//             {isAutoStarting && ' - Auto-starting...'}
//           </AppText>
//         </View>
//       )}

//       <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />

//       <TabContent
//         activeTab={activeTab}
//         customer={customer}
//         summaryStats={summaryStats}
//         sales={sales}
//         salesLoading={salesLoading}
//         salesTotal={salesTotal}
//         visitHistory={visitHistory}
//         visitsLoading={visitsLoading}
//         visitsTotal={visitsTotal}
//         styles={styles}
//         colors={colors}
//         refreshing={refreshing}
//         onRefresh={onRefresh}
//         onScroll={handleTabScroll}
//         formatCurrency={formatCurrency}
//       />

//       {/* Footer Button - Full width Proceed to Sale when visit is active */}
//       {hasActiveVisit && (
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
//                 {/* <AppText style={styles.fullWidthButtonSubtitle}>
//                   Create new order for {customer.name}
//                 </AppText> */}
//               </View>
//               <Ionicons name="arrow-forward-outline" size={20} color="#FFF" />
//             </View>
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       {/* Show auto-starting indicator when auto-start in progress */}
//       {!hasActiveVisit && isAutoStarting && (
//         <View style={styles.fullWidthButtonContainer}>
//           <View
//             style={[styles.fullWidthAutoStartIndicator, { backgroundColor: colors.primary + '10' }]}
//           >
//             <ActivityIndicator size="small" color={colors.primary} />
//             <AppText style={[styles.autoStartText, { color: colors.primary }]}>
//               Auto-starting visit...
//             </AppText>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// // Sub-components
// const LoadingState = ({ styles, colors }: any) => (
//   <View style={styles.loadingContainer}>
//     <ActivityIndicator size="large" color={colors.primary} />
//     <AppText style={styles.loadingText}>Loading customer details...</AppText>
//   </View>
// );

// const EmptyState = ({ styles, colors }: any) => (
//   <View style={styles.emptyState}>
//     <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
//     <AppText style={styles.emptyStateTitle}>Customer Not Found</AppText>
//     <AppText style={styles.emptyStateText}>The customer doesn't exist or was removed.</AppText>
//     <TouchableOpacity
//       onPress={() => router.back()}
//       style={styles.emptyStateButton}
//       activeOpacity={0.8}
//     >
//       <AppText style={styles.emptyStateButtonText}>Go Back</AppText>
//     </TouchableOpacity>
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
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
//   summaryStats,
//   sales,
//   salesLoading,
//   salesTotal,
//   visitHistory,
//   visitsLoading,
//   visitsTotal,
//   styles,
//   colors,
//   refreshing,
//   onRefresh,
//   onScroll,
//   formatCurrency,
// }: any) => (
//   <>
//     {activeTab === 'summary' && (
//       <ScrollView
//         style={styles.tabContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         onScroll={onScroll}
//         scrollEventThrottle={16}
//       >
//         <SummaryTab
//           customer={customer}
//           summaryStats={summaryStats}
//           styles={styles}
//           colors={colors}
//           formatCurrency={formatCurrency}
//         />
//       </ScrollView>
//     )}
//     {activeTab === 'sales' && (
//       <SalesTab
//         sales={sales}
//         loading={salesLoading}
//         total={salesTotal}
//         styles={styles}
//         colors={colors}
//         onScroll={onScroll}
//         refreshing={refreshing}
//         onRefresh={onRefresh}
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
//         onScroll={onScroll}
//         refreshing={refreshing}
//         onRefresh={onRefresh}
//       />
//     )}
//   </>
// );

// // app/customers/[id].tsx - Summary Tab Section Only (Replace the SummaryTab component)

// // Summary Tab - Improved UI/UX with consistent font sizes
// const SummaryTab = ({ customer, summaryStats, styles, colors, formatCurrency }: any) => (
//   <View style={styles.summaryContainer}>
//     {/* My Sales Section */}
//     {/* <View style={styles.salesSectionCard}>
//       <View style={styles.sectionHeader}>
//         <Ionicons name="person-circle-outline" size={22} color={colors.primary} />
//         <AppText style={styles.sectionTitle}>My Sales Performance</AppText>
//       </View>

//       <View style={styles.statsGrid}>
//         <View style={styles.statCard}>
//           <Ionicons name="trending-up-outline" size={24} color={colors.success} />
//           <AppText style={styles.statValue}>
//             {formatCurrency(summaryStats.mySales.mtdOrderValue)}
//           </AppText>
//           <AppText style={styles.statLabel}>MTD Order Value</AppText>
//           <View style={styles.statTrend}>
//             <Ionicons name="arrow-up-outline" size={12} color={colors.success} />
//             <AppText style={[styles.statTrendText, { color: colors.success }]}>
//               +12% vs last month
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.statCard}>
//           <Ionicons name="cube-outline" size={24} color={colors.info} />
//           <AppText style={styles.statValue}>{summaryStats.mySales.mtdOrderQty}</AppText>
//           <AppText style={styles.statLabel}>MTD Order Quantity</AppText>
//           <View style={styles.statTrend}>
//             <Ionicons name="arrow-up-outline" size={12} color={colors.success} />
//             <AppText style={[styles.statTrendText, { color: colors.success }]}>
//               +8% vs last month
//             </AppText>
//           </View>
//         </View>
//       </View>

//       <View style={styles.statsDivider} />
//       <AppText style={styles.statsSubtitle}>Last 5 Orders Average</AppText>

//       <View style={styles.statsGridSmall}>
//         <View style={styles.statCardSmall}>
//           <Ionicons name="cash-outline" size={20} color={colors.warning} />
//           <AppText style={styles.statValueSmall}>
//             {formatCurrency(summaryStats.mySales.avgOrderValue)}
//           </AppText>
//           <AppText style={styles.statLabelSmall}>Avg. Value</AppText>
//         </View>

//         <View style={styles.statCardSmall}>
//           <Ionicons name="layers-outline" size={20} color={colors.warning} />
//           <AppText style={styles.statValueSmall}>{summaryStats.mySales.avgOrderQty}</AppText>
//           <AppText style={styles.statLabelSmall}>Avg. Quantity</AppText>
//         </View>

//         <View style={styles.statCardSmall}>
//           <Ionicons name="pricetag-outline" size={20} color={colors.warning} />
//           <AppText style={styles.statValueSmall}>{summaryStats.mySales.lpc}</AppText>
//           <AppText style={styles.statLabelSmall}>LPC</AppText>
//         </View>
//       </View>
//     </View> */}

//     {/* Outlet Sales Section */}
//     <View style={styles.salesSectionCard}>
//       {/* <View style={styles.sectionHeader}>
//         <Ionicons name="storefront-outline" size={22} color={colors.primary} />
//         <AppText style={styles.sectionTitle}>Outlet Sales Performance</AppText>
//       </View> */}

//       {/* MTD Stats Row */}
//       <View style={styles.statsGrid}>
//         <View style={styles.statCard}>
//           <Ionicons name="bar-chart-outline" size={24} color={colors.success} />
//           <AppText style={styles.statValue}>
//             {formatCurrency(summaryStats.outletSales.mtdOrderValue)}
//           </AppText>
//           <AppText style={styles.statLabel}>MTD Order Value</AppText>
//           <View style={styles.statTrend}>
//             <Ionicons name="arrow-up-outline" size={12} color={colors.success} />
//             <AppText style={[styles.statTrendText, { color: colors.success }]}>
//               +15% vs last month
//             </AppText>
//           </View>
//         </View>

//         <View style={styles.statCard}>
//           <Ionicons name="cube-outline" size={24} color={colors.info} />
//           <AppText style={styles.statValue}>{summaryStats.outletSales.mtdOrderQty}</AppText>
//           <AppText style={styles.statLabel}>MTD Order Quantity</AppText>
//           <View style={styles.statTrend}>
//             <Ionicons name="arrow-up-outline" size={12} color={colors.success} />
//             <AppText style={[styles.statTrendText, { color: colors.success }]}>
//               +10% vs last month
//             </AppText>
//           </View>
//         </View>
//       </View>

//       {/* Last 5 Orders Stats */}
//       <View style={styles.statsDivider} />
//       <AppText style={styles.statsSubtitle}>Last 5 Orders Average</AppText>

//       <View style={styles.statsGridSmall}>
//         <View style={styles.statCardSmall}>
//           <Ionicons name="cash-outline" size={20} color={colors.warning} />
//           <AppText style={styles.statValueSmall}>
//             {formatCurrency(summaryStats.outletSales.avgOrderValue)}
//           </AppText>
//           <AppText style={styles.statLabelSmall}>Avg. Value</AppText>
//         </View>

//         <View style={styles.statCardSmall}>
//           <Ionicons name="layers-outline" size={20} color={colors.warning} />
//           <AppText style={styles.statValueSmall}>{summaryStats.outletSales.avgOrderQty}</AppText>
//           <AppText style={styles.statLabelSmall}>Avg. Quantity</AppText>
//         </View>

//         <View style={styles.statCardSmall}>
//           <Ionicons name="pricetag-outline" size={20} color={colors.warning} />
//           <AppText style={styles.statValueSmall}>{summaryStats.outletSales.lpc}</AppText>
//           <AppText style={styles.statLabelSmall}>LPC</AppText>
//         </View>
//       </View>
//     </View>

//     {/* Performance Insights Card */}
//     <View style={styles.insightsCard}>
//       <View style={styles.insightsHeader}>
//         <Ionicons name="bulb-outline" size={20} color={colors.primary} />
//         <AppText style={styles.insightsTitle}>Performance Insights</AppText>
//       </View>

//       <View style={styles.insightItem}>
//         <View style={styles.insightDot} />
//         <AppText style={styles.insightText}>
//           MTD sales increased by{' '}
//           {Math.round(
//             (summaryStats.mySales.mtdOrderValue / (summaryStats.mySales.mtdOrderValue * 0.88)) *
//               100,
//           )}
//           % compared to last month
//         </AppText>
//       </View>

//       <View style={styles.insightItem}>
//         <View style={styles.insightDot} />
//         <AppText style={styles.insightText}>
//           Average order value is {formatCurrency(summaryStats.mySales.avgOrderValue)} per
//           transaction
//         </AppText>
//       </View>

//       <View style={styles.insightItem}>
//         <View style={styles.insightDot} />
//         <AppText style={styles.insightText}>
//           {summaryStats.mySales.lpc > 10 ? 'Good' : 'Improving'} LPC ratio of{' '}
//           {summaryStats.mySales.lpc} liters per case
//         </AppText>
//       </View>
//     </View>
//   </View>
// );

// // Sales Tab
// const SalesTab = ({
//   sales,
//   loading,
//   total,
//   styles,
//   colors,
//   onScroll,
//   refreshing,
//   onRefresh,
//   formatCurrency,
// }: any) => {
//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     return moment(dateString).format('DD MMM YYYY');
//   };

//   const renderSaleCard = ({ item }: { item: SaleItem }) => (
//     <View style={styles.saleCard}>
//       <View style={styles.saleCardHeader}>
//         <View>
//           <AppText style={styles.saleId}>#{item.saleId?.slice(-8)}</AppText>
//           <AppText style={styles.saleDate}>{formatDate(item.date)}</AppText>
//         </View>
//         <AppText style={[styles.saleAmount, { color: colors.primary }]}>
//           {formatCurrency(item.totalValue)}
//         </AppText>
//       </View>

//       <View style={styles.saleCardBody}>
//         <View style={styles.saleStat}>
//           <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
//           <AppText style={styles.saleStatText}>{item.totalCases} Cases</AppText>
//         </View>
//         <View style={styles.saleStat}>
//           <Ionicons name="albums-outline" size={14} color={colors.textSecondary} />
//           <AppText style={styles.saleStatText}>{item.totalPieces || 0} PCS</AppText>
//         </View>
//       </View>
//     </View>
//   );

//   if (loading && sales.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <AppText style={styles.loadingText}>Loading sales...</AppText>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={sales}
//       keyExtractor={(item) => item.saleId}
//       renderItem={renderSaleCard}
//       contentContainerStyle={styles.tabContentContainer}
//       style={styles.tabContent}
//       onScroll={onScroll}
//       scrollEventThrottle={16}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       ListHeaderComponent={
//         sales.length > 0 && (
//           <View style={styles.listHeader}>
//             <AppText style={styles.listHeaderTitle}>
//               Last {Math.min(sales.length, 10)} Sales
//             </AppText>
//             {total > 10 && (
//               <AppText style={styles.listHeaderSubtitle}>Showing last 10 of {total} total</AppText>
//             )}
//           </View>
//         )
//       }
//       ListEmptyComponent={
//         !loading && (
//           <View style={styles.emptyTabContainer}>
//             <Ionicons name="receipt-outline" size={56} color={colors.textTertiary} />
//             <AppText style={styles.emptyTabTitle}>No Sales</AppText>
//             <AppText style={styles.emptyTabText}>No sales found for this customer</AppText>
//           </View>
//         )
//       }
//       showsVerticalScrollIndicator={false}
//     />
//   );
// };

// // Visits Tab
// const VisitsTab = ({
//   visits,
//   loading,
//   total,
//   styles,
//   colors,
//   onScroll,
//   refreshing,
//   onRefresh,
// }: any) => {
//   const formatDate = (dateString: string) => {
//     if (!dateString) return 'N/A';
//     return moment(dateString).format('DD MMM YYYY, hh:mm A');
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
//     switch (status) {
//       case 'COMPLETED':
//         return colors.success;
//       case 'ACTIVE':
//         return colors.primary;
//       default:
//         return colors.warning;
//     }
//   };

//   const renderVisitCard = ({ item }: { item: VisitHistory }) => (
//     <View style={styles.visitCard}>
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
//       {item.note && (
//         <View style={styles.visitNote}>
//           <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
//           <AppText style={styles.visitNoteText}>{item.note}</AppText>
//         </View>
//       )}
//     </View>
//   );

//   if (loading && visits.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <AppText style={styles.loadingText}>Loading visits...</AppText>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={visits}
//       keyExtractor={(item) => item.visitId}
//       renderItem={renderVisitCard}
//       contentContainerStyle={styles.tabContentContainer}
//       style={styles.tabContent}
//       onScroll={onScroll}
//       scrollEventThrottle={16}
//       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       ListHeaderComponent={
//         visits.length > 0 && (
//           <View style={styles.listHeader}>
//             <AppText style={styles.listHeaderTitle}>
//               Last {Math.min(visits.length, 10)} Visits
//             </AppText>
//             {total > 10 && (
//               <AppText style={styles.listHeaderSubtitle}>Showing last 10 of {total} total</AppText>
//             )}
//           </View>
//         )
//       }
//       ListEmptyComponent={
//         !loading && (
//           <View style={styles.emptyTabContainer}>
//             <Ionicons name="time-outline" size={56} color={colors.textTertiary} />
//             <AppText style={styles.emptyTabTitle}>No Visits</AppText>
//             <AppText style={styles.emptyTabText}>No visit history found for this customer</AppText>
//           </View>
//         )
//       }
//       showsVerticalScrollIndicator={false}
//     />
//   );
// };

// app/customers/[id].tsx - Complete updated file

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

  const route = useRouteStore((s) => s.selectedRoute);
  const van = useRouteStore((s) => s.van);
  const user = useAuthStore((s) => s.user);
  const activeVisit = useOutletStore((s) => s.activeVisit);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const { setSelectedOutlet } = useOutletStore();
  const { setHeader } = useHeader();
  const selectedRoute = useRouteStore((s) => s.selectedRoute);

  // Load customer data
  useEffect(() => {
    loadCustomerData();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (customer) {
        visitStatus();
        loadSalesHistory();
        loadVisitHistory();
      }
    }, [customer]),
  );

  useEffect(() => {
    setHeader({
      title: route?.routeName || customer?.name || 'Outlet Details',
      showBack: true,
      showMenu: false,
      backgroundColor: colors.primary,
    });
  }, [setHeader, customer?.name, route?.routeName, colors.primary]);

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

  // Auto-start visit when inside geofence
  useEffect(() => {
    const shouldAutoStart =
      isInsideGeofenceArea && !activeVisit && customer && !autoStartAttempted && !isAutoStarting;

    if (shouldAutoStart) {
      autoStartVisit();
    }
  }, [isInsideGeofenceArea, activeVisit, autoStartAttempted, customer, isAutoStarting]);

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
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          checkGeofenceStatus(latitude, longitude);
        },
        (error) => {
          console.log('Error getting location:', error);
        },
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

  // Auto-start visit
  const autoStartVisit = useCallback(async () => {
    if (!customer || activeVisit || autoStartAttempted || isAutoStarting) {
      return;
    }

    setIsAutoStarting(true);
    setAutoStartAttempted(true);

    if (autoStartTimeout.current) {
      clearTimeout(autoStartTimeout.current);
    }

    autoStartTimeout.current = setTimeout(async () => {
      try {
        const payload: any = {
          routeSessionId: route?.routeSessionId,
          workSessionId: route?.workSessionId,
          vanId: route?.vanId,
          outletId: customer.customerId,
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
          });

          Alert.alert(
            'Visit Started ✓',
            `You have been automatically checked in at ${customer.name}`,
            [
              {
                text: 'Proceed to Sale',
                onPress: () => router.push(`/checkin/sale`),
              },
              { text: 'Later', style: 'cancel' },
            ],
          );
        } else {
          setAutoStartAttempted(false);
          setIsAutoStarting(false);
        }
      } catch (error) {
        console.error('Auto-start visit failed:', error);
        setAutoStartAttempted(false);
        setIsAutoStarting(false);
      }
    }, 1000);
  }, [customer, activeVisit, autoStartAttempted, isAutoStarting, route, setActiveVisit]);

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
        outletId: customer.customerId,
        limit: 10,
        page: 1,
        vanId: van?.vanId,
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
    await visitStatus();
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
  const hasActiveVisit = activeVisit && activeVisit?.outlet?.customerId === customer.customerId;

  const visitStatus = async () => {
    try {
      const query: any = {
        workSessionId: selectedRoute?.workSessionId,
        vanId: selectedRoute?.vanId,
        routeSessionId: selectedRoute?.routeSessionId,
        outletId: customer?.customerId,
      };

      const response = await outletService.visitStatus(query);
      const visit: any = response?.data;

      if (!visit?.visitId) {
        clearVisit();
        return;
      }

      console.log('============visit=============', visit);

      setActiveVisit({
        visitId: visit.visitId,
        outlet: {
          id: visit.outletId,
          customerId: visit.outletId,
          name: visit.outletName,
          ownerName: visit.ownerName || '',
          phoneNumber: visit.phoneNumber || '',
          customerTypeId: visit.customerTypeId || '',
          address: visit.address || '',
          customerCategoryId: visit.customerCategoryId || '',
          channelId: visit.channelId || '',
          marketId: visit.marketId || '',
          provinceId: visit.provinceId || '',
          segmentation: visit.segmentation || '',
          geoTag: visit.geoTag || '',
          status: visit.outletStatus || 'active',
          isDeleted: visit.isDeleted || false,
        },
        checkInTime: new Date(visit.checkInTime),
        checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
        status: visit.status,
        routeSessionId: visit?.routeSessionId,
        customerId: visit?.customerId,
      });
    } catch (error) {
      console.error('visitStatus error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomerHeader customer={customer} styles={styles} colors={colors} compact={isTabScrolled} />

      {/* Last Visit and Last Order - Outside the card */}
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

      {/* Show geofence status for debugging */}
      {__DEV__ && distanceToOutlet !== null && (
        <View
          style={{
            backgroundColor: isInsideGeofenceArea ? '#4CAF50' : '#FF9800',
            padding: 4,
            alignItems: 'center',
            marginHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
          }}
        >
          <AppText style={{ color: '#FFF', fontSize: 12 }}>
            {isInsideGeofenceArea ? '✓ Inside geofence' : '○ Outside geofence'} - Distance:{' '}
            {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
            {isAutoStarting && ' - Auto-starting...'}
          </AppText>
        </View>
      )}

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} styles={styles} colors={colors} />

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
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleTabScroll}
        formatCurrency={formatCurrency}
      />

      {/* Footer Button - Full width Proceed to Sale when visit is active */}
      {hasActiveVisit && (
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
      )}

      {/* Show auto-starting indicator */}
      {!hasActiveVisit && isAutoStarting && (
        <View style={styles.fullWidthButtonContainer}>
          <View
            style={[styles.fullWidthAutoStartIndicator, { backgroundColor: colors.primary + '10' }]}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText style={[styles.autoStartText, { color: colors.primary }]}>
              Auto-starting visit...
            </AppText>
          </View>
        </View>
      )}
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

// ============= UPDATED SUMMARY TAB - Using new API data =============
const SummaryTab = ({ customer, styles, colors, formatCurrency }: any) => {
  // Extract summary data from customer object (from API response)
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
      {/* Outlet Sales Section */}
      <View style={styles.salesSectionCard}>
        {/* MTD Stats Row */}
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
            <AppText style={styles.statLabel}>MTD Quantity (Cases)</AppText>
          </View>
        </View>

        {/* Last Orders Average Stats */}
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

      {/* Performance Insights Card */}
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
            LPC ratio: {avgLPC.toFixed(2)} per case
            {avgLPC > 10 ? ' (Good)' : avgLPC > 5 ? ' (Average)' : ' (Needs Improvement)'}
          </AppText>
        </View>

        {/* {customer.outstanding > 0 && (
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: colors.error }]} />
            <AppText style={[styles.insightText, { color: colors.error }]}>
              Outstanding balance: {formatCurrency(customer.outstanding)}
            </AppText>
          </View>
        )}

        {customer.creditLimit > 0 && (
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: colors.info }]} />
            <AppText style={styles.insightText}>
              Credit limit: {formatCurrency(customer.creditLimit)} | Credit days:{' '}
              {customer.creditDays || 0} days
            </AppText>
          </View>
        )} */}
      </View>
    </View>
  );
};

// Sales Tab
const SalesTab = ({
  sales,
  loading,
  total,
  styles,
  colors,
  onScroll,
  refreshing,
  onRefresh,
  formatCurrency,
}: any) => {
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
            <AppText style={styles.listHeaderTitle}>
              Last {Math.min(sales.length, 10)} Sales
            </AppText>
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
const VisitsTab = ({
  visits,
  loading,
  total,
  styles,
  colors,
  onScroll,
  refreshing,
  onRefresh,
}: any) => {
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
            <AppText style={styles.listHeaderTitle}>
              Last {Math.min(visits.length, 10)} Visits
            </AppText>
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
