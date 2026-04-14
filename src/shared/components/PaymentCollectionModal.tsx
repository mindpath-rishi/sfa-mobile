// PaymentCollectionModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
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
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import { AppModal, AppText } from '@/core/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';
import { usePaymentCollectionStyles } from '@/features/checkin/styles/PaymentCollection.styles';
import { saleService } from '../services/sale.service';
import { useRouteStore } from '@/core/store/route.store';

interface PaymentCollectionModalProps {
  visible: boolean;
  outlet: any;
  onClose: () => void;
  onSuccess?: (paymentData: any) => void;
  outstanding?: any;
}

type PaymentMode = 'cash' | 'card' | 'cheque' | 'mobile_money' | 'bank_transfer';

const PAYMENT_MODES: PaymentMode[] = ['cash', 'card', 'cheque', 'mobile_money', 'bank_transfer'];
const MODE_ICONS: Record<PaymentMode, string> = {
  cash: 'cash-outline',
  card: 'card-outline',
  cheque: 'document-text-outline',
  mobile_money: 'phone-portrait-outline',
  bank_transfer: 'business-outline',
};
const MODE_NAMES: Record<PaymentMode, string> = {
  cash: 'Cash',
  card: 'Card',
  cheque: 'Cheque',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Bank Transfer',
};
const MODE_COLORS: Record<PaymentMode, string> = {
  cash: '#10B981',
  card: '#F59E0B',
  cheque: '#8B5CF6',
  mobile_money: '#06B6D4',
  bank_transfer: '#3B82F6',
};

