import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CommonListing } from '@/shared/components/CommonListing';
import { AppText } from '@/core/components';
import { IconTile } from '@/shared/components/IconTile';
import { StatusChip } from '@/shared/components/StatusChip';
import { formatCurrency, formatDateSafe } from '@/shared/utils/currenty.utils';
import { useTheme } from '@/shared/hooks/useTheme';

import { PaymentItem, PaymentListProps } from '../types/payment.types';
import { usePaymentsListStyles } from '../styles/paymentList.styles';
import { getStatusConfig } from '../units/payments.utils';



/**
 * PaymentsList Component
 * 
 * Displays a searchable, filterable list of payment transactions with:
 * - Payment mode icons and status badges
 * - Transaction details (amount, date, reference)
 * - Pull-to-refresh and infinite scroll
 * - Empty states with contextual messaging
 */
export const PaymentsList: React.FC<PaymentListProps> = ({
  data,
  loading,
  refreshing,
  onRefresh,
  onEndReached,
  searchQuery,
  setSearchQuery,
  filterChips,
  clearAllFilters,
  activeFilterCount,
}) => {
  const { colors } = useTheme();
  const styles = usePaymentsListStyles();

  /**
   * Payment Mode Icon Mapping
   */
  const getPaymentModeIcon = (mode: string): string => {
    const iconMap: Record<string, string> = {
      CASH: 'cash-outline',
      CARD: 'card-outline',
      CHEQUE: 'document-outline',
      BANK_TRANSFER: 'business-outline',
      UPI: 'phone-portrait-outline',
      MOBILE_MONEY: 'phone-outline',
    };
    return iconMap[mode] || 'cash-outline';
  };

  /**
   * Payment Mode Color Mapping
   * Each mode has a distinct color for visual differentiation
   */
  const getPaymentModeColor = (mode: string): string => {
    const colorMap: Record<string, string> = {
      CASH: '#10B981',      // Emerald
      CARD: '#8B5CF6',      // Violet
      CHEQUE: '#3B82F6',    // Blue
      BANK_TRANSFER: '#EC4899', // Pink
      UPI: '#F59E0B',       // Amber
      MOBILE_MONEY: '#06B6D4', // Cyan
    };
    return colorMap[mode] || colors.primary;
  };

  /**
   * Render payment item card
   */
  const renderPaymentCard = (item: PaymentItem) => {
    const statusConfig = getStatusConfig(item.status);
    const paymentModeColor = getPaymentModeColor(item.paymentMode);

    return {
      title: (
        <AppText style={styles.title}>
          {item.customerName || item.customerId}
        </AppText>
      ),

      leading: (
        <IconTile
          icon={getPaymentModeIcon(item.paymentMode) as any}
          color={paymentModeColor}
        />
      ),

      headerRight: (
        <StatusChip
          label={statusConfig.label}
          color={statusConfig.color}
          backgroundColor={statusConfig.bg}
        />
      ),

      subtitle: (
        <AppText style={styles.subtitle}>{item.paymentId}</AppText>
      ),

      subtitleRight: (
        <AppText style={styles.amount}>{formatCurrency(item.amount)}</AppText>
      ),

      children: (
        <View style={styles.metaContainer}>
          {/* Payment Mode */}
          <View style={styles.metaItem}>
            <Ionicons
              name="card-outline"
              size={styles.metaIcon.size}
              color={styles.metaIcon.color}
            />
            <AppText style={styles.metaText}>
              {String(item.paymentMode).replace('_', ' ')}
            </AppText>
          </View>

          {/* Transaction Date */}
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={styles.metaIcon.size}
              color={styles.metaIcon.color}
            />
            <AppText style={styles.metaText}>
              {formatDateSafe(item.date)}
            </AppText>
          </View>

          {/* Reference Number (conditional) */}
          {item.referenceNo && (
            <View style={styles.metaItem}>
              <Ionicons
                name="receipt-outline"
                size={styles.metaIcon.size}
                color={styles.metaIcon.color}
              />
              <AppText style={styles.metaText}>{item.referenceNo}</AppText>
            </View>
          )}

          {/* Associated Sales */}
          <View style={styles.metaItem}>
            <Ionicons
              name="cart-outline"
              size={styles.metaIcon.size}
              color={styles.metaIcon.color}
            />
            <AppText style={styles.metaText}>
              {item.sales.length} sale(s)
            </AppText>
          </View>
        </View>
      ),

      showChevron: true,
    };
  };

  /**
   * Empty state messaging
   */
  const hasActiveFilters = searchQuery || activeFilterCount > 0;
  const emptyStateConfig = {
    title: hasActiveFilters ? 'No payments found' : 'No payments yet',
    description: hasActiveFilters
      ? 'Try adjusting your search criteria or filters.'
      : 'Tap the + button below to record your first payment.',
    icon: hasActiveFilters ? 'search-outline' : 'cash-outline',
    actionLabel: hasActiveFilters ? 'Clear All Filters' : undefined,
    onAction: hasActiveFilters ? clearAllFilters : undefined,
  };

  return (
    <CommonListing<PaymentItem>
      data={data}
      keyExtractor={(item) => item.paymentId}
      /* Search */
      enableSearch
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      searchPlaceholder="Search by customer or payment ID..."
      /* Filters */
      filterChips={filterChips}
      onClearAllFilters={clearAllFilters}
      /* Card UI */
      useDefaultCard
      cardProps={{
        title: (item) => renderPaymentCard(item).title,
        leading: (item) => renderPaymentCard(item).leading,
        headerRight: (item) => renderPaymentCard(item).headerRight,
        subtitle: (item) => renderPaymentCard(item).subtitle,
        subtitleRight: (item) => renderPaymentCard(item).subtitleRight,
        children: (item) => renderPaymentCard(item).children,
        showChevron: true,
      }}
      /* Behavior */
      refreshing={refreshing}
      onRefresh={onRefresh}
      loading={loading}
      onEndReached={onEndReached}
      /* Empty State */
      emptyState={emptyStateConfig}
    />
  );
};