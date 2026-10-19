import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import type { GroupSchemeBenefit } from '@/shared/services/group-scheme.engine';
import type { SchemeBenefit } from '@/shared/services/scheme.service';

interface SchemeBenefitsPanelProps {
  /** Every scheme applied to cart lines */
  lineBenefits: SchemeBenefit[];
  /** Group / combo schemes earned across lines */
  groupBenefits: GroupSchemeBenefit[];
}

type FreeGoodsRow = {
  key: string;
  productName: string;
  qty: number;
  unit: 'CASE' | 'PIECE';
  schemeName: string;
  detail?: string;
};

export const unitLabel = (qty: number, unit?: string) =>
  unit === 'PIECE' ? (qty === 1 ? 'pc' : 'pcs') : qty === 1 ? 'case' : 'cases';

const formatQty = (qty: number) => Number(qty.toFixed(2)).toLocaleString();

const LINE_FREE_GOODS_TYPES = ['BUY_X_GET_Y', 'BUY_ONE_GET_ONE', 'FREE_ITEM'];

/** How a group / combo benefit was earned, in plain words. */
const describeGroupEarning = (benefit: GroupSchemeBenefit) => {
  if (benefit.schemeType === 'COMBO_FREE_QTY') {
    const set = (benefit.comboItems ?? [])
      .map(
        (item) =>
          `${formatQty(item.qty)} ${unitLabel(item.qty, item.unit)} ${item.productName || item.productId}`,
      )
      .join(' + ');
    return `${benefit.multiples} combo set${benefit.multiples === 1 ? '' : 's'} of ${set}`;
  }
  const unit = benefit.groupMinUnit === 'PIECE' ? 'PIECE' : 'CASE';
  return `${formatQty(benefit.qualifyingCases)} ${unitLabel(benefit.qualifyingCases, unit)} bought · earned ${benefit.multiples}× (every ${formatQty(benefit.groupMinCases)} ${unitLabel(benefit.groupMinCases, unit)})`;
};

const toFreeGoodsRows = (
  lineBenefits: SchemeBenefit[],
  groupBenefits: GroupSchemeBenefit[],
): FreeGoodsRow[] => [
  ...lineBenefits
    .filter(
      (benefit) =>
        LINE_FREE_GOODS_TYPES.includes(benefit.schemeType) &&
        (benefit.freeQty ?? 0) > 0,
    )
    .map((benefit) => ({
      key: `line-${benefit.schemeId}-${benefit.freeProductId}`,
      productName: benefit.freeProductName || benefit.freeProductId || 'Free item',
      qty: benefit.freeQty ?? 0,
      unit: benefit.freeUnit === 'PIECE' ? ('PIECE' as const) : ('CASE' as const),
      schemeName: benefit.schemeName,
    })),
  ...groupBenefits.flatMap((benefit): FreeGoodsRow[] => {
    if (benefit.schemeType === 'GROUP_FREE_QTY' || benefit.schemeType === 'COMBO_FREE_QTY') {
      return benefit.freeQty > 0
        ? [
            {
              key: `group-${benefit.schemeId}`,
              productName: benefit.freeProductName || benefit.freeProductId || 'Free item',
              qty: benefit.freeQty,
              unit: benefit.freeUnit,
              schemeName: benefit.schemeName,
              detail: describeGroupEarning(benefit),
            },
          ]
        : [];
    }
    // Older group schemes spread free pieces over the bought lines
    return benefit.lines
      .filter((line) => line.freeQty > 0)
      .map((line) => ({
        key: `group-${benefit.schemeId}-${line.productId}`,
        productName: line.productName || line.productId,
        qty: line.freeQty,
        unit: 'PIECE' as const,
        schemeName: benefit.schemeName,
      }));
  }),
];

/** Applied scheme names and every free item earned, in one consistent layout. */
export const SchemeBenefitsPanel: React.FC<SchemeBenefitsPanelProps> = ({
  lineBenefits,
  groupBenefits,
}) => {
  const { colors } = useTheme();
  const schemeNames = Array.from(
    new Set([
      ...lineBenefits.map((benefit) => benefit.schemeName),
      ...groupBenefits.map((benefit) => benefit.schemeName),
    ]),
  ).filter(Boolean);
  const freeGoods = toFreeGoodsRows(lineBenefits, groupBenefits);

  if (!schemeNames.length && !freeGoods.length) return null;

  const sectionLabel = {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
  };

  return (
    <View style={{ gap: 12 }}>
      {schemeNames.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={sectionLabel}>Schemes applied</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {schemeNames.map((name) => (
              <View
                key={name}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  backgroundColor: colors.success + '14',
                  borderWidth: 0.5,
                  borderColor: colors.success + '40',
                }}
              >
                <Ionicons name="pricetag" size={11} color={colors.success} />
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 11,
                    fontWeight: '600',
                    color: colors.success,
                  }}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {freeGoods.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={sectionLabel}>Free goods</Text>
          <View
            style={{
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: colors.success + '40',
              backgroundColor: colors.success + '0A',
            }}
          >
            {freeGoods.map((row, index) => (
              <View
                key={row.key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 9,
                  borderTopWidth: index === 0 ? 0 : 0.5,
                  borderTopColor: colors.success + '30',
                }}
              >
                <Ionicons name="gift" size={16} color={colors.success} style={{ marginTop: 1 }} />
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}
                  >
                    {row.productName}
                  </Text>
                  <Text numberOfLines={2} style={{ fontSize: 11, color: colors.textSecondary }}>
                    {row.schemeName}
                    {row.detail ? ` · ${row.detail}` : ''}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor: colors.success,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>
                    {formatQty(row.qty)} {unitLabel(row.qty, row.unit)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
