// StockProductItem.tsx

import React from 'react';
import { Animated, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { StockProductItemProps } from '../types/stock.types';

export const StockProductItem: React.FC<StockProductItemProps> = ({
  item,
  index,
  formatStock,
  formatCurrency,
  isOutOfStock,
  opacityAnim,
  colors,
  styles,
  onPress,
}) => {
  const outOfStock = isOutOfStock(item);
  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      { translateY: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
    ],
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={!onPress}>
      <Animated.View style={[styles.productRow, animatedStyle]}>
        {/* Left Section: Index & Status */}
        <View style={styles.productLeft}>
          <AppText style={styles.productIndex}>{index + 1}</AppText>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: outOfStock ? colors.error : colors.success },
            ]}
          />
        </View>

        {/* Center Section: Product Info */}
        <View style={styles.productCenter}>
          <AppText
            style={[styles.productName, outOfStock && { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.name}
          </AppText>
          {item.productId && (
            <View style={styles.productMetaRow}>
              <Ionicons name="barcode-outline" size={10} color={colors.textTertiary} />
              <AppText style={[styles.productCode, { color: colors.textTertiary }]}>
                {item.productId}
              </AppText>
            </View>
          )}
        </View>

        {/* Right Section: Stock & Price */}
        <View style={styles.productRight}>
          {outOfStock ? (
            <View style={styles.outOfStockBadge}>
              <AppText style={styles.outOfStockText}>Out of Stock</AppText>
            </View>
          ) : (
            <>
              <View style={styles.stockBadge}>
                <Ionicons name="cube-outline" size={10} color={colors.primary} />
                <AppText style={[styles.productStock, { color: colors.primary }]}>
                  {formatStock(item.cases, item.pieces)}
                </AppText>
              </View>
              {item.price && (
                <View style={styles.priceBadge}>
                  <Ionicons name="cash-outline" size={10} color={colors.textTertiary} />
                  <AppText style={[styles.productPrice, { color: colors.textTertiary }]}>
                    {formatCurrency(item.price)}
                  </AppText>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};
