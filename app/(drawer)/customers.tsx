export { CustomersScreen as default } from '@/features/customer';

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
//   FadeIn,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';

// // Mock data for customers
// const CUSTOMERS_DATA = [
//   {
//     id: '1',
//     name: 'Patil General Store',
//     owner: 'Rajesh Patil',
//     email: 'patil.store@example.com',
//     phone: '+91 98765 4321',
//     type: 'Retail',
//     category: 'Grocery',
//     status: 'active',
//     lastVisit: '2024-01-15',
//     nextVisit: '2024-01-22',
//     totalOrders: 45,
//     totalValue: '₹2,34,500',
//     outstanding: '₹12,500',
//     creditLimit: '₹50,000',
//     creditDays: 30,
//     location: 'Andheri East, Mumbai',
//     distance: '0.5 km',
//     avatar: null,
//     tags: ['Premium', 'Regular', 'High Value'],
//     recentActivity: [
//       { type: 'order', date: '2024-01-15', amount: '₹5,200' },
//       { type: 'payment', date: '2024-01-14', amount: '₹10,000' },
//       { type: 'visit', date: '2024-01-12', by: 'Rahul Sharma' },
//     ],
//     contacts: [
//       { name: 'Rajesh Patil', role: 'Owner', phone: '+91 98765 4321' },
//       { name: 'Sunil Patil', role: 'Manager', phone: '+91 98765 4322' },
//     ],
//   },
//   {
//     id: '2',
//     name: 'Joshi Medical',
//     owner: 'Dr. Sanjay Joshi',
//     email: 'joshi.medical@example.com',
//     phone: '+91 87654 3210',
//     type: 'Pharmacy',
//     category: 'Healthcare',
//     status: 'active',
//     lastVisit: '2024-01-14',
//     nextVisit: '2024-01-21',
//     totalOrders: 78,
//     totalValue: '₹5,67,890',
//     outstanding: '₹25,000',
//     creditLimit: '₹1,00,000',
//     creditDays: 45,
//     location: 'Bandra West, Mumbai',
//     distance: '1.2 km',
//     avatar: null,
//     tags: ['VIP', 'High Volume', 'Credit'],
//     recentActivity: [
//       { type: 'order', date: '2024-01-14', amount: '₹12,500' },
//       { type: 'visit', date: '2024-01-13', by: 'Rahul Sharma' },
//     ],
//     contacts: [
//       { name: 'Dr. Sanjay Joshi', role: 'Owner', phone: '+91 87654 3210' },
//       { name: 'Priya Joshi', role: 'Pharmacist', phone: '+91 87654 3211' },
//     ],
//   },
//   {
//     id: '3',
//     name: 'Desai Electronics',
//     owner: 'Amit Desai',
//     email: 'desai.electronics@example.com',
//     phone: '+91 76543 2109',
//     type: 'Electronics',
//     category: 'Retail',
//     status: 'inactive',
//     lastVisit: '2024-01-10',
//     nextVisit: '2024-01-24',
//     totalOrders: 23,
//     totalValue: '₹1,89,000',
//     outstanding: '₹45,000',
//     creditLimit: '₹75,000',
//     creditDays: 30,
//     location: 'Malad West, Mumbai',
//     distance: '2.5 km',
//     avatar: null,
//     tags: ['Overdue', 'Follow-up'],
//     recentActivity: [
//       { type: 'payment', date: '2024-01-05', amount: '₹15,000' },
//       { type: 'visit', date: '2024-01-03', by: 'Rahul Sharma' },
//     ],
//     contacts: [{ name: 'Amit Desai', role: 'Owner', phone: '+91 76543 2109' }],
//   },
//   {
//     id: '4',
//     name: 'Kadam Traders',
//     owner: 'Suresh Kadam',
//     email: 'kadam.traders@example.com',
//     phone: '+91 65432 1098',
//     type: 'Wholesale',
//     category: 'FMCG',
//     status: 'active',
//     lastVisit: '2024-01-16',
//     nextVisit: '2024-01-23',
//     totalOrders: 112,
//     totalValue: '₹8,45,000',
//     outstanding: '₹32,000',
//     creditLimit: '₹2,00,000',
//     creditDays: 60,
//     location: 'Dadar, Mumbai',
//     distance: '3.8 km',
//     avatar: null,
//     tags: ['Key Account', 'Monthly Order'],
//     recentActivity: [
//       { type: 'order', date: '2024-01-16', amount: '₹25,000' },
//       { type: 'payment', date: '2024-01-15', amount: '₹30,000' },
//     ],
//     contacts: [
//       { name: 'Suresh Kadam', role: 'Owner', phone: '+91 65432 1098' },
//       { name: 'Ramesh Kadam', role: 'Partner', phone: '+91 65432 1099' },
//     ],
//   },
//   {
//     id: '5',
//     name: 'Shinde & Sons',
//     owner: 'Vikas Shinde',
//     email: 'shinde.sons@example.com',
//     phone: '+91 54321 0987',
//     type: 'Distributor',
//     category: 'FMCG',
//     status: 'active',
//     lastVisit: '2024-01-12',
//     nextVisit: '2024-01-19',
//     totalOrders: 156,
//     totalValue: '₹12,34,500',
//     outstanding: '₹67,800',
//     creditLimit: '₹3,00,000',
//     creditDays: 45,
//     location: 'Thane West',
//     distance: '5.2 km',
//     avatar: null,
//     tags: ['Distributor', 'High Value'],
//     recentActivity: [
//       { type: 'order', date: '2024-01-12', amount: '₹45,000' },
//       { type: 'visit', date: '2024-01-11', by: 'Rahul Sharma' },
//     ],
//     contacts: [
//       { name: 'Vikas Shinde', role: 'Owner', phone: '+91 54321 0987' },
//       { name: 'Anita Shinde', role: 'Accounts', phone: '+91 54321 0988' },
//     ],
//   },
// ];

