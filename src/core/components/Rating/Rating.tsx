// src/core/components/Rating/Rating.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text/Text';
import { RatingProps } from './Rating.types';
import { useRatingStyles } from './Rating.styles';

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  editable = false,
  onChange,
  showLabel = false,
  labelFormat = 'number',
  color,
  emptyColor,
  style,
  testID = 'rating',
}) => {
  const styles = useRatingStyles(size, color, emptyColor, style);
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const handlePress = (rating: number) => {
    if (editable && onChange) {
      onChange(rating === value && rating === 1 ? 0 : rating);
    }
  };

  const getLabel = () => {
    switch (labelFormat) {
      case 'number':
        return `${value.toFixed(1)} / ${max}`;
      case 'percentage':
        return `${Math.round((value / max) * 100)}%`;
      case 'fraction':
        return `${value}/${max}`;
      default:
        return `${value.toFixed(1)} / ${max}`;
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.starsContainer}>
        {stars.map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handlePress(star)}
            disabled={!editable}
            activeOpacity={editable ? 0.7 : 1}
            testID={`${testID}-star-${star}`}
          >
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={24}
              color={star <= value ? styles.filledStar.color : styles.emptyStar.color}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      {showLabel && (
        <Text variant="body" style={styles.label}>
          {getLabel()}
        </Text>
      )}
    </View>
  );
};
