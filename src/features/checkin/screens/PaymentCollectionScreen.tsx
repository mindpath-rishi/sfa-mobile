import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaymentCollectionStyles } from '../styles/PaymentCollection.styles';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useOutletStore } from '@/core/store/outlet.store';
import { useCartStore } from '@/core/store/cart.store';
import { getRouteCustomerCategoryId, useRouteStore } from '@/core/store/route.store';
import { saleService } from '@/shared/services/sale.service';
import { outletService } from '@/features/outlet/services/outlet.service';
import { captureCurrentLocation } from '@/shared/services/location.service';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';
import { ConfirmationModal } from '@/core/components';
import { useInvoiceStore } from '@/core/store/invoice.store';
import { useLoaderActions } from '@/core/loader/loader.store';
import { toBusinessId } from '@/shared/utils/business-id.utils';
import { allAppliedSchemes, appliedSchemesOf } from '@/shared/services/scheme.service';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { createUuid } from '@/utils/uuid';
import { SchemeBenefitsPanel } from '../components/sale/SchemeBenefitsPanel';
import {
  SplitPaymentModal,
  type CreditInfo,
  type PaymentMode,
  type SplitPayment,
  type SplitPaymentItem,
} from '../components/payment/SplitPaymentModal';

const formatCustomerAddress = (address: unknown): string => {
  if (typeof address === 'string') return address.trim();
  if (!address || typeof address !== 'object') return '';

  const fields = address as Record<string, unknown>;
  return [fields.line1, fields.line2]
    .filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    .map((part) => part.trim())
    .join(', ');
};

export default function PaymentCollectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = usePaymentCollectionStyles();
  const loader = useLoaderActions();
  const outlet = useOutletStore((s) => s.selectedOutlet);
  const customerAddress = formatCustomerAddress(outlet?.address);
  const {
    items,
    getCartSummary,
    clearCart,
    refreshSchemeDiscounts,
    schemeDiscounts,
    groupSchemeBenefits,
  } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      getCartSummary: state.getCartSummary,
      clearCart: state.clearCart,
      refreshSchemeDiscounts: state.refreshSchemeDiscounts,
      schemeDiscounts: state.schemeDiscounts,
      groupSchemeBenefits: state.groupSchemeBenefits,
    })),
  );
  const van = useRouteStore.getState().van;
  const selectedRoute = useRouteStore((s) => s.selectedRoute);
  const user = useAuthStore((s) => s.user);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientSaleIdRef = useRef<{ signature: string; id: string } | null>(null);
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const activeVisit = useOutletStore.getState().activeVisit;

  // Re-resolve category/sub-category/product/province/route/van wise schemes in case
  // cart contents changed since the sales summary screen last refreshed them.
  useEffect(() => {
    refreshSchemeDiscounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const {
    subtotal: orderSubtotal,
    total: orderTotal,
    discount: orderDiscount,
    totalNetWeight,
    caseDetails,
    pieceDetails,
  } = getCartSummary();
  const appliedSchemeNames = Array.from(
    new Set([
      ...allAppliedSchemes(schemeDiscounts).map((benefit) => benefit.schemeName),
      ...groupSchemeBenefits.map((benefit) => benefit.schemeName),
    ]),
  );

  const currency = 'K';

  const creditInfo: CreditInfo = {
    creditLimit: outlet?.creditLimit || 0,
    outstandingBalance: outlet?.outstanding ?? 0,
    availableCredit: (outlet?.creditLimit ?? 0) - (outlet?.outstanding ?? 0),
    paymentTerms: outlet?.creditDays ? `${outlet.creditDays} days` : undefined,
  };

  const [selectedMode, setSelectedMode] = useState<PaymentMode>('cash');
  const [amount, setAmount] = useState(orderTotal.toString());

  useEffect(() => {
    setAmount(orderTotal.toString());
  }, [orderTotal]);
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreditInfo, setShowCreditInfo] = useState(true);
  const [splitPayment, setSplitPayment] = useState<SplitPayment | null>(null);

  const amountDue = orderTotal;
  const parsedAmount = parseFloat(amount) || 0;

  const isCreditSelected = selectedMode === 'credit';
  const isSplitSelected = selectedMode === 'split';

  // For split payment
  const isSplitPayment = splitPayment !== null;
  const willExceedCredit = isCreditSelected && orderTotal > creditInfo.availableCredit;
  console.log(willExceedCredit, 'willl========================');

  // Validate based on payment mode
  const isValidAmount = isCreditSelected ? true : parsedAmount > 0 && parsedAmount <= amountDue;

  const canProceed =
    selectedMode &&
    (!isCreditSelected ? isValidAmount : true) &&
    (!isCreditSelected || !willExceedCredit);

  const handleCollectPayment = async () => {
    // For credit sales
    if (isCreditSelected) {
      if (willExceedCredit) {
        Alert.alert(
          'Credit Limit Exceeded',
          `Order amount (${currency}${orderTotal.toFixed(2)}) exceeds available credit (${currency}${creditInfo.availableCredit.toFixed(2)}).\n\nPlease reduce order amount or use split payment.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use Split Payment', onPress: () => setShowSplitPaymentModal(true) },
          ],
        );
        return;
      }
      processPayment();

    }

    // For regular payments
    if (!isValidAmount) {
      Alert.alert(
        'Invalid Amount',
        `Please enter a valid amount between 0 and ${amountDue.toFixed(2)}`,
      );
      return;
    }

    if (parsedAmount < amountDue) {
      Alert.alert(
        'Partial Payment',
        `You're paying ${currency}${(amountDue - parsedAmount).toFixed(2)} less than the total amount due. Do you want to proceed with partial payment?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => processPayment() },
        ],
      );
      return;
    }

    processPayment();
  };

  const handleSplitPaymentConfirm = (creditAmount: number, otherPayments: SplitPaymentItem[]) => {
    // Filter out payments with zero amount
    const validPayments = otherPayments.filter((p) => p.amount > 0);

    if (validPayments.length === 0 && creditAmount === 0) {
      Alert.alert('Invalid', 'Please specify at least one payment method');
      return;
    }

    setSplitPayment({
      creditAmount,
      otherPayments: validPayments,
    });
    setSelectedMode('split');
    setShowSplitPaymentModal(false);

    // Build confirmation message
    let paymentDetailsText = '';
    if (creditAmount > 0) {
      paymentDetailsText += `Credit Amount: ${currency}${creditAmount.toFixed(2)}\n`;
    }
    validPayments.forEach((payment) => {
      paymentDetailsText += `${payment.mode.toUpperCase()}: ${currency}${payment.amount.toFixed(2)}\n`;
    });
    paymentDetailsText += `\nTotal: ${currency}${orderTotal.toFixed(2)}`;

    Alert.alert('Split Payment Configured', paymentDetailsText);
  };

  const processPayment = () => {
    if (!user) {
      toast.error('Error', 'User not loaded');
      return;
    }

    if (!van) {
      toast.error('Error', 'Van not assigned');
      return;
    }

    setShowConfirm(true);
  };

  const confirmPayment = async () => {
    if (isSubmitting) return;
    setShowConfirm(false);

    setIsSubmitting(true);

    try {
      loader.show({ message: 'Preparing sale...' });

      const toFixed4 = (val: number) => Number((val || 0).toFixed(4));
      const totalValue = toFixed4(orderTotal);

      let paidAmount = 0;
      let pendingAmount = totalValue;
      let saleType = 'CASH';
      let paymentMode = selectedMode.toUpperCase();
      let creditAmountUsed = 0;
      let otherPaymentsList: SplitPaymentItem[] = [];

      if (isSplitPayment) {
        creditAmountUsed = toFixed4(splitPayment.creditAmount);
        otherPaymentsList = splitPayment.otherPayments.map((p) => ({
          ...p,
          amount: toFixed4(p.amount),
        }));
        paidAmount = otherPaymentsList.reduce((sum, p) => sum + p.amount, 0);

        pendingAmount = creditAmountUsed > 0 ? toFixed4(creditAmountUsed) : 0;
        saleType = creditAmountUsed > 0 ? 'CREDIT' : 'CASH';
        paymentMode = 'SPLIT_MULTIPLE';
      } else if (isCreditSelected) {
        paidAmount = 0;
        pendingAmount = totalValue;
        saleType = 'CREDIT';
        paymentMode = 'CREDIT';
      } else {
        paidAmount = toFixed4(parsedAmount);
        pendingAmount = toFixed4(totalValue - paidAmount);
        saleType = pendingAmount > 0 ? 'CREDIT' : 'CASH';
        paymentMode = selectedMode.toUpperCase();
      }

      loader.show({ message: 'Preparing sale items...' });

      const saleItems = items.map((item) => {
        const caseQty = item.caseQty || 0;
        const pieceQty = item.pieceQty || 0;
        const unitQtyInCase = item.unitQtyInCase || 1;
        const customerCategoryId = getRouteCustomerCategoryId(selectedRoute);
        const categoryId = toBusinessId(item.categoryId, ['categoryId', 'productCategoryId']);
        const parentCategoryId = toBusinessId(item.parentCategoryId, [
          'parentCategoryId',
          'categoryId',
          'productCategoryId',
        ]);
        const quantity = caseQty * unitQtyInCase + pieceQty;
        const grossValue = caseQty * (item.casePrice || 0) + pieceQty * (item.piecePrice || 0);
        const benefit = schemeDiscounts[item.productId];
        const discountAmount = toFixed4(Math.min(benefit?.discountAmount ?? 0, grossValue));

        return {
          productId: item.productId,
          productName: item.productName,
          compCode: item.compCode,
          categoryId,
          parentCategoryId,
          customerCategoryId,
          isFocusedPack: item.isFocusedPack === 'Y' ? 'Y' : 'N',
          caseQty,
          pieceQty,
          quantity,
          netCases: toFixed4(quantity / unitQtyInCase),
          unitQtyInCase,
          casePrice: item.casePrice,
          caseNetWeight: item.caseNetWeight,
          pieceNetWeight: item.pieceNetWeight,
          piecePrice: item.piecePrice,
          totalNetWeight:
            caseQty * (item.caseNetWeight || 0) + pieceQty * (item.pieceNetWeight || 0),
          grossValue: toFixed4(grossValue),
          totalValue: toFixed4(grossValue - discountAmount),
          schemeId: benefit?.schemeId,
          schemeName: benefit?.schemeName,
          schemeType: benefit?.schemeType,
          schemeMinimumQuantity: benefit?.minimumQuantity,
          schemeMinimumQuantityUnit: benefit?.minimumQuantityUnit,
          schemeDiscountPercent: benefit?.discountPercent,
          schemeDiscountValue: benefit?.discountValue,
          schemeBuyQty: benefit?.buyQty,
          schemeBuyUnit: benefit?.buyUnit,
          schemeDiscountAmount: discountAmount || undefined,
          schemeFreeQty: benefit?.freeQty,
          schemeFreeUnit: benefit?.freeUnit,
          schemeFreeProductId: benefit?.freeProductId,
          schemeFreeProductName: benefit?.freeProductName,
          // Every scheme applied to the line; the fields above describe the main one
          appliedSchemes: appliedSchemesOf(benefit).map((applied) => ({
            schemeId: applied.schemeId,
            schemeName: applied.schemeName,
            schemeType: applied.schemeType,
            minimumQuantity: applied.minimumQuantity,
            minimumQuantityUnit: applied.minimumQuantityUnit,
            discountPercent: applied.discountPercent,
            discountValue: applied.discountValue,
            buyQty: applied.buyQty,
            buyUnit: applied.buyUnit,
            discountAmount: toFixed4(applied.discountAmount),
            freeQty: applied.freeQty,
            freeUnit: applied.freeUnit,
            freeProductId: applied.freeProductId,
            freeProductName: applied.freeProductName,
          })),
        };
      });

      const firstSaleItem = saleItems[0];

      const netCases = toFixed4(saleItems.reduce((sum, item) => sum + item.netCases, 0));

      const totalQty = items.reduce((sum, item) => {
        const caseQty = item.caseQty || 0;
        const pieceQty = item.pieceQty || 0;
        const unitQtyInCase = item.unitQtyInCase || 1;
        return sum + caseQty * unitQtyInCase + pieceQty;
      }, 0);

      let remarkText = paymentDetails;

      if (isSplitPayment) {
        const paymentDetailsStr = otherPaymentsList
          .map((p) => `${p.mode.toUpperCase()}: ${currency}${p.amount.toFixed(2)}`)
          .join(', ');

        if (creditAmountUsed > 0) {
          remarkText = `${paymentDetails}\nSplit payment: ${creditAmountUsed} credit + ${paymentDetailsStr}`;
        } else {
          remarkText = `${paymentDetails}\nSplit payment: ${paymentDetailsStr}`;
        }
      }

      let saleVisit = useOutletStore.getState().activeVisit;

      if (!saleVisit) {
        loader.show({ message: 'Starting outlet visit...' });

        const interaction = useOutletStore.getState().activeInteraction;

        if (
          !interaction ||
          !outlet?.customerId ||
          interaction.customerId !== outlet?.customerId ||
          !selectedRoute?.routeSessionId ||
          !selectedRoute?.workSessionId ||
          !van?.vanId
        ) {
          toast.error('Visit unavailable', 'Return to the outlet and capture arrival GPS first.');
          return;
        }

        const visitResponse = await outletService.startVisit(
          {
            routeSessionId: selectedRoute.routeSessionId,
            workSessionId: selectedRoute.workSessionId,
            vanId: van.vanId,
            outletId: outlet.customerId,
            visitType: interaction.visitType,
            interactionId: interaction.interactionId,
          },
          { showLoader: true },
        );

        if (!visitResponse.success || !visitResponse.data?.visitId) {
          toast.error('Visit unavailable', visitResponse.message || 'Unable to start visit.');
          return;
        }

        const visit = visitResponse.data;

        saleVisit = {
          visitId: visit.visitId,
          outlet,
          checkInTime: new Date(visit.checkInTime || interaction.arrivalTime),
          status: 'ACTIVE',
          routeSessionId: selectedRoute.routeSessionId,
          customerId: outlet.customerId,
          visitType: interaction.visitType,
        };

        useOutletStore.getState().setActiveVisit(saleVisit);
        useOutletStore.getState().setActiveInteraction({
          ...interaction,
          status: 'CONVERTED',
        });
      }

      // Idempotency key: the same checkout retried (e.g. after a timeout)
      // reuses it, so the server returns the sale already created instead of
      // creating a second one. Any change to the checkout gets a new key.
      const checkoutSignature = JSON.stringify([
        outlet?.customerId,
        saleItems.map((item: any) => [item.productId, item.caseQty, item.pieceQty]),
        totalValue,
        paymentMode,
        paidAmount,
      ]);
      if (clientSaleIdRef.current?.signature !== checkoutSignature) {
        clientSaleIdRef.current = { signature: checkoutSignature, id: createUuid() };
      }

      const payload: any = {
        clientSaleId: clientSaleIdRef.current.id,
        vanId: van?.vanId,
        vanName: van?.vanNumber || 'Van',
        compCode: firstSaleItem?.compCode,
        categoryId: firstSaleItem?.categoryId,
        parentCategoryId: firstSaleItem?.parentCategoryId,
        customerId: outlet?.customerId,
        customerName: outlet?.name || 'test',
        date: new Date().toISOString(),
        totalCases: caseDetails.totalCases,
        netCases,
        totalPieces: pieceDetails.totalPieces,
        totalQty,
        totalWeight: toFixed4(totalNetWeight),
        subtotal: toFixed4(orderSubtotal),
        schemeIds: Array.from(
          new Set([
            ...allAppliedSchemes(schemeDiscounts)
              .map((benefit) => benefit.schemeId)
              .filter(Boolean),
            ...groupSchemeBenefits.map((benefit) => benefit.schemeId),
          ]),
        ),
        schemeNames: appliedSchemeNames,
        groupSchemes: groupSchemeBenefits,
        schemeDiscountAmount: toFixed4(orderDiscount),
        totalValue,
        type: saleType,
        paymentMode,
        paidAmount,
        pendingAmount,
        remark: remarkText,
        items: saleItems,
        visitId: saleVisit.visitId,
      };

      if (isSplitPayment && creditAmountUsed > 0) {
        payload.splitPayment = {
          creditAmount: creditAmountUsed,
          otherPayments: otherPaymentsList,
        };
      }

      loader.show({ message: 'Creating sale...' });

      // Start the checkout GPS fix now so it is ready when the visit completes
      const checkOutLocationPromise = captureCurrentLocation();

      const response: any = await saleService.createSale(payload, {
        showLoader: false,
      });

      if (!response?.success) {
        toast.error('Error', response?.message || 'Failed to create sale');
        setShowConfirm(false);
        return;
      }

      // This checkout is done; the next one gets a fresh key
      clientSaleIdRef.current = null;

      let successMessage = 'Sale created successfully';

      if (isSplitPayment) {
        const paymentsStr = otherPaymentsList
          .map((p) => `${p.mode.toUpperCase()}: ${currency}${p.amount.toFixed(2)}`)
          .join(', ');

        if (creditAmountUsed > 0) {
          successMessage = `Split payment completed!\nCredit: ${currency}${creditAmountUsed.toFixed(2)}\n${paymentsStr}`;
        } else {
          successMessage = `Split payment completed!\n${paymentsStr}`;
        }
      } else if (isCreditSelected) {
        successMessage = 'Credit sale created successfully';
      }

      toast.success('Success', successMessage);

      const saleId = response?.data?.saleId;

      loader.show({ message: 'Preparing invoice...' });

      const invoiceData = {
        id: saleId,
        invoiceNumber: saleId,
        customer: outlet?.name,
        customerId: outlet?.customerId,
        date: new Date().toLocaleDateString(),
        dateTime: new Date().toISOString(),
        amount: totalValue,
        currency,
        paymentMode,
        paidAmount,
        pendingAmount,
        saleType,
        ...(isSplitPayment && {
          splitDetails: {
            creditAmount: creditAmountUsed,
            otherPayments: otherPaymentsList,
          },
        }),
        items: saleItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: item.casePrice,
          total: item.casePrice * (item.caseQty + item.pieceQty / item.unitQtyInCase),
          caseQty: item.caseQty,
          pieceQty: item.pieceQty,
          unitQtyInCase: item.unitQtyInCase,
        })),
        summary: {
          totalCases: caseDetails.totalCases,
          totalPieces: pieceDetails.totalPieces,
          totalQty,
          totalNetWeight: toFixed4(totalNetWeight),
          subtotal: toFixed4(orderSubtotal),
          discount: toFixed4(orderDiscount),
          tax: toFixed4(0),
          total: totalValue,
        },
        van: {
          id: van?.vanId,
          name: van?.vanNumber || 'Van',
          number: van?.vanNumber,
        },
        employee: {
          id: user?.userId,
          name: user?.name,
        },
        paymentDetails,
        reference: `ORD-${Date.now()}`,
        status: pendingAmount > 0 ? (paidAmount > 0 ? 'PARTIAL' : 'CREDIT') : 'PAID',
      };

      useInvoiceStore.getState().setLatestInvoice(invoiceData);
      setShowConfirm(false);

      loader.show({ message: 'Completing visit...' });

      clearCart();

      const completedVisit = useOutletStore.getState().activeVisit;

      if (completedVisit?.visitId) {
        try {
          await outletService.completeVisit(completedVisit.visitId, checkOutLocationPromise);
          useOutletStore.getState().setActiveVisit(null);
        } catch (error) {
          console.error('Error completing visit:', error);
        }
      }

      router.replace({
        pathname: '/checkin/shareinvoice',
        params: {
          invoiceId: saleId,
          customerId: outlet?.customerId,
        },
      });
    } catch (error: any) {
      console.error('Sale creation failed:', error);

      toast.error(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to create sale',
      );
    } finally {
      setIsSubmitting(false);
      loader.hide();
    }
  };

  const handleSetFullAmount = () => {
    if (isCreditSelected) {
      Alert.alert(
        'Credit Sale',
        'For credit sales, the full amount will be added to outstanding balance.',
      );
    } else {
      setAmount(amountDue.toString());
    }
  };

  const getCreditStatusColor = () => {
    if (creditInfo.creditLimit === 0) return colors.textTertiary;
    const usagePercent = (creditInfo.outstandingBalance / creditInfo.creditLimit) * 100;
    if (usagePercent > 80) return colors.error;
    if (usagePercent > 50) return colors.warning;
    return colors.success;
  };

  const usagePercent =
    creditInfo.creditLimit > 0 ? (creditInfo.outstandingBalance / creditInfo.creditLimit) * 100 : 0;
  const isCreditExhausted = creditInfo.availableCredit <= 0;

  if (!outlet) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: colors.error }}>
          No outlet selected. Please select an outlet first.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ color: colors.error }}>Cart is empty. Please add items first.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.customerName}>{outlet?.name}</Text>
              {!!customerAddress && (
                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  style={[styles.orderRef, { flexShrink: 1 }]}
                >
                  {customerAddress}
                </Text>
              )}
            </View>
            {/* <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={24} color={colors.primary} />
            </TouchableOpacity> */}
          </View>
        </Animated.View>

        {/* Credit Info */}
        {/* {creditInfo.creditLimit > 0 && showCreditInfo && (
          <Animated.View entering={FadeInDown.delay(30).springify()}>
            <AppCard variant="elevated" padding="md" style={styles.creditCard}>
              <View style={styles.creditHeader}>
                <View style={styles.creditTitleContainer}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                  <Text style={styles.creditTitle}>Credit Information</Text>
                </View>
              </View>

              {showCreditInfo && (
                <>
                  <View style={styles.creditStatsGrid}>
                    <View style={styles.creditStatItem}>
                      <Text style={styles.creditStatLabel}>Credit Limit</Text>
                      <Text style={styles.creditStatValue}>
                        {currency} {creditInfo.creditLimit.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.creditStatItem}>
                      <Text style={styles.creditStatLabel}>Outstanding</Text>
                      <Text style={[styles.creditStatValue, { color: colors.warning }]}>
                        {currency} {creditInfo.outstandingBalance.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.creditStatItem}>
                      <Text style={styles.creditStatLabel}>Available</Text>
                      <Text style={[styles.creditStatValue, { color: colors.success }]}>
                        {currency} {creditInfo.availableCredit.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.creditProgressContainer}>
                    <View style={styles.creditProgressHeader}>
                      <Text style={styles.creditProgressLabel}>Credit Usage</Text>
                      <Text style={styles.creditProgressPercent}>{usagePercent.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.creditProgressBar}>
                      <View
                        style={[
                          styles.creditProgressFill,
                          {
                            width: `${Math.min(100, usagePercent)}%`,
                            backgroundColor: getCreditStatusColor(),
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {creditInfo.paymentTerms && (
                    <View style={styles.paymentTermsContainer}>
                      <Ionicons name="time-outline" size={14} color={colors.primary} />
                      <Text style={styles.paymentTermsText}>{creditInfo.paymentTerms}</Text>
                    </View>
                  )}
                </>
              )}
            </AppCard>
          </Animated.View>
        )} */}

        {/* Order Summary */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <AppCard variant="elevated" padding="md" style={styles.orderSummaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            {(caseDetails.totalCases > 0 || pieceDetails.totalPieces > 0) && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cases ({caseDetails.totalCases})</Text>
                  <Text style={styles.summaryValue}>
                    {caseDetails.totalCaseWeight.toFixed(3)} kg
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Pieces ({pieceDetails.totalPieces})</Text>
                  <Text style={styles.summaryValue}>
                    {pieceDetails.totalPieceWeight.toFixed(3)} kg
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={[styles.summaryRow, styles.weightTotalRow]}>
                  <Text style={styles.summaryLabel}>Total Net Weight</Text>
                  <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>
                    {totalNetWeight.toFixed(3)} kg
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
              </>
            )}

            {orderDiscount > 0 && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(orderSubtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="pricetag" size={14} color={colors.success} />
                    <Text style={[styles.summaryLabel, { color: colors.success }]}>
                      Scheme savings
                    </Text>
                  </View>
                  <Text style={[styles.summaryValue, { color: colors.success, fontWeight: '700' }]}>
                    − {formatCurrency(orderDiscount)}
                  </Text>
                </View>
              </>
            )}
            {(Object.keys(schemeDiscounts).length > 0 || groupSchemeBenefits.length > 0) && (
              <View style={{ marginTop: 8 }}>
                <SchemeBenefitsPanel
                  lineBenefits={allAppliedSchemes(schemeDiscounts)}
                  groupBenefits={groupSchemeBenefits}
                />
              </View>
            )}
            {(orderDiscount > 0 ||
              Object.keys(schemeDiscounts).length > 0 ||
              groupSchemeBenefits.length > 0) && <View style={styles.summaryDivider} />}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount Due</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatCurrency(orderTotal)}
              </Text>
            </View>
          </AppCard>
        </Animated.View>

        {/* Payment Methods */}
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>

            {/* Cash, Wallet, Card, Cheque */}
            {['cash', 'wallet'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.paymentModeCard,
                  selectedMode === mode && styles.paymentModeSelected,
                ]}
                onPress={() => {
                  setSelectedMode(mode as PaymentMode);
                  if (mode === 'split') {
                    setShowSplitPaymentModal(true);
                  }
                }}
              >
                <View style={styles.paymentModeLeft}>
                  <View
                    style={[
                      styles.paymentModeIcon,
                      {
                        backgroundColor:
                          colors[
                            mode === 'cash'
                              ? 'success'
                              : mode === 'wallet'
                                ? 'primary'
                                : mode === 'card'
                                  ? 'warning'
                                  : 'info'
                          ] + '15',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        mode === 'cash'
                          ? 'cash-outline'
                          : mode === 'wallet'
                            ? 'wallet-outline'
                            : mode === 'card'
                              ? 'card-outline'
                              : 'document-text-outline'
                      }
                      size={24}
                      color={
                        colors[
                          mode === 'cash'
                            ? 'success'
                            : mode === 'wallet'
                              ? 'primary'
                              : mode === 'card'
                                ? 'warning'
                                : 'info'
                        ]
                      }
                    />
                  </View>
                  <Text style={styles.paymentModeLabel}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </View>
                <View style={styles.paymentModeRight}>
                  {selectedMode === mode && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={
                        colors[
                          mode === 'cash'
                            ? 'success'
                            : mode === 'wallet'
                              ? 'primary'
                              : mode === 'card'
                                ? 'warning'
                                : 'info'
                        ]
                      }
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Credit Option */}
            {creditInfo.creditLimit > 0 && !isCreditExhausted && (
              <TouchableOpacity
                style={[
                  styles.paymentModeCard,
                  selectedMode === 'credit' && styles.paymentModeSelected,
                  willExceedCredit && { opacity: 0.6 },
                ]}
                onPress={() => !willExceedCredit && setSelectedMode('credit')}
                disabled={willExceedCredit}
              >
                <View style={styles.paymentModeLeft}>
                  <View
                    style={[
                      styles.paymentModeIcon,
                      { backgroundColor: (colors.primary || '#9C27B0') + '15' },
                    ]}
                  >
                    <Ionicons
                      name="business-outline"
                      size={24}
                      color={colors.primary || '#9C27B0'}
                    />
                  </View>
                  <View>
                    <Text style={styles.paymentModeLabel}>Credit / Account</Text>
                    <Text style={styles.paymentModeSubLabel}>
                      Available: {currency} {creditInfo.availableCredit.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentModeRight}>
                  {selectedMode === 'credit' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary || '#9C27B0'}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Split Payment Option */}
            {/* <TouchableOpacity
              style={[
                styles.paymentModeCard,
                selectedMode === 'split' && styles.paymentModeSelected,
              ]}
              onPress={() => {
                setSelectedMode('split');
                setShowSplitPaymentModal(true);
              }}
            >
              <View style={styles.paymentModeLeft}>
                <View style={[styles.paymentModeIcon, { backgroundColor: colors.info + '15' }]}>
                  <Ionicons name="swap-horizontal-outline" size={24} color={colors.info} />
                </View>
                <Text style={styles.paymentModeLabel}>Split Payment</Text>
              </View>
              <View style={styles.paymentModeRight}>
                {selectedMode === 'split' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.info} />
                )}
              </View>
            </TouchableOpacity> */}

            {/* Split Payment Summary */}
            {isSplitPayment && selectedMode === 'split' && (
              <View
                style={[styles.infoBox, { backgroundColor: colors.success + '10', marginTop: 12 }]}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoText, { color: colors.success, fontWeight: '600' }]}>
                    Split Payment Configured
                  </Text>
                  {splitPayment.creditAmount > 0 && (
                    <Text
                      style={[
                        styles.infoText,
                        { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
                      ]}
                    >
                      Credit: {currency}
                      {splitPayment.creditAmount.toFixed(2)}
                    </Text>
                  )}
                  {splitPayment.otherPayments.map((payment, idx) => (
                    <Text
                      key={idx}
                      style={[styles.infoText, { color: colors.textSecondary, fontSize: 12 }]}
                    >
                      {payment.mode.toUpperCase()}: {currency}
                      {payment.amount.toFixed(2)}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSplitPayment(null);
                    setSelectedMode('cash');
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}

            {/* Credit Sale Info */}
            {isCreditSelected && !isSplitPayment && (
              <View
                style={[styles.infoBox, { backgroundColor: colors.primary + '10', marginTop: 12 }]}
              >
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.infoText, { color: colors.primary, fontWeight: '600' }]}>
                    Credit Sale Details
                  </Text>
                  <Text
                    style={[
                      styles.infoText,
                      { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
                    ]}
                  >
                    • Full amount of {currency}
                    {orderTotal.toFixed(2)} will be added to outstanding balance
                  </Text>
                  <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: 13 }]}>
                    • No payment required at this time
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Amount Input - Only show for non-credit payments and not split payment */}
        {!isCreditSelected && !isSplitPayment && selectedMode !== 'split' && (
          <Animated.View entering={FadeInDown.delay(180).springify()}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>{currency}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                />
                <TouchableOpacity
                  onPress={handleSetFullAmount}
                  style={styles.fullAmountButton}
                  accessibilityRole="button"
                  accessibilityLabel="Set full amount"
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Remarks */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details/Remarks (Optional)</Text>
            <TextInput
              style={[styles.remarksInput, { borderColor: colors.border }]}
              value={paymentDetails}
              onChangeText={setPaymentDetails}
              placeholder={
                isCreditSelected
                  ? 'Add reference or notes for credit sale'
                  : 'Add cheque number, transaction ID, or any remarks'
              }
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Button */}
      <Animated.View
        entering={SlideInDown.springify()}
        style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}
      >
        <TouchableOpacity
          style={[
            styles.collectButton,
            { backgroundColor: canProceed && !isProcessing ? colors.primary : colors.border },
          ]}
          onPress={handleCollectPayment}
          disabled={!canProceed || isProcessing}
          activeOpacity={0.9}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.collectButtonText}>
              {selectedMode === 'split' && isSplitPayment
                ? `Process Split Payment (${splitPayment.otherPayments.length} methods${splitPayment.creditAmount > 0 ? ' + Credit' : ''})`
                : isCreditSelected
                  ? `Create Credit Sale · ${currency} ${orderTotal.toFixed(2)}`
                  : !isValidAmount
                    ? 'Enter amount'
                    : parsedAmount === amountDue
                      ? `Pay Full Amount ${formatCurrency(amountDue)}`
                      : `Pay ${formatCurrency(parsedAmount)}`}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Split Payment Modal */}
      <SplitPaymentModal
        visible={showSplitPaymentModal}
        orderTotal={orderTotal}
        availableCredit={creditInfo.availableCredit}
        currency={currency}
        onConfirm={handleSplitPaymentConfirm}
        onCancel={() => {
          setShowSplitPaymentModal(false);
          if (selectedMode === 'split' && !splitPayment) {
            setSelectedMode('cash');
          }
        }}
      />

      <ConfirmationModal
        visible={showConfirm}
        title={
          isSplitPayment
            ? 'Confirm Split Payment'
            : isCreditSelected
              ? 'Confirm Credit Sale'
              : 'Confirm Payment'
        }
        message={
          isSplitPayment
            ? (() => {
                let msg = '';
                if (splitPayment.creditAmount > 0) {
                  msg += `🏦 Credit: ${currency} ${splitPayment.creditAmount.toFixed(2)}\n`;
                }
                splitPayment.otherPayments.forEach((p) => {
                  const icon =
                    p.mode === 'cash'
                      ? '💵'
                      : p.mode === 'card'
                        ? '💳'
                        : p.mode === 'wallet'
                          ? '👛'
                          : p.mode === 'cheque'
                            ? '📝'
                            : '💰';
                  msg += `${icon} ${p.mode.toUpperCase()}: ${currency} ${p.amount.toFixed(2)}\n`;
                });
                msg += `\n📦 TOTAL: ${currency} ${orderTotal.toFixed(2)}`;
                return msg;
              })()
            : isCreditSelected
              ? `🏦 Amount: ${currency} ${orderTotal.toFixed(2)}\n📋 Type: CREDIT\n\n⚠️ This amount will be added to the customer's outstanding balance.`
              : `💵 Amount: ${currency} ${parsedAmount.toFixed(2)}\n💳 Type: ${selectedMode.toUpperCase()}`
        }
        confirmText="Confirm"
        cancelText="Cancel"
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmPayment}
        loading={isSubmitting}
        type={isSplitPayment ? 'info' : isCreditSelected ? 'warning' : 'success'}
        danger={isCreditSelected}
        icon={
          isSplitPayment ? (
            <Ionicons name="swap-horizontal" size={56} color="#2196F3" />
          ) : isCreditSelected ? (
            <Ionicons name="business" size={56} color="#FF9800" />
          ) : (
            <Ionicons name="checkmark-circle" size={56} color="#4CAF50" />
          )
        }
      />
    </KeyboardAvoidingView>
  );
}
