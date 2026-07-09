// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   ScrollView,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,
//   Platform,
//   AppState,
//   Modal,
//   Image,
//   Linking,
//   Alert,
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
// import { isSalesman } from '@/core/navigation/role.utils';
// import { captureCurrentLocation } from '@/shared/services/location.service';

// // ── Types ─────────────────────────────────────────────────────────────────────
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
//   orderValue?: number;
//   orderCases?: number;
//   orderWeight?: number;
// }

// type TabType = 'summary' | 'sales' | 'invoices' | 'visits';

// const TABS: { key: TabType; label: string; icon: string }[] = [
//   { key: 'summary', label: 'Summary', icon: 'stats-chart-outline' },
//   { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
//   { key: 'invoices', label: 'Invoices', icon: 'document-text-outline' },
//   { key: 'visits', label: 'Visits', icon: 'time-outline' },
// ];

// const PAGE_SIZE = 10;
// const GEOFENCE_RADIUS = 100;

// const resolveGeoTag = (value: any): { lat: number; lng: number } | null => {
//   const latitude = Number(value?.lat ?? value?.latitude ?? value?.coordinates?.[1]);
//   const longitude = Number(value?.lng ?? value?.longitude ?? value?.coordinates?.[0]);
//   return Number.isFinite(latitude) && Number.isFinite(longitude)
//     ? { lat: latitude, lng: longitude }
//     : null;
// };

// // ── Shared token map (avoids prop-drilling colors for inline styles) ───────────
// const T = {
//   display: { fontSize: 18, fontWeight: '700' as const },
//   title: { fontSize: 15, fontWeight: '600' as const },
//   section: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
//   value: { fontSize: 16, fontWeight: '700' as const },
//   valueS: { fontSize: 14, fontWeight: '700' as const },
//   body: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
//   bodyM: { fontSize: 13, fontWeight: '500' as const },
//   label: { fontSize: 11, fontWeight: '500' as const },
//   micro: { fontSize: 10, fontWeight: '600' as const },
// };

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const fmt = (amount: number) =>
//   `ZMW ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;

// const fmtDate = (s?: string | null) => (s ? moment(s).format('DD MMM YYYY') : 'Never');
// const fmtTime = (s?: string | null) => (s ? moment(s).format('hh:mm A') : '--');
// const fmtDT = (s?: string | null) => (s ? moment(s).format('DD MMM YYYY, hh:mm A') : 'N/A');

// const getDuration = (checkIn: string, checkOut?: string) => {
//   if (!checkOut) return 'In progress';
//   const d = moment.duration(moment(checkOut).diff(moment(checkIn)));
//   const h = Math.floor(d.asHours()),
//     m = d.minutes();
//   return h > 0 ? `${h}h ${m}m` : `${m}m`;
// };

// const getItemCases = (i: SaleItemDetail) => Number(i.cases ?? i.caseQty ?? 0);
// const getItemPieces = (i: SaleItemDetail) => Number(i.pieces ?? i.pieceQty ?? 0);
// const getItemTotal = (i: SaleItemDetail) => Number(i.total ?? i.totalValue ?? 0);

// const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// const getFilterRange = (filter: string, custom: { startDate: Date; endDate: Date }) => {
//   const today = startOfDay(new Date());
//   if (filter === 'today') return { startDate: today, endDate: today };
//   if (filter === 'week') {
//     const s = new Date(today);
//     s.setDate(today.getDate() - today.getDay());
//     return { startDate: s, endDate: today };
//   }
//   if (filter === 'month')
//     return { startDate: new Date(today.getFullYear(), today.getMonth(), 1), endDate: today };
//   return custom;
// };

// // ── Shared bottom-sheet modal ─────────────────────────────────────────────────
// const BottomSheet = ({
//   visible,
//   onClose,
//   title,
//   subtitle,
//   children,
//   colors: c,
// }: {
//   visible: boolean;
//   onClose: () => void;
//   title: string;
//   subtitle?: string;
//   children: React.ReactNode;
//   colors: ReturnType<typeof useTheme>['colors'];
// }) => (
//   <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//     <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
//       <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
//       <View
//         style={{
//           backgroundColor: c.surface,
//           borderTopLeftRadius: 20,
//           borderTopRightRadius: 20,
//           maxHeight: '80%',
//           borderTopWidth: 1,
//           borderTopColor: c.border,
//         }}
//       >
//         {/* Drag handle */}
//         <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
//           <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: c.border }} />
//         </View>

//         {/* Header */}
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             paddingHorizontal: 16,
//             paddingBottom: 12,
//             borderBottomWidth: 1,
//             borderBottomColor: c.border,
//           }}
//         >
//           <View style={{ flex: 1, minWidth: 0 }}>
//             <AppText style={{ ...T.title, color: c.textPrimary }}>{title}</AppText>
//             {subtitle ? (
//               <AppText
//                 numberOfLines={1}
//                 style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}
//               >
//                 {subtitle}
//               </AppText>
//             ) : null}
//           </View>
//           <TouchableOpacity
//             onPress={onClose}
//             activeOpacity={0.7}
//             style={{
//               width: 32,
//               height: 32,
//               borderRadius: 16,
//               backgroundColor: c.background,
//               alignItems: 'center',
//               justifyContent: 'center',
//               marginLeft: 12,
//             }}
//           >
//             <Ionicons name="close" size={18} color={c.textPrimary} />
//           </TouchableOpacity>
//         </View>

//         {children}
//       </View>
//     </View>
//   </Modal>
// );

// // ── Main screen ───────────────────────────────────────────────────────────────
// export default function CustomerDetailScreen() {
//   const customerRef = useRef<Outlet | null>(null);
//   const { colors } = useTheme();
//   const styles = useOutletDetailStyles();
//   const { id } = useLocalSearchParams<{ id: string }>();

//   const [activeTab, setActiveTab] = useState<TabType>('summary');
//   const [refreshing, setRefreshing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [customer, setCustomer] = useState<Outlet | null>(null);
//   const clearActiveVisit = useOutletStore((s) => s.clearActiveVisit);

//   const [isInsideGeofenceArea, setIsInsideGeofenceArea] = useState(false);
//   const [distanceToOutlet, setDistanceToOutlet] = useState<number | null>(null);
//   const [isStartingSale, setIsStartingSale] = useState(false);
//   const [isRecordingInteraction, setIsRecordingInteraction] = useState(false);
//   const [interactionFailed, setInteractionFailed] = useState(false);
//   const [interactionAttempt, setInteractionAttempt] = useState(0);

//   const [sales, setSales] = useState<SaleItem[]>([]);
//   const [salesLoading, setSalesLoading] = useState(false);
//   const [salesTotal, setSalesTotal] = useState(0);
//   const [salesLoaded, setSalesLoaded] = useState(false);
//   const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
//   const [visitsLoading, setVisitsLoading] = useState(false);
//   const [visitsTotal, setVisitsTotal] = useState(0);
//   const [visitsLoaded, setVisitsLoaded] = useState(false);

//   const locationInterval = useRef<NodeJS.Timeout | null>(null);
//   const appStateListener = useRef<any>(null);
//   const scrollViewRef = useRef<ScrollView>(null);

//   const route = useRouteStore((s) => s.selectedRoute);
//   const van = useRouteStore((s) => s.van);
//   const user = useAuthStore((s) => s.user);
//   const activeVisit = useOutletStore((s) => s.activeVisit);
//   const activeInteraction = useOutletStore((s) => s.activeInteraction);
//   const selectedOutlet = useOutletStore((s) => s.selectedOutlet);
//   const setActiveInteraction = useOutletStore((s) => s.setActiveInteraction);
//   const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
//   const { setSelectedOutlet } = useOutletStore();
//   const { setHeader } = useHeader();
//   const selectedRoute = useRouteStore((s) => s.selectedRoute);
//   const interactionStartedRef = useRef<string | null>(null);

//   useEffect(() => {
//     loadCustomerData();
//   }, [id]);

//   useFocusEffect(
//     useCallback(() => {
//       if (customer) checkActiveVisit();
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

//   useEffect(() => {
//     const startInteraction = async () => {
//       if (
//         !customer?.customerId ||
//         customer.status !== 'ACTIVE' ||
//         !isSalesman(user) ||
//         !route?.routeSessionId ||
//         !route?.workSessionId ||
//         !van?.vanId ||
//         !resolveGeoTag(customer.geoTag) ||
//         interactionStartedRef.current === customer.customerId
//       ) {
//         return;
//       }

//       if (
//         activeInteraction?.customerId === customer.customerId &&
//         activeInteraction.status === 'ARRIVED'
//       ) {
//         interactionStartedRef.current = customer.customerId;
//         return;
//       }

//       interactionStartedRef.current = customer.customerId;
//       setIsRecordingInteraction(true);
//       setInteractionFailed(false);
//       try {
//         const customerLocation = resolveGeoTag(customer.geoTag);
//         if (!customerLocation) return;

//         const response = await outletService.startInteraction({
//           customerId: customer.customerId,
//           routeSessionId: route.routeSessionId,
//           workSessionId: route.workSessionId,
//           vanId: van.vanId,
//           customerLocation: {
//             latitude: customerLocation.lat,
//             longitude: customerLocation.lng,
//           },
//           configuredRadiusMeters: GEOFENCE_RADIUS,
//         });
//         if (!response?.data?.interactionId) {
//           throw new Error('Interaction API did not return an interaction ID');
//         }

//         setActiveInteraction({
//           interactionId: response.data.interactionId,
//           customerId: customer.customerId,
//           arrivalTime: String(response.data.arrivalTime || new Date().toISOString()),
//           visitType: response.data.visitType,
//           distanceMeters: Number(response.data.distanceMeters || 0),
//           status: 'ARRIVED',
//         });
//       } catch (error) {
//         interactionStartedRef.current = null;
//         setInteractionFailed(true);
//         console.error('Unable to create interaction log:', error);
//       } finally {
//         setIsRecordingInteraction(false);
//       }
//     };

//     void startInteraction();
//   }, [
//     activeInteraction,
//     customer,
//     interactionAttempt,
//     route,
//     setActiveInteraction,
//     user,
//     van?.vanId,
//   ]);

//   useEffect(() => {
//     setSales([]);
//     setSalesTotal(0);
//     setSalesLoaded(false);
//     setVisitHistory([]);
//     setVisitsTotal(0);
//     setVisitsLoaded(false);
//   }, [customer?.customerId, van?.vanId]);

//   useEffect(() => {
//     if (resolveGeoTag(customer?.geoTag)) startLocationTracking();
//     else stopLocationTracking();
//     return () => stopLocationTracking();
//   }, [customer]);

//   useEffect(() => {
//     appStateListener.current = AppState.addEventListener('change', (s) => {
//       if (s === 'active' && resolveGeoTag(customer?.geoTag)) getCurrentLocation();
//     });
//     return () => appStateListener.current?.remove();
//   }, [customer]);

//   const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
//     const c = customerRef.current;
//     const outletLocation = resolveGeoTag(c?.geoTag);
//     if (!c || !outletLocation) return;
//     setDistanceToOutlet(getDistance(lat, lng, outletLocation.lat, outletLocation.lng));
//     setIsInsideGeofenceArea(
//       isInsideGeofence(lat, lng, {
//         id: c.customerId,
//         latitude: outletLocation.lat,
//         longitude: outletLocation.lng,
//         radius: GEOFENCE_RADIUS,
//       }),
//     );
//   }, []);

//   const getCurrentLocation = useCallback(async () => {
//     if (Platform.OS === 'web' && navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         ({ coords: { latitude, longitude } }) => {
//           checkGeofenceStatus(latitude, longitude);
//         },
//         (e) => console.warn('Location error:', e),
//         { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
//       );
//       return;
//     }

//     const location = await captureCurrentLocation();
//     if (location) {
//       checkGeofenceStatus(location.latitude, location.longitude);
//     }
//   }, [checkGeofenceStatus]);

//   const startLocationTracking = useCallback(() => {
//     if (locationInterval.current) clearInterval(locationInterval.current);
//     getCurrentLocation();
//     locationInterval.current = setInterval(() => void getCurrentLocation(), 15000);
//   }, [getCurrentLocation]);

//   const stopLocationTracking = useCallback(() => {
//     if (locationInterval.current) {
//       clearInterval(locationInterval.current);
//       locationInterval.current = null;
//     }
//   }, []);

//   const getVisitType = useCallback(
//     (): ShopVisitType =>
//       resolveGeoTag(customer?.geoTag) && isInsideGeofenceArea
//         ? ShopVisitType.ON_SITE
//         : ShopVisitType.OFF_SITE,
//     [customer?.geoTag, isInsideGeofenceArea],
//   );

//   const checkActiveVisit = async () => {
//     if (!customer?.customerId) return;
//     try {
//       const query: any = {
//         workSessionId: selectedRoute?.workSessionId,
//         vanId: van?.vanId,
//         routeSessionId: selectedRoute?.routeSessionId,
//         outletId: customer.customerId,
//       };
//       const visit: any = (await outletService.visitStatus(query))?.data;
//       if (visit?.visitId && visit?.status === 'ACTIVE') {
//         setActiveVisit({
//           visitId: visit.visitId,
//           outlet: customer as any,
//           checkInTime: new Date(visit.checkInTime),
//           checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
//           status: visit.status,
//           routeSessionId: visit?.routeSessionId,
//           customerId: visit?.customerId,
//           visitType: getVisitType(),
//         });
//       } else if (!visit?.visitId) clearActiveVisit();
//     } catch (e) {
//       console.error('checkActiveVisit error:', e);
//     }
//   };

//   const loadCustomerData = async () => {
//     setIsLoading(true);
//     try {
//       const detailResponse = await outletService.getOutletDetail(id);
//       const detail = detailResponse?.data;

//       if (detail) {
//         const fallbackGeoTag =
//           selectedOutlet?.customerId === id ? resolveGeoTag(selectedOutlet.geoTag) : null;
//         const outlet = {
//           ...detail,
//           geoTag: resolveGeoTag(detail.geoTag) ?? fallbackGeoTag ?? detail.geoTag,
//           images: selectedOutlet?.customerId === id ? selectedOutlet.images || [] : [],
//         };
//         setCustomer(outlet);
//         setSelectedOutlet(outlet);

