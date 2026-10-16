import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '@/features/product';
import { ProductUnitSelector } from '@/features/product';
import { useCartStore } from '@/core/store/cart.store';
import { appliedSchemesOf } from '@/shared/services/scheme.service';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { unitLabel } from './SchemeBenefitsPanel';

interface ProductItemProps {
  product: CartItemWithDetails;
  index: number;
  mode?: 'sales' | 'topup';
  onUpdate?: (productId: string, caseQty: number, pieceQty: number) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  index,
  mode = 'sales',
  onUpdate,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const { addItems, removeItem } = useCartStore();
  const schemeBenefit = useCartStore((state) => state.schemeDiscounts[product.productId]);

  const handleAddToCart = useCallback(
    (items: any[]) => {
      if (!items?.length) return;

      let caseQty = 0;
      let pieceQty = 0;

      items.forEach((item) => {
        caseQty += item.caseQty || 0;
        pieceQty += item.pieceQty || 0;
      });

      if (caseQty === 0 && pieceQty === 0) {
        removeItem(product.productId);
        if (onUpdate) {
          onUpdate(product.productId, 0, 0);
        }
        return;
      }

      addItems([
        {
          productId: product.productId,
          productName: product.productName,
          casePrice: product.casePrice,
          piecePrice: product.piecePrice,
          unitQtyInCase: product.unitQtyInCase,
          caseQty,
          pieceQty,
          caseNetWeight: product.caseNetWeight,
          pieceNetWeight: product.pieceNetWeight,
          stock: product.stock,
          compCode: product.compCode,
          categoryId: product.categoryId,
          parentCategoryId: product.parentCategoryId,
        },
      ]);

      if (onUpdate) {
        onUpdate(product.productId, caseQty, pieceQty);
      }
    },
    [product, addItems, removeItem, onUpdate],
  );

  const totalValue =
    (product.caseQty || 0) * product.casePrice + (product.pieceQty || 0) * product.piecePrice;
  const schemeDiscount = Math.min(schemeBenefit?.discountAmount ?? 0, totalValue);
  const netValue = Math.max(0, totalValue - schemeDiscount);
  const discountRatio = totalValue > 0 ? schemeDiscount / totalValue : 0;
  const discountedCasePrice = Math.max(0, product.casePrice * (1 - discountRatio));
  const discountedPiecePrice = Math.max(0, product.piecePrice * (1 - discountRatio));
  const totalWeight =
    (product.caseQty || 0) * (product.caseNetWeight || 0) +
    (product.pieceQty || 0) * (product.pieceNetWeight || 0);

  const appliedSchemes = appliedSchemesOf(schemeBenefit);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.65}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          gap: 12,
        }}
      >
        {/* Index */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '15',
            borderWidth: 0.5,
            borderColor: colors.primary + '40',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: colors.primary,
            }}
          >
            {index + 1}
          </Text>
        </View>

        {/* Product Info */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.textPrimary,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {product.productName}
          </Text>

          {/* Unit prices: discounted price first, original struck through */}
          <View style={{ gap: 2 }}>
            {[
              { label: 'Case', price: product.casePrice, discounted: discountedCasePrice },
              { label: 'Piece', price: product.piecePrice, discounted: discountedPiecePrice },
            ].map((row) => (
              <View
                key={row.label}
                style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}
              >
                <Text style={{ width: 38, fontSize: 12, color: colors.textTertiary }}>
                  {row.label}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: schemeDiscount > 0 ? colors.success : colors.textSecondary,
                  }}
                >
                  {formatCurrency(schemeDiscount > 0 ? row.discounted : row.price)}
                </Text>
                {schemeDiscount > 0 && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.textTertiary,
                      textDecorationLine: 'line-through',
                    }}
                  >
                    {formatCurrency(row.price)}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Selected quantities */}
          {(product.caseQty > 0 || product.pieceQty > 0 || (mode === 'topup' && totalWeight > 0)) && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {[
                product.caseQty > 0 && `${product.caseQty} ${unitLabel(product.caseQty, 'CASE')}`,
                product.pieceQty > 0 &&
                  `${product.pieceQty} ${product.pieceQty === 1 ? 'piece' : 'pieces'}`,
                mode === 'topup' && totalWeight > 0 && `${totalWeight.toFixed(2)} kg`,
              ]
                .filter((text): text is string => Boolean(text))
                .map((text) => (
                  <View
                    key={text}
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: colors.primary + '10',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>
                      {text}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {/* Schemes on this line, and the free goods they give */}
          {mode === 'sales' && appliedSchemes.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
              {appliedSchemes.map((applied) => (
                <View
                  key={applied.schemeId}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    maxWidth: '100%',
                    paddingHorizontal: 7,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor: colors.success + '12',
                    borderWidth: 0.5,
                    borderColor: colors.success + '35',
                  }}
                >
                  <Ionicons
                    name={(applied.freeQty ?? 0) > 0 ? 'gift' : 'pricetag'}
                    size={11}
                    color={colors.success}
                  />
                  <Text
                    numberOfLines={1}
                    style={{ flexShrink: 1, fontSize: 11, fontWeight: '600', color: colors.success }}
                  >
                    {applied.schemeName}
                    {(applied.freeQty ?? 0) > 0
                      ? ` · ${applied.freeQty} ${unitLabel(applied.freeQty ?? 0, applied.freeUnit)} free`
                      : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Section - Total & Expand Icon */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {(product.caseQty > 0 || product.pieceQty > 0) && (
            <>
              {schemeDiscount > 0 && (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    textDecorationLine: 'line-through',
                  }}
                >
                  {formatCurrency(totalValue)}
                </Text>
              )}
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>
                {formatCurrency(netValue)}
              </Text>
              {schemeDiscount > 0 && (
                <Text style={{ fontSize: 10, fontWeight: '600', color: colors.success }}>
                  Save {formatCurrency(schemeDiscount)}
                </Text>
              )}
            </>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textTertiary}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Section */}
      {expanded && (
        <Animated.View entering={FadeInDown.duration(200)}>
          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: colors.border + '25',
              padding: 12,
            }}
          >
            <ProductUnitSelector
              product={product}
              onAddToCart={handleAddToCart}
              mode={mode}
              showName={false}
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
