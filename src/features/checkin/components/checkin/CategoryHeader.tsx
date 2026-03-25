// components/CategoryHeader.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReasonCategory } from '../../types/checkin.types';
import { useCategoryHeaderStyles } from '../../styles/CategoryHeader.styles';

interface CategoryHeaderProps {
  category: ReasonCategory;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category }) => {
  const styles = useCategoryHeaderStyles();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon as any} size={28} color={category.color} />
      </View>
      <Text style={[styles.title, { color: category.color }]}>{category.title}</Text>
    </View>
  );
};
