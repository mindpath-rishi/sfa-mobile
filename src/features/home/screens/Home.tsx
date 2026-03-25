// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
//   Modal,
//   FlatList,
//   Alert,
//   Image,
//   StyleSheet,
// } from 'react-native';
// import { router } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { Header } from '@/core/components/Header';
// import { Card } from '@/core/components/Card';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { CameraView, useCameraPermissions } from 'expo-camera';

// import { QuickAction } from '../components/QuickAction';
// import { StatCard } from '../components/StatCard';
// import { ProgressBar } from '../components/ProgressBar';
// import { ActivityItem } from '../components/ActivityItem';

// import { MOCK_DATA } from '../constants/mockData';

// // Quick Actions Configuration
// const QUICK_ACTIONS = [
//   { icon: 'location', label: 'Check In', color: '#4158D0', route: '/checkin' },
//   { icon: 'cart', label: 'New Order', color: '#C850C0', route: '/orders/new', badge: 3 },
//   { icon: 'cash', label: 'Collection', color: '#FF512F', route: '/collections' },
//   { icon: 'people', label: 'Customers', color: '#11998e', route: '/customers' },
//   { icon: 'map', label: 'Route', color: '#F37335', route: '/beats' },
// ];

// // Activity Types
// const ACTIVITY_TYPES = [
//   { id: '1', name: 'Retailing', icon: 'storefront', color: '#4158D0' },
//   { id: '2', name: 'Other Work', icon: 'briefcase', color: '#C850C0' },
// ];

// // Other Work Sub-options
// const OTHER_WORK_OPTIONS = [
//   { id: 'office', name: 'Office Work', icon: 'business', color: '#11998e' },
//   { id: 'collection', name: 'Collection', icon: 'cash', color: '#FF512F' },
//   { id: 'meeting', name: 'Meetings', icon: 'people', color: '#F37335' },
// ];

// // Routes for Retailing
// const RETAILING_ROUTES = [
//   { id: 'route1', name: 'Andheri East Route', stops: 12, distance: '8.5 km' },
//   { id: 'route2', name: 'Bandra West Route', stops: 15, distance: '10.2 km' },
//   { id: 'route3', name: 'Juhu Circle Route', stops: 8, distance: '6.3 km' },
//   { id: 'route4', name: 'Dadar Route', stops: 10, distance: '7.8 km' },
//   { id: 'route5', name: 'Malad Route', stops: 14, distance: '9.1 km' },
// ];

// // Load Summary Data
// const LOAD_SUMMARY_DATA = {
//   loadNumber: 'ST-5176',
//   totalQuantity: '0 Cases 0 Pcs',
//   totalValue: 'ZMW 0',
//   skuDetails: [
//     {
//       id: '1',
//       sku: 'DWB-DR. WASH SOAP BLUE 20 X 300G',
//       code: '28073',
//       carryForward: '7 Cases 0 Pcs',
//       freshStock: '0 Cases 0 Pcs',
//     },
//     {
//       id: '2',
//       sku: 'BOS-BOOM DISH LIQUID ORANGE 25 X 750ML (SPONGE)',
//       code: '21452',
//       carryForward: '7 Cases 0 Pcs',
//       freshStock: '0 Cases 0 Pcs',
//     },
//     {
//       id: '3',
//       sku: 'B3G-BOOM BEAUTY SOAP GREEN 20 X 300G',
//       code: '25272',
//       carryForward: '5 Cases 0 Pcs',
//       freshStock: '0 Cases 0 Pcs',
//     },
//     {
//       id: '4',
//       sku: 'A32-ALOHA POWDER POUCH SR 120 X 32G',
//       code: '32014',
//       carryForward: '5 Cases 0 Pcs',
//       freshStock: '0 Cases 0 Pcs',
//     },
//     {
//       id: '5',
//       sku: 'A30-ALOHA S.RAIN POWDER POUCH 150 X 30G',
//       code: '25776',
//       carryForward: '5 Cases 0 Pcs',
//       freshStock: '0 Cases 0 Pcs',
//     },
//     {
//       id: '6',
//       sku: '19GS-AMAZON MONSTA (TKSA) GRAPE',
//       code: '',
//       carryForward: '',
//       freshStock: '',
//     },
//   ],
// };

// // Assigned Van for the user (pre-defined)
// const ASSIGNED_VAN = {
//   id: 'van2',
//   name: 'Van #MH-02-CD-5678',
//   type: 'Mahindra Pickup',
//   capacity: '750 kg',
//   registration: 'MH-02-CD-5678',
// };

// export default function HomeScreen() {
//   const { colors } = useTheme();
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
//   const [selectedRoute, setSelectedRoute] = useState<any>(null);
//   const [selectedVan, setSelectedVan] = useState<any>(ASSIGNED_VAN);
//   const [showOtherOptions, setShowOtherOptions] = useState(false);
//   const [showChangeOtherOptions, setShowChangeOtherOptions] = useState(false);
//   const [startTime, setStartTime] = useState('');
//   const [activityHistory, setActivityHistory] = useState<any[]>([]);
//   const [userPhoto, setUserPhoto] = useState<string | null>(null);
//   const [pendingActivity, setPendingActivity] = useState<any>(null);
//   const [isChangingActivity, setIsChangingActivity] = useState(false);
//   const [otherWorkStartTime, setOtherWorkStartTime] = useState<string | null>(null);
//   const [otherWorkDuration, setOtherWorkDuration] = useState<string | null>(null);
//   const [todayActivities, setTodayActivities] = useState<any[]>([]);
//   const [vanChangeReason, setVanChangeReason] = useState('');
//   const [vanChangeSubmitted, setVanChangeSubmitted] = useState(false);
//   const [isVanChangeForRetailing, setIsVanChangeForRetailing] = useState(false);

