// components/SalesSummary/components/HeaderCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { StatPill } from './StatPill';

interface HeaderCardProps {
  customerName: string;
  customerId: string;
  reference: string;
  totals: {
    cases: number;
    pieces: number;
    orderedCount: number;
    skuCount: number;
    units: number;
  };
  onReset: () => void;
  isProcessing?: boolean;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  customerName,
  customerId,
  reference,
  totals,
  onReset,
  isProcessing = false,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        }}
      >
        <View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            {customerName}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>
            {reference} · #{customerId}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onReset}
          disabled={isProcessing}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 0.5,
            borderColor: colors.border + '50',
            backgroundColor: colors.background,
          }}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <StatPill value={totals.cases} label="CASES" highlight={totals.cases > 0} />
        <StatPill value={totals.pieces} label="PIECES" highlight={totals.pieces > 0} />
        <StatPill
          value={`${totals.orderedCount}/${totals.skuCount}`}
          label="SKUs"
          highlight={totals.orderedCount > 0}
        />
        <StatPill value={totals.units} label="UNITS" highlight={totals.units > 0} />
      </View>
    </View>
  );
};
