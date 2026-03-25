// import React, { useState, useMemo, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   RefreshControl,
//   Image,
//   SectionList,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { Header } from '@/core/components/Header';
// import { Card } from '@/core/components/Card';
// import Animated, {
//   useAnimatedStyle,
//   withSpring,
//   withSequence,
//   useSharedValue,
//   FadeInDown,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import * as Location from 'expo-location';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // Mock data for beats/routes
// const BEATS_DATA = [
//   {
//     id: '1',
//     name: 'Andheri East Beat',
//     code: 'BEAT-001',
//     area: 'Andheri East',
//     zone: 'Zone 1 - Western',
//     salesman: 'Rahul Sharma',
//     salesmanId: 'EMP001',
//     day: 'Monday',
//     shift: 'Morning (9AM - 2PM)',
//     totalCustomers: 15,
//     completed: 8,
//     pending: 7,
//     distance: 12.5,
//     estimatedTime: '4.5 hours',
//     status: 'in_progress',
//     startTime: '09:00 AM',
//     endTime: '02:00 PM',
//     customers: [
//       {
//         id: 'c1',
//         name: 'Patil General Store',
//         type: 'Retail',
//         address: 'Andheri East',
//         time: '09:30 AM',
//         status: 'completed',
//         order: '₹2,500',
//       },
//       {
//         id: 'c2',
//         name: 'Joshi Medical',
//         type: 'Pharmacy',
//         address: 'Andheri East',
//         time: '10:15 AM',
//         status: 'completed',
//         order: '₹1,800',
//       },
//       {
//         id: 'c3',
//         name: 'Desai Electronics',
//         type: 'Electronics',
//         address: 'Andheri East',
//         time: '11:00 AM',
//         status: 'completed',
//         order: '₹5,200',
//       },
//       {
//         id: 'c4',
//         name: 'Kadam Traders',
//         type: 'Wholesale',
//         address: 'Andheri East',
//         time: '11:45 AM',
//         status: 'in_progress',
//         order: null,
//       },
//       {
//         id: 'c5',
//         name: 'Shinde & Sons',
//         type: 'Distributor',
//         address: 'Andheri East',
//         time: '12:30 PM',
//         status: 'pending',
//         order: null,
//       },
//       {
//         id: 'c6',
//         name: 'More Supermarket',
//         type: 'Retail',
//         address: 'Andheri East',
//         time: '01:15 PM',
//         status: 'pending',
//         order: null,
//       },
//     ],
//     coordinates: [
//       { latitude: 19.1136, longitude: 72.8697 }, // Start point
//       { latitude: 19.116, longitude: 72.877 },
//       { latitude: 19.119, longitude: 72.883 },
//       { latitude: 19.122, longitude: 72.879 },
//       { latitude: 19.125, longitude: 72.875 },
//       { latitude: 19.128, longitude: 72.871 }, // End point
//     ],
//     performance: {
//       orders: 3,
//       value: '₹9,500',
//       collections: '₹4,200',
//       newCustomers: 1,
//     },
//   },
//   {
//     id: '2',
//     name: 'Bandra West Beat',
//     code: 'BEAT-002',
//     area: 'Bandra West',
//     zone: 'Zone 1 - Western',
//     salesman: 'Rahul Sharma',
//     salesmanId: 'EMP001',
//     day: 'Tuesday',
//     shift: 'Morning (9AM - 2PM)',
//     totalCustomers: 12,
//     completed: 0,
//     pending: 12,
//     distance: 10.2,
//     estimatedTime: '3.5 hours',
//     status: 'scheduled',
//     startTime: '09:00 AM',
//     endTime: '02:00 PM',
//     customers: [
//       {
//         id: 'c7',
//         name: 'Bandra Medical',
//         type: 'Pharmacy',
//         address: 'Bandra West',
//         time: '09:30 AM',
//         status: 'pending',
//       },
//       {
//         id: 'c8',
//         name: 'Linking Road Store',
//         type: 'Retail',
//         address: 'Bandra West',
//         time: '10:15 AM',
//         status: 'pending',
//       },
//       {
//         id: 'c9',
//         name: 'Hill Road Electronics',
//         type: 'Electronics',
//         address: 'Bandra West',
//         time: '11:00 AM',
//         status: 'pending',
//       },
//     ],
//     coordinates: [
//       { latitude: 19.054, longitude: 72.8225 },
//       { latitude: 19.058, longitude: 72.828 },
//       { latitude: 19.062, longitude: 72.832 },
//     ],
//     performance: {
//       orders: 0,
//       value: '₹0',
//       collections: '₹0',
//       newCustomers: 0,
//     },
//   },
//   {
//     id: '3',
//     name: 'Juhu Circle Beat',
//     code: 'BEAT-003',
//     area: 'Juhu',
//     zone: 'Zone 1 - Western',
//     salesman: 'Rahul Sharma',
//     salesmanId: 'EMP001',
//     day: 'Wednesday',
//     shift: 'Evening (3PM - 8PM)',
//     totalCustomers: 10,
//     completed: 10,
//     pending: 0,
//     distance: 8.7,
//     estimatedTime: '3 hours',
//     status: 'completed',
//     startTime: '03:00 PM',
//     endTime: '08:00 PM',
//     customers: [
//       {
//         id: 'c10',
//         name: 'Juhu Grocery',
//         type: 'Retail',
//         address: 'Juhu',
//         time: '03:30 PM',
//         status: 'completed',
//         order: '₹3,200',
//       },
//       {
//         id: 'c11',
//         name: 'Juhu Medical',
//         type: 'Pharmacy',
//         address: 'Juhu',
//         time: '04:15 PM',
//         status: 'completed',
//         order: '₹2,800',
//       },
//     ],
//     coordinates: [
//       { latitude: 19.0884, longitude: 72.826 },
//       { latitude: 19.092, longitude: 72.83 },
//       { latitude: 19.096, longitude: 72.834 },
//     ],
//     performance: {
//       orders: 10,
//       value: '₹28,500',
//       collections: '₹15,000',
//       newCustomers: 2,
//     },
//   },
// ];