//         // Media is decorative and must not delay rendering, GPS, or interaction creation.
//         void outletService
//           .getOutletMedia(id)
//           .then((mediaResponse) => {
//             const images = Array.isArray(mediaResponse?.data)
//               ? mediaResponse.data.filter((item: any) => item?.url)
//               : [];
//             setCustomer((current) => {
//               if (!current || current.customerId !== outlet.customerId) return current;
//               return { ...current, images } as Outlet;
//             });
//           })
//           .catch((error) => console.warn('Failed to load outlet media:', error));
//       } else setCustomer(null);
//     } catch (error) {
//       console.error('Failed to load outlet details:', error);
//       setCustomer(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadSalesHistory = async () => {
//     if (!customer?.customerId) return;
//     setSalesLoading(true);
//     try {
//       const res: any = await saleService.fetchSales({
//         page: 1,
//         limit: PAGE_SIZE,
//         customerId: customer.customerId,
//         vanId: van?.vanId,
//         employeeId: user?.userId,
//       });
//       const data = res?.data || [];
//       setSales(data);
//       setSalesTotal(res?.meta?.total || res?.total || data.length);
//     } catch (e) {
//       console.error('Failed to load sales:', e);
//     } finally {
//       setSalesLoaded(true);
//       setSalesLoading(false);
//     }
//   };

//   const loadVisitHistory = async () => {
//     if (!customer?.customerId) return;
//     setVisitsLoading(true);
//     try {
//       const res = await outletService.getVisitHistory({
//         outletId: customer.customerId,
//         limit: 10,
//         page: 1,
//         vanId: van?.vanId,
//       });
//       const visits = res?.data || [];
//       setVisitHistory(visits);
//       setVisitsTotal((res as any)?.meta?.total || (res as any)?.total || 0);
//     } catch (e) {
//       console.error('Failed to load visits:', e);
//     } finally {
//       setVisitsLoaded(true);
//       setVisitsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!customer?.customerId) return;

//     if (activeTab === 'invoices') {
//       setSalesLoaded(false);
//       void loadSalesHistory();
//     }

//     if (activeTab === 'visits') {
//       setVisitsLoaded(false);
//       void loadVisitHistory();
//     }
//   }, [activeTab, customer?.customerId, van?.vanId]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await checkActiveVisit();
//     await loadCustomerData();

//     if (activeTab === 'invoices') {
//       setSalesLoaded(false);
//       await loadSalesHistory();
//     }

//     if (activeTab === 'visits') {
//       setVisitsLoaded(false);
//       await loadVisitHistory();
//     }

//     setRefreshing(false);
//   }, [customer, activeTab]);

//   const handleStartSale = useCallback(async () => {
//     if (!customer || isStartingSale || isRecordingInteraction) return;

//     if (!isSalesman(user)) {
//       Alert.alert('Not allowed', 'Only a salesman can start a visit.');
//       return;
//     }

//     if (activeVisit?.customerId === customer.customerId) {
//       router.push('/checkin');
//       return;
//     }

//     if (!resolveGeoTag(customer.geoTag)) {
//       Alert.alert(
//         'Outlet location missing',
//         'This outlet does not have a valid geotag. Update the outlet location before starting a sale.',
//       );
//       return;
//     }

//     if (
//       !activeInteraction ||
//       activeInteraction.customerId !== customer.customerId ||
//       activeInteraction.status !== 'ARRIVED'
//     ) {
//       interactionStartedRef.current = null;
//       setInteractionAttempt((attempt) => attempt + 1);
//       return;
//     }
//     router.push('/checkin');
//   }, [activeVisit, activeInteraction, customer, isRecordingInteraction, isStartingSale, user]);

//   if (isLoading) return <LoadingState />;
//   if (!customer) return <EmptyState colors={colors} />;

//   const lastOrderDate =
//     customer?.summary?.lastOrderDate || (sales.length > 0 ? sales[0]?.date : null);
//   const lastVisitDate = customer?.summary?.lastVisitDate || customer?.lastVisitedAt;
//   const hasActiveVisit = activeVisit && activeVisit?.customerId === customer.customerId;

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.mainScrollView}
//         contentContainerStyle={styles.mainScrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         <CustomerHeader customer={customer} colors={colors} />

//         {/* Last visit / last order */}
//         <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 8 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               backgroundColor: colors.surface,
//               borderRadius: 12,
//               padding: 12,
//               borderWidth: 1,
//               borderColor: colors.border,
//             }}
//           >
//             {(
//               [
//                 { icon: 'time-outline', label: 'Last Visit', value: fmtDate(lastVisitDate) },
//                 { icon: 'cart-outline', label: 'Last Order', value: fmtDate(lastOrderDate) },
//               ] as const
//             ).map((item, idx) => (
//               <React.Fragment key={item.label}>
//                 {idx > 0 && (
//                   <View
//                     style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 12 }}
//                   />
//                 )}
//                 <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                   <View
//                     style={{
//                       width: 30,
//                       height: 30,
//                       borderRadius: 8,
//                       backgroundColor: colors.primary + '12',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                     }}
//                   >
//                     <Ionicons name={item.icon as any} size={14} color={colors.primary} />
//                   </View>
//                   <View>
//                     <AppText style={{ ...T.label, color: colors.textSecondary }}>
//                       {item.label}
//                     </AppText>
//                     <AppText style={{ ...T.bodyM, color: colors.textPrimary, marginTop: 1 }}>
//                       {item.value}
//                     </AppText>
//                   </View>
//                 </View>
//               </React.Fragment>
//             ))}
//           </View>
//         </View>

//         {/* Dev geofence pill */}
//         {__DEV__ && distanceToOutlet !== null && (
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               gap: 6,
//               backgroundColor: isInsideGeofenceArea ? colors.success : colors.warning,
//               marginHorizontal: 16,
//               marginBottom: 8,
//               paddingHorizontal: 12,
//               paddingVertical: 6,
//               borderRadius: 8,
//             }}
//           >
//             <Ionicons
//               name={isInsideGeofenceArea ? 'checkmark-circle-outline' : 'radio-outline'}
//               size={13}
//               color={colors.primaryContrast}
//             />
//             <AppText style={{ ...T.label, color: colors.primaryContrast }}>
//               {isInsideGeofenceArea ? 'Inside' : 'Outside'} geofence ·{' '}
//               {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
//             </AppText>
//           </View>
//         )}

//         <TabBar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

//         <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}>
//           {activeTab === 'summary' && <SummaryTab customer={customer} colors={colors} />}
//           {activeTab === 'sales' && (
//             <SalesTab colors={colors} customerId={customer?.customerId} van={van} />
//           )}
//           {activeTab === 'invoices' && (
//             <InvoicesTab
//               invoices={sales}
//               loading={salesLoading || !salesLoaded}
//               total={salesTotal}
//               colors={colors}
//             />
//           )}
//           {activeTab === 'visits' && (
//             <VisitsTab
//               visits={visitHistory}
//               loading={visitsLoading || !visitsLoaded}
//               total={visitsTotal}
//               colors={colors}
//             />
//           )}
//         </View>
//       </ScrollView>

//       {/* Only salesmen can start or continue a sale visit. */}
//       {isSalesman(user) && (
//         <SafeAreaView
//           edges={['bottom']}
//           style={{
//             backgroundColor: colors.surface,
//             borderTopWidth: 1,
//             borderTopColor: colors.border,
//           }}
//         >
//           {isStartingSale ? (
//             <View
//               style={{
//                 paddingHorizontal: 16,
//                 paddingVertical: 14,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 gap: 10,
//               }}
//             >
//               <ActivityIndicator size="small" color={colors.primary} />
//               <AppText style={{ ...T.bodyM, color: colors.primary }}>Starting sale…</AppText>
//             </View>
//           ) : (
//             <Animated.View
//               entering={FadeInUp.duration(300)}
//               style={{ paddingHorizontal: 16, paddingVertical: 12 }}
//             >
//               <TouchableOpacity
//                 onPress={handleStartSale}
//                 disabled={isRecordingInteraction}
//                 activeOpacity={0.85}
//                 style={{
//                   backgroundColor: colors.primary,
//                   borderRadius: 14,
//                   padding: 8,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   shadowColor: colors.primary,
//                   shadowOffset: { width: 0, height: 5 },
//                   shadowOpacity: 0.35,
//                   shadowRadius: 12,
//                   elevation: 7,
//                   opacity: isRecordingInteraction ? 0.72 : 1,
//                 }}
//               >
//                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//                   <View
//                     style={{
//                       width: 36,
//                       height: 36,
//                       borderRadius: 10,
//                       backgroundColor: 'rgba(255,255,255,0.2)',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                     }}
//                   >
//                     <Ionicons name="cart-outline" size={20} color={colors.primaryContrast} />
//                   </View>
//                   <View>
//                     <AppText
//                       style={{ color: colors.primaryContrast, fontSize: 15, fontWeight: '700' }}
//                     >
//                       {isRecordingInteraction
//                         ? 'Recording arrival…'
//                         : interactionFailed
//                           ? 'Retry arrival'
//                           : 'Start Sale'}
//                     </AppText>
//                     <AppText
//                       style={{ color: colors.primaryContrast + 'B8', fontSize: 11, marginTop: 1 }}
//                     >
//                       {isRecordingInteraction
//                         ? 'Please wait a moment'
//                         : interactionFailed
//                           ? 'Tap to try GPS again'
//                           : hasActiveVisit
//                             ? 'Visit active'
//                             : 'Tap to start'}
//                     </AppText>
//                   </View>
//                 </View>
//                 <View
//                   style={{
//                     width: 32,
//                     height: 32,
//                     borderRadius: 8,
//                     backgroundColor: 'rgba(255,255,255,0.2)',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Ionicons name="arrow-forward" size={17} color={colors.primaryContrast} />
//                 </View>
//               </TouchableOpacity>
//             </Animated.View>
//           )}
//         </SafeAreaView>
//       )}
//     </View>
//   );
// }

// // ── Skeleton states ────────────────────────────────────────────────────────────
// const LoadingState = () => (
//   <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
//     <ScrollView showsVerticalScrollIndicator={false}>
//       <View style={{ padding: 16, gap: 10 }}>
//         <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16 }}>
//           <View style={{ flexDirection: 'row', gap: 12 }}>
//             <Skeleton height={52} width={52} variant="circle" />
//             <View style={{ flex: 1, gap: 8 }}>
//               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                 <Skeleton height={16} width="55%" borderRadius={8} />
//                 <Skeleton height={22} width={68} borderRadius={11} />
//               </View>
//               <Skeleton height={12} width="36%" borderRadius={6} />
//               <View style={{ flexDirection: 'row', gap: 6 }}>
//                 <Skeleton height={24} width={94} borderRadius={12} />
//                 <Skeleton height={24} width={106} borderRadius={12} />
//               </View>
//             </View>
//           </View>
//           <Skeleton height={34} width="100%" borderRadius={10} style={{ marginTop: 12 }} />
//         </View>
//         <Skeleton height={56} width="100%" borderRadius={12} />
//         <Skeleton height={42} width="100%" borderRadius={0} />
//         <View style={{ gap: 12 }}>
//           <View style={{ flexDirection: 'row', gap: 12 }}>
//             {[1, 2].map((i) => (
//               <View
//                 key={i}
//                 style={{
//                   flex: 1,
//                   backgroundColor: '#FFF',
//                   borderRadius: 12,
//                   padding: 14,
//                   gap: 10,
//                   alignItems: 'center',
//                 }}
//               >
//                 <Skeleton height={22} width={22} variant="circle" />
//                 <Skeleton height={20} width="72%" borderRadius={8} />
//                 <Skeleton height={11} width="80%" borderRadius={6} />
//               </View>
//             ))}
//           </View>
//           {[1, 2, 3].map((i) => (
//             <Skeleton key={i} height={40} width="100%" borderRadius={8} />
//           ))}
//         </View>
//       </View>
//     </ScrollView>
//   </View>
// );

// const DetailListSkeleton = ({ rows = 3 }: { rows?: number }) => {
//   const { colors } = useTheme();

//   return (
//     <View style={{ gap: 10 }}>
//       {Array.from({ length: rows }).map((_, i) => (
//         <View
//           key={i}
//           style={{ backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' }}
//         >
//           <View style={{ height: 3, backgroundColor: colors.divider }} />
//           <View style={{ padding: 14, gap: 10 }}>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//               <View style={{ gap: 7 }}>
//                 <Skeleton height={11} width={88} borderRadius={6} />
//                 <Skeleton height={14} width={128} borderRadius={7} />
//               </View>
//               <View style={{ alignItems: 'flex-end', gap: 5 }}>
//                 <Skeleton height={17} width={76} borderRadius={8} />
//                 <Skeleton height={10} width={70} borderRadius={5} />
//               </View>
//             </View>
//             <View style={{ flexDirection: 'row', gap: 6 }}>
//               {[1, 2, 3].map((j) => (
//                 <View
//                   key={j}
//                   style={{
//                     flex: 1,
//                     backgroundColor: colors.backgroundSecondary,
//                     borderRadius: 8,
//                     padding: 8,
//                     gap: 5,
//                   }}
//                 >
//                   <Skeleton height={10} width={36} borderRadius={5} />
//                   <Skeleton height={13} width="80%" borderRadius={6} />
//                 </View>
//               ))}
//             </View>
//           </View>
//         </View>
//       ))}
//     </View>
//   );
// };

// const EmptyState = ({ colors }: { colors: any }) => (
//   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
//     <Ionicons name="alert-circle-outline" size={60} color={colors.textTertiary} />
//     <AppText
//       style={{
//         ...T.title,
//         color: colors.textPrimary,
//         marginTop: 16,
//         marginBottom: 8,
//         textAlign: 'center',
//       }}
//     >
//       Customer not found
//     </AppText>
//     <AppText
//       style={{ ...T.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}
//     >
//       This customer doesn't exist or was removed.
//     </AppText>
//     <TouchableOpacity
//       onPress={() => router.back()}
//       activeOpacity={0.8}
//       style={{
//         backgroundColor: colors.primary,
//         paddingHorizontal: 24,
//         paddingVertical: 10,
//         borderRadius: 10,
//       }}
//     >
//       <AppText style={{ color: colors.primaryContrast, fontWeight: '600', fontSize: 13 }}>
//         Go back
//       </AppText>
//     </TouchableOpacity>
//   </View>
// );

// // ── Customer Header ────────────────────────────────────────────────────────────
// const CustomerHeader = ({ customer, colors: c }: any) => (
//   <Animated.View
//     entering={FadeInDown.duration(300)}
//     style={{ paddingHorizontal: 16, paddingTop: 12 }}
//   >
//     <View
//       style={{
//         backgroundColor: c.surface,
//         borderRadius: 18,
//         padding: 16,
//         borderWidth: 1,
//         borderColor: c.border,
//       }}
//     >
//       <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
//         {/* Avatar */}
//         <View
//           style={{
//             width: 52,
//             height: 52,
//             borderRadius: 26,
//             backgroundColor: c.primary + '12',
//             justifyContent: 'center',
//             alignItems: 'center',
//             flexShrink: 0,
//           }}
//         >
//           <OutletAvatar outlet={customer} />
//         </View>

