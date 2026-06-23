import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '@/features/product';
import { ProductUnitSelector } from '@/features/product';
import { useCartStore } from '@/core/store/cart.store';

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
  const totalWeight =
    (product.caseQty || 0) * (product.caseNetWeight || 0) +
    (product.pieceQty || 0) * (product.pieceNetWeight || 0);

  const formatCurrency = (amount: number) =>
    `K${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              Case: {formatCurrency(product.casePrice)}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              Piece: {formatCurrency(product.piecePrice)}
            </Text>
          </View>

          {/* Show selected quantities */}
          {(product.caseQty > 0 || product.pieceQty > 0) && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              {product.caseQty > 0 && (
                <Text style={{ fontSize: 11, color: colors.success }}>{product.caseQty} cases</Text>
              )}
              {product.pieceQty > 0 && (
                <Text style={{ fontSize: 11, color: colors.success }}>
                  {product.pieceQty} pieces
                </Text>
              )}
              {mode === 'topup' && totalWeight > 0 && (
                <Text style={{ fontSize: 11, color: colors.warning }}>
                  {totalWeight.toFixed(2)} kg
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right Section - Total & Expand Icon */}
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {(product.caseQty > 0 || product.pieceQty > 0) && (
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
              {formatCurrency(totalValue)}
            </Text>
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
