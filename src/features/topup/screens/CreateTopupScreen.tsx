// CreateTopupScreen.tsx

import React, { useRef, useCallback, useState } from 'react';
import { View, Alert } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useRouteStore } from '@/core/store/route.store';
import { useCreateTopupStyles } from '@/shared/styles/TopupCreate.styles';
import ProductsScreen, { ProductsScreenRef } from '@/features/product/screens/ProductsScreen';
import { CartItem } from '../types/createTopup.types';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useOfflineStore } from '@/core/offline/offline.store';
import { toast } from '@/shared/utils/toast';

export default function CreateTopupScreen() {
  const styles = useCreateTopupStyles();
  const van = useRouteStore.getState().van;
  // Set when editing an existing requested top-up (from the detail screen)
  const { editTopupId } = useLocalSearchParams<{ editTopupId?: string }>();

  const productsScreenRef = useRef<ProductsScreenRef>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<any | null>(null);
  const { setHeader } = useHeader();
  const offline = useOfflineStore(
    (state) => !state.isConnected || !state.isInternetReachable,
  );

  /* -------------------- Header -------------------- */
  // useFocusEffect(
  //   useCallback(() => {
  //     setHeader({
  //       showFilter: false,
  //       title: van?.name,
  //     });
  //   }, [setHeader]),
  // );

  const handleCartUpdate = useCallback((items: CartItem[], summary: any) => {
    setCartItems(items);
    setCartSummary(summary);
  }, []);

  const handleSubmitTopup = useCallback(() => {
    if (offline) {
      toast.error('Top-up requests are unavailable offline. Please reconnect and try again.');
      return;
    }
    router.push({
      pathname: '/checkin/sale',
      params: {
        mode: 'topup',
        ...(editTopupId ? { editTopupId } : {}),
      },
    });
  }, [cartItems, cartSummary, offline, van, editTopupId]);

  return (
    <View style={styles.container}>
      <View style={styles.productsContainer}>
        <ProductsScreen
          ref={productsScreenRef}
          mode="topup"
          onCartUpdate={handleCartUpdate}
          onSubmit={handleSubmitTopup}
          submitButtonText={`${editTopupId ? 'Review Changes' : 'Submit Top-up'} (${cartSummary?.totalItems || 0} items)`}
        />
      </View>
    </View>
  );
}
