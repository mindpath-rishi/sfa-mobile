import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Card } from '@/core/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerOutstandingStyles } from '../styles/Outstanding.styles';
import Animated, { FadeInDown, FadeIn, SlideInDown } from 'react-native-reanimated';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LastTransaction {
  date: string; // 'NOT YET COLLECTED' or formatted date string
  invoiceAmount: number;
  collected: number;
}

interface Invoice {
  id: string;
  date: string;
  invoiceNo: string;
  outstandingAmount: number;
  lastTransaction: LastTransaction | null;
}

interface Outstanding {
  customerId: string;
  customerName: string;
  outstandingBalance: number;
  creditBalance: number;
  creditLimit: number | null;
  creditDays: number | null;
  totalCreditInvoices: number | null;
  currency: string;
  invoices: Invoice[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_OUTSTANDING: Outstanding = {
  customerId: '7699',
  customerName: 'John Shop',
  outstandingBalance: 4825.92,
  creditBalance: 0,
  creditLimit: null,
  creditDays: null,
  totalCreditInvoices: null,
  currency: 'ZMW',
  invoices: [
    {
      id: '1',
      date: '21 Oct 2025',
      invoiceNo: '996/25-26/100030',
      outstandingAmount: 39.17,
      lastTransaction: {
        date: 'NOT YET COLLECTED',
        invoiceAmount: 39.17,
        collected: 0,
      },
    },
    {
      id: '2',
      date: '09 Oct 2025',
      invoiceNo: '098/25-26/100857',
      outstandingAmount: 840.0,
      lastTransaction: {
        date: '09-Oct-2025',
        invoiceAmount: 840.0,
        collected: 0,
      },
    },
    {
      id: '3',
      date: '25 Sep 2025',
      invoiceNo: '098/25-26/100719',
      outstandingAmount: 2905.0,
      lastTransaction: {
        date: '25-Sep-2025',
        invoiceAmount: 2905.0,
        collected: 0,
      },
    },
    {
      id: '4',
      date: '04 Sep 2025',
      invoiceNo: '098/25-26/100498',
      outstandingAmount: 783.75,
      lastTransaction: null,
    },
  ],
};

// ─── InvoiceCard ──────────────────────────────────────────────────────────────

interface InvoiceCardProps {
  invoice: Invoice;
  currency: string;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  currency,
  index,
  isSelected,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = useCustomerOutstandingStyles();

  const isNotYetCollected = invoice.lastTransaction?.date === 'NOT YET COLLECTED';

  const uncollectedAmount = invoice.lastTransaction
    ? invoice.lastTransaction.invoiceAmount - invoice.lastTransaction.collected
    : null;

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        <View
          style={[
            styles.invoiceCard,
            isSelected && {
              borderColor: colors.primary,
              borderWidth: 1.5,
              backgroundColor: colors.primary + '06',
            },
          ]}
        >
          {/* ── Top row: date + invoice number + amount ── */}
          <View style={styles.invoiceTopRow}>
            <View style={styles.invoiceMeta}>
              <Text style={styles.invoiceDate}>{invoice.date}</Text>
              <Text style={styles.invoiceNo}>{invoice.invoiceNo}</Text>
            </View>
            <View style={styles.invoiceAmountCol}>
              <Text style={[styles.invoiceAmount, { color: colors.primary }]}>
                {currency} {invoice.outstandingAmount.toFixed(2)}
              </Text>
              <Text style={styles.invoiceAmountLabel}>outstanding</Text>
            </View>
          </View>

          {/* ── Last transaction panel ── */}
          {invoice.lastTransaction ? (
            <View style={[styles.transactionPanel, { backgroundColor: colors.surface }]}>
              <View style={styles.transactionPanelRow}>
                <Text style={styles.transactionPanelLabel}>Last transaction</Text>
                {isNotYetCollected ? (
                  <View
                    style={[styles.notCollectedBadge, { backgroundColor: colors.warning + '18' }]}
                  >
                    <Ionicons name="time-outline" size={11} color={colors.warning} />
                    <Text style={[styles.notCollectedBadgeText, { color: colors.warning }]}>
                      Not yet collected
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.transactionDate}>{invoice.lastTransaction.date}</Text>
                )}
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.transactionDetailItem}>
                  <Text style={styles.transactionDetailLabel}>Invoice amt</Text>
                  <Text style={styles.transactionDetailValue}>
                    {currency} {invoice.lastTransaction.invoiceAmount.toFixed(2)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.transactionDetailDivider,
                    { backgroundColor: colors.border + '30' },
                  ]}
                />
                <View style={styles.transactionDetailItem}>
                  <Text style={styles.transactionDetailLabel}>Collected</Text>
                  <Text
                    style={[
                      styles.transactionDetailValue,
                      invoice.lastTransaction.collected > 0 && { color: colors.success },
                    ]}
                  >
                    {currency} {invoice.lastTransaction.collected.toFixed(2)}
                  </Text>
                </View>
                {uncollectedAmount !== null && uncollectedAmount > 0 && (
                  <>
                    <View
                      style={[
                        styles.transactionDetailDivider,
                        { backgroundColor: colors.border + '30' },
                      ]}
                    />
                    <View style={styles.transactionDetailItem}>
                      <Text style={styles.transactionDetailLabel}>Balance</Text>
                      <Text style={[styles.transactionDetailValue, { color: colors.primary }]}>
                        {currency} {uncollectedAmount.toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={[styles.noTransactionPanel, { backgroundColor: colors.surface }]}>
              <Ionicons name="receipt-outline" size={14} color={colors.textTertiary} />
              <Text style={styles.noTransactionText}>No transaction history</Text>
            </View>
          )}

          {/* ── Selection indicator ── */}
          <View style={styles.invoiceFooter}>
            <View
              style={[
                styles.selectIndicator,
                isSelected
                  ? { backgroundColor: colors.primary }
                  : { borderWidth: 1.5, borderColor: colors.border + '60' },
              ]}
            >
              {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text
              style={[
                styles.selectLabel,
                { color: isSelected ? colors.primary : colors.textTertiary },
              ]}
            >
              {isSelected ? 'Selected for payment' : 'Tap to select'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── CustomerOutstandingScreen ────────────────────────────────────────────────

export default function CustomerOutstandingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useCustomerOutstandingStyles();
  const params = useLocalSearchParams();

  const [outstanding] = useState<Outstanding>(MOCK_OUTSTANDING);
  // Allow multi-select; user picks which invoices to pay
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedInvoices = useMemo(
    () => outstanding.invoices.filter((inv) => selectedIds.has(inv.id)),
    [outstanding.invoices, selectedIds],
  );

  const selectedTotal = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0),
    [selectedInvoices],
  );

  const handleProceed = () => {
    if (selectedIds.size === 0) return;

    // Single invoice: navigate directly
    if (selectedIds.size === 1) {
      const invoice = selectedInvoices[0];
      router.push({
        pathname: '/checkin/collection',
        params: {
          invoiceNo: invoice.invoiceNo,
          date: invoice.date,
          outstandingAmount: invoice.outstandingAmount.toString(),
          currency: outstanding.currency,
          customerId: outstanding.customerId,
          customerName: outstanding.customerName,
        },
      });
      return;
    }

    // Multiple invoices: pass a serialised list
    router.push({
      pathname: '/payments/collection',
      params: {
        invoiceIds: selectedInvoices.map((i) => i.id).join(','),
        totalAmount: selectedTotal.toString(),
        currency: outstanding.currency,
        customerId: outstanding.customerId,
        customerName: outstanding.customerName,
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Security notice ── */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View
            style={[
              styles.securityBanner,
              { borderColor: colors.warning + '35', backgroundColor: colors.warning + '0C' },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.warning} />
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>
              Stay in the app during payment to keep your transaction secure.
            </Text>
          </View>
        </Animated.View>

        {/* ── Balance card ── */}
        <Animated.View entering={FadeInDown.delay(40).springify()}>
          <Card variant="elevated" padding="md" style={styles.balanceCard}>
            <View style={styles.balanceMain}>
              <View>
                <Text style={styles.balanceLabel}>Outstanding balance</Text>
                <Text style={[styles.balanceValue, { color: colors.primary }]}>
                  {outstanding.currency} {outstanding.outstandingBalance.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.exhaustedBadge, { backgroundColor: colors.primary + '12' }]}>
                <Text style={[styles.exhaustedBadgeText, { color: colors.primary }]}>
                  Credit exhausted
                </Text>
              </View>
            </View>

            <View style={[styles.creditRow, { borderTopColor: colors.border + '25' }]}>
              <View style={styles.creditItem}>
                <Text style={styles.creditItemLabel}>Credit balance</Text>
                <Text style={styles.creditItemValue}>
                  {outstanding.currency} {outstanding.creditBalance.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.creditDivider, { backgroundColor: colors.border + '30' }]} />
              <View style={styles.creditItem}>
                <Text style={styles.creditItemLabel}>Credit limit</Text>
                <Text style={styles.creditItemValue}>
                  {outstanding.creditLimit != null
                    ? `${outstanding.currency} ${outstanding.creditLimit}`
                    : 'Not set'}
                </Text>
              </View>
              <View style={[styles.creditDivider, { backgroundColor: colors.border + '30' }]} />
              <View style={styles.creditItem}>
                <Text style={styles.creditItemLabel}>Credit days</Text>
                <Text style={styles.creditItemValue}>{outstanding.creditDays ?? 'Not set'}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* ── Invoices header ── */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.invoicesHeader}>
          <View>
            <Text style={styles.invoicesTitle}>Invoices</Text>
            <Text style={styles.invoicesSubtitle}>
              {outstanding.invoices.length} unpaid · select to pay
            </Text>
          </View>
          {selectedIds.size > 0 && (
            <TouchableOpacity onPress={() => setSelectedIds(new Set())} activeOpacity={0.7}>
              <Text style={[styles.clearSelection, { color: colors.primary }]}>Clear</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* ── Invoice cards ── */}
        {outstanding.invoices.map((invoice, index) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            currency={outstanding.currency}
            index={index}
            isSelected={selectedIds.has(invoice.id)}
            onPress={() => toggleSelect(invoice.id)}
          />
        ))}
      </ScrollView>

      {/* ── Bottom bar ── */}
      <Animated.View
        entering={SlideInDown.springify()}
        style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}
      >
        {selectedIds.size > 0 && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.selectionSummary}>
            <Text style={styles.selectionSummaryLabel}>
              {selectedIds.size} invoice{selectedIds.size > 1 ? 's' : ''} selected
            </Text>
            <Text style={[styles.selectionSummaryAmount, { color: colors.primary }]}>
              {outstanding.currency} {selectedTotal.toFixed(2)}
            </Text>
          </Animated.View>
        )}
        <TouchableOpacity
          style={[
            styles.proceedButton,
            {
              backgroundColor: selectedIds.size > 0 ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.85}
          onPress={handleProceed}
          disabled={selectedIds.size === 0}
        >
          <Text style={styles.proceedButtonText}>
            {selectedIds.size > 0
              ? `Proceed to payment · ${outstanding.currency} ${selectedTotal.toFixed(2)}`
              : 'Select an invoice above'}
          </Text>
          {selectedIds.size > 0 && <Ionicons name="arrow-forward" size={18} color="white" />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
