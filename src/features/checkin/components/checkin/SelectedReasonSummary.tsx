// components/SelectedReasonSummary.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useSelectedReasonSummaryStyles } from '../../styles/SelectedReasonSummary.styles';

interface SelectedReasonSummaryProps {
  categoryTitle?: string;
  reasonLabel?: string;
}

export const SelectedReasonSummary: React.FC<SelectedReasonSummaryProps> = ({
  categoryTitle,
  reasonLabel,
}) => {
  const styles = useSelectedReasonSummaryStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selected Reason:</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{categoryTitle}</Text>
        <Text style={styles.subValue}>{reasonLabel}</Text>
      </View>
    </View>
  );
};
