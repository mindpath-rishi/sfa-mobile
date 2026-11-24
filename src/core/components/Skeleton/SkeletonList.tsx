import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import Skeleton from './Skeleton';

type SkeletonListProps = {
  rows?: number;
  style?: StyleProp<ViewStyle>;
};

/** Placeholder rows shown while a list loads (instead of a full-screen spinner). */
export function SkeletonList({ rows = 4, style }: SkeletonListProps) {
  const { colors } = useTheme();

  return (
    <View style={[{ gap: 10 }, style]} accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: rows }, (_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.surface,
          }}
        >
          <Skeleton width={40} height={40} variant="circle" />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="60%" height={14} borderRadius={7} />
            <Skeleton width="40%" height={12} borderRadius={6} />
          </View>
          <Skeleton width={56} height={20} borderRadius={10} />
        </View>
      ))}
    </View>
  );
}
