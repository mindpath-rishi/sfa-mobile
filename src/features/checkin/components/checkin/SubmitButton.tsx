// components/SubmitButton.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSubmitButtonStyles } from '../../styles/SubmitButton.styles';

interface SubmitButtonProps {
  onPress: () => void;
  isSubmitting: boolean;
  isDisabled?: boolean;
  title: string;
  loadingTitle?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onPress,
  isSubmitting,
  isDisabled = false,
  title,
  loadingTitle = 'Submitting...',
}) => {
  const { colors } = useTheme();
  const styles = useSubmitButtonStyles();
  const disabled = isDisabled || isSubmitting;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.primary },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled}
    >
      <Text style={styles.text}>{isSubmitting ? loadingTitle : title}</Text>
    </TouchableOpacity>
  );
};
