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
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { Card } from '@/core/components/Card';
// import Animated, {
//   useAnimatedStyle,
//   withSpring,
//   withSequence,
//   useSharedValue,
//   FadeInDown,
// } from 'react-native-reanimated';
// import { LinearGradient } from 'expo-linear-gradient';

// // Mock data for products
// const PRODUCTS_DATA = [
//   {
//     id: '1',
//     name: 'Premium Basmati Rice',
//     sku: 'GRC-001',
//     category: 'Groceries',
//     subCategory: 'Rice',
//     brand: 'Royal Farms',
//     description: 'Extra long grain basmati rice, aged for 2 years',
//     price: 1200,
//     mrp: 1500,
//     discount: 20,
//     unit: '5 kg',
//     stock: 45,
//     minStock: 10,
//     maxStock: 100,
//     status: 'in_stock',
//     image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400',
//     tags: ['Premium', 'Best Seller', 'Imported'],
//     variants: [
//       { name: '1 kg', price: 280, stock: 120 },
//       { name: '5 kg', price: 1200, stock: 45 },
//       { name: '10 kg', price: 2200, stock: 20 },
//     ],
//     scheme: 'Buy 5kg get 1kg free',
//     margin: 18,
//     gst: 5,
//     hsn: '10063010',
//     manufacturer: 'Royal Farms Ltd.',
//     expiryDate: '2025-12-31',
//     ratings: 4.5,
//     reviews: 128,
//     lastOrdered: '2024-01-15',
//     reorderPoint: 15,
//   },
//   {
//     id: '2',
//     name: 'Fortune Sunflower Oil',
//     sku: 'OIL-002',
//     category: 'Cooking Oil',
//     subCategory: 'Sunflower',
//     brand: 'Fortune',
//     description: 'Pure refined sunflower oil, cholesterol free',
//     price: 450,
//     mrp: 550,
//     discount: 18,
//     unit: '1 L',
//     stock: 78,
//     minStock: 20,
//     maxStock: 200,
//     status: 'in_stock',
//     image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
//     tags: ['Daily Use', 'Popular'],
//     variants: [
//       { name: '500 ml', price: 250, stock: 150 },
//       { name: '1 L', price: 450, stock: 78 },
//       { name: '5 L', price: 2100, stock: 25 },
//     ],
//     scheme: '10% off on bulk order',
//     margin: 15,
//     gst: 12,
//     hsn: '15121900',
//     manufacturer: 'Adani Wilmar',
//     expiryDate: '2024-06-30',
//     ratings: 4.3,
//     reviews: 256,
//     lastOrdered: '2024-01-14',
//     reorderPoint: 25,
//   },
//   {
//     id: '3',
//     name: 'Tata Salt',
//     sku: 'SALT-003',
//     category: 'Groceries',
//     subCategory: 'Salt',
//     brand: 'Tata',
//     description: 'Iodized vacuum evaporated salt',
//     price: 25,
//     mrp: 30,
//     discount: 16,
//     unit: '1 kg',
//     stock: 5,
//     minStock: 20,
//     maxStock: 500,
//     status: 'low_stock',
//     image: 'https://images.unsplash.com/photo-1626197031507-170e110c0e6d?w=400',
//     tags: ['Low Stock', 'Essential'],
//     variants: [
//       { name: '1 kg', price: 25, stock: 5 },
//       { name: '500 g', price: 15, stock: 12 },
//     ],
//     scheme: null,
//     margin: 10,
//     gst: 5,
//     hsn: '25010010',
//     manufacturer: 'Tata Chemicals',
//     expiryDate: '2025-01-31',
//     ratings: 4.7,
//     reviews: 512,
//     lastOrdered: '2024-01-10',
//     reorderPoint: 30,
//   },
//   {
//     id: '4',
//     name: 'Amul Gold Milk',
//     sku: 'MLK-004',
//     category: 'Dairy',
//     subCategory: 'Milk',
//     brand: 'Amul',
//     description: 'Full cream fresh milk, toned',
//     price: 65,
//     mrp: 70,
//     discount: 7,
//     unit: '1 L',
//     stock: 0,
//     minStock: 10,
//     maxStock: 100,
//     status: 'out_of_stock',
//     image: 'https://images.unsplash.com/photo-1550583724-b2692b9416b1?w=400',
//     tags: ['Out of Stock', 'Daily Need'],
//     variants: [
//       { name: '500 ml', price: 34, stock: 0 },
//       { name: '1 L', price: 65, stock: 0 },
//     ],
//     scheme: null,
//     margin: 8,
//     gst: 0,
//     hsn: '04011000',
//     manufacturer: 'GCMMF',
//     expiryDate: '2024-01-25',
//     ratings: 4.8,
//     reviews: 890,
//     lastOrdered: '2024-01-12',
//     reorderPoint: 15,
//   },
//   {
//     id: '5',
//     name: 'Nestle Maggi Noodles',
//     sku: 'NOO-005',
//     category: 'Instant Food',
//     subCategory: 'Noodles',
//     brand: 'Nestle',
//     description: '2-minute instant noodles, masala flavor',
//     price: 12,
//     mrp: 14,
//     discount: 14,
//     unit: '70 g',
//     stock: 234,
//     minStock: 50,
//     maxStock: 1000,
//     status: 'in_stock',
//     image: 'https://images.unsplash.com/photo-1612929633738-8fe44ee7c8c2?w=400',
//     tags: ['Bestseller', 'Snacks'],
//     variants: [
//       { name: '70 g', price: 12, stock: 234 },
//       { name: '140 g', price: 22, stock: 156 },
//       { name: 'Pack of 12', price: 130, stock: 45 },
//     ],
//     scheme: 'Buy 12 get 1 free',
//     margin: 12,
//     gst: 18,
//     hsn: '19023010',
//     manufacturer: 'Nestle India',
//     expiryDate: '2024-08-31',
//     ratings: 4.6,
//     reviews: 2341,
//     lastOrdered: '2024-01-16',
//     reorderPoint: 100,
//   },
//   {
//     id: '6',
//     name: 'Colgate Dental Cream',
//     sku: 'COL-006',
//     category: 'Personal Care',
//     subCategory: 'Oral Care',
//     brand: 'Colgate',
//     description: 'Strong teeth, strong gums protection',
//     price: 85,
//     mrp: 100,
//     discount: 15,
//     unit: '200 g',
//     stock: 67,
//     minStock: 30,
//     maxStock: 200,
//     status: 'in_stock',
//     image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
//     tags: ['Healthcare', 'Daily Use'],
//     variants: [
//       { name: '100 g', price: 45, stock: 89 },
//       { name: '200 g', price: 85, stock: 67 },
//       { name: 'Combo Pack', price: 160, stock: 23 },
//     ],
//     scheme: '15% off on combo',
//     margin: 14,
//     gst: 18,
//     hsn: '33061020',
//     manufacturer: 'Colgate-Palmolive',
//     expiryDate: '2025-03-31',
//     ratings: 4.4,
//     reviews: 678,
//     lastOrdered: '2024-01-13',
//     reorderPoint: 40,
//   },
//   {
//     id: '7',
//     name: 'Patanjali Honey',
//     sku: 'HON-007',
//     category: 'Health Foods',
//     subCategory: 'Honey',
//     brand: 'Patanjali',
//     description: 'Pure, natural honey from Himalayan region',
//     price: 280,
//     mrp: 350,
//     discount: 20,
//     unit: '500 g',
//     stock: 23,
//     minStock: 15,
//     maxStock: 100,
//     status: 'in_stock',
//     image: 'https://images.unsplash.com/photo-1587049352851-8d4e8912bcc5?w=400',
//     tags: ['Natural', 'Ayurvedic'],
//     variants: [
//       { name: '250 g', price: 150, stock: 34 },
//       { name: '500 g', price: 280, stock: 23 },
//       { name: '1 kg', price: 520, stock: 12 },
//     ],
//     scheme: 'Free spoon with 500g',
//     margin: 16,
//     gst: 5,
//     hsn: '04090000',
//     manufacturer: 'Patanjali Ayurved',
//     expiryDate: '2025-06-30',
//     ratings: 4.5,
//     reviews: 345,
//     lastOrdered: '2024-01-11',
//     reorderPoint: 20,
//   },
//   {
//     id: '8',
//     name: 'Pears Soap',
//     sku: 'SOAP-008',
//     category: 'Personal Care',
//     subCategory: 'Soap',
//     brand: 'Pears',
//     description: 'Glycerin soap for soft, glowing skin',
//     price: 85,
//     mrp: 95,
//     discount: 10,
//     unit: '125 g',
//     stock: 156,
//     minStock: 50,
//     maxStock: 300,
//     status: 'in_stock',
//     image: 'https://images.unsplash.com/photo-1600850052358-1fd7e79fc10c?w=400',
//     tags: ['Skincare', 'Premium'],
//     variants: [
//       { name: '75 g', price: 55, stock: 200 },
//       { name: '125 g', price: 85, stock: 156 },
//       { name: 'Pack of 3', price: 240, stock: 45 },
//     ],
//     scheme: 'Buy 3 get 5% off',
//     margin: 13,
//     gst: 18,
//     hsn: '34011110',
//     manufacturer: 'HUL',
//     expiryDate: '2025-09-30',
//     ratings: 4.3,
//     reviews: 456,
//     lastOrdered: '2024-01-14',
//     reorderPoint: 60,
//   },
// ];

