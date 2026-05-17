import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  outletName,
  customerId,
  reference,
  totals,
  onReset,
  isProcessing = false,
  mode = 'sales',
  title,
  warehouseId,
  warehouseName,
  date,
}) => {
  const { colors } = useTheme();

  const displayTitle = title || (mode === 'sales' ? 'Sales Summary' : 'Top-up Summary');
  const displaySubtitle =
    mode === 'sales'
      ? `${reference} · #${customerId}`
      : `${reference} · ${warehouseName || warehouseId || 'Warehouse'}`;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 10,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      {/* Header Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
            {outletName || displayTitle}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
            {displaySubtitle}
          </Text>
          {mode === 'topup' && date && (
            <Text style={{ fontSize: 10, color: colors.textTertiary, marginTop: 1 }}>{date}</Text>
          )}
        </View>

        {onReset && (
          <TouchableOpacity
            onPress={onReset}
            disabled={isProcessing}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              borderWidth: 0.5,
              borderColor: colors.border + '50',
              backgroundColor: colors.background,
            }}
          >
            <Ionicons name="refresh-outline" size={12} color={colors.textSecondary} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>Reset</Text>
          </TouchableOpacity>
        )}
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
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: highlight ? colors.primary + '10' : colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: highlight ? colors.primary : colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 9, color: colors.textTertiary }}>{label}</Text>
    </View>
  );
};