//   const cameraRef = useRef<any>(null);
//   const [permission, requestPermission] = useCameraPermissions();

//   const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

//   const onRefresh = () => {
//     setRefreshing(true);
//     setTimeout(() => setRefreshing(false), 2000);
//   };

//   const handleStartDayPress = () => {
//     setModalVisible(true);
//     setShowOtherOptions(false);
//     setIsChangingActivity(false);
//   };

//   const handleChangeActivityPress = () => {
//     setChangeModalVisible(true);
//     setShowChangeOtherOptions(false);
//     setIsChangingActivity(true);
//   };

//   const handleActivitySelect = (activity: any) => {
//     if (activity.name === 'Other Work') {
//       setShowOtherOptions(true);
//     } else if (activity.name === 'Retailing') {
//       setModalVisible(false);
//       setVanChangeModalVisible(true);
//       setVanChangeReason('');
//       setVanChangeSubmitted(false);
//       setIsVanChangeForRetailing(true);
//     }
//   };

//   const handleVanChangeSubmit = () => {
//     if (!vanChangeReason) {
//       Alert.alert('Error', 'Please select an option');
//       return;
//     }

//     setVanChangeSubmitted(true);
//     setVanChangeModalVisible(false);

//     if (vanChangeReason !== 'No, same van') {
//       const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//       const vanChangeEntry = {
//         id: Date.now().toString(),
//         type: 'van_change',
//         customer: 'System',
//         time: currentTime,
//         status: 'completed',
//         notes: `Van change: ${vanChangeReason}`,
//       };
//       setTodayActivities([vanChangeEntry, ...todayActivities]);
//     }

//     setRouteModalVisible(true);
//   };

//   const handleOtherWorkSelect = (option: any) => {
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

//   const handleChangeActivity = (activity: any) => {
//     if (activity.name === 'Other Work') {
//       setShowChangeOtherOptions(true);
//     } else if (activity.name === 'Retailing') {
//       setChangeModalVisible(false);
//       setVanChangeModalVisible(true);
//       setVanChangeReason('');
//       setVanChangeSubmitted(false);
//       setIsVanChangeForRetailing(true);
//     }
//   };

//   const handleChangeRouteSelect = (route: any) => {
//     setSelectedRoute(route);
//     setRouteModalVisible(false);
//     openCamera();
//   };

//   const handleChangeOtherWork = (option: any) => {
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

//   const handleCaptureImage = async () => {
//     if (cameraRef.current) {
//       try {
//         const photo = await cameraRef.current.takePictureAsync({
//           quality: 0.8,
//           skipProcessing: true,
//         });

//         setUserPhoto(photo.uri);
//         setCameraVisible(false);

//         if (isChangingActivity) {
//           completeActivityChange();
//         } else {
//           // After photo, show load summary ONLY for retailing
//           if (selectedRoute) {
//             setLoadSummaryVisible(true);
//           } else {
//             completeDayStart();
//           }
//         }
//       } catch (error) {
//         console.error('Error taking photo:', error);
//         Alert.alert('Error', 'Failed to take photo. Please try again.');
//       }
//     }
//   };

//   const handleLoadSummaryProceed = () => {
//     setLoadSummaryVisible(false);
//     completeDayStart();
//   };

//   const completeDayStart = () => {
//     const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//     if (pendingActivity) {
//       setSelectedActivity(pendingActivity.name);
//       setSelectedActivityColor(pendingActivity.color);
//       setSelectedActivityIcon(pendingActivity.icon);
//       setDayStarted(true);
//       setStartTime(currentTime);
//       setOtherWorkStartTime(currentTime);

//       const newActivity = {
//         id: Date.now().toString(),
//         type: pendingActivity.name.toLowerCase().replace(' ', '_'),
//         customer: 'Self',
//         time: currentTime,
//         status: 'in_progress',
//         notes: `Started ${pendingActivity.name}`,
//       };

//       setTodayActivities([newActivity, ...todayActivities]);

//       Alert.alert('Day Started', `You're now working on ${pendingActivity.name}`);
//       setPendingActivity(null);
//     } else if (selectedRoute) {
//       setSelectedActivity('Retailing');
//       setSelectedActivityColor('#4158D0');
//       setSelectedActivityIcon('storefront');
//       setDayStarted(true);
//       setStartTime(currentTime);
//       setOtherWorkStartTime(null);

//       const newActivity = {
//         id: Date.now().toString(),
//         type: 'retailing',
//         customer: selectedRoute.name,
//         time: currentTime,
//         status: 'in_progress',
//         notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
//       };

//       setTodayActivities([newActivity, ...todayActivities]);

//       Alert.alert(
//         'Day Started',
//         `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
//       );
//     }
//   };

//   const completeActivityChange = () => {
//     const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//     if (
//       selectedActivity === 'Office Work' ||
//       selectedActivity === 'Collection' ||
//       selectedActivity === 'Meetings'
//     ) {
//       if (otherWorkStartTime) {
//         const start = new Date(`1970-01-01T${otherWorkStartTime}:00`);
//         const end = new Date(`1970-01-01T${currentTime}:00`);
//         const diffMs = end.getTime() - start.getTime();
//         const diffMins = Math.round(diffMs / 60000);
//         const hours = Math.floor(diffMins / 60);
//         const mins = diffMins % 60;
//         const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
//         setOtherWorkDuration(duration);
//       }
//     }

//     const historyEntry: any = {
//       activity: selectedActivity,
//       route: selectedRoute?.name,
//       van: ASSIGNED_VAN.name,
//       time: currentTime,
//       date: new Date().toLocaleDateString(),
//     };

