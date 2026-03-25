// // CheckInScreen.tsx
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';
// import { useCheckInScreenStyles } from '../styles/CheckInScreen.styles';
// import { useFilterContext } from '@/shared/contexts/FilterContext';

// type TabType = 'sale' | 'non-sale' | 'collection';
// type NonSaleStep = 'main' | 'reason' | 'further-reason';

// // Customer interface
// interface Customer {
//   id: string;
//   name: string;
//   address?: string;
//   phone?: string;
//   route?: string;
// }

// // Mock customer data - used as fallback only
// const MOCK_CUSTOMER = {
//   id: '16295',
//   name: 'Zombela',
// };

// // Reason categories for non-sale
// const REASON_CATEGORIES = [
//   {
//     id: 'product',
//     title: 'PRODUCT RELATED ISSUE',
//     icon: 'cube-outline',
//     color: '#FF6B6B',
//   },
//   {
//     id: 'distributor',
//     title: 'DISTRIBUTOR RELATED ISSUE',
//     icon: 'business-outline',
//     color: '#4ECDC4',
//   },
//   {
//     id: 'company',
//     title: 'COMPANY RELATED ISSUE',
//     icon: 'flag-outline',
//     color: '#45B7D1',
//   },
//   {
//     id: 'competitor',
//     title: 'COMPETITOR RELATED ISSUE',
//     icon: 'trophy-outline',
//     color: '#96CEB4',
//   },
//   {
//     id: 'shop',
//     title: 'SHOP RELATED ISSUE',
//     icon: 'storefront-outline',
//     color: '#FFEAA7',
//   },
//   {
//     id: 'more',
//     title: 'MORE FACTORS',
//     icon: 'options-outline',
//     color: '#D4A5A5',
//   },
// ];

// // Further reasons based on category
// const FURTHER_REASONS: Record<string, Array<{ id: string; label: string }>> = {
//   product: [
//     { id: 'out_of_stock', label: 'Product Out of Stock' },
//     { id: 'expired', label: 'Product Expired' },
//     { id: 'damaged', label: 'Product Damaged' },
//     { id: 'price_issue', label: 'Price Issue' },
//     { id: 'quality_issue', label: 'Quality Issue' },
//     { id: 'new_product', label: 'New Product - Not Accepted' },
//   ],
//   distributor: [
//     { id: 'delivery_issue', label: 'Delivery Issue' },
//     { id: 'service_issue', label: 'Service Issue' },
//     { id: 'communication', label: 'Communication Gap' },
//     { id: 'credit_issue', label: 'Credit Issue' },
//     { id: 'relationship', label: 'Relationship Issue' },
//   ],
//   company: [
//     { id: 'policy_issue', label: 'Company Policy Issue' },
//     { id: 'scheme_issue', label: 'Scheme/Offer Issue' },
//     { id: 'support_issue', label: 'Support Issue' },
//     { id: 'brand_image', label: 'Brand Image Issue' },
//   ],
//   competitor: [
//     { id: 'better_price', label: 'Better Price from Competitor' },
//     { id: 'better_scheme', label: 'Better Scheme/Offer' },
//     { id: 'exclusive_deal', label: 'Exclusive Deal' },
//     { id: 'competitor_relationship', label: 'Competitor Relationship' },
//   ],
//   shop: [
//     { id: 'key_person_not_available', label: 'Key Person Not Available' },
//     { id: 'last_stock_present', label: 'Last Stock Present' },
//     { id: 'shop_closed', label: 'Shop Closed' },
//     { id: 'direct_order', label: 'Direct Order Placed to Distributor' },
//     { id: 'payment_credit_issue', label: 'Payment/Credit Issue' },
//     { id: 'new_shop', label: 'New Shop/ First Visit' },
//   ],
//   more: [
//     { id: 'weather', label: 'Weather Conditions' },
//     { id: 'holiday', label: 'Holiday/Festival' },
//     { id: 'bandh', label: 'Bandh/Strike' },
//     { id: 'other', label: 'Other Factors' },
//   ],
// };

// export default function CheckInScreen() {
//   const { colors } = useTheme();
//   const insets = useSafeAreaInsets();
//   const styles = useCheckInScreenStyles();
//   const params = useLocalSearchParams();
//   const navigation = useNavigation();
//   const { productsFilterCount } = useFilterContext();

