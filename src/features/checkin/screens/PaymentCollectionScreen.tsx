import React, { useCallback, useRef, useState } from 'react';
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
  StyleSheet,
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
import { useRouteStore } from '@/core/store/route.store';
import { saleService } from '@/shared/services/sale.service';
import { outletService } from '@/features/outlet/services/outlet.service';
import { useAuthStore } from '@/core/store/auth.store';
import { toast } from '@/core/utils';
import { AppModal, ConfirmationModal } from '@/core/components';
import { FlatList } from 'react-native-gesture-handler';

type PaymentMode = 'cash' | 'wallet' | 'card' | 'cheque' | 'credit' | 'split';

interface CreditInfo {
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  paymentTerms?: string;
}

interface SplitPaymentItem {
  id: string;
  mode: Exclude<PaymentMode, 'split'>;
  amount: number;
}

interface SplitPayment {
  creditAmount: number;
  otherPayments: SplitPaymentItem[];
}

interface SplitPaymentModalProps {
  visible: boolean;
  orderTotal: number;
  availableCredit: number;
  currency: string;
  onConfirm: (creditAmount: number, payments: SplitPaymentItem[]) => void;
  onCancel: () => void;
}

// Constants for Split Payment Modal
const ALL_MODES: Array<Exclude<PaymentMode, 'split'>> = [
  'cash',
  'wallet',
  'card',
  'cheque',
  'credit',
];
const MODE_ICONS: any = {
  cash: 'cash-outline',
  wallet: 'wallet-outline',
  card: 'card-outline',
  cheque: 'document-text-outline',
  credit: 'business-outline',
};
const MODE_NAMES: any = {
  cash: 'Cash',
  wallet: 'Wallet',
  card: 'Card',
  cheque: 'Cheque',
  credit: 'Credit',
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// ─── Component ────────────────────────────────────────────────────────────────

const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  visible,
  orderTotal,
  availableCredit,
  currency,
  onConfirm,
  onCancel,
}) => {
  const { colors } = useTheme();

  const [payments, setPayments] = useState<SplitPaymentItem[]>([
    { id: '1', mode: 'cash', amount: orderTotal },
  ]);

  const [modePickerRow, setModePickerRow] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────

  const totalPaid = round2(payments.reduce((s, p) => s + p.amount, 0));
  const remainingToPay = round2(Math.max(0, orderTotal - totalPaid));
  const totalCreditUsed = round2(
    payments.filter((p) => p.mode === 'credit').reduce((s, p) => s + p.amount, 0),
  );
  const creditRemaining = round2(Math.max(0, availableCredit - totalCreditUsed));

  const modesUsedByOthers = (selfId: string) =>
    payments.filter((p) => p.id !== selfId).map((p) => p.mode);

  const availableModesFor = (selfId: string): PaymentMode[] =>
    ALL_MODES.filter((m) => !modesUsedByOthers(selfId).includes(m));

  const nextAvailableMode = (): PaymentMode | null =>
    ALL_MODES.find((m) => !payments.map((p) => p.mode).includes(m)) ?? null;

  // ─── Amount update ────────────────────────────────────────────────────────

  const updatePaymentAmount = useCallback(
    (id: string, amountStr: string) => {
      setPayments((prev) => {
        const cloned = prev.map((p) => ({ ...p }));
        const idx = cloned.findIndex((p) => p.id === id);
        if (idx === -1) return prev;

        let val = parseFloat(amountStr);
        if (isNaN(val) || val < 0) val = 0;

        const isLast = idx === cloned.length - 1;
        const isCreditRow = cloned[idx].mode === 'credit';

        // Enforce credit cap
        if (isCreditRow && availableCredit > 0) {
          const otherCredit = cloned
            .filter((p, i) => i !== idx && p.mode === 'credit')
            .reduce((s, p) => s + p.amount, 0);
          val = round2(Math.min(val, Math.max(0, availableCredit - otherCredit)));
        }

        if (isLast || cloned.length === 1) {
          // Last / only row: clamp to what rows above leave
          const othersTotal = cloned.filter((p) => p.id !== id).reduce((s, p) => s + p.amount, 0);
          cloned[idx].amount = round2(Math.min(val, Math.max(0, orderTotal - othersTotal)));
        } else {
          // Non-last row: set value, last row absorbs remainder
          const othersExceptLast = cloned
            .filter((_, i) => i !== idx && i !== cloned.length - 1)
            .reduce((s, p) => s + p.amount, 0);
          cloned[idx].amount = round2(Math.min(val, Math.max(0, orderTotal - othersExceptLast)));

          const allButLast = cloned.slice(0, -1).reduce((s, p) => s + p.amount, 0);
          cloned[cloned.length - 1].amount = round2(Math.max(0, orderTotal - allButLast));
        }

        return cloned;
      });
    },
    [availableCredit, orderTotal],
  );

  // ─── Mode select ──────────────────────────────────────────────────────────

  const selectMode = useCallback(
    (rowId: string, mode: PaymentMode) => {
      if (payments.find((p) => p.id !== rowId && p.mode === mode)) {
        setModePickerRow(null);
        return;
      }

      if (mode === 'credit' && availableCredit > 0) {
        const currentAmount = payments.find((p) => p.id === rowId)?.amount ?? 0;
        const otherCreditUsed = payments
          .filter((p) => p.id !== rowId && p.mode === 'credit')
          .reduce((s, p) => s + p.amount, 0);

        if (currentAmount + otherCreditUsed > availableCredit) {
          setPayments((prev) =>
            prev.map((p) => {
              if (p.id !== rowId) return p;
              const maxForRow = round2(Math.max(0, availableCredit - otherCreditUsed));
              return { ...p, mode, amount: Math.min(p.amount, maxForRow) };
            }),
          );
          setModePickerRow(null);
          return;
        }
      }

      setPayments((prev: any) => prev.map((p) => (p.id === rowId ? { ...p, mode } : p)));
      setModePickerRow(null);
    },
    [payments, availableCredit],
  );

  // ─── Add / remove rows ───────────────────────────────────────────────────

  const addPaymentMethod = useCallback(() => {
    if (payments.length >= ALL_MODES.length) {
      Alert.alert('Limit Reached', `Maximum ${ALL_MODES.length} payment methods allowed`);
      return;
    }
    const mode = nextAvailableMode();
    if (!mode) return;
    setPayments((prev: any) => [...prev, { id: Date.now().toString(), mode, amount: 0 }]);
    // Scroll to bottom after adding
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [payments]);

  const removePaymentMethod = useCallback(
    (id: string) => {
      if (payments.length === 1) return;
      setPayments((prev) => {
        const filtered = prev.filter((p) => p.id !== id).map((p) => ({ ...p }));
        const allButLast = filtered.slice(0, -1).reduce((s, p) => s + p.amount, 0);
        filtered[filtered.length - 1].amount = round2(Math.max(0, orderTotal - allButLast));
        return filtered;
      });
    },
    [payments, orderTotal],
  );

  // ─── Validation ──────────────────────────────────────────────────────────

  const creditExceeded = availableCredit > 0 && totalCreditUsed > availableCredit;
  const totalMismatch = Math.abs(totalPaid - orderTotal) > 0.01;
  const isValid = !creditExceeded && !totalMismatch && totalPaid > 0;

  const handleConfirm = () => {
    if (!isValid) {
      if (creditExceeded) {
        Alert.alert(
          'Credit Exceeded',
          `Credit used (${currency}${totalCreditUsed.toFixed(2)}) exceeds limit (${currency}${availableCredit.toFixed(2)})`,
        );
      } else {
        Alert.alert(
          'Amount Mismatch',
          `Total (${currency}${totalPaid.toFixed(2)}) must equal order total (${currency}${orderTotal.toFixed(2)})`,
        );
      }
      return;
    }
    onConfirm(
      0,
      payments.map((p) => ({ ...p, amount: round2(p.amount) })).filter((p) => p.amount > 0),
    );
  };

  const canAddMore = payments.length < ALL_MODES.length && !!nextAvailableMode();

  // ─── Mode Picker Modal ───────────────────────────────────────────────────

  const activeRow = payments.find((p) => p.id === modePickerRow);
  const pickerModes = modePickerRow ? availableModesFor(modePickerRow) : [];

  const ModePicker = (
    <AppModal
      visible={!!modePickerRow}
      onClose={() => setModePickerRow(null)}
      animation="scale"
      size="xs"
      position="center"
      showCloseButton
      closeOnBackdropPress
      showHeader={false}
    >
      <AppModal.Header title="Payment Method" />
      <AppModal.Content>
        <FlatList
          data={pickerModes}
          keyExtractor={(m) => m}
          scrollEnabled={false}
          renderItem={({ item: mode, index }) => {
            const isSelected = activeRow?.mode === mode;
            const isCredit = mode === 'credit' && availableCredit > 0;
            const isLast = index === pickerModes.length - 1;

            return (
              <TouchableOpacity
                onPress={() => modePickerRow && selectMode(modePickerRow, mode)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isSelected ? colors.primary + '18' : colors.background,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons
                    name={MODE_ICONS[mode]}
                    size={18}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: isSelected ? '600' : '400',
                      color: isSelected ? colors.primary : colors.textPrimary,
                    }}
                  >
                    {MODE_NAMES[mode]}
                  </Text>
                  {isCredit && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                      Available: {currency}
                      {creditRemaining.toFixed(2)}
                    </Text>
                  )}
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </AppModal.Content>
    </AppModal>
  );

  // ─── Render Content with ScrollView ───────────────────────────────────────

  if (!visible) return null;

  return (
    <>
      <AppModal
        visible={visible}
        onClose={onCancel}
        animation="slide"
        swipeDirection="up"
        size="lg"
        position="bottom"
        showCloseButton={false}
        closeOnBackdropPress={false}
        scrollable={false} // IMPORTANT: Set to false to use our own ScrollView
        contentStyle={{ padding: 0, flex: 1 }}
      >
        <AppModal.Header title="Split Payment" />

        {/* Use our own ScrollView for scrolling content */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View style={{ padding: 16, gap: 12 }}>
            {/* ── Credit info banner ── */}
            {availableCredit > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: 12,
                  backgroundColor: colors.primary + '10',
                  borderRadius: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.primary,
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={colors.primary}
                  style={{ marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                    Credit Limit: {currency}
                    {availableCredit.toFixed(2)}
                  </Text>
                  {totalCreditUsed > 0 && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>
                      Used: {currency}
                      {totalCreditUsed.toFixed(2)}
                      {'  ·  '}
                      Remaining: {currency}
                      {creditRemaining.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* ── Credit exceeded warning ── */}
            {creditExceeded && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  backgroundColor: colors.error + '10',
                  borderRadius: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.error,
                }}
              >
                <Ionicons name="warning-outline" size={18} color={colors.error} />
                <Text style={{ flex: 1, fontSize: 13, color: colors.error }}>
                  Credit exceeded by {currency}
                  {round2(totalCreditUsed - availableCredit).toFixed(2)}
                </Text>
              </View>
            )}

            {/* ── Order total chip ── */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: colors.background,
                borderRadius: 10,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
                Order Total
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                {currency}
                {orderTotal.toFixed(2)}
              </Text>
            </View>

            {/* ── Payment rows ── */}
            {payments.map((payment, index) => {
              const isLast = index === payments.length - 1;
              const hasMultiple = payments.length > 1;
              const isCreditRow = payment.mode === 'credit';
              const isAutoRow = isLast && hasMultiple;

              return (
                <View
                  key={payment.id}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor:
                      isCreditRow && creditExceeded
                        ? colors.error
                        : isAutoRow
                          ? colors.border
                          : colors.border,
                    backgroundColor: colors.surface,
                    overflow: 'hidden',
                  }}
                >
                  {/* Row header */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 12,
                      paddingTop: 10,
                      paddingBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: colors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.6,
                      }}
                    >
                      Method {index + 1}
                      {isAutoRow ? '  ·  auto' : ''}
                    </Text>
                    {hasMultiple && (
                      <TouchableOpacity
                        onPress={() => removePaymentMethod(payment.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color={colors.error + 'CC'} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Mode + Amount row */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingHorizontal: 12,
                      paddingBottom: 12,
                    }}
                  >
                    {/* Mode selector */}
                    <TouchableOpacity
                      onPress={() => setModePickerRow(payment.id)}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: colors.primary + '15',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons
                          name={MODE_ICONS[payment.mode]}
                          size={15}
                          color={colors.primary}
                        />
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: '500',
                          color: colors.textPrimary,
                        }}
                      >
                        {MODE_NAMES[payment.mode]}
                        {isCreditRow && availableCredit > 0
                          ? `\n${currency}${creditRemaining.toFixed(2)} left`
                          : ''}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Amount input */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: 110,
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        backgroundColor: isAutoRow ? colors.background : colors.background,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isCreditRow && creditExceeded ? colors.error : colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 13, color: colors.textSecondary, marginRight: 2 }}>
                        {currency}
                      </Text>
                      <TextInput
                        style={{
                          flex: 1,
                          fontSize: 15,
                          fontWeight: '600',
                          color: isAutoRow ? colors.textSecondary : colors.textPrimary,
                          padding: 0,
                        }}
                        value={payment.amount === 0 ? '' : payment.amount.toString()}
                        onChangeText={(v) => updatePaymentAmount(payment.id, v)}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={colors.textTertiary}
                        editable={!isAutoRow}
                      />
                    </View>
                  </View>

                  {/* Sub-labels */}
                  {(isAutoRow || (isCreditRow && payment.amount > 0 && !creditExceeded)) && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 12,
                        paddingBottom: 8,
                      }}
                    >
                      <Ionicons
                        name={isAutoRow ? 'sync-outline' : 'checkmark-circle-outline'}
                        size={12}
                        color={isAutoRow ? colors.textTertiary : colors.success}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          color: isAutoRow ? colors.textTertiary : colors.success,
                        }}
                      >
                        {isAutoRow ? 'Auto-fills from remaining balance' : 'Within credit limit'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* ── Add method ── */}
            {canAddMore && (
              <TouchableOpacity
                onPress={addPaymentMethod}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 13,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.primary + '80',
                }}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                  Add Payment Method
                </Text>
              </TouchableOpacity>
            )}

            {/* ── Summary ── */}
            <View
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 20,
              }}
            >
              {/* Summary header */}
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: colors.background,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                  }}
                >
                  Summary
                </Text>
              </View>

              <View style={{ padding: 14, gap: 8 }}>
                {payments
                  .filter((p) => p.amount > 0)
                  .map((p, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name={MODE_ICONS[p.mode]} size={14} color={colors.textSecondary} />
                      <Text style={{ flex: 1, fontSize: 13, color: colors.textSecondary }}>
                        {MODE_NAMES[p.mode]}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>
                        {currency}
                        {p.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}

                <View
                  style={{
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: colors.border,
                    marginVertical: 4,
                  }}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.textPrimary }}
                  >
                    Total
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: isValid ? colors.success : colors.error,
                    }}
                  >
                    {currency}
                    {totalPaid.toFixed(2)}
                  </Text>
                </View>

                {/* Remaining chip */}
                {remainingToPay > 0.01 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: colors.warning + '15',
                      borderRadius: 8,
                      marginTop: 4,
                    }}
                  >
                    <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                    <Text style={{ fontSize: 12, color: colors.warning, fontWeight: '500' }}>
                      Still to pay: {currency}
                      {remainingToPay.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        <AppModal.Footer style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={onCancel}
            style={{
              flex: 1,
              paddingVertical: 13,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: colors.border,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!isValid}
            activeOpacity={0.8}
            style={{
              flex: 2,
              paddingVertical: 13,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: isValid ? colors.primary : colors.border,
              ...Platform.select({
                ios: isValid
                  ? {
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                    }
                  : {},
                // android: isValid ? { elevation: 4 } : {},
              }),
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: isValid ? '#fff' : colors.textSecondary,
                letterSpacing: 0.2,
              }}
            >
              Confirm Split
            </Text>
          </TouchableOpacity>
        </AppModal.Footer>
      </AppModal>

      {/* Mode picker sits outside the main modal so it layers above it */}
      {ModePicker}
    </>
  );
};