//     if (otherWorkDuration) {
//       historyEntry.duration = otherWorkDuration;
//     }

//     setActivityHistory([...activityHistory, historyEntry]);

//     const completedActivity = {
//       id: Date.now().toString(),
//       type: selectedActivity.toLowerCase().replace(' ', '_'),
//       customer: selectedActivity === 'Retailing' ? selectedRoute?.name : 'Self',
//       time: currentTime,
//       status: 'completed',
//       notes:
//         selectedActivity === 'Retailing'
//           ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
//           : `Completed ${selectedActivity}${otherWorkDuration ? ` (${otherWorkDuration})` : ''}`,
//     };

//     if (pendingActivity) {
//       setSelectedActivity(pendingActivity.name);
//       setSelectedActivityColor(pendingActivity.color);
//       setSelectedActivityIcon(pendingActivity.icon);
//       setSelectedRoute(null);
//       setOtherWorkStartTime(currentTime);
//       setOtherWorkDuration(null);

//       const newActivity = {
//         id: (Date.now() + 1).toString(),
//         type: pendingActivity.name.toLowerCase().replace(' ', '_'),
//         customer: 'Self',
//         time: currentTime,
//         status: 'in_progress',
//         notes: `Started ${pendingActivity.name}`,
//       };

//       setTodayActivities([completedActivity, newActivity, ...todayActivities]);

//       Alert.alert('Activity Changed', `You're now working on ${pendingActivity.name}`);
//       setPendingActivity(null);
//     } else if (selectedRoute) {
//       setSelectedActivity('Retailing');
//       setSelectedActivityColor('#4158D0');
//       setSelectedActivityIcon('storefront');
//       setOtherWorkStartTime(null);

//       const newActivity = {
//         id: (Date.now() + 1).toString(),
//         type: 'retailing',
//         customer: selectedRoute.name,
//         time: currentTime,
//         status: 'in_progress',
//         notes: `Route: ${selectedRoute.name}, Van: ${ASSIGNED_VAN.name}`,
//       };

//       setTodayActivities([completedActivity, newActivity, ...todayActivities]);

//       Alert.alert(
//         'Activity Changed',
//         `You're now working on Retailing\nRoute: ${selectedRoute?.name}\nVan: ${ASSIGNED_VAN.name}`,
//       );
//     }
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
//     if (!dayStarted) {
//       setSelectedRoute(null);
//       setPendingActivity(null);
//     }
//   };

//   const handleEndDay = () => {
//     Alert.alert('End Day', 'Are you sure you want to end your day?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'End Day',
//         onPress: () => {
//           if (dayStarted) {
//             const currentTime = new Date().toLocaleTimeString([], {
//               hour: '2-digit',
//               minute: '2-digit',
//             });

//             if (
//               selectedActivity === 'Office Work' ||
//               selectedActivity === 'Collection' ||
//               selectedActivity === 'Meetings'
//             ) {
//               if (otherWorkStartTime) {
//                 const start = new Date(`1970-01-01T${otherWorkStartTime}:00`);
//                 const end = new Date(`1970-01-01T${currentTime}:00`);
//                 const diffMs = end.getTime() - start.getTime();
//                 const diffMins = Math.round(diffMs / 60000);
//                 const hours = Math.floor(diffMins / 60);
//                 const mins = diffMins % 60;
//                 const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
//                 setOtherWorkDuration(duration);
//               }
//             }

//             const finalEntry: any = {
//               activity: selectedActivity,
//               route: selectedRoute?.name,
//               van: ASSIGNED_VAN.name,
//               time: currentTime,
//               date: new Date().toLocaleDateString(),
//               status: 'ended',
//             };

//             if (otherWorkDuration) {
//               finalEntry.duration = otherWorkDuration;
//             }

//             setActivityHistory([...activityHistory, finalEntry]);

//             const finalActivity = {
//               id: Date.now().toString(),
//               type: selectedActivity.toLowerCase().replace(' ', '_'),
//               customer: selectedActivity === 'Retailing' ? selectedRoute?.name : 'Self',
//               time: currentTime,
//               status: 'ended',
//               notes:
//                 selectedActivity === 'Retailing'
//                   ? `Route: ${selectedRoute?.name}, Van: ${ASSIGNED_VAN.name}`
//                   : `Ended ${selectedActivity}${otherWorkDuration ? ` (${otherWorkDuration})` : ''}`,
//             };

//             setTodayActivities([finalActivity, ...todayActivities]);
//           }

//           setDayStarted(false);
//           setSelectedActivity('');
//           setSelectedRoute(null);
//           setActivityHistory([]);
//           setUserPhoto(null);
//           setOtherWorkStartTime(null);
//           setOtherWorkDuration(null);
//           setTodayActivities([]);

