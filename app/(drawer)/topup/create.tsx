// app/(app)/van-inventory-topup/create.tsx
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useRouteStore } from '@/core/store/route.store';
import { useCreateTopupStyles } from '@/shared/styles/TopupCreate.styles';
import { vanService } from '@/shared/services/van.service';
import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';

export default function CreateTopupScreen() {
  const styles = useCreateTopupStyles();
  const { colors } = useTheme();
  const van = useRouteStore.getState().van;

  const productsScreenRef = useRef<ProductsScreenRef>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartSummary, setCartSummary] = useState({
    totalUnits: 0,
    totalValue: 0,
    totalItems: 0,
    totalWeight: 0,
  });
  const [vanStockMap, setVanStockMap] = useState<Map<string, any>>(new Map());

  // Fetch current van stock
  const fetchVanStock = useCallback(async () => {
    try {
      if (!van?.vanId) return;
      const response = await vanService.fetchVanStocks(van.vanId);
      const stockData = response?.data?.products || [];

      const stockMap = new Map();
      stockData.forEach((item: any) => {
        stockMap.set(item.productId, {
          cases: item.cases || 0,
          pieces: item.pieces || 0,
          quantity: (item.cases || 0) * (item.unitQtyInCase || 1) + (item.pieces || 0),
        });
      });
      setVanStockMap(stockMap);
    } catch (error) {
      console.log('Error fetching van stock:', error);
    }
  }, [van]);

  useEffect(() => {
    fetchVanStock();
  }, [fetchVanStock]);

  const handleCartUpdate = useCallback((items: any[], summary: any) => {
    setCartItems(items);
    setCartSummary(summary);
  }, []);

  const handleSubmitTopup = useCallback(
    async (items: any[]) => {
      if (items.length === 0) {
        Alert.alert('No Items', 'Please add items to your top-up request');
        return;
      }

      router.push({
        pathname: '/topup/review',
        params: {
          warehouseId: van?.vanId,
          vanName: van?.vanName,
          items: JSON.stringify(items),
          summary: JSON.stringify(cartSummary),
        },
      });
    },
    [van, cartSummary],
  );

  const handleClearFilters = useCallback(() => {
    if (productsScreenRef.current) {
      productsScreenRef.current.clearFilters();
    }
  }, []);

  const renderHeader = () => (
    <View style={[styles.pageHeader, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <AppText style={[styles.pageTitle, { color: colors.textPrimary }]}>Create Top-up</AppText>
      <TouchableOpacity
        onPress={handleClearFilters}
        style={styles.clearButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialCommunityIcons name="filter-off-outline" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderVanInfo = () => (
    <View style={styles.vanInfoCard}>
      <View style={styles.vanInfoRow}>
        <MaterialCommunityIcons name="truck" size={20} color={colors.primary} />
        <View>
          <AppText style={[styles.vanName, { color: colors.textPrimary }]}>
            {van?.name || 'No van selected'}
          </AppText>
          <AppText style={[styles.vanId, { color: colors.textSecondary }]}>
            ID: {van?.vanId}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* {renderHeader()} */}
      {renderVanInfo()}

      <View style={styles.productsContainer}>
        <ProductsScreen
          ref={productsScreenRef}
          mode="topup"
          onCartUpdate={handleCartUpdate}
          onSubmit={handleSubmitTopup}
          submitButtonText={`Submit Top-up (${cartSummary.totalItems} items)`}
        />
      </View>
    </View>
  );
}
