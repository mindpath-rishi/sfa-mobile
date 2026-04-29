// StockProductItem.tsx

import React from 'react';
import { Animated, View } from 'react-native';

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
}) => {
  const outOfStock = isOutOfStock(item);
  const animatedStyle = {
    opacity: opacityAnim,
    transform: [
      { translateY: opacityAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
    ],
  };

  return (
    <Animated.View style={[styles.productRow, animatedStyle]}>
      <View style={styles.productLeft}>
        <AppText style={[styles.productIndex, { color: colors.textTertiary }]}>
          {index + 1}
        </AppText>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: outOfStock ? colors.error : colors.success },
          ]}
        />
      </View>

      <View style={styles.productCenter}>
        <AppText
          style={[styles.productName, outOfStock && { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.name}
        </AppText>
        {item.productId && (
          <AppText style={[styles.productCode, { color: colors.textTertiary }]}>
            {item.productId}
          </AppText>
        )}
      </View>

      <View style={styles.productRight}>
        {outOfStock ? (
          <AppText style={[styles.outOfStockText, { color: colors.error }]}>Out</AppText>
        ) : (
          <>
            <AppText style={[styles.productStock, { color: colors.primary }]}>
              {formatStock(item.cases, item.pieces)}
            </AppText>
            {item.price && (
              <AppText style={[styles.productPrice, { color: colors.textTertiary }]}>
                {formatCurrency(item.price)}
              </AppText>
            )}
          </>
        )}
      </View>
    </Animated.View>
  );
};