import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSectionHeaderStyles } from '../../styles/SectionHeader.styles';

interface Props {
  title: string;
  count: number;
}

export const SectionHeader: React.FC<Props> = ({ title, count }) => {
  const { colors } = useTheme();
  const styles = useSectionHeaderStyles();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.title}>
        {title} • {count}
      </Text>
      <TouchableOpacity>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
  );
};
