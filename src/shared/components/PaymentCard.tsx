// components/payment/PaymentCard.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { format } from 'date-fns';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time-outline';
      case 'FAILED':
        return 'close-circle';
      case 'REFUNDED':
        return 'refresh-circle';
      default:
        return 'help-circle';
    }
  };

  const formatCurrency = (amount: number) => {
    return `ZMW ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.7}
      // onPress={() => router.push(`/payments/${payment.paymentId}`)}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary + '10',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={getPaymentModeIcon(payment.paymentMode)}
              size={20}
              color={colors.primary}
            />
          </View>
          <View>
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {payment.paymentId}
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.textSecondary }}>
              {payment.customerName || payment.customerId}
            </AppText>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: getStatusColor(payment.status) + '15',
          }}
        >
          <Ionicons
            name={getStatusIcon(payment.status)}
            size={12}
            color={getStatusColor(payment.status)}
          />
          <AppText
            style={{ fontSize: 11, fontWeight: '600', color: getStatusColor(payment.status) }}
          >
            {payment.status}
          </AppText>
        </View>
      </View>

      {/* Amount */}
      <View style={{ marginBottom: 12 }}>
        <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.success }}>
          {formatCurrency(payment.amount)}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
          <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
            {formatDate(payment.date)}
          </AppText>
        </View>
      </View>

      {/* Payment Details */}
      <View
        style={{
          flexDirection: 'row',
          gap: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="card-outline" size={14} color={colors.textSecondary} />
          <AppText style={{ fontSize: 12, color: colors.textSecondary }}>
            {payment.paymentMode.replace('_', ' ')}
          </AppText>
        </View>
        {payment.referenceNo && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="receipt-outline" size={14} color={colors.textSecondary} />
            <AppText style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>
              Ref: {payment.referenceNo}
            </AppText>
          </View>
        )}
        {payment.sales && payment.sales.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="cart-outline" size={14} color={colors.textSecondary} />
            <AppText style={{ fontSize: 12, color: colors.textSecondary }}>
              {payment.sales.length} sale(s)
            </AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
