// components/ui/ReasonCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card/Card';

interface ReasonCardProps {
  id: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  showCheckmark?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

export const ReasonCard: React.FC<ReasonCardProps> = ({
  label,
  isSelected,
  onPress,
  showCheckmark = true,
  variant = 'default',
}) => {
  const { colors } = useTheme();

  const getPadding = () => {
    switch (variant) {
      case 'compact':
        return 'sm';
      case 'large':
        return 'lg';
      default:
        return 'md';
    }
  };

  const getFontSize = () => {
    switch (variant) {
      case 'compact':
        return 13;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <AppCard
      variant="outlined"
      selected={isSelected}
      selectedVariant="primary"
      onPress={onPress}
      padding={getPadding()}
      radius="lg"
      style={{ marginBottom: 8 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontSize: getFontSize(),
            fontWeight: isSelected ? '600' : '400',
            color: isSelected ? colors.primary : colors.textPrimary,
            flex: 1,
          }}
        >
          {label}
        </Text>
        {showCheckmark && isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </View>
    </AppCard>
  );
};