//           Alert.alert('Day Ended', 'Your day has been ended successfully');
//         },
//         style: 'destructive',
//       },
//     ]);
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       {/* <Header
//         title={`${greeting}`}
//         showMenu
//         rightIcon="notifications"
//         onRightPress={() => router.push('/notifications')}
//         badgeCount={3}
//         elevated
//       /> */}

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
//         }
//       >
//         {/* Start Day / Current Activity Section */}
//         <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
//           {!dayStarted ? (
//             <TouchableOpacity onPress={handleStartDayPress} style={styles.startDayButton}>
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <View style={styles.iconCircle}>
//                   <Ionicons name="sunny" size={24} color={colors.primary} />
//                 </View>
//                 <View style={{ marginLeft: 12 }}>
//                   <Text style={styles.titleLarge}>START YOUR DAY</Text>
//                   <Text style={styles.textSmall}>Begin your work shift</Text>
//                 </View>
//               </View>
//               <View style={styles.arrowCircle}>
//                 <Ionicons name="arrow-forward" size={18} color="white" />
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.activeCard}>
//               {/* Current Activity */}
//               <View style={styles.activityHighlightCard}>
//                 <LinearGradient
//                   colors={[selectedActivityColor, selectedActivityColor + 'DD']}
//                   style={styles.activityIconLarge}
//                 >
//                   <Ionicons name={selectedActivityIcon as any} size={28} color="white" />
//                 </LinearGradient>
//                 <View style={{ flex: 1, marginLeft: 12 }}>
//                   <Text style={styles.textXSmall}>CURRENT ACTIVITY</Text>
//                   <Text style={styles.titleMedium}>{selectedActivity}</Text>
//                   <View style={styles.timeContainer}>
//                     <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
//                     <Text style={styles.textSmall}>
//                       {startTime}
//                       {otherWorkStartTime && selectedActivity !== 'Retailing' && (
//                         <Text style={styles.textAccent}> • Running</Text>
//                       )}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={styles.activeBadge}>
//                   <Text style={styles.textXSmallBold}>ACTIVE</Text>
//                 </View>
//               </View>

//               {/* Route & Van Info */}
//               {selectedActivity === 'Retailing' && selectedRoute && (
//                 <View style={styles.infoHighlightCard}>
//                   <View style={styles.infoRow}>
//                     <View style={styles.infoIconContainer}>
//                       <Ionicons name="map-outline" size={16} color={colors.primary} />
//                     </View>
//                     <View style={styles.infoContent}>
//                       <Text style={styles.textXSmall}>ROUTE</Text>
//                       <Text style={styles.titleSmall}>{selectedRoute.name}</Text>
//                       <Text style={styles.textXSmall}>
//                         {selectedRoute.stops} stops • {selectedRoute.distance}
//                       </Text>
//                     </View>
//                   </View>
//                   <View style={[styles.infoRow, { marginTop: 8 }]}>
//                     <View style={styles.infoIconContainer}>
//                       <Ionicons name="car-outline" size={16} color={colors.primary} />
//                     </View>
//                     <View style={styles.infoContent}>
//                       <Text style={styles.textXSmall}>VAN</Text>
//                       <Text style={styles.titleSmall}>{ASSIGNED_VAN.name}</Text>
//                       <Text style={styles.textXSmall}>
//                         {ASSIGNED_VAN.type} • {ASSIGNED_VAN.capacity}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               )}

//               {/* Action Buttons */}
//               <View style={styles.actionButtonsContainer}>
//                 <TouchableOpacity
//                   onPress={handleChangeActivityPress}
//                   style={styles.smallActionButton}
//                 >
//                   <Ionicons name="refresh" size={14} color={colors.primary} />
//                   <Text style={styles.smallActionText}>CHANGE</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity onPress={handleEndDay} style={styles.smallActionButton}>
//                   <Ionicons name="stop-circle" size={14} color={colors.error} />
//                   <Text style={[styles.smallActionText, { color: colors.error }]}>END</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Quick Actions Section */}
//         <View style={styles.sectionContainer}>
//           <Text style={styles.textXSmallBold}>QUICK ACTIONS</Text>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.quickActionsScroll}
//           >
//             {QUICK_ACTIONS.map((action: any, index) => (
//               <QuickAction
//                 key={index}
//                 icon={action.icon}
//                 label={action.label}
//                 color={action.color}
//                 badge={action.badge}
//                 onPress={() => router.push(action.route as any)}
//               />
//             ))}
//           </ScrollView>
//         </View>

//         {/* Stats Overview */}
//         <View style={styles.sectionContainer}>
//           <Text style={styles.textXSmallBold}>TODAY'S OVERVIEW</Text>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.statsScroll}
//           >
//             <StatCard
//               title="Visits"
//               value={`${MOCK_DATA.todayVisits}/${MOCK_DATA.totalVisits}`}
//               icon="calendar"
//               color="#4158D0"
//               trend={12}
//             />
//             <StatCard
//               title="Orders"
//               value={MOCK_DATA.pendingOrders.toString()}
//               icon="cart"
//               color="#C850C0"
//               trend={-5}
//             />
//             <StatCard
//               title="Collections"
//               value={MOCK_DATA.collections}
//               icon="cash"
//               color="#11998e"
//               trend={8}
//             />
//             <StatCard
//               title="Incentives"
//               value={MOCK_DATA.incentives}
//               icon="trophy"
//               color="#F37335"
//               trend={15}
//             />
//           </ScrollView>
//         </View>

//         {/* Target Progress */}
//         <View style={styles.sectionContainer}>
//           <Text style={styles.textXSmallBold}>MONTHLY TARGET</Text>
//           <Card variant="elevated" padding="lg" style={styles.targetCard}>
//             <View style={styles.targetHeader}>
//               <Text style={styles.textSmall}>Progress</Text>
//               <TouchableOpacity onPress={() => router.push('/targets')}>
//                 <Text style={styles.textAccentSmall}>VIEW DETAILS →</Text>
//               </TouchableOpacity>
//             </View>
//             <ProgressBar
//               progress={MOCK_DATA.targetAchieved}
//               label=""
//               value={`${MOCK_DATA.targetAchieved}%`}
//               color={colors.success}
//               showLabel
//             />
//             <View style={styles.targetStats}>
//               <View>
//                 <Text style={styles.textXSmall}>COMPLETED ORDERS</Text>
//                 <Text style={styles.titleSmall}>{MOCK_DATA.completedOrders}</Text>
//               </View>
//               <View style={{ alignItems: 'flex-end' }}>
//                 <Text style={styles.textXSmall}>REVENUE</Text>
//                 <Text style={styles.titleSmall}>₹67,500</Text>
//               </View>
//             </View>
//           </Card>
//         </View>

