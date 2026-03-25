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
import { ProductPrice } from './ProductPrice';
import { ProductUnitSelector } from './ProductUnitSelector';
import { Product, CartItem } from '../../types/product.types';
import { useProductGridCardStyles } from '../../styles/ProductGridCard.styles';
import { AppText } from '@/core/components';

interface Props {
  product: Product;
  index: number;
  onAddToCart?: (items: CartItem[]) => void;
}

export const ProductGridCard: React.FC<Props> = ({ product, index, onAddToCart }) => {
  const { colors } = useTheme();
  const styles = useProductGridCardStyles();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.98, { damping: 3 }), withSpring(1, { damping: 3 }));
    router.push(`/products/${product.id}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleAddToCart = (items: CartItem[]) => {
    if (onAddToCart) {
      onAddToCart(items);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[animatedStyle, styles.container]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <AppCard variant="elevated" padding="sm" style={styles.card}>
          <ProductImage image={product.image} size="large" discount={product.discount} />

          <View style={styles.content}>
            <AppText style={styles.productName} numberOfLines={1}>
              {product.name}
            </AppText>
            <AppText style={styles.productBrand} numberOfLines={1}>
              {product.brand} • {product.unit}
            </AppText>

            <View style={styles.priceRow}>
              <ProductPrice price={product.price} mrp={product.mrp} size="small" />
              <ProductStatusBadge status={product.status} />
            </View>

            <ProductUnitSelector product={product} onAddToCart={handleAddToCart} />
          </View>
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
};
