import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails, Product, ProductUnitSelector } from '@/features/product';
import { useCartStore } from '@/core/store/cart.store';

interface ProductItemProps {
  product: CartItemWithDetails;
  index: number;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, index }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  // ✅ Zustand
  const { addItems } = useCartStore();

  /* ================= ADD TO CART ================= */

  const handleAddToCart = useCallback(
    (items: any[]) => {
      if (!items?.length) return;

      let caseQty = 0;
      let pieceQty = 0;

      items.forEach((item) => {
        caseQty += item.caseQty || 0;
        pieceQty += item.pieceQty || 0;
      });

      if (caseQty === 0 && pieceQty === 0) return;

      // ✅ send to store
      addItems([
        {
          productId: product.productId,
          productName: product.productName,
          casePrice: product.casePrice,
          piecePrice: product.piecePrice,
          unitQtyInCase: product.unitQtyInCase,
          caseQty,
          pieceQty,
        },
      ]);

      const totalItems = caseQty + pieceQty;
      const totalValue = caseQty * product.casePrice + pieceQty * product.piecePrice;

      Alert.alert(
        '✅ Added to Cart',
        `${totalItems} item(s) added\nTotal: ₹${totalValue.toFixed(2)}`,
        [{ text: 'OK' }],
      );
    },
    [product, addItems],
  );

  /* ================= UI ================= */

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
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
          padding: 14,
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
              fontWeight: '700',
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
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: 3,
            }}
            numberOfLines={2}
          >
            {product.productName}
          </Text>

          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            SKU {product.productId} · Case: K{product.casePrice} | Piece: K{product.piecePrice}
          </Text>
        </View>

        {/* Expand Icon */}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textTertiary}
        />
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
              onAddToCart={handleAddToCart} // ✅ new structure
            />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