//         {/* Today's Activities */}
//         <View style={styles.sectionContainer}>
//           <Text style={styles.textXSmallBold}>TODAY'S ACTIVITIES</Text>
//           <Card variant="elevated" padding="lg" style={styles.activitiesCard}>
//             {todayActivities.length > 0 ? (
//               todayActivities.map((item: any, index: number) => (
//                 <View key={item.id}>
//                   <View style={styles.activityItem}>
//                     <View
//                       style={[
//                         styles.activityIconSmall,
//                         {
//                           backgroundColor:
//                             item.status === 'completed'
//                               ? colors.success + '20'
//                               : colors.primary + '20',
//                         },
//                       ]}
//                     >
//                       <Ionicons
//                         name={
//                           item.type === 'van_change'
//                             ? 'swap-horizontal'
//                             : item.type.includes('office')
//                               ? 'business'
//                               : item.type.includes('collection')
//                                 ? 'cash'
//                                 : item.type.includes('meeting')
//                                   ? 'people'
//                                   : item.type.includes('retailing')
//                                     ? 'storefront'
//                                     : 'time'
//                         }
//                         size={14}
//                         color={item.status === 'completed' ? colors.success : colors.primary}
//                       />
//                     </View>
//                     <View style={styles.activityContent}>
//                       <Text style={styles.textSmallBold}>
//                         {item.type === 'van_change'
//                           ? 'VAN CHANGE'
//                           : item.type.replace('_', ' ').toUpperCase()}
//                       </Text>
//                       <Text style={styles.textXSmall}>
//                         {item.time} • {item.notes}
//                       </Text>
//                     </View>
//                     <View
//                       style={[
//                         styles.statusBadge,
//                         {
//                           backgroundColor:
//                             item.status === 'completed'
//                               ? colors.success + '20'
//                               : colors.primary + '20',
//                         },
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.textXSmallBold,
//                           { color: item.status === 'completed' ? colors.success : colors.primary },
//                         ]}
//                       >
//                         {item.status === 'van_change' ? 'DONE' : item.status.toUpperCase()}
//                       </Text>
//                     </View>
//                   </View>
//                   {index < todayActivities.length - 1 && <View style={styles.divider} />}
//                 </View>
//               ))
//             ) : (
//               <View style={styles.emptyState}>
//                 <Ionicons name="time-outline" size={36} color={colors.textTertiary} />
//                 <Text style={styles.textSmall}>No activities yet today</Text>
//               </View>
//             )}
//           </Card>
//         </View>

//         {/* Last Updated */}
//         <View style={styles.footer}>
//           <Text style={styles.textXSmall}>LAST UPDATED: {new Date().toLocaleTimeString()}</Text>
//         </View>
//       </ScrollView>

//       {/* Start Day Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={handleCloseModal}
//       >
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity style={{ flex: 1 }} onPress={handleCloseModal} />
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.titleSmall}>
//                 {showOtherOptions ? 'SELECT WORK TYPE' : 'HOW WILL YOU START YOUR DAY?'}
//               </Text>
//               <TouchableOpacity onPress={handleCloseModal}>
//                 <Ionicons name="close" size={22} color={colors.textSecondary} />
//               </TouchableOpacity>
//             </View>

//             {!showOtherOptions ? (
//               <FlatList
//                 data={ACTIVITY_TYPES}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() => handleActivitySelect(item)}
//                     style={styles.modalItem}
//                   >
//                     <LinearGradient
//                       colors={[item.color, item.color + 'CC']}
//                       style={styles.modalItemIcon}
//                     >
//                       <Ionicons name={item.icon as any} size={22} color="white" />
//                     </LinearGradient>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.textSmallBold}>{item.name}</Text>
//                       {item.name === 'Retailing' && (
//                         <Text style={styles.textXSmall}>Select route after van confirmation</Text>
//                       )}
//                     </View>
//                     <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
//                   </TouchableOpacity>
//                 )}
//               />
//             ) : (
//               <FlatList
//                 data={OTHER_WORK_OPTIONS}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() => handleOtherWorkSelect(item)}
//                     style={styles.modalItem}
//                   >
//                     <LinearGradient
//                       colors={[item.color, item.color + 'CC']}
//                       style={styles.modalItemIcon}
//                     >
//                       <Ionicons name={item.icon as any} size={22} color="white" />
//                     </LinearGradient>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.textSmallBold}>{item.name}</Text>
//                     </View>
//                     <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
//                   </TouchableOpacity>
//                 )}
//               />
//             )}

//             {showOtherOptions && (
//               <TouchableOpacity
//                 onPress={() => setShowOtherOptions(false)}
//                 style={styles.backButton}
//               >
//                 <Ionicons name="arrow-back" size={18} color={colors.primary} />
//                 <Text style={styles.textAccentSmall}>BACK TO OPTIONS</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Van Change Modal */}
//       <Modal
//         visible={vanChangeModalVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={handleCloseVanChangeModal}
//       >
//         <View style={styles.centeredModalOverlay}>
//           <View style={styles.centeredModalContent}>
//             <Text style={styles.titleMedium}>VAN DETAILS</Text>
//             <Text style={[styles.textSmall, { textAlign: 'center', marginBottom: 12 }]}>
//               Is your Van changed for retailing today?
//             </Text>
//             <Text style={[styles.textXSmallBold, { marginBottom: 6 }]}>SELECT</Text>