export default function PaymentCollectionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = usePaymentCollectionStyles();

  const outlet = useOutletStore((s) => s.selectedOutlet);
  const { items, getCartSummary, clearCart } = useCartStore();
  const van = useRouteStore.getState().van;
  const user = useAuthStore((s) => s.user);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false);
  const activeVisit = useOutletStore.getState().activeVisit;

  const { total: orderTotal, totalNetWeight, caseDetails, pieceDetails } = getCartSummary();

  // const params = useLocalSearchParams<{
  //   customerName?: string;
  //   reference?: string;
  //   currency?: string;
  // }>();

  // const customerName = params.customerName || outlet?.name || 'Customer';
  // const reference = params.reference || `ORD-${Date.now()}`;
  const currency = 'K';

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

      // Alert.alert(
      //   'Confirm Credit Sale',
      //   `This will add ${currency}${orderTotal.toFixed(2)} to customer's outstanding balance.\n\nAvailable credit after this sale: ${currency}${(creditInfo.availableCredit - orderTotal).toFixed(2)}`,
      //   [
      //     { text: 'Cancel', style: 'cancel' },
      //     { text: 'Proceed', onPress: () => processPayment() },
      //   ],
      // );
      // return;
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
    setIsSubmitting(true);

    const toFixed4 = (val: number) => Number((val || 0).toFixed(4));
    const totalValue = toFixed4(orderTotal);

    let paidAmount = 0;
    let pendingAmount = totalValue;
    let saleType = 'CASH';
    let paymentMode = selectedMode.toUpperCase();
    let creditAmountUsed = 0;
    let otherPaymentsList: SplitPaymentItem[] = [];

    // Handle split payment with multiple modes
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
    }
    // Handle full credit sale
    else if (isCreditSelected) {
      paidAmount = 0;
      pendingAmount = totalValue;
      saleType = 'CREDIT';
      paymentMode = 'CREDIT';
    }
    // Handle regular payment
    else {
      paidAmount = toFixed4(parsedAmount);
      pendingAmount = toFixed4(totalValue - paidAmount);
      saleType = pendingAmount > 0 ? 'CREDIT' : 'CASH';
      paymentMode = selectedMode.toUpperCase();
    }

    const saleItems = items.map((item) => {
      const caseQty = item.caseQty || 0;
      const pieceQty = item.pieceQty || 0;
      const unitQtyInCase = item.unitQtyInCase || 1;

      return {
        productId: item.productId,
        productName: item.productName,
        caseQty,
        pieceQty,
        quantity: caseQty * unitQtyInCase + pieceQty,
        unitQtyInCase,
        casePrice: item.casePrice,
        caseNetWeight: item.caseNetWeight,
        pieceNetWeight: item.pieceNetWeight,
        piecePrice: item.piecePrice,
      };
    });

    const totalQty = items.reduce((sum, item) => {
      const caseQty = item.caseQty || 0;
      const pieceQty = item.pieceQty || 0;
      const unitQtyInCase = item.unitQtyInCase || 1;
      return sum + caseQty * unitQtyInCase + pieceQty;
    }, 0);

    // Build remark with all payment details
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

    const payload: any = {
      vanId: van?.vanId,
      vanName: van?.vanNumber || 'Van',
      customerId: outlet?.customerId,
      customerName: outlet?.name || 'test',
      employeeId: user?.userId,
      employeeName: user?.name,
      date: new Date().toISOString(),
      totalCases: caseDetails.totalCases,
      totalPieces: pieceDetails.totalPieces,
      totalQty,
      totalNetWeight: toFixed4(totalNetWeight),
      totalValue,
      type: saleType,
      paymentMode,
      paidAmount,
      pendingAmount,
      remark: remarkText,
      items: saleItems,
      visitId: activeVisit?.visitId,
    };

    // Add split payment details if applicable
    if (isSplitPayment && creditAmountUsed > 0) {
      payload.splitPayment = {
        creditAmount: creditAmountUsed,
        otherPayments: otherPaymentsList,
      };
    }

    const response = await saleService.createSale(payload);

    setIsSubmitting(false);
    setShowConfirm(false);

    if (!response?.success) return;

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

    // Prepare invoice data
    const invoiceData = {
      id: saleId,
      invoiceNumber: saleId,
      customer: outlet?.name,
      customerId: outlet?.customerId,
      date: new Date().toLocaleDateString(),
      dateTime: new Date().toISOString(),
      amount: totalValue,
      currency: currency,
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
        totalQty: totalQty,
        totalNetWeight: toFixed4(totalNetWeight),
        subtotal: toFixed4(orderTotal),
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
      paymentDetails: paymentDetails,
      reference: `ORD-${Date.now()}`,
      status: pendingAmount > 0 ? (paidAmount > 0 ? 'PARTIAL' : 'CREDIT') : 'PAID',
    };

    clearCart();

    // Auto-close the visit after successful sale
    if (activeVisit?.visitId) {
      try {
        await outletService.completeVisit(activeVisit.visitId);
        const setActiveVisit = useOutletStore.getState().setActiveVisit;
        setActiveVisit(null);
      } catch (error) {
        console.error('Error completing visit:', error);
      }
    }

    router.push({
      pathname: '/checkin/shareinvoice',
      params: {
        invoice: JSON.stringify(invoiceData),
      },
    });
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.customerName}>{outlet?.name}</Text>
              <Text style={styles.orderRef}>
                {outlet.address?.line1}, {outlet?.address?.line2}
              </Text>
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

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount Due</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {currency} {orderTotal.toFixed(2)}
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
                <TouchableOpacity onPress={handleSetFullAmount} style={styles.fullAmountButton}>
                  <Text style={[styles.fullAmountText, { color: colors.primary }]}>
                    Full Amount
                  </Text>
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
                      ? `Pay Full Amount ${currency} ${amountDue.toFixed(2)}`
                      : `Pay ${currency} ${parsedAmount.toFixed(2)}`}
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
