import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { useFilterChipStyles } from '../../styles/FilterChip.styles';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

export const FilterChip: React.FC<Props> = ({ label, active, onPress, count }) => {
  const { colors } = useTheme();
  const styles = useFilterChipStyles();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.9, { damping: 3 }), withSpring(1, { damping: 3 }));
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View>
        <LinearGradient
          colors={
            active
              ? [colors.primary, colors.primaryDark || colors.primary + 'CC']
              : ['transparent', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderColor: active ? colors.primary : colors.border }]}
        >
          <Text style={[styles.label, { color: active ? 'white' : colors.textSecondary }]}>
            {label} {count ? `(${count})` : ''}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};
