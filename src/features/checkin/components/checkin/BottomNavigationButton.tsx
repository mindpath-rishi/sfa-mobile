// components/BottomNavigationButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomNavigationButtonStyles } from '../../styles/BottomNavigationButton.styles';

interface BottomNavigationButtonProps {
  onPress: () => void;
  iconName: string;
  label: string;
}

export const BottomNavigationButton: React.FC<BottomNavigationButtonProps> = ({
  onPress,
  iconName,
  label,
}) => {
  const styles = useBottomNavigationButtonStyles();

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={iconName as any} size={20} color={styles.text.color} />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};