//   const [activeTab, setActiveTab] = useState<TabType>('sale');
//   const [nonSaleStep, setNonSaleStep] = useState<NonSaleStep>('main');
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const [selectedReason, setSelectedReason] = useState<string | null>(null);
//   const [selectedFurtherReason, setSelectedFurtherReason] = useState<string | null>(null);
//   const [customer, setCustomer] = useState<Customer>(MOCK_CUSTOMER);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const productsScreenRef = useRef<ProductsScreenRef>(null);
//   const [productsCount, setProductsCount] = useState(0);

//   // Get customer name from params directly (most reliable)
//   const customerNameFromParams = useMemo(() => {
//     return (params.name as string) || (params.customerName as string) || MOCK_CUSTOMER.name;
//   }, [params.name, params.customerName]);

//   const customerIdFromParams = useMemo(() => {
//     return (params.id as string) || (params.customerId as string) || MOCK_CUSTOMER.id;
//   }, [params.id, params.customerId]);

//   // Parse query params when component mounts - ONLY for additional fields
//   useEffect(() => {
//     console.log('All params:', params);

//     // Extract additional customer data from params
//     const customerAddress = params.address as string;
//     const customerPhone = params.phone as string;
//     const customerRoute = params.route as string;

//     // Set customer data from params, always using the name from params
//     setCustomer({
//       id: customerIdFromParams,
//       name: customerNameFromParams,
//       address: customerAddress,
//       phone: customerPhone,
//       route: customerRoute,
//     });

//     // Get active tab from params
//     const tab = params.tab as TabType;
//     if (tab && ['sale', 'non-sale', 'collection'].includes(tab)) {
//       setActiveTab(tab);
//     }
//   }, [customerIdFromParams, customerNameFromParams]);

//   // Update header based on active tab - ALWAYS use customer name from state
//   useFocusEffect(
//     useCallback(() => {
//       // Always use the customer name from state (which comes from params)
//       const headerTitle = customer.name || customerNameFromParams || 'Check In';

//       if (activeTab === 'sale') {
//         navigation.setOptions({
//           title: headerTitle,
//           showBack: true,
//           showMenu: false,
//           elevated: true,
//           size: 'md',
//           showFilter: true,
//           filterActive: productsFilterCount > 0,
//           filterCount: productsFilterCount,
//           onFilterPress: () => {
//             // Open filter modal in ProductsScreen
//             if (productsScreenRef.current?.openFilters) {
//               productsScreenRef.current.openFilters();
//             }
//           },
//         });
//       } else {
//         navigation.setOptions({
//           title: headerTitle,
//           showBack: true,
//           showMenu: false,
//           elevated: true,
//           size: 'md',
//           showFilter: false,
//         });
//       }
//     }, [navigation, activeTab, customer.name, customerNameFromParams, productsFilterCount]),
//   );

//   const handleBack = () => {
//     if (nonSaleStep === 'further-reason') {
//       setNonSaleStep('reason');
//       setSelectedFurtherReason(null);
//     } else if (nonSaleStep === 'reason') {
//       setNonSaleStep('main');
//       setSelectedCategory(null);
//       setSelectedReason(null);
//     } else {
//       router.back();
//     }
//   };

//   const handleCategorySelect = (categoryId: string) => {
//     setSelectedCategory(categoryId);
//     setNonSaleStep('reason');
//   };

//   const handleReasonSelect = (reasonId: string) => {
//     setSelectedReason(reasonId);
//     setNonSaleStep('further-reason');
//   };

//   const handleFurtherReasonSelect = (reasonId: string) => {
//     setSelectedFurtherReason(reasonId);
//   };

//   const handleSubmitNonSale = async () => {
//     if (!selectedFurtherReason) {
//       Alert.alert('Selection Required', 'Please select a reason before submitting');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const payload = {
//         customer: {
//           id: customer.id,
//           name: customer.name,
//           address: customer.address,
//           phone: customer.phone,
//           route: customer.route,
//         },
//         category: selectedCategory,
//         reason: selectedReason,
//         furtherReason: selectedFurtherReason,
//         timestamp: new Date().toISOString(),
//       };

//       console.log('Non-sale submitted:', payload);

//       Alert.alert('Success', 'Non-sale reason submitted successfully', [
//         {
//           text: 'OK',
//           onPress: () => {
//             setNonSaleStep('main');
//             setSelectedCategory(null);
//             setSelectedReason(null);
//             setSelectedFurtherReason(null);
//           },
//         },
//       ]);
//     } catch (error) {
//       console.error('Error submitting non-sale reason:', error);
//       Alert.alert('Error', 'Failed to submit reason. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const renderNonSaleContent = () => {
//     switch (nonSaleStep) {
//       case 'main':
//         return (
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.nonSaleContent}
//           >
//             <View style={styles.customerInfo}>
//               <Text style={styles.customerId}>
//                 {customer.id} - {customer.name}
//               </Text>
//               {customer.address && <Text style={styles.customerAddress}>{customer.address}</Text>}
//               {customer.phone && <Text style={styles.customerPhone}>{customer.phone}</Text>}
//               {customer.route && <Text style={styles.customerRoute}>Route: {customer.route}</Text>}
//             </View>