// // Route Card Component
// const RouteCard = ({ route, index, onPress }: any) => {
//   const { colors } = useTheme();
//   const scale = useSharedValue(1);

//   const handlePress = () => {
//     scale.value = withSequence(withSpring(0.98, { damping: 3 }), withSpring(1, { damping: 3 }));
//     onPress(route);
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return colors.success;
//       case 'in_progress':
//         return colors.primary;
//       case 'scheduled':
//         return colors.info;
//       case 'cancelled':
//         return colors.error;
//       default:
//         return colors.textSecondary;
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'Completed';
//       case 'in_progress':
//         return 'In Progress';
//       case 'scheduled':
//         return 'Scheduled';
//       case 'cancelled':
//         return 'Cancelled';
//       default:
//         return status;
//     }
//   };

//   const progress = (route.completed / route.totalCustomers) * 100;

//   return (
//     <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={animatedStyle}>
//       <TouchableOpacity onPress={handlePress} activeOpacity={1}>
//         <Card variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 12 }}>
//           {/* Header */}
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 8,
//             }}
//           >
//             <View>
//               <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//                 {route.name}
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
//                 {route.code} • {route.area}
//               </Text>
//             </View>
//             <View
//               style={{
//                 paddingHorizontal: 10,
//                 paddingVertical: 4,
//                 borderRadius: 16,
//                 backgroundColor: getStatusColor(route.status) + '20',
//               }}
//             >
//               <Text
//                 style={{ color: getStatusColor(route.status), fontSize: 11, fontWeight: '500' }}
//               >
//                 {getStatusText(route.status)}
//               </Text>
//             </View>
//           </View>

//           {/* Day and Shift */}
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
//             <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
//               <Ionicons name="calendar" size={14} color={colors.textTertiary} />
//               <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
//                 {route.day}
//               </Text>
//             </View>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Ionicons name="time" size={14} color={colors.textTertiary} />
//               <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>
//                 {route.startTime} - {route.endTime}
//               </Text>
//             </View>
//           </View>

