// shared/components/TopupCard.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { format } from 'date-fns';

interface TopupCardProps {
  topup: {
    vanInventoryTopupId: string;
    vanId: string;
    vanName: string;
    employeeId: string;
    employeeName?: string;
    warehouseId: string;
    date: string;
    totalRequestedQty: number;
    totalRequestedValue: number;
    totalApprovedQty: number;
    totalApprovedValue: number;
    totalRequestedPieces: number;
    totalRequestedCases: number;
    totalApprovedPieces: number;
    totalApprovedCases: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    approvedByName?: string;
    approvedAt?: string;
    createdAt: string;
  };
  index: number;
}

export const TopupCard: React.FC<TopupCardProps> = ({ topup, index }) => {
  const { colors } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: '#10B98112', icon: 'checkmark-circle', label: 'Approved' };
      case 'SUBMITTED':
        return { color: '#3B82F6', bg: '#3B82F612', icon: 'time-outline', label: 'Submitted' };
      case 'REJECTED':
        return { color: '#EF4444', bg: '#EF444412', icon: 'close-circle', label: 'Rejected' };
      default:
        return { color: '#8B5CF6', bg: '#8B5CF612', icon: 'document-text-outline', label: 'Draft' };
    }
  };

  const formatCurrency = (value: number) => {
    return `K ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM, hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const statusConfig = getStatusConfig(topup.status);
  const totalRequestedItems = (topup.totalRequestedCases || 0) + (topup.totalRequestedPieces || 0);
  const totalApprovedItems = (topup.totalApprovedCases || 0) + (topup.totalApprovedPieces || 0);

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
      onPress={() => router.push(`/topup/detail?id=${topup.vanInventoryTopupId}`)}
    >
      {/* Left - Icon */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: statusConfig.color + '12',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="cube-outline" size={22} color={statusConfig.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Header Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {topup.vanName || topup.vanId}
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                backgroundColor: statusConfig.bg,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: statusConfig.color,
                }}
              />
              <AppText style={{ fontSize: 10, fontWeight: '600', color: statusConfig.color }}>
                {statusConfig.label}
              </AppText>
            </View>
          </View>

          {/* Requested & Approved Items Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            {/* Requested Items */}
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                Requested Items
              </AppText>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                {totalRequestedItems}
              </AppText>
            </View>

            {/* Approved Items */}
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                Approved Items
              </AppText>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.success }}>
                {totalApprovedItems}
              </AppText>
            </View>

            {/* Value */}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                Value
              </AppText>
              <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
                {formatCurrency(topup.totalRequestedValue)}
              </AppText>
            </View>
          </View>

          {/* Footer - Date and Approval Info */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 4,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: colors.divider,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
              <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                {formatDate(topup.date)}
              </AppText>
            </View>

            {topup.status === 'APPROVED' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="shield-checkmark" size={12} color={colors.success} />
                <AppText style={{ fontSize: 10, color: colors.textTertiary }}>
                  Approved by {topup.approvedByName || 'Rahul Sharma'}
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