//             <View style={styles.reasonsGrid}>
//               {REASON_CATEGORIES.map((category) => (
//                 <TouchableOpacity
//                   key={category.id}
//                   style={[styles.reasonCard, { borderColor: colors.border + '30' }]}
//                   onPress={() => handleCategorySelect(category.id)}
//                   activeOpacity={0.7}
//                 >
//                   <View
//                     style={[styles.reasonIconContainer, { backgroundColor: category.color + '20' }]}
//                   >
//                     <Ionicons name={category.icon as any} size={32} color={category.color} />
//                   </View>
//                   <Text style={styles.reasonTitle}>{category.title}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>
//         );

//       case 'reason':
//         const reasons = FURTHER_REASONS[selectedCategory || 'shop'] || [];
//         const selectedCategoryData = REASON_CATEGORIES.find((c) => c.id === selectedCategory);

//         return (
//           <View style={{ flex: 1 }}>
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.nonSaleContent}
//             >
//               <View style={styles.customerInfo}>
//                 <Text style={styles.customerId}>
//                   {customer.id} - {customer.name}
//                 </Text>
//               </View>

//               {selectedCategoryData && (
//                 <View style={styles.categoryHeader}>
//                   <View
//                     style={[
//                       styles.categoryIconContainer,
//                       { backgroundColor: selectedCategoryData.color + '20' },
//                     ]}
//                   >
//                     <Ionicons
//                       name={selectedCategoryData.icon as any}
//                       size={28}
//                       color={selectedCategoryData.color}
//                     />
//                   </View>
//                   <Text style={[styles.categoryTitle, { color: selectedCategoryData.color }]}>
//                     {selectedCategoryData.title}
//                   </Text>
//                 </View>
//               )}

//               <View style={styles.reasonsList}>
//                 {reasons.map((reason) => (
//                   <TouchableOpacity
//                     key={reason.id}
//                     style={[
//                       styles.reasonListItem,
//                       selectedReason === reason.id && styles.reasonListItemSelected,
//                       {
//                         borderColor:
//                           selectedReason === reason.id ? colors.primary : colors.border + '30',
//                       },
//                     ]}
//                     onPress={() => handleReasonSelect(reason.id)}
//                     activeOpacity={0.7}
//                   >
//                     <Text
//                       style={[
//                         styles.reasonListItemText,
//                         selectedReason === reason.id && styles.reasonListItemTextSelected,
//                       ]}
//                     >
//                       {reason.label}
//                     </Text>
//                     {selectedReason === reason.id && (
//                       <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
//                     )}
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               <View style={{ height: 80 }} />
//             </ScrollView>

//             <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom || 16 }]}>
//               <TouchableOpacity
//                 style={[styles.backBottomButton, { borderColor: colors.border }]}
//                 onPress={handleBack}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
//                 <Text style={styles.backBottomButtonText}>Back to Categories</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );

//       case 'further-reason':
//         const selectedCategoryInfo = REASON_CATEGORIES.find((c) => c.id === selectedCategory);
//         const selectedReasonLabel =
//           selectedReason &&
//           FURTHER_REASONS[selectedCategory || 'shop']?.find((r) => r.id === selectedReason)?.label;

//         return (
//           <View style={{ flex: 1 }}>
//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.nonSaleContent}
//             >
//               <View style={styles.customerInfo}>
//                 <Text style={styles.customerId}>
//                   {customer.id} - {customer.name}
//                 </Text>
//               </View>

//               <View style={styles.summaryCard}>
//                 <Text style={styles.summaryLabel}>Selected Reason:</Text>
//                 <View style={styles.summaryValueContainer}>
//                   <Text style={styles.summaryValue}>{selectedCategoryInfo?.title}</Text>
//                   <Text style={styles.summarySubValue}>{selectedReasonLabel}</Text>
//                 </View>
//               </View>

