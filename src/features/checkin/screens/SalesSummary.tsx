import React, { useCallback } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { MOCK_PRODUCTS } from '../constants';
import { TotalsCard } from '../components/sale/TotalCard';
import { ProductsSection } from '../components/sale/ProductsSection';
import { BottomCTA } from '../components/sale/BottomCTA';
import { HeaderCard } from '../components/sale/HeaderCard';
import { useCartStore } from '@/core/store/cart.store';
import { useOutletStore } from '@/core/store/outlet.store';

export default function SalesSummary() {
  const { colors } = useTheme();

  // ✅ Zustand cart
  const { items, summary, clearCart } = useCartStore();
  const outlet = useOutletStore((s) => s.selectedOutlet);

  const hasItems = summary.totalSkus > 0;

  /* ================= RESET ================= */

  const handleReset = useCallback(() => {
    Alert.alert('Reset Order', 'Clear all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: clearCart },
    ]);
  }, [clearCart]);

  /* ================= CHECKOUT ================= */

  const handleProceedToPayment = useCallback(() => {
    if (!hasItems) {
      Alert.alert('No items', 'Please add at least one item to continue.');
      return;
    }

    const orderItems = items.map((item) => ({
      id: item.productId,
      name: item.productName,

      // ✅ NEW STRUCTURE
      quantity: {
        cases: item.caseQty || 0,
        pieces: item.pieceQty || 0,
      },

      pricing: {
        casePrice: item.casePrice,
        piecePrice: item.piecePrice,
      },

      unitQtyInCase: item.unitQtyInCase,
    }));

    router.push({
      pathname: '/checkin/payment',
    });
  }, [items, summary, hasItems]);

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
          outletName={outlet?.name}
          customerId={outlet?.customerId}
          reference={'test'}
          totals={{
            totalCases: summary.totalCases,
            totalPieces: summary.totalPieces,
            totalSkus: summary.totalSkus,
            totalItems: summary.totalItems,
          }}
          onReset={handleReset}
        />

        <TotalsCard
          subtotal={summary.totalValue}
          tax={0}
          total={summary.totalValue}
          hasItems={hasItems}
        />

        <ProductsSection products={items} hasItems={hasItems} />
      </ScrollView>

      <BottomCTA
        hasItems={hasItems}
        isProcessing={false}
        total={summary.totalValue}
        units={summary.totalSkus}
        onPress={handleProceedToPayment}
      />
    </KeyboardAvoidingView>
  );
}