//           {/* Progress Bar */}
//           <View style={{ marginBottom: 12 }}>
//             <View
//               style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
//             >
//               <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Progress</Text>
//               <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '500' }}>
//                 {route.completed}/{route.totalCustomers} customers
//               </Text>
//             </View>
//             <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
//               <View
//                 style={{
//                   width: `${progress}%`,
//                   height: 6,
//                   backgroundColor: route.status === 'completed' ? colors.success : colors.primary,
//                   borderRadius: 3,
//                 }}
//               />
//             </View>
//           </View>

//           {/* Stats Grid */}
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
//             <View style={{ alignItems: 'center' }}>
//               <Ionicons name="location" size={16} color={colors.primary} />
//               <Text
//                 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 2 }}
//               >
//                 {route.distance} km
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Distance</Text>
//             </View>
//             <View style={{ alignItems: 'center' }}>
//               <Ionicons name="time" size={16} color={colors.warning} />
//               <Text
//                 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 2 }}
//               >
//                 {route.estimatedTime}
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Duration</Text>
//             </View>
//             <View style={{ alignItems: 'center' }}>
//               <Ionicons name="people" size={16} color={colors.success} />
//               <Text
//                 style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 2 }}
//               >
//                 {route.totalCustomers}
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Customers</Text>
//             </View>
//           </View>

//           {/* Performance Preview */}
//           {route.status === 'completed' && (
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingTop: 8,
//                 borderTopWidth: 1,
//                 borderTopColor: colors.divider,
//               }}
//             >
//               <View>
//                 <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Orders</Text>
//                 <Text style={{ color: colors.success, fontSize: 14, fontWeight: '600' }}>
//                   {route.performance.orders}
//                 </Text>
//               </View>
//               <View>
//                 <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Value</Text>
//                 <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
//                   {route.performance.value}
//                 </Text>
//               </View>
//               <View>
//                 <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Collection</Text>
//                 <Text style={{ color: colors.warning, fontSize: 14, fontWeight: '600' }}>
//                   {route.performance.collections}
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
//             {route.status === 'in_progress' && (
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   backgroundColor: colors.primary,
//                   paddingVertical: 8,
//                   borderRadius: 8,
//                 }}
//               >
//                 <Ionicons name="play" size={16} color="white" />
//                 <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
//                   Continue Route
//                 </Text>
//               </TouchableOpacity>
//             )}
//             {route.status === 'scheduled' && (
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   backgroundColor: colors.success,
//                   paddingVertical: 8,
//                   borderRadius: 8,
//                 }}
//               >
//                 <Ionicons name="flag" size={16} color="white" />
//                 <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
//                   Start Route
//                 </Text>
//               </TouchableOpacity>
//             )}
//             {route.status === 'completed' && (
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   backgroundColor: colors.info,
//                   paddingVertical: 8,
//                   borderRadius: 8,
//                 }}
//               >
//                 <Ionicons name="bar-chart" size={16} color="white" />
//                 <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
//                   View Report
//                 </Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={{
//                 width: 40,
//                 height: 36,
//                 backgroundColor: colors.surface,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//                 borderRadius: 8,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//               }}
//             >
//               <Ionicons name="map" size={16} color={colors.primary} />
//             </TouchableOpacity>
//           </View>
//         </Card>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // Route Details Modal
// const RouteDetailsModal = ({ route, visible, onClose }: any) => {
//   const { colors } = useTheme();
//   const [activeTab, setActiveTab] = useState('list');

//   if (!visible) return null;

//   return (
//     <View
//       style={{
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         justifyContent: 'flex-end',
//       }}
//     >
//       <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
//       <View
//         style={{
//           backgroundColor: colors.background,
//           borderTopLeftRadius: 24,
//           borderTopRightRadius: 24,
//           maxHeight: '80%',
//         }}
//       >
//         {/* Header */}
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             padding: 16,
//             borderBottomWidth: 1,
//             borderBottomColor: colors.divider,
//           }}
//         >
//           <View>
//             <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600' }}>
//               {route.name}
//             </Text>
//             <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
//               {route.code} • {route.area}
//             </Text>
//           </View>
//           <TouchableOpacity onPress={onClose}>
//             <Ionicons name="close" size={24} color={colors.textPrimary} />
//           </TouchableOpacity>
//         </View>

