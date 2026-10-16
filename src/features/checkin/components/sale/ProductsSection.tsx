import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { CartItemWithDetails } from '@/features/product';
import { ProductItem } from './ProductItem';
import { EmptyState } from '@/core/components/EmptyState/EmptyState';

interface ProductsSectionProps {
  products: CartItemWithDetails[];
  hasItems: boolean;
  mode?: 'sales' | 'topup';
  /** Shows a "Clear cart" button that empties every item */
  onClearCart?: () => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  hasItems,
  mode = 'sales',
  onClearCart,
}) => {
  const { colors } = useTheme();

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

        {hasItems && onClearCart ? (
          <TouchableOpacity
            onPress={onClearCart}
            hitSlop={8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.error + '55',
              backgroundColor: colors.error + '0D',
            }}
          >
            <Ionicons name="trash-outline" size={13} color={colors.error} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.error }}>
              {mode === 'topup' ? 'Clear all' : 'Clear cart'}
            </Text>
          </TouchableOpacity>
        ) : (
          !hasItems && (
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>Select products</Text>
          )
        )}
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