//         {/* Info */}
//         <View style={{ flex: 1 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               gap: 8,
//               marginBottom: 3,
//             }}
//           >
//             <AppText numberOfLines={1} style={{ ...T.title, color: c.textPrimary, flex: 1 }}>
//               {customer.name}
//             </AppText>
//             <OutletStatusBadge status={customer.status} />
//           </View>
//           <AppText numberOfLines={1} style={{ ...T.body, color: c.textSecondary, marginBottom: 8 }}>
//             {customer.ownerName || 'Owner unknown'}
//           </AppText>
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
//             {[
//               { icon: 'business-outline', text: customer.customerTypeId || 'Van Sales' },
//               { icon: 'call-outline', text: customer.phoneNumber || 'No phone' },
//             ].map((chip) => (
//               <View
//                 key={chip.icon}
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 4,
//                   backgroundColor: c.primary + '0D',
//                   paddingHorizontal: 8,
//                   paddingVertical: 4,
//                   borderRadius: 20,
//                   borderWidth: 1,
//                   borderColor: c.primary + '1E',
//                 }}
//               >
//                 <Ionicons name={chip.icon as any} size={11} color={c.primary} />
//                 <AppText style={{ ...T.micro, color: c.primary }}>{chip.text}</AppText>
//               </View>
//             ))}
//           </View>
//         </View>
//       </View>

//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           gap: 6,
//           marginTop: 12,
//           paddingTop: 12,
//           borderTopWidth: 1,
//           borderTopColor: c.border,
//         }}
//       >
//         <Ionicons name="location-outline" size={14} color={c.primary} />
//         <AppText numberOfLines={2} style={{ ...T.body, color: c.textSecondary, flex: 1 }}>
//           {customer.address?.line1 || customer.address || 'Address not available'}
//         </AppText>
//       </View>
//     </View>
//   </Animated.View>
// );

// // ── Tab bar ────────────────────────────────────────────────────────────────────
// const TabBar = ({ activeTab, setActiveTab, colors: c }: any) => (
//   <View
//     style={{
//       backgroundColor: c.surface,
//       borderTopWidth: 1,
//       borderTopColor: c.border,
//       borderBottomWidth: 1,
//       borderBottomColor: c.border,
//       marginTop: 8,
//     }}
//   >
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={{ paddingHorizontal: 10 }}
//     >
//       {TABS.map((tab) => {
//         const active = activeTab === tab.key;
//         return (
//           <TouchableOpacity
//             key={tab.key}
//             onPress={() => setActiveTab(tab.key)}
//             activeOpacity={0.7}
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               gap: 5,
//               paddingVertical: 12,
//               paddingHorizontal: 12,
//               borderBottomWidth: 2,
//               borderBottomColor: active ? c.primary : 'transparent',
//             }}
//           >
//             <Ionicons
//               name={tab.icon as any}
//               size={14}
//               color={active ? c.primary : c.textSecondary}
//             />
//             <AppText
//               style={{
//                 fontSize: 12,
//                 fontWeight: active ? '700' : '500',
//                 color: active ? c.primary : c.textSecondary,
//               }}
//             >
//               {tab.label}
//             </AppText>
//           </TouchableOpacity>
//         );
//       })}
//     </ScrollView>
//   </View>
// );

// // ── Summary Tab ───────────────────────────────────────────────────────────────
// const SummaryTab = ({ customer, colors: c }: any) => {
//   const summary = customer?.summary || {};
//   const mtdValue = summary.mtd?.orderValue || 0;
//   const mtdQty = summary.mtd?.orderQuantity || 0;
//   const mtdCount = summary.mtd?.orderCount || 0;
//   const avgValue = summary.mtd?.avgOrderValue || 0;
//   const avgQty = summary.mtd?.avgOrderQuantity || 0;
//   const avgLPC = summary.mtd?.avgLPC || 0;
//   const recentOrders = summary.mtd?.orders || [];
//   const lpcRating =
//     avgLPC > 10
//       ? { label: 'Good', color: c.success }
//       : avgLPC > 5
//         ? { label: 'Average', color: c.warning }
//         : { label: 'Low', color: c.error };
//   const images = Array.isArray(customer?.images) ? customer.images : [];
//   const latitude = Number(customer?.geoTag?.lat);
//   const longitude = Number(customer?.geoTag?.lng);
//   const hasGeoTag = Number.isFinite(latitude) && Number.isFinite(longitude);
//   const outletTags = Array.isArray(customer?.tags) ? customer.tags.filter(Boolean) : [];

//   const openOutletMap = async () => {
//     const label = [customer?.name, ...outletTags].filter(Boolean).join(' · ');
//     const encodedLabel = encodeURIComponent(label || 'Outlet');
//     const url = Platform.select({
//       ios: `maps:${latitude},${longitude}?q=${encodedLabel}`,
//       android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
//       default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
//     });

//     if (!url) return;
//     try {
//       await Linking.openURL(url);
//     } catch {
//       Alert.alert('Map unavailable', 'Unable to open this outlet location.');
//     }
//   };

//   return (
//     <View style={{ gap: 12 }}>
//       {images.length > 0 && (
//         <View
//           style={{
//             backgroundColor: c.surface,
//             borderRadius: 16,
//             paddingVertical: 14,
//             borderWidth: 1,
//             borderColor: c.border,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               paddingHorizontal: 14,
//               marginBottom: 10,
//             }}
//           >
//             <AppText style={{ ...T.title, color: c.textPrimary }}>Outlet photos</AppText>
//             <AppText style={{ ...T.label, color: c.textSecondary }}>{images.length}</AppText>
//           </View>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
//           >
//             {images.map((image: any, index: number) => {
//               const uri = image.urls?.medium || image.urls?.small || image.url;
//               return (
//                 <Image
//                   key={image.mediaId || `${uri}-${index}`}
//                   source={{ uri }}
//                   accessibilityLabel={image.altText || image.title || `Outlet photo ${index + 1}`}
//                   resizeMode="cover"
//                   style={{
//                     width: 180,
//                     height: 120,
//                     borderRadius: 12,
//                     backgroundColor: c.background,
//                   }}
//                 />
//               );
//             })}
//           </ScrollView>
//         </View>
//       )}

//       {hasGeoTag && (
//         <TouchableOpacity
//           onPress={openOutletMap}
//           activeOpacity={0.75}
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             gap: 12,
//             backgroundColor: c.surface,
//             borderRadius: 16,
//             padding: 14,
//             borderWidth: 1,
//             borderColor: c.border,
//           }}
//         >
//           <View
//             style={{
//               width: 42,
//               height: 42,
//               borderRadius: 12,
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: c.primary + '14',
//             }}
//           >
//             <Ionicons name="map-outline" size={21} color={c.primary} />
//           </View>
//           <View style={{ flex: 1 }}>
//             <AppText style={{ ...T.bodyM, color: c.textPrimary }}>View geotag on map</AppText>
//             <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 3 }}>
//               {latitude.toFixed(6)}, {longitude.toFixed(6)}
//             </AppText>
//             {outletTags.length > 0 && (
//               <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
//                 {outletTags.map((tag: string) => (
//                   <View
//                     key={tag}
//                     style={{
//                       backgroundColor: c.primary + '10',
//                       borderRadius: 10,
//                       paddingHorizontal: 7,
//                       paddingVertical: 3,
//                     }}
//                   >
//                     <AppText style={{ ...T.micro, color: c.primary }}>{tag}</AppText>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//           <Ionicons name="open-outline" size={17} color={c.primary} />
//         </TouchableOpacity>
//       )}

//       {/* MTD card */}
//       <View
//         style={{
//           backgroundColor: c.surface,
//           borderRadius: 16,
//           padding: 16,
//           borderWidth: 1,
//           borderColor: c.border,
//         }}
//       >
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
//           <View
//             style={{
//               backgroundColor: c.primary + '12',
//               paddingHorizontal: 7,
//               paddingVertical: 3,
//               borderRadius: 6,
//             }}
//           >
//             <AppText style={{ ...T.section, color: c.primary }}>MTD</AppText>
//           </View>
//           <AppText style={{ ...T.label, color: c.textSecondary }}>Month-to-date summary</AppText>
//         </View>

//         <View style={{ flexDirection: 'row', gap: 10 }}>
//           {[
//             {
//               icon: 'bar-chart-outline',
//               color: c.success,
//               value: fmt(mtdValue),
//               label: 'Order Value',
//               sub: `${mtdCount} order${mtdCount !== 1 ? 's' : ''}`,
//             },
//             {
//               icon: 'cube-outline',
//               color: c.info,
//               value: mtdQty.toFixed(1),
//               label: 'Cases',
//               sub: null,
//             },
//           ].map((s) => (
//             <View
//               key={s.label}
//               style={{
//                 flex: 1,
//                 backgroundColor: c.background,
//                 borderRadius: 12,
//                 padding: 12,
//                 borderLeftWidth: 3,
//                 borderLeftColor: s.color,
//               }}
//             >
//               <Ionicons
//                 name={s.icon as any}
//                 size={18}
//                 color={s.color}
//                 style={{ marginBottom: 8 }}
//               />
//               <AppText style={{ ...T.value, color: c.textPrimary }}>{s.value}</AppText>
//               <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 3 }}>
//                 {s.label}
//               </AppText>
//               {s.sub && (
//                 <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
//                   {s.sub}
//                 </AppText>
//               )}
//             </View>
//           ))}
//         </View>

//         {/* Divider + averages */}
//         <View style={{ height: 1, backgroundColor: c.border, marginVertical: 14 }} />
//         {/* <AppText style={{ ...T.label, color: c.textSecondary, marginBottom: 10 }}>
//           Last {recentOrders.length || 5} orders — averages
//         </AppText> */}
//         <View style={{ flexDirection: 'row', gap: 8 }}>
//           {[
//             { icon: 'cash-outline', color: c.warning, value: fmt(avgValue), label: 'Avg Value' },
//             {
//               icon: 'layers-outline',
//               color: c.warning,
//               value: avgQty.toFixed(1),
//               label: 'Avg Qty',
//             },
//             {
//               icon: 'pricetag-outline',
//               color: lpcRating.color,
//               value: avgLPC.toFixed(2),
//               label: 'LPC',
//             },
//           ].map((s) => (
//             <View
//               key={s.label}
//               style={{
//                 flex: 1,
//                 backgroundColor: c.background,
//                 borderRadius: 10,
//                 padding: 10,
//                 alignItems: 'center',
//                 gap: 5,
//               }}
//             >
//               <Ionicons name={s.icon as any} size={15} color={s.color} />
//               <AppText style={{ ...T.valueS, color: c.textPrimary, textAlign: 'center' }}>
//                 {s.value}
//               </AppText>
//               <AppText style={{ ...T.micro, color: c.textSecondary, textAlign: 'center' }}>
//                 {s.label}
//               </AppText>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* LPC insight pill */}
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           gap: 10,
//           backgroundColor: lpcRating.color + '0E',
//           borderWidth: 1,
//           borderColor: lpcRating.color + '22',
//           borderRadius: 12,
//           padding: 12,
//         }}
//       >
//         <View
//           style={{
//             width: 32,
//             height: 32,
//             borderRadius: 8,
//             backgroundColor: lpcRating.color + '1A',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//         >
//           <Ionicons
//             name={
//               lpcRating.label === 'Good'
//                 ? 'trending-up'
//                 : lpcRating.label === 'Average'
//                   ? 'remove-outline'
//                   : 'trending-down'
//             }
//             size={15}
//             color={lpcRating.color}
//           />
//         </View>
//         <View style={{ flex: 1 }}>
//           <AppText style={{ ...T.bodyM, color: c.textPrimary }}>
//             Lines Per Call: {avgLPC.toFixed(2)} —{' '}
//             <AppText style={{ color: lpcRating.color, fontWeight: '700' }}>
//               {lpcRating.label}
//             </AppText>
//           </AppText>
//           <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
//             {fmt(mtdValue)} across {mtdCount} {mtdCount === 1 ? 'order' : 'orders'} this month
//           </AppText>
//         </View>
//       </View>
//     </View>
//   );
// };

// // ── Sales Tab (category matrix) ────────────────────────────────────────────────
// const SalesTab = ({ colors: c, customerId, van }: any) => {
//   const [categorySales, setCategorySales] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedCell, setSelectedCell] = useState<any | null>(null);
//   const [detailLoading, setDetailLoading] = useState(false);

//   useEffect(() => {
//     if (!customerId) return;
//     setLoading(true);
//     saleService
//       .getCategoryWiseSales({ outletId: customerId, vanId: van?.vanId })
//       .then((r) => {
//         if (r.statusCode === 200 && r.data) setCategorySales(r.data);
//       })
//       .catch((e) => console.error('Category sales error:', e))
//       .finally(() => setLoading(false));
//   }, [van?.vanId, customerId]);

//   const categories = [...new Set(categorySales.map((i) => i.categoryName))];
//   const months = [
//     ...new Map(
//       categorySales.map((i) => [i.month, { short: i.month, key: `${i.year}-${i.monthNumber}` }]),
//     ).values(),
//   ];
//   const getCellData = (cat: string, month: string) =>
//     categorySales.find((i) => i.categoryName === cat && i.month === month);
//   const getValue = (cat: string, month: string) => getCellData(cat, month)?.totalQtyInCases || 0;

//   const loadCellDetail = async (cell: any, categoryName: string, month: string) => {
//     const nextCell = { ...cell, month, categoryName, products: [] };
//     setSelectedCell(nextCell);
//     setDetailLoading(true);

//     try {
//       const response = await saleService.getCategoryWiseSalesDetail({
//         outletId: customerId,
//         vanId: van?.vanId,
//         categoryName,
//         year: cell.year,
//         monthNumber: cell.monthNumber,
//       });

//       if (response?.statusCode === 200 && response.data) {
//         setSelectedCell((current: any) => {
//           const sameCell =
//             current?.categoryName === categoryName &&
//             current?.year === cell.year &&
//             current?.monthNumber === cell.monthNumber;

//           return sameCell ? { ...current, ...response.data, month } : current;
//         });
//       }
//     } catch (error) {
//       console.error('Category sales detail error:', error);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   if (loading && categorySales.length === 0) return <DetailListSkeleton rows={4} />;

//   if (!loading && categorySales.length === 0)
//     return (
//       <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
//         <Ionicons name="receipt-outline" size={48} color={c.textTertiary} />
//         <AppText style={{ ...T.title, color: c.textPrimary }}>No Sales Data</AppText>
//         <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>
//           No category sales found for this customer
//         </AppText>
//       </View>
//     );

