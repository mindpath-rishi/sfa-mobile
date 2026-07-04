import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { TotalsCard } from '../components/sale/TotalCard';
import { ProductsSection } from '../components/sale/ProductsSection';
import { BottomCTA } from '../components/sale/BottomCTA';
import { HeaderCard } from '../components/sale/HeaderCard';
import { useCartStore } from '@/core/store/cart.store';
import { useOutletStore } from '@/core/store/outlet.store';
import { useRouteStore } from '@/core/store/route.store';
import { ConfirmationModal } from '@/core/components';
import { vanService } from '@/shared/services/van.service';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';
import { useHeader } from '@/shared/contexts/HeaderContext';

type ScreenMode = 'sales' | 'topup';

const numberOrZero = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export default function OrderSummary() {
  const { colors } = useTheme();
  const { mode } = useLocalSearchParams<{ mode: ScreenMode }>();
  const currentMode = mode || 'sales';
  const user = useAuthStore((state) => state.user);
  const activeWorkSessionId = useAuthStore((state) => state.workSessionId);
  const { setHeader } = useHeader();

  // Zustand stores
  const { items, summary, clearCart } = useCartStore();
  const outlet = useOutletStore((s) => s.selectedOutlet);
  const van = useRouteStore.getState().van;
  const selectedRoute = useRouteStore.getState().selectedRoute;

  // Local state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasItems = summary.totalSkus > 0;

  const selectedOutlet = useOutletStore((s) => s.selectedOutlet);

  useFocusEffect(
    React.useCallback(() => {
      setHeader({
        title: selectedOutlet?.name,
        showBack: true,
        showMenu: false,
      });
    }, []),
  );

  // Calculate total weight for top-up mode
  const totalWeight = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc +
        numberOrZero(item.caseQty) * numberOrZero(item.caseNetWeight) +
        numberOrZero(item.pieceQty) * numberOrZero(item.pieceNetWeight)
      );
    }, 0);
  }, [items]);

  // Mode-specific configurations
  const config = useMemo(
    () => ({
      sales: {
        title: 'Sales Summary',
        submitButtonText: 'Proceed to Payment',
        successMessage: 'Order placed successfully!',
        emptyMessage: 'Please add at least one item to continue.',
        showTax: true,
        showCustomer: true,
        showReset: true,
        navigateTo: '/checkin/payment',
        icon: 'arrow-forward-circle' as const,
      },
      topup: {
        title: 'Top-up Summary',
        submitButtonText: 'Submit Top-up Request',
        successMessage: 'Top-up request submitted successfully!',
        emptyMessage: 'Please add at least one item to continue.',
        showTax: false,
        showCustomer: false,
        showReset: true,
        navigateTo: '/topup/success',
        icon: 'send' as const,
      },
    }),
    [],
  );

  const currentConfig = config[currentMode];

  /* ================= RESET ================= */
  const handleReset = useCallback(() => {
    const alertTitle = currentMode === 'sales' ? 'Reset Order' : 'Reset Top-up';
    const alertMessage =
      currentMode === 'sales'
        ? 'Clear all items from cart?'
        : 'Clear all items from top-up request?';

    Alert.alert(alertTitle, alertMessage, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: clearCart },
    ]);
  }, [clearCart, currentMode]);

  /* ================= BUILD TOP-UP PAYLOAD ================= */
  const buildTopupPayload = useCallback(() => {
    const totalRequestedCases = items.reduce((acc, item) => {
      return acc + numberOrZero(item.caseQty);
    }, 0);

    const totalRequestedPieces = items.reduce((acc, item) => {
      return acc + numberOrZero(item.pieceQty);
    }, 0);

    const totalRequestedQty = items.reduce((acc, item) => {
      return (
        acc +
        numberOrZero(item.caseQty) * Math.max(numberOrZero(item.unitQtyInCase), 1) +
        numberOrZero(item.pieceQty)
      );
    }, 0);

    const totalRequestedWeight = items.reduce((acc, item) => {
      return (
        acc +
        numberOrZero(item.caseQty) * numberOrZero(item.caseNetWeight) +
        numberOrZero(item.pieceQty) * numberOrZero(item.pieceNetWeight)
      );
    }, 0);

    const totalRequestedValue = items.reduce((acc, item) => {
      return (
        acc +
        numberOrZero(item.caseQty) * numberOrZero(item.casePrice) +
        numberOrZero(item.pieceQty) * numberOrZero(item.piecePrice)
      );
    }, 0);

    const topupItems = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,

      requestedCaseQty: numberOrZero(item.caseQty),
      requestedPieceQty: numberOrZero(item.pieceQty),

      requestedQty:
        numberOrZero(item.caseQty) * Math.max(numberOrZero(item.unitQtyInCase), 1) +
        numberOrZero(item.pieceQty),

      unitQtyInCase: Math.max(numberOrZero(item.unitQtyInCase), 1),

      piecePrice: numberOrZero(item.piecePrice),
      casePrice: numberOrZero(item.casePrice),

      pieceNetWeight: numberOrZero(item.pieceNetWeight),
      caseNetWeight: numberOrZero(item.caseNetWeight),
      compCode: item.compCode,

      requestedWeight:
        numberOrZero(item.caseQty) * numberOrZero(item.caseNetWeight) +
        numberOrZero(item.pieceQty) * numberOrZero(item.pieceNetWeight),

      requestedValue:
        numberOrZero(item.caseQty) * numberOrZero(item.casePrice) +
        numberOrZero(item.pieceQty) * numberOrZero(item.piecePrice),
    }));

    return {
      vanId: van?.vanId,
      vanName: van?.name,
      employeeId: user?.userId,
      warehouseId: 'WH-001',
      date: new Date().toISOString(),

      totalRequestedCases,
      totalRequestedPieces,
      totalRequestedQty,
      totalRequestedWeight,
      totalRequestedValue,

      remark: `Top-up request for ${van?.name || 'van'} - ${new Date().toLocaleDateString()}`,
      status: 'DRAFT',

      items: topupItems,
      workSessionId: activeWorkSessionId || selectedRoute?.workSessionId,
    };
  }, [items, van, user, activeWorkSessionId, selectedRoute]);

  /* ================= HANDLE TOP-UP SUBMIT ================= */
  const handleTopupSubmit = useCallback(async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      const payload = buildTopupPayload();
      const missingHeader = [
        ['van', payload.vanId],
        ['van name', payload.vanName],
        ['employee', payload.employeeId],
        ['work session', payload.workSessionId],
      ].find(([, value]) => !String(value ?? '').trim());
      if (missingHeader) {
        toast.error(
          'Unable to create top-up',
          `Missing ${missingHeader[0]}. Please return to Home, start your day, and try again.`,
        );
        return;
      }
      const response = await vanService.createInventoryTopupRequest(payload);
      if (!response?.success) {
        toast.error('Top-up request failed', response?.message || 'Please check the request data.');
        return;
      }
      clearCart();
      toast.success('Your top-up request was submitted successfully.');
      router.replace('topup');
    } catch (error) {
      console.error('Error submitting top-up:', error);
      Alert.alert('Error', 'Failed to submit top-up request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [buildTopupPayload, clearCart]);

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = useCallback(() => {
    if (!hasItems) {
      Alert.alert('No items', currentConfig.emptyMessage);
      return;
    }

    if (currentMode === 'sales') {
      const orderItems = items.map((item) => ({
        id: item.productId,
        name: item.productName,
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
        pathname: currentConfig.navigateTo,
        params: {
          items: JSON.stringify(orderItems),
          total: summary.totalValue,
          outletId: outlet?.outletId,
          outletName: outlet?.name,
        },
      });
    } else {
      setShowConfirmation(true);
    }
  }, [hasItems, currentMode, currentConfig, items, summary, outlet]);

  // Header props based on mode
  const getHeaderProps = () => {
    if (currentMode === 'sales') {
      return {
        outletName: outlet?.name,
        customerId: outlet?.customerId,
        reference: `SALE-${Date.now()}`,
      };
    } else {
      return {
        outletName: van?.vanName || 'Van',
        customerId: van?.vanId || 'N/A',
        reference: `TOP-${Date.now()}`,
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        date: new Date().toLocaleDateString(),
      };
    }
  };

  // Totals props based on mode
  const getTotalsProps = () => {
    if (currentMode === 'sales') {
      return {
        total: summary.totalValue,
        hasItems,
        mode: currentMode,
      };
    } else {
      return {
        total: summary.totalValue,
        hasItems,
        mode: currentMode,
        showWeight: true,
        totalWeight,
      };
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 80, gap: 6 }}
        keyboardShouldPersistTaps="handled"
      >
        <HeaderCard
          {...getHeaderProps()}
          title={currentConfig.title}
          totals={{
            totalCases: summary.totalCases,
            totalPieces: summary.totalPieces,
            totalSkus: summary.totalSkus,
            totalItems: summary.totalItems,
          }}
          onReset={currentConfig.showReset ? handleReset : undefined}
          mode={currentMode}
        />

        <TotalsCard {...getTotalsProps()} />

        <ProductsSection products={items} hasItems={hasItems} mode={currentMode} />
      </ScrollView>

      <BottomCTA
        hasItems={hasItems}
        isProcessing={isSubmitting}
        total={summary.totalValue}
        units={summary.totalItems}
        onPress={handleSubmit}
        buttonText={currentConfig.submitButtonText}
        mode={currentMode}
      />

      {/* Confirmation Modal for Top-up */}
      <ConfirmationModal
        visible={showConfirmation}
        title="Confirm Top-up Request"
        message={
          `Submit top-up request with ${summary.totalSkus} skus(s)?\n\n` +
          `Total Value: K ${summary.totalValue.toLocaleString()}\n` +
          `Total Cases: ${summary.totalCases}\n` +
          `Total Pieces: ${summary.totalPieces}`
        }
        confirmText="Submit Request"
        cancelText="Cancel"
        onConfirm={handleTopupSubmit}
        onCancel={() => setShowConfirmation(false)}
        loading={isSubmitting}
      />
    </KeyboardAvoidingView>
  );
}
