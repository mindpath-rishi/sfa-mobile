// shared/components/StockCountCard.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { format } from 'date-fns';

interface StockCountCardProps {
  stockCount: {
    stockCountId: string;
    vanName?: string;
    date: string;
    systemQty: number;
    countedQty: number;
    varianceQty: number;
    systemPiece: number;
    systemCase: number;
    status: string;
    createdAt: string;
  };
  index: number;
  onPress: () => void;
}

export const StockCountCard: React.FC<StockCountCardProps> = ({ stockCount, index, onPress }) => {
  const { colors } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: '#10B98112', label: 'Approved' };
      case 'SUBMITTED':
        return { color: '#3B82F6', bg: '#3B82F612', label: 'Submitted' };
      case 'IN_PROGRESS':
        return { color: '#F59E0B', bg: '#F59E0B12', label: 'In Progress' };
      case 'REJECTED':
        return { color: '#EF4444', bg: '#EF444412', label: 'Rejected' };
      default:
        return { color: '#8B5CF6', bg: '#8B5CF612', label: 'Draft' };
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return '#10B981';
    if (variance < 0) return '#EF4444';
    return '#6B7280';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const statusConfig = getStatusConfig(stockCount.status);
  const varianceColor = getVarianceColor(stockCount.varianceQty);
  const varianceIcon = stockCount.varianceQty > 0 ? 'trending-up' : stockCount.varianceQty < 0 ? 'trending-down' : 'minus';

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
      onPress={onPress}
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
          <Ionicons name="clipboard-outline" size={22} color={statusConfig.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              {stockCount.stockCountId.slice(-8)}
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
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusConfig.color }} />
              <AppText style={{ fontSize: 10, fontWeight: '600', color: statusConfig.color }}>
                {statusConfig.label}
              </AppText>
            </View>
          </View>

          {/* Van & Date Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>
                Van
              </AppText>
              <AppText style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
                {stockCount.vanName || 'N/A'}
              </AppText>
            </View>
            <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
              {stockCount?.systemCase + stockCount?.systemPiece} items
            </AppText>
          </View>

          {/* Footer Row - Counted, Variance, Date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="checkmark-circle-outline" size={11} color={colors.textTertiary} />
              <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                Counted: {stockCount.countedQty}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name={varianceIcon} size={11} color={varianceColor} />
              <AppText style={{ fontSize: 11, color: varianceColor }}>
                Variance: {stockCount.varianceQty > 0 ? '+' : ''}{stockCount.varianceQty}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="calendar-outline" size={11} color={colors.textTertiary} />
              <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
                {formatDate(stockCount.date)}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Right - Chevron */}
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
};