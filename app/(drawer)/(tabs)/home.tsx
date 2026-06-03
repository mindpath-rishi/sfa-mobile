import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';
import { ManagerHomeScreen, SalesExecutiveHomeScreen } from '@/features/home';

export default function RoleAwareHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const HomeComponent = isSalesman(user) ? SalesExecutiveHomeScreen : ManagerHomeScreen;

  return <HomeComponent />;
}

// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { Card } from '@/core/components/Card';
// import { router } from 'expo-router';
// import Animated, {
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   interpolate,
//   Extrapolate,
//   useSharedValue,
//   withSequence,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // Mock data for salesman
// const MOCK_DATA = {
//   userName: 'Rahul Sharma',
//   todayVisits: 8,
//   totalVisits: 12,
//   targetAchieved: 65,
//   pendingOrders: 5,
//   completedOrders: 12,
//   collections: 'K45,000',
//   incentives: 'K2,500',
//   recentActivities: [
//     {
//       id: 1,
//       customer: 'Patil General Store',
//       type: 'visit',
//       time: '10:30 AM',
//       status: 'completed',
//     },
//     { id: 2, customer: 'Joshi Medical', type: 'order', time: '11:45 AM', status: 'pending' },
//     {
//       id: 3,
//       customer: 'Desai Electronics',
//       type: 'collection',
//       time: '2:15 PM',
//       status: 'completed',
//     },
//     { id: 4, customer: 'Kadam Traders', type: 'visit', time: '3:30 PM', status: 'scheduled' },
//     { id: 5, customer: 'Shinde & Sons', type: 'order', time: '4:45 PM', status: 'delivered' },
//   ],
//   topProducts: [
//     { name: 'Product A', sales: 45, revenue: 'K22,500' },
//     { name: 'Product B', sales: 32, revenue: 'K16,000' },
//     { name: 'Product C', sales: 28, revenue: 'K14,000' },
//   ],
//   nearbyCustomers: [
//     { id: 1, name: 'Patil General Store', distance: '0.5 km', type: 'Retail' },
//     { id: 2, name: 'Joshi Medical', distance: '0.8 km', type: 'Pharmacy' },
//     { id: 3, name: 'Desai Electronics', distance: '1.2 km', type: 'Electronics' },
//   ],
// };

// // Quick Action Button Component
// const QuickAction = ({ icon, label, color, onPress }: any) => {
//   const { colors } = useTheme();
//   const scale = useSharedValue(1);

