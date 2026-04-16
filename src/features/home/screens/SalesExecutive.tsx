// // SalesExecutiveScreen.tsx (Fixed)
// import React, { useState, useRef, useEffect } from 'react';
// import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { useCameraPermissions } from 'expo-camera';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';

// // Components
// import { StartDayButton } from '../components/sales-executive/StartDayButton';
// import { Footer } from '../components/sales-executive/Footer';
// import { CurrentActivityCard } from '../components/sales-executive/CurrentActivityCard';
// import { QuickActionsSection } from '../components/sales-executive/QuickActionSection';
// import { StatsOverviewSection } from '../components/sales-executive/StatusOverviewSection';
// import { MonthlyBudgetSection } from '../components/sales-executive/MonthyBudgetSection';
// import { TodayActivitiesSection } from '../components/sales-executive/TodayActivitySection';
// import { StartDayModal } from '../components/models/StartDayModal';
// import { VanChangeModal } from '../components/models/VanChangedModel';
// import { RouteSelectionModal } from '../components/models/RouteSelectionModal';
// import { ChangeActivityModal } from '../components/models/ChangeActivityModal';
// import { LoadSummaryModal } from '../components/models/LoadSummaryModal';

// // Constants
// import {
//   MOCK_DATA,
//   QUICK_ACTIONS,
//   ACTIVITY_TYPES,
//   OTHER_WORK_OPTIONS,
//   ASSIGNED_VAN,
//   LOAD_SUMMARY_DATA,
// } from '../constants/mockData';

// // Types
// import { OtherWorkOption } from '../types/salesExecutive.types';

// import { Van } from '../types/van.types';
// import { ActivityType, TodayActivity } from '../types/activity.types';
// import { CameraModal } from '@/core/components/Camera/CameraModal';
// import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
// import { homeService } from '../services/home.service';
// import { AppText, ConfirmationModal } from '@/core/components';
// import { ApiResponse } from '@/core/network';
// import { outletService } from '@/features/outlet/services/outlet.service';
// import { useOutletStore } from '@/core/store/outlet.store';
// import { useVisitGuard } from '@/shared/hooks/useVisitGuard';
// import { Route, useRouteStore } from '@/core/store/route.store';
// import { vanService } from '@/shared/services/van.service';
// import { DayEndSummaryModal } from '../components/models/DayEndSummaryModal';
// import { useAuthStore } from '@/core/store/auth.store';
// import { fontSize } from '@/shared/theme';
// import { toast } from '@/core/utils';

// export default function SalesExecutiveScreen() {
//   const { colors } = useTheme();
//   const styles = createStyles(colors);
//   const [refreshing, setRefreshing] = useState(false);
//   const [dayStarted, setDayStarted] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [changeModalVisible, setChangeModalVisible] = useState(false);
//   const [routeModalVisible, setRouteModalVisible] = useState(false);
//   const [vanChangeModalVisible, setVanChangeModalVisible] = useState(false);
//   const [cameraVisible, setCameraVisible] = useState(false);
//   const [loadSummaryVisible, setLoadSummaryVisible] = useState(false);

//   const [selectedActivity, setSelectedActivity] = useState('');
//   const [selectedActivityColor, setSelectedActivityColor] = useState('');
//   const [selectedActivityIcon, setSelectedActivityIcon] = useState('');
//   // const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
//   const [mappedVan, setMappedVan] = useState<Van>(ASSIGNED_VAN);
//   const [showOtherOptions, setShowOtherOptions] = useState(false);
//   const [showChangeOtherOptions, setShowChangeOtherOptions] = useState(false);
//   const [startTime, setStartTime] = useState<string | null>('');
//   const [userPhoto, setUserPhoto] = useState<string | null>(null);
//   const [pendingActivity, setPendingActivity] = useState<ActivityType | OtherWorkOption | null>(
//     null,
//   );
//   const [isChangingActivity, setIsChangingActivity] = useState(false);
//   const [otherWorkStartTime, setOtherWorkStartTime] = useState<string | null>(null);
//   const [todayActivities, setTodayActivities] = useState<TodayActivity[]>([]);
//   const [vanChangeReason, setVanChangeReason] = useState('');
//   const [currentActivity, setCurrentActivity] = useState<string | null>('');
//   const [filteredActivityTypes, setFilteredActivityTypes] = useState(ACTIVITY_TYPES);

//   const cameraRef = useRef<any>(null);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [workSessionId, setWorkSessionId] = useState<string>('');
//   const [filteredOtherWorkOptions, setFilteredOtherWorkOptions] =
//     useState<OtherWorkOption[]>(OTHER_WORK_OPTIONS);
//   const [routes, setRoutes] = useState<any>();
//   const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
//   const activeVisit = useOutletStore.getState().activeVisit;
//   const clearVisit = useOutletStore((s) => s.clearVisit);
//   const { setSelectedRoute, selectedRoute } = useRouteStore();
//   const [showDayEndConfirm, setShowDayEndConfirm] = useState<boolean>(false);
//   const daySummary: any = {};
//   const currency = 'K';
//   const van = useRouteStore.getState().van;
//   const user = useAuthStore.getState().user;
//   const [dayEndSummary, setDayEndSummary] = useState<any>(null);
//   const {setVan} = useRouteStore()

//   // const selectedRoute = useRouteStore((s) => s.selectedRoute);
//   const { guard } = useVisitGuard();

//   const greeting = (() => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good Morning';
//     if (hour < 17) return 'Good Afternoon';
//     return 'Good Evening';
//   })();

//   const overviewChips = [
//     {
//       label: 'Day Status',
//       value: dayStarted ? 'Active' : 'Not Started',
//       icon: dayStarted ? 'checkmark-circle-outline' : 'sunny-outline',
//       color: dayStarted ? colors.success : colors.warning,
//     },
//     {
//       label: 'Current Flow',
//       value: currentActivity || 'Ready to begin',
//       icon: 'flash-outline',
//       color: colors.primary,
//     },
//     {
//       label: 'Today Activities',
//       value: `${todayActivities.length}`,
//       icon: 'time-outline',
//       color: colors.info || colors.primary,
//     },
//   ];

//   useEffect(() => {
//     getDayStatus();
//     getVan();
//   }, []);

//   useEffect(() => {
//     if (!selectedRoute?.routeSessionId) return;