// // Category Icons Mapping
// const CATEGORY_ICONS: { [key: string]: string } = {
//   Groceries: 'basket',
//   'Cooking Oil': 'water',
//   Dairy: 'water',
//   'Instant Food': 'fast-food',
//   'Personal Care': 'body',
//   'Health Foods': 'leaf',
//   Beverages: 'cafe',
//   Snacks: 'pizza',
//   Household: 'home',
// };

// // Filter Chip Component
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
//             paddingHorizontal: 12,
//             paddingVertical: 6,
//             borderRadius: 16,
//             borderWidth: 1,
//             borderColor: active ? colors.primary : colors.border,
//             marginRight: 6,
//           }}
//         >
//           <Text
//             style={{
//               color: active ? 'white' : colors.textSecondary,
//               fontSize: 12,
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

// // Product Card Component
// const ProductCard = ({ product, index, viewMode = 'list' }: any) => {
//   const { colors } = useTheme();
//   const scale = useSharedValue(1);

//   const handlePress = () => {
//     scale.value = withSequence(withSpring(0.98, { damping: 3 }), withSpring(1, { damping: 3 }));
//     router.push(`/products/${product.id}`);
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'in_stock':
//         return colors.success;
//       case 'low_stock':
//         return colors.warning;
//       case 'out_of_stock':
//         return colors.error;
//       default:
//         return colors.textSecondary;
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'in_stock':
//         return 'In Stock';
//       case 'low_stock':
//         return 'Low Stock';
//       case 'out_of_stock':
//         return 'Out of Stock';
//       default:
//         return status;
//     }
//   };

