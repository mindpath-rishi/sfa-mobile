import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import type { SchemeRecord } from '@/shared/services/scheme.service';

const unit = (qty: number, value?: string) =>
  value === 'PIECE' ? (qty === 1 ? 'pc' : 'pcs') : 'cs';

const minText = (scheme: SchemeRecord) =>
  (scheme.minQty ?? 0) > 0 ? ` · min ${scheme.minQty} ${unit(scheme.minQty ?? 0, scheme.minQtyUnit)}` : '';

const freeText = (qty: number, freeUnit?: string, name?: string) =>
  `${qty} ${unit(qty, freeUnit)}${name ? ` ${name}` : ''} free`;

/** What a scheme gives and what it needs, in a few words. */
export const describeScheme = (scheme: SchemeRecord): string => {
  switch (scheme.schemeType) {
    case 'DISCOUNT_PERCENT':
      return `${scheme.discountPercent ?? 0}% off${minText(scheme)}`;
    case 'DISCOUNT_VALUE':
      return `K${(scheme.discountValue ?? 0).toLocaleString()} off${minText(scheme)}`;
    case 'BUY_ONE_GET_ONE':
      return `Buy 1 ${unit(1, scheme.buyUnit)}, get 1 free`;
    case 'BUY_X_GET_Y':
      return `Buy ${scheme.buyQty ?? 0} ${unit(scheme.buyQty ?? 0, scheme.buyUnit)}, get ${freeText(
        scheme.freeQty ?? 0,
        scheme.freeUnit,
        scheme.freeProductName,
      )}`;
    case 'FREE_ITEM':
      return `${freeText(scheme.freeQty ?? 0, scheme.freeUnit, scheme.freeProductName)}${minText(scheme)}`;
    case 'GROUP_FREE_QTY':
      return `Buy all ${scheme.productIds?.length ?? 0} group products · every ${scheme.groupMinCases ?? 0} ${unit(
        scheme.groupMinCases ?? 0,
        scheme.groupMinUnit,
      )} → ${freeText(scheme.freeQty ?? 0, scheme.freeUnit, scheme.freeProductName)}`;
    case 'COMBO_FREE_QTY':
      return `Combo: ${freeText(scheme.freeQty ?? 0, scheme.freeUnit, scheme.freeProductName)}`;
    default:
      return '';
  }
};

interface SchemeChipsProps {
  schemes: SchemeRecord[];
  /** Schemes currently applied to this product's cart line */
  appliedSchemeIds: Set<string>;
}

/**
 * One chip per scheme on a product: solid green once it applies, outlined
 * while its condition is not met yet.
 */
export const SchemeChips: React.FC<SchemeChipsProps> = ({ schemes, appliedSchemeIds }) => {
  const { colors } = useTheme();
  if (!schemes.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {schemes.map((scheme) => {
        const applied = appliedSchemeIds.has(scheme.schemeId);
        const description = describeScheme(scheme);
        const isFreeGoods = !['DISCOUNT_PERCENT', 'DISCOUNT_VALUE'].includes(scheme.schemeType);
        return (
          <View
            key={scheme.schemeId}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              maxWidth: '100%',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: applied ? colors.success : colors.success + '55',
              backgroundColor: applied ? colors.success + '18' : 'transparent',
            }}
          >
            <Ionicons
              name={applied ? 'checkmark-circle' : isFreeGoods ? 'gift-outline' : 'pricetag-outline'}
              size={12}
              color={colors.success}
            />
            <AppText
              numberOfLines={2}
              style={{ flexShrink: 1, fontSize: 11, color: colors.success }}
            >
              <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.success }}>
                {scheme.name}
              </AppText>
              {description && description !== scheme.name ? ` · ${description}` : ''}
            </AppText>
          </View>
        );
      })}
    </View>
  );
};
