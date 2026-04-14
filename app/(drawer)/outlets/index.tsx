// // app/(drawer)/beats.tsx - Enhanced SFA Sales Executive Active Routes
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
//   SafeAreaView,
//   Modal,
//   Alert,
//   Platform,
//   Animated,
//   TouchableWithoutFeedback,
//   LayoutAnimation,
//   UIManager,
//   ViewStyle,
//   TextStyle,
//   Linking,
// } from 'react-native';
// import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { createStyles } from '@/shared/theme/styles';
// import { AppButton, AppModal } from '@/core/components';
// import { outletService } from '@/features/outlet/services/outlet.service';
// import { router, useFocusEffect } from 'expo-router';
// import { useRouteStore } from '@/core/store/route.store';

// const { width, height } = Dimensions.get('window');

// // ============= CONSTANTS =============
// const CURRENCY = {
//   code: 'ZMW',
//   symbol: 'K',
//   name: 'Zambian Kwacha',
// };

// // ============= UTILITY FUNCTIONS =============
// const formatCurrency = (amount: number): string => {
//   return `${CURRENCY.symbol} ${amount.toLocaleString()}`;
// };

// const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// // Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// // ============= TYPE DEFINITIONS =============
// interface GeoTag {
//   lat: number;
//   lng: number;
// }

// interface Address {
//   line1: string;
//   line2: string;
//   _id: string;
//   isDeleted: boolean;
// }

// interface Outlet {
//   _id: string;
//   customerId: string;
//   name: string;
//   ownerName: string;
//   phoneNumber: string;
//   address: Address;
//   geoTag: GeoTag;
//   segmentation: string;
//   status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
//   lastVisitedAt: string;
//   sequence: number;
//   visitStatus?: 'ACTIVE' | 'COMPLETED';
//   orderValue?: number;
//   priority?: 'high' | 'medium' | 'low';
//   distance?: number;
// }

// let MapView: any = null;
// let Marker: any = null;
// let Polyline: any = null;
// let PROVIDER_GOOGLE: any = null;

// if (Platform.OS !== 'web') {
//   const loadMaps = async () => {
//     try {
//       const Maps = require('react-native-maps');
//       MapView = Maps.default;
//       Marker = Maps.Marker;
//       Polyline = Maps.Polyline;
//       PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
//     } catch (error) {
//       console.log('Error loading maps:', error);
//     }
//   };
//   loadMaps();
// }

// // ============= CUSTOM CONFIRMATION MODAL =============
// const ConfirmationModal = ({
//   visible,
//   title,
//   message,
//   onConfirm,
//   onCancel,
//   confirmText = 'Confirm',
//   cancelText = 'Cancel',
//   confirmVariant = 'primary' as 'primary' | 'error' | 'success',
// }) => {
//   const { colors } = useTheme();

//   if (!visible) return null;

//   const getConfirmButtonColor = () => {
//     switch (confirmVariant) {
//       case 'error':
//         return colors.error;
//       case 'success':
//         return colors.success;
//       default:
//         return colors.primary;
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <TouchableWithoutFeedback onPress={onCancel}>
//         <View
//           style={{
//             flex: 1,
//             justifyContent: 'center',
//             alignItems: 'center',
//             backgroundColor: 'rgba(0,0,0,0.5)',
//           }}
//         >
//           <TouchableWithoutFeedback>
//             <View
//               style={{
//                 backgroundColor: colors.surface,
//                 borderRadius: 16,
//                 padding: 24,
//                 width: width * 0.85,
//                 maxWidth: 320,
//                 alignItems: 'center',
//               }}
//             >
//               <View
//                 style={{
//                   width: 56,
//                   height: 56,
//                   borderRadius: 28,
//                   backgroundColor: getConfirmButtonColor() + '15',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   marginBottom: 16,
//                 }}
//               >
//                 <Ionicons
//                   name={confirmVariant === 'error' ? 'alert-circle' : 'checkmark-circle'}
//                   size={32}
//                   color={getConfirmButtonColor()}
//                 />
//               </View>

//               <Text
//                 style={{
//                   fontSize: 18,
//                   fontWeight: 'bold',
//                   color: colors.textPrimary,
//                   marginBottom: 8,
//                   textAlign: 'center',
//                 }}
//               >
//                 {title}
//               </Text>

//               <Text
//                 style={{
//                   fontSize: 14,
//                   color: colors.textSecondary,
//                   marginBottom: 24,
//                   textAlign: 'center',
//                   lineHeight: 20,
//                 }}
//               >
//                 {message}
//               </Text>

//               <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
//                 <TouchableOpacity
//                   onPress={onCancel}
//                   style={{
//                     flex: 1,
//                     paddingVertical: 12,
//                     borderRadius: 8,
//                     backgroundColor: colors.divider,
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>
//                     {cancelText}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={onConfirm}
//                   style={{
//                     flex: 1,
//                     paddingVertical: 12,
//                     borderRadius: 8,
//                     backgroundColor: getConfirmButtonColor(),
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Text style={{ color: colors.surface, fontWeight: '600', fontSize: 14 }}>
//                     {confirmText}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </TouchableWithoutFeedback>
//         </View>
//       </TouchableWithoutFeedback>
//     </Modal>
//   );
// };

// // ============= MAIN COMPONENT =============
// export default function BeatsScreen() {
//   const { colors } = useTheme();
//   const styles = useStyles();
//   const activeRoute = useRouteStore((s) => s.selectedRoute);

//   // ========== STATE ==========
//   const [outlets, setOutlets] = useState<Outlet[]>([]);
//   const [expandedOutlets, setExpandedOutlets] = useState<Set<string>>(new Set());
//   const [currentLocation] = useState({
//     latitude: 22.7443,
//     longitude: 75.896,
//   });
//   const [showMapModal, setShowMapModal] = useState(false);
//   const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
//   const [activeTab, setActiveTab] = useState('outlets');
//   const [mapsLoaded, setMapsLoaded] = useState(Platform.OS === 'web');
//   const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);
//   const [routeCoords, setRouteCoords] = useState<any[]>([]);

//   const mapRef = useRef<any>(null);
//   const scrollY = useRef(new Animated.Value(0)).current;

//   // ========== COMPUTED VALUES ==========
//   const computedStats = useMemo(() => {
//     const completedCount = outlets.filter((c) => c.visitStatus === 'COMPLETED').length;
//     const progress = outlets.length > 0 ? (completedCount / outlets.length) * 100 : 0;
//     const totalOrderValue = outlets.reduce((sum, outlet) => sum + (outlet.orderValue || 0), 0);

//     const totalDistance = outlets.reduce((sum, outlet, index) => {
//       if (index === 0) return sum;
//       const prev = outlets[index - 1];
//       return (
//         sum +
//         getDistance(
//           prev.geoTag?.lat || currentLocation.latitude,
//           prev.geoTag?.lng || currentLocation.longitude,
//           outlet.geoTag?.lat || currentLocation.latitude,
//           outlet.geoTag?.lng || currentLocation.longitude,
//         )
//       );
//     }, 0);

//     return { completedCount, progress, totalOrderValue, totalDistance };
//   }, [outlets, currentLocation]);

//   const outletsWithDistance = useMemo(() => {
//     return outlets.map((outlet) => ({
//       ...outlet,
//       distance: getDistance(
//         currentLocation.latitude,
//         currentLocation.longitude,
//         outlet.geoTag?.lat || currentLocation.latitude,
//         outlet.geoTag?.lng || currentLocation.longitude,
//       ),
//     }));
//   }, [outlets, currentLocation]);

//   // ========== LIFECYCLE ==========
//   useEffect(() => {
//     if (Platform.OS !== 'web' && !MapView && !mapsLoaded) {
//       const loadMapsAsync = async () => {
//         try {
//           const Maps = await import('react-native-maps');
//           MapView = Maps.default;
//           Marker = Maps.Marker;
//           Polyline = Maps.Polyline;
//           PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
//           setMapsLoaded(true);
//         } catch (error) {
//           console.log('Error loading maps:', error);
//         }
//       };
//       loadMapsAsync();
//     }
//   }, [mapsLoaded]);

//   useFocusEffect(
//     useCallback(() => {
//       getRouteOutlets();
//     }, [activeRoute]),
//   );

//   useEffect(() => {
//     if (outletsWithDistance.length > 0) {
//       fetchRouteFromOSRM();
//     }
//   }, [outletsWithDistance]);

//   // ========== DATA LOADING ==========
//   const fetchRouteFromOSRM = async () => {
//     try {
//       if (!outletsWithDistance.length) return;

//       const coords = [
//         `${currentLocation.longitude},${currentLocation.latitude}`,
//         ...outletsWithDistance.map((o) => `${o.geoTag?.lng},${o.geoTag?.lat}`),
//       ].join(';');

//       const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
//       const res = await fetch(url);
//       const data = await res.json();

//       if (!data.routes?.length) return;

//       const route = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => ({
//         latitude: lat,
//         longitude: lng,
//       }));

//       setRouteCoords(route);
//     } catch (err) {
//       console.log('OSRM route error:', err);
//     }
//   };

//   const getRouteOutlets = async () => {
//     if (!activeRoute?.routeId) return;

//     const payload: any = {
//       routeId: activeRoute?.routeId,
//       page: 1,
//       limit: 50,
//       filters: [],
//       searchText: '',
//       routeSessionId: activeRoute?.routeSessionId,
//     };

//     try {
//       const response = await outletService.getRouteOutlets(payload);

//       if (response.statusCode === 200) {
//         const outletsData = response.data || [];
//         const transformedOutlets: Outlet[] = outletsData.map((outlet: any, index: number) => ({
//           ...outlet,
//           orderValue: Math.floor(Math.random() * 50000) + 5000,
//           priority: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
//           visitStatus: index === 0 ? 'ACTIVE' : 'PENDING',
//         }));

//         setOutlets(transformedOutlets);

//         if (transformedOutlets.length > 0 && transformedOutlets[0]._id) {
//           setExpandedOutlets(new Set([transformedOutlets[0]._id]));
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching route outlets:', error);
//       Alert.alert('Error', 'Failed to load outlets for this route');
//     }
//   };

//   // ========== ACTIONS ==========
//   const toggleExpand = (outletId: string) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     const newExpanded = new Set(expandedOutlets);
//     if (newExpanded.has(outletId)) {
//       newExpanded.delete(outletId);
//     } else {
//       newExpanded.add(outletId);
//     }
//     setExpandedOutlets(newExpanded);
//   };

