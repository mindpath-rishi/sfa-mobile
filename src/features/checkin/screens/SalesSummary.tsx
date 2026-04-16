// import React, { useCallback } from 'react';
// import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { MOCK_PRODUCTS } from '../constants';
// import { TotalsCard } from '../components/sale/TotalCard';
// import { ProductsSection } from '../components/sale/ProductsSection';
// import { BottomCTA } from '../components/sale/BottomCTA';
// import { HeaderCard } from '../components/sale/HeaderCard';
// import { useCartStore } from '@/core/store/cart.store';
// import { useOutletStore } from '@/core/store/outlet.store';

// export default function SalesSummary() {
//   const { colors } = useTheme();

//   // ✅ Zustand cart
//   const { items, summary, clearCart } = useCartStore();
//   const outlet = useOutletStore((s) => s.selectedOutlet);

//   const hasItems = summary.totalSkus > 0;

//   /* ================= RESET ================= */

//   const handleReset = useCallback(() => {
//     Alert.alert('Reset Order', 'Clear all items from cart?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Reset', style: 'destructive', onPress: clearCart },
//     ]);
//   }, [clearCart]);

//   /* ================= CHECKOUT ================= */

//   const handleProceedToPayment = useCallback(() => {
//     if (!hasItems) {
//       Alert.alert('No items', 'Please add at least one item to continue.');
//       return;
//     }

//     const orderItems = items.map((item) => ({
//       id: item.productId,
//       name: item.productName,

//       // ✅ NEW STRUCTURE
//       quantity: {
//         cases: item.caseQty || 0,
//         pieces: item.pieceQty || 0,
//       },

//       pricing: {
//         casePrice: item.casePrice,
//         piecePrice: item.piecePrice,
//       },

//       unitQtyInCase: item.unitQtyInCase,
//     }));

//     router.push({
//       pathname: '/checkin/payment',
//     });
//   }, [items, summary, hasItems]);

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: colors.background }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//     >
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ padding: 12, paddingBottom: 96, gap: 10 }}
//         keyboardShouldPersistTaps="handled"
//       >
//         <HeaderCard
//           outletName={outlet?.name}
//           customerId={outlet?.customerId}
//           reference={'test'}
//           totals={{
//             totalCases: summary.totalCases,
//             totalPieces: summary.totalPieces,
//             totalSkus: summary.totalSkus,
//             totalItems: summary.totalItems,
//           }}
//           onReset={handleReset}
//         />

//         <TotalsCard
//           subtotal={summary.totalValue}
//           tax={0}
//           total={summary.totalValue}
//           hasItems={hasItems}
//         />

//         <ProductsSection products={items} hasItems={hasItems} />
//       </ScrollView>

//       <BottomCTA
//         hasItems={hasItems}
//         isProcessing={false}
//         total={summary.totalValue}
//         units={summary.totalSkus}
//         onPress={handleProceedToPayment}
//       />
//     </KeyboardAvoidingView>
//   );
// }

// import React, { useCallback, useMemo } from 'react';
// import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { TotalsCard } from '../components/sale/TotalCard';
// import { ProductsSection } from '../components/sale/ProductsSection';
// import { BottomCTA } from '../components/sale/BottomCTA';
// import { HeaderCard } from '../components/sale/HeaderCard';
// import { useCartStore } from '@/core/store/cart.store';
// import { useOutletStore } from '@/core/store/outlet.store';
// import { useRouteStore } from '@/core/store/route.store';

// type ScreenMode = 'sales' | 'topup';

// export default function OrderSummary() {
//   const { colors } = useTheme();
//   const { mode } = useLocalSearchParams<{ mode: ScreenMode }>();
//   const currentMode = mode || 'sales';

//   // Zustand stores
//   const { items, summary, clearCart } = useCartStore();
//   const outlet = useOutletStore((s) => s.selectedOutlet);
//   const van = useRouteStore.getState().van;

//   const hasItems = summary.totalSkus > 0;

//   // Calculate total weight for top-up mode
//   const totalWeight = useMemo(() => {
//     return items.reduce((acc, item) => {
//       return (
//         acc +
//         (item.caseQty || 0) * (item.caseNetWeight || 0) +
//         (item.pieceQty || 0) * (item.pieceNetWeight || 0)
//       );
//     }, 0);
//   }, [items]);

