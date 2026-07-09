// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { router } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { AppCard } from '@/core/components/Card';
// import Animated, {
//   useAnimatedStyle,
//   withSpring,
//   withSequence,
//   useSharedValue,
//   FadeInDown,
// } from 'react-native-reanimated';

// import { ProductImage } from './ProductImage';
// import { ProductStatusBadge } from './ProductStatusBadge';
// import { ProductTags } from './ProductTags';
// import { ProductPrice } from './ProductPrice';
// import { ProductUnitSelector } from './ProductUnitSelector';
// import { Product, CartItem, CartItemWithDetails } from '../../types/product.types';
// import { useProductCardStyles } from '../../styles/ProductCard.styles';
// import Card from '@/core/components/Card/Card';
// import { AppText } from '@/core/components';

// interface Props {
//   product: any;
//   index: number;
//   onAddToCart?: (items: CartItemWithDetails[]) => void;
//   mode: 'sales' | 'topup';
// }

// export const ProductCard: React.FC<Props> = ({ product, index, onAddToCart, mode }) => {
//   const { colors } = useTheme();
//   const styles = useProductCardStyles();
//   const scale = useSharedValue(1);

//   const handlePress = () => {
//     // Navigate to product details
//     // router.push(`/products/${product.id}`);
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const handleAddToCart = (items: CartItemWithDetails[]) => {
//     if (onAddToCart) {
//       onAddToCart(items);
//     }
//   };

//   return (
//     <Animated.View
//       entering={FadeInDown.delay(index * 50).springify()}
//       style={[animatedStyle, styles.container]}
//     >
//       <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
//         <AppCard variant="elevated" padding="sm">
//           <View style={styles.contentRow}>
//             {/* Product Details */}
//             <View style={styles.detailsContainer}>
//               {/* Header Row with Name and Status */}
//               <View style={styles.headerRow}>
//                 <View style={styles.titleContainer}>
//                   <AppText style={styles.productName} numberOfLines={2}>
//                     {product.name}
//                   </AppText>
//                   {product.brand && (
//                     <AppText style={styles.productBrand} numberOfLines={1}>
//                       {product.brand}
//                     </AppText>
//                   )}
//                 </View>
//                 <ProductStatusBadge status={product.stock ? 'in_stock' : 'out_of_stock'} />
//               </View>

//               {/* Scheme/Badge */}
//               {product.discount && product.discount > 0 && (
//                 <View style={styles.schemeContainer}>
//                   <AppText style={[styles.schemeText, { color: colors.success }]}>
//                     🏷️ {product.discount}% OFF
//                   </AppText>
//                 </View>
//               )}

//               {/* Unit Selector */}
//               <ProductUnitSelector product={product} onAddToCart={handleAddToCart} mode={mode} />
//             </View>
//           </View>
//         </AppCard>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

import React, { useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { AppCard } from '@/core/components/Card';
import { AppText } from '@/core/components';

import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductUnitSelector } from './ProductUnitSelector';
import { CartItemWithDetails } from '../../types/product.types';
import { useProductCardStyles } from '../../styles/ProductCard.styles';

interface Props {
  product: any;
  index: number;
  onAddToCart?: (items: CartItemWithDetails[]) => void;
  mode: 'sales' | 'topup';
}

const ProductCardComponent: React.FC<Props> = ({ product, onAddToCart, mode }) => {
  const styles = useProductCardStyles();

  const handlePress = useCallback(() => {
    // Product detail navigation disabled for now.
    // router.push(`/products/${product?.productId}`);
  }, []);

  const handleAddToCart = useCallback(
    (items: CartItemWithDetails[]) => {
      onAddToCart?.(items);
    },
    [onAddToCart],
  );

  const isInStock = Number(product?.stock ?? 0) > 0;
  const discount = Number(product?.discount ?? 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <AppCard variant="elevated" padding="sm">
          <View style={styles.contentRow}>
            <View style={styles.detailsContainer}>
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <AppText style={styles.productName} numberOfLines={2}>
                    {product?.name || 'Unnamed Product'}
                  </AppText>

                  {!!product?.brand && (
                    <AppText style={styles.productBrand} numberOfLines={1}>
                      {product.brand}
                    </AppText>
                  )}
                </View>

                <ProductStatusBadge status={isInStock ? 'in_stock' : 'out_of_stock'} />
              </View>

              {discount > 0 && (
                <View style={styles.schemeContainer}>
                  <AppText style={styles.schemeText}>🏷️ {discount}% OFF</AppText>
                </View>
              )}

              <ProductUnitSelector product={product} onAddToCart={handleAddToCart} mode={mode} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </View>
  );
};

export const ProductCard = React.memo(ProductCardComponent, (prev, next) => {
  return (
    prev.mode === next.mode &&
    prev.product?.productId === next.product?.productId &&
    prev.product?.name === next.product?.name &&
    prev.product?.brand === next.product?.brand &&
    prev.product?.stock === next.product?.stock &&
    prev.product?.discount === next.product?.discount &&
    prev.product?.caseQty === next.product?.caseQty &&
    prev.product?.pieceQty === next.product?.pieceQty &&
    prev.product?.casePrice === next.product?.casePrice &&
    prev.product?.piecePrice === next.product?.piecePrice &&
    prev.product?.unitQtyInCase === next.product?.unitQtyInCase &&
    prev.product?.caseNetWeight === next.product?.caseNetWeight &&
    prev.product?.pieceNetWeight === next.product?.pieceNetWeight
  );
});

ProductCard.displayName = 'ProductCard';
