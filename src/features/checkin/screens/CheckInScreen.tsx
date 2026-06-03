// import React, { useState, useRef, useCallback } from 'react';
// import { View } from 'react-native';
// import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';
// import { useFilterContext } from '@/shared/contexts/FilterContext';

// import { useCheckInScreenStyles } from '../styles/CheckInScreen.styles';
// import { CheckInScreenParams, NonSaleStep, TabType } from '../types/checkin.types';
// import { TabBar } from '../components/checkin/TabBar';
// import { NonSaleCategoryScreen } from './NonSaleCategoryScreen';
// import { useOutletStore } from '@/core/store/outlet.store';
// import PaymentsScreen from 'app/(drawer)/collection';
// import { useHeader } from '@/shared/contexts/HeaderContext';

// export default function CheckInScreen() {
//   const insets = useSafeAreaInsets();
//   const styles = useCheckInScreenStyles();
//   const navigation = useNavigation();
//   const { productsFilterCount } = useFilterContext();

//   const [activeTab, setActiveTab] = useState<TabType>('sale');
//   const [nonSaleStep, setNonSaleStep] = useState<NonSaleStep>('main');
//   const outlet = useOutletStore((s) => s.selectedOutlet);

//   const productsScreenRef = useRef<ProductsScreenRef>(null);

//   useFocusEffect(
//     useCallback(() => {
//       const headerTitle = outlet?.name;
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
//             productsScreenRef.current?.openFilters();
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
//     }, [navigation, activeTab, productsFilterCount]),
//   );

//   const handleCategorySelect = (category: any) => {
//     router.push({
//       pathname: '/checkin/nonsale/second-step',
//       params: {
//         customerId: outlet?.customerId,
//         customerName: outlet?.name,
//         categoryId: category.id,
//         categoryTitle: category.title.replace('\n', ' '),
//         categoryColor: category.color,
//         categoryIcon: category.icon,
//       },
//     });
//   };

//   const handleTabChange = (tab: TabType) => {
//     setActiveTab(tab);
//     if (tab === 'non-sale') {
//       setNonSaleStep('main');
//     }
//   };

//   const renderNonSaleContent = () => {
//     switch (nonSaleStep) {
//       case 'main':
//         return <NonSaleCategoryScreen onCategorySelect={handleCategorySelect} />;
//       default:
//         return null;
//     }
//   };

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'sale':
//         return <ProductsScreen ref={productsScreenRef} />;
//       case 'non-sale':
//         return renderNonSaleContent();
//       case 'collection':
//         // return (
//         //   <View style={styles.placeholderContainer}>
//         //     <Ionicons name="folder-outline" size={64} color={colors.textTertiary} />
//         //     <Text style={styles.placeholderTitle}>Collection</Text>
//         //     <Text style={styles.placeholderText}>Your saved collections and favorites</Text>
//         //   </View>
//         // );
//         return (
//           <PaymentsScreen
//             // onPaymentSelect={(payment) => {
//             //   // Handle payment selection if needed
//             //   console.log('Selected payment:', payment);
//             // }}
//             customerId={outlet?.customerId}
//             outstanding={outlet?.outstanding}
//             hideSearch={true}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
//       <View style={styles.content}>{renderTabContent()}</View>
//     </View>
//   );
// }

import React, { useState, useRef, useCallback } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';
import { useFilterContext } from '@/shared/contexts/FilterContext';

import { useCheckInScreenStyles } from '../styles/CheckInScreen.styles';
import { TabBar } from '../components/checkin/TabBar';
import { useOutletStore } from '@/core/store/outlet.store';
import { useHeader } from '@/shared/contexts/HeaderContext';

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();
  const styles = useCheckInScreenStyles();
  const navigation = useNavigation();
  const { productsFilterCount } = useFilterContext();

  // Only sale tab
  const [activeTab, setActiveTab] = useState('sale');
  const outlet = useOutletStore((s) => s.selectedOutlet);

  const productsScreenRef = useRef<ProductsScreenRef>(null);

  useFocusEffect(
    useCallback(() => {
      const headerTitle = outlet?.name;
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
          productsScreenRef.current?.openFilters();
        },
      });
    }, [navigation, productsFilterCount, outlet?.name]),
  );

  return (
    <View style={[styles.container]}>
      <ProductsScreen ref={productsScreenRef} />
    </View>
  );
}
