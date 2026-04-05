import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useOutletTagsStyles } from '../../styles/OutletTags.styles';

interface Props {
  tags: string[];
}

export const OutletTags: React.FC<Props> = ({ tags }) => {
  const { colors } = useTheme();
  const styles = useOutletTagsStyles();

  return (
    <View style={styles.container}>
      {tags.map((tag: string, idx: number) => (
        <View key={idx} style={[styles.tag, { backgroundColor: colors.info + '10' }]}>
          <Text style={[styles.tagText, { color: colors.info }]}>#{tag}</Text>
        </View>
      ))}
    </View>
  );
};
