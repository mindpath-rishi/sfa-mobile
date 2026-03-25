import React from 'react';
import { View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProductImageStyles } from '../../styles/ProductImage.styles';
import { AppText } from '@/core/components';

interface Props {
  image: string | null;
  size?: 'small' | 'medium' | 'large';
  discount?: number;
}

export const ProductImage: React.FC<Props> = ({ image, size = 'medium', discount }) => {
  const { colors } = useTheme();
  const styles = useProductImageStyles();

  const sizeStyle =
    size === 'small' ? styles.small : size === 'medium' ? styles.medium : styles.large;

  return (
    <View style={[styles.container, sizeStyle]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.border + '20' }]}>
          <Ionicons
            name="image-outline"
            size={size === 'small' ? 16 : 24}
            color={colors.textTertiary}
          />
        </View>
      )}
      {discount ? (
        <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
          <AppText style={styles.discountText}>{discount}%</AppText>
        </View>
      ) : null}
    </View>
  );
};