//             <View style={styles.optionsContainer}>
//               <TouchableOpacity
//                 onPress={() => setVanChangeReason('Yes, van changed')}
//                 style={[
//                   styles.optionItem,
//                   vanChangeReason === 'Yes, van changed' && styles.optionItemSelected,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.textSmall,
//                     vanChangeReason === 'Yes, van changed' && styles.textAccent,
//                   ]}
//                 >
//                   Yes, van changed
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => setVanChangeReason('No, same van')}
//                 style={[
//                   styles.optionItem,
//                   vanChangeReason === 'No, same van' && styles.optionItemSelected,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.textSmall,
//                     vanChangeReason === 'No, same van' && styles.textAccent,
//                   ]}
//                 >
//                   No, same van
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 onPress={() => setVanChangeReason('Van not available')}
//                 style={[
//                   styles.optionItem,
//                   vanChangeReason === 'Van not available' && styles.optionItemSelected,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.textSmall,
//                     vanChangeReason === 'Van not available' && styles.textAccent,
//                   ]}
//                 >
//                   Van not available
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <Text
//               style={[
//                 styles.textXSmall,
//                 { color: '#EF4444', marginBottom: 12, fontStyle: 'italic' },
//               ]}
//             >
//               * Please select an option
//             </Text>

//             <TouchableOpacity onPress={handleVanChangeSubmit} style={styles.submitButton}>
//               <Text style={[styles.textSmallBold, { color: 'white' }]}>CONTINUE</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Route Selection Modal */}
//       <Modal
//         visible={routeModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={handleCloseRouteModal}
//       >
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity style={{ flex: 1 }} onPress={handleCloseRouteModal} />
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.titleSmall}>SELECT YOUR ROUTE</Text>
//               <TouchableOpacity onPress={handleCloseRouteModal}>
//                 <Ionicons name="close" size={22} color={colors.textSecondary} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.vanInfoCard}>
//               <Text style={styles.textXSmallBold}>YOUR VAN STATUS</Text>
//               <Text style={[styles.textXSmall, { marginTop: 2 }]}>
//                 {vanChangeReason || 'No change selected'}
//               </Text>
//               <Text style={[styles.textXSmall, { marginTop: 2 }]}>
//                 {ASSIGNED_VAN.name} • {ASSIGNED_VAN.type}
//               </Text>
//             </View>

//             <FlatList
//               data={RETAILING_ROUTES}
//               keyExtractor={(item) => item.id}
//               renderItem={({ item }) => (
//                 <TouchableOpacity onPress={() => handleRouteSelect(item)} style={styles.routeItem}>
//                   <LinearGradient colors={['#4158D0', '#C850C0']} style={styles.routeIcon}>
//                     <Ionicons name="map" size={22} color="white" />
//                   </LinearGradient>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.textSmallBold}>{item.name}</Text>
//                     <Text style={styles.textXSmall}>
//                       {item.stops} stops • {item.distance}
//                     </Text>
//                   </View>
//                   <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* Change Activity Modal */}
//       <Modal
//         visible={changeModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={handleCloseChangeModal}
//       >
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity style={{ flex: 1 }} onPress={handleCloseChangeModal} />
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.titleSmall}>
//                 {showChangeOtherOptions ? 'SELECT WORK TYPE' : 'CHANGE ACTIVITY'}
//               </Text>
//               <TouchableOpacity onPress={handleCloseChangeModal}>
//                 <Ionicons name="close" size={22} color={colors.textSecondary} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.currentActivityInfo}>
//               <Ionicons name="information-circle" size={18} color={colors.primary} />
//               <Text style={[styles.textXSmall, { flex: 1, marginLeft: 6 }]}>
//                 Currently working on: <Text style={styles.textAccent}>{selectedActivity}</Text>
//               </Text>
//             </View>

//             {!showChangeOtherOptions ? (
//               <FlatList
//                 data={ACTIVITY_TYPES.filter((a) => a.name !== selectedActivity)}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() => handleChangeActivity(item)}
//                     style={styles.modalItem}
//                   >
//                     <LinearGradient
//                       colors={[item.color, item.color + 'CC']}
//                       style={styles.modalItemIcon}
//                     >
//                       <Ionicons name={item.icon as any} size={22} color="white" />
//                     </LinearGradient>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.textSmallBold}>{item.name}</Text>
//                       {item.name === 'Retailing' && (
//                         <Text style={styles.textXSmall}>
//                           Select new route (Van confirmation required)
//                         </Text>
//                       )}
//                     </View>
//                     <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
//                   </TouchableOpacity>
//                 )}
//               />
//             ) : (
//               <FlatList
//                 data={OTHER_WORK_OPTIONS.filter((o) => o.name !== selectedActivity)}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     onPress={() => handleChangeOtherWork(item)}
//                     style={styles.modalItem}
//                   >
//                     <LinearGradient
//                       colors={[item.color, item.color + 'CC']}
//                       style={styles.modalItemIcon}
//                     >
//                       <Ionicons name={item.icon as any} size={22} color="white" />
//                     </LinearGradient>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.textSmallBold}>{item.name}</Text>
//                     </View>
//                     <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
//                   </TouchableOpacity>
//                 )}
//               />
//             )}

