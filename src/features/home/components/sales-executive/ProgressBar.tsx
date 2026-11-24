import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from '@/core/components/Text/ScaledText';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export const ProgressBar = ({ progress, label, value, color }: any) => {
  const width = useSharedValue(0);
  const { colors } = useTheme();

  useEffect(() => {
    width.value = withSpring(progress);
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View>
      <AppText>{label}</AppText>

      <View style={{ height: 6, backgroundColor: colors.background, borderRadius: 3 }}>
        <Animated.View style={[style, { height: 6, backgroundColor: color, borderRadius: 3 }]} />
      </View>

      <AppText>{value}</AppText>
    </View>
  );
};
