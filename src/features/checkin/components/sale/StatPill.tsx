import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface StatPillProps {
  value: number;
  label: string;
  highlight?: boolean;
}

export const StatPill: React.FC<StatPillProps> = ({ value, label, highlight = false }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        backgroundColor: highlight ? colors.primary + '10' : colors.background,
        borderWidth: 0.5,
        borderColor: colors.border + '30',
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: highlight ? colors.primary : colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.textTertiary,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
