import React from 'react';
import { View, Text } from 'react-native';
import { SectionHeaderProps } from '../../types/sectionHeaderTypes';
import { useSectionHeaderStyles } from '../../styles/SectionHeader.styles';
import { AppText } from '@/core/components';

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const styles = useSectionHeaderStyles();

  return (
    <View style={styles.container}>
      <AppText style={styles.text}>{title}</AppText>
    </View>
  );
};
