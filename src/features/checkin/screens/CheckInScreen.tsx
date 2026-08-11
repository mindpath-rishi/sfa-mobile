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
        size: 'small',
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