//             {showChangeOtherOptions && (
//               <TouchableOpacity
//                 onPress={() => setShowChangeOtherOptions(false)}
//                 style={styles.backButton}
//               >
//                 <Ionicons name="arrow-back" size={18} color={colors.primary} />
//                 <Text style={styles.textAccentSmall}>BACK TO OPTIONS</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Load Summary Modal - Only for Retailing */}
//       <Modal
//         visible={loadSummaryVisible}
//         transparent={false}
//         animationType="slide"
//         onRequestClose={handleCloseLoadSummary}
//       >
//         <View style={styles.loadSummaryContainer}>
//           {/* Enhanced Header with Gradient */}
//           <LinearGradient
//             colors={['#4158D0', '#C850C0']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={styles.loadSummaryHeader}
//           >
//             <View style={styles.headerContent}>
//               <View>
//                 <Text style={styles.headerSubtitle}>LOAD SUMMARY</Text>
//                 <Text style={styles.headerTitle}>Van Stock Details</Text>
//               </View>
//               <TouchableOpacity onPress={handleCloseLoadSummary} style={styles.headerCloseButton}>
//                 <Ionicons name="close" size={24} color="white" />
//               </TouchableOpacity>
//             </View>

//             {/* Load Number Badge */}
//             <View style={styles.loadNumberBadge}>
//               <Text style={styles.loadNumberLabel}>Load #</Text>
//               <Text style={styles.loadNumberValue}>{LOAD_SUMMARY_DATA.loadNumber}</Text>
//             </View>
//           </LinearGradient>

//           <ScrollView style={styles.loadSummaryContent} showsVerticalScrollIndicator={false}>
//             {/* Summary Cards */}
//             <View style={styles.summaryCardsContainer}>
//               <View style={styles.summaryCard}>
//                 <View style={[styles.summaryIconContainer, { backgroundColor: '#3B82F610' }]}>
//                   <Ionicons name="cube-outline" size={24} color="#3B82F6" />
//                 </View>
//                 <View style={styles.summaryCardContent}>
//                   <Text style={styles.summaryCardLabel}>Total Quantity</Text>
//                   <Text style={styles.summaryCardValue}>{LOAD_SUMMARY_DATA.totalQuantity}</Text>
//                 </View>
//               </View>

//               <View style={[styles.summaryCard, { marginTop: 12 }]}>
//                 <View style={[styles.summaryIconContainer, { backgroundColor: '#10B98110' }]}>
//                   <Ionicons name="cash-outline" size={24} color="#10B981" />
//                 </View>
//                 <View style={styles.summaryCardContent}>
//                   <Text style={styles.summaryCardLabel}>Total Value</Text>
//                   <Text style={styles.summaryCardValue}>{LOAD_SUMMARY_DATA.totalValue}</Text>
//                 </View>
//               </View>
//             </View>

//             <Text style={styles.skuSectionTitle}>SKU WISE DETAILS</Text>

//             {/* SKU List */}
//             {LOAD_SUMMARY_DATA.skuDetails.map((item, index) => (
//               <View key={item.id} style={styles.skuCard}>
//                 <View style={styles.skuHeader}>
//                   <View style={styles.skuIconContainer}>
//                     <Text style={styles.skuIconText}>{String.fromCharCode(65 + (index % 26))}</Text>
//                   </View>
//                   <View style={styles.skuTitleContainer}>
//                     <Text style={styles.skuName} numberOfLines={2}>
//                       {item.sku}
//                     </Text>
//                     {item.code ? <Text style={styles.skuCode}>SKU: {item.code}</Text> : null}
//                   </View>
//                 </View>

//                 <View style={styles.stockContainer}>
//                   <View style={styles.stockItem}>
//                     <Text style={styles.stockLabel}>Carry Forward</Text>
//                     <Text style={styles.stockValue}>{item.carryForward || '0 Cases 0 Pcs'}</Text>
//                   </View>
//                   <View style={styles.stockDivider} />
//                   <View style={styles.stockItem}>
//                     <Text style={styles.stockLabel}>Fresh Stock</Text>
//                     <Text style={styles.stockValue}>{item.freshStock || '0 Cases 0 Pcs'}</Text>
//                   </View>
//                 </View>
//               </View>
//             ))}
//           </ScrollView>

//           <View style={styles.loadSummaryFooter}>
//             <TouchableOpacity onPress={handleLoadSummaryProceed} style={styles.proceedButton}>
//               <Text style={styles.proceedButtonText}>PROCEED TO RETAILING</Text>
//               <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Camera Modal */}
//       <Modal
//         visible={cameraVisible}
//         transparent={false}
//         animationType="slide"
//         onRequestClose={handleCancelCamera}
//       >
//         <View style={styles.cameraContainer}>
//           <CameraView ref={cameraRef} style={styles.camera} facing="front">
//             <View style={styles.cameraOverlay}>
//               <TouchableOpacity style={styles.closeButton} onPress={handleCancelCamera}>
//                 <Ionicons name="close" size={24} color="white" />
//               </TouchableOpacity>

//               <View style={styles.cameraInstruction}>
//                 <Text style={[styles.textSmallBold, { color: 'white' }]}>TAKE A SELFIE</Text>
//               </View>

//               <View style={styles.captureContainer}>
//                 <TouchableOpacity style={styles.captureButton} onPress={handleCaptureImage}>
//                   <View style={styles.captureButtonInner} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </CameraView>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// // FONT SIZE SYSTEM - Perfectly Consistent
// // =======================================
// // titleLarge    : 16px - Main headers
// // titleMedium   : 15px - Section headers in cards
// // titleSmall    : 14px - Modal titles, important labels
// // textSmallBold : 13px - Buttons, emphasized text
// // textSmall     : 12px - Body text, labels
// // textXSmallBold: 11px - Uppercase labels, badges
// // textXSmall    : 10px - Helper text, timestamps
// // textAccent    : 12px - Primary colored text
// // textAccentSmall: 11px - Small colored text