// // Quick Filter Chips
// const FilterChip = ({ label, active, onPress, count }: any) => {
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
//       <Animated.View style={[animatedStyle]}>
//         <LinearGradient
//           colors={
//             active
//               ? [colors.primary, colors.primaryDark || colors.primary + 'CC']
//               : ['transparent', 'transparent']
//           }
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 8,
//             borderRadius: 20,
//             borderWidth: 1,
//             borderColor: active ? colors.primary : colors.border,
//             marginRight: 8,
//           }}
//         >
//           <Text
//             style={{
//               color: active ? 'white' : colors.textSecondary,
//               fontSize: 13,
//               fontWeight: active ? '600' : '400',
//             }}
//           >
//             {label} {count ? `(${count})` : ''}
//           </Text>
//         </LinearGradient>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// // Customer Card Component
// const CustomerCard = ({ customer, index }: any) => {
//   const { colors } = useTheme();
//   const scale = useSharedValue(1);

//   const handlePress = () => {
//     scale.value = withSequence(withSpring(0.98, { damping: 3 }), withSpring(1, { damping: 3 }));
//     // Navigate to customer details
//     router.push(`/customers/${customer.id}`);
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'active':
//         return colors.success;
//       case 'inactive':
//         return colors.warning;
//       default:
//         return colors.textSecondary;
//     }
//   };

//   return (
//     <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={animatedStyle}>
//       <TouchableOpacity onPress={handlePress} activeOpacity={1}>
//         <Card variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 12 }}>
//           {/* Header */}
//           <View style={{ flexDirection: 'row', marginBottom: 12 }}>
//             <View
//               style={{
//                 width: 50,
//                 height: 50,
//                 borderRadius: 25,
//                 backgroundColor: colors.primary + '20',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 marginRight: 12,
//               }}
//             >
//               {customer.avatar ? (
//                 <Image
//                   source={{ uri: customer.avatar }}
//                   style={{ width: 50, height: 50, borderRadius: 25 }}
//                 />
//               ) : (
//                 <Text style={{ fontSize: 20, color: colors.primary, fontWeight: '600' }}>
//                   {customer.name.charAt(0)}
//                 </Text>
//               )}
//             </View>
//             <View style={{ flex: 1 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                 }}
//               >
//                 <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
//                   {customer.name}
//                 </Text>
//                 <View
//                   style={{
//                     paddingHorizontal: 8,
//                     paddingVertical: 2,
//                     borderRadius: 12,
//                     backgroundColor: getStatusColor(customer.status) + '20',
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: getStatusColor(customer.status),
//                       fontSize: 10,
//                       fontWeight: '500',
//                     }}
//                   >
//                     {customer.status}
//                   </Text>
//                 </View>
//               </View>
//               <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
//                 {customer.owner} • {customer.type}
//               </Text>
//               <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
//                 <Ionicons name="location" size={12} color={colors.textTertiary} />
//                 <Text style={{ color: colors.textTertiary, fontSize: 11, marginLeft: 2, flex: 1 }}>
//                   {customer.distance} • {customer.location}
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Tags */}
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
//             {customer.tags.map((tag: string, idx: number) => (
//               <View
//                 key={idx}
//                 style={{
//                   backgroundColor: colors.info + '10',
//                   paddingHorizontal: 8,
//                   paddingVertical: 2,
//                   borderRadius: 12,
//                   marginRight: 6,
//                   marginBottom: 4,
//                 }}
//               >
//                 <Text style={{ color: colors.info, fontSize: 10 }}>#{tag}</Text>
//               </View>
//             ))}
//           </View>