//   // Mode-specific configurations
//   const config = useMemo(
//     () => ({
//       sales: {
//         title: 'Sales Summary',
//         submitButtonText: 'Proceed to Payment',
//         successMessage: 'Order placed successfully!',
//         emptyMessage: 'Please add at least one item to continue.',
//         showTax: true,
//         showCustomer: true,
//         showReset: true,
//         navigateTo: '/checkin/payment',
//         icon: 'arrow-forward-circle' as const,
//       },
//       topup: {
//         title: 'Top-up Summary',
//         submitButtonText: 'Submit Top-up Request',
//         successMessage: 'Top-up request submitted successfully!',
//         emptyMessage: 'Please add at least one item to continue.',
//         showTax: false,
//         showCustomer: false,
//         showReset: true,
//         navigateTo: '/topup/success',
//         icon: 'send' as const,
//       },
//     }),
//     [],
//   );

//   const currentConfig = config[currentMode];

//   /* ================= RESET ================= */
//   const handleReset = useCallback(() => {
//     const alertTitle = currentMode === 'sales' ? 'Reset Order' : 'Reset Top-up';
//     const alertMessage =
//       currentMode === 'sales'
//         ? 'Clear all items from cart?'
//         : 'Clear all items from top-up request?';

//     Alert.alert(alertTitle, alertMessage, [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Reset', style: 'destructive', onPress: clearCart },
//     ]);
//   }, [clearCart, currentMode]);

//   /* ================= SUBMIT ================= */
//   const handleSubmit = useCallback(() => {
//     if (!hasItems) {
//       Alert.alert('No items', currentConfig.emptyMessage);
//       return;
//     }

//     const orderItems = items.map((item) => ({
//       id: item.productId,
//       name: item.productName,
//       quantity: {
//         cases: item.caseQty || 0,
//         pieces: item.pieceQty || 0,
//       },
//       pricing: {
//         casePrice: item.casePrice,
//         piecePrice: item.piecePrice,
//       },
//       unitQtyInCase: item.unitQtyInCase,
//       weight: {
//         total:
//           (item.caseQty || 0) * (item.caseNetWeight || 0) +
//           (item.pieceQty || 0) * (item.pieceNetWeight || 0),
//       },
//     }));

//     if (currentMode === 'sales') {
//       // Sales mode - navigate to payment
//       router.push({
//         pathname: currentConfig.navigateTo,
//         params: {
//           items: JSON.stringify(orderItems),
//           total: summary.totalValue,
//           outletId: outlet?.outletId,
//           outletName: outlet?.name,
//         },
//       });
//     } else {
//       // Top-up mode - confirm and submit
//       Alert.alert(
//         'Confirm Top-up',
//         `Submit top-up request with ${summary.totalSkus} item(s)?\n\n` +
//           `Total Value: K${summary.totalValue.toLocaleString()}\n` +
//           `Total Weight: ${totalWeight.toFixed(2)} kg\n` +
//           `Total Cases: ${summary.totalCases}\n` +
//           `Total Pieces: ${summary.totalPieces}`,
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Submit',
//             onPress: async () => {
//               try {
//                 const topupData = {
//                   vanId: van?.vanId,
//                   vanName: van?.vanName,
//                   employeeId: van?.employeeId,
//                   warehouseId: 'WH-001', // This should come from selected warehouse
//                   date: new Date().toISOString(),
//                   items: orderItems.map((item) => ({
//                     productId: item.id,
//                     productName: item.name,
//                     requestedCaseQty: item.quantity.cases,
//                     requestedPieceQty: item.quantity.pieces,
//                     requestedQty: item.quantity.cases * item.unitQtyInCase + item.quantity.pieces,
//                     piecePrice: item.pricing.piecePrice,
//                     casePrice: item.pricing.casePrice,
//                     pieceNetWeight:
//                       item.weight.total /
//                         (item.quantity.cases * item.unitQtyInCase + item.quantity.pieces) || 0,
//                     caseNetWeight: item.weight.total / item.quantity.cases || 0,
//                     unitQtyInCase: item.unitQtyInCase,
//                     requestedWeight: item.weight.total,
//                     requestedValue:
//                       item.quantity.cases * item.pricing.casePrice +
//                       item.quantity.pieces * item.pricing.piecePrice,
//                   })),
//                   summary: {
//                     totalItems: summary.totalSkus,
//                     totalUnits: summary.totalItems,
//                     totalValue: summary.totalValue,
//                     totalWeight: totalWeight,
//                     totalCases: summary.totalCases,
//                     totalPieces: summary.totalPieces,
//                   },
//                 };

//                 // Call API to create top-up
//                 // await vanInventoryTopupService.create(topupData);
//                 console.log('Submitting top-up:', topupData);

//                 // Simulate API call
//                 await new Promise((resolve) => setTimeout(resolve, 1000));

//                 Alert.alert('Success', currentConfig.successMessage, [
//                   {
//                     text: 'OK',
//                     onPress: () => {
//                       clearCart();
//                       router.push(currentConfig.navigateTo);
//                     },
//                   },
//                 ]);
//               } catch (error) {
//                 console.error('Error submitting top-up:', error);
//                 Alert.alert('Error', 'Failed to submit top-up request. Please try again.');
//               }
//             },
//           },
//         ],
//       );
//     }
//   }, [items, summary, hasItems, currentMode, currentConfig, van, clearCart, totalWeight, outlet]);

//   // Header props based on mode
//   const getHeaderProps = () => {
//     if (currentMode === 'sales') {
//       return {
//         outletName: outlet?.name,
//         customerId: outlet?.customerId,
//         reference: `SALE-${Date.now()}`,
//       };
//     } else {
//       return {
//         outletName: van?.vanName || 'Van',
//         customerId: van?.vanId || 'N/A',
//         reference: `TOP-${Date.now()}`,
//         warehouseId: 'WH-001', // This should come from selected warehouse
//         warehouseName: 'Main Warehouse',
//         date: new Date().toLocaleDateString(),
//       };
//     }
//   };

//   // Totals props based on mode
//   const getTotalsProps = () => {
//     const baseProps = {
//       subtotal: summary.totalValue,
//       total: summary.totalValue,
//       hasItems,
//     };

//     if (currentMode === 'sales') {
//       const tax = summary.totalValue * 0.16; // 16% tax
//       return {
//         ...baseProps,
//         tax,
//         total: summary.totalValue + tax,
//       };
//     } else {
//       return {
//         ...baseProps,
//         tax: undefined,
//         showWeight: true,
//         totalWeight,
//       };
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: colors.background }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//     >
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ padding: 12, paddingBottom: 96, gap: 10 }}
//         keyboardShouldPersistTaps="handled"
//       >
//         <HeaderCard
//           {...getHeaderProps()}
//           title={currentConfig.title}
//           totals={{
//             totalCases: summary.totalCases,
//             totalPieces: summary.totalPieces,
//             totalSkus: summary.totalSkus,
//             totalItems: summary.totalItems,
//           }}
//           onReset={currentConfig.showReset ? handleReset : undefined}
//           mode={currentMode}
//         />

//         <TotalsCard {...getTotalsProps()} mode={currentMode} />

//         <ProductsSection products={items} hasItems={hasItems} mode={currentMode} />
//       </ScrollView>

//       <BottomCTA
//         hasItems={hasItems}
//         isProcessing={false}
//         total={currentMode === 'sales' ? summary.totalValue * 1.16 : summary.totalValue}
//         units={summary.totalSkus}
//         onPress={handleSubmit}
//         buttonText={currentConfig.submitButtonText}
//         mode={currentMode}
//         weight={currentMode === 'topup' ? totalWeight : undefined}
//         // icon={currentConfig.icon}
//       />
//     </KeyboardAvoidingView>
//   );
// }

import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

type ScreenMode = 'sales' | 'topup';

export default function OrderSummary() {
  const { colors } = useTheme();
  const { mode } = useLocalSearchParams<{ mode: ScreenMode }>();
  const currentMode = mode || 'sales';
  const user = useAuthStore.getState().user;

  // Zustand stores
  const { items, summary, clearCart } = useCartStore();
  const outlet = useOutletStore((s) => s.selectedOutlet);
  const van = useRouteStore.getState().van;
  const selectedRoute = useRouteStore.getState().selectedRoute;

  // Local state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasItems = summary.totalSkus > 0;

  // Calculate total weight for top-up mode
  const totalWeight = useMemo(() => {
    return items.reduce((acc, item) => {
      return (
        acc +
        (item.caseQty || 0) * (item.caseNetWeight || 0) +
        (item.pieceQty || 0) * (item.pieceNetWeight || 0)
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
      return acc + (item.caseQty || 0);
    }, 0);

    const totalRequestedPieces = items.reduce((acc, item) => {
      return acc + (item.pieceQty || 0);
    }, 0);

    const totalRequestedQty = items.reduce((acc, item) => {
      return acc + (item.caseQty || 0) * item.unitQtyInCase + (item.pieceQty || 0);
    }, 0);

    const totalRequestedWeight = items.reduce((acc, item) => {
      return (
        acc +
        (item.caseQty || 0) * (item.caseNetWeight || 0) +
        (item.pieceQty || 0) * (item.pieceNetWeight || 0)
      );
    }, 0);

    const totalRequestedValue = items.reduce((acc, item) => {
      return acc + (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice;
    }, 0);

    const topupItems = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,

      // ✅ CASES & PIECES
      requestedCaseQty: item.caseQty || 0,
      requestedPieceQty: item.pieceQty || 0,

      // ✅ DERIVED QTY
      requestedQty: (item.caseQty || 0) * item.unitQtyInCase + (item.pieceQty || 0),

      unitQtyInCase: item.unitQtyInCase,

      // ✅ PRICING
      piecePrice: item.piecePrice,
      casePrice: item.casePrice,

      // ✅ WEIGHT
      pieceNetWeight: item.pieceNetWeight || 0,
      caseNetWeight: item.caseNetWeight || 0,

      requestedWeight:
        (item.caseQty || 0) * (item.caseNetWeight || 0) +
        (item.pieceQty || 0) * (item.pieceNetWeight || 0),

      // ✅ VALUE
      requestedValue: (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice,
    }));

    return {
      vanId: van?.vanId,
      vanName: van?.name,
      employeeId: user?.userId,
      warehouseId: 'WH-001',
      date: new Date().toISOString(),

      // ✅ NEW TOTALS
      totalRequestedCases,
      totalRequestedPieces,

      totalRequestedQty,
      totalRequestedWeight,
      totalRequestedValue,

      remark: `Top-up request for ${van?.vanName} - ${new Date().toLocaleDateString()}`,
      status: 'DRAFT',

      items: topupItems,
      workSessionId: selectedRoute?.workSessionId,
    };
  }, [items, van, user, selectedRoute]);

  /* ================= HANDLE TOP-UP SUBMIT ================= */
  const handleTopupSubmit = useCallback(async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      const payload = buildTopupPayload();
      const response = await vanService.createInventoryTopupRequest(payload);
      if (!response?.success) {
        return;
      }
      toast.success('Your topup request approved successfully.');
      router.replace('topup');
    } catch (error) {
      console.error('Error submitting top-up:', error);
      Alert.alert('Error', 'Failed to submit top-up request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [buildTopupPayload, currentConfig, clearCart]);

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = useCallback(() => {
    if (!hasItems) {
      Alert.alert('No items', currentConfig.emptyMessage);
      return;
    }

    if (currentMode === 'sales') {
      // Sales mode - navigate to payment
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
      // Top-up mode - show confirmation modal
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
    const baseProps = {
      subtotal: summary.totalValue,
      total: summary.totalValue,
      hasItems,
    };

    if (currentMode === 'sales') {
      const tax = summary.totalValue * 0;
      return {
        ...baseProps,
        tax,
        total: summary.totalValue + tax,
      };
    } else {
      return {
        ...baseProps,
        tax: undefined,
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
        contentContainerStyle={{ padding: 12, paddingBottom: 96, gap: 10 }}
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

        <TotalsCard {...getTotalsProps()} mode={currentMode} />

        <ProductsSection products={items} hasItems={hasItems} mode={currentMode} />
      </ScrollView>

      <BottomCTA
        hasItems={hasItems}
        isProcessing={isSubmitting}
        total={currentMode === 'sales' ? summary.totalValue : summary.totalValue}
        units={summary.totalItems}
        onPress={handleSubmit}
        buttonText={currentConfig.submitButtonText}
        mode={currentMode}
        weight={currentMode === 'topup' ? totalWeight : undefined}
      />

      {/* Confirmation Modal for Top-up */}
      <ConfirmationModal
        visible={showConfirmation}
        title="Confirm Top-up Request"
        message={
          `Submit top-up request with ${summary.totalSkus} skus(s)?\n\n` +
          `Total Value: K ${summary.totalValue.toLocaleString()}\n` +
          `Total Weight: ${totalWeight.toFixed(2)} kg\n` +
          `Total Cases: ${summary.totalCases}\n` +
          `Total Pieces: ${summary.totalPieces}\n` +
          `Total Items: ${summary.totalItems}\n`
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
