import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface TotalsCardProps {
  total: number;
  subtotal?: number;
  discount?: number;
  hasItems: boolean;
  mode?: 'sales' | 'topup';
  showWeight?: boolean;
  totalWeight?: number;
}

export const TotalsCard: React.FC<TotalsCardProps> = ({
  total,
  subtotal = total,
  discount = 0,
  hasItems,
  mode = 'sales',
  showWeight,
  totalWeight = 0,
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
        <View style={{ paddingHorizontal: 12, paddingTop: 9, gap: 7 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>Subtotal</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              K{subtotal.toLocaleString()}
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
              Scheme savings
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>
              − K{discount.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Total */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: hasItems ? colors.primary + '0C' : 'transparent',
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary }}>Total</Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: hasItems ? colors.primary : colors.textSecondary,
          }}
        >
          K{total.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};