//           {/* Stats Grid */}
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
//             <View style={{ alignItems: 'center' }}>
//               <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
//                 {customer.totalOrders}
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Orders</Text>
//             </View>
//             <View style={{ width: 1, height: 30, backgroundColor: colors.divider }} />
//             <View style={{ alignItems: 'center' }}>
//               <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>
//                 {customer.totalValue}
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Value</Text>
//             </View>
//             <View style={{ width: 1, height: 30, backgroundColor: colors.divider }} />
//             <View style={{ alignItems: 'center' }}>
//               <Text
//                 style={{
//                   color: customer.outstanding > 0 ? colors.error : colors.success,
//                   fontSize: 14,
//                   fontWeight: '600',
//                 }}
//               >
//                 {customer.outstanding}
//               </Text>
//               <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Outstanding</Text>
//             </View>
//           </View>

//           {/* Visit Info */}
//           <View
//             style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
//           >
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Ionicons name="calendar" size={14} color={colors.textTertiary} />
//               <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 4 }}>
//                 Last: {customer.lastVisit}
//               </Text>
//             </View>
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <Ionicons name="calendar" size={14} color={colors.primary} />
//               <Text
//                 style={{ color: colors.primary, fontSize: 11, marginLeft: 4, fontWeight: '500' }}
//               >
//                 Next: {customer.nextVisit}
//               </Text>
//             </View>
//           </View>

