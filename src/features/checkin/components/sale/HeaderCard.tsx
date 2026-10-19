import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface HeaderCardProps {
  outletName: string | undefined;
  customerId: string | undefined;
  reference: string | undefined;
  totals: {
    totalCases: number;
    totalPieces: number;
    totalSkus: number;
    totalItems: number;
  };
  onReset?: () => void;
  isProcessing?: boolean;
  mode?: 'sales' | 'topup';
  title?: string;
  warehouseId?: string;
  warehouseName?: string;
  date?: string;
  address?: string;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  outletName,
  totals,
  mode = 'sales',
  title,
  warehouseId,
  warehouseName,
  date,
  address,
}) => {
  const { colors } = useTheme();

  const displayTitle = title || (mode === 'sales' ? 'Sales Summary' : 'Top-up Summary');
  // Sales show only the outlet; top-ups show where the stock comes from
  const displaySubtitle =
    mode === 'topup'
      ? [warehouseName || warehouseId, date].filter(Boolean).join(' · ')
      : address;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 12,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      <View style={{ marginBottom: 10 }}>
        <Text
          numberOfLines={2}
          style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}
        >
          {outletName || displayTitle}
        </Text>
        {displaySubtitle ? (
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}
          >
            {displaySubtitle}
          </Text>
        ) : null}
      </View>

      {/* Stats Row - Compact grid */}
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <StatItem value={totals.totalSkus} label="SKU" highlight={totals.totalSkus > 0} />
        <StatItem value={totals.totalCases} label="CASES" highlight={totals.totalCases > 0} />
        <StatItem value={totals.totalPieces} label="PIECES" highlight={totals.totalPieces > 0} />
      </View>
    </View>
  );
};

const StatItem = ({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight: boolean;
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: highlight ? colors.primary + '10' : colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: highlight ? colors.primary : colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 10, letterSpacing: 0.3, color: colors.textTertiary }}>{label}</Text>
    </View>
  );
};