//               {selectedReason && FURTHER_REASONS[selectedCategory || 'shop'] && (
//                 <>
//                   <Text style={styles.furtherReasonTitle}>Select Specific Reason:</Text>
//                   <View style={styles.reasonsList}>
//                     {FURTHER_REASONS[selectedCategory || 'shop']
//                       .filter((r) => r.id === selectedReason)
//                       .map((reason) => (
//                         <TouchableOpacity
//                           key={reason.id}
//                           style={[
//                             styles.reasonListItem,
//                             selectedFurtherReason === reason.id && styles.reasonListItemSelected,
//                             {
//                               borderColor:
//                                 selectedFurtherReason === reason.id
//                                   ? colors.primary
//                                   : colors.border + '30',
//                             },
//                           ]}
//                           onPress={() => handleFurtherReasonSelect(reason.id)}
//                           activeOpacity={0.7}
//                         >
//                           <Text
//                             style={[
//                               styles.reasonListItemText,
//                               selectedFurtherReason === reason.id &&
//                                 styles.reasonListItemTextSelected,
//                             ]}
//                           >
//                             {reason.label}
//                           </Text>
//                           {selectedFurtherReason === reason.id && (
//                             <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
//                           )}
//                         </TouchableOpacity>
//                       ))}
//                   </View>
//                 </>
//               )}

//               <TouchableOpacity
//                 style={[
//                   styles.submitButton,
//                   { backgroundColor: colors.primary },
//                   (!selectedFurtherReason || isSubmitting) && styles.submitButtonDisabled,
//                 ]}
//                 onPress={handleSubmitNonSale}
//                 activeOpacity={0.9}
//                 disabled={!selectedFurtherReason || isSubmitting}
//               >
//                 <Text style={styles.submitButtonText}>
//                   {isSubmitting ? 'Submitting...' : 'Submit No Sale Reason'}
//                 </Text>
//               </TouchableOpacity>

//               <View style={{ height: 80 }} />
//             </ScrollView>

//             <View style={[styles.bottomButtonContainer, { paddingBottom: insets.bottom || 16 }]}>
//               <TouchableOpacity
//                 style={[styles.backBottomButton, { borderColor: colors.border }]}
//                 onPress={handleBack}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
//                 <Text style={styles.backBottomButtonText}>Back to Reasons</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         );

//       default:
//         return null;
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'sale':
//         return <ProductsScreen ref={productsScreenRef} onProductsCountChange={setProductsCount} />;
//       case 'non-sale':
//         return renderNonSaleContent();
//       case 'collection':
//         return (
//           <View style={styles.placeholderContainer}>
//             <Ionicons name="folder-outline" size={64} color={colors.textTertiary} />
//             <Text style={styles.placeholderTitle}>Collection</Text>
//             <Text style={styles.placeholderText}>Your saved collections and favorites</Text>
//           </View>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       {/* Tab Bar */}
//       <View style={styles.tabBar}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'sale' && styles.activeTab]}
//           onPress={() => setActiveTab('sale')}
//         >
//           <Text style={[styles.tabText, activeTab === 'sale' && styles.activeTabText]}>Sale</Text>
//           {activeTab === 'sale' && (
//             <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'non-sale' && styles.activeTab]}
//           onPress={() => {
//             setActiveTab('non-sale');
//             setNonSaleStep('main');
//             setSelectedCategory(null);
//             setSelectedReason(null);
//             setSelectedFurtherReason(null);
//           }}
//         >
//           <Text style={[styles.tabText, activeTab === 'non-sale' && styles.activeTabText]}>
//             Non Sale
//           </Text>
//           {activeTab === 'non-sale' && (
//             <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'collection' && styles.activeTab]}
//           onPress={() => setActiveTab('collection')}
//         >
//           <Text style={[styles.tabText, activeTab === 'collection' && styles.activeTabText]}>
//             Collection
//           </Text>
//           {activeTab === 'collection' && (
//             <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Tab Content */}
//       <View style={styles.content}>{renderTabContent()}</View>
//     </View>
//   );
// }

// CheckInScreen.tsx (updated with new structure)
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';
import { useFilterContext } from '@/shared/contexts/FilterContext';

import { useCheckInScreenStyles } from '../styles/CheckInScreen.styles';
import { CheckInScreenParams, Customer, NonSaleStep, TabType } from '../types/checkin.types';
import { FirstStep } from '../components/non-sale/FirstSetp';
import { TabBar } from '../components/checkin/TabBar';

const MOCK_CUSTOMER: Customer = {
  id: '16295',
  name: 'Zombela',
};

