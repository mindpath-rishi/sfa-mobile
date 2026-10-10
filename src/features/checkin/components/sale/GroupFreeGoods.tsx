import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GroupSchemeBenefit } from '@/shared/services/group-scheme.engine';

interface GroupFreeGoodsProps {
  benefits: GroupSchemeBenefit[];
}

/** Free-goods lines a group scheme gives, e.g. "2 cs Cola 300ml" */
export const describeGroupFreeGoods = (benefit: GroupSchemeBenefit): string[] => {
  if (benefit.schemeType === 'GROUP_FREE_QTY' || benefit.schemeType === 'COMBO_FREE_QTY') {
    const unit = benefit.freeUnit === 'PIECE' ? 'pcs' : 'cs';
    return [
      `${benefit.freeQty} ${unit} ${benefit.freeProductName || benefit.freeProductId || 'free item'}`,
    ];
  }
  return benefit.lines
    .filter((line) => line.freeQty > 0)
    .map((line) => `${line.freeQty} pcs ${line.productName || line.productId}`);
};

/** One combo set, e.g. "3 cs Cola + 1 pcs Chips" */
const describeComboSet = (benefit: GroupSchemeBenefit) =>
  (benefit.comboItems ?? [])
    .map(
      (item) =>
        `${item.qty} ${item.unit === 'PIECE' ? 'pcs' : 'cs'} ${item.productName || item.productId}`,
    )
    .join(' + ');

/** Lists free goods earned on the combined quantity of product groups. */
export const GroupFreeGoods: React.FC<GroupFreeGoodsProps> = ({ benefits }) => {
  const { colors } = useTheme();
  if (!benefits.length) return null;

  return (
    <View style={{ gap: 6 }}>
      {benefits.map((benefit) => (
        <View
          key={benefit.schemeId}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: colors.success + '12',
            gap: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="gift" size={14} color={colors.success} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, flexShrink: 1 }}>
              {benefit.schemeName}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            {benefit.schemeType === 'COMBO_FREE_QTY'
              ? `Combo ${describeComboSet(benefit)} · ${benefit.multiples} set${benefit.multiples === 1 ? '' : 's'}`
              : `Group ${benefit.qualifyingCases} cs${
                  benefit.schemeType === 'GROUP_FREE_QTY'
                    ? ` · ${benefit.multiples} × ${benefit.groupMinCases} cs`
                    : ` · ${benefit.freePercent}% free`
                }`}
          </Text>
          {describeGroupFreeGoods(benefit).map((line) => (
            <Text key={line} style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
              Free: {line}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