//           {/* Quick Actions */}
//           <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
//             <TouchableOpacity
//               style={{
//                 flex: 1,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backgroundColor: colors.primary,
//                 paddingVertical: 8,
//                 borderRadius: 8,
//               }}
//             >
//               <Ionicons name="location" size={16} color="white" />
//               <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
//                 Check In
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={{
//                 flex: 1,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backgroundColor: colors.success,
//                 paddingVertical: 8,
//                 borderRadius: 8,
//               }}
//             >
//               <Ionicons name="cart" size={16} color="white" />
//               <Text style={{ color: 'white', fontSize: 12, marginLeft: 4, fontWeight: '500' }}>
//                 New Order
//               </Text>
//             </TouchableOpacity>
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
//               <Ionicons name="call" size={16} color={colors.primary} />
//             </TouchableOpacity>
//           </View>
//         </Card>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // Section Header
// const SectionHeader = ({ title, count }: { title: string; count: number }) => {
//   const { colors } = useTheme();

//   return (
//     <View
//       style={{
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         backgroundColor: colors.background,
//       }}
//     >
//       <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
//         {title} • {count}
//       </Text>
//       <TouchableOpacity>
//         <Text style={{ color: colors.primary, fontSize: 12 }}>View All</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // Empty State
// const EmptyState = ({ searchQuery }: { searchQuery: string }) => {
//   const { colors } = useTheme();

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
//       <View
//         style={{
//           width: 80,
//           height: 80,
//           borderRadius: 40,
//           backgroundColor: colors.border + '30',
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginBottom: 16,
//         }}
//       >
//         <Ionicons name="people" size={40} color={colors.textTertiary} />
//       </View>
//       <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
//         No Customers Found
//       </Text>
//       <Text
//         style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 16 }}
//       >
//         {searchQuery ? `No results for "${searchQuery}"` : "You haven't added any customers yet"}
//       </Text>
//       <TouchableOpacity
//         style={{
//           backgroundColor: colors.primary,
//           paddingHorizontal: 20,
//           paddingVertical: 12,
//           borderRadius: 8,
//         }}
//       >
//         <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Add New Customer</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default function CustomersScreen() {
//   const { colors } = useTheme();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

//   // Filter options with counts
//   const filters = [
//     { id: 'all', label: 'All', count: CUSTOMERS_DATA.length },
//     {
//       id: 'active',
//       label: 'Active',
//       count: CUSTOMERS_DATA.filter((c) => c.status === 'active').length,
//     },
//     {
//       id: 'inactive',
//       label: 'Inactive',
//       count: CUSTOMERS_DATA.filter((c) => c.status === 'inactive').length,
//     },
//     {
//       id: 'nearby',
//       label: 'Nearby (< 2km)',
//       count: CUSTOMERS_DATA.filter((c) => parseFloat(c.distance) < 2).length,
//     },
//     {
//       id: 'high-value',
//       label: 'High Value',
//       count: CUSTOMERS_DATA.filter((c) => c.tags.includes('High Value')).length,
//     },
//     {
//       id: 'overdue',
//       label: 'Overdue',
//       count: CUSTOMERS_DATA.filter((c) => c.tags.includes('Overdue')).length,
//     },
//   ];

//   // Filter and search customers
//   const filteredCustomers = useMemo(() => {
//     let filtered = CUSTOMERS_DATA;

//     // Apply search
//     if (searchQuery) {
//       filtered = filtered.filter(
//         (c) =>
//           c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           c.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           c.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
//       );
//     }

//     // Apply filter
//     switch (selectedFilter) {
//       case 'active':
//         filtered = filtered.filter((c) => c.status === 'active');
//         break;
//       case 'inactive':
//         filtered = filtered.filter((c) => c.status === 'inactive');
//         break;
//       case 'nearby':
//         filtered = filtered.filter((c) => parseFloat(c.distance) < 2);
//         break;
//       case 'high-value':
//         filtered = filtered.filter((c) => c.tags.includes('High Value'));
//         break;
//       case 'overdue':
//         filtered = filtered.filter((c) => c.tags.includes('Overdue'));
//         break;
//     }

//     return filtered;
//   }, [searchQuery, selectedFilter]);

//   // Group customers by first letter
//   const groupedCustomers = useMemo(() => {
//     const groups: { [key: string]: typeof CUSTOMERS_DATA } = {};
//     filteredCustomers.forEach((customer) => {
//       const firstLetter = customer.name.charAt(0).toUpperCase();
//       if (!groups[firstLetter]) {
//         groups[firstLetter] = [];
//       }
//       groups[firstLetter].push(customer);
//     });
//     return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
//   }, [filteredCustomers]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     // Simulate API call
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1500);
//   }, []);

//   const handleLoadMore = () => {
//     if (!loading) {
//       setLoading(true);
//       // Simulate loading more data
//       setTimeout(() => {
//         setLoading(false);
//       }, 1000);
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       {/* <Header
//         title="Customers"
//         showMenu
//         rightIcon="add"
//         secondRightIcon="scan"
//         onRightPress={() => router.push('/customers/add')}
//         onSecondRightPress={() => router.push('/customers/scan')}
//         elevated
//       /> */}

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
//             placeholder="Search customers..."
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

//       {/* Filters */}
//       <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
//         <FlatList
//           data={filters}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <FilterChip
//               label={item.label}
//               count={item.count}
//               active={selectedFilter === item.id}
//               onPress={() => setSelectedFilter(item.id)}
//             />
//           )}
//         />
//       </View>

//       {/* View Mode Toggle */}
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           paddingHorizontal: 16,
//           paddingBottom: 8,
//         }}
//       >
//         <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
//           {filteredCustomers.length} customers found
//         </Text>
//         <View style={{ flexDirection: 'row', gap: 8 }}>
//           <TouchableOpacity
//             onPress={() => setViewMode('list')}
//             style={{
//               padding: 6,
//               backgroundColor: viewMode === 'list' ? colors.primary + '20' : 'transparent',
//               borderRadius: 8,
//             }}
//           >
//             <Ionicons
//               name="list"
//               size={20}
//               color={viewMode === 'list' ? colors.primary : colors.textTertiary}
//             />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setViewMode('grid')}
//             style={{
//               padding: 6,
//               backgroundColor: viewMode === 'grid' ? colors.primary + '20' : 'transparent',
//               borderRadius: 8,
//             }}
//           >
//             <Ionicons
//               name="grid"
//               size={20}
//               color={viewMode === 'grid' ? colors.primary : colors.textTertiary}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {filteredCustomers.length === 0 ? (
//         <EmptyState searchQuery={searchQuery} />
//       ) : (
//         <SectionList
//           sections={groupedCustomers.map(([letter, data]) => ({ title: letter, data }))}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item, index }) => <CustomerCard customer={item} index={index} />}
//           renderSectionHeader={({ section: { title, data } }) => (
//             <SectionHeader title={`Section ${title}`} count={data.length} />
//           )}
//           stickySectionHeadersEnabled
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={[colors.primary]}
//             />
//           }
//           onEndReached={handleLoadMore}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={
//             loading ? (
//               <View style={{ padding: 20, alignItems: 'center' }}>
//                 <ActivityIndicator color={colors.primary} />
//               </View>
//             ) : null
//           }
//           contentContainerStyle={{ paddingBottom: 20 }}
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
//         onPress={() => router.push('/customers/add')}
//       >
//         <Ionicons name="add" size={24} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }
