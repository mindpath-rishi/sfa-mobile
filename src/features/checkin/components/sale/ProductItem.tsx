// components/SalesSummary/components/ProductItem.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { Product, ProductUnitSelector } from '@/features/product';
import { CartItem } from '../../types/sales-summary.types';

interface ProductItemProps {
  product: Product;
  index: number;
  onCartUpdate: (items: CartItem[]) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, index, onCartUpdate }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleAddToCart = useCallback(
    (items: any[]) => {
      const cartItems: CartItem[] = items.map((item) => ({
        productId: product.id,
        product: product,
        type: item.type,
        quantity: item.quantity,
      }));
      onCartUpdate(cartItems);
    },
    [product, onCartUpdate],
  );

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

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 3 }}
            numberOfLines={1}
          >
            {product.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textTertiary }}>
            SKU {product.sku} · ZMW {product.price.toFixed(2)}/unit
          </Text>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textTertiary}
        />
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={FadeInDown.duration(200)}>
          <View
            style={{
              borderTopWidth: 0.5,
              borderTopColor: colors.border + '25',
              padding: 12,
            }}
          >
            <ProductUnitSelector product={product} onAddToCart={handleAddToCart} />
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
