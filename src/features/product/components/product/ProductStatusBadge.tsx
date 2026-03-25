import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { ProductStatus } from '../../types/product.types';
import { useProductStatusBadgeStyles } from '../../styles/ProductStatusBadge.styles';
import { AppText } from '@/core/components';

interface Props {
  status: ProductStatus;
}

export const ProductStatusBadge: React.FC<Props> = ({ status }) => {
  const { colors } = useTheme();
  const styles = useProductStatusBadgeStyles();

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'in_stock':
        return colors.success;
      case 'low_stock':
        return colors.warning;
      case 'out_of_stock':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: ProductStatus) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor(status) + '20' }]}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor(status) }]} />
      <AppText style={[styles.text, { color: getStatusColor(status) }]}>
        {getStatusText(status)}
      </AppText>
    </View>
  );
};
