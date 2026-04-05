import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails, Product } from '@/features/product';
import { ProductItem } from './ProductItem';
import { EmptyState } from '@/core/components/EmptyState/EmptyState';
import { useCartStore } from '@/core/store/cart.store';

interface ProductsSectionProps {
  products: CartItemWithDetails[];
  hasItems: boolean;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ products, hasItems }) => {
  const { colors } = useTheme();

  // ✅ get cart from store
  const { items } = useCartStore();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          marginBottom: 8,
          paddingHorizontal: 2,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          Products ({products.length})
        </Text>

        <Text style={{ fontSize: 11, color: colors.textTertiary }}>
          {hasItems ? `${items.length} items selected` : 'select products'}
        </Text>
      </View>

      {products.map((product, idx) => (
        <ProductItem
          key={product.productId} // ✅ FIXED
          product={product}
          index={idx}
        />
      ))}

      {!hasItems && <EmptyState title="Item" />}
    </>
  );
};
