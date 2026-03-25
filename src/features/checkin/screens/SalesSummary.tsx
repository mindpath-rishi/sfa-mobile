// components/SalesSummary/index.tsx
import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { MOCK_PRODUCTS } from '../constants';
import { useCartTotals } from '../hooks/useCartTotals';
import { TotalsCard } from '../components/sale/TotalCard';
import { ProductsSection } from '../components/sale/ProductsSection';
import { BottomCTA } from '../components/sale/BottomCTA';
import { HeaderCard } from '../components/sale/HeaderCard';
import { CartItem } from '../types/sales-summary.types';

export default function SalesSummary() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  const [products] = useState(MOCK_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const totals = useCartTotals(cartItems, products);
  const hasItems = totals.units > 0;

  const handleCartUpdate = useCallback((items: CartItem[]) => {
    setCartItems((prev) => {
      const newItems = [...prev];

      for (const newItem of items) {
        const existingIndex = newItems.findIndex(
          (ci) => ci.productId === newItem.productId && ci.type === newItem.type,
        );

        if (existingIndex >= 0) {
          const newQuantity = newItems[existingIndex].quantity + newItem.quantity;
          if (newQuantity > 0) {
            newItems[existingIndex].quantity = newQuantity;
          } else {
            newItems.splice(existingIndex, 1);
          }
        } else if (newItem.quantity > 0) {
          newItems.push(newItem);
        }
      }

      return newItems;
    });
  }, []);

  const handleReset = useCallback(() => {
    Alert.alert('Reset Order', 'Clear all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setCartItems([]) },
    ]);
  }, []);

  const handleProceedToPayment = useCallback(() => {
    if (!hasItems) {
      Alert.alert('No items', 'Please add at least one item to continue.');
      return;
    }

    const orderItems = cartItems.map((item) => ({
      id: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      price: item.product.price,
      quantity: {
        cases: item.type === 'cases' ? item.quantity : 0,
        pieces: item.type === 'units' ? item.quantity : 0,
      },
    }));

    router.push({
      pathname: '/checkin/payment',
      params: {
        total: totals.total.toFixed(2),
        subtotal: totals.subtotal.toFixed(2),
        tax: totals.tax.toFixed(2),
        currency: 'ZMW',
        customerName: (params.customerName as string) || 'John Shop',
        customerId: (params.customerId as string) || '16295',
        reference: `ORD-${Date.now()}`,
        items: JSON.stringify(orderItems),
      },
    });
  }, [hasItems, totals, params, cartItems]);

  const getCustomerName = () => (params.customerName as string) || 'John Shop';
  const getCustomerId = () => (params.customerId as string) || '16295';
  const getReference = () => (params.reference as string) || `ORD-${Date.now()}`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 96, gap: 10 }}
        keyboardShouldPersistTaps="handled"
      >
        <HeaderCard
          customerName={getCustomerName()}
          customerId={getCustomerId()}
          reference={getReference()}
          totals={totals}
          onReset={handleReset}
          isProcessing={isProcessing}
        />

        <TotalsCard
          subtotal={totals.subtotal}
          tax={totals.tax}
          total={totals.total}
          hasItems={hasItems}
        />

        <ProductsSection
          products={products}
          cartItemsCount={cartItems.length}
          hasItems={hasItems}
          onCartUpdate={handleCartUpdate}
        />
      </ScrollView>

      <BottomCTA
        hasItems={hasItems}
        isProcessing={isProcessing}
        total={totals.total}
        units={totals.units}
        onPress={handleProceedToPayment}
      />
    </KeyboardAvoidingView>
  );
}