//   return (
//     <View
//       style={{
//         backgroundColor: c.surface,
//         borderRadius: 12,
//         borderWidth: 1,
//         borderColor: c.border,
//         overflow: 'hidden',
//       }}
//     >
//       <ScrollView horizontal showsHorizontalScrollIndicator>
//         <View>
//           {/* Header */}
//           <View
//             style={{
//               flexDirection: 'row',
//               backgroundColor: c.background,
//               borderBottomWidth: 1,
//               borderBottomColor: c.border,
//             }}
//           >
//             <View style={{ width: 120, padding: 10 }}>
//               <AppText style={{ ...T.section, color: c.textSecondary }}>CATEGORY</AppText>
//             </View>
//             {months.map((m) => (
//               <View
//                 key={m.key}
//                 style={{
//                   width: 70,
//                   padding: 10,
//                   borderLeftWidth: 1,
//                   borderLeftColor: c.border,
//                   alignItems: 'center',
//                 }}
//               >
//                 <AppText style={{ ...T.section, color: c.textSecondary }}>
//                   {m.short.toUpperCase()}
//                 </AppText>
//               </View>
//             ))}
//             <View
//               style={{
//                 width: 80,
//                 padding: 10,
//                 borderLeftWidth: 1,
//                 borderLeftColor: c.border,
//                 alignItems: 'center',
//                 backgroundColor: c.background,
//               }}
//             >
//               <AppText style={{ ...T.section, color: c.textSecondary }}>TOTAL</AppText>
//             </View>
//           </View>

//           {/* Rows — alternating background */}
//           {categories.map((cat, catIdx) => {
//             const total = months.reduce((s, m) => s + getValue(cat, m.short), 0);
//             const isEven = catIdx % 2 === 0;
//             return (
//               <View
//                 key={cat}
//                 style={{
//                   flexDirection: 'row',
//                   backgroundColor: isEven ? c.surface : c.background,
//                   borderBottomWidth: catIdx < categories.length - 1 ? 1 : 0,
//                   borderBottomColor: c.border,
//                 }}
//               >
//                 <View style={{ width: 120, padding: 12, justifyContent: 'center' }}>
//                   <AppText style={{ ...T.bodyM, color: c.textPrimary }} numberOfLines={2}>
//                     {cat}
//                   </AppText>
//                   <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
//                     Cases
//                   </AppText>
//                 </View>
//                 {months.map((m) => {
//                   const cell = getCellData(cat, m.short);
//                   const val = Number(cell?.totalQtyInCases || 0);
//                   return (
//                     <TouchableOpacity
//                       key={m.key}
//                       activeOpacity={val > 0 ? 0.7 : 1}
//                       onPress={() => {
//                         if (val > 0) void loadCellDetail(cell, cat, m.short);
//                       }}
//                       style={{
//                         width: 70,
//                         borderLeftWidth: 1,
//                         borderLeftColor: c.border,
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                       }}
//                     >
//                       <AppText
//                         style={{
//                           fontSize: 13,
//                           textAlign: 'center',
//                           fontWeight: val > 0 ? '700' : '400',
//                           color: val > 0 ? c.success : c.textSecondary,
//                         }}
//                       >
//                         {val}
//                       </AppText>
//                     </TouchableOpacity>
//                   );
//                 })}
//                 <View
//                   style={{
//                     width: 80,
//                     borderLeftWidth: 1,
//                     borderLeftColor: c.border,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     backgroundColor: c.background,
//                   }}
//                 >
//                   <AppText style={{ ...T.valueS, color: c.textPrimary }}>{total}</AppText>
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       </ScrollView>

//       <BottomSheet
//         visible={!!selectedCell}
//         onClose={() => setSelectedCell(null)}
//         title={selectedCell?.categoryName || 'Sales Summary'}
//         subtitle={selectedCell ? `${selectedCell.month} ${selectedCell.year || ''}` : ''}
//         colors={c}
//       >
//         <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
//           {[
//             {
//               label: 'Cases',
//               value: Number(selectedCell?.totalQtyInCases || 0).toFixed(3),
//               icon: 'cube-outline',
//               color: c.success,
//             },
//             {
//               label: 'Value',
//               value: fmt(Number(selectedCell?.totalValue || 0)),
//               icon: 'cash-outline',
//               color: c.primary,
//             },
//             {
//               label: 'Weight',
//               value: Number(selectedCell?.totalWeight || 0).toFixed(2),
//               icon: 'scale-outline',
//               color: c.warning,
//             },
//           ].map((s) => (
//             <View
//               key={s.label}
//               style={{
//                 flex: 1,
//                 backgroundColor: s.color + '10',
//                 borderRadius: 10,
//                 padding: 10,
//                 borderWidth: 1,
//                 borderColor: s.color + '24',
//               }}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
//                 <Ionicons name={s.icon as any} size={12} color={s.color} />
//                 <AppText style={{ ...T.micro, color: c.textSecondary }}>{s.label}</AppText>
//               </View>
//               <AppText numberOfLines={1} style={{ ...T.valueS, color: c.textPrimary }}>
//                 {s.value}
//               </AppText>
//             </View>
//           ))}
//         </View>

//         <View style={{ height: 1, backgroundColor: c.border }} />

//         <ScrollView
//           style={{ maxHeight: 360 }}
//           contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {detailLoading ? (
//             <View style={{ alignItems: 'center', paddingVertical: 28 }}>
//               <ActivityIndicator size="small" color={c.primary} />
//               <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 10 }}>
//                 Loading products...
//               </AppText>
//             </View>
//           ) : (selectedCell?.products || []).length ? (
//             selectedCell.products.map((product: any, index: number) => (
//               <View
//                 key={`${product.productId || product.productName || 'product'}-${index}`}
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   gap: 10,
//                   marginTop: 10,
//                   padding: 12,
//                   borderRadius: 12,
//                   borderWidth: 1,
//                   borderColor: c.border,
//                   backgroundColor: index % 2 === 0 ? c.surface : c.background,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 34,
//                     height: 34,
//                     borderRadius: 10,
//                     backgroundColor: c.success + '12',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Ionicons name="cube-outline" size={17} color={c.success} />
//                 </View>
//                 <View style={{ flex: 1, minWidth: 0 }}>
//                   <AppText
//                     numberOfLines={2}
//                     style={{ ...T.bodyM, color: c.textPrimary, lineHeight: 18 }}
//                   >
//                     {product.productName || 'Product'}
//                   </AppText>
//                   <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
//                     <View
//                       style={{
//                         backgroundColor: c.success + '12',
//                         paddingHorizontal: 6,
//                         paddingVertical: 3,
//                         borderRadius: 7,
//                       }}
//                     >
//                       <AppText style={{ ...T.micro, color: c.success }}>
//                         {Number(product.cases || 0).toFixed(1)} C
//                       </AppText>
//                     </View>
//                     <View
//                       style={{
//                         backgroundColor: c.info + '12',
//                         paddingHorizontal: 6,
//                         paddingVertical: 3,
//                         borderRadius: 7,
//                       }}
//                     >
//                       <AppText style={{ ...T.micro, color: c.info }}>
//                         {Number(product.pieces || 0)} P
//                       </AppText>
//                     </View>
//                   </View>
//                 </View>
//                 <View style={{ alignItems: 'flex-end', maxWidth: 112 }}>
//                   <AppText numberOfLines={1} style={{ ...T.valueS, color: c.primary }}>
//                     {fmt(Number(product.value || 0))}
//                   </AppText>
//                   <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
//                     {Number(product.weight || 0).toFixed(2)} wt
//                   </AppText>
//                 </View>
//               </View>
//             ))
//           ) : (
//             <View style={{ alignItems: 'center', paddingVertical: 28 }}>
//               <Ionicons name="cube-outline" size={36} color={c.textTertiary} />
//               <AppText style={{ ...T.bodyM, color: c.textPrimary, marginTop: 10 }}>
//                 No products
//               </AppText>
//               <AppText
//                 style={{ ...T.label, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}
//               >
//                 No product sales found for this month
//               </AppText>
//             </View>
//           )}
//         </ScrollView>
//       </BottomSheet>
//     </View>
//   );
// };

// // ── Invoices Tab ───────────────────────────────────────────────────────────────
// const InvoicesTab = ({ invoices, loading, total, colors: c }: any) => {
//   const [selectedInvoice, setSelectedInvoice] = useState<SaleItem | null>(null);

//   const paymentConfig = (status: string) =>
//     ({
//       PAID: { color: c.success, icon: 'checkmark-circle-outline' as const },
//       PARTIAL: { color: c.warning, icon: 'time-outline' as const },
//       OVERDUE: { color: c.error, icon: 'alert-circle-outline' as const },
//       UNPAID: { color: c.textSecondary, icon: 'ellipse-outline' as const },
//     })[status?.toUpperCase()] ?? { color: c.textSecondary, icon: 'ellipse-outline' as const };

//   if (loading && invoices.length === 0) return <DetailListSkeleton rows={3} />;

//   if (!loading && invoices.length === 0)
//     return (
//       <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
//         <Ionicons name="document-text-outline" size={48} color={c.textTertiary} />
//         <AppText style={{ ...T.title, color: c.textPrimary }}>No Invoices</AppText>
//         <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>
//           No invoices found for this customer
//         </AppText>
//       </View>
//     );

//   return (
//     <View style={{ gap: 10 }}>
//       {invoices.length > 0 && (
//         <View style={{ marginBottom: 4 }}>
//           <AppText style={{ ...T.title, color: c.textPrimary }}>
//             Last {Math.min(invoices.length, PAGE_SIZE)}{' '}
//             {invoices.length === 1 ? 'Invoice' : 'Invoices'}
//           </AppText>
//           {total > PAGE_SIZE && (
//             <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
//               Showing last {PAGE_SIZE} of {total}
//             </AppText>
//           )}
//         </View>
//       )}

//       {invoices.map((inv: SaleItem) => {
//         const cfg = paymentConfig(inv.paymentStatus);
//         return (
//           <TouchableOpacity
//             key={inv.saleId}
//             activeOpacity={0.78}
//             onPress={() => setSelectedInvoice(inv)}
//             style={{
//               backgroundColor: c.surface,
//               borderRadius: 14,
//               borderWidth: 1,
//               borderColor: c.border,
//               overflow: 'hidden',
//             }}
//           >
//             {/* Status strip at top */}
//             <View style={{ height: 3, backgroundColor: cfg.color }} />
//             <View style={{ padding: 14 }}>
//               {/* Date + amount */}
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'flex-start',
//                 }}
//               >
//                 <View>
//                   <AppText style={{ ...T.label, color: c.textSecondary }}>
//                     {fmtDate(inv.date)}
//                   </AppText>
//                   <AppText
//                     numberOfLines={1}
//                     style={{ ...T.bodyM, color: c.textPrimary, marginTop: 3, maxWidth: 180 }}
//                   >
//                     {inv.saleId || 'N/A'}
//                   </AppText>
//                 </View>
//                 <View style={{ alignItems: 'flex-end' }}>
//                   <AppText style={{ ...T.value, color: c.primary }}>
//                     {fmt(inv.totalValue || 0)}
//                   </AppText>
//                   <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
//                     invoice total
//                   </AppText>
//                 </View>
//               </View>

//               {/* Pills */}
//               <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
//                 {[
//                   { label: 'Type', value: inv.type || 'N/A' },
//                   { label: 'Cases', value: String(inv.totalCases || 0) },
//                   { label: 'Pieces', value: String(inv.totalPieces || 0) },
//                   {
//                     label: 'Paid',
//                     value: inv.paymentStatus || 'N/A',
//                     color: cfg.color,
//                     icon: cfg.icon,
//                   },
//                 ].map((d) => (
//                   <View
//                     key={d.label}
//                     style={{
//                       flex: 1,
//                       backgroundColor: c.background,
//                       borderRadius: 10,
//                       paddingVertical: 8,
//                       paddingHorizontal: 10,
//                     }}
//                   >
//                     <AppText style={{ ...T.micro, color: c.textSecondary, marginBottom: 3 }}>
//                       {d.label}
//                     </AppText>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                       {'icon' in d && d.icon ? (
//                         <Ionicons name={d.icon as any} size={11} color={d.color as string} />
//                       ) : null}
//                       <AppText
//                         numberOfLines={1}
//                         style={{
//                           ...T.bodyM,
//                           color: ('color' in d && d.color ? d.color : c.textPrimary) as string,
//                         }}
//                       >
//                         {d.value}
//                       </AppText>
//                     </View>
//                   </View>
//                 ))}
//               </View>

//               {/* Pending */}
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'space-between',
//                   marginTop: 10,
//                 }}
//               >
//                 {inv.pendingAmount > 0 && (
//                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                     <Ionicons name="alert-circle-outline" size={12} color={c.warning} />
//                     <AppText style={{ ...T.label, color: c.warning }}>
//                       Pending {fmt(inv.pendingAmount)}
//                     </AppText>
//                   </View>
//                 )}
//                 {!(inv.pendingAmount > 0) && <View />}
//                 <Ionicons name="chevron-forward" size={14} color={c.textSecondary} />
//               </View>
//             </View>
//           </TouchableOpacity>
//         );
//       })}

//       {/* Invoice detail bottom sheet */}
//       <BottomSheet
//         visible={!!selectedInvoice}
//         onClose={() => setSelectedInvoice(null)}
//         title="Product Details"
//         subtitle={selectedInvoice?.saleId || 'Invoice'}
//         colors={c}
//       >
//         {/* Summary row */}
//         <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
//           {[
//             {
//               label: 'Cases',
//               value: String(selectedInvoice?.totalCases || 0),
//               icon: 'cube-outline',
//               color: c.info || c.primary,
//             },
//             {
//               label: 'Pieces',
//               value: String(selectedInvoice?.totalPieces || 0),
//               icon: 'layers-outline',
//               color: c.warning,
//             },
//             {
//               label: 'Amount',
//               value: fmt(selectedInvoice?.totalValue || 0),
//               icon: 'cash-outline',
//               color: c.success,
//             },
//           ].map((s) => (
//             <View
//               key={s.label}
//               style={{
//                 flex: 1,
//                 backgroundColor: s.color + '10',
//                 borderRadius: 10,
//                 padding: 10,
//                 borderWidth: 1,
//                 borderColor: s.color + '24',
//               }}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
//                 <Ionicons name={s.icon as any} size={12} color={s.color} />
//                 <AppText style={{ ...T.micro, color: c.textSecondary }}>{s.label}</AppText>
//               </View>
//               <AppText numberOfLines={1} style={{ ...T.valueS, color: c.textPrimary }}>
//                 {s.value}
//               </AppText>
//             </View>
//           ))}
//         </View>