//   const handleVisitAction = useCallback((customerId: string) => {
//     router.push(`/outlets/${customerId}`);
//   }, []);

//   const handleNavigation = useCallback((outlet: Outlet) => {
//     if (!outlet.geoTag?.lat || !outlet.geoTag?.lng) {
//       Alert.alert('Error', 'Location not available for this outlet');
//       return;
//     }

//     const url = Platform.select({
//       ios: `maps:${outlet.geoTag.lat},${outlet.geoTag.lng}?q=${encodeURIComponent(outlet.name)}`,
//       android: `geo:${outlet.geoTag.lat},${outlet.geoTag.lng}?q=${outlet.geoTag.lat},${outlet.geoTag.lng}(${encodeURIComponent(outlet.name)})`,
//       web: `https://www.google.com/maps/dir/?api=1&destination=${outlet.geoTag.lat},${outlet.geoTag.lng}&travelmode=driving`,
//     });

//     if (url) {
//       Linking.openURL(url).catch(() => {
//         Alert.alert('Error', 'Unable to open maps application');
//       });
//     }
//   }, []);

//   const endRoute = () => {
//     setShowEndRouteConfirm(false);
//     Alert.alert(
//       'Route Completed',
//       `Great job! You have completed ${computedStats.completedCount} out of ${outlets.length} visits.\nTotal Order Value: ${formatCurrency(computedStats.totalOrderValue)}`,
//     );
//   };

//   // Function to mark outlet as complete
//   const markComplete = useCallback((currentOutletId: string) => {
//     setOutlets((prevOutlets) =>
//       prevOutlets.map((o) =>
//         o._id === currentOutletId ? { ...o, visitStatus: 'COMPLETED' as const } : o,
//       ),
//     );
//     Alert.alert('Success', 'Visit marked as completed!');
//   }, []);

//   // ========== RENDER ==========
//   return (
//     <SafeAreaView style={styles.container}>
//       <Animated.ScrollView
//         showsVerticalScrollIndicator={false}
//         onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
//           useNativeDriver: false,
//         })}
//         scrollEventThrottle={16}
//       >
//         {/* Header */}
//         <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
//           <View style={styles.routeInfoContainer}>
//             <Text style={styles.routeName}>{activeRoute?.name || 'Active Route'}</Text>
//             <Text style={styles.routeDate}>{new Date().toLocaleDateString()}</Text>
//           </View>

//           {/* Progress Section */}
//           <View style={styles.progressContainer}>
//             <View style={styles.progressHeader}>
//               <Text style={styles.progressTitle}>Today's Progress</Text>
//               <Text style={styles.progressPercent}>{Math.round(computedStats.progress)}%</Text>
//             </View>
//             <View style={styles.progressBar}>
//               <Animated.View
//                 style={[styles.progressFill, { width: `${computedStats.progress}%` }]}
//               />
//             </View>
//             <Text style={styles.progressStats}>
//               {computedStats.completedCount} of {outlets.length} outlets completed
//             </Text>
//           </View>

//           {/* Stats Cards */}
//           <View style={styles.statsContainer}>
//             <View style={styles.statItem}>
//               <View style={styles.statIcon}>
//                 <Feather name="clock" size={18} color={colors.surface} />
//               </View>
//               <Text style={styles.statValue}>{Math.ceil(outlets.length * 0.5)}</Text>
//               <Text style={styles.statLabel}>Est. Hours</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <View style={styles.statIcon}>
//                 <Feather name="map-pin" size={18} color={colors.surface} />
//               </View>
//               <Text style={styles.statValue}>{computedStats.totalDistance.toFixed(1)}</Text>
//               <Text style={styles.statLabel}>Distance (km)</Text>
//             </View>
//             <View style={styles.statDivider} />
//             <View style={styles.statItem}>
//               <View style={styles.statIcon}>
//                 <MaterialIcons name="attach-money" size={18} color={colors.surface} />
//               </View>
//               <Text style={styles.statValue}>{formatCurrency(computedStats.totalOrderValue)}</Text>
//               <Text style={styles.statLabel}>Pipeline</Text>
//             </View>
//           </View>
//         </LinearGradient>

//         {/* Map Preview Card */}
//         {outlets.length > 0 && (
//           <TouchableOpacity
//             style={styles.mapPreviewCard}
//             onPress={() => setShowMapModal(true)}
//             activeOpacity={0.9}
//           >
//             <LinearGradient
//               colors={[colors.primary, colors.primaryDark]}
//               style={styles.mapPreviewGradient}
//             >
//               <View style={styles.mapPreviewContent}>
//                 <View style={styles.mapPreviewIcon}>
//                   <Feather name="map" size={24} color={colors.surface} />
//                 </View>
//                 <View style={styles.mapPreviewText}>
//                   <Text style={styles.mapPreviewTitle}>View Route Map</Text>
//                   <Text style={styles.mapPreviewSubtitle}>
//                     {outlets.length} outlets • {computedStats.totalDistance.toFixed(1)} km
//                   </Text>
//                 </View>
//                 <Ionicons name="chevron-forward" size={24} color={colors.surface} />
//               </View>
//             </LinearGradient>
//           </TouchableOpacity>
//         )}

//         {/* Tabs */}
//         <View style={styles.tabsContainer}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'outlets' && styles.tabActive]}
//             onPress={() => setActiveTab('outlets')}
//           >
//             <Text style={[styles.tabText, activeTab === 'outlets' && styles.tabTextActive]}>
//               Outlets ({outlets.length})
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
//             onPress={() => setActiveTab('summary')}
//           >
//             <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
//               Route Summary
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Outlet List */}
//         {activeTab === 'outlets' ? (
//           <View style={styles.outletList}>
//             {outletsWithDistance.map((outlet: Outlet, index: number) => (
//               <ExpandableOutletCard
//                 key={outlet._id}
//                 outlet={outlet}
//                 index={index}
//                 styles={styles}
//                 colors={colors}
//                 onExpand={() => toggleExpand(outlet._id)}
//                 isExpanded={expandedOutlets.has(outlet._id)}
//                 onVisit={() => handleVisitAction(outlet.customerId)}
//                 onNavigate={() => handleNavigation(outlet)}
//                 onMarkComplete={() => markComplete(outlet._id)}
//               />
//             ))}
//           </View>
//         ) : (
//           <RouteSummaryTab
//             styles={styles}
//             colors={colors}
//             outlets={outlets}
//             completedCount={computedStats.completedCount}
//             totalDistance={computedStats.totalDistance}
//             totalOrderValue={computedStats.totalOrderValue}
//             onEndRoute={() => setShowEndRouteConfirm(true)}
//           />
//         )}
//       </Animated.ScrollView>

//       {/* End Route Confirmation Modal */}
//       <ConfirmationModal
//         visible={showEndRouteConfirm}
//         title="End Route?"
//         message={`You have completed ${computedStats.completedCount} out of ${outlets.length} visits.\nTotal pipeline value: ${formatCurrency(computedStats.totalOrderValue)}`}
//         onConfirm={endRoute}
//         onCancel={() => setShowEndRouteConfirm(false)}
//         confirmText="End Route"
//         cancelText="Cancel"
//         confirmVariant="error"
//       />

//       <OutletDetailModal
//         selectedOutlet={selectedOutlet}
//         onClose={() => setSelectedOutlet(null)}
//         styles={styles}
//         colors={colors}
//         onNavigate={() => {
//           if (selectedOutlet) {
//             setSelectedOutlet(null);
//             handleNavigation(selectedOutlet);
//           }
//         }}
//         onViewDetails={() => {
//           setSelectedOutlet(null);
//           if (selectedOutlet) {
//             router.push(`/outlets/${selectedOutlet.customerId}`);
//           }
//         }}
//       />

//       {/* Map Modal */}
//       <AppModal
//         visible={showMapModal}
//         onClose={() => setShowMapModal(false)}
//         size="full"
//         animation="slide"
//         showHeader={false}
//         showBackdrop={false}
//         closeOnBackdropPress={false}
//         dismissible={true}
//         scrollable={false}
//         style={{ flex: 1 }}
//         showCloseButton={false}
//         contentStyle={{
//           flex: 1,
//           padding: 0,
//           margin: 0,
//           width: '100%',
//           height: '100%',
//         }}
//       >
//         <View style={styles.fullScreenContainer}>
//           <TouchableOpacity style={styles.mapCloseButton} onPress={() => setShowMapModal(false)}>
//             <Ionicons name="arrow-back" size={24} color="#fff" />
//           </TouchableOpacity>
//           <View style={styles.fullScreenMap}>
//             <Text style={{ color: colors.surface, textAlign: 'center', marginTop: 100 }}>
//               Map View - {outlets.length} outlets
//             </Text>
//           </View>
//         </View>
//       </AppModal>
//     </SafeAreaView>
//   );
// }

// // ============= SUB-COMPONENTS =============

// interface ExpandableOutletCardProps {
//   outlet: Outlet;
//   index: number;
//   styles: any;
//   colors: any;
//   onExpand: () => void;
//   isExpanded: boolean;
//   onVisit: () => void;
//   onNavigate: () => void;
//   onMarkComplete: () => void;
// }

// const ExpandableOutletCard: React.FC<ExpandableOutletCardProps> = ({
//   outlet,
//   index,
//   styles,
//   colors,
//   onExpand,
//   isExpanded,
//   onVisit,
//   onNavigate,
//   onMarkComplete,
// }) => {
//   const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
//   const visitStatus = outlet.visitStatus;
//   const isActive = visitStatus === 'ACTIVE';
//   const isCompleted = visitStatus === 'COMPLETED';

//   const getPriorityColor = (): string => {
//     switch (outlet.priority) {
//       case 'high':
//         return colors.error;
//       case 'medium':
//         return colors.warning;
//       default:
//         return colors.info;
//     }
//   };

//   const getStatusColors = () => {
//     if (isCompleted)
//       return { bg: colors.success + '15', border: colors.success, text: colors.success };
//     if (isActive)
//       return { bg: colors.primary + '15', border: colors.primary, text: colors.primary };
//     return { bg: colors.warning + '15', border: colors.warning, text: colors.warning };
//   };

//   const statusColors = getStatusColors();

//   return (
//     <View
//       style={[
//         styles.expandableCard,
//         isActive && styles.expandableCardCurrent,
//         isCompleted && styles.expandableCardCompleted,
//       ]}
//     >
//       {/* Confirmation Modal for Mark Complete */}
//       <ConfirmationModal
//         visible={showCompleteConfirm}
//         title="Complete Visit"
//         message={`Mark "${outlet.name}" as completed?`}
//         onConfirm={() => {
//           setShowCompleteConfirm(false);
//           onMarkComplete();
//         }}
//         onCancel={() => setShowCompleteConfirm(false)}
//         confirmText="Yes, Complete"
//         cancelText="Cancel"
//         confirmVariant="success"
//       />

//       {/* Card Header - Click to expand/collapse */}
//       <TouchableOpacity style={styles.cardHeader} onPress={onExpand} activeOpacity={0.7}>
//         <View style={styles.headerLeft}>
//           <View style={[styles.statusIndicator, { backgroundColor: statusColors.bg }]}>
//             {isCompleted ? (
//               <Ionicons name="checkmark-circle" size={24} color={statusColors.text} />
//             ) : (
//               <Text style={[styles.statusNumber, { color: statusColors.text }]}>{index + 1}</Text>
//             )}
//           </View>

//           <View style={styles.headerInfo}>
//             <View style={styles.nameRow}>
//               <Text style={styles.outletName} numberOfLines={1}>
//                 {outlet.name}
//               </Text>
//               <View style={styles.headerIconsRow}>
//                 <TouchableOpacity
//                   onPress={(e) => {
//                     e.stopPropagation();
//                     Alert.alert('Call', `Calling ${outlet.phoneNumber}`);
//                   }}
//                   style={styles.headerIconButton}
//                 >
//                   <Ionicons name="call-outline" size={20} color={colors.primary} />
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   onPress={(e) => {
//                     e.stopPropagation();
//                     onNavigate();
//                   }}
//                   style={styles.headerIconButton}
//                 >
//                   <Ionicons name="navigate-outline" size={20} color={colors.info} />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.detailsRow}>
//               <Text style={styles.stopAddress} numberOfLines={1}>
//                 {outlet.address?.line1}
//               </Text>
//               <View style={styles.distanceBadge}>
//                 <Feather name="map-pin" size={12} color={colors.textSecondary} />
//                 <Text style={styles.distanceText}>{outlet.distance?.toFixed(1)} km</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         <View style={styles.headerRight}>
//           <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
//             <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
//               {isCompleted ? 'Done' : isActive ? 'Active' : 'Pending'}
//             </Text>
//           </View>
//           <Ionicons
//             name={isExpanded ? 'chevron-up' : 'chevron-down'}
//             size={20}
//             color={colors.primary}
//           />
//         </View>
//       </TouchableOpacity>

//       {/* Expanded Content - Only shown when expanded */}
//       {isExpanded && (
//         <View style={styles.expandedContent}>
//           {/* Order Value Card */}
//           <LinearGradient
//             colors={[colors.primary + '08', colors.primary + '04']}
//             style={styles.orderCard}
//           >
//             <View style={styles.orderCardLeft}>
//               <Text style={styles.orderLabel}>Order Value</Text>
//               <Text style={styles.orderValue}>{formatCurrency(outlet.orderValue || 0)}</Text>
//             </View>
//             <View style={styles.orderCardRight}>
//               <MaterialIcons name="receipt" size={32} color={colors.primary + '30'} />
//             </View>
//           </LinearGradient>

//           {/* Contact Information - Compact */}
//           <View style={styles.contactSection}>
//             <View style={styles.contactRow}>
//               <Ionicons name="person-outline" size={16} color={colors.primary} />
//               <Text style={styles.contactLabel}>Owner:</Text>
//               <Text style={styles.contactValue}>{outlet.ownerName || 'N/A'}</Text>
//             </View>

//             <View style={styles.contactRow}>
//               <Ionicons name="call-outline" size={16} color={colors.primary} />
//               <Text style={styles.contactLabel}>Phone:</Text>
//               <Text style={styles.contactValue}>{outlet.phoneNumber || 'N/A'}</Text>
//             </View>

//             {outlet.lastVisitedAt && (
//               <View style={styles.contactRow}>
//                 <Ionicons name="calendar-outline" size={16} color={colors.primary} />
//                 <Text style={styles.contactLabel}>Last Visit:</Text>
//                 <Text style={styles.contactValue}>
//                   {new Date(outlet.lastVisitedAt).toLocaleDateString()}
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Action Buttons Row */}
//           <View style={styles.actionButtonsRow}>
//             <AppButton
//               title={isCompleted ? 'Revisit' : 'Continue'}
//               variant="outline"
//               size="small"
//               leftIcon={
//                 <Ionicons
//                   name={isCompleted ? 'refresh-outline' : 'arrow-forward-outline'}
//                   size={18}
//                   color={colors.primary}
//                 />
//               }
//               onPress={onVisit}
//               style={styles.actionButton}
//             />

//             {isActive && (
//               <AppButton
//                 title="Mark Complete"
//                 variant="primary"
//                 size="small"
//                 leftIcon={
//                   <Ionicons name="checkmark-done-outline" size={18} color={colors.surface} />
//                 }
//                 onPress={() => setShowCompleteConfirm(true)}
//                 style={styles.actionButton}
//               />
//             )}
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// interface RouteSummaryTabProps {
//   styles: any;
//   colors: any;
//   outlets: Outlet[];
//   completedCount: number;
//   totalDistance: number;
//   totalOrderValue: number;
//   onEndRoute: () => void;
// }

// const RouteSummaryTab: React.FC<RouteSummaryTabProps> = ({
//   styles,
//   colors,
//   outlets,
//   completedCount,
//   totalDistance,
//   totalOrderValue,
//   onEndRoute,
// }) => (
//   <View style={styles.infoContainer}>
//     <LinearGradient colors={[colors.surface, colors.primaryContrast]} style={styles.infoCard}>
//       <View style={styles.summaryHeader}>
//         <Feather name="check-circle" size={40} color={colors.success} />
//         <Text style={styles.infoCardTitle}>Route Summary</Text>
//       </View>

//       <View style={styles.summaryDivider} />

//       <SummaryRow label="Total Distance" value={`${totalDistance.toFixed(1)} km`} />
//       <SummaryRow label="Estimated Time" value={`${Math.ceil(outlets.length * 0.5)} hours`} />
//       <SummaryRow label="Total Outlets" value={`${outlets.length}`} />
//       <SummaryRow label="Completed" value={`${completedCount}`} isSuccess />
//       <SummaryRow label="Remaining" value={`${outlets.length - completedCount}`} isWarning />
//       <SummaryRow label="Pipeline Value" value={formatCurrency(totalOrderValue)} isPrimary />
//     </LinearGradient>

//     <AppButton
//       title="End Route"
//       variant="error"
//       size="small"
//       leftIcon={<Ionicons name="flag" size={18} color={colors.surface} />}
//       onPress={onEndRoute}
//       style={{ marginTop: 24 }}
//     />
//   </View>
// );

// interface SummaryRowProps {
//   label: string;
//   value: string;
//   isSuccess?: boolean;
//   isWarning?: boolean;
//   isPrimary?: boolean;
// }

// const SummaryRow: React.FC<SummaryRowProps> = ({
//   label,
//   value,
//   isSuccess,
//   isWarning,
//   isPrimary,
// }) => {
//   const { colors } = useTheme();
//   const styles = useStyles();

//   let valueColor = colors.textPrimary;
//   if (isSuccess) valueColor = colors.success;
//   if (isWarning) valueColor = colors.warning;
//   if (isPrimary) valueColor = colors.primary;

//   return (
//     <View style={styles.summaryRow}>
//       <View style={styles.summaryLeft}>
//         <Text style={styles.summaryLabel}>{label}</Text>
//       </View>
//       <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
//     </View>
//   );
// };

// interface OutletDetailModalProps {
//   selectedOutlet: Outlet | null;
//   onClose: () => void;
//   styles: any;
//   colors: any;
//   onNavigate: () => void;
//   onViewDetails: () => void;
// }

// const OutletDetailModal: React.FC<OutletDetailModalProps> = ({
//   selectedOutlet,
//   onClose,
//   styles,
//   colors,
//   onNavigate,
//   onViewDetails,
// }) => (
//   <Modal visible={!!selectedOutlet} transparent animationType="fade">
//     <TouchableWithoutFeedback onPress={onClose}>
//       <View style={styles.modalOverlay}>
//         <TouchableWithoutFeedback>
//           <ScrollView style={styles.detailModal} showsVerticalScrollIndicator={false}>
//             <LinearGradient
//               colors={[colors.primary, colors.primaryDark]}
//               style={styles.detailHeader}
//             >
//               <TouchableOpacity style={styles.detailClose} onPress={onClose}>
//                 <Ionicons name="close" size={24} color={colors.surface} />
//               </TouchableOpacity>
//               <View style={styles.detailAvatar}>
//                 <MaterialIcons name="store" size={40} color={colors.primary} />
//               </View>
//               <Text style={styles.detailName}>{selectedOutlet?.name}</Text>
//               <Text style={styles.detailAddress}>{selectedOutlet?.address?.line1}</Text>
//             </LinearGradient>

//             <View style={styles.detailBody}>
//               <View style={styles.detailInfoGrid}>
//                 <DetailInfoItem
//                   icon="call-outline"
//                   label="Phone"
//                   value={selectedOutlet?.phoneNumber || 'N/A'}
//                   colors={colors}
//                   styles={styles}
//                 />
//                 <DetailInfoItem
//                   icon="person-outline"
//                   label="Owner"
//                   value={selectedOutlet?.ownerName || 'N/A'}
//                   colors={colors}
//                   styles={styles}
//                 />
//                 <DetailInfoItem
//                   icon="attach-money"
//                   label="Order Value"
//                   value={formatCurrency(selectedOutlet?.orderValue || 0)}
//                   colors={colors}
//                   styles={styles}
//                 />
//               </View>

//               <View style={styles.modalButtonsRow}>
//                 <TouchableOpacity style={styles.modalIconButton} onPress={onNavigate}>
//                   <Ionicons name="navigate-outline" size={20} color={colors.info} />
//                   <Text style={[styles.modalIconButtonText, { color: colors.info }]}>Navigate</Text>
//                 </TouchableOpacity>

//                 <AppButton
//                   title="View Details"
//                   variant="primary"
//                   size="small"
//                   rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.surface} />}
//                   onPress={onViewDetails}
//                   style={{ flex: 1 }}
//                 />
//               </View>
//             </View>
//           </ScrollView>
//         </TouchableWithoutFeedback>
//       </View>
//     </TouchableWithoutFeedback>
//   </Modal>
// );

// interface DetailInfoItemProps {
//   icon: string;
//   label: string;
//   value: string;
//   colors: any;
//   styles: any;
// }

// const DetailInfoItem: React.FC<DetailInfoItemProps> = ({ icon, label, value, colors, styles }) => (
//   <View style={[styles.detailInfoItem, { backgroundColor: colors.primaryContrast }]}>
//     <Ionicons name={icon as any} size={20} color={colors.primary} />
//     <Text style={styles.detailInfoLabel}>{label}</Text>
//     <Text style={styles.detailInfoValue}>{value}</Text>
//   </View>
// );

// // ============= STYLES =============
// const useStyles = () => {
//   const { colors } = useTheme();

//   const styleGenerator = createStyles((utils) => ({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     } as ViewStyle,

//     fullScreenContainer: {
//       flex: 1,
//       backgroundColor: 'black',
//       position: 'relative',
//     } as ViewStyle,

//     mapCloseButton: {
//       position: 'absolute',
//       top: Platform.OS === 'ios' ? 50 : 40,
//       left: 16,
//       zIndex: 10,
//       backgroundColor: 'rgba(0,0,0,0.5)',
//       borderRadius: utils.borderRadius.full,
//       padding: 8,
//     } as ViewStyle,

//     fullScreenMap: {
//       flex: 1,
//     } as ViewStyle,

//     header: {
//       paddingTop: utils.spacing[4],
//       paddingBottom: utils.spacing[6],
//       borderBottomLeftRadius: utils.borderRadius.xl,
//       borderBottomRightRadius: utils.borderRadius.xl,
//     } as ViewStyle,

//     routeInfoContainer: {
//       paddingHorizontal: utils.spacing[5],
//       marginBottom: utils.spacing[4],
//     } as ViewStyle,

//     routeName: {
//       fontSize: utils.fontSize.xl,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.surface,
//       marginBottom: utils.spacing[1],
//     } as TextStyle,

//     routeDate: {
//       fontSize: utils.fontSize.sm,
//       color: colors.surface + 'CC',
//     } as TextStyle,

//     progressContainer: {
//       paddingHorizontal: utils.spacing[5],
//       marginBottom: utils.spacing[6],
//     } as ViewStyle,

//     progressHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'baseline',
//       marginBottom: utils.spacing[3],
//     } as ViewStyle,

//     progressTitle: {
//       fontSize: utils.fontSize.sm,
//       color: colors.surface + 'CC',
//       fontWeight: utils.getFontWeight('medium'),
//     } as TextStyle,

//     progressPercent: {
//       fontSize: utils.fontSize.xl,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.surface,
//     } as TextStyle,

//     progressBar: {
//       height: 8,
//       backgroundColor: colors.surface + '33',
//       borderRadius: utils.borderRadius.full,
//       overflow: 'hidden',
//       marginBottom: utils.spacing[3],
//     } as ViewStyle,

//     progressFill: {
//       height: '100%',
//       backgroundColor: colors.warning,
//       borderRadius: utils.borderRadius.full,
//     } as ViewStyle,

//     progressStats: {
//       fontSize: utils.fontSize.xs,
//       color: colors.surface + 'B3',
//     } as TextStyle,

//     statsContainer: {
//       flexDirection: 'row',
//       justifyContent: 'space-around',
//       alignItems: 'center',
//       paddingHorizontal: utils.spacing[5],
//     } as ViewStyle,

//     statItem: {
//       alignItems: 'center',
//       flex: 1,
//     } as ViewStyle,

//     statIcon: {
//       width: 36,
//       height: 36,
//       borderRadius: utils.borderRadius.full,
//       backgroundColor: colors.surface + '33',
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginBottom: utils.spacing[2],
//     } as ViewStyle,

//     statValue: {
//       fontSize: utils.fontSize.md,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.surface,
//       marginBottom: 2,
//     } as TextStyle,

//     statLabel: {
//       fontSize: utils.fontSize.xs,
//       color: colors.surface + 'B3',
//     } as TextStyle,

//     statDivider: {
//       width: 1,
//       height: 40,
//       backgroundColor: colors.surface + '33',
//     } as ViewStyle,

//     mapPreviewCard: {
//       marginHorizontal: utils.spacing[4],
//       marginTop: -utils.spacing[4],
//       marginBottom: utils.spacing[2],
//       borderRadius: utils.borderRadius.lg,
//       overflow: 'hidden',
//       shadowColor: colors.textPrimary,
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 5,
//     } as ViewStyle,

//     mapPreviewGradient: {
//       padding: utils.spacing[4],
//     } as ViewStyle,

//     mapPreviewContent: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: utils.spacing[3],
//     } as ViewStyle,

//     mapPreviewIcon: {
//       width: 48,
//       height: 48,
//       borderRadius: utils.borderRadius.full,
//       backgroundColor: colors.surface + '33',
//       justifyContent: 'center',
//       alignItems: 'center',
//     } as ViewStyle,

//     mapPreviewText: {
//       flex: 1,
//     } as ViewStyle,

//     mapPreviewTitle: {
//       fontSize: utils.fontSize.md,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.surface,
//       marginBottom: 4,
//     } as TextStyle,

//     mapPreviewSubtitle: {
//       fontSize: utils.fontSize.xs,
//       color: colors.surface + 'CC',
//     } as TextStyle,

//     tabsContainer: {
//       flexDirection: 'row',
//       paddingHorizontal: utils.spacing[5],
//       backgroundColor: colors.surface,
//       borderTopLeftRadius: utils.borderRadius.xl,
//       borderTopRightRadius: utils.borderRadius.xl,
//     } as ViewStyle,

//     tab: {
//       flex: 1,
//       paddingVertical: utils.spacing[3],
//       alignItems: 'center',
//       borderBottomWidth: 2,
//       borderBottomColor: 'transparent',
//     } as ViewStyle,

//     tabActive: {
//       borderBottomColor: colors.primary,
//     } as ViewStyle,

//     tabText: {
//       fontSize: utils.fontSize.sm,
//       color: colors.textSecondary,
//       fontWeight: utils.getFontWeight('semibold'),
//     } as TextStyle,

//     tabTextActive: {
//       color: colors.primary,
//     } as TextStyle,

//     outletList: {
//       marginTop: utils.spacing[4],
//       paddingBottom: utils.spacing[4],
//     } as ViewStyle,

//     expandableCard: {
//       backgroundColor: colors.surface,
//       borderRadius: utils.borderRadius.lg,
//       marginHorizontal: utils.spacing[4],
//       marginBottom: utils.spacing[3],
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderColor: colors.divider,
//       shadowColor: colors.textPrimary,
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.05,
//       shadowRadius: 2,
//       elevation: 1,
//     } as ViewStyle,

//     expandableCardCurrent: {
//       borderWidth: 2,
//       borderColor: colors.primary,
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 2,
//     } as ViewStyle,

//     expandableCardCompleted: {
//       opacity: 0.85,
//     } as ViewStyle,

//     cardHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: utils.spacing[3],
//     } as ViewStyle,

//     headerLeft: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       flex: 1,
//       gap: utils.spacing[2],
//     } as ViewStyle,

//     statusIndicator: {
//       width: 44,
//       height: 44,
//       borderRadius: utils.borderRadius.full,
//       justifyContent: 'center',
//       alignItems: 'center',
//     } as ViewStyle,

//     statusNumber: {
//       fontSize: utils.fontSize.md,
//       fontWeight: utils.getFontWeight('bold'),
//     } as TextStyle,

//     headerInfo: {
//       flex: 1,
//     } as ViewStyle,

//     nameRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginBottom: 4,
//     } as ViewStyle,

//     outletName: {
//       fontSize: utils.fontSize.md,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.textPrimary,
//       flex: 1,
//     } as TextStyle,

//     headerIconsRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 12,
//     } as ViewStyle,

//     headerIconButton: {
//       padding: 4,
//     } as ViewStyle,

//     detailsRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     } as ViewStyle,

//     stopAddress: {
//       fontSize: 12,
//       color: colors.textSecondary,
//       flex: 1,
//     } as TextStyle,

//     distanceBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 4,
//       backgroundColor: colors.background,
//       paddingHorizontal: 8,
//       paddingVertical: 3,
//       borderRadius: 12,
//     } as ViewStyle,

//     distanceText: {
//       fontSize: 11,
//       color: colors.textSecondary,
//     } as TextStyle,

//     priorityBadge: {
//       paddingHorizontal: utils.spacing[2],
//       paddingVertical: 2,
//       borderRadius: utils.borderRadius.sm,
//     } as ViewStyle,

//     priorityText: {
//       fontSize: 9,
//       fontWeight: utils.getFontWeight('semibold'),
//     } as TextStyle,

//     headerRight: {
//       alignItems: 'flex-end',
//       gap: 4,
//     } as ViewStyle,

//     statusBadge: {
//       paddingHorizontal: 8,
//       paddingVertical: 3,
//       borderRadius: utils.borderRadius.sm,
//     } as ViewStyle,

//     statusBadgeText: {
//       fontSize: 11,
//       fontWeight: utils.getFontWeight('semibold'),
//     } as TextStyle,

//     expandedContent: {
//       padding: utils.spacing[3],
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//       backgroundColor: colors.primaryContrast,
//       gap: utils.spacing[3],
//     } as ViewStyle,

//     orderCard: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: utils.spacing[3],
//       borderRadius: utils.borderRadius.md,
//     } as ViewStyle,

//     orderCardLeft: {
//       flex: 1,
//     } as ViewStyle,

//     orderLabel: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       marginBottom: 2,
//     } as TextStyle,

//     orderValue: {
//       fontSize: utils.fontSize.md,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.textPrimary,
//     } as TextStyle,

//     orderCardRight: {
//       width: 44,
//       height: 44,
//       justifyContent: 'center',
//       alignItems: 'center',
//     } as ViewStyle,

//     contactSection: {
//       gap: 8,
//     } as ViewStyle,

//     contactRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//     } as ViewStyle,

//     contactLabel: {
//       fontSize: 12,
//       color: colors.textSecondary,
//       width: 70,
//     } as TextStyle,

//     contactValue: {
//       fontSize: 12,
//       fontWeight: utils.getFontWeight('medium'),
//       color: colors.textPrimary,
//       flex: 1,
//     } as TextStyle,

//     actionButtonsRow: {
//       flexDirection: 'row',
//       gap: 8,
//       marginTop: 4,
//     } as ViewStyle,

//     actionButton: {
//       flex: 1,
//     } as ViewStyle,

//     infoContainer: {
//       paddingHorizontal: utils.spacing[4],
//       paddingVertical: utils.spacing[6],
//       paddingBottom: utils.spacing[8],
//     } as ViewStyle,

//     infoCard: {
//       padding: utils.spacing[6],
//       borderRadius: utils.borderRadius.xl,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,

//     summaryHeader: {
//       alignItems: 'center',
//       marginBottom: utils.spacing[4],
//     } as ViewStyle,

//     infoCardTitle: {
//       fontSize: utils.fontSize.lg,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.textPrimary,
//       marginTop: utils.spacing[2],
//     } as TextStyle,

//     summaryDivider: {
//       height: 1,
//       backgroundColor: colors.divider,
//       marginVertical: utils.spacing[4],
//     } as ViewStyle,

//     summaryRow: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       paddingVertical: utils.spacing[2],
//     } as ViewStyle,

//     summaryLeft: {
//       flex: 1,
//     } as ViewStyle,

//     summaryLabel: {
//       fontSize: utils.fontSize.sm,
//       color: colors.textSecondary,
//     } as TextStyle,

//     summaryValue: {
//       fontSize: utils.fontSize.sm,
//       fontWeight: utils.getFontWeight('semibold'),
//       color: colors.textPrimary,
//     } as TextStyle,

//     modalOverlay: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: colors.textPrimary + '80',
//     } as ViewStyle,

//     detailModal: {
//       width: width * 0.9,
//       maxHeight: height * 0.8,
//       backgroundColor: colors.surface,
//       borderRadius: utils.borderRadius.xl,
//       overflow: 'hidden',
//     } as ViewStyle,

//     detailHeader: {
//       padding: utils.spacing[8],
//       alignItems: 'center',
//       position: 'relative',
//     } as ViewStyle,

//     detailClose: {
//       position: 'absolute',
//       top: 16,
//       right: 16,
//       width: 36,
//       height: 36,
//       borderRadius: utils.borderRadius.full,
//       backgroundColor: colors.surface + '33',
//       justifyContent: 'center',
//       alignItems: 'center',
//     } as ViewStyle,

//     detailAvatar: {
//       width: 80,
//       height: 80,
//       borderRadius: utils.borderRadius.full,
//       backgroundColor: colors.surface,
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginBottom: utils.spacing[4],
//     } as ViewStyle,

//     detailName: {
//       fontSize: utils.fontSize.xl,
//       fontWeight: utils.getFontWeight('bold'),
//       color: colors.surface,
//       marginBottom: 4,
//       textAlign: 'center',
//     } as TextStyle,

//     detailAddress: {
//       fontSize: utils.fontSize.sm,
//       color: colors.surface + 'E6',
//       textAlign: 'center',
//     } as TextStyle,

//     detailBody: {
//       padding: utils.spacing[6],
//       gap: utils.spacing[4],
//     } as ViewStyle,

//     detailInfoGrid: {
//       flexDirection: 'row',
//       justifyContent: 'space-around',
//       marginBottom: utils.spacing[6],
//       gap: utils.spacing[3],
//     } as ViewStyle,

//     detailInfoItem: {
//       flex: 1,
//       alignItems: 'center',
//       padding: utils.spacing[4],
//       borderRadius: utils.borderRadius.lg,
//       gap: utils.spacing[2],
//     } as ViewStyle,

//     detailInfoLabel: {
//       fontSize: utils.fontSize.xs,
//       color: colors.textSecondary,
//     } as TextStyle,

//     detailInfoValue: {
//       fontSize: utils.fontSize.sm,
//       fontWeight: utils.getFontWeight('semibold'),
//       color: colors.textPrimary,
//       textAlign: 'center',
//     } as TextStyle,

//     modalButtonsRow: {
//       flexDirection: 'row',
//       gap: 12,
//     } as ViewStyle,

//     modalIconButton: {
//       flex: 1,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: 6,
//       paddingVertical: 10,
//       borderRadius: 8,
//       borderWidth: 1,
//       borderColor: colors.divider,
//       backgroundColor: colors.background,
//     } as ViewStyle,

//     modalIconButtonText: {
//       fontSize: 13,
//       fontWeight: '600',
//     } as TextStyle,
//   }));

//   return styleGenerator(colors);
// };

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
  ViewStyle,
  TextStyle,
  Linking,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/hooks/useTheme';
import { createStyles } from '@/shared/theme/styles';
import { AppButton, AppModal } from '@/core/components';
import { outletService } from '@/features/outlet/services/outlet.service';
import { router, useFocusEffect } from 'expo-router';
import { useRouteStore } from '@/core/store/route.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { toast } from '@/core/utils';
import { CustomerCreateModal } from '@/shared/components/models/CustomerCreateModal';

const { width, height } = Dimensions.get('window');

// ============= CONSTANTS =============
const CURRENCY = {
  code: 'ZMW',
  symbol: 'K',
  name: 'Zambian Kwacha',
};

// ============= UTILITY FUNCTIONS =============
const formatCurrency = (amount: number): string => {
  return `${CURRENCY.symbol} ${amount.toLocaleString()}`;
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============= TYPE DEFINITIONS =============
interface GeoTag {
  lat: number;
  lng: number;
}

interface Address {
  line1: string;
  line2: string;
  _id: string;
  isDeleted: boolean;
}

interface Outlet {
  _id: string;
  customerId: string;
  name: string;
  ownerName: string;
  phoneNumber: string;
  address: Address;
  geoTag: GeoTag;
  segmentation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  lastVisitedAt: string;
  sequence: number;
  visitStatus?: 'ACTIVE' | 'COMPLETED';
  orderValue?: number;
  priority?: 'high' | 'medium' | 'low';
  distance?: number;
  isBlocked?: boolean;
  blockReason?: string;
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

// ============= CUSTOM CONFIRMATION MODAL =============
const ConfirmationModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary' as 'primary' | 'error' | 'success',
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  const getConfirmButtonColor = () => {
    switch (confirmVariant) {
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
                width: width * 0.85,
                maxWidth: 320,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: getConfirmButtonColor() + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name={confirmVariant === 'error' ? 'alert-circle' : 'checkmark-circle'}
                  size={32}
                  color={getConfirmButtonColor()}
                />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                {title}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 24,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                {message}
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.divider,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 14 }}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: getConfirmButtonColor(),
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.surface, fontWeight: '600', fontSize: 14 }}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ============= MAIN COMPONENT =============
export default function BeatsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const activeRoute = useRouteStore((s) => s.selectedRoute);

  // ========== STATE ==========
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [expandedOutlets, setExpandedOutlets] = useState<Set<string>>(new Set());
  const [currentLocation] = useState({
    latitude: 22.7443,
    longitude: 75.896,
  });
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [activeTab, setActiveTab] = useState('outlets');
  const [mapsLoaded, setMapsLoaded] = useState(Platform.OS === 'web');
  const [showEndRouteConfirm, setShowEndRouteConfirm] = useState(false);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [currentActiveSequence, setCurrentActiveSequence] = useState<number | null>(null);

  const mapRef = useRef<any>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const activeVisist = useOutletStore.getState().activeVisit;
  const [showCustomerCreteModal, setShowCustomerCreateModal] = useState(false);

  // ========== COMPUTED VALUES ==========
  const sortedOutlets = useMemo(() => {
    return [...outlets].sort((a, b) => a.sequence - b.sequence);
  }, [outlets]);

  const currentActiveOutlet = useMemo(() => {
    return sortedOutlets.find((o) => o.visitStatus === 'ACTIVE');
  }, [sortedOutlets]);

  const nextOutlet = useMemo(() => {
    if (!currentActiveOutlet) return null;
    const currentIndex = sortedOutlets.findIndex((o) => o._id === currentActiveOutlet._id);
    return sortedOutlets[currentIndex + 1] || null;
  }, [sortedOutlets, currentActiveOutlet]);

  const computedStats = useMemo(() => {
    const completedCount = outlets.filter((c) => c.visitStatus === 'COMPLETED').length;
    const progress = outlets.length > 0 ? (completedCount / outlets.length) * 100 : 0;
    const totalOrderValue = outlets.reduce((sum, outlet) => sum + (outlet.orderValue || 0), 0);

    const totalDistance = outlets.reduce((sum, outlet, index) => {
      if (index === 0) return sum;
      const prev = outlets[index - 1];
      return (
        sum +
        getDistance(
          prev.geoTag?.lat || currentLocation.latitude,
          prev.geoTag?.lng || currentLocation.longitude,
          outlet.geoTag?.lat || currentLocation.latitude,
          outlet.geoTag?.lng || currentLocation.longitude,
        )
      );
    }, 0);

    return { completedCount, progress, totalOrderValue, totalDistance };
  }, [outlets, currentLocation]);

  const outletsWithDistance = useMemo(() => {
    return sortedOutlets.map((outlet) => ({
      ...outlet,
      distance: getDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        outlet.geoTag?.lat || currentLocation.latitude,
        outlet.geoTag?.lng || currentLocation.longitude,
      ),
    }));
  }, [sortedOutlets, currentLocation]);

  // ========== LIFECYCLE ==========
  useEffect(() => {
    if (Platform.OS !== 'web' && !MapView && !mapsLoaded) {
      const loadMapsAsync = async () => {
        try {
          const Maps = await import('react-native-maps');
          MapView = Maps.default;
          Marker = Maps.Marker;
          Polyline = Maps.Polyline;
          PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
          setMapsLoaded(true);
        } catch (error) {
          console.log('Error loading maps:', error);
        }
      };
      loadMapsAsync();
    }
  }, [mapsLoaded]);

  useFocusEffect(
    useCallback(() => {
      getRouteOutlets();
    }, [activeRoute]),
  );

  useEffect(() => {
    if (outletsWithDistance.length > 0) {
      fetchRouteFromOSRM();
    }
  }, [outletsWithDistance]);

  // ========== DATA LOADING ==========
  const fetchRouteFromOSRM = async () => {
    try {
      if (!outletsWithDistance.length) return;

      const coords = [
        `${currentLocation.longitude},${currentLocation.latitude}`,
        ...outletsWithDistance.map((o) => `${o.geoTag?.lng},${o.geoTag?.lat}`),
      ].join(';');

      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes?.length) return;

      const route = data.routes[0].geometry.coordinates.map(([lng, lat]: number[]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoords(route);
    } catch (err) {
      console.log('OSRM route error:', err);
    }
  };

  const getRouteOutlets = async () => {
    if (!activeRoute?.routeId) return;

    const payload: any = {
      routeId: activeRoute?.routeId,
      page: 1,
      limit: 50,
      filters: [],
      searchText: '',
      routeSessionId: activeRoute?.routeSessionId,
    };

    try {
      const response = await outletService.getRouteOutlets(payload);
      if (response.statusCode === 200) {
        const outletsData = response.data || [];

        const transformedOutlets: Outlet[] = outletsData.map((outlet: any, index: number) => ({
          ...outlet,
          orderValue: Math.floor(Math.random() * 50000) + 5000,
          priority: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
        }));

        setOutlets(transformedOutlets);

        if (transformedOutlets.length > 0) {
          // 🔥 1. Find ACTIVE outlet
          let targetOutlet = transformedOutlets.find((o) => o.visitStatus === 'ACTIVE');

          // 🔥 2. If no ACTIVE → find first NOT_VISITED
          if (!targetOutlet) {
            targetOutlet = transformedOutlets.find((o) => o.visitStatus === 'NOT_VISITED');
          }

          // 🔥 3. Fallback → first outlet
          if (!targetOutlet) {
            targetOutlet = transformedOutlets[0];
          }

          if (targetOutlet?._id) {
            setExpandedOutlets(new Set([targetOutlet._id]));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching route outlets:', error);
      Alert.alert('Error', 'Failed to load outlets for this route');
    }
  };

  // ========== ACTIONS ==========
  const toggleExpand = (outletId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedOutlets);
    if (newExpanded.has(outletId)) {
      newExpanded.delete(outletId);
    } else {
      newExpanded.add(outletId);
    }
    setExpandedOutlets(newExpanded);
  };

  const canVisitOutlet = useCallback(
    (outlet: Outlet): { allowed: boolean; reason?: string } => {
      // ✅ If no active route → allow all

      // console.log(activeVisist, 'visit', outlet);
      // if (!activeRoute) return { allowed: true };

      // ✅ BLOCK: Different route
      // if (outlet.routeId !== activeRoute.routeId) {
      //   return {
      //     allowed: false,
      //     reason: `You are currently on route ${activeRoute.name}. Please complete it first.`,
      //   };
      // }

      // ✅ If outlet already completed → allow revisit
      // if (outlet.visitStatus === 'COMPLETED') {
      //   return { allowed: true, reason: 'Revisit completed outlet' };
      // }

      // ✅ If current active outlet → allow

      const activeOutlet = sortedOutlets.find(
        (o) => o.visitStatus === 'ACTIVE' && o.customerId === activeVisist?.outlet?.customerId,
      );

      console.log(activeOutlet, '==========active outlet===========');

      if (activeOutlet) {
        let allowed = activeOutlet?.customerId === outlet.customerId;
        toast.error(`Please complete visit of ${activeOutlet?.name}`);

        return {
          allowed,
          reason: 'Please start from the first outlet in the route.',
        };
      }

      // ✅ If no active outlet → allow first outlet only
      // if (!activeOutlet) {
      //   return {
      //     allowed: true,
      //     reason: 'Please start from the first outlet in the route.',
      //   };
      // }

      // // ❌ Block previous outlets (already passed)
      // if (outlet.sequence < activeOutlet.sequence) {
      //   return {
      //     allowed: false,
      //     reason: 'This outlet was already passed. Please follow the route sequence.',
      //   };
      // }

      // // ✅ Allow next outlet
      // if (outlet.sequence === activeOutlet.sequence + 1) {
      //   return { allowed: true, reason: 'Next outlet in route' };
      // }

      // // ❌ Block skipping outlets
      // if (outlet.sequence > activeOutlet.sequence + 1) {
      //   return {
      //     allowed: false,
      //     reason: `Please complete ${activeOutlet.name} first before visiting this outlet.`,
      //   };
      // }

      return { allowed: true };
    },
    [activeRoute, sortedOutlets],
  );

  const handleVisitAction = useCallback(
    (customerId: string) => {
      // const outlet = outlets.find((o) => o.customerId === customerId);
      // if (!outlet) return;

      // const { allowed, reason } = canVisitOutlet(outlet);

      // if (!allowed) {
      //   Alert.alert('Cannot Visit Outlet', reason || 'Please follow the route sequence.');
      //   return;
      // }

      router.push(`/outlets/${customerId}`);
    },
    [outlets, canVisitOutlet],
  );

  const handleCreateCustomer = async (formValue: any) => {
    formValue.routeId = activeRoute?.routeId;
    const response = await outletService?.createCustomer(formValue);
    if (response.success) {
      toast.success(response.message as any);
      setShowCustomerCreateModal(false);
      getRouteOutlets();
    }
  };

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
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open maps application');
      });
    }
  }, []);

  const endRoute = () => {
    setShowEndRouteConfirm(false);
    Alert.alert(
      'Route Completed',
      `Great job! You have completed ${computedStats.completedCount} out of ${outlets.length} visits.\nTotal Order Value: ${formatCurrency(computedStats.totalOrderValue)}`,
    );
  };

  const markComplete = useCallback(async (currentOutletId: string) => {
    console.log(activeVisist, '=======================active Visit=================');
    const response = await outletService.completeVisit(activeVisist?.visitId);
    if (response.success) {
      toast.success('Visit successfully completed.');
      getRouteOutlets();
    }
  }, []);

  // ========== WEB MAP COMPONENT ==========
  const WebMapComponent = ({ onMarkerClick }: { onMarkerClick?: (outlet: Outlet) => void }) => {
    const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <script>
        const currentLocation = [${currentLocation.latitude}, ${currentLocation.longitude}];
        const outlets = ${JSON.stringify(outlets)};

        const map = L.map('map').setView(currentLocation, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Current Location
        L.marker(currentLocation)
          .bindPopup('📍 Current Location')
          .addTo(map);

        // Outlet Markers
        outlets.forEach((outlet, index) => {
          const color = outlet.visitStatus === 'COMPLETED' ? '#10B981' : 
                       outlet.visitStatus === 'ACTIVE' ? '#8B5CF6' : '#F59E0B';

          const stopIcon = L.divIcon({
            html: '<div style="background:' + color + '; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; border:2px solid white;">' + (index + 1) + '</div>',
            iconSize: [36, 36]
          });

          const marker = L.marker([outlet.geoTag.lat, outlet.geoTag.lng], { icon: stopIcon })
            .bindPopup('<b>' + outlet.name + '</b><br/>' + outlet.address.line1)
            .addTo(map);

          marker.on('click', () => {
            window.parent.postMessage(JSON.stringify({ type: 'markerClick', outlet: outlet }), '*');
          });
        });

        // Real Route Using OSRM
        const routePoints = [
          currentLocation,
          ...outlets.map(c => [c.geoTag.lat, c.geoTag.lng])
        ];

        const coordsString = routePoints
          .map(p => p[1] + ',' + p[0])
          .join(';');

        fetch('https://router.project-osrm.org/route/v1/driving/' + coordsString + '?overview=full&geometries=geojson')
          .then(res => res.json())
          .then(data => {
            if (!data.routes || !data.routes.length) return;

            const route = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

            L.polyline(route, {
              color: '#8B5CF6',
              weight: 5
            }).addTo(map);

            const bounds = L.latLngBounds(route);
            map.fitBounds(bounds, { padding: [50, 50] });
          })
          .catch(err => {
            console.log('OSRM error:', err);
            // fallback (straight line)
            L.polyline(routePoints, { color: '#8B5CF6', weight: 4 }).addTo(map);
            const bounds = L.latLngBounds(routePoints);
            map.fitBounds(bounds, { padding: [50, 50] });
          });
      </script>
    </body>
    </html>
  `;

    React.useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'markerClick' && onMarkerClick) {
            onMarkerClick(data.outlet);
          }
        } catch (e) {}
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onMarkerClick]);

    return (
      <iframe
        srcDoc={mapHTML}
        style={{ width: '100%', height: '100%', border: 0 }}
        title="Route Map"
      />
    );
  };

  // ========== NATIVE MAP COMPONENT ==========
  const NativeMapComponent = ({ onMarkerClick }: { onMarkerClick?: (outlet: Outlet) => void }) => {
    if (!MapView) {
      return (
        <View style={styles.fullScreenMap}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.fullScreenMapPlaceholder}
          >
            <Feather name="map" size={64} color={colors.surface} />
            <Text style={styles.fullScreenMapText}>Loading Map...</Text>
          </LinearGradient>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.fullScreenMap}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={currentLocation}>
          <View style={styles.fullScreenCurrentMarker}>
            <View style={styles.fullScreenCurrentDot} />
          </View>
        </Marker>

        {outletsWithDistance.map((outlet: Outlet, index: number) => (
          <Marker
            key={outlet._id}
            coordinate={{
              latitude: outlet.geoTag?.lat || currentLocation.latitude,
              longitude: outlet.geoTag?.lng || currentLocation.longitude,
            }}
            title={outlet.name}
            description={outlet.address?.line1}
            onPress={() => onMarkerClick?.(outlet)}
          >
            <View
              style={[
                styles.fullScreenMarker,
                outlet.visitStatus === 'ACTIVE' && styles.fullScreenMarkerCurrent,
                outlet.visitStatus === 'COMPLETED' && styles.fullScreenMarkerCompleted,
              ]}
            >
              <Text style={styles.fullScreenMarkerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor={colors.primary} strokeWidth={5} />
        )}
      </MapView>
    );
  };

  // ========== EXPANDABLE OUTLET CARD ==========
  const ExpandableOutletCard = ({ outlet, index }: { outlet: Outlet; index: number }) => {
    const isExpanded = expandedOutlets.has(outlet._id);
    const visitStatus = outlet.visitStatus;
    const isActive = visitStatus === 'ACTIVE';
    const isCompleted = visitStatus === 'COMPLETED';
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

    const { allowed: canVisit, reason: blockReason } = canVisitOutlet(outlet);
    const isBlocked =
      !canVisit &&
      visitStatus !== 'ACTIVE' &&
      visitStatus !== 'COMPLETED' &&
      visitStatus !== 'NOT_VISITED';

    const getPriorityColor = () => {
      switch (outlet.priority) {
        case 'high':
          return colors.error;
        case 'medium':
          return colors.warning;
        default:
          return colors.info;
      }
    };

    const getStatusColors = () => {
      if (isCompleted)
        return { bg: colors.success + '15', border: colors.success, text: colors.success };
      if (isActive)
        return { bg: colors.primary + '15', border: colors.primary, text: colors.primary };
      if (isBlocked) return { bg: colors.error + '15', border: colors.error, text: colors.error };
      return { bg: colors.warning + '15', border: colors.warning, text: colors.warning };
    };

    const statusColors = getStatusColors();

    return (
      <View
        style={[
          styles.expandableCard,
          isActive && styles.expandableCardCurrent,
          isCompleted && styles.expandableCardCompleted,
          isBlocked && styles.expandableCardBlocked,
        ]}
      >
        {/* Confirmation Modal for Mark Complete */}
        <ConfirmationModal
          visible={showCompleteConfirm}
          title="Complete Visit"
          message={`Mark "${outlet.name}" as completed?`}
          onConfirm={() => {
            setShowCompleteConfirm(false);
            markComplete(outlet._id);
          }}
          onCancel={() => setShowCompleteConfirm(false)}
          confirmText="Yes, Complete"
          cancelText="Cancel"
          confirmVariant="success"
        />

        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(outlet._id)}
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
                <View style={styles.headerIconsRow}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert('Call', `Calling ${outlet.phoneNumber}`);
                    }}
                    style={styles.headerIconButton}
                  >
                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleNavigation(outlet);
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
                {isCompleted ? 'Done' : isActive ? 'Active' : isBlocked ? 'Blocked' : 'Pending'}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Blocked Reason */}
            {isBlocked && blockReason && (
              <View style={[styles.blockedWarning, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={[styles.blockedWarningText, { color: colors.error }]}>
                  {blockReason}
                </Text>
              </View>
            )}

            {/* Order Value Card */}
            <LinearGradient
              colors={[colors.primary + '08', colors.primary + '04']}
              style={styles.orderCard}
            >
              <View style={styles.orderCardLeft}>
                <Text style={styles.orderLabel}>Order Value</Text>
                <Text style={styles.orderValue}>{formatCurrency(outlet.orderValue || 0)}</Text>
              </View>
              <View style={styles.orderCardRight}>
                <MaterialIcons name="receipt" size={32} color={colors.primary + '30'} />
              </View>
            </LinearGradient>

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <View style={styles.contactRow}>
                <Ionicons name="person-outline" size={16} color={colors.primary} />
                <Text style={styles.contactLabel}>Owner:</Text>
                <Text style={styles.contactValue}>{outlet.ownerName || 'N/A'}</Text>
              </View>

              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={styles.contactLabel}>Phone:</Text>
                <Text style={styles.contactValue}>{outlet.phoneNumber || 'N/A'}</Text>
              </View>

              {outlet.lastVisitedAt && (
                <View style={styles.contactRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={styles.contactLabel}>Last Visit:</Text>
                  <Text style={styles.contactValue}>
                    {new Date(outlet.lastVisitedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <AppButton
                title={isCompleted ? 'Revisit' : isBlocked ? 'Blocked' : 'Continue'}
                variant={isBlocked ? 'disabled' : 'outline'}
                size="small"
                leftIcon={
                  !isBlocked && (
                    <Ionicons
                      name={isCompleted ? 'refresh-outline' : 'arrow-forward-outline'}
                      size={18}
                      color={colors.primary}
                    />
                  )
                }
                onPress={() => !isBlocked && handleVisitAction(outlet.customerId)}
                style={styles.actionButton}
                disabled={isBlocked}
              />

              {isActive && (outlet?.hasSale as any) && (
                <AppButton
                  title="Mark Complete"
                  variant="primary"
                  size="small"
                  leftIcon={
                    <Ionicons name="checkmark-done-outline" size={18} color={colors.surface} />
                  }
                  onPress={() => setShowCompleteConfirm(true)}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const OutletDetailModal = () => (
    <Modal visible={!!selectedOutlet} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={() => setSelectedOutlet(null)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <ScrollView style={styles.detailModal} showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.detailHeader}
              >
                <TouchableOpacity
                  style={styles.detailClose}
                  onPress={() => setSelectedOutlet(null)}
                >
                  <Ionicons name="close" size={24} color={colors.surface} />
                </TouchableOpacity>
                <View style={styles.detailAvatar}>
                  <MaterialIcons name="store" size={40} color={colors.primary} />
                </View>
                <Text style={styles.detailName}>{selectedOutlet?.name}</Text>
                <Text style={styles.detailAddress}>{selectedOutlet?.address?.line1}</Text>
              </LinearGradient>

              <View style={styles.detailBody}>
                <View style={styles.detailInfoGrid}>
                  <View style={styles.detailInfoItem}>
                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                    <Text style={styles.detailInfoLabel}>Phone</Text>
                    <Text style={styles.detailInfoValue}>
                      {selectedOutlet?.phoneNumber || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <MaterialIcons name="person-outline" size={20} color={colors.primary} />
                    <Text style={styles.detailInfoLabel}>Owner</Text>
                    <Text style={styles.detailInfoValue}>{selectedOutlet?.ownerName || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailInfoItem}>
                    <MaterialIcons name="attach-money" size={20} color={colors.primary} />
                    <Text style={styles.detailInfoLabel}>Order Value</Text>
                    <Text style={styles.detailInfoValue}>
                      {formatCurrency(selectedOutlet?.orderValue || 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={styles.modalIconButton}
                    onPress={() => {
                      if (selectedOutlet) {
                        setSelectedOutlet(null);
                        handleNavigation(selectedOutlet);
                      }
                    }}
                  >
                    <Ionicons name="navigate-outline" size={20} color={colors.info} />
                    <Text style={[styles.modalIconButtonText, { color: colors.info }]}>
                      Navigate
                    </Text>
                  </TouchableOpacity>

                  <AppButton
                    title="View Details"
                    variant="primary"
                    size="small"
                    rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.surface} />}
                    onPress={() => {
                      setSelectedOutlet(null);
                      if (selectedOutlet) {
                        router.push(`/outlets/${selectedOutlet.customerId}`);
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // ========== RENDER ==========
  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <View style={styles.routeInfoContainer}>
            <View style={styles.routeHeaderRow}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{activeRoute?.name || 'Active Route'}</Text>
                <Text style={styles.routeDate}>{new Date().toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.addOutletButton}
                onPress={() => setShowCustomerCreateModal(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.surface + '33', colors.surface + '15']}
                  style={styles.addOutletGradient}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
                  <Text style={styles.addOutletText}>Add Outlet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressPercent}>{Math.round(computedStats.progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, { width: `${computedStats.progress}%` }]}
              />
            </View>
            <Text style={styles.progressStats}>
              {computedStats.completedCount} of {outlets.length} outlets completed
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="clock" size={18} color={colors.surface} />
              </View>
              <Text style={styles.statValue}>{Math.ceil(outlets.length * 0.5)}</Text>
              <Text style={styles.statLabel}>Est. Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Feather name="map-pin" size={18} color={colors.surface} />
              </View>
              <Text style={styles.statValue}>{computedStats.totalDistance.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Distance (km)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <MaterialIcons name="attach-money" size={18} color={colors.surface} />
              </View>
              <Text style={styles.statValue}>{formatCurrency(computedStats.totalOrderValue)}</Text>
              <Text style={styles.statLabel}>Pipeline</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Next Outlet Indicator */}
        {nextOutlet && (
          <View style={styles.nextOutletCard}>
            <LinearGradient
              colors={[colors.success + '15', colors.success + '05']}
              style={styles.nextOutletGradient}
            >
              <Ionicons name="arrow-forward-circle" size={24} color={colors.success} />
              <View style={styles.nextOutletContent}>
                <Text style={styles.nextOutletLabel}>Next Outlet</Text>
                <Text style={styles.nextOutletName}>{nextOutlet.name}</Text>
                <Text style={styles.nextOutletDistance}>
                  {nextOutlet.distance?.toFixed(1)} km away
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Map Preview Card */}
        {outlets.length > 0 && (
          <TouchableOpacity
            style={styles.mapPreviewCard}
            onPress={() => setShowMapModal(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.mapPreviewGradient}
            >
              <View style={styles.mapPreviewContent}>
                <View style={styles.mapPreviewIcon}>
                  <Feather name="map" size={24} color={colors.surface} />
                </View>
                <View style={styles.mapPreviewText}>
                  <Text style={styles.mapPreviewTitle}>View Route Map</Text>
                  <Text style={styles.mapPreviewSubtitle}>
                    {outlets.length} outlets • {computedStats.totalDistance.toFixed(1)} km
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.surface} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outlets' && styles.tabActive]}
            onPress={() => setActiveTab('outlets')}
          >
            <Text style={[styles.tabText, activeTab === 'outlets' && styles.tabTextActive]}>
              Outlets ({outlets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
            onPress={() => setActiveTab('summary')}
          >
            <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
              Route Summary
            </Text>
          </TouchableOpacity>
        </View>

        {/* Outlet List */}
        {activeTab === 'outlets' ? (
          <View style={styles.outletList}>
            {outletsWithDistance.map((outlet: Outlet, index: number) => (
              <ExpandableOutletCard key={outlet._id} outlet={outlet} index={index} />
            ))}
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <LinearGradient
              colors={[colors.surface, colors.primaryContrast]}
              style={styles.infoCard}
            >
              <View style={styles.summaryHeader}>
                <Feather name="check-circle" size={40} color={colors.success} />
                <Text style={styles.infoCardTitle}>Route Summary</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Total Distance</Text>
                </View>
                <Text style={styles.summaryValue}>{computedStats.totalDistance.toFixed(1)} km</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Estimated Time</Text>
                </View>
                <Text style={styles.summaryValue}>{Math.ceil(outlets.length * 0.5)} hours</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Total Outlets</Text>
                </View>
                <Text style={styles.summaryValue}>{outlets.length}</Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Completed</Text>
                </View>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {computedStats.completedCount}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Remaining</Text>
                </View>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>
                  {outlets.length - computedStats.completedCount}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>Pipeline Value</Text>
                </View>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  {formatCurrency(computedStats.totalOrderValue)}
                </Text>
              </View>
            </LinearGradient>

            {/* <TouchableOpacity
              style={styles.endRouteButton}
              onPress={() => setShowEndRouteConfirm(true)}
            >
              <LinearGradient
                colors={[colors.error, colors.errorDark]}
                style={styles.endRouteGradient}
              >
                <Ionicons name="flag" size={20} color={colors.surface} />
                <Text style={styles.endRouteButtonText}>End Route</Text>
              </LinearGradient>
            </TouchableOpacity> */}
          </View>
        )}
      </Animated.ScrollView>

      {/* End Route Confirmation Modal */}
      <Modal visible={showEndRouteConfirm} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowEndRouteConfirm(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <View style={[styles.confirmIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="flag-outline" size={48} color={colors.error} />
              </View>
              <Text style={styles.confirmTitle}>End Route?</Text>
              <Text style={styles.confirmText}>
                You have completed {computedStats.completedCount} out of {outlets.length} visits.
                {'\n'}Total pipeline value: {formatCurrency(computedStats.totalOrderValue)}
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

      {/* Map Modal */}
      <AppModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        size="full"
        animation="slide"
        showHeader={false}
        showBackdrop={false}
        closeOnBackdropPress={false}
        dismissible={true}
        scrollable={false}
        style={{ flex: 1 }}
        showCloseButton={false}
        contentStyle={{
          flex: 1,
          padding: 0,
          margin: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity style={styles.mapCloseButton} onPress={() => setShowMapModal(false)}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {Platform.OS === 'web' ? (
            <WebMapComponent
              onMarkerClick={(outlet) => {
                setSelectedOutlet(outlet);
                setShowMapModal(false);
              }}
            />
          ) : (
            <NativeMapComponent
              onMarkerClick={(outlet) => {
                setSelectedOutlet(outlet);
                setShowMapModal(false);
              }}
            />
          )}
        </View>
      </AppModal>

      <OutletDetailModal />
      <CustomerCreateModal
        visible={showCustomerCreteModal}
        onClose={() => setShowCustomerCreateModal(false)}
        onSubmit={handleCreateCustomer}
      />
    </SafeAreaView>
  );
}

// ============= STYLES =============
const useStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    nextOutletCard: {
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      marginTop: -utils.spacing[2],
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    nextOutletGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[3],
      gap: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.success + '30',
    } as ViewStyle,

    nextOutletContent: {
      flex: 1,
    } as ViewStyle,

    nextOutletLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.success,
      fontWeight: '600',
      textTransform: 'uppercase',
    } as TextStyle,

    nextOutletName: {
      fontSize: utils.fontSize.md,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginTop: 2,
    } as TextStyle,

    nextOutletDistance: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    expandableCardBlocked: {
      opacity: 0.7,
      borderColor: colors.error,
    } as ViewStyle,

    blockedWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      padding: utils.spacing[2],
      borderRadius: utils.borderRadius.sm,
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    blockedWarningText: {
      fontSize: utils.fontSize.xs,
      flex: 1,
    } as TextStyle,
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    fullScreenContainer: {
      flex: 1,
      backgroundColor: 'black',
      position: 'relative',
    } as ViewStyle,

    mapCloseButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 40,
      left: 16,
      zIndex: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: utils.borderRadius.full,
      padding: 8,
    } as ViewStyle,

    header: {
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[6],
      borderBottomLeftRadius: utils.borderRadius.xl,
      borderBottomRightRadius: utils.borderRadius.xl,
    } as ViewStyle,

    routeInfoContainer: {
      paddingHorizontal: utils.spacing[5],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    routeName: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    routeDate: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
    } as TextStyle,

    progressContainer: {
      paddingHorizontal: utils.spacing[5],
      marginBottom: utils.spacing[6],
    } as ViewStyle,

    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressTitle: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    progressPercent: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
    } as TextStyle,

    progressBar: {
      height: 8,
      backgroundColor: colors.surface + '33',
      borderRadius: utils.borderRadius.full,
      overflow: 'hidden',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressFill: {
      height: '100%',
      backgroundColor: colors.warning,
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    progressStats: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'B3',
    } as TextStyle,

    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[5],
    } as ViewStyle,

    statItem: {
      alignItems: 'center',
      flex: 1,
    } as ViewStyle,

    statIcon: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    statValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 2,
    } as TextStyle,

    statLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'B3',
    } as TextStyle,

    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.surface + '33',
    } as ViewStyle,

    mapPreviewCard: {
      marginHorizontal: utils.spacing[4],
      marginTop: -utils.spacing[4],
      marginBottom: utils.spacing[2],
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    } as ViewStyle,

    mapPreviewGradient: {
      padding: utils.spacing[4],
    } as ViewStyle,

    mapPreviewContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
    } as ViewStyle,

    mapPreviewIcon: {
      width: 48,
      height: 48,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    mapPreviewText: {
      flex: 1,
    } as ViewStyle,

    mapPreviewTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 4,
    } as TextStyle,

    mapPreviewSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'CC',
    } as TextStyle,

    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[5],
      backgroundColor: colors.surface,
      borderTopLeftRadius: utils.borderRadius.xl,
      borderTopRightRadius: utils.borderRadius.xl,
    } as ViewStyle,

    tab: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    } as ViewStyle,

    tabActive: {
      borderBottomColor: colors.primary,
    } as ViewStyle,

    tabText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    tabTextActive: {
      color: colors.primary,
    } as TextStyle,

    outletList: {
      marginTop: utils.spacing[4],
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    expandableCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    } as ViewStyle,

    expandableCardCurrent: {
      borderWidth: 2,
      borderColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,

    expandableCardCompleted: {
      opacity: 0.85,
    } as ViewStyle,

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: utils.spacing[3],
    } as ViewStyle,

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    statusIndicator: {
      width: 44,
      height: 44,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    statusNumber: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    headerInfo: {
      flex: 1,
    } as ViewStyle,

    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    } as ViewStyle,

    outletName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    headerIconsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    } as ViewStyle,

    headerIconButton: {
      padding: 4,
    } as ViewStyle,

    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    stopAddress: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    } as ViewStyle,

    distanceText: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    headerRight: {
      alignItems: 'flex-end',
      gap: 4,
    } as ViewStyle,

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: utils.borderRadius.sm,
    } as ViewStyle,

    statusBadgeText: {
      fontSize: 11,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    expandedContent: {
      padding: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.primaryContrast,
      gap: utils.spacing[3],
    } as ViewStyle,

    orderCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    orderCardLeft: {
      flex: 1,
    } as ViewStyle,

    orderLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    } as TextStyle,

    orderValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    orderCardRight: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    contactSection: {
      gap: 8,
    } as ViewStyle,

    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    contactLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 70,
    } as TextStyle,

    contactValue: {
      fontSize: 12,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    actionButtonsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    } as ViewStyle,

    actionButton: {
      flex: 1,
    } as ViewStyle,

    infoContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[6],
      paddingBottom: utils.spacing[8],
    } as ViewStyle,

    infoCard: {
      padding: utils.spacing[6],
      borderRadius: utils.borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    summaryHeader: {
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    infoCardTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginTop: utils.spacing[2],
    } as TextStyle,

    summaryDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: utils.spacing[4],
    } as ViewStyle,

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    summaryLeft: {
      flex: 1,
    } as ViewStyle,

    summaryLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    summaryValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    endRouteButton: {
      marginTop: utils.spacing[6],
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    endRouteGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
      paddingVertical: utils.spacing[4],
    } as ViewStyle,

    endRouteButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    confirmModal: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[6],
      width: width * 0.85,
      alignItems: 'center',
    } as ViewStyle,

    confirmIcon: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    confirmTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    confirmText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[6],
    } as TextStyle,

    confirmButtons: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      width: '100%',
    } as ViewStyle,

    confirmCancel: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.divider,
      alignItems: 'center',
    } as ViewStyle,

    confirmCancelText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    confirmEnd: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.error,
      alignItems: 'center',
    } as ViewStyle,

    confirmEndText: {
      fontSize: utils.fontSize.md,
      color: colors.surface,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    fullScreenMap: {
      flex: 1,
    } as ViewStyle,

    fullScreenMapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenMapText: {
      marginTop: utils.spacing[4],
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    fullScreenCurrentMarker: {
      width: 24,
      height: 24,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenCurrentDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
    } as ViewStyle,

    fullScreenMarker: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,

    fullScreenMarkerCurrent: {
      backgroundColor: colors.primary,
      borderColor: colors.surface,
      width: 44,
      height: 44,
    } as ViewStyle,

    fullScreenMarkerCompleted: {
      borderColor: colors.success,
      opacity: 0.7,
    } as ViewStyle,

    fullScreenMarkerText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.primary,
    } as TextStyle,

    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.textPrimary + '80',
    } as ViewStyle,

    detailModal: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      overflow: 'hidden',
    } as ViewStyle,

    detailHeader: {
      padding: utils.spacing[8],
      alignItems: 'center',
      position: 'relative',
    } as ViewStyle,

    detailClose: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    detailAvatar: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    detailName: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 4,
      textAlign: 'center',
    } as TextStyle,

    detailAddress: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'E6',
      textAlign: 'center',
    } as TextStyle,

    detailBody: {
      padding: utils.spacing[6],
      gap: utils.spacing[4],
    } as ViewStyle,

    detailInfoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: utils.spacing[6],
      gap: utils.spacing[3],
    } as ViewStyle,

    detailInfoItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.primaryContrast,
      padding: utils.spacing[4],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
    } as ViewStyle,

    detailInfoLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    detailInfoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    modalButtonsRow: {
      flexDirection: 'row',
      gap: 12,
    } as ViewStyle,

    modalIconButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.background,
    } as ViewStyle,

    modalIconButtonText: {
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,
    routeHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    routeInfo: {
      flex: 1,
    } as ViewStyle,

    addOutletButton: {
      marginLeft: utils.spacing[3],
    } as ViewStyle,

    addOutletGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.surface + '50',
    } as ViewStyle,

    addOutletText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.surface,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