export default function CheckInScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useCheckInScreenStyles();
  const params = useLocalSearchParams() as CheckInScreenParams;
  const navigation = useNavigation();
  const { productsFilterCount } = useFilterContext();

  const [activeTab, setActiveTab] = useState<TabType>('sale');
  const [nonSaleStep, setNonSaleStep] = useState<NonSaleStep>('main');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedFurtherReason, setSelectedFurtherReason] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>(MOCK_CUSTOMER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productsScreenRef = useRef<ProductsScreenRef>(null);
  const [productsCount, setProductsCount] = useState(0);

  const customerNameFromParams = useMemo(() => {
    return params.name || params.customerName || MOCK_CUSTOMER.name;
  }, [params.name, params.customerName]);

  const customerIdFromParams = useMemo(() => {
    return params.id || params.customerId || MOCK_CUSTOMER.id;
  }, [params.id, params.customerId]);

  useEffect(() => {
    setCustomer({
      id: customerIdFromParams,
      name: customerNameFromParams,
      address: params.address,
      phone: params.phone,
      route: params.route,
    });

    if (params.tab && ['sale', 'non-sale', 'collection'].includes(params.tab)) {
      setActiveTab(params.tab);
    }
  }, [customerIdFromParams, customerNameFromParams]);

  useFocusEffect(
    useCallback(() => {
      const headerTitle = customer.name || customerNameFromParams || 'Check In';

      if (activeTab === 'sale') {
        navigation.setOptions({
          title: headerTitle,
          showBack: true,
          showMenu: false,
          elevated: true,
          size: 'md',
          showFilter: true,
          filterActive: productsFilterCount > 0,
          filterCount: productsFilterCount,
          onFilterPress: () => {
            if (productsScreenRef.current?.openFilters) {
              productsScreenRef.current.openFilters();
            }
          },
        });
      } else {
        navigation.setOptions({
          title: headerTitle,
          showBack: true,
          showMenu: false,
          elevated: true,
          size: 'md',
          showFilter: false,
        });
      }
    }, [navigation, activeTab, customer.name, customerNameFromParams, productsFilterCount]),
  );

  const handleBack = () => {
    if (nonSaleStep === 'further-reason') {
      setNonSaleStep('reason');
      setSelectedFurtherReason(null);
    } else if (nonSaleStep === 'reason') {
      setNonSaleStep('main');
      setSelectedCategory(null);
      setSelectedReason(null);
    } else {
      router.back();
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setNonSaleStep('reason');
  };

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    setNonSaleStep('further-reason');
  };

  const handleFurtherReasonSelect = (reasonId: string) => {
    setSelectedFurtherReason(reasonId);
  };

  const handleSubmitNonSale = async () => {
    if (!selectedFurtherReason) {
      Alert.alert('Selection Required', 'Please select a reason before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          id: customer.id,
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          route: customer.route,
        },
        category: selectedCategory,
        reason: selectedReason,
        furtherReason: selectedFurtherReason,
        timestamp: new Date().toISOString(),
      };

      console.log('Non-sale submitted:', payload);

      Alert.alert('Success', 'Non-sale reason submitted successfully', [
        {
          text: 'OK',
          onPress: () => {
            setNonSaleStep('main');
            setSelectedCategory(null);
            setSelectedReason(null);
            setSelectedFurtherReason(null);
          },
        },
      ]);
    } catch (error) {
      console.error('Error submitting non-sale reason:', error);
      Alert.alert('Error', 'Failed to submit reason. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNonSaleContent = () => {
    switch (nonSaleStep) {
      case 'main':
        return <FirstStep customer={customer} />;

      // case 'reason':
      //   return (
      //     <NonSaleReasonStep
      //       customer={customer}
      //       selectedCategory={selectedCategory}
      //       selectedReason={selectedReason}
      //       onReasonSelect={handleReasonSelect}
      //       onBack={handleBack}
      //     />
      //   );

      // case 'further-reason':
      //   return (
      //     <NonSaleFurtherReasonStep
      //       customer={customer}
      //       selectedCategory={selectedCategory}
      //       selectedReason={selectedReason}
      //       selectedFurtherReason={selectedFurtherReason}
      //       isSubmitting={isSubmitting}
      //       onFurtherReasonSelect={handleFurtherReasonSelect}
      //       onSubmit={handleSubmitNonSale}
      //       onBack={handleBack}
      //     />
      //   );

      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sale':
        return <ProductsScreen ref={productsScreenRef} onProductsCountChange={setProductsCount} />;
      case 'non-sale':
        return renderNonSaleContent();
      case 'collection':
        return (
          <View style={styles.placeholderContainer}>
            <Ionicons name="folder-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.placeholderTitle}>Collection</Text>
            <Text style={styles.placeholderText}>Your saved collections and favorites</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'non-sale') {
      setNonSaleStep('main');
      setSelectedCategory(null);
      setSelectedReason(null);
      setSelectedFurtherReason(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}
