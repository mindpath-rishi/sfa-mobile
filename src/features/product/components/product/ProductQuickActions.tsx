import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { ProductUnitSelector } from './ProductUnitSelector';
import { Product } from '../../types/product.types';
import { useProductQuickActionsStyles } from '../../styles/ProductQuickActions.styles';

interface CartItem {
  type: 'cases' | 'units';
  quantity: number;
}

interface Props {
  product: Product;
  onAddToCart?: (items: CartItem[]) => void;
  onFavorite?: () => void;
}

export const ProductQuickActions: React.FC<Props> = ({ product, onAddToCart, onFavorite }) => {
  const { colors } = useTheme();
  const styles = useProductQuickActionsStyles();

  return (
    <View style={styles.container}>
      <View style={styles.selectorWrapper}>
        <ProductUnitSelector product={product} onAddToCart={onAddToCart} />
      </View>

      <TouchableOpacity
        style={[
          styles.favoriteButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={onFavorite}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="heart-outline" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};