//         {/* Tab Navigation */}
//         <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 }}>
//           <TouchableOpacity
//             onPress={() => setActiveTab('list')}
//             style={{
//               flex: 1,
//               paddingVertical: 8,
//               alignItems: 'center',
//               borderBottomWidth: 2,
//               borderBottomColor: activeTab === 'list' ? colors.primary : 'transparent',
//             }}
//           >
//             <Text
//               style={{
//                 color: activeTab === 'list' ? colors.primary : colors.textSecondary,
//                 fontSize: 14,
//                 fontWeight: activeTab === 'list' ? '600' : '400',
//               }}
//             >
//               Customer List
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setActiveTab('map')}
//             style={{
//               flex: 1,
//               paddingVertical: 8,
//               alignItems: 'center',
//               borderBottomWidth: 2,
//               borderBottomColor: activeTab === 'map' ? colors.primary : 'transparent',
//             }}
//           >
//             <Text
//               style={{
//                 color: activeTab === 'map' ? colors.primary : colors.textSecondary,
//                 fontSize: 14,
//                 fontWeight: activeTab === 'map' ? '600' : '400',
//               }}
//             >
//               Map View
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Content */}
//         {activeTab === 'list' ? (
//           <FlatList
//             data={route.customers}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   padding: 16,
//                   borderBottomWidth: 1,
//                   borderBottomColor: colors.divider,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 20,
//                     backgroundColor:
//                       item.status === 'completed' ? colors.success + '20' : colors.warning + '20',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     marginRight: 12,
//                   }}
//                 >
//                   <Ionicons
//                     name={item.status === 'completed' ? 'checkmark' : 'time'}
//                     size={20}
//                     color={item.status === 'completed' ? colors.success : colors.warning}
//                   />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
//                     {item.name}
//                   </Text>
//                   <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
//                     {item.type} • {item.address}
//                   </Text>
//                   <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>
//                     Scheduled: {item.time}
//                   </Text>
//                 </View>
//                 {item.order && (
//                   <View
//                     style={{
//                       backgroundColor: colors.success + '20',
//                       paddingHorizontal: 8,
//                       paddingVertical: 4,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <Text style={{ color: colors.success, fontSize: 11, fontWeight: '500' }}>
//                       {item.order}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )}
//             contentContainerStyle={{ paddingBottom: 20 }}
//           />
//         ) : (
//           <View style={{ height: 400 }}>
//             <MapView
//               provider={PROVIDER_GOOGLE}
//               style={{ flex: 1 }}
//               initialRegion={{
//                 latitude: route.coordinates[0].latitude,
//                 longitude: route.coordinates[0].longitude,
//                 latitudeDelta: 0.0922,
//                 longitudeDelta: 0.0421,
//               }}
//             >
//               <Polyline
//                 coordinates={route.coordinates}
//                 strokeColor={colors.primary}
//                 strokeWidth={3}
//               />
//               {route.coordinates.map((coord: any, index: number) => (
//                 <Marker
//                   key={index}
//                   coordinate={coord}
//                   title={
//                     index === 0
//                       ? 'Start'
//                       : index === route.coordinates.length - 1
//                         ? 'End'
//                         : `Stop ${index}`
//                   }
//                 >
//                   <View
//                     style={{
//                       width: 30,
//                       height: 30,
//                       borderRadius: 15,
//                       backgroundColor:
//                         index === 0
//                           ? colors.success
//                           : index === route.coordinates.length - 1
//                             ? colors.error
//                             : colors.primary,
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       borderWidth: 2,
//                       borderColor: 'white',
//                     }}
//                   >
//                     <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
//                       {index + 1}
//                     </Text>
//                   </View>
//                 </Marker>
//               ))}
//             </MapView>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// // Day Filter Component
// const DayFilter = ({ selectedDay, onSelectDay }: any) => {
//   const { colors } = useTheme();
//   const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       style={{ paddingHorizontal: 16, paddingBottom: 8 }}
//     >
//       {days.map((day) => (
//         <TouchableOpacity
//           key={day}
//           onPress={() => onSelectDay(day)}
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 6,
//             borderRadius: 20,
//             backgroundColor: selectedDay === day ? colors.primary : colors.surface,
//             marginRight: 8,
//             borderWidth: 1,
//             borderColor: selectedDay === day ? colors.primary : colors.border,
//           }}
//         >
//           <Text
//             style={{
//               color: selectedDay === day ? 'white' : colors.textSecondary,
//               fontSize: 13,
//               fontWeight: selectedDay === day ? '600' : '400',
//             }}
//           >
//             {day}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </ScrollView>
//   );
// };

