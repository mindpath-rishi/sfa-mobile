import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text/Text';
import Button from '../Button/Button';
import { EmptyStateProps } from './EmptyState.types';
import { useEmptyStateStyles } from './EmptyState.styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'sad-outline',
  title,
  description,
  actionLabel,
  onAction,
  iconSize = 64,
  iconColor,
  style,
  titleStyle,
  descriptionStyle,
  testID = 'empty-state',
}) => {
  const { colors } = useTheme();
  const styles = useEmptyStateStyles(style);

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={iconSize} color={iconColor || colors.textTertiary} />
      </View>

      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {description && <Text style={[styles.description, descriptionStyle]}>{description}</Text>}

      {actionLabel && onAction && <Button title={actionLabel} onPress={onAction} size="medium" />}
    </View>
  );
};