//         <View style={{ height: 1, backgroundColor: c.border }} />

//         <ScrollView
//           style={{ maxHeight: 340 }}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
//         >
//           {selectedInvoice?.items?.length ? (
//             selectedInvoice.items.map((item, i) => (
//               <View
//                 key={`${item.productId || item.productName}-${i}`}
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   marginTop: 10,
//                   padding: 12,
//                   gap: 10,
//                   borderRadius: 12,
//                   borderWidth: 1,
//                   borderColor: c.border,
//                   backgroundColor: i % 2 === 0 ? c.surface : c.background,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 34,
//                     height: 34,
//                     borderRadius: 10,
//                     backgroundColor: c.primary + '12',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Ionicons name="cube-outline" size={17} color={c.primary} />
//                 </View>
//                 <View style={{ flex: 1, minWidth: 0 }}>
//                   <AppText
//                     numberOfLines={2}
//                     style={{ ...T.bodyM, color: c.textPrimary, lineHeight: 18 }}
//                   >
//                     {item.productName || 'Product'}
//                   </AppText>
//                   <AppText
//                     numberOfLines={1}
//                     style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}
//                   >
//                     {item.productCategory || item.category || 'Uncategorized'}
//                   </AppText>
//                   <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         gap: 3,
//                         backgroundColor: c.success + '12',
//                         paddingHorizontal: 6,
//                         paddingVertical: 3,
//                         borderRadius: 7,
//                       }}
//                     >
//                       <Ionicons name="albums-outline" size={10} color={c.success} />
//                       <AppText style={{ ...T.micro, color: c.success }}>
//                         {getItemCases(item)} C
//                       </AppText>
//                     </View>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         gap: 3,
//                         backgroundColor: c.info + '12',
//                         paddingHorizontal: 6,
//                         paddingVertical: 3,
//                         borderRadius: 7,
//                       }}
//                     >
//                       <Ionicons name="layers-outline" size={10} color={c.info} />
//                       <AppText style={{ ...T.micro, color: c.info }}>
//                         {getItemPieces(item)} P
//                       </AppText>
//                     </View>
//                   </View>
//                 </View>
//                 <View style={{ alignItems: 'flex-end', flexShrink: 0, maxWidth: 110 }}>
//                   <AppText numberOfLines={1} style={{ ...T.valueS, color: c.primary }}>
//                     {fmt(getItemTotal(item))}
//                   </AppText>
//                   <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
//                     line total
//                   </AppText>
//                 </View>
//               </View>
//             ))
//           ) : (
//             <View style={{ alignItems: 'center', paddingVertical: 28 }}>
//               <Ionicons name="cube-outline" size={36} color={c.textTertiary} />
//               <AppText style={{ ...T.bodyM, color: c.textPrimary, marginTop: 10 }}>
//                 No product details
//               </AppText>
//               <AppText
//                 style={{ ...T.label, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}
//               >
//                 Product line items are not available for this invoice
//               </AppText>
//             </View>
//           )}
//         </ScrollView>
//       </BottomSheet>
//     </View>
//   );
// };

// // ── Visits Tab ────────────────────────────────────────────────────────────────
// const VisitsTab = ({ visits, loading, total, colors: c }: any) => {
//   const [selectedVisit, setSelectedVisit] = useState<VisitHistory | null>(null);

//   const statusConfig = (status: string) =>
//     ({
//       COMPLETED: { color: c.success, label: 'Completed' },
//       ACTIVE: { color: c.primary, label: 'Active' },
//     })[status?.toUpperCase()] ?? { color: c.warning, label: status };

//   if (loading && visits.length === 0) return <DetailListSkeleton rows={3} />;

//   if (!loading && visits.length === 0)
//     return (
//       <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
//         <Ionicons name="time-outline" size={48} color={c.textTertiary} />
//         <AppText style={{ ...T.title, color: c.textPrimary }}>No visits yet</AppText>
//         <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>
//           No visit history found for this customer
//         </AppText>
//       </View>
//     );

//   return (
//     <View style={{ gap: 10 }}>
//       {visits.length > 0 && (
//         <View style={{ marginBottom: 4 }}>
//           <AppText style={{ ...T.title, color: c.textPrimary }}>
//             Last {Math.min(visits.length, 10)} Visits
//           </AppText>
//           {total > 10 && (
//             <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
//               Showing last 10 of {total}
//             </AppText>
//           )}
//         </View>
//       )}

//       {visits.map((item: VisitHistory) => {
//         const cfg = statusConfig(item.status);
//         const duration = getDuration(item.checkInTime, item.checkOutTime);
//         const orderCount = Number(item.orderCount || 0);
//         const hasOrder = orderCount > 0;
//         const orderValue = Number(item.orderValue || 0);
//         const orderCases = Number(item.orderCases || 0);
//         const orderWeight = Number(item.orderWeight || 0);

//         return (
//           <TouchableOpacity
//             key={item.visitId}
//             activeOpacity={0.78}
//             onPress={() => setSelectedVisit(item)}
//             style={{
//               backgroundColor: c.surface,
//               borderRadius: 14,
//               borderWidth: 1,
//               borderColor: c.border,
//               overflow: 'hidden',
//               // Left strip = status colour
//               borderLeftWidth: 3,
//               borderLeftColor: cfg.color,
//             }}
//           >
//             <View style={{ padding: 14 }}>
//               {/* Top row */}
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'flex-start',
//                   justifyContent: 'space-between',
//                 }}
//               >
//                 <View>
//                   <AppText style={{ ...T.bodyM, color: c.textPrimary }}>
//                     {fmtDate(item.checkInTime)}
//                   </AppText>
//                   <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
//                     {fmtTime(item.checkInTime)}
//                     {item.checkOutTime ? ` – ${fmtTime(item.checkOutTime)}` : ''}
//                   </AppText>
//                 </View>
//                 <View style={{ alignItems: 'flex-end', gap: 5 }}>
//                   <View
//                     style={{
//                       backgroundColor: cfg.color + '14',
//                       paddingHorizontal: 8,
//                       paddingVertical: 3,
//                       borderRadius: 20,
//                     }}
//                   >
//                     <AppText style={{ ...T.micro, color: cfg.color }}>{cfg.label}</AppText>
//                   </View>
//                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//                     <Ionicons name="time-outline" size={11} color={c.textSecondary} />
//                     <AppText style={{ ...T.micro, color: c.textSecondary, fontWeight: '500' }}>
//                       {duration}
//                     </AppText>
//                   </View>
//                 </View>
//               </View>

//               {/* Outcome summary */}
//               <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     gap: 4,
//                     backgroundColor: hasOrder ? c.success + '12' : c.background,
//                     paddingHorizontal: 8,
//                     paddingVertical: 5,
//                     borderRadius: 8,
//                     borderWidth: 1,
//                     borderColor: hasOrder ? c.success + '22' : c.border,
//                   }}
//                 >
//                   <Ionicons
//                     name={hasOrder ? 'cart' : 'cart-outline'}
//                     size={11}
//                     color={hasOrder ? c.success : c.textSecondary}
//                   />
//                   <AppText style={{ ...T.micro, color: hasOrder ? c.success : c.textSecondary }}>
//                     {hasOrder ? 'Order' : 'No order'}
//                   </AppText>
//                 </View>
//               </View>

//               {hasOrder && (
//                 <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
//                   <View
//                     style={{
//                       flex: 1,
//                       backgroundColor: c.background,
//                       borderRadius: 8,
//                       paddingHorizontal: 8,
//                       paddingVertical: 6,
//                     }}
//                   >
//                     <AppText style={{ ...T.micro, color: c.textSecondary }}>Value</AppText>
//                     <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>
//                       {fmt(orderValue)}
//                     </AppText>
//                   </View>
//                   <View
//                     style={{
//                       flex: 1,
//                       backgroundColor: c.background,
//                       borderRadius: 8,
//                       paddingHorizontal: 8,
//                       paddingVertical: 6,
//                     }}
//                   >
//                     <AppText style={{ ...T.micro, color: c.textSecondary }}>Cases</AppText>
//                     <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>
//                       {orderCases.toFixed(1)}
//                     </AppText>
//                   </View>
//                   <View
//                     style={{
//                       flex: 1,
//                       backgroundColor: c.background,
//                       borderRadius: 8,
//                       paddingHorizontal: 8,
//                       paddingVertical: 6,
//                     }}
//                   >
//                     <AppText style={{ ...T.micro, color: c.textSecondary }}>Weight</AppText>
//                     <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>
//                       {orderWeight.toFixed(2)}
//                     </AppText>
//                   </View>
//                 </View>
//               )}

//               {/* Note */}
//               {item.note && (
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'flex-start',
//                     gap: 6,
//                     marginTop: 10,
//                     paddingTop: 10,
//                     borderTopWidth: 1,
//                     borderTopColor: c.border,
//                   }}
//                 >
//                   <Ionicons
//                     name="chatbubble-outline"
//                     size={12}
//                     color={c.textSecondary}
//                     style={{ marginTop: 1 }}
//                   />
//                   <AppText style={{ ...T.label, color: c.textSecondary, flex: 1, lineHeight: 17 }}>
//                     {item.note}
//                   </AppText>
//                 </View>
//               )}

//               {/* Tap affordance */}
//               <View style={{ position: 'absolute', right: 12, bottom: 12 }}>
//                 <Ionicons name="chevron-forward" size={13} color={c.textSecondary} />
//               </View>
//             </View>
//           </TouchableOpacity>
//         );
//       })}

//       {/* Visit timeline bottom sheet */}
//       <BottomSheet
//         visible={!!selectedVisit}
//         onClose={() => setSelectedVisit(null)}
//         title={`${Number(selectedVisit?.orderCount || 0) > 0 ? 'Order' : 'No Order'} Visit`}
//         subtitle={`${fmtDate(selectedVisit?.checkInTime)} · ${selectedVisit?.outletName || ''}`}
//         colors={c}
//       >
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
//         >
//           {selectedVisit &&
//             (() => {
//               const items = [
//                 {
//                   title: 'Visit Started',
//                   sub: `Type: ${selectedVisit.visitType || 'N/A'}`,
//                   time: fmtTime(selectedVisit.checkInTime),
//                   icon: 'log-in-outline',
//                   color: c.primary,
//                 },
//                 Number(selectedVisit.orderCount || 0) > 0
//                   ? {
//                       title: 'Order Placed',
//                       sub: `${fmt(Number(selectedVisit.orderValue || 0))} value, ${Number(selectedVisit.orderCases || 0).toFixed(1)} cases`,
//                       time: fmtTime(selectedVisit.checkInTime),
//                       icon: 'cart-outline',
//                       color: c.success,
//                     }
//                   : {
//                       title: 'No Order',
//                       sub: selectedVisit.note || 'Visit without an order',
//                       time: fmtTime(selectedVisit.checkInTime),
//                       icon: 'remove-circle-outline',
//                       color: c.warning,
//                     },
//                 {
//                   title: selectedVisit.checkOutTime ? 'Visit Ended' : 'In Progress',
//                   sub: `Duration: ${getDuration(selectedVisit.checkInTime, selectedVisit.checkOutTime)}`,
//                   time: fmtTime(selectedVisit.checkOutTime),
//                   icon: selectedVisit.checkOutTime ? 'log-out-outline' : 'hourglass-outline',
//                   color: selectedVisit.checkOutTime ? c.textSecondary : c.primary,
//                 },
//               ];
//               return items.map((tl, idx) => (
//                 <View key={idx} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
//                   <View style={{ alignItems: 'center', width: 32 }}>
//                     <View
//                       style={{
//                         width: 32,
//                         height: 32,
//                         borderRadius: 16,
//                         backgroundColor: (tl.color as string) + '18',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                       }}
//                     >
//                       <Ionicons name={tl.icon as any} size={15} color={tl.color as string} />
//                     </View>
//                     {idx < items.length - 1 && (
//                       <View
//                         style={{
//                           width: 1,
//                           flex: 1,
//                           minHeight: 24,
//                           backgroundColor: c.border,
//                           marginTop: 4,
//                         }}
//                       />
//                     )}
//                   </View>
//                   <View style={{ flex: 1, paddingBottom: 16 }}>
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <AppText style={{ ...T.bodyM, color: c.textPrimary }}>{tl.title}</AppText>
//                       <AppText style={{ ...T.label, color: c.textSecondary }}>{tl.time}</AppText>
//                     </View>
//                     <AppText
//                       style={{ ...T.label, color: c.textSecondary, marginTop: 3, lineHeight: 17 }}
//                     >
//                       {tl.sub}
//                     </AppText>
//                   </View>
//                 </View>
//               ));
//             })()}
//         </ScrollView>
//       </BottomSheet>
//     </View>
//   );
// };

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  AppState,
  Modal,
  Image,
  Linking,
  Alert,
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
import { isSalesman } from '@/core/navigation/role.utils';
import { captureCurrentLocation } from '@/shared/services/location.service';

// ── Types ─────────────────────────────────────────────────────────────────────
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
  caseQty?: number;
  pieceQty?: number;
  totalValue?: number;
  casePrice?: number;
  piecePrice?: number;
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
  outletName?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  note?: string;
  visitType?: ShopVisitType;
  orderCount?: number;
  paymentCount?: number;
  orderValue?: number;
  orderCases?: number;
  orderWeight?: number;
}

type TabType = 'summary' | 'sales' | 'invoices' | 'visits';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'summary', label: 'Summary', icon: 'stats-chart-outline' },
  { key: 'sales', label: 'Sales', icon: 'receipt-outline' },
  { key: 'invoices', label: 'Invoices', icon: 'document-text-outline' },
  { key: 'visits', label: 'Visits', icon: 'time-outline' },
];

const PAGE_SIZE = 10;
const GEOFENCE_RADIUS = 100;

const resolveGeoTag = (value: any): { lat: number; lng: number } | null => {
  const latitude = Number(value?.lat ?? value?.latitude ?? value?.coordinates?.[1]);
  const longitude = Number(value?.lng ?? value?.longitude ?? value?.coordinates?.[0]);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { lat: latitude, lng: longitude }
    : null;
};