// // Summary Card
// const SummaryCard = ({ beats }: any) => {
//   const { colors } = useTheme();

//   const totalCustomers = beats.reduce((acc: number, beat: any) => acc + beat.totalCustomers, 0);
//   const totalCompleted = beats.reduce((acc: number, beat: any) => acc + beat.completed, 0);
//   const totalDistance = beats.reduce((acc: number, beat: any) => acc + beat.distance, 0);
//   const totalOrders = beats.reduce(
//     (acc: number, beat: any) => acc + (beat.performance?.orders || 0),
//     0,
//   );
//   const totalValue = beats.reduce((acc: number, beat: any) => {
//     const value = parseInt(beat.performance?.value?.replace('₹', '').replace(',', '') || '0');
//     return acc + value;
//   }, 0);

//   return (
//     <Card variant="elevated" padding="md" style={{ margin: 16, marginTop: 0 }}>
//       <Text
//         style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 }}
//       >
//         Weekly Summary
//       </Text>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
//         <View style={{ alignItems: 'center' }}>
//           <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '700' }}>
//             {beats.length}
//           </Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Total Routes</Text>
//         </View>
//         <View style={{ alignItems: 'center' }}>
//           <Text style={{ color: colors.success, fontSize: 20, fontWeight: '700' }}>
//             {totalCustomers}
//           </Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Customers</Text>
//         </View>
//         <View style={{ alignItems: 'center' }}>
//           <Text style={{ color: colors.warning, fontSize: 20, fontWeight: '700' }}>
//             {totalDistance.toFixed(1)}km
//           </Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Distance</Text>
//         </View>
//       </View>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//         <View style={{ alignItems: 'center' }}>
//           <Text style={{ color: colors.info, fontSize: 18, fontWeight: '600' }}>{totalOrders}</Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Orders</Text>
//         </View>
//         <View style={{ alignItems: 'center' }}>
//           <Text style={{ color: colors.success, fontSize: 18, fontWeight: '600' }}>
//             ₹{(totalValue / 1000).toFixed(1)}k
//           </Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Value</Text>
//         </View>
//         <View style={{ alignItems: 'center' }}>
//           <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '600' }}>
//             {Math.round((totalCompleted / totalCustomers) * 100)}%
//           </Text>
//           <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Progress</Text>
//         </View>
//       </View>
//     </Card>
//   );
// };

// export default function BeatsScreen() {
//   const { colors } = useTheme();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedDay, setSelectedDay] = useState('All');
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [location, setLocation] = useState(null);

//   // Request location permission
//   React.useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Location permission is required for route optimization');
//         return;
//       }
//       const location: any = await Location.getCurrentPositionAsync({});
//       setLocation(location);
//     })();
//   }, []);

//   // Filter beats
//   const filteredBeats = useMemo(() => {
//     let filtered = BEATS_DATA;

//     if (selectedDay !== 'All') {
//       filtered = filtered.filter((beat) => beat.day === selectedDay);
//     }

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (beat) =>
//           beat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           beat.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           beat.code.toLowerCase().includes(searchQuery.toLowerCase()),
//       );
//     }

//     return filtered;
//   }, [searchQuery, selectedDay]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1500);
//   }, []);

