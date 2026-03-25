import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProductTagsStyles } from '../../styles/ProductTags.styles';
import { AppText } from '@/core/components';

interface Props {
  tags: string[];
  limit?: number;
}

export const ProductTags: React.FC<Props> = ({ tags, limit = 2 }) => {
  const { colors } = useTheme();
  const styles = useProductTagsStyles();
  const displayTags = tags.slice(0, limit);

  return (
    <View style={styles.container}>
      {displayTags.map((tag, idx) => (
        <View key={idx} style={[styles.tag, { backgroundColor: colors.info + '10' }]}>
          <AppText style={[styles.tagText, { color: colors.info }]}>#{tag}</AppText>
        </View>
      ))}
    </View>
  );
};