//   const handlePress = () => {
//     scale.value = withSequence(withSpring(0.9, { damping: 3 }), withSpring(1, { damping: 3 }));
//     onPress();
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   return (
//     <TouchableOpacity onPress={handlePress} activeOpacity={1}>
//       <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
//         <LinearGradient
//           colors={[color, color + 'CC']}
//           style={{
//             width: 56,
//             height: 56,
//             borderRadius: 28,
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginBottom: 4,
//           }}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <Ionicons name={icon} size={24} color="white" />
//         </LinearGradient>
//         <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{label}</Text>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// // Stat Card Component
// const StatCard = ({ title, value, icon, color, trend }: any) => {
//   const { colors } = useTheme();

//   return (
//     <Card variant="elevated" padding="md" style={{ flex: 1 }}>
//       <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
//         <View
//           style={{
//             width: 36,
//             height: 36,
//             borderRadius: 18,
//             backgroundColor: color + '20',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginRight: 8,
//           }}
//         >
//           <Ionicons name={icon} size={18} color={color} />
//         </View>
//         <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{title}</Text>
//       </View>
//       <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>{value}</Text>
//       {trend && (
//         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
//           <Ionicons
//             name={trend > 0 ? 'trending-up' : 'trending-down'}
//             size={14}
//             color={trend > 0 ? colors.success : colors.error}
//           />
//           <Text
//             style={{
//               color: trend > 0 ? colors.success : colors.error,
//               fontSize: 11,
//               marginLeft: 2,
//             }}
//           >
//             {Math.abs(trend)}% from yesterday
//           </Text>
//         </View>
//       )}
//     </Card>
//   );
// };

// // Progress Bar Component
// const ProgressBar = ({ progress, label, value, color }: any) => {
//   const { colors } = useTheme();
//   const width = useSharedValue(0);

//   useEffect(() => {
//     width.value = withSpring(progress);
//   }, [progress]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     width: `${width.value}%`,
//   }));

//   return (
//     <View style={{ marginBottom: 12 }}>
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
//         <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
//         <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}>{value}</Text>
//       </View>
//       <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3 }}>
//         <Animated.View
//           style={[animatedStyle, { height: 6, backgroundColor: color, borderRadius: 3 }]}
//         />
//       </View>
//     </View>
//   );
// };

// // Activity Item Component
// const ActivityItem = ({ item }: any) => {
//   const { colors } = useTheme();

//   const getIcon = () => {
//     switch (item.type) {
//       case 'visit':
//         return 'location';
//       case 'order':
//         return 'cart';
//       case 'collection':
//         return 'cash';
//       default:
//         return 'time';
//     }
//   };

//   const getStatusColor = () => {
//     switch (item.status) {
//       case 'completed':
//         return colors.success;
//       case 'pending':
//         return colors.warning;
//       case 'scheduled':
//         return colors.info;
//       case 'delivered':
//         return colors.success;
//       default:
//         return colors.textSecondary;
//     }
//   };

//   return (
//     <View
//       style={{
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: colors.divider,
//       }}
//     >
//       <View
//         style={{
//           width: 40,
//           height: 40,
//           borderRadius: 20,
//           backgroundColor: getStatusColor() + '20',
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginRight: 12,
//         }}
//       >
//         <Ionicons name={getIcon()} size={20} color={getStatusColor()} />
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
//           {item.customer}
//         </Text>
//         <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
//           {item.time} • {item.type}
//         </Text>
//       </View>
//       <View
//         style={{
//           paddingHorizontal: 8,
//           paddingVertical: 4,
//           borderRadius: 12,
//           backgroundColor: getStatusColor() + '20',
//         }}
//       >
//         <Text style={{ color: getStatusColor(), fontSize: 10, fontWeight: '500' }}>
//           {item.status}
//         </Text>
//       </View>
//     </View>
//   );
// };

// export default function HomeScreen() {
//   const { colors } = useTheme();
//   const [refreshing, setRefreshing] = useState(false);
//   const [data, setData] = useState(MOCK_DATA);
//   const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';

//   const onRefresh = () => {
//     setRefreshing(true);
//     // Simulate API call
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 2000);
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
//         }
//       >
//         {/* Quick Actions */}
//         <View style={{ padding: 16 }}>
//           <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 12 }}>
//             Quick Actions
//           </Text>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
//             <QuickAction
//               icon="location"
//               label="Check In"
//               color="#4158D0"
//               onPress={() => router.push('/checkin')}
//             />
//             <QuickAction
//               icon="cart"
//               label="New Order"
//               color="#C850C0"
//               onPress={() => router.push('/orders/new')}
//             />
//             <QuickAction
//               icon="cash"
//               label="Collection"
//               color="#FF512F"
//               onPress={() => router.push('/collections')}
//             />
//             <QuickAction
//               icon="people"
//               label="Customers"
//               color="#11998e"
//               onPress={() => router.push('/customers')}
//             />
//           </View>
//         </View>

//         {/* Stats Overview */}
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
//           <StatCard
//             title="Today's Visits"
//             value={`${data.todayVisits}/${data.totalVisits}`}
//             icon="calendar"
//             color="#4158D0"
//             trend={12}
//           />
//           <View style={{ width: 12 }} />
//           <StatCard
//             title="Pending Orders"
//             value={data.pendingOrders.toString()}
//             icon="cart"
//             color="#C850C0"
//             trend={-5}
//           />
//           <View style={{ width: 12 }} />
//           <StatCard
//             title="Collections"
//             value={data.collections}
//             icon="cash"
//             color="#11998e"
//             trend={8}
//           />
//           <View style={{ width: 12 }} />
//           <StatCard
//             title="Incentives"
//             value={data.incentives}
//             icon="trophy"
//             color="#F37335"
//             trend={15}
//           />
//           <View style={{ width: 16 }} />
//         </ScrollView>

