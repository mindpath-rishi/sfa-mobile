import React from 'react';
import type { StyleProp, TouchableOpacityProps, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';

type ListingCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  testID?: string;
  touchableProps?: Omit<TouchableOpacityProps, 'children' | 'style' | 'activeOpacity' | 'onPress'>;
};

export function ListingCard({
  children,
  onPress,
  style,
  activeOpacity = 0.7,
  testID = 'listing-card',
  touchableProps,
}: ListingCardProps) {
  const { colors } = useTheme();

  const resolvedOnPress = touchableProps?.onPress ?? onPress;

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 14,
          marginBottom: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: colors.divider,
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
      activeOpacity={resolvedOnPress ? activeOpacity : 1}
      onPress={resolvedOnPress}
      disabled={!resolvedOnPress}
      {...touchableProps}
    >
      {children}
    </TouchableOpacity>
  );
}
