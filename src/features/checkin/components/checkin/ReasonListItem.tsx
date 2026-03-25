// components/ReasonListItem.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReasonListItemStyles } from '../../styles/ReasonListItem.styles';

interface ReasonListItemProps {
  id: string;
  label: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ReasonListItem: React.FC<ReasonListItemProps> = ({
  id,
  label,
  isSelected,
  onSelect,
}) => {
  const styles = useReasonListItemStyles();

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={() => onSelect(id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>{label}</Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={styles.selectedText.color} />
      )}
    </TouchableOpacity>
  );
};
