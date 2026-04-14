import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProductPriceStyles } from '../../styles/ProductPrice.styles';
import { AppText } from '@/core/components';

interface Props {
  price: number;
  mrp: number;
  size?: 'small' | 'medium' | 'large';
  showDiscount?: boolean;
}

export const ProductPrice: React.FC<Props> = ({
  price,
  mrp,
  size = 'medium',
  showDiscount = true,
}) => {
  const { colors } = useTheme();
  const styles = useProductPriceStyles();
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const getPriceSize = () => {
    switch (size) {
      case 'small':
        return styles.smallPrice;
      case 'medium':
        return styles.mediumPrice;
      case 'large':
        return styles.largePrice;
    }
  };

  const getMrpSize = () => {
    switch (size) {
      case 'small':
        return styles.smallMrp;
      case 'medium':
        return styles.mediumMrp;
      case 'large':
        return styles.largeMrp;
    }
  };

  return (
    <View style={styles.container}>
      <AppText style={[styles.price, getPriceSize()]}>K{price}</AppText>
      {mrp > price && (
        <>
          <AppText style={[styles.mrp, getMrpSize()]}>K{mrp}</AppText>
          {showDiscount && discount > 0 && (
            <AppText style={[styles.discount, { color: colors.success }]}>{discount}% off</AppText>
          )}
        </>
      )}
    </View>
  );
};