// ── Shared token map (avoids prop-drilling colors for inline styles) ───────────
const T = {
  display: { fontSize: 18, fontWeight: '700' as const },
  title: { fontSize: 15, fontWeight: '600' as const },
  section: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  value: { fontSize: 16, fontWeight: '700' as const },
  valueS: { fontSize: 14, fontWeight: '700' as const },
  body: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  bodyM: { fontSize: 13, fontWeight: '500' as const },
  label: { fontSize: 11, fontWeight: '500' as const },
  micro: { fontSize: 10, fontWeight: '600' as const },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (amount: number) =>
  `ZMW ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;

const fmtDate = (s?: string | null) => (s ? moment(s).format('DD MMM YYYY') : 'Never');
const fmtTime = (s?: string | null) => (s ? moment(s).format('hh:mm A') : '--');
const fmtDT = (s?: string | null) => (s ? moment(s).format('DD MMM YYYY, hh:mm A') : 'N/A');

const getDuration = (checkIn: string, checkOut?: string) => {
  if (!checkOut) return 'In progress';
  const d = moment.duration(moment(checkOut).diff(moment(checkIn)));
  const h = Math.floor(d.asHours()),
    m = d.minutes();
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getItemCases = (i: SaleItemDetail) => Number(i.cases ?? i.caseQty ?? 0);
const getItemPieces = (i: SaleItemDetail) => Number(i.pieces ?? i.pieceQty ?? 0);
const getItemTotal = (i: SaleItemDetail) => Number(i.total ?? i.totalValue ?? 0);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getFilterRange = (filter: string, custom: { startDate: Date; endDate: Date }) => {
  const today = startOfDay(new Date());
  if (filter === 'today') return { startDate: today, endDate: today };
  if (filter === 'week') {
    const s = new Date(today);
    s.setDate(today.getDate() - today.getDay());
    return { startDate: s, endDate: today };
  }
  if (filter === 'month')
    return { startDate: new Date(today.getFullYear(), today.getMonth(), 1), endDate: today };
  return custom;
};

// ── Shared bottom-sheet modal ─────────────────────────────────────────────────
const BottomSheet = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  colors: c,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View
        style={{
          backgroundColor: c.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '80%',
          borderTopWidth: 1,
          borderTopColor: c.border,
        }}
      >
        {/* Drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 6 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: c.border }} />
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText style={{ ...T.title, color: c.textPrimary }}>{title}</AppText>
            {subtitle ? (
              <AppText
                numberOfLines={1}
                style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}
              >
                {subtitle}
              </AppText>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: c.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
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

  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<Outlet | null>(null);
  const clearActiveVisit = useOutletStore((s) => s.clearActiveVisit);

  const [isInsideGeofenceArea, setIsInsideGeofenceArea] = useState(false);
  const [distanceToOutlet, setDistanceToOutlet] = useState<number | null>(null);
  const [isStartingSale, setIsStartingSale] = useState(false);
  const [isRecordingInteraction, setIsRecordingInteraction] = useState(false);
  const [interactionFailed, setInteractionFailed] = useState(false);
  const [interactionAttempt, setInteractionAttempt] = useState(0);

  const [sales, setSales] = useState<SaleItem[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsTotal, setVisitsTotal] = useState(0);
  const [visitsLoaded, setVisitsLoaded] = useState(false);

  const locationInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateListener = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const route = useRouteStore((s) => s.selectedRoute);
  const van = useRouteStore((s) => s.van);
  const user = useAuthStore((s) => s.user);
  const activeVisit = useOutletStore((s) => s.activeVisit);
  const activeInteraction = useOutletStore((s) => s.activeInteraction);
  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);
  const setActiveInteraction = useOutletStore((s) => s.setActiveInteraction);
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const { setSelectedOutlet } = useOutletStore();
  const { setHeader } = useHeader();
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const interactionStartedRef = useRef<string | null>(null);

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (customer) checkActiveVisit();
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

  useEffect(() => {
    const startInteraction = async () => {
      if (
        !customer?.customerId ||
        customer.status !== 'ACTIVE' ||
        !isSalesman(user) ||
        !route?.routeSessionId ||
        !route?.workSessionId ||
        !van?.vanId ||
        !resolveGeoTag(customer.geoTag) ||
        interactionStartedRef.current === customer.customerId
      ) {
        return;
      }

      if (
        activeInteraction?.customerId === customer.customerId &&
        activeInteraction.status === 'ARRIVED'
      ) {
        interactionStartedRef.current = customer.customerId;
        return;
      }

      interactionStartedRef.current = customer.customerId;
      setIsRecordingInteraction(true);
      setInteractionFailed(false);
      try {
        const customerLocation = resolveGeoTag(customer.geoTag);
        if (!customerLocation) return;

        const response = await outletService.startInteraction({
          customerId: customer.customerId,
          routeSessionId: route.routeSessionId,
          workSessionId: route.workSessionId,
          vanId: van.vanId,
          customerLocation: {
            latitude: customerLocation.lat,
            longitude: customerLocation.lng,
          },
          configuredRadiusMeters: GEOFENCE_RADIUS,
        });
        if (!response?.data?.interactionId) {
          throw new Error('Interaction API did not return an interaction ID');
        }

        setActiveInteraction({
          interactionId: response.data.interactionId,
          customerId: customer.customerId,
          arrivalTime: String(response.data.arrivalTime || new Date().toISOString()),
          visitType: response.data.visitType,
          distanceMeters: Number(response.data.distanceMeters || 0),
          status: 'ARRIVED',
        });
      } catch (error) {
        interactionStartedRef.current = null;
        setInteractionFailed(true);
        console.error('Unable to create interaction log:', error);
      } finally {
        setIsRecordingInteraction(false);
      }
    };

    void startInteraction();
  }, [
    activeInteraction,
    customer,
    interactionAttempt,
    route,
    setActiveInteraction,
    user,
    van?.vanId,
  ]);

  useEffect(() => {
    setSales([]);
    setSalesTotal(0);
    setSalesLoaded(false);
    setVisitHistory([]);
    setVisitsTotal(0);
    setVisitsLoaded(false);
  }, [customer?.customerId, van?.vanId]);

  const checkGeofenceStatus = useCallback((lat: number, lng: number) => {
    const c = customerRef.current;
    const outletLocation = resolveGeoTag(c?.geoTag);
    if (!c || !outletLocation) return;
    setDistanceToOutlet(getDistance(lat, lng, outletLocation.lat, outletLocation.lng));
    setIsInsideGeofenceArea(
      isInsideGeofence(lat, lng, {
        id: c.customerId,
        latitude: outletLocation.lat,
        longitude: outletLocation.lng,
        radius: GEOFENCE_RADIUS,
      }),
    );
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (Platform.OS === 'web' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          checkGeofenceStatus(latitude, longitude);
        },
        (e) => console.warn('Location error:', e),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
      return;
    }

    const location = await captureCurrentLocation();
    if (location) {
      checkGeofenceStatus(location.latitude, location.longitude);
    }
  }, [checkGeofenceStatus]);

  const startLocationTracking = useCallback(() => {
    if (locationInterval.current) clearInterval(locationInterval.current);

    void getCurrentLocation().catch((error) => {
      console.warn('Initial location tracking error:', error);
    });

    locationInterval.current = setInterval(() => {
      void getCurrentLocation().catch((error) => {
        console.warn('Location tracking interval error:', error);
      });
    }, 15000);
  }, [getCurrentLocation]);

  const stopLocationTracking = useCallback(() => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  }, []);

  useEffect(() => {
    if (resolveGeoTag(customer?.geoTag)) startLocationTracking();
    else stopLocationTracking();

    return () => stopLocationTracking();
  }, [customer?.geoTag, startLocationTracking, stopLocationTracking]);

  useEffect(() => {
    appStateListener.current = AppState.addEventListener('change', (state) => {
      if (state === 'active' && resolveGeoTag(customerRef.current?.geoTag)) {
        void getCurrentLocation().catch((error) => {
          console.warn('Location refresh on app active failed:', error);
        });
      }
    });

    return () => appStateListener.current?.remove();
  }, [getCurrentLocation]);

  const getVisitType = useCallback(
    (): ShopVisitType =>
      resolveGeoTag(customer?.geoTag) && isInsideGeofenceArea
        ? ShopVisitType.ON_SITE
        : ShopVisitType.OFF_SITE,
    [customer?.geoTag, isInsideGeofenceArea],
  );

  const checkActiveVisit = async () => {
    if (!customer?.customerId) return;
    try {
      const query: any = {
        workSessionId: selectedRoute?.workSessionId,
        vanId: van?.vanId,
        routeSessionId: selectedRoute?.routeSessionId,
        outletId: customer.customerId,
      };
      const visit: any = (await outletService.visitStatus(query))?.data;
      if (visit?.visitId && visit?.status === 'ACTIVE') {
        setActiveVisit({
          visitId: visit.visitId,
          outlet: customer as any,
          checkInTime: new Date(visit.checkInTime),
          checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
          status: visit.status,
          routeSessionId: visit?.routeSessionId,
          customerId: visit?.customerId,
          visitType: getVisitType(),
        });
      } else if (!visit?.visitId) clearActiveVisit();
    } catch (e) {
      console.error('checkActiveVisit error:', e);
    }
  };

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const detailResponse = await outletService.getOutletDetail(id);
      const detail = detailResponse?.data;

      if (detail) {
        const fallbackGeoTag =
          selectedOutlet?.customerId === id ? resolveGeoTag(selectedOutlet.geoTag) : null;
        const outlet = {
          ...detail,
          geoTag: resolveGeoTag(detail.geoTag) ?? fallbackGeoTag ?? detail.geoTag,
          images: selectedOutlet?.customerId === id ? selectedOutlet.images || [] : [],
        };
        setCustomer(outlet);
        setSelectedOutlet(outlet);

        // Media is decorative and must not delay rendering, GPS, or interaction creation.
        void outletService
          .getOutletMedia(id)
          .then((mediaResponse) => {
            const images = Array.isArray(mediaResponse?.data)
              ? mediaResponse.data.filter((item: any) => item?.url)
              : [];
            setCustomer((current) => {
              if (!current || current.customerId !== outlet.customerId) return current;
              return { ...current, images } as Outlet;
            });
          })
          .catch((error) => console.warn('Failed to load outlet media:', error));
      } else setCustomer(null);
    } catch (error) {
      console.error('Failed to load outlet details:', error);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSalesHistory = async () => {
    if (!customer?.customerId) return;
    setSalesLoading(true);
    try {
      const res: any = await saleService.fetchSales({
        page: 1,
        limit: PAGE_SIZE,
        customerId: customer.customerId,
        vanId: van?.vanId,
        employeeId: user?.userId,
      });
      const data = res?.data || [];
      setSales(data);
      setSalesTotal(res?.meta?.total || res?.total || data.length);
    } catch (e) {
      console.error('Failed to load sales:', e);
    } finally {
      setSalesLoaded(true);
      setSalesLoading(false);
    }
  };

  const loadVisitHistory = async () => {
    if (!customer?.customerId) return;
    setVisitsLoading(true);
    try {
      const res = await outletService.getVisitHistory({
        outletId: customer.customerId,
        limit: 10,
        page: 1,
        vanId: van?.vanId,
      });
      const visits = res?.data || [];
      setVisitHistory(visits);
      setVisitsTotal((res as any)?.meta?.total || (res as any)?.total || 0);
    } catch (e) {
      console.error('Failed to load visits:', e);
    } finally {
      setVisitsLoaded(true);
      setVisitsLoading(false);
    }
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

  const handleStartSale = useCallback(async () => {
    if (!customer || isStartingSale || isRecordingInteraction) return;

    if (!isSalesman(user)) {
      Alert.alert('Not allowed', 'Only a salesman can start a visit.');
      return;
    }

    if (activeVisit?.customerId === customer.customerId) {
      router.push('/checkin');
      return;
    }

    if (!resolveGeoTag(customer.geoTag)) {
      Alert.alert(
        'Outlet location missing',
        'This outlet does not have a valid geotag. Update the outlet location before starting a sale.',
      );
      return;
    }

    if (
      !activeInteraction ||
      activeInteraction.customerId !== customer.customerId ||
      activeInteraction.status !== 'ARRIVED'
    ) {
      interactionStartedRef.current = null;
      setInteractionAttempt((attempt) => attempt + 1);
      return;
    }
    router.push('/checkin');
  }, [activeVisit, activeInteraction, customer, isRecordingInteraction, isStartingSale, user]);

  if (isLoading) return <LoadingState />;
  if (!customer) return <EmptyState colors={colors} />;

  const lastOrderDate =
    customer?.summary?.lastOrderDate || (sales.length > 0 ? sales[0]?.date : null);
  const lastVisitDate = customer?.summary?.lastVisitDate || customer?.lastVisitedAt;
  const hasActiveVisit = activeVisit && activeVisit?.customerId === customer.customerId;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <CustomerHeader customer={customer} colors={colors} />

        {/* Last visit / last order */}
        <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {(
              [
                { icon: 'time-outline', label: 'Last Visit', value: fmtDate(lastVisitDate) },
                { icon: 'cart-outline', label: 'Last Order', value: fmtDate(lastOrderDate) },
              ] as const
            ).map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && (
                  <View
                    style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 12 }}
                  />
                )}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: colors.primary + '12',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name={item.icon as any} size={14} color={colors.primary} />
                  </View>
                  <View>
                    <AppText style={{ ...T.label, color: colors.textSecondary }}>
                      {item.label}
                    </AppText>
                    <AppText style={{ ...T.bodyM, color: colors.textPrimary, marginTop: 1 }}>
                      {item.value}
                    </AppText>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Dev geofence pill */}
        {__DEV__ && distanceToOutlet !== null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: isInsideGeofenceArea ? colors.success : colors.warning,
              marginHorizontal: 16,
              marginBottom: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Ionicons
              name={isInsideGeofenceArea ? 'checkmark-circle-outline' : 'radio-outline'}
              size={13}
              color={colors.primaryContrast}
            />
            <AppText style={{ ...T.label, color: colors.primaryContrast }}>
              {isInsideGeofenceArea ? 'Inside' : 'Outside'} geofence ·{' '}
              {Math.round(distanceToOutlet)}m / {GEOFENCE_RADIUS}m
            </AppText>
          </View>
        )}

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}>
          {activeTab === 'summary' && <SummaryTab customer={customer} colors={colors} />}
          {activeTab === 'sales' && (
            <SalesTab colors={colors} customerId={customer?.customerId} van={van} />
          )}
          {activeTab === 'invoices' && (
            <InvoicesTab
              invoices={sales}
              loading={salesLoading || !salesLoaded}
              total={salesTotal}
              colors={colors}
            />
          )}
          {activeTab === 'visits' && (
            <VisitsTab
              visits={visitHistory}
              loading={visitsLoading || !visitsLoaded}
              total={visitsTotal}
              colors={colors}
            />
          )}
        </View>
      </ScrollView>

      {/* Only salesmen can start or continue a sale visit. */}
      {isSalesman(user) && (
        <SafeAreaView
          edges={['bottom']}
          style={{
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {isStartingSale ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText style={{ ...T.bodyM, color: colors.primary }}>Starting sale…</AppText>
            </View>
          ) : (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <TouchableOpacity
                onPress={handleStartSale}
                disabled={isRecordingInteraction}
                activeOpacity={0.85}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 14,
                  padding: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 7,
                  opacity: isRecordingInteraction ? 0.72 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="cart-outline" size={20} color={colors.primaryContrast} />
                  </View>
                  <View>
                    <AppText
                      style={{ color: colors.primaryContrast, fontSize: 15, fontWeight: '700' }}
                    >
                      {isRecordingInteraction
                        ? 'Recording arrival…'
                        : interactionFailed
                          ? 'Retry arrival'
                          : 'Start Sale'}
                    </AppText>
                    <AppText
                      style={{ color: colors.primaryContrast + 'B8', fontSize: 11, marginTop: 1 }}
                    >
                      {isRecordingInteraction
                        ? 'Please wait a moment'
                        : interactionFailed
                          ? 'Tap to try GPS again'
                          : hasActiveVisit
                            ? 'Visit active'
                            : 'Tap to start'}
                    </AppText>
                  </View>
                </View>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="arrow-forward" size={17} color={colors.primaryContrast} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </SafeAreaView>
      )}
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
            {[1, 2].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: '#FFF',
                  borderRadius: 12,
                  padding: 14,
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <Skeleton height={22} width={22} variant="circle" />
                <Skeleton height={20} width="72%" borderRadius={8} />
                <Skeleton height={11} width="80%" borderRadius={6} />
              </View>
            ))}
          </View>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={40} width="100%" borderRadius={8} />
          ))}
        </View>
      </View>
    </ScrollView>
  </View>
);

const DetailListSkeleton = ({ rows = 3 }: { rows?: number }) => {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{ backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' }}
        >
          <View style={{ height: 3, backgroundColor: colors.divider }} />
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
              {[1, 2, 3].map((j) => (
                <View
                  key={j}
                  style={{
                    flex: 1,
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: 8,
                    padding: 8,
                    gap: 5,
                  }}
                >
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
};

const EmptyState = ({ colors }: { colors: any }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
    <Ionicons name="alert-circle-outline" size={60} color={colors.textTertiary} />
    <AppText
      style={{
        ...T.title,
        color: colors.textPrimary,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
      }}
    >
      Customer not found
    </AppText>
    <AppText
      style={{ ...T.body, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}
    >
      This customer doesn't exist or was removed.
    </AppText>
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 10,
      }}
    >
      <AppText style={{ color: colors.primaryContrast, fontWeight: '600', fontSize: 13 }}>
        Go back
      </AppText>
    </TouchableOpacity>
  </View>
);

// ── Customer Header ────────────────────────────────────────────────────────────
const CustomerHeader = ({ customer, colors: c }: any) => (
  <Animated.View
    entering={FadeInDown.duration(300)}
    style={{ paddingHorizontal: 16, paddingTop: 12 }}
  >
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: c.primary + '12',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <OutletAvatar outlet={customer} />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 3,
            }}
          >
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
              { icon: 'call-outline', text: customer.phoneNumber || 'No phone' },
            ].map((chip) => (
              <View
                key={chip.icon}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: c.primary + '0D',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: c.primary + '1E',
                }}
              >
                <Ionicons name={chip.icon as any} size={11} color={c.primary} />
                <AppText style={{ ...T.micro, color: c.primary }}>{chip.text}</AppText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: c.border,
        }}
      >
        <Ionicons name="location-outline" size={14} color={c.primary} />
        <AppText numberOfLines={2} style={{ ...T.body, color: c.textSecondary, flex: 1 }}>
          {customer.address?.line1 || customer.address || 'Address not available'}
        </AppText>
      </View>
    </View>
  </Animated.View>
);

// ── Tab bar ────────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, setActiveTab, colors: c }: any) => (
  <View
    style={{
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      marginTop: 8,
    }}
  >
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderBottomWidth: 2,
              borderBottomColor: active ? c.primary : 'transparent',
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={14}
              color={active ? c.primary : c.textSecondary}
            />
            <AppText
              style={{
                fontSize: 12,
                fontWeight: active ? '700' : '500',
                color: active ? c.primary : c.textSecondary,
              }}
            >
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
  const summary = customer?.summary || {};
  const mtdValue = summary.mtd?.orderValue || 0;
  const mtdQty = summary.mtd?.orderQuantity || 0;
  const mtdCount = summary.mtd?.orderCount || 0;
  const avgValue = summary.mtd?.avgOrderValue || 0;
  const avgQty = summary.mtd?.avgOrderQuantity || 0;
  const avgLPC = summary.mtd?.avgLPC || 0;
  const recentOrders = summary.mtd?.orders || [];
  const lpcRating =
    avgLPC > 10
      ? { label: 'Good', color: c.success }
      : avgLPC > 5
        ? { label: 'Average', color: c.warning }
        : { label: 'Low', color: c.error };
  const images = Array.isArray(customer?.images) ? customer.images : [];
  const latitude = Number(customer?.geoTag?.lat);
  const longitude = Number(customer?.geoTag?.lng);
  const hasGeoTag = Number.isFinite(latitude) && Number.isFinite(longitude);
  const outletTags = Array.isArray(customer?.tags) ? customer.tags.filter(Boolean) : [];

  const openOutletMap = async () => {
    const label = [customer?.name, ...outletTags].filter(Boolean).join(' · ');
    const encodedLabel = encodeURIComponent(label || 'Outlet');
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${encodedLabel}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Map unavailable', 'Unable to open this outlet location.');
    }
  };

  return (
    <View style={{ gap: 12 }}>
      {images.length > 0 && (
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              marginBottom: 10,
            }}
          >
            <AppText style={{ ...T.title, color: c.textPrimary }}>Outlet photos</AppText>
            <AppText style={{ ...T.label, color: c.textSecondary }}>{images.length}</AppText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}
          >
            {images.map((image: any, index: number) => {
              const uri = image.urls?.medium || image.urls?.small || image.url;
              return (
                <Image
                  key={image.mediaId || `${uri}-${index}`}
                  source={{ uri }}
                  accessibilityLabel={image.altText || image.title || `Outlet photo ${index + 1}`}
                  resizeMode="cover"
                  style={{
                    width: 180,
                    height: 120,
                    borderRadius: 12,
                    backgroundColor: c.background,
                  }}
                />
              );
            })}
          </ScrollView>
        </View>
      )}

      {hasGeoTag && (
        <TouchableOpacity
          onPress={openOutletMap}
          activeOpacity={0.75}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: c.surface,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: c.primary + '14',
            }}
          >
            <Ionicons name="map-outline" size={21} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ ...T.bodyM, color: c.textPrimary }}>View geotag on map</AppText>
            <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 3 }}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </AppText>
            {outletTags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
                {outletTags.map((tag: string) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: c.primary + '10',
                      borderRadius: 10,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                    }}
                  >
                    <AppText style={{ ...T.micro, color: c.primary }}>{tag}</AppText>
                  </View>
                ))}
              </View>
            )}
          </View>
          <Ionicons name="open-outline" size={17} color={c.primary} />
        </TouchableOpacity>
      )}

      {/* MTD card */}
      <View
        style={{
          backgroundColor: c.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: c.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <View
            style={{
              backgroundColor: c.primary + '12',
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <AppText style={{ ...T.section, color: c.primary }}>MTD</AppText>
          </View>
          <AppText style={{ ...T.label, color: c.textSecondary }}>Month-to-date summary</AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            {
              icon: 'bar-chart-outline',
              color: c.success,
              value: fmt(mtdValue),
              label: 'Order Value',
              sub: `${mtdCount} order${mtdCount !== 1 ? 's' : ''}`,
            },
            {
              icon: 'cube-outline',
              color: c.info,
              value: mtdQty.toFixed(1),
              label: 'Cases',
              sub: null,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: c.background,
                borderRadius: 12,
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: s.color,
              }}
            >
              <Ionicons
                name={s.icon as any}
                size={18}
                color={s.color}
                style={{ marginBottom: 8 }}
              />
              <AppText style={{ ...T.value, color: c.textPrimary }}>{s.value}</AppText>
              <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 3 }}>
                {s.label}
              </AppText>
              {s.sub && (
                <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
                  {s.sub}
                </AppText>
              )}
            </View>
          ))}
        </View>

        {/* Divider + averages */}
        <View style={{ height: 1, backgroundColor: c.border, marginVertical: 14 }} />
        {/* <AppText style={{ ...T.label, color: c.textSecondary, marginBottom: 10 }}>
          Last {recentOrders.length || 5} orders — averages
        </AppText> */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { icon: 'cash-outline', color: c.warning, value: fmt(avgValue), label: 'Avg Value' },
            {
              icon: 'layers-outline',
              color: c.warning,
              value: avgQty.toFixed(1),
              label: 'Avg Qty',
            },
            {
              icon: 'pricetag-outline',
              color: lpcRating.color,
              value: avgLPC.toFixed(2),
              label: 'LPC',
            },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: c.background,
                borderRadius: 10,
                padding: 10,
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Ionicons name={s.icon as any} size={15} color={s.color} />
              <AppText style={{ ...T.valueS, color: c.textPrimary, textAlign: 'center' }}>
                {s.value}
              </AppText>
              <AppText style={{ ...T.micro, color: c.textSecondary, textAlign: 'center' }}>
                {s.label}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* LPC insight pill */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: lpcRating.color + '0E',
          borderWidth: 1,
          borderColor: lpcRating.color + '22',
          borderRadius: 12,
          padding: 12,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: lpcRating.color + '1A',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name={
              lpcRating.label === 'Good'
                ? 'trending-up'
                : lpcRating.label === 'Average'
                  ? 'remove-outline'
                  : 'trending-down'
            }
            size={15}
            color={lpcRating.color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ ...T.bodyM, color: c.textPrimary }}>
            Lines Per Call: {avgLPC.toFixed(2)} —{' '}
            <AppText style={{ color: lpcRating.color, fontWeight: '700' }}>
              {lpcRating.label}
            </AppText>
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
    saleService
      .getCategoryWiseSales({ outletId: customerId, vanId: van?.vanId })
      .then((r) => {
        if (r.statusCode === 200 && r.data) setCategorySales(r.data);
      })
      .catch((e) => console.error('Category sales error:', e))
      .finally(() => setLoading(false));
  }, [van?.vanId, customerId]);

  const categories = [...new Set(categorySales.map((i) => i.categoryName))];
  const months = [
    ...new Map(
      categorySales.map((i) => [i.month, { short: i.month, key: `${i.year}-${i.monthNumber}` }]),
    ).values(),
  ];
  const getCellData = (cat: string, month: string) =>
    categorySales.find((i) => i.categoryName === cat && i.month === month);
  const getValue = (cat: string, month: string) => getCellData(cat, month)?.totalQtyInCases || 0;

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

  if (!loading && categorySales.length === 0)
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
        <Ionicons name="receipt-outline" size={48} color={c.textTertiary} />
        <AppText style={{ ...T.title, color: c.textPrimary }}>No Sales Data</AppText>
        <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>
          No category sales found for this customer
        </AppText>
      </View>
    );

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.border,
        overflow: 'hidden',
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: c.background,
              borderBottomWidth: 1,
              borderBottomColor: c.border,
            }}
          >
            <View style={{ width: 120, padding: 10 }}>
              <AppText style={{ ...T.section, color: c.textSecondary }}>CATEGORY</AppText>
            </View>
            {months.map((m) => (
              <View
                key={m.key}
                style={{
                  width: 70,
                  padding: 10,
                  borderLeftWidth: 1,
                  borderLeftColor: c.border,
                  alignItems: 'center',
                }}
              >
                <AppText style={{ ...T.section, color: c.textSecondary }}>
                  {m.short.toUpperCase()}
                </AppText>
              </View>
            ))}
            <View
              style={{
                width: 80,
                padding: 10,
                borderLeftWidth: 1,
                borderLeftColor: c.border,
                alignItems: 'center',
                backgroundColor: c.background,
              }}
            >
              <AppText style={{ ...T.section, color: c.textSecondary }}>TOTAL</AppText>
            </View>
          </View>

          {/* Rows — alternating background */}
          {categories.map((cat, catIdx) => {
            const total = months.reduce((s, m) => s + getValue(cat, m.short), 0);
            const isEven = catIdx % 2 === 0;
            return (
              <View
                key={cat}
                style={{
                  flexDirection: 'row',
                  backgroundColor: isEven ? c.surface : c.background,
                  borderBottomWidth: catIdx < categories.length - 1 ? 1 : 0,
                  borderBottomColor: c.border,
                }}
              >
                <View style={{ width: 120, padding: 12, justifyContent: 'center' }}>
                  <AppText style={{ ...T.bodyM, color: c.textPrimary }} numberOfLines={2}>
                    {cat}
                  </AppText>
                  <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
                    Cases
                  </AppText>
                </View>
                {months.map((m) => {
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
                        width: 70,
                        borderLeftWidth: 1,
                        borderLeftColor: c.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppText
                        style={{
                          fontSize: 13,
                          textAlign: 'center',
                          fontWeight: val > 0 ? '700' : '400',
                          color: val > 0 ? c.success : c.textSecondary,
                        }}
                      >
                        {val}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
                <View
                  style={{
                    width: 80,
                    borderLeftWidth: 1,
                    borderLeftColor: c.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: c.background,
                  }}
                >
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
            {
              label: 'Cases',
              value: Number(selectedCell?.totalQtyInCases || 0).toFixed(3),
              icon: 'cube-outline',
              color: c.success,
            },
            {
              label: 'Value',
              value: fmt(Number(selectedCell?.totalValue || 0)),
              icon: 'cash-outline',
              color: c.primary,
            },
            {
              label: 'Weight',
              value: Number(selectedCell?.totalWeight || 0).toFixed(2),
              icon: 'scale-outline',
              color: c.warning,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: s.color + '10',
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: s.color + '24',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Ionicons name={s.icon as any} size={12} color={s.color} />
                <AppText style={{ ...T.micro, color: c.textSecondary }}>{s.label}</AppText>
              </View>
              <AppText numberOfLines={1} style={{ ...T.valueS, color: c.textPrimary }}>
                {s.value}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: c.border }} />

        <ScrollView
          style={{ maxHeight: 360 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {detailLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <ActivityIndicator size="small" color={c.primary} />
              <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 10 }}>
                Loading products...
              </AppText>
            </View>
          ) : (selectedCell?.products || []).length ? (
            selectedCell.products.map((product: any, index: number) => (
              <View
                key={`${product.productId || product.productName || 'product'}-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginTop: 10,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: index % 2 === 0 ? c.surface : c.background,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: c.success + '12',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="cube-outline" size={17} color={c.success} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText
                    numberOfLines={2}
                    style={{ ...T.bodyM, color: c.textPrimary, lineHeight: 18 }}
                  >
                    {product.productName || 'Product'}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                    <View
                      style={{
                        backgroundColor: c.success + '12',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 7,
                      }}
                    >
                      <AppText style={{ ...T.micro, color: c.success }}>
                        {Number(product.cases || 0).toFixed(1)} C
                      </AppText>
                    </View>
                    <View
                      style={{
                        backgroundColor: c.info + '12',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 7,
                      }}
                    >
                      <AppText style={{ ...T.micro, color: c.info }}>
                        {Number(product.pieces || 0)} P
                      </AppText>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', maxWidth: 112 }}>
                  <AppText numberOfLines={1} style={{ ...T.valueS, color: c.primary }}>
                    {fmt(Number(product.value || 0))}
                  </AppText>
                  <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
                    {Number(product.weight || 0).toFixed(2)} wt
                  </AppText>
                </View>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Ionicons name="cube-outline" size={36} color={c.textTertiary} />
              <AppText style={{ ...T.bodyM, color: c.textPrimary, marginTop: 10 }}>
                No products
              </AppText>
              <AppText
                style={{ ...T.label, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}
              >
                No product sales found for this month
              </AppText>
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

  const paymentConfig = (status: string) =>
    ({
      PAID: { color: c.success, icon: 'checkmark-circle-outline' as const },
      PARTIAL: { color: c.warning, icon: 'time-outline' as const },
      OVERDUE: { color: c.error, icon: 'alert-circle-outline' as const },
      UNPAID: { color: c.textSecondary, icon: 'ellipse-outline' as const },
    })[status?.toUpperCase()] ?? { color: c.textSecondary, icon: 'ellipse-outline' as const };

  if (loading && invoices.length === 0) return <DetailListSkeleton rows={3} />;

  if (!loading && invoices.length === 0)
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
        <Ionicons name="document-text-outline" size={48} color={c.textTertiary} />
        <AppText style={{ ...T.title, color: c.textPrimary }}>No Invoices</AppText>
        <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>
          No invoices found for this customer
        </AppText>
      </View>
    );

  return (
    <View style={{ gap: 10 }}>
      {invoices.length > 0 && (
        <View style={{ marginBottom: 4 }}>
          <AppText style={{ ...T.title, color: c.textPrimary }}>
            Last {Math.min(invoices.length, PAGE_SIZE)}{' '}
            {invoices.length === 1 ? 'Invoice' : 'Invoices'}
          </AppText>
          {total > PAGE_SIZE && (
            <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
              Showing last {PAGE_SIZE} of {total}
            </AppText>
          )}
        </View>
      )}

      {invoices.map((inv: SaleItem) => {
        const cfg = paymentConfig(inv.paymentStatus);
        return (
          <TouchableOpacity
            key={inv.saleId}
            activeOpacity={0.78}
            onPress={() => setSelectedInvoice(inv)}
            style={{
              backgroundColor: c.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
            }}
          >
            {/* Status strip at top */}
            <View style={{ height: 3, backgroundColor: cfg.color }} />
            <View style={{ padding: 14 }}>
              {/* Date + amount */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View>
                  <AppText style={{ ...T.label, color: c.textSecondary }}>
                    {fmtDate(inv.date)}
                  </AppText>
                  <AppText
                    numberOfLines={1}
                    style={{ ...T.bodyM, color: c.textPrimary, marginTop: 3, maxWidth: 180 }}
                  >
                    {inv.saleId || 'N/A'}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText style={{ ...T.value, color: c.primary }}>
                    {fmt(inv.totalValue || 0)}
                  </AppText>
                  <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
                    invoice total
                  </AppText>
                </View>
              </View>

              {/* Pills */}
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 12 }}>
                {[
                  { label: 'Type', value: inv.type || 'N/A' },
                  { label: 'Cases', value: String(inv.totalCases || 0) },
                  { label: 'Pieces', value: String(inv.totalPieces || 0) },
                  {
                    label: 'Paid',
                    value: inv.paymentStatus || 'N/A',
                    color: cfg.color,
                    icon: cfg.icon,
                  },
                ].map((d) => (
                  <View
                    key={d.label}
                    style={{
                      flex: 1,
                      backgroundColor: c.background,
                      borderRadius: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                    }}
                  >
                    <AppText style={{ ...T.micro, color: c.textSecondary, marginBottom: 3 }}>
                      {d.label}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      {'icon' in d && d.icon ? (
                        <Ionicons name={d.icon as any} size={11} color={d.color as string} />
                      ) : null}
                      <AppText
                        numberOfLines={1}
                        style={{
                          ...T.bodyM,
                          color: ('color' in d && d.color ? d.color : c.textPrimary) as string,
                        }}
                      >
                        {d.value}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>

              {/* Pending */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                {inv.pendingAmount > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="alert-circle-outline" size={12} color={c.warning} />
                    <AppText style={{ ...T.label, color: c.warning }}>
                      Pending {fmt(inv.pendingAmount)}
                    </AppText>
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
            {
              label: 'Cases',
              value: String(selectedInvoice?.totalCases || 0),
              icon: 'cube-outline',
              color: c.info || c.primary,
            },
            {
              label: 'Pieces',
              value: String(selectedInvoice?.totalPieces || 0),
              icon: 'layers-outline',
              color: c.warning,
            },
            {
              label: 'Amount',
              value: fmt(selectedInvoice?.totalValue || 0),
              icon: 'cash-outline',
              color: c.success,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: s.color + '10',
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: s.color + '24',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Ionicons name={s.icon as any} size={12} color={s.color} />
                <AppText style={{ ...T.micro, color: c.textSecondary }}>{s.label}</AppText>
              </View>
              <AppText numberOfLines={1} style={{ ...T.valueS, color: c.textPrimary }}>
                {s.value}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: c.border }} />

        <ScrollView
          style={{ maxHeight: 340 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        >
          {selectedInvoice?.items?.length ? (
            selectedInvoice.items.map((item, i) => (
              <View
                key={`${item.productId || item.productName}-${i}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  padding: 12,
                  gap: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: i % 2 === 0 ? c.surface : c.background,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: c.primary + '12',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="cube-outline" size={17} color={c.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText
                    numberOfLines={2}
                    style={{ ...T.bodyM, color: c.textPrimary, lineHeight: 18 }}
                  >
                    {item.productName || 'Product'}
                  </AppText>
                  <AppText
                    numberOfLines={1}
                    style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}
                  >
                    {item.productCategory || item.category || 'Uncategorized'}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 7 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                        backgroundColor: c.success + '12',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 7,
                      }}
                    >
                      <Ionicons name="albums-outline" size={10} color={c.success} />
                      <AppText style={{ ...T.micro, color: c.success }}>
                        {getItemCases(item)} C
                      </AppText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 3,
                        backgroundColor: c.info + '12',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 7,
                      }}
                    >
                      <Ionicons name="layers-outline" size={10} color={c.info} />
                      <AppText style={{ ...T.micro, color: c.info }}>
                        {getItemPieces(item)} P
                      </AppText>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', flexShrink: 0, maxWidth: 110 }}>
                  <AppText numberOfLines={1} style={{ ...T.valueS, color: c.primary }}>
                    {fmt(getItemTotal(item))}
                  </AppText>
                  <AppText style={{ ...T.micro, color: c.textSecondary, marginTop: 2 }}>
                    line total
                  </AppText>
                </View>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Ionicons name="cube-outline" size={36} color={c.textTertiary} />
              <AppText style={{ ...T.bodyM, color: c.textPrimary, marginTop: 10 }}>
                No product details
              </AppText>
              <AppText
                style={{ ...T.label, color: c.textSecondary, marginTop: 4, textAlign: 'center' }}
              >
                Product line items are not available for this invoice
              </AppText>
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

  const statusConfig = (status: string) =>
    ({
      COMPLETED: { color: c.success, label: 'Completed' },
      ACTIVE: { color: c.primary, label: 'Active' },
    })[status?.toUpperCase()] ?? { color: c.warning, label: status };

  if (loading && visits.length === 0) return <DetailListSkeleton rows={3} />;

  if (!loading && visits.length === 0)
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
        <Ionicons name="time-outline" size={48} color={c.textTertiary} />
        <AppText style={{ ...T.title, color: c.textPrimary }}>No visits yet</AppText>
        <AppText style={{ ...T.body, color: c.textSecondary, textAlign: 'center' }}>
          No visit history found for this customer
        </AppText>
      </View>
    );

  return (
    <View style={{ gap: 10 }}>
      {visits.length > 0 && (
        <View style={{ marginBottom: 4 }}>
          <AppText style={{ ...T.title, color: c.textPrimary }}>
            Last {Math.min(visits.length, 10)} Visits
          </AppText>
          {total > 10 && (
            <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
              Showing last 10 of {total}
            </AppText>
          )}
        </View>
      )}

      {visits.map((item: VisitHistory) => {
        const cfg = statusConfig(item.status);
        const duration = getDuration(item.checkInTime, item.checkOutTime);
        const orderCount = Number(item.orderCount || 0);
        const hasOrder = orderCount > 0;
        const orderValue = Number(item.orderValue || 0);
        const orderCases = Number(item.orderCases || 0);
        const orderWeight = Number(item.orderWeight || 0);

        return (
          <TouchableOpacity
            key={item.visitId}
            activeOpacity={0.78}
            onPress={() => setSelectedVisit(item)}
            style={{
              backgroundColor: c.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: c.border,
              overflow: 'hidden',
              // Left strip = status colour
              borderLeftWidth: 3,
              borderLeftColor: cfg.color,
            }}
          >
            <View style={{ padding: 14 }}>
              {/* Top row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <AppText style={{ ...T.bodyM, color: c.textPrimary }}>
                    {fmtDate(item.checkInTime)}
                  </AppText>
                  <AppText style={{ ...T.label, color: c.textSecondary, marginTop: 2 }}>
                    {fmtTime(item.checkInTime)}
                    {item.checkOutTime ? ` – ${fmtTime(item.checkOutTime)}` : ''}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <View
                    style={{
                      backgroundColor: cfg.color + '14',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 20,
                    }}
                  >
                    <AppText style={{ ...T.micro, color: cfg.color }}>{cfg.label}</AppText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time-outline" size={11} color={c.textSecondary} />
                    <AppText style={{ ...T.micro, color: c.textSecondary, fontWeight: '500' }}>
                      {duration}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Outcome summary */}
              <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: hasOrder ? c.success + '12' : c.background,
                    paddingHorizontal: 8,
                    paddingVertical: 5,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasOrder ? c.success + '22' : c.border,
                  }}
                >
                  <Ionicons
                    name={hasOrder ? 'cart' : 'cart-outline'}
                    size={11}
                    color={hasOrder ? c.success : c.textSecondary}
                  />
                  <AppText style={{ ...T.micro, color: hasOrder ? c.success : c.textSecondary }}>
                    {hasOrder ? 'Order' : 'No order'}
                  </AppText>
                </View>
              </View>

              {hasOrder && (
                <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: c.background,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                    }}
                  >
                    <AppText style={{ ...T.micro, color: c.textSecondary }}>Value</AppText>
                    <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>
                      {fmt(orderValue)}
                    </AppText>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: c.background,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                    }}
                  >
                    <AppText style={{ ...T.micro, color: c.textSecondary }}>Cases</AppText>
                    <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>
                      {orderCases.toFixed(1)}
                    </AppText>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: c.background,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                    }}
                  >
                    <AppText style={{ ...T.micro, color: c.textSecondary }}>Weight</AppText>
                    <AppText numberOfLines={1} style={{ ...T.bodyM, color: c.textPrimary }}>
                      {orderWeight.toFixed(2)}
                    </AppText>
                  </View>
                </View>
              )}

              {/* Note */}
              {item.note && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 6,
                    marginTop: 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: c.border,
                  }}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={12}
                    color={c.textSecondary}
                    style={{ marginTop: 1 }}
                  />
                  <AppText style={{ ...T.label, color: c.textSecondary, flex: 1, lineHeight: 17 }}>
                    {item.note}
                  </AppText>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
        >
          {selectedVisit &&
            (() => {
              const items = [
                {
                  title: 'Visit Started',
                  sub: `Type: ${selectedVisit.visitType || 'N/A'}`,
                  time: fmtTime(selectedVisit.checkInTime),
                  icon: 'log-in-outline',
                  color: c.primary,
                },
                Number(selectedVisit.orderCount || 0) > 0
                  ? {
                      title: 'Order Placed',
                      sub: `${fmt(Number(selectedVisit.orderValue || 0))} value, ${Number(selectedVisit.orderCases || 0).toFixed(1)} cases`,
                      time: fmtTime(selectedVisit.checkInTime),
                      icon: 'cart-outline',
                      color: c.success,
                    }
                  : {
                      title: 'No Order',
                      sub: selectedVisit.note || 'Visit without an order',
                      time: fmtTime(selectedVisit.checkInTime),
                      icon: 'remove-circle-outline',
                      color: c.warning,
                    },
                {
                  title: selectedVisit.checkOutTime ? 'Visit Ended' : 'In Progress',
                  sub: `Duration: ${getDuration(selectedVisit.checkInTime, selectedVisit.checkOutTime)}`,
                  time: fmtTime(selectedVisit.checkOutTime),
                  icon: selectedVisit.checkOutTime ? 'log-out-outline' : 'hourglass-outline',
                  color: selectedVisit.checkOutTime ? c.textSecondary : c.primary,
                },
              ];
              return items.map((tl, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <View style={{ alignItems: 'center', width: 32 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: (tl.color as string) + '18',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={tl.icon as any} size={15} color={tl.color as string} />
                    </View>
                    {idx < items.length - 1 && (
                      <View
                        style={{
                          width: 1,
                          flex: 1,
                          minHeight: 24,
                          backgroundColor: c.border,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <AppText style={{ ...T.bodyM, color: c.textPrimary }}>{tl.title}</AppText>
                      <AppText style={{ ...T.label, color: c.textSecondary }}>{tl.time}</AppText>
                    </View>
                    <AppText
                      style={{ ...T.label, color: c.textSecondary, marginTop: 3, lineHeight: 17 }}
                    >
                      {tl.sub}
                    </AppText>
                  </View>
                </View>
              ));
            })()}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};
