// components/SalesSummary/components/ProductsSection.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Product } from '@/features/product';
import { ProductItem } from './ProductItem';
import { CartItem } from '../../types/sales-summary.types';
import { EmptyState } from '@/core/components/EmptyState/EmptyState';

interface ProductsSectionProps {
  products: Product[];
  cartItemsCount: number;
  hasItems: boolean;
  onCartUpdate: (items: CartItem[]) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  cartItemsCount,
  hasItems,
  onCartUpdate,
}) => {
  const { colors } = useTheme();

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
          {hasItems ? `${cartItemsCount} items selected` : 'select products'}
        </Text>
      </View>

      {products.map((product, idx) => (
        <ProductItem key={product.id} product={product} index={idx} onCartUpdate={onCartUpdate} />
      ))}

      {!hasItems && <EmptyState title="Item" />}
    </>
  );
};
