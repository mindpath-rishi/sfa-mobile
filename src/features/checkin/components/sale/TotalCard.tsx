import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GroupSchemeBenefit } from '@/shared/services/group-scheme.engine';
import type { SchemeBenefit } from '@/shared/services/scheme.service';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { SchemeBenefitsPanel } from './SchemeBenefitsPanel';

interface TotalsCardProps {
  total: number;
  subtotal?: number;
  discount?: number;
  hasItems: boolean;
  mode?: 'sales' | 'topup';
  showWeight?: boolean;
  totalWeight?: number;
  /** Free goods earned from group schemes (sales mode) */
  freeGoods?: GroupSchemeBenefit[];
  /** Every scheme applied to cart lines (sales mode) */
  lineRewards?: SchemeBenefit[];
}

export const TotalsCard: React.FC<TotalsCardProps> = ({
  total,
  subtotal = total,
  discount = 0,
  hasItems,
  mode = 'sales',
  showWeight,
  totalWeight = 0,
  freeGoods = [],
  lineRewards = [],
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      {/* Total Weight (Top-up only) - Single line */}
      {mode === 'topup' && showWeight && totalWeight > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Weight</Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: colors.warning }}>
            {totalWeight.toFixed(2)} kg
          </Text>
        </View>
      )}

      {mode === 'sales' && discount > 0 && (
        <View style={{ paddingHorizontal: 14, paddingTop: 12, gap: 8 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Subtotal</Text>
            <Text style={{ fontSize: 13, color: colors.textPrimary }}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.success }}>
              Scheme savings
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>
              − {formatCurrency(discount)}
            </Text>
          </View>
        </View>
      )}

      {mode === 'sales' && (lineRewards.length > 0 || freeGoods.length > 0) && (
        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
          <SchemeBenefitsPanel lineBenefits={lineRewards} groupBenefits={freeGoods} />
        </View>
      )}

      {/* Total */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginTop: mode === 'sales' && (discount > 0 || lineRewards.length > 0 || freeGoods.length > 0) ? 12 : 0,
          backgroundColor: hasItems ? colors.primary + '0C' : 'transparent',
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Total</Text>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: hasItems ? colors.primary : colors.textSecondary,
          }}
        >
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
};
