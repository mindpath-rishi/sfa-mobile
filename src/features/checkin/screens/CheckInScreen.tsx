// CheckInScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';
import { useFilterContext } from '@/shared/contexts/FilterContext';

import { useCheckInScreenStyles } from '../styles/CheckInScreen.styles';
import { CheckInScreenParams, Customer, NonSaleStep, TabType } from '../types/checkin.types';
import { TabBar } from '../components/checkin/TabBar';
import { NonSaleCategoryScreen } from './NonSaleCategoryScreen';
import { useOutletStore } from '@/core/store/outlet.store';
import PaymentsScreen from 'app/(drawer)/collection';
import { useHeader } from '@/shared/contexts/HeaderContext';

export default function CheckInScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useCheckInScreenStyles();
  const params = useLocalSearchParams() as CheckInScreenParams;
  const navigation = useNavigation();
  const { productsFilterCount } = useFilterContext();

  const [activeTab, setActiveTab] = useState<TabType>('sale');
  const [nonSaleStep, setNonSaleStep] = useState<NonSaleStep>('main');
  const outlet = useOutletStore((s) => s.selectedOutlet);

  const productsScreenRef = useRef<ProductsScreenRef>(null);
  const [productsCount, setProductsCount] = useState(0);
  const { setHeader } = useHeader();

  useFocusEffect(
    useCallback(() => {
      // setHeader({
      //   title: outlet?.name,
      // });
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const headerTitle = outlet?.name;
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
            productsScreenRef.current?.openFilters();
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
    }, [navigation, activeTab, productsFilterCount]),
  );

  const handleBack = () => {
    if (nonSaleStep === 'reason') {
      setNonSaleStep('main');
    } else {
      router.back();
    }
  };

  const handleCategorySelect = (category: any) => {
    router.push({
      pathname: '/checkin/nonsale/second-step',
      params: {
        customerId: outlet?.customerId,
        customerName: outlet?.name,
        categoryId: category.id,
        categoryTitle: category.title.replace('\n', ' '),
        categoryColor: category.color,
        categoryIcon: category.icon,
      },
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'non-sale') {
      setNonSaleStep('main');
    }
  };

  const renderNonSaleContent = () => {
    switch (nonSaleStep) {
      case 'main':
        return <NonSaleCategoryScreen onCategorySelect={handleCategorySelect} />;
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
        // return (
        //   <View style={styles.placeholderContainer}>
        //     <Ionicons name="folder-outline" size={64} color={colors.textTertiary} />
        //     <Text style={styles.placeholderTitle}>Collection</Text>
        //     <Text style={styles.placeholderText}>Your saved collections and favorites</Text>
        //   </View>
        // );
        return (
          <PaymentsScreen
            // onPaymentSelect={(payment) => {
            //   // Handle payment selection if needed
            //   console.log('Selected payment:', payment);
            // }}
            customerId={outlet?.customerId}
            outstanding={outlet?.outstanding}
            hideSearch={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}