//   const discount = product.discount ? (
//     <View
//       style={{
//         position: 'absolute',
//         top: 8,
//         left: 8,
//         backgroundColor: colors.error,
//         paddingHorizontal: 6,
//         paddingVertical: 2,
//         borderRadius: 4,
//         zIndex: 1,
//       }}
//     >
//       <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
//         {product.discount}% OFF
//       </Text>
//     </View>
//   ) : null;

//   if (viewMode === 'grid') {
//     return (
//       <Animated.View
//         entering={FadeInDown.delay(index * 50).springify()}
//         style={[animatedStyle, { width: '48%', marginBottom: 12 }]}
//       >
//         <TouchableOpacity onPress={handlePress} activeOpacity={1}>
//           <Card variant="elevated" padding="sm" style={{ padding: 10 }}>
//             {discount}

//             <View
//               style={{
//                 height: 100,
//                 backgroundColor: colors.surface,
//                 borderRadius: 6,
//                 marginBottom: 6,
//                 overflow: 'hidden',
//               }}
//             >
//               {product.image ? (
//                 <Image
//                   source={{ uri: product.image }}
//                   style={{ width: '100%', height: '100%' }}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     backgroundColor: colors.border + '20',
//                   }}
//                 >
//                   <Ionicons name="image" size={24} color={colors.textTertiary} />
//                 </View>
//               )}
//             </View>

