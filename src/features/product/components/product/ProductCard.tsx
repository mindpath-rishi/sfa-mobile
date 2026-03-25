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
import { Product, CartItem } from '../../types/product.types';
import { useProductCardStyles } from '../../styles/ProductCard.styles';
import Card from '@/core/components/Card/Card';
import { AppText } from '@/core/components';

interface Props {
  product: Product;
  index: number;
  onAddToCart?: (items: CartItem[]) => void;
}

export const ProductCard: React.FC<Props> = ({ product, index, onAddToCart }) => {
  const { colors } = useTheme();
  const styles = useProductCardStyles();
  const scale = useSharedValue(1);

  const handlePress = () => {
    // scale.value = withSequence(withSpring(0.98, { damping: 3 }), withSpring(1, { damping: 3 }));
    // router.push(`/products/${product.id}`);
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
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <AppCard variant="elevated" padding="md" style={styles.card}>
          <View style={styles.contentRow}>
            {/* Product Image */}
            {/* <ProductImage image={product.image} size="medium" discount={product.discount} /> */}

            {/* Product Details */}
            <View style={styles.detailsContainer}>
              {/* Header Row with Name and Status */}
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <AppText style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </AppText>
                  {/* <Text style={styles.productMeta} numberOfLines={1}>
                    {product.brand} • {product.category}
                  </Text> */}
                </View>
                <ProductStatusBadge status={product.status} />
              </View>

              {/* SKU and Unit Info */}
              {/* <View style={styles.infoRow}>
                <Text style={styles.skuText}>SKU: {product.sku}</Text>
                <Text style={styles.unitText}>Unit: {product.unit}</Text>
              </View> */}

              {/* Tags */}
              {/* <ProductTags tags={product.tags} limit={2} /> */}

              {/* Price and Stock */}
              {/* <View style={styles.priceRow}>
                <ProductPrice price={product.price} mrp={product.mrp} size="medium" />
                <Text style={styles.stockText}>{product.stock} units</Text>
              </View> */}

              {/* Scheme/Badge */}
              {product.scheme && (
                <View style={styles.schemeContainer}>
                  <AppText style={[styles.schemeText, { color: colors.success }]}>
                    🏷️ {product.scheme}
                  </AppText>
                </View>
              )}

              {/* Unit Selector */}
              <ProductUnitSelector product={product} onAddToCart={handleAddToCart} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
};
