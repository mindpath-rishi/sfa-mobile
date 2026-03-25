// components/ReasonCategoryCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReasonCategory } from '../../types/checkin.types';
import { useReasonCategoryCardStyles } from '../../styles/ReasonCategoryCard.styles';

interface ReasonCategoryCardProps {
  category: ReasonCategory;
  onPress: (id: string) => void;
}

export const ReasonCategoryCard: React.FC<ReasonCategoryCardProps> = ({ category, onPress }) => {
  const styles = useReasonCategoryCardStyles();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: category.color + '30' }]}
      onPress={() => onPress(category.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon as any} size={32} color={category.color} />
      </View>
      <Text style={styles.title}>{category.title}</Text>
    </TouchableOpacity>
  );
};