//         {/* Target Progress */}
//         <Card variant="elevated" padding="md" style={{ margin: 16 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 12,
//             }}
//           >
//             <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//               Monthly Target
//             </Text>
//             <TouchableOpacity onPress={() => router.push('/targets')}>
//               <Text style={{ color: colors.primary, fontSize: 12 }}>View Details</Text>
//             </TouchableOpacity>
//           </View>
//           <ProgressBar
//             progress={data.targetAchieved}
//             label="Target Achieved"
//             value={`${data.targetAchieved}%`}
//             color={colors.success}
//           />
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
//             <View>
//               <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Completed Orders</Text>
//               <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//                 {data.completedOrders}
//               </Text>
//             </View>
//             <View style={{ alignItems: 'flex-end' }}>
//               <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Total Revenue</Text>
//               <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//                 K67,500
//               </Text>
//             </View>
//           </View>
//         </Card>

//         {/* Top Products */}
//         <Card variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 16 }}>
//           <Text
//             style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 }}
//           >
//             Top Products
//           </Text>
//           {data.topProducts.map((product, index) => (
//             <View
//               key={index}
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingVertical: 8,
//                 borderBottomWidth: index < 2 ? 1 : 0,
//                 borderBottomColor: colors.divider,
//               }}
//             >
//               <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{product.name}</Text>
//               <View style={{ flexDirection: 'row', gap: 16 }}>
//                 <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
//                   {product.sales} units
//                 </Text>
//                 <Text style={{ color: colors.success, fontSize: 12, fontWeight: '500' }}>
//                   {product.revenue}
//                 </Text>
//               </View>
//             </View>
//           ))}
//         </Card>

//         {/* Nearby Customers */}
//         <Card variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 16 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 12,
//             }}
//           >
//             <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//               Nearby Customers
//             </Text>
//             <TouchableOpacity onPress={() => router.push('/customers/nearby')}>
//               <Text style={{ color: colors.primary, fontSize: 12 }}>View All</Text>
//             </TouchableOpacity>
//           </View>
//           {data.nearbyCustomers.map((customer) => (
//             <TouchableOpacity
//               key={customer.id}
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 paddingVertical: 10,
//                 borderBottomWidth: 1,
//                 borderBottomColor: colors.divider,
//               }}
//               onPress={() => router.push(`/customers/${customer.id}`)}
//             >
//               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                 <View
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 20,
//                     backgroundColor: colors.primary + '20',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     marginRight: 12,
//                   }}
//                 >
//                   <Ionicons name="storefront" size={20} color={colors.primary} />
//                 </View>
//                 <View>
//                   <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>
//                     {customer.name}
//                   </Text>
//                   <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
//                     {customer.type} • {customer.distance}
//                   </Text>
//                 </View>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
//             </TouchableOpacity>
//           ))}
//         </Card>

//         {/* Recent Activities */}
//         <Card variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 30 }}>
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: 12,
//             }}
//           >
//             <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//               Today's Activities
//             </Text>
//             <TouchableOpacity onPress={() => router.push('/activities')}>
//               <Text style={{ color: colors.primary, fontSize: 12 }}>View All</Text>
//             </TouchableOpacity>
//           </View>
//           {data.recentActivities.map((activity) => (
//             <ActivityItem key={activity.id} item={activity} />
//           ))}
//         </Card>

//         {/* Current Time */}
//         <View style={{ alignItems: 'center', marginBottom: 20 }}>
//           <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
//             {/* Last updated: {formatTime(new Date())} */}
//           </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }
