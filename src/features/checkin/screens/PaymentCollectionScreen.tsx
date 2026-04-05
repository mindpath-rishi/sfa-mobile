import React, { useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaymentCollectionStyles } from '../styles/PaymentCollection.styles';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { useOutletStore } from '@/core/store/outlet.store';
import { useCartStore } from '@/core/store/cart.store';

// Types
type PaymentMode = 'cash' | 'wallet' | 'card' | 'cheque' | 'credit';

interface CreditInfo {
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  paymentTerms?: string;
}

export default function PaymentCollectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = usePaymentCollectionStyles();

  // Get data from stores
  const outlet = useOutletStore((s) => s.selectedOutlet);
  const { items, summary, clearCart, getCartSummary } = useCartStore();

  // Get cart calculations using the helper method
  const {
    subtotal,
    tax,
    total: orderTotal,
    netWeight,
    caseDetails,
    pieceDetails,
  } = getCartSummary();

  // Get params from navigation
  const params = useLocalSearchParams<{
    customerName?: string;
    reference?: string;
    currency?: string;
  }>();

  const customerName = params.customerName || outlet?.name || 'Customer';
  const reference = params.reference || `ORD-${Date.now()}`;
  const currency = params.currency || outlet?.currency || 'K';

  // Credit info from outlet store
  const creditInfo: CreditInfo = {
    creditLimit: outlet?.creditLimit || 0,
    outstandingBalance: outlet?.outstanding ?? 0,
    availableCredit: (outlet?.creditLimit ?? 0) - (outlet?.outstanding ?? 0),
    paymentTerms: outlet?.creditDays ? `${outlet.creditDays} days` : undefined,
  };

  const [selectedMode, setSelectedMode] = useState<PaymentMode>('cash');
  const [amount, setAmount] = useState(orderTotal.toString());
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreditInfo, setShowCreditInfo] = useState(true);

  const amountDue = orderTotal;
  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount > 0 && parsedAmount <= amountDue;

  // Credit validation
  const isCreditSelected = selectedMode === 'credit';
  const willExceedCredit = isCreditSelected && parsedAmount > creditInfo.availableCredit;
  const remainingAfterPayment = creditInfo.availableCredit - parsedAmount;

  const canProceed = isValidAmount && selectedMode && (!isCreditSelected || !willExceedCredit);

  const handleCollectPayment = async () => {
    if (!isValidAmount) {
      Alert.alert(
        'Invalid Amount',
        `Please enter a valid amount between 0 and ${amountDue.toFixed(2)}`,
      );
      return;
    }

    if (isCreditSelected && willExceedCredit) {
      Alert.alert(
        'Credit Limit Exceeded',
        `This payment would exceed your available credit by ${currency}${(parsedAmount - creditInfo.availableCredit).toFixed(2)}.\n\nAvailable credit: ${currency}${creditInfo.availableCredit.toFixed(2)}`,
        [{ text: 'OK' }],
      );
      return;
    }

    if (parsedAmount < amountDue && !isCreditSelected) {
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

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update outlet store with new outstanding balance for credit payments
      if (isCreditSelected) {
        const newOutstanding = creditInfo.outstandingBalance + parsedAmount;
        // You would typically call an API here to update the backend
        // await updateOutletOutstanding(outlet?.id, newOutstanding);
      }

      // Prepare invoice items with details
      const invoiceItems = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        caseQty: item.caseQty || 0,
        pieceQty: item.pieceQty || 0,
        casePrice: item.casePrice,
        piecePrice: item.piecePrice,
        caseNetWeight: item.caseNetWeight,
        pieceNetWeight: item.pieceNetWeight,
        totalPrice: (item.caseQty || 0) * item.casePrice + (item.pieceQty || 0) * item.piecePrice,
      }));

      // Clear cart after successful payment
      clearCart();

      router.push({
        pathname: '/checkin/shareinvoice',
        params: {
          invoiceNo: `INV-${Date.now()}`,
          amount: parsedAmount.toFixed(2),
          currency: currency,
          paymentMode: selectedMode,
          customerName: customerName,
          reference: reference,
          items: JSON.stringify(invoiceItems),
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: orderTotal.toFixed(2),
          netWeight: netWeight.toFixed(3),
          ...(isCreditSelected && {
            newBalance: (creditInfo.outstandingBalance + parsedAmount).toFixed(2),
            remainingCredit: remainingAfterPayment.toFixed(2),
          }),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetFullAmount = () => {
    if (isCreditSelected && orderTotal > creditInfo.availableCredit) {
      setAmount(creditInfo.availableCredit.toString());
      Alert.alert(
        'Credit Limit',
        `Setting amount to available credit: ${currency}${creditInfo.availableCredit.toFixed(2)}`,
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

  // Don't render if no outlet selected
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

  // Don't render if cart is empty
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Customer & Order Header */}
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.orderRef}>Order: {reference}</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Credit Information Card - Only show if outlet has credit limit */}
        {creditInfo.creditLimit > 0 && showCreditInfo && (
          <Animated.View entering={FadeInDown.delay(30).springify()}>
            <AppCard variant="elevated" padding="md" style={styles.creditCard}>
              <View style={styles.creditHeader}>
                <View style={styles.creditTitleContainer}>
                  <Ionicons name="card-outline" size={20} color={colors.primary} />
                  <Text style={styles.creditTitle}>Credit Information</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreditInfo(!showCreditInfo)}>
                  <Ionicons
                    name={showCreditInfo ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
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
        )}

        {/* Order Summary Card */}
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <AppCard variant="elevated" padding="md" style={styles.orderSummaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {currency} {subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (16%)</Text>
              <Text style={styles.summaryValue}>
                {currency} {tax.toFixed(2)}
              </Text>
            </View>

            {/* Weight Breakdown */}
            {netWeight > 0 && (
              <>
                <View style={styles.summaryDivider} />
                <Text style={styles.summarySubtitle}>Weight Details</Text>

                {caseDetails.totalCases > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Cases ({caseDetails.totalCases})</Text>
                    <Text style={styles.summaryValue}>
                      {caseDetails.totalCaseWeight.toFixed(3)} kg
                    </Text>
                  </View>
                )}

                {pieceDetails.totalPieces > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pieces ({pieceDetails.totalPieces})</Text>
                    <Text style={styles.summaryValue}>
                      {pieceDetails.totalPieceWeight.toFixed(3)} kg
                    </Text>
                  </View>
                )}

                <View style={[styles.summaryRow, styles.weightTotalRow]}>
                  <Text style={styles.summaryLabel}>Total Net Weight</Text>
                  <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>
                    {netWeight.toFixed(3)} kg
                  </Text>
                </View>
              </>
            )}

            <View style={styles.summaryDivider} />

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount Due</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {currency} {orderTotal.toFixed(2)}
              </Text>
            </View>
          </AppCard>
        </Animated.View>

        {/* Mode of Payment */}
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>

            <TouchableOpacity
              style={[
                styles.paymentModeCard,
                selectedMode === 'cash' && styles.paymentModeSelected,
                { borderColor: selectedMode === 'cash' ? colors.success : colors.border },
              ]}
              onPress={() => setSelectedMode('cash')}
            >
              <View style={styles.paymentModeLeft}>
                <View style={[styles.paymentModeIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="cash-outline" size={24} color={colors.success} />
                </View>
                <Text style={styles.paymentModeLabel}>Cash</Text>
              </View>
              <View style={styles.paymentModeRight}>
                {selectedMode === 'cash' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentModeCard,
                selectedMode === 'wallet' && styles.paymentModeSelected,
                { borderColor: selectedMode === 'wallet' ? colors.primary : colors.border },
              ]}
              onPress={() => setSelectedMode('wallet')}
            >
              <View style={styles.paymentModeLeft}>
                <View style={[styles.paymentModeIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="wallet-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.paymentModeLabel}>Mobile Wallet</Text>
              </View>
              <View style={styles.paymentModeRight}>
                {selectedMode === 'wallet' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentModeCard,
                selectedMode === 'card' && styles.paymentModeSelected,
                { borderColor: selectedMode === 'card' ? colors.warning : colors.border },
              ]}
              onPress={() => setSelectedMode('card')}
            >
              <View style={styles.paymentModeLeft}>
                <View style={[styles.paymentModeIcon, { backgroundColor: colors.warning + '15' }]}>
                  <Ionicons name="card-outline" size={24} color={colors.warning} />
                </View>
                <Text style={styles.paymentModeLabel}>Credit/Debit Card</Text>
              </View>
              <View style={styles.paymentModeRight}>
                {selectedMode === 'card' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.warning} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentModeCard,
                selectedMode === 'cheque' && styles.paymentModeSelected,
                { borderColor: selectedMode === 'cheque' ? colors.info : colors.border },
              ]}
              onPress={() => setSelectedMode('cheque')}
            >
              <View style={styles.paymentModeLeft}>
                <View style={[styles.paymentModeIcon, { backgroundColor: colors.info + '15' }]}>
                  <Ionicons name="document-text-outline" size={24} color={colors.info} />
                </View>
                <Text style={styles.paymentModeLabel}>Cheque</Text>
              </View>
              <View style={styles.paymentModeRight}>
                {selectedMode === 'cheque' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.info} />
                )}
              </View>
            </TouchableOpacity>

            {/* Credit Payment Option - Only show if outlet has credit limit */}
            {creditInfo.creditLimit > 0 && (
              <TouchableOpacity
                style={[
                  styles.paymentModeCard,
                  selectedMode === 'credit' && styles.paymentModeSelected,
                  {
                    borderColor:
                      selectedMode === 'credit' ? colors.primary || '#9C27B0' : colors.border,
                  },
                ]}
                onPress={() => setSelectedMode('credit')}
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
          </View>
        </Animated.View>

        {/* Amount Input */}
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>{currency}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                editable={!isCreditSelected || (isCreditSelected && !willExceedCredit)}
              />
              <TouchableOpacity onPress={handleSetFullAmount} style={styles.fullAmountButton}>
                <Text style={[styles.fullAmountText, { color: colors.primary }]}>
                  {isCreditSelected && orderTotal > creditInfo.availableCredit
                    ? 'Max Credit'
                    : 'Full Amount'}
                </Text>
              </TouchableOpacity>
            </View>

            {isCreditSelected && willExceedCredit && (
              <View style={[styles.warningBox, { backgroundColor: colors.error + '10' }]}>
                <Ionicons name="warning-outline" size={16} color={colors.error} />
                <Text style={[styles.warningText, { color: colors.error }]}>
                  Amount exceeds available credit by {currency}
                  {(parsedAmount - creditInfo.availableCredit).toFixed(2)}
                </Text>
              </View>
            )}

            {isCreditSelected && !willExceedCredit && parsedAmount > 0 && (
              <View style={[styles.infoBox, { backgroundColor: colors.success + '10' }]}>
                <Ionicons name="information-circle-outline" size={16} color={colors.success} />
                <Text style={[styles.infoText, { color: colors.success }]}>
                  After payment, available credit: {currency}
                  {(creditInfo.availableCredit - parsedAmount).toFixed(2)}
                </Text>
              </View>
            )}

            {!isValidAmount && amount !== '' && !isCreditSelected && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                Amount must be between 0 and {amountDue.toFixed(2)}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Payment Details/Remarks */}
        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details/Remarks (Optional)</Text>
            <TextInput
              style={[styles.remarksInput, { borderColor: colors.border }]}
              value={paymentDetails}
              onChangeText={setPaymentDetails}
              placeholder={
                selectedMode === 'credit'
                  ? 'Add reference or notes for credit payment'
                  : 'Payment Details such as Cheque number or any remarks'
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

      {/* Collect Payment Button */}
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
              {!isValidAmount
                ? 'Enter amount'
                : isCreditSelected
                  ? `Charge to Credit Account · ${currency} ${parsedAmount.toFixed(2)}`
                  : parsedAmount === amountDue
                    ? `Pay Full Amount ${currency} ${amountDue.toFixed(2)}`
                    : `Pay ${currency} ${parsedAmount.toFixed(2)}`}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
