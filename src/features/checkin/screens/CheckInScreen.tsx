// CheckInScreen.tsx
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
import { TabBar } from '../components/checkin/TabBar';
import { NonSaleCategoryScreen } from './NonSaleCategoryScreen';
import { useAuthStore } from '@/core/store/auth.store';
import { useOutletStore } from '@/core/store/outlet.store';

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
  const outlet = useOutletStore((s) => s.selectedOutlet);
  const [customer, setCustomer] = useState<Customer>(MOCK_CUSTOMER);

  const productsScreenRef = useRef<ProductsScreenRef>(null);
  const [productsCount, setProductsCount] = useState(0);

  // Memoized customer data from params
  const customerName = useMemo(() => {
    return params.name || params.customerName || MOCK_CUSTOMER.name;
  }, [params.name, params.customerName]);

  const customerId = useMemo(() => {
    return params.id || params.customerId || MOCK_CUSTOMER.id;
  }, [params.id, params.customerId]);

  // Initialize customer from params
  useEffect(() => {
    setCustomer({
      id: customerId,
      name: customerName,
      address: params.address,
      phone: params.phone,
      route: params.route,
    });

    // Set initial tab if provided
    if (params.tab && ['sale', 'non-sale', 'collection'].includes(params.tab)) {
      setActiveTab(params.tab);
    }
  }, [customerId, customerName, params.address, params.phone, params.route, params.tab]);

  // Update header title based on active tab
  useFocusEffect(
    useCallback(() => {
      const headerTitle = outlet?.name || customerName || 'Check In';

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
    }, [navigation, activeTab, customer.name, customerName, productsFilterCount]),
  );

  const handleBack = () => {
    if (nonSaleStep === 'reason') {
      setNonSaleStep('main');
    } else {
      router.back();
    }
  };

  const handleCategorySelect = (category: any) => {
    // Navigate to reason screen with params
    router.push({
      pathname: '/checkin/nonsale/second-step',
      params: {
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerRoute: customer.route,
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
        return (
          <NonSaleCategoryScreen customer={customer} onCategorySelect={handleCategorySelect} />
        );
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}
