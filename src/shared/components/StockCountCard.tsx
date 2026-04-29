// shared/components/StockCountCard.tsx
import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { ListingItemCard } from '@/shared/components/ListingItemCard';
import { IconTile } from '@/shared/components/IconTile';
import { StatusChip } from '@/shared/components/StatusChip';
import { formatDateSafe } from '@/shared/utils/currenty.utils';

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

export const StockCountCard: React.FC<StockCountCardProps> = ({ stockCount, index: _index, onPress }) => {
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

  const statusConfig = getStatusConfig(stockCount.status);
  const varianceColor = getVarianceColor(stockCount.varianceQty);
  const varianceIcon = stockCount.varianceQty > 0 ? 'trending-up' : stockCount.varianceQty < 0 ? 'trending-down' : 'minus';

  return (
    <ListingItemCard
      onPress={onPress}
      leading={<IconTile icon="clipboard-outline" color={statusConfig.color} />}
      title={
        <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
          {stockCount.stockCountId.slice(-8)}
        </AppText>
      }
      headerRight={<StatusChip label={statusConfig.label} color={statusConfig.color} backgroundColor={statusConfig.bg} />}
      subtitle={
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 11, color: colors.textTertiary, marginBottom: 2 }}>Van</AppText>
          <AppText style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
            {stockCount.vanName || 'N/A'}
          </AppText>
        </View>
      }
      subtitleRight={
        <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
          {stockCount?.systemCase + stockCount?.systemPiece} items
        </AppText>
      }
      showChevron={true}
    >
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
            Variance: {stockCount.varianceQty > 0 ? '+' : ''}
            {stockCount.varianceQty}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="calendar-outline" size={11} color={colors.textTertiary} />
          <AppText style={{ fontSize: 11, color: colors.textTertiary }}>
            {formatDateSafe(stockCount.date)}
          </AppText>
        </View>
      </View>
    </ListingItemCard>
  );
};