// const styles = StyleSheet.create({
//   // Text Styles
//   titleLarge: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     letterSpacing: 0.4,
//   },
//   titleMedium: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#0F172A',
//   },
//   titleSmall: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#0F172A',
//     letterSpacing: 0.4,
//   },
//   textSmallBold: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#0F172A',
//     letterSpacing: 0.4,
//   },
//   textSmall: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   textXSmallBold: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: 'black',
//     letterSpacing: 0.4,
//     marginBlock: 10,
//   },
//   textXSmall: {
//     fontSize: 10,
//     color: '#64748B',
//   },
//   textAccent: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#3B82F6',
//   },
//   textAccentSmall: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#3B82F6',
//     letterSpacing: 0.4,
//   },

//   // Layout
//   sectionContainer: {
//     paddingHorizontal: 16,
//     marginBottom: 20,
//   },
//   startDayButton: {
//     backgroundColor: '#3B82F6',
//     borderRadius: 14,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   iconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   arrowCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   activeCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   activityHighlightCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     borderRadius: 14,
//     padding: 10,
//     marginBottom: 10,
//   },
//   activityIconLarge: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   timeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   activeBadge: {
//     backgroundColor: '#22C55E20',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   infoHighlightCard: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 14,
//   },
//   infoRow: {
//     flexDirection: 'row',
//   },
//   infoIconContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 8,
//     backgroundColor: '#3B82F610',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   infoContent: {
//     flex: 1,
//   },
//   actionButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 8,
//     marginTop: 4,
//   },
//   smallActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F1F5F9',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     gap: 4,
//     minWidth: 80,
//   },
//   smallActionText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#3B82F6',
//     letterSpacing: 0.3,
//   },
//   quickActionsScroll: {
//     gap: 14,
//     paddingRight: 14,
//   },
//   statsScroll: {
//     gap: 10,
//     paddingRight: 14,
//   },
//   targetCard: {
//     backgroundColor: '#FFFFFF',
//   },
//   targetHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   targetStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//   },
//   activitiesCard: {
//     backgroundColor: '#FFFFFF',
//   },
//   activityItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   activityIconSmall: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   activityContent: {
//     flex: 1,
//   },
//   statusBadge: {
//     paddingHorizontal: 6,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E2E8F0',
//     marginVertical: 3,
//   },
//   emptyState: {
//     alignItems: 'center',
//     padding: 24,
//   },
//   footer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   centeredModalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 18,
//     maxHeight: '80%',
//   },
//   centeredModalContent: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     width: '85%',
//     maxWidth: 360,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     marginBottom: 6,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   modalItemIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 12,
//     padding: 10,
//   },
//   optionsContainer: {
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     borderRadius: 8,
//     marginBottom: 12,
//     backgroundColor: '#FFFFFF',
//   },
//   optionItem: {
//     padding: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E2E8F0',
//   },
//   optionItemSelected: {
//     backgroundColor: '#3B82F610',
//   },
//   submitButton: {
//     backgroundColor: '#3B82F6',
//     borderRadius: 8,
//     padding: 14,
//     alignItems: 'center',
//   },
//   vanInfoCard: {
//     backgroundColor: '#3B82F610',
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 14,
//   },
//   routeItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 10,
//     marginBottom: 6,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   routeIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },
//   currentActivityInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#3B82F610',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 14,
//   },

//   // Camera Styles
//   cameraContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   camera: {
//     flex: 1,
//   },
//   cameraOverlay: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     justifyContent: 'space-between',
//     padding: 16,
//   },
//   closeButton: {
//     alignSelf: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   cameraInstruction: {
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   captureContainer: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   captureButton: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   captureButtonInner: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     borderWidth: 2,
//     borderColor: '#000',
//   },

//   // Enhanced Load Summary Styles
//   loadSummaryContainer: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   loadSummaryHeader: {
//     paddingTop: 60,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 20,
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: 'rgba(255,255,255,0.8)',
//     letterSpacing: 0.5,
//     marginBottom: 4,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#FFFFFF',
//     letterSpacing: 0.5,
//   },
//   headerCloseButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadNumberBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 30,
//     alignSelf: 'flex-start',
//   },
//   loadNumberLabel: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.8)',
//     marginRight: 8,
//   },
//   loadNumberValue: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#FFFFFF',
//   },
//   loadSummaryContent: {
//     flex: 1,
//     padding: 16,
//   },
//   summaryCardsContainer: {
//     marginBottom: 24,
//   },
//   summaryCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   summaryIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   summaryCardContent: {
//     flex: 1,
//   },
//   summaryCardLabel: {
//     fontSize: 12,
//     color: '#64748B',
//     marginBottom: 2,
//   },
//   summaryCardValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#0F172A',
//   },
//   skuSectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#0F172A',
//     marginBottom: 16,
//     paddingHorizontal: 4,
//   },
//   skuCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   skuHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   skuIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: '#3B82F610',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   skuIconText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#3B82F6',
//   },
//   skuTitleContainer: {
//     flex: 1,
//   },
//   skuName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#0F172A',
//     marginBottom: 2,
//   },
//   skuCode: {
//     fontSize: 11,
//     color: '#64748B',
//   },
//   stockContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     padding: 12,
//   },
//   stockItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   stockLabel: {
//     fontSize: 10,
//     color: '#64748B',
//     marginBottom: 2,
//   },
//   stockValue: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#0F172A',
//   },
//   stockDivider: {
//     width: 1,
//     backgroundColor: '#E2E8F0',
//     marginHorizontal: 12,
//   },
//   loadSummaryFooter: {
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E2E8F0',
//   },
//   proceedButton: {
//     backgroundColor: '#3B82F6',
//     borderRadius: 16,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   proceedButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     letterSpacing: 0.5,
//   },
// });