//             <View>
//               <Text
//                 style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}
//                 numberOfLines={1}
//               >
//                 {product.name}
//               </Text>
//               <Text
//                 style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}
//                 numberOfLines={1}
//               >
//                 {product.brand} • {product.unit}
//               </Text>

//               <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
//                 <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
//                   ₹{product.price}
//                 </Text>
//                 {product.mrp > product.price && (
//                   <Text
//                     style={{
//                       color: colors.textTertiary,
//                       fontSize: 10,
//                       textDecorationLine: 'line-through',
//                       marginLeft: 4,
//                     }}
//                   >
//                     ₹{product.mrp}
//                   </Text>
//                 )}
//               </View>

//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   marginTop: 2,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 6,
//                     height: 6,
//                     borderRadius: 3,
//                     backgroundColor: getStatusColor(product.status),
//                     marginRight: 4,
//                   }}
//                 />
//                 <Text style={{ color: getStatusColor(product.status), fontSize: 9 }}>
//                   {getStatusText(product.status)}
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 style={{
//                   backgroundColor: colors.primary,
//                   borderRadius: 4,
//                   paddingVertical: 4,
//                   alignItems: 'center',
//                   marginTop: 6,
//                 }}
//               >
//                 <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>Add to Cart</Text>
//               </TouchableOpacity>
//             </View>
//           </Card>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   }

//   // List view
//   return (
//     <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={animatedStyle}>
//       <TouchableOpacity onPress={handlePress} activeOpacity={1}>
//         <Card variant="elevated" padding="md" style={{ marginHorizontal: 16, marginBottom: 8 }}>
//           <View style={{ flexDirection: 'row' }}>
//             <View
//               style={{
//                 width: 70,
//                 height: 70,
//                 backgroundColor: colors.surface,
//                 borderRadius: 6,
//                 marginRight: 10,
//                 overflow: 'hidden',
//               }}
//             >
//               {product.image ? (
//                 <Image
//                   source={{ uri: product.image }}
//                   style={{ width: '100%', height: '100%' }}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <View
//                   style={{
//                     flex: 1,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     backgroundColor: colors.border + '20',
//                   }}
//                 >
//                   <Ionicons name="image" size={24} color={colors.textTertiary} />
//                 </View>
//               )}
//               {product.discount > 0 && (
//                 <View
//                   style={{
//                     position: 'absolute',
//                     top: 2,
//                     left: 2,
//                     backgroundColor: colors.error,
//                     paddingHorizontal: 4,
//                     paddingVertical: 1,
//                     borderRadius: 3,
//                   }}
//                 >
//                   <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>
//                     {product.discount}%
//                   </Text>
//                 </View>
//               )}
//             </View>

//             <View style={{ flex: 1 }}>
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'flex-start',
//                 }}
//               >
//                 <View style={{ flex: 1 }}>
//                   <Text
//                     style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}
//                     numberOfLines={1}
//                   >
//                     {product.name}
//                   </Text>
//                   <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 1 }}>
//                     {product.brand} • {product.category}
//                   </Text>
//                 </View>
//                 <View
//                   style={{
//                     paddingHorizontal: 6,
//                     paddingVertical: 2,
//                     borderRadius: 10,
//                     backgroundColor: getStatusColor(product.status) + '20',
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: getStatusColor(product.status),
//                       fontSize: 9,
//                       fontWeight: '500',
//                     }}
//                   >
//                     {getStatusText(product.status)}
//                   </Text>
//                 </View>
//               </View>

//               <View style={{ flexDirection: 'row', marginTop: 2 }}>
//                 <Text style={{ color: colors.textTertiary, fontSize: 10 }}>SKU: {product.sku}</Text>
//                 <Text style={{ color: colors.textTertiary, fontSize: 10, marginLeft: 8 }}>
//                   Unit: {product.unit}
//                 </Text>
//               </View>

//               <View style={{ flexDirection: 'row', marginTop: 4 }}>
//                 {product.tags.slice(0, 2).map((tag: string, idx: number) => (
//                   <View
//                     key={idx}
//                     style={{
//                       backgroundColor: colors.info + '10',
//                       paddingHorizontal: 4,
//                       paddingVertical: 1,
//                       borderRadius: 8,
//                       marginRight: 4,
//                     }}
//                   >
//                     <Text style={{ color: colors.info, fontSize: 8 }}>#{tag}</Text>
//                   </View>
//                 ))}
//               </View>

//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-between',
//                   alignItems: 'center',
//                   marginTop: 4,
//                 }}
//               >
//                 <View>
//                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                     <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>
//                       ₹{product.price}
//                     </Text>
//                     {product.mrp > product.price && (
//                       <Text
//                         style={{
//                           color: colors.textTertiary,
//                           fontSize: 10,
//                           textDecorationLine: 'line-through',
//                           marginLeft: 4,
//                         }}
//                       >
//                         ₹{product.mrp}
//                       </Text>
//                     )}
//                   </View>
//                   {product.scheme && (
//                     <Text style={{ color: colors.success, fontSize: 9, marginTop: 1 }}>
//                       🏷️ {product.scheme}
//                     </Text>
//                   )}
//                 </View>
//                 <View style={{ alignItems: 'flex-end' }}>
//                   <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '500' }}>
//                     {product.stock} units
//                   </Text>
//                 </View>
//               </View>

//               <View style={{ flexDirection: 'row', marginTop: 4, gap: 6 }}>
//                 <TouchableOpacity
//                   style={{
//                     flex: 1,
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     backgroundColor: colors.primary,
//                     paddingVertical: 4,
//                     borderRadius: 4,
//                   }}
//                 >
//                   <Ionicons name="cart" size={12} color="white" />
//                   <Text style={{ color: 'white', fontSize: 10, marginLeft: 2, fontWeight: '500' }}>
//                     Add
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={{
//                     width: 28,
//                     height: 28,
//                     backgroundColor: colors.surface,
//                     borderWidth: 1,
//                     borderColor: colors.border,
//                     borderRadius: 4,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                 >
//                   <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Card>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // Category Card Component
// const CategoryCard = ({ category, count, onPress }: any) => {
//   const { colors } = useTheme();
//   const iconName = CATEGORY_ICONS[category] || 'grid';

//   return (
//     <TouchableOpacity onPress={onPress} style={{ width: '30%', marginBottom: 12 }}>
//       <Card variant="elevated" padding="md" style={{ alignItems: 'center', padding: 12 }}>
//         <View
//           style={{
//             width: 40,
//             height: 40,
//             borderRadius: 20,
//             backgroundColor: colors.primary + '20',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginBottom: 6,
//           }}
//         >
//           <Ionicons name={iconName as any} size={20} color={colors.primary} />
//         </View>
//         <Text
//           style={{
//             color: colors.textPrimary,
//             fontSize: 12,
//             fontWeight: '500',
//             textAlign: 'center',
//           }}
//           numberOfLines={1}
//         >
//           {category}
//         </Text>
//         <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 2 }}>
//           {count} items
//         </Text>
//       </Card>
//     </TouchableOpacity>
//   );
// };

// // Empty State Component
// const EmptyState = ({ searchQuery }: { searchQuery: string }) => {
//   const { colors } = useTheme();

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
//       <View
//         style={{
//           width: 60,
//           height: 60,
//           borderRadius: 30,
//           backgroundColor: colors.border + '30',
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginBottom: 12,
//         }}
//       >
//         <Ionicons name="cube" size={30} color={colors.textTertiary} />
//       </View>
//       <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 6 }}>
//         No Products Found
//       </Text>
//       <Text
//         style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 12 }}
//       >
//         {searchQuery ? `No results for "${searchQuery}"` : 'No products available in this category'}
//       </Text>
//       <TouchableOpacity
//         style={{
//           backgroundColor: colors.primary,
//           paddingHorizontal: 16,
//           paddingVertical: 8,
//           borderRadius: 6,
//         }}
//       >
//         <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Add New Product</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default function ProductsScreen() {
//   const { colors } = useTheme();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('all');
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
//   const [displayMode, setDisplayMode] = useState<'products' | 'categories'>('products');

//   // Get unique categories with counts
//   const categories = useMemo(() => {
//     const catMap = new Map();
//     PRODUCTS_DATA.forEach((product) => {
//       catMap.set(product.category, (catMap.get(product.category) || 0) + 1);
//     });
//     return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
//   }, []);

//   // Filter options with counts
//   const filters = [
//     { id: 'all', label: 'All', count: PRODUCTS_DATA.length },
//     {
//       id: 'in_stock',
//       label: 'In Stock',
//       count: PRODUCTS_DATA.filter((p) => p.status === 'in_stock').length,
//     },
//     {
//       id: 'low_stock',
//       label: 'Low Stock',
//       count: PRODUCTS_DATA.filter((p) => p.status === 'low_stock').length,
//     },
//     {
//       id: 'out_of_stock',
//       label: 'Out of Stock',
//       count: PRODUCTS_DATA.filter((p) => p.status === 'out_of_stock').length,
//     },
//     {
//       id: 'discounted',
//       label: 'Discounted',
//       count: PRODUCTS_DATA.filter((p) => p.discount > 0).length,
//     },
//     { id: 'scheme', label: 'Scheme', count: PRODUCTS_DATA.filter((p) => p.scheme).length },
//   ];

//   // Filter and search products
//   const filteredProducts = useMemo(() => {
//     let filtered = PRODUCTS_DATA;

//     if (selectedCategory) {
//       filtered = filtered.filter((p) => p.category === selectedCategory);
//     }

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (p) =>
//           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
//       );
//     }

//     switch (selectedFilter) {
//       case 'in_stock':
//         filtered = filtered.filter((p) => p.status === 'in_stock');
//         break;
//       case 'low_stock':
//         filtered = filtered.filter((p) => p.status === 'low_stock');
//         break;
//       case 'out_of_stock':
//         filtered = filtered.filter((p) => p.status === 'out_of_stock');
//         break;
//       case 'discounted':
//         filtered = filtered.filter((p) => p.discount > 0);
//         break;
//       case 'scheme':
//         filtered = filtered.filter((p) => p.scheme);
//         break;
//     }

//     return filtered;
//   }, [searchQuery, selectedFilter, selectedCategory]);

//   // Group products by category
//   const groupedProducts = useMemo(() => {
//     const groups: { [key: string]: typeof PRODUCTS_DATA } = {};
//     filteredProducts.forEach((product) => {
//       if (!groups[product.category]) {
//         groups[product.category] = [];
//       }
//       groups[product.category].push(product);
//     });
//     return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
//   }, [filteredProducts]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1500);
//   }, []);

//   const handleLoadMore = () => {
//     if (!loading) {
//       setLoading(true);
//       setTimeout(() => {
//         setLoading(false);
//       }, 1000);
//     }
//   };

//   const handleCategoryPress = (category: string) => {
//     setSelectedCategory(category);
//     setDisplayMode('products');
//   };

//   const handleClearCategory = () => {
//     setSelectedCategory(null);
//     setDisplayMode('categories');
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: colors.background }}>
//       {/* Compact Search Bar */}
//       <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             backgroundColor: colors.surface,
//             borderRadius: 8,
//             paddingHorizontal: 10,
//             paddingVertical: 2,
//             borderWidth: 1,
//             borderColor: colors.border,
//             height: 38,
//           }}
//         >
//           <Ionicons name="search" size={16} color={colors.textTertiary} />
//           <TextInput
//             style={{
//               flex: 1,
//               paddingVertical: 6,
//               paddingHorizontal: 6,
//               color: colors.textPrimary,
//               fontSize: 13,
//             }}
//             placeholder="Search products..."
//             placeholderTextColor={colors.placeholder}
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchQuery('')}>
//               <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Compact Display Mode Toggle */}
//       <View
//         style={{
//           flexDirection: 'row',
//           paddingHorizontal: 16,
//           paddingBottom: 4,
//         }}
//       >
//         <TouchableOpacity
//           onPress={() => setDisplayMode('categories')}
//           style={{
//             flex: 1,
//             paddingVertical: 6,
//             alignItems: 'center',
//             borderBottomWidth: 2,
//             borderBottomColor: displayMode === 'categories' ? colors.primary : 'transparent',
//           }}
//         >
//           <Text
//             style={{
//               color: displayMode === 'categories' ? colors.primary : colors.textSecondary,
//               fontSize: 13,
//               fontWeight: displayMode === 'categories' ? '600' : '400',
//             }}
//           >
//             Categories
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setDisplayMode('products')}
//           style={{
//             flex: 1,
//             paddingVertical: 6,
//             alignItems: 'center',
//             borderBottomWidth: 2,
//             borderBottomColor: displayMode === 'products' ? colors.primary : 'transparent',
//           }}
//         >
//           <Text
//             style={{
//               color: displayMode === 'products' ? colors.primary : colors.textSecondary,
//               fontSize: 13,
//               fontWeight: displayMode === 'products' ? '600' : '400',
//             }}
//           >
//             All Products
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Category Filter Chip */}
//       {displayMode === 'products' && selectedCategory && (
//         <View
//           style={{
//             flexDirection: 'row',
//             alignItems: 'center',
//             paddingHorizontal: 16,
//             paddingBottom: 4,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               backgroundColor: colors.primary + '20',
//               paddingHorizontal: 8,
//               paddingVertical: 3,
//               borderRadius: 12,
//             }}
//           >
//             <Text style={{ color: colors.primary, fontSize: 11, marginRight: 4 }}>
//               {selectedCategory}
//             </Text>
//             <TouchableOpacity onPress={handleClearCategory}>
//               <Ionicons name="close" size={14} color={colors.primary} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Filters Row */}
//       {displayMode === 'products' && (
//         <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
//           <FlatList
//             data={filters}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <FilterChip
//                 label={item.label}
//                 count={item.count}
//                 active={selectedFilter === item.id}
//                 onPress={() => setSelectedFilter(item.id)}
//               />
//             )}
//           />
//         </View>
//       )}

