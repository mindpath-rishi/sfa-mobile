// components/SalesSummary/components/TotalsCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { TAX_RATE } from '../../constants';

interface TotalsCardProps {
  subtotal: number;
  tax: number;
  total: number;
  hasItems: boolean;
}

export const TotalsCard: React.FC<TotalsCardProps> = ({ subtotal, tax, total, hasItems }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>Subtotal</Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
          ZMW {subtotal.toFixed(2)}
        </Text>
      </View>

      <View style={{ height: 0.5, backgroundColor: colors.border + '25' }} />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
          Tax ({(TAX_RATE * 100).toFixed(0)}%)
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
          ZMW {tax.toFixed(2)}
        </Text>
      </View>

      <View style={{ height: 0.5, backgroundColor: colors.border + '25' }} />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: hasItems ? colors.primary + '0C' : 'transparent',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>Total</Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: hasItems ? colors.primary : colors.textSecondary,
          }}
        >
          ZMW {total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};