//     visitStatus();
//   }, [selectedRoute?.routeSessionId]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 2000);
//     getDayStatus();
//     getVan();
//   };

//   const handleStartDayPress = () => {
//     setModalVisible(true);
//     setShowOtherOptions(false);
//     setIsChangingActivity(false);
//   };

//   const handleChangeActivityPress = () => {
//     if (currentActivity === 'Retailing' && selectedRoute) {
//       setFilteredActivityTypes(ACTIVITY_TYPES.filter((a) => a.name !== 'Retailing'));
//     } else {
//       setFilteredActivityTypes(ACTIVITY_TYPES);
//       setFilteredOtherWorkOptions(OTHER_WORK_OPTIONS.filter((o) => o.name != currentActivity));
//     }
//     setChangeModalVisible(true);
//     setShowChangeOtherOptions(false);
//     setIsChangingActivity(true);
//   };

//   const handleActivitySelect = (activity: ActivityType) => {
//     console.log('Selected Activity:', activity);
//     if (activity.name === 'Other Work') {
//       setShowOtherOptions(true);
//     } else if (activity.name === 'Retailing') {
//       getRoutes();
//       setSelectedActivity(activity.name);
//       setModalVisible(false);
//       setVanChangeModalVisible(true);
//       setVanChangeReason('');
//       setIsChangingActivity(false);
//     }
//   };

//   const handleVanChangeSubmit = () => {
//     if (!vanChangeReason) {
//       Alert.alert('Error', 'Please select an option');
//       return;
//     }

//     setVanChangeModalVisible(false);

//     if (vanChangeReason !== 'No, same van') {
//       const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//       // setTodayActivities([vanChangeEntry, ...todayActivities]);
//     }

//     setRouteModalVisible(true);
//   };

//   const handleOtherWorkSelect = (option: OtherWorkOption) => {
//     console.log('Selected Other Work Option:', option);
//     setSelectedActivity(option.name);
//     setPendingActivity(option);
//     setModalVisible(false);
//     setShowOtherOptions(false);
//     openCamera();
//   };

//   const handleRouteSelect = (route: any) => {
//     setSelectedRoute(route);
//     setRouteModalVisible(false);
//     openCamera();
//   };

//   const handleChangeActivity = (activity: ActivityType) => {
//     if (activity.name === 'Other Work') {
//       if (activeVisit) {
//         toast.error('To Change activity, Please complete active visit.');
//         return;
//       }
//       setSelectedRoute(null);
//       setShowChangeOtherOptions(true);
//     } else if (activity.name === 'Retailing') {
//       getRoutes();
//       setSelectedActivity(activity.name);
//       setChangeModalVisible(false);
//       setVanChangeModalVisible(true);
//       setVanChangeReason('');
//       setIsChangingActivity(true);
//     }
//   };

//   const handleChangeRouteSelect = (route: Route) => {
//     setSelectedRoute(route);
//     setRouteModalVisible(false);
//     openCamera();
//   };

//   const handleChangeOtherWork = (option: OtherWorkOption) => {
//     setSelectedActivity(option.name);
//     setPendingActivity(option);
//     setChangeModalVisible(false);
//     setShowChangeOtherOptions(false);
//     openCamera();
//   };

//   const openCamera = async () => {
//     if (!permission?.granted) {
//       const result = await requestPermission();
//       if (!result.granted) {
//         Alert.alert('Permission Required', 'Camera permission is needed to take your photo');
//         return;
//       }
//     }
//     setCameraVisible(true);
//   };

//   // FIXED: handleCaptureImage - no parameters passed to takePhoto
//   const handleCaptureImage = async (photo: any) => {
//     if (photo && photo.uri) {
//       setUserPhoto(photo.uri);
//       setCameraVisible(false);

//       if (isChangingActivity) {
//         completeActivityChange();
//       } else {
//         if (selectedRoute) {
//           setLoadSummaryVisible(true);
//         } else {
//           handleStartDay();
//         }
//       }
//     } else {
//       console.error('No photo captured');
//       Alert.alert('Error', 'Failed to capture photo');
//     }
//   };

//   const handleLoadSummaryProceed = () => {
//     setLoadSummaryVisible(false);
//     handleStartDay();
//   };

//   const handleStartDay = async () => {
//     const playlod: DayStartPayload = {
//       activityName: selectedActivity,
//       routeId: selectedRoute?.routeId,
//       description: selectedRoute
//         ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`
//         : `Started ${pendingActivity?.name}`,
//       totalShops: selectedRoute?.totalShops,
//       routeName: selectedRoute?.name,
//       vanId: van?.vanId,
//     };
//     console.log('Day Start Payload:', selectedRoute);
//     // return;
//     try {
//       const response: ApiResponse<any> = await homeService.dayStart(playlod);
//       if (response?.statusCode === 201) {
//         getDayStatus();
//         toast.success('Your day successfully started.');
//       }
//     } catch (error) {}
//     return;
//   };

//   const completeActivityChange = async () => {
//     const playlod: CreateActivityPayload = {
//       name: selectedActivity,
//       routeId: selectedRoute?.routeId,
//       description: selectedRoute
//         ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`
//         : `Started ${pendingActivity?.name}`,
//       totalShops: selectedRoute?.totalShops,
//       routeName: selectedRoute?.name,
//       workSessionId,
//     };

//     try {
//       const response: any = await homeService.createActivity(playlod);
//       if (response.statusCode === 201) {
//         getDayStatus();
//       }
//     } catch (error) {}
//     return;
//     const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//     // const completedActivity: TodayActivity = {
//     //   id: Date.now().toString(),
//     //   type: selectedActivity.toLowerCase().replace(' ', '_'),
//     //   customer: selectedActivity === 'Retailing' ? selectedRoute?.name || 'Self' : 'Self',
//     //   time: currentTime,
//     //   status: 'completed',
//     //   notes:
//     //     selectedActivity === 'Retailing' && selectedRoute
//     //       ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
//     //       : `Completed ${selectedActivity}`,
//     // };

//     // if (pendingActivity) {
//     //   setSelectedActivity(pendingActivity.name);
//     //   setSelectedActivityColor(pendingActivity.color);
//     //   setSelectedActivityIcon(pendingActivity.icon);
//     //   setSelectedRoute(null);
//     //   setOtherWorkStartTime(currentTime);

