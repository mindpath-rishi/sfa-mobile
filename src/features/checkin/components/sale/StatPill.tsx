// components/SalesSummary/components/StatPill.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface StatPillProps {
  value: string | number;
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
        paddingHorizontal: 6,
        backgroundColor: highlight ? colors.primary + '12' : colors.background,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: highlight ? colors.primary + '40' : colors.border + '40',
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: highlight ? colors.primary : colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: colors.textTertiary,
          marginTop: 2,
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
