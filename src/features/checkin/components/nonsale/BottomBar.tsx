// components/ui/BottomBar.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';

interface BottomBarProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const BottomBar: React.FC<BottomBarProps> = ({ children, style }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: insets.bottom || 16,
        backgroundColor: colors.background,
        borderTopWidth: 0.5,
        borderTopColor: colors.border + '25',
        ...style,
      }}
    >
      {children}
    </View>
  );
};