//     //   // const newActivity: TodayActivity = {
//     //   //   id: (Date.now() + 1).toString(),
//     //   //   type: pendingActivity.name.toLowerCase().replace(' ', '_'),
//     //   //   customer: 'Self',
//     //   //   time: currentTime,
//     //   //   status: 'in_progress',
//     //   //   notes: `Started ${pendingActivity.name}`,
//     //   // };

//     //   // setTodayActivities([completedActivity, newActivity, ...todayActivities]);

//     //   Alert.alert('Activity Changed', `You're now working on ${pendingActivity.name}`);
//     //   setPendingActivity(null);
//     // } else if (selectedRoute) {
//     //   setSelectedActivity('Retailing');
//     //   setSelectedActivityColor('#4158D0');
//     //   setSelectedActivityIcon('storefront');
//     //   setOtherWorkStartTime(null);

//     //   // const newActivity: TodayActivity = {
//     //   //   id: (Date.now() + 1).toString(),
//     //   //   type: 'retailing',
//     //   //   customer: selectedRoute.name,
//     //   //   time: currentTime,
//     //   //   status: 'in_progress',
//     //   //   notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
//     //   // };

//     //   // setTodayActivities([completedActivity, newActivity, ...todayActivities]);

//     //   Alert.alert(
//     //     'Activity Changed',
//     //     `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
//     //   );
//     // }
//   };

//   const handleCloseModal = () => {
//     setModalVisible(false);
//     setShowOtherOptions(false);
//   };

//   const handleCloseChangeModal = () => {
//     setChangeModalVisible(false);
//     setShowChangeOtherOptions(false);
//   };

//   const handleCloseRouteModal = () => {
//     setRouteModalVisible(false);
//   };

//   const handleCloseVanChangeModal = () => {
//     setVanChangeModalVisible(false);
//   };

//   const handleCloseLoadSummary = () => {
//     setLoadSummaryVisible(false);
//   };

//   const handleCancelCamera = () => {
//     setCameraVisible(false);
//     // if (!dayStarted) {
//     //   setSelectedRoute(null);
//     //   setPendingActivity(null);
//     // }
//   };

//   const handleQuickAction = (route: string) => {
//     // if (route === '/outlets') {
//     //   return guard(() => {
//     //     router.push('/outlets');
//     //   });
//     // }

//     router.push(route);
//     // guard(() => {
//     // });
//   };

//   const fetchDayEndSummary = async () => {
//     console.log('Selected Route at Day End:', van);
//     const res: any = await vanService.fetchTodayStockSummary({ vanId: van?.vanId });
//     console.log('Stock Summary before day end:', res);
//     setDayEndSummary(res?.data);
//   };

//   const handleEndDay = async () => {
//     try {
//       const response = await homeService.dayComplete();

//       if (response.success) {
//         /* ===== RESET ALL STATE ===== */
//         toast.success("Your day successfully completed")
//         setDayStarted(false);
//         setWorkSessionId('');
//         setCurrentActivity(null);
//         setTodayActivities([]);
//         setStartTime(null);

//         setSelectedActivityColor('#4158D0');
//         setSelectedActivityIcon('storefront');

//         // Reset route
//         useRouteStore.getState().setSelectedRoute(null);
//       }
//     } catch (error) {
//       console.error('Error completing day:', error);
//     }
//   };

//   const getDayStatus = async () => {
//     try {
//       const response: any = await homeService.getDayStatus(workSessionId);

//       setDayStarted(response.data.status === 'ACTIVE');
//       console.log('Day Status Response:', response);

//       if (response.statusCode === 200) {
//         setWorkSessionId(response.data.workSessionId || '');

//         console.log('Day Status:', response.data.activeActivity);

//         setCurrentActivity(response?.data?.activeActivity?.name);
//         setTodayActivities(response?.data?.todayActivities || []);
//         setStartTime(response?.data?.activeActivity?.startTime);

//         setSelectedActivityColor('#4158D0');
//         setSelectedActivityIcon('storefront');

//         const selectedRoute = response?.data?.selectedRoute;
//         const van = response?.data?.van; // 👈 assuming API gives this (if not, ignore)

//         const routeStore = useRouteStore.getState();

//         /* ================= ROUTE ================= */

//         if (selectedRoute) {
//           routeStore.setSelectedRoute(selectedRoute);
//         } else {
//           routeStore.setSelectedRoute(null);
//         }

//         /* ================= VAN (Optional) ================= */

//         if (van) {
//           routeStore.setVan(van);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching day status:', error);
//     }
//   };

//   const getTodayActivities = async (workSessionId: string) => {
//     const response: any = await homeService.getTodayActivities(workSessionId);
//     if (response.statusCode === 200) {
//       setTodayActivities(response.data || []);
//       console.log('Today Activities:', response.data);
//     }
//   };

//   const getRoutes = async () => {
//     try {
//       const response: any = await homeService.getVanMappedRoutes();
//       if (response.statusCode === 200) {
//         if (response?.data?.routes?.length) {
//           setRoutes(
//             response.data.routes.map((item: any) => ({
//               name: item.route.name,
//               routeId: item.routeId,
//               totalShops: item.route?.outletCount,
//               distance: item.route.distance || 'N/A',
//             })),
//           );
//         }
//         console.log('Routes:', response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching routes:', error);
//     }
//   };

//   const getVan = async () => {
//     try {
//       const response: any = await homeService.getVan();

//       if (response.statusCode === 200) {
//         const van = response?.data?.[0] || null;

//         // ✅ Set in global store
//         useRouteStore.getState().setVan(van);

//         console.log('Van set in store:', van);
//       }
//     } catch (error) {
//       console.error('Error fetching van:', error);
//     }
//   };

//   const visitStatus = async () => {
//     try {
//       const query: any = {
//         workSessionId: selectedRoute?.workSessionId,
//         vanId: selectedRoute?.vanId,
//         routeSessionId: selectedRoute?.routeSessionId,
//       };

//       const response = await outletService.visitStatus(query);

//       const visit: any = response?.data;

//       if (!visit?.visitId) {
//         clearVisit(); // ✅ no active visit
//         return;
//       }

//       console.log('============visit=============', visit);