//   const handleRoutePress = (route: any) => {
//     setSelectedRoute(route);
//     setModalVisible(true);
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       <Header
//         title="My Routes"
//         showMenu
//         rightIcon="calendar"
//         secondRightIcon="map"
//         onRightPress={() => router.push('/beats/calendar')}
//         onSecondRightPress={() => router.push('/beats/optimize')}
//         elevated
//       />

//       {/* Search Bar */}
//       <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             backgroundColor: colors.surface,
//             borderRadius: 12,
//             paddingHorizontal: 12,
//             borderWidth: 1,
//             borderColor: colors.border,
//           }}
//         >
//           <Ionicons name="search" size={20} color={colors.textTertiary} />
//           <TextInput
//             style={{
//               flex: 1,
//               paddingVertical: 12,
//               paddingHorizontal: 8,
//               color: colors.textPrimary,
//               fontSize: 15,
//             }}
//             placeholder="Search routes by name, area, code..."
//             placeholderTextColor={colors.placeholder}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchQuery('')}>
//               <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Day Filter */}
//       <DayFilter selectedDay={selectedDay} onSelectDay={setSelectedDay} />

//       {/* Summary Card */}
//       <SummaryCard beats={filteredBeats} />

//       {/* Routes List */}
//       <FlatList
//         data={filteredBeats}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item, index }) => (
//           <RouteCard route={item} index={index} onPress={handleRoutePress} />
//         )}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
//         }
//         onEndReached={() => {
//           if (!loading) {
//             setLoading(true);
//             setTimeout(() => setLoading(false), 1000);
//           }
//         }}
//         onEndReachedThreshold={0.5}
//         ListFooterComponent={
//           loading ? (
//             <View style={{ padding: 20, alignItems: 'center' }}>
//               <ActivityIndicator color={colors.primary} />
//             </View>
//           ) : null
//         }
//         contentContainerStyle={{ paddingBottom: 20 }}
//         ListEmptyComponent={
//           <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
//             <View
//               style={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: 40,
//                 backgroundColor: colors.border + '30',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 marginBottom: 16,
//               }}
//             >
//               <Ionicons name="map" size={40} color={colors.textTertiary} />
//             </View>
//             <Text
//               style={{
//                 color: colors.textPrimary,
//                 fontSize: 16,
//                 fontWeight: '600',
//                 marginBottom: 8,
//               }}
//             >
//               No Routes Found
//             </Text>
//             <Text
//               style={{
//                 color: colors.textSecondary,
//                 fontSize: 13,
//                 textAlign: 'center',
//                 marginBottom: 16,
//               }}
//             >
//               {searchQuery || selectedDay !== 'All'
//                 ? 'No routes match your filters'
//                 : "You don't have any routes scheduled"}
//             </Text>
//             <TouchableOpacity
//               style={{
//                 backgroundColor: colors.primary,
//                 paddingHorizontal: 20,
//                 paddingVertical: 12,
//                 borderRadius: 8,
//               }}
//             >
//               <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
//                 Create New Route
//               </Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />

//       {/* Route Details Modal */}
//       {selectedRoute && (
//         <RouteDetailsModal
//           route={selectedRoute}
//           visible={modalVisible}
//           onClose={() => setModalVisible(false)}
//         />
//       )}

//       {/* Floating Action Button */}
//       <TouchableOpacity
//         style={{
//           position: 'absolute',
//           bottom: 20,
//           right: 20,
//           width: 56,
//           height: 56,
//           borderRadius: 28,
//           backgroundColor: colors.primary,
//           justifyContent: 'center',
//           alignItems: 'center',
//           ...Platform.select({
//             ios: {
//               shadowColor: colors.primary,
//               shadowOffset: { width: 0, height: 4 },
//               shadowOpacity: 0.3,
//               shadowRadius: 8,
//             },
//             android: {
//               elevation: 8,
//             },
//           }),
//         }}
//         onPress={() => router.push('/beats/create')}
//       >
//         <Ionicons name="add" size={24} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }
