import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '@/features/product';
import { ProductItem } from './ProductItem';
import { EmptyState } from '@/core/components/EmptyState/EmptyState';
import { useCartStore } from '@/core/store/cart.store';

interface ProductsSectionProps {
  products: CartItemWithDetails[];
  hasItems: boolean;
  mode?: 'sales' | 'topup';
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  hasItems,
  mode = 'sales',
}) => {
  const { colors } = useTheme();
  const { items } = useCartStore();

  const getModeText = () => {
    if (mode === 'topup') {
      return {
        title: 'Top-up Items',
        emptyTitle: 'No items added',
        emptyMessage: 'Add products to your top-up request',
      };
    }
    return {
      title: 'Cart Items',
      emptyTitle: 'Cart is empty',
      emptyMessage: 'Add products to continue',
    };
  };

  const modeText = getModeText();

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
          marginBottom: 8,
          paddingHorizontal: 2,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {modeText.title} ({products.length})
        </Text>

        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          {hasItems ? `${items.length} items selected` : 'select products'}
        </Text>
      </View>

      {products.map((product, idx) => (
        <ProductItem key={product.productId} product={product} index={idx} mode={mode} />
      ))}

      {!hasItems && (
        <EmptyState title={modeText.emptyTitle} description={modeText.emptyMessage} size="small" />
      )}
    </>
  );
};