export const PaymentCollectionModal: React.FC<PaymentCollectionModalProps> = ({
  visible,
  outlet,
  onClose,
  onSuccess,
  outstanding,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = usePaymentCollectionStyles();

  const user = useAuthStore((s) => s.user);

  const [selectedMode, setSelectedMode] = useState<PaymentMode>('cash');
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saleId, setSaleId] = useState('');

  const currency = 'ZMW';
  const parsedAmount = parseFloat(amount) || 0;
  const isValidAmount = parsedAmount > 0;
  const canProceed = selectedMode && isValidAmount;
  const van = useRouteStore.getState().van;

  const handleCollectPayment = () => {
    if (!isValidAmount) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    setShowConfirm(true);
  };

  useEffect(() => {
    console.log(outstanding, '=====================3345====================');
    setAmount(outstanding);
  }, [outstanding]);

  const processPayment = async () => {
    if (!user) {
      toast.error('Error', 'User not loaded');
      return;
    }

    if (!outlet) {
      toast.error('Error', 'No outlet selected');
      return;
    }

    setIsProcessing(true);

    const payload = {
      customerId: outlet?.customerId,
      vanId: van?.vanId,
      employeeId: user?.userId,
      amount: parsedAmount,
      paymentMode: selectedMode.toUpperCase(),
      date: new Date().toISOString(),
      referenceNo: paymentDetails || undefined,
      remark: paymentDetails || undefined,
      saleId: saleId || undefined,
    };

    try {
      const response = await saleService.createPayment(payload);

      setIsProcessing(false);
      setShowConfirm(false);

      if (!response?.success) {
        toast.error('Error', response?.message || 'Failed to process payment');
        return;
      }

      toast.success('Success', 'Payment collected successfully');

      const paymentData = {
        paymentId: response?.data?.paymentId,
        customerId: outlet?.customerId,
        customerName: outlet?.name,
        amount: parsedAmount,
        paymentMode: selectedMode.toUpperCase(),
        date: new Date().toISOString(),
        referenceNo: paymentDetails,
        vanId: van?.vanId,
      };

      // Reset form
      setAmount('');
      setPaymentDetails('');
      setSaleId('');

      if (onSuccess) {
        onSuccess(paymentData);
      }

      onClose();
    } catch (error) {
      setIsProcessing(false);
      setShowConfirm(false);
      toast.error('Error', 'Failed to process payment');
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedMode('cash');
      setAmount('');
      setPaymentDetails('');
      setSaleId('');
      setShowConfirm(false);
    }
  }, [visible]);

  if (!outlet) {
    return null;
  }

  return (
    <>
      <AppModal
        visible={visible}
        onClose={onClose}
        title="Collect Payment"
        size="full"
        position="bottom"
        showCloseButton={true}
        showBackdrop={true}
        closeOnBackdropPress={true}
        keyboardAvoiding={true}
        scrollable={true}
        contentStyle={styles.modalContent}
        style={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, gap: 20 }}
          >
            {/* Customer Info */}
            <Animated.View entering={FadeInDown.springify()}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.customerName}>{outlet?.name}</Text>
                  <Text style={styles.orderRef}>
                    {outlet?.customerId} • {outlet?.address?.line1}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Payment Methods */}
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                {PAYMENT_MODES.map((mode) => {
                  const modeColor = MODE_COLORS[mode];
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.paymentModeCard,
                        selectedMode === mode && styles.paymentModeSelected,
                        { borderColor: selectedMode === mode ? modeColor : colors.border },
                      ]}
                      onPress={() => setSelectedMode(mode)}
                    >
                      <View style={styles.paymentModeLeft}>
                        <View
                          style={[styles.paymentModeIcon, { backgroundColor: modeColor + '15' }]}
                        >
                          <Ionicons name={MODE_ICONS[mode]} size={24} color={modeColor} />
                        </View>
                        <Text style={styles.paymentModeLabel}>{MODE_NAMES[mode]}</Text>
                      </View>
                      <View style={styles.paymentModeRight}>
                        {selectedMode === mode && (
                          <Ionicons name="checkmark-circle" size={20} color={modeColor} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* Amount Input */}
            <Animated.View entering={FadeInDown.delay(120).springify()}>
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
                </View>
              </View>
            </Animated.View>

            {/* Sale ID (Optional - for linking to specific sale) */}
            <Animated.View entering={FadeInDown.delay(180).springify()}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sale ID (Optional)</Text>
                <TextInput
                  style={[styles.remarksInput, { borderColor: colors.border }]}
                  value={saleId}
                  onChangeText={setSaleId}
                  placeholder="Enter sale ID to link payment"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </Animated.View>

            {/* Remarks */}
            <Animated.View entering={FadeInDown.delay(240).springify()}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reference / Remarks (Optional)</Text>
                <TextInput
                  style={[styles.remarksInput, { borderColor: colors.border }]}
                  value={paymentDetails}
                  onChangeText={setPaymentDetails}
                  placeholder="Add cheque number, transaction ID, or any remarks"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </Animated.View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom Button */}
        <View style={[styles.modalBottomBar, { paddingBottom: insets.bottom || 16 }]}>
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
                {!isValidAmount ? 'Enter amount' : `Collect ${currency} ${parsedAmount.toFixed(2)}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </AppModal>

      {/* Confirmation Modal */}
      <AppModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Payment"
        size="sm"
        position="center"
        animation="scale"
        showCloseButton={true}
      >
        <View style={{ padding: 16, gap: 16 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.success + '15',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            </View>
            <AppText style={{ fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
              Confirm Payment
            </AppText>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ color: colors.textSecondary }}>Customer</AppText>
              <AppText style={{ fontWeight: '600' }}>{outlet?.name}</AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ color: colors.textSecondary }}>Amount</AppText>
              <AppText style={{ fontWeight: '700', color: colors.success }}>
                {currency} {parsedAmount.toFixed(2)}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText style={{ color: colors.textSecondary }}>Payment Method</AppText>
              <AppText style={{ fontWeight: '600' }}>{MODE_NAMES[selectedMode]}</AppText>
            </View>
            {saleId ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText style={{ color: colors.textSecondary }}>Sale ID</AppText>
                <AppText style={{ fontSize: 12 }}>{saleId}</AppText>
              </View>
            ) : null}
            {paymentDetails ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText style={{ color: colors.textSecondary }}>Reference</AppText>
                <AppText style={{ flex: 1, textAlign: 'right', fontSize: 12 }}>
                  {paymentDetails}
                </AppText>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowConfirm(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.textSecondary }}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={processPayment}
              style={{
                flex: 2,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: colors.success,
                alignItems: 'center',
              }}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <AppText style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm Payment</AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AppModal>
    </>
  );
};