//       {/* View Mode Toggle */}
//       {displayMode === 'products' && filteredProducts.length > 0 && (
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             paddingHorizontal: 16,
//             paddingBottom: 4,
//           }}
//         >
//           <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
//             {filteredProducts.length} items
//           </Text>
//           <View style={{ flexDirection: 'row', gap: 6 }}>
//             <TouchableOpacity
//               onPress={() => setViewMode('list')}
//               style={{
//                 padding: 4,
//                 backgroundColor: viewMode === 'list' ? colors.primary + '20' : 'transparent',
//                 borderRadius: 6,
//               }}
//             >
//               <Ionicons
//                 name="list"
//                 size={18}
//                 color={viewMode === 'list' ? colors.primary : colors.textTertiary}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => setViewMode('grid')}
//               style={{
//                 padding: 4,
//                 backgroundColor: viewMode === 'grid' ? colors.primary + '20' : 'transparent',
//                 borderRadius: 6,
//               }}
//             >
//               <Ionicons
//                 name="grid"
//                 size={18}
//                 color={viewMode === 'grid' ? colors.primary : colors.textTertiary}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Main Content */}
//       <View style={{ flex: 1 }}>
//         {displayMode === 'categories' ? (
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 flexWrap: 'wrap',
//                 justifyContent: 'space-between',
//                 paddingHorizontal: 16,
//                 paddingTop: 4,
//               }}
//             >
//               {categories.map((category) => (
//                 <CategoryCard
//                   key={category.name}
//                   category={category.name}
//                   count={category.count}
//                   onPress={() => handleCategoryPress(category.name)}
//                 />
//               ))}
//             </View>
//           </ScrollView>
//         ) : filteredProducts.length === 0 ? (
//           <EmptyState searchQuery={searchQuery} />
//         ) : viewMode === 'grid' ? (
//           <FlatList
//             data={filteredProducts}
//             numColumns={2}
//             columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item, index }) => (
//               <ProductCard product={item} index={index} viewMode="grid" />
//             )}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 colors={[colors.primary]}
//               />
//             }
//             onEndReached={handleLoadMore}
//             onEndReachedThreshold={0.5}
//             ListFooterComponent={
//               loading ? (
//                 <View style={{ padding: 16, alignItems: 'center' }}>
//                   <ActivityIndicator color={colors.primary} />
//                 </View>
//               ) : null
//             }
//             contentContainerStyle={{ paddingVertical: 4 }}
//           />
//         ) : (
//           <SectionList
//             sections={groupedProducts.map(([category, data]) => ({ title: category, data }))}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item, index }) => (
//               <ProductCard product={item} index={index} viewMode="list" />
//             )}
//             renderSectionHeader={({ section: { title, data } }) => (
//               <View
//                 style={{
//                   paddingHorizontal: 16,
//                   paddingVertical: 4,
//                   backgroundColor: colors.background,
//                 }}
//               >
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <View
//                     style={{
//                       width: 20,
//                       height: 20,
//                       borderRadius: 10,
//                       backgroundColor: colors.primary + '20',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       marginRight: 6,
//                     }}
//                   >
//                     <Ionicons
//                       name={(CATEGORY_ICONS[title] as any) || 'grid'}
//                       size={12}
//                       color={colors.primary}
//                     />
//                   </View>
//                   <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>
//                     {title}
//                   </Text>
//                   <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 6 }}>
//                     {data.length}
//                   </Text>
//                 </View>
//               </View>
//             )}
//             stickySectionHeadersEnabled
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 colors={[colors.primary]}
//               />
//             }
//             onEndReached={handleLoadMore}
//             onEndReachedThreshold={0.5}
//             ListFooterComponent={
//               loading ? (
//                 <View style={{ padding: 16, alignItems: 'center' }}>
//                   <ActivityIndicator color={colors.primary} />
//                 </View>
//               ) : null
//             }
//             contentContainerStyle={{ paddingBottom: 16 }}
//           />
//         )}
//       </View>

//       {/* Floating Action Button */}
//       <TouchableOpacity
//         style={{
//           position: 'absolute',
//           bottom: 20,
//           right: 20,
//           width: 52,
//           height: 52,
//           borderRadius: 26,
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
//         onPress={() => router.push('/products/add')}
//       >
//         <Ionicons name="add" size={22} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }

export { ProductsScreen as default } from '@/features/product';