//       // ✅ map backend → store
//       setActiveVisit({
//         visitId: visit.visitId,
//         outlet: {
//           id: visit.outletId,
//           customerId: visit.outletId,
//           name: visit.outletName,
//           ownerName: visit.ownerName || '',
//           phoneNumber: visit.phoneNumber || '',
//           customerTypeId: visit.customerTypeId || '',
//           address: visit.address || '',
//           customerCategoryId: visit.customerCategoryId || '',
//           channelId: visit.channelId || '',
//           marketId: visit.marketId || '',
//           provinceId: visit.provinceId || '',
//           segmentation: visit.segmentation || '',
//           geoTag: visit.geoTag || '',
//           status: visit.outletStatus || 'active',
//           isDeleted: visit.isDeleted || false,
//         },
//         checkInTime: new Date(visit.checkInTime),
//         checkOutTime: visit.checkOutTime ? new Date(visit.checkOutTime) : undefined,
//         status: visit.status,
//         routeSessionId: visit?.routeSessionId,
//         customerId: visit?.customerId,
//       });
//     } catch (error) {
//       console.error('visitStatus error:', error);
//     }
//   };

//   const handleDayEndConfirmation = () => {
//     fetchDayEndSummary();
//     setShowDayEndConfirm(true);
//   };

//   const getDayEndTitle = () => {
//     return 'Confirm Day End';
//   };

//   const getDayEndMessage = () => {
//     let msg = '📊 DAY SUMMARY\n\n';

//     // msg += `🛒 Total Orders: ${daySummary?.totalOrders}\n`;
//     // msg += `💰 Total Sales: ${currency} ${daySummary?.totalSales.toFixed(2)}\n`;
//     // msg += `💵 Cash Collected: ${currency} ${daySummary?.cash.toFixed(2)}\n`;
//     // msg += `💳 Card: ${currency} ${daySummary?.card.toFixed(2)}\n`;
//     // msg += `👛 Wallet: ${currency} ${daySummary?.wallet.toFixed(2)}\n`;

//     // if (daySummary?.credit > 0) {
//     //   msg += `🏦 Credit: ${currency} ${daySummary?.credit.toFixed(2)}\n`;
//     // }

//     // if (daySummary.nonSaleCount > 0) {
//     //   msg += `🚫 Non-Sales: ${daySummary?.nonSaleCount}\n`;
//     // }

//     // msg += `\n📦 TOTAL COLLECTION: ${currency} ${daySummary?.totalCollection.toFixed(2)}\n`;

//     // msg += `\n⚠️ This will close your day. You cannot modify data after this.`;

//     return msg;
//   };

//   const getDayEndIcon = () => {
//     return <Ionicons name="clipboard-outline" size={56} color="#3F51B5" />;
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
//         }
//       >
//         <LinearGradient
//           colors={[colors.primary + '18', colors.background, colors.background]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 0.9, y: 1 }}
//           style={styles.heroSection}
//         >
//           <View style={styles.heroHeaderRow}>
//             <View style={styles.heroTextBlock}>
//               <AppText style={styles.heroEyebrow}>{greeting}</AppText>
//               <AppText style={styles.heroTitle}>{user?.name}</AppText>
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
//                 <Ionicons name="car-outline" size={16} color="#666" />
//                 <AppText style={{ fontSize: 15, fontWeight: 'bold' }}>
//                   {van?.name}
//                   {van?.vanNumber ? ` - ${van.vanNumber}` : ''}
//                 </AppText>
//               </View>
//               {/* <AppText style={styles.heroSubtitle}>
//                 Track your day, jump into key actions fast, and keep route work moving smoothly.
//               </AppText> */}
//             </View>
//             <View style={styles.heroBadge}>
//               <Ionicons
//                 name={dayStarted ? 'play-circle-outline' : 'pause-circle-outline'}
//                 size={18}
//                 color={dayStarted ? colors.success : colors.warning}
//               />
//               <AppText
//                 style={[
//                   styles.heroBadgeText,
//                   { color: dayStarted ? colors.success : colors.warning },
//                 ]}
//               >
//                 {dayStarted ? 'On Duty' : 'Idle'}
//               </AppText>
//             </View>
//           </View>

//           {/* <View style={styles.heroChipsRow}>
//             {overviewChips.map((chip) => (
//               <View key={chip.label} style={styles.heroChip}>
//                 <View style={[styles.heroChipIcon, { backgroundColor: chip.color + '14' }]}>
//                   <Ionicons name={chip.icon as any} size={14} color={chip.color} />
//                 </View>
//                 <View style={styles.heroChipTextBlock}>
//                   <AppText style={styles.heroChipLabel}>{chip.label}</AppText>
//                   <AppText style={styles.heroChipValue} numberOfLines={1}>
//                     {chip.value}
//                   </AppText>
//                 </View>
//               </View>
//             ))}
//           </View> */}

//           <View style={styles.mainContent}>
//             {!dayStarted ? (
//               <StartDayButton onPress={handleStartDayPress} />
//             ) : (
//               <CurrentActivityCard
//                 selectedActivity={currentActivity}
//                 selectedActivityColor={selectedActivityColor}
//                 selectedActivityIcon={selectedActivityIcon}
//                 startTime={startTime}
//                 otherWorkStartTime={otherWorkStartTime}
//                 selectedRoute={selectedRoute}
//                 assignedVan={mappedVan}
//                 onPressChange={handleChangeActivityPress}
//                 onPressEnd={handleDayEndConfirmation}
//               />
//             )}
//           </View>

//           <View style={styles.sectionStack}>
//             <View style={styles.sectionCard}>
//               <QuickActionsSection
//                 actions={QUICK_ACTIONS}
//                 onPressAction={(route: any) => handleQuickAction(route)}
//               />
//             </View>

//             <View style={styles.sectionCard}>
//               <StatsOverviewSection employeeId={user?.userId as any} />
//             </View>

//             {/* <View style={styles.sectionCard}>
//               <MonthlyBudgetSection
//                 targetAchieved={MOCK_DATA.targetAchieved}
//                 completedOrders={MOCK_DATA.completedOrders}
//                 onViewDetails={() => router.push('/targets')}
//               />
//             </View> */}

//             <View style={styles.sectionCard}>
//               <TodayActivitiesSection activities={todayActivities} />
//             </View>

//             <Footer lastUpdated={new Date().toLocaleTimeString()} />
//           </View>
//         </LinearGradient>
//       </ScrollView>

//       {/* Modals */}
//       <StartDayModal
//         visible={modalVisible}
//         showOtherOptions={showOtherOptions}
//         activityTypes={ACTIVITY_TYPES}
//         otherWorkOptions={OTHER_WORK_OPTIONS}
//         onClose={handleCloseModal}
//         onActivitySelect={handleActivitySelect}
//         onOtherWorkSelect={handleOtherWorkSelect}
//         onBackToOptions={() => setShowOtherOptions(false)}
//       />

//       <VanChangeModal
//         visible={vanChangeModalVisible}
//         vanChangeReason={vanChangeReason}
//         onClose={handleCloseVanChangeModal}
//         onSelectReason={setVanChangeReason}
//         onSubmit={handleVanChangeSubmit}
//       />

//       <RouteSelectionModal
//         visible={routeModalVisible}
//         routes={routes}
//         assignedVan={mappedVan}
//         vanChangeReason={vanChangeReason}
//         onClose={handleCloseRouteModal}
//         onSelectRoute={isChangingActivity ? handleChangeRouteSelect : handleRouteSelect}
//       />

//       <ChangeActivityModal
//         visible={changeModalVisible}
//         showChangeOtherOptions={showChangeOtherOptions}
//         selectedActivity={currentActivity}
//         activityTypes={filteredActivityTypes}
//         otherWorkOptions={filteredOtherWorkOptions}
//         onClose={handleCloseChangeModal}
//         onActivitySelect={handleChangeActivity}
//         onOtherWorkSelect={handleChangeOtherWork}
//         onBackToOptions={() => setShowChangeOtherOptions(false)}
//       />

//       <LoadSummaryModal
//         visible={loadSummaryVisible}
//         data={LOAD_SUMMARY_DATA}
//         onClose={handleCloseLoadSummary}
//         onProceed={handleLoadSummaryProceed}
//       />

//       <CameraModal
//         visible={cameraVisible}
//         cameraRef={cameraRef}
//         onClose={handleCancelCamera}
//         onCapture={handleCaptureImage}
//         onError={(error) => console.error('Camera error:', error)}
//         title="TAKE A SELFIE"
//         cameraProps={{
//           facing: 'front',
//           quality: 0.8,
//           autofocus: true,
//         }}
//       />

//       <ConfirmationModal
//         visible={showDayEndConfirm}
//         title={getDayEndTitle()}
//         message={getDayEndMessage()}
//         confirmText="Close Day"
//         cancelText="Cancel"
//         onCancel={() => setShowDayEndConfirm(false)}
//         onConfirm={handleEndDay}
//         loading={false}
//         type="info"
//         danger={true}
//         icon={getDayEndIcon()}
//       />

//       <DayEndSummaryModal
//         visible={showDayEndConfirm}
//         data={dayEndSummary}
//         onClose={() => setShowDayEndConfirm(false)}
//         onProceed={() => {
//           handleEndDay();
//           setShowDayEndConfirm(false);
//         }}
//       />
//     </View>
//   );
// }

// const createStyles = (colors: any) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//     },
//     scrollContent: {
//       paddingBottom: 32,
//     },
//     heroSection: {
//       paddingHorizontal: 16,
//       paddingTop: 16,
//       paddingBottom: 20,
//     },
//     heroHeaderRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       justifyContent: 'space-between',
//       gap: 12,
//       marginBottom: 16,
//     },
//     heroTextBlock: {
//       flex: 1,
//     },
//     heroEyebrow: {
//       fontSize: 12,
//       fontWeight: '700',
//       letterSpacing: 0.8,
//       textTransform: 'uppercase',
//       color: colors.primary,
//       marginBottom: 6,
//     },
//     heroTitle: {
//       fontSize: 26,
//       fontWeight: '800',
//       color: colors.textPrimary,
//       marginBottom: 6,
//     },
//     heroSubtitle: {
//       fontSize: 14,
//       lineHeight: 20,
//       color: colors.textSecondary,
//     },
//     heroBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 6,
//       paddingHorizontal: 10,
//       paddingVertical: 8,
//       borderRadius: 999,
//       backgroundColor: colors.surface,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     heroBadgeText: {
//       fontSize: 12,
//       fontWeight: '700',
//     },
//     heroChipsRow: {
//       gap: 10,
//     },
//     heroChip: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 12,
//       borderRadius: 16,
//       backgroundColor: colors.surface,
//       borderWidth: 1,
//       borderColor: colors.border + '1A',
//     },
//     heroChipIcon: {
//       width: 34,
//       height: 34,
//       borderRadius: 17,
//       alignItems: 'center',
//       justifyContent: 'center',
//       marginRight: 10,
//     },
//     heroChipTextBlock: {
//       flex: 1,
//     },
//     heroChipLabel: {
//       fontSize: 11,
//       fontWeight: '600',
//       color: colors.textSecondary,
//       marginBottom: 2,
//       textTransform: 'uppercase',
//     },
//     heroChipValue: {
//       fontSize: 14,
//       fontWeight: '700',
//       color: colors.textPrimary,
//     },
//     mainContent: {
//       marginBottom: 8,
//     },
//     sectionStack: {
//       gap: 14,
//       paddingBottom: 8,
//     },
//     sectionCard: {
//       backgroundColor: colors.surface,
//       borderRadius: 22,
//       paddingVertical: 6,
//       borderWidth: 1,
//       borderColor: colors.border + '1A',
//       shadowColor: colors.shadow || '#000',
//       shadowOffset: { width: 0, height: 8 },
//       shadowOpacity: 0.05,
//       shadowRadius: 16,
//       elevation: 2,
//     },
//   });

// SalesExecutiveScreen.tsx (Updated with Unified Modal for Day Start)
import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import { StartDayButton } from '../components/sales-executive/StartDayButton';
import { Footer } from '../components/sales-executive/Footer';
import { CurrentActivityCard } from '../components/sales-executive/CurrentActivityCard';
import { QuickActionsSection } from '../components/sales-executive/QuickActionSection';
import { StatsOverviewSection } from '../components/sales-executive/StatusOverviewSection';
import { TodayActivitiesSection } from '../components/sales-executive/TodayActivitySection';
import { UnifiedActionModal } from '../components/models/UnifiedActionModal';
import { LoadSummaryModal } from '../components/models/LoadSummaryModal';

// Constants
import {
  QUICK_ACTIONS,
  ACTIVITY_TYPES,
  OTHER_WORK_OPTIONS,
  ASSIGNED_VAN,
  LOAD_SUMMARY_DATA,
} from '../constants/mockData';

// Types
import { OtherWorkOption } from '../types/salesExecutive.types';
import { Van } from '../types/van.types';
import { ActivityType, TodayActivity } from '../types/activity.types';
import { CameraModal } from '@/core/components/Camera/CameraModal';
import { CreateActivityPayload, DayStartPayload } from '../types/home.types';
import { homeService } from '../services/home.service';
import { AppText, ConfirmationModal } from '@/core/components';
import { ApiResponse } from '@/core/network';
import { outletService } from '@/features/outlet/services/outlet.service';
import { useOutletStore } from '@/core/store/outlet.store';
import { useVisitGuard } from '@/shared/hooks/useVisitGuard';
import { Route, useRouteStore } from '@/core/store/route.store';
import { vanService } from '@/shared/services/van.service';
import { DayEndSummaryModal } from '../components/models/DayEndSummaryModal';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';

export default function SalesExecutiveScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [refreshing, setRefreshing] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);
  const [unifiedModalVisible, setUnifiedModalVisible] = useState(false);
  const [unifiedModalType, setUnifiedModalType] = useState<
    'van-change' | 'route-selection' | 'activity-change' | 'other-work'
  >('van-change');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [loadSummaryVisible, setLoadSummaryVisible] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedActivityColor, setSelectedActivityColor] = useState('');
  const [selectedActivityIcon, setSelectedActivityIcon] = useState('');
  const [mappedVan, setMappedVan] = useState<Van>(ASSIGNED_VAN);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [showChangeOtherOptions, setShowChangeOtherOptions] = useState(false);
  const [startTime, setStartTime] = useState<string | null>('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [pendingActivity, setPendingActivity] = useState<ActivityType | OtherWorkOption | null>(
    null,
  );
  const [isChangingActivity, setIsChangingActivity] = useState(false);
  const [otherWorkStartTime, setOtherWorkStartTime] = useState<string | null>(null);
  const [todayActivities, setTodayActivities] = useState<TodayActivity[]>([]);
  const [vanChangeReason, setVanChangeReason] = useState('');
  const [currentActivity, setCurrentActivity] = useState<string | null>('');
  const [filteredActivityTypes, setFilteredActivityTypes] = useState(ACTIVITY_TYPES);
  const [tempSelectedActivity, setTempSelectedActivity] = useState<ActivityType | null>(null);

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [workSessionId, setWorkSessionId] = useState<string>('');
  const [filteredOtherWorkOptions, setFilteredOtherWorkOptions] =
    useState<OtherWorkOption[]>(OTHER_WORK_OPTIONS);
  const [routes, setRoutes] = useState<any>();
  const setActiveVisit = useOutletStore((s) => s.setActiveVisit);
  const activeVisit = useOutletStore.getState().activeVisit;
  const clearVisit = useOutletStore((s) => s.clearVisit);
  const { setSelectedRoute, selectedRoute } = useRouteStore();
  const [showDayEndConfirm, setShowDayEndConfirm] = useState<boolean>(false);
  const currency = 'K';
  const van = useRouteStore.getState().van;
  const user = useAuthStore.getState().user;
  const [dayEndSummary, setDayEndSummary] = useState<any>(null);
  const { setVan } = useRouteStore();

  const { guard } = useVisitGuard();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  useEffect(() => {
    getDayStatus();
    getVan();
  }, []);

  useEffect(() => {
    if (!selectedRoute?.routeSessionId) return;
    visitStatus();
  }, [selectedRoute?.routeSessionId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
    getDayStatus();
    getVan();
  };

  const handleStartDayPress = () => {
    setUnifiedModalType('activity-change');
    setUnifiedModalVisible(true);
    setIsChangingActivity(false);
    setShowChangeOtherOptions(false);
    setTempSelectedActivity(null);
  };

  const handleChangeActivityPress = () => {
    if (currentActivity === 'Retailing' && selectedRoute) {
      setFilteredActivityTypes(ACTIVITY_TYPES.filter((a) => a.name !== 'Retailing'));
    } else {
      setFilteredActivityTypes(ACTIVITY_TYPES);
      setFilteredOtherWorkOptions(OTHER_WORK_OPTIONS.filter((o) => o.name != currentActivity));
    }
    setUnifiedModalType('activity-change');
    setUnifiedModalVisible(true);
    setShowChangeOtherOptions(false);
    setIsChangingActivity(true);
    setTempSelectedActivity(null);
  };

  const handleActivitySelect = (activity: ActivityType) => {
    console.log('Selected Activity:', activity);

    if (activity.name === 'Other Work') {
      setShowOtherOptions(true);
      setShowChangeOtherOptions(true);
      setTempSelectedActivity(activity);
    } else if (activity.name === 'Retailing') {
      getRoutes();

      setSelectedActivity(activity.name);
      setPendingActivity(activity); // ✅ FIX ADDED

      setUnifiedModalVisible(false);
      setUnifiedModalType('van-change');
      setUnifiedModalVisible(true);
      setVanChangeReason('');
    } else {
      setSelectedActivity(activity.name);
      setPendingActivity(activity);

      setUnifiedModalVisible(false);
      openCamera();
    }
  };

  const handleOtherWorkSelect = (option: OtherWorkOption) => {
    console.log('Selected Other Work Option:', option);
    setSelectedActivity(option.name);
    setPendingActivity(option);
    setShowOtherOptions(false);
    setUnifiedModalVisible(false);
    openCamera();
  };

  const handleVanChangeSubmit = () => {
    if (!vanChangeReason) {
      Alert.alert('Error', 'Please select an option');
      return;
    }

    setUnifiedModalVisible(false);
    setUnifiedModalType('route-selection');
    setUnifiedModalVisible(true);
  };

  const handleRouteSelect = (route: any) => {
    console.log('Selected Route FULL:', route); // 🔥 DEBUG

    setSelectedRoute(route);
    setUnifiedModalVisible(false);
    openCamera();
  };

  const handleChangeActivity = (activity: ActivityType) => {
    if (activity.name === 'Other Work') {
      if (activeVisit) {
        toast.error('To Change activity, Please complete active visit.');
        return;
      }
      setSelectedRoute(null);
      setShowChangeOtherOptions(true);
    } else if (activity.name === 'Retailing') {
      getRoutes();
      setSelectedActivity(activity.name);
      setUnifiedModalVisible(false);
      setUnifiedModalType('van-change');
      setUnifiedModalVisible(true);
      setVanChangeReason('');
      setIsChangingActivity(true);
    } else {
      // For non-retailing activities
      setSelectedActivity(activity.name);
      setPendingActivity(activity);
      setUnifiedModalVisible(false);
      openCamera();
    }
  };

  const handleChangeRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setUnifiedModalVisible(false);
    openCamera();
  };

  const handleChangeOtherWork = (option: OtherWorkOption) => {
    setSelectedActivity(option.name);
    setPendingActivity(option);
    setUnifiedModalVisible(false);
    setShowChangeOtherOptions(false);
    openCamera();
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take your photo');
        return;
      }
    }
    setCameraVisible(true);
  };

  const handleCaptureImage = async (photo: any) => {
    if (photo && photo.uri) {
      setUserPhoto(photo.uri);
      setCameraVisible(false);

      if (isChangingActivity) {
        completeActivityChange();
      } else {
        if (selectedRoute) {
          setLoadSummaryVisible(true);
        } else {
          handleStartDay();
        }
      }
    } else {
      console.error('No photo captured');
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handleLoadSummaryProceed = () => {
    setLoadSummaryVisible(false);
    handleStartDay();
  };

  const handleStartDay = async () => {
    console.log('Selected Activity:', selectedActivity);
    console.log('Selected Route:', selectedRoute);
    console.log('Van:', van);

    // ✅ VALIDATION FIX
    if (selectedActivity === 'Retailing' && !selectedRoute) {
      toast.error('Please select route');
      return;
    }

    const payload: DayStartPayload = {
      activityName: selectedActivity,
      routeId: selectedRoute?.routeId,
      description: selectedRoute
        ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`
        : `Started ${pendingActivity?.name}`,
      totalShops: selectedRoute?.totalShops,
      routeName: selectedRoute?.name,
      vanId: van?.vanId,
    };

    console.log('Day Start Payload:', payload);

    try {
      const response: ApiResponse<any> = await homeService.dayStart(payload);

      if (response?.statusCode === 201) {
        getDayStatus();
        toast.success('Your day successfully started.');
      }
    } catch (error) {
      console.error('Error starting day:', error);
      toast.error('Failed to start day. Please try again.');
    }
  };

  const completeActivityChange = async () => {
    if (selectedActivity === 'Retailing' && !selectedRoute) {
      toast.error('Please select route');
      return;
    }

    const payload: CreateActivityPayload = {
      name: selectedActivity,
      routeId: selectedRoute?.routeId,
      description: selectedRoute
        ? `Started Retailing - Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`
        : `Started ${pendingActivity?.name}`,
      totalShops: selectedRoute?.totalShops,
      routeName: selectedRoute?.name,
      workSessionId,
    };

    try {
      const response: any = await homeService.createActivity(payload);

      if (response.statusCode === 201) {
        getDayStatus();
        toast.success(`Activity changed to ${selectedActivity}`);
      }
    } catch (error) {
      console.error('Error changing activity:', error);
      toast.error('Failed to change activity. Please try again.');
    }
  };

  const handleCloseUnifiedModal = () => {
    setUnifiedModalVisible(false);
    setShowChangeOtherOptions(false);
    setShowOtherOptions(false);
    setTempSelectedActivity(null);
  };

  const handleCloseLoadSummary = () => {
    setLoadSummaryVisible(false);
  };

  const handleCancelCamera = () => {
    setCameraVisible(false);
    // if (!dayStarted && !isChangingActivity) {
    //   setSelectedRoute(null);
    //   setPendingActivity(null);
    //   setSelectedActivity('');
    // }
  };

  const handleQuickAction = (route: string) => {
    router.push(route);
  };

  const fetchDayEndSummary = async () => {
    console.log('Selected Route at Day End:', van);
    const res: any = await vanService.fetchTodayStockSummary({ vanId: van?.vanId });
    console.log('Stock Summary before day end:', res);
    setDayEndSummary(res?.data);
  };

  const handleEndDay = async () => {
    try {
      const response = await homeService.dayComplete();

      if (response.success) {
        toast.success('Your day successfully completed');
        setDayStarted(false);
        setWorkSessionId('');
        setCurrentActivity(null);
        setTodayActivities([]);
        setStartTime(null);
        setSelectedActivityColor('#4158D0');
        setSelectedActivityIcon('storefront');
        useRouteStore.getState().setSelectedRoute(null);
      }
    } catch (error) {
      console.error('Error completing day:', error);
      toast.error('Failed to complete day. Please try again.');
    }
  };

  const getDayStatus = async () => {
    try {
      const response: any = await homeService.getDayStatus(workSessionId);

      setDayStarted(response.data.status === 'ACTIVE');
      console.log('Day Status Response:', response);

      if (response.statusCode === 200) {
        setWorkSessionId(response.data.workSessionId || '');
        setCurrentActivity(response?.data?.activeActivity?.name);
        setTodayActivities(response?.data?.todayActivities || []);
        setStartTime(response?.data?.activeActivity?.startTime);
        setSelectedActivityColor('#4158D0');
        setSelectedActivityIcon('storefront');

        const selectedRoute = response?.data?.selectedRoute;
        const van = response?.data?.van;
        const routeStore = useRouteStore.getState();

        if (selectedRoute) {
          routeStore.setSelectedRoute(selectedRoute);
        } else {
          routeStore.setSelectedRoute(null);
        }

        if (van) {
          routeStore.setVan(van);
        }
      }
    } catch (error) {
      console.error('Error fetching day status:', error);
    }
  };

  const getRoutes = async () => {
    try {
      const response: any = await homeService.getVanMappedRoutes();

      if (response.statusCode === 200) {
        if (response?.data?.routes?.length) {
          setRoutes(
            response.data.routes.map((item: any) => ({
              name: item.route.name,
              routeId: item.routeId,

              // 🔥 IMPORTANT FIXES
              routeSessionId: item.routeSessionId,
              workSessionId: item.workSessionId,
              vanId: item.vanId,

              totalShops: item.route?.outletCount,
              distance: item.route.distance || 'N/A',
              stops: item.route?.outletCount || 0,
            })),
          );
        }

        console.log('Routes:', response.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const getVan = async () => {
    try {
      const response: any = await homeService.getVan();

      if (response.statusCode === 200) {
        const van = response?.data?.[0] || null;
        useRouteStore.getState().setVan(van);
        console.log('Van set in store:', van);
      }
    } catch (error) {
      console.error('Error fetching van:', error);
    }
  };

  const visitStatus = async () => {
    try {
      const query: any = {
        workSessionId: selectedRoute?.workSessionId,
        vanId: selectedRoute?.vanId,
        routeSessionId: selectedRoute?.routeSessionId,
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

  const handleDayEndConfirmation = () => {
    fetchDayEndSummary();
    setShowDayEndConfirm(true);
  };

  const getDayEndTitle = () => {
    return 'Confirm Day End';
  };

  const getDayEndMessage = () => {
    let msg = '📊 DAY SUMMARY\n\n';
    return msg;
  };

  const getDayEndIcon = () => {
    return <Ionicons name="clipboard-outline" size={56} color="#3F51B5" />;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <LinearGradient
          colors={[colors.primary + '18', colors.background, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTextBlock}>
              <AppText style={styles.heroEyebrow}>{greeting}</AppText>
              <AppText style={styles.heroTitle}>{user?.name}</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="car-outline" size={16} color="#666" />
                <AppText style={{ fontSize: 15, fontWeight: 'bold' }}>
                  {van?.name}
                  {van?.vanNumber ? ` - ${van.vanNumber}` : ''}
                </AppText>
              </View>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons
                name={dayStarted ? 'play-circle-outline' : 'pause-circle-outline'}
                size={18}
                color={dayStarted ? colors.success : colors.warning}
              />
              <AppText
                style={[
                  styles.heroBadgeText,
                  { color: dayStarted ? colors.success : colors.warning },
                ]}
              >
                {dayStarted ? 'On Duty' : 'Idle'}
              </AppText>
            </View>
          </View>

          <View style={styles.mainContent}>
            {!dayStarted ? (
              <StartDayButton onPress={handleStartDayPress} />
            ) : (
              <CurrentActivityCard
                selectedActivity={currentActivity}
                selectedActivityColor={selectedActivityColor}
                selectedActivityIcon={selectedActivityIcon}
                startTime={startTime}
                otherWorkStartTime={otherWorkStartTime}
                selectedRoute={selectedRoute}
                assignedVan={mappedVan}
                onPressChange={handleChangeActivityPress}
                onPressEnd={handleDayEndConfirmation}
              />
            )}
          </View>

          <View style={styles.sectionStack}>
            <View style={styles.sectionCard}>
              <QuickActionsSection
                actions={QUICK_ACTIONS}
                onPressAction={(route: any) => handleQuickAction(route)}
              />
            </View>

            <View style={styles.sectionCard}>
              <StatsOverviewSection employeeId={user?.userId as any} />
            </View>

            <View style={styles.sectionCard}>
              <TodayActivitiesSection activities={todayActivities} />
            </View>

            <Footer lastUpdated={new Date().toLocaleTimeString()} />
          </View>
        </LinearGradient>
      </ScrollView>

      <UnifiedActionModal
        visible={unifiedModalVisible}
        modalType={unifiedModalType}
        isDayStart={!dayStarted && !isChangingActivity}
        // Van Change Props
        vanChangeReason={vanChangeReason}
        onSelectVanChangeReason={setVanChangeReason}
        onVanChangeSubmit={handleVanChangeSubmit}
        // Route Selection Props
        routes={routes}
        assignedVan={mappedVan}
        onSelectRoute={isChangingActivity ? handleChangeRouteSelect : handleRouteSelect}
        // Activity Change Props
        showChangeOtherOptions={showOtherOptions || showChangeOtherOptions} // Use both states
        selectedActivity={currentActivity || tempSelectedActivity?.name || undefined}
        activityTypes={ACTIVITY_TYPES}
        otherWorkOptions={OTHER_WORK_OPTIONS}
        onActivitySelect={isChangingActivity ? handleChangeActivity : handleActivitySelect}
        onOtherWorkSelect={isChangingActivity ? handleChangeOtherWork : handleOtherWorkSelect}
        onBackToOptions={() => {
          setShowChangeOtherOptions(false);
          setShowOtherOptions(false);
          setTempSelectedActivity(null);
        }}
        // Common Props
        onClose={handleCloseUnifiedModal}
      />

      <LoadSummaryModal
        visible={loadSummaryVisible}
        data={LOAD_SUMMARY_DATA}
        onClose={handleCloseLoadSummary}
        onProceed={handleLoadSummaryProceed}
      />

      <CameraModal
        visible={cameraVisible}
        cameraRef={cameraRef}
        onClose={handleCancelCamera}
        onCapture={handleCaptureImage}
        onError={(error) => console.error('Camera error:', error)}
        title="TAKE A SELFIE"
        cameraProps={{
          facing: 'front',
          quality: 0.8,
          autofocus: true,
        }}
      />

      <ConfirmationModal
        visible={showDayEndConfirm}
        title={getDayEndTitle()}
        message={getDayEndMessage()}
        confirmText="Close Day"
        cancelText="Cancel"
        onCancel={() => setShowDayEndConfirm(false)}
        onConfirm={handleEndDay}
        loading={false}
        type="info"
        danger={true}
        icon={getDayEndIcon()}
      />

      <DayEndSummaryModal
        visible={showDayEndConfirm}
        data={dayEndSummary}
        onClose={() => setShowDayEndConfirm(false)}
        onProceed={() => {
          handleEndDay();
          setShowDayEndConfirm(false);
        }}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    heroSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
    heroHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroEyebrow: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.primary,
      marginBottom: 6,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    mainContent: {
      marginBottom: 8,
    },
    sectionStack: {
      gap: 14,
      paddingBottom: 8,
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border + '1A',
      shadowColor: colors.shadow || '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 2,
    },
  });
