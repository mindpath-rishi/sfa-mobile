import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import { useCategoryCardStyles } from '../../styles/CategoryCard.styles';
import { CATEGORY_ICONS } from '../../constants/categoryicon';

interface Props {
  category: string;
  count: number;
  onPress: () => void;
}

export const CategoryCard: React.FC<Props> = ({ category, count, onPress }) => {
  const { colors } = useTheme();
  const styles = useCategoryCardStyles();
  const iconName = CATEGORY_ICONS[category] || 'grid';

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <AppCard variant="elevated" padding="md" style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={iconName as any} size={20} color={colors.primary} />
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.itemCount}>{count} items</Text>
      </AppCard>
    </TouchableOpacity>
  );
};
