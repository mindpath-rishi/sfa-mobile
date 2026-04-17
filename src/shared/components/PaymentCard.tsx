// components/payment/PaymentCard.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

interface PaymentCardProps {
  payment: {
    paymentId: string;
    customerId: string;
    customerName?: string;
    vanId: string;
    amount: number;
    paymentMode: string;
    status: string;
    date: string;
    referenceNo?: string;
    sales?: Array<{ saleId: string; amount: number }>;
  };
  index: number;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, index }) => {
  const { colors } = useTheme();

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'CASH':
        return 'cash-outline';
      case 'CARD':
        return 'card-outline';
      case 'CHEQUE':
        return 'document-outline';
      case 'BANK_TRANSFER':
        return 'business-outline';
      case 'UPI':
        return 'phone-portrait-outline';
      case 'MOBILE_MONEY':
        return 'phone-outline';
      default:
        return 'cash-outline';
    }
  };

  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case 'CASH':
        return '#10B981';
      case 'CARD':
        return '#8B5CF6';
      case 'CHEQUE':
        return '#3B82F6';
      case 'BANK_TRANSFER':
        return '#EC4899';
      case 'UPI':
        return '#F59E0B';
      case 'MOBILE_MONEY':
        return '#06B6D4';
      default:
        return colors.primary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '#10B981';
      case 'PENDING':
        return '#F59E0B';
      case 'FAILED':
        return '#EF4444';
      case 'REFUNDED':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return `K ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const modeColor = getPaymentModeColor(payment.paymentMode);
  const statusColor = getStatusColor(payment.status);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 14,
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.divider,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      activeOpacity={0.7}
    >
      {/* Left - Index & Icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        {/* Icon */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: modeColor + '12',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={getPaymentModeIcon(payment.paymentMode)} size={22} color={modeColor} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Header Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {payment.customerName || payment.customerId}
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                backgroundColor: statusColor + '12',
              }}
            >
              <View
                style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }}
              />
              <AppText style={{ fontSize: 10, fontWeight: '600', color: statusColor }}>
                {payment.status}
              </AppText>
            </View>
          </View>

          {/* Customer & Amount Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 4,
            }}
          >
            <AppText style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
              {payment.paymentId}
            </AppText>
            <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.success }}>
              {formatCurrency(payment.amount)}
            </AppText>
          </View>

          {/* Footer Row - Mode, Date, Sales */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="card-outline" size={11} color={colors.textTertiary} />
              <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                {payment.paymentMode.replace('_', ' ')}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="calendar-outline" size={11} color={colors.textTertiary} />
              <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                {formatDate(payment.date)}
              </AppText>
            </View>
            {payment.referenceNo && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="receipt-outline" size={11} color={colors.textTertiary} />
                <AppText style={{ fontSize: 11, color: colors.textTertiary }} numberOfLines={1}>
                  {payment.referenceNo}
                </AppText>
              </View>
            )}
            {payment.sales && payment.sales.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="cart-outline" size={11} color={colors.textTertiary} />
                <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                  {payment.sales.length} sale(s)
                </AppText>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right - Chevron */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textTertiary}
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  );
};
