/**
 * Split a sale's payment across several payment modes.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppModal } from '@/core/components';
import { FlatList } from 'react-native-gesture-handler';

export type PaymentMode = 'cash' | 'wallet' | 'card' | 'cheque' | 'credit' | 'split';

export interface CreditInfo {
  creditLimit: number;
  outstandingBalance: number;
  availableCredit: number;
  paymentTerms?: string;
}

export interface SplitPaymentItem {
  id: string;
  mode: Exclude<PaymentMode, 'split'>;
  amount: number;
}

export interface SplitPayment {
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

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
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
