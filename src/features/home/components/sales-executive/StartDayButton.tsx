import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StartDayButtonProps } from '../../types/startDay.types';
import { useStartDayButtonStyles } from '../../styles/StartDayButton.styles';
import { AppText } from '@/core/components';

export const StartDayButton: React.FC<StartDayButtonProps> = ({ onPress }) => {
  const styles = useStartDayButtonStyles();

  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <View style={styles.contentContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="sunny" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <AppText style={styles.title}>START YOUR DAY</AppText>
          <AppText style={styles.subtitle}>Begin your work shift</AppText>
        </View>
      </View>
      <View style={styles.arrowCircle}>
        <Ionicons name="arrow-forward" size={18} style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
};
