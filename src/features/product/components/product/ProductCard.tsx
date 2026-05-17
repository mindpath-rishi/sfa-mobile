import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  FadeInDown,
} from 'react-native-reanimated';

import { ProductImage } from './ProductImage';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductTags } from './ProductTags';
import { ProductPrice } from './ProductPrice';
import { ProductUnitSelector } from './ProductUnitSelector';
import { Product, CartItem, CartItemWithDetails } from '../../types/product.types';
import { useProductCardStyles } from '../../styles/ProductCard.styles';
import Card from '@/core/components/Card/Card';
import { AppText } from '@/core/components';

interface Props {
  product: any;
  index: number;
  onAddToCart?: (items: CartItemWithDetails[]) => void;
  mode: 'sales' | 'topup';
}

export const ProductCard: React.FC<Props> = ({ product, index, onAddToCart, mode }) => {
  const { colors } = useTheme();
  const styles = useProductCardStyles();
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Navigate to product details
    // router.push(`/products/${product.id}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleAddToCart = (items: CartItemWithDetails[]) => {
    if (onAddToCart) {
      onAddToCart(items);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[animatedStyle, styles.container]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <AppCard variant="elevated" padding="sm">
          <View style={styles.contentRow}>
            {/* Product Details */}
            <View style={styles.detailsContainer}>
              {/* Header Row with Name and Status */}
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <AppText style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </AppText>
                  {product.brand && (
                    <AppText style={styles.productBrand} numberOfLines={1}>
                      {product.brand}
                    </AppText>
                  )}
                </View>
                <ProductStatusBadge status={product.stock ? 'in_stock' : 'out_of_stock'} />
              </View>

              {/* Scheme/Badge */}
              {product.discount && product.discount > 0 && (
                <View style={styles.schemeContainer}>
                  <AppText style={[styles.schemeText, { color: colors.success }]}>
                    🏷️ {product.discount}% OFF
                  </AppText>
                </View>
              )}

              {/* Unit Selector */}
              <ProductUnitSelector product={product} onAddToCart={handleAddToCart} mode={mode} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
};
