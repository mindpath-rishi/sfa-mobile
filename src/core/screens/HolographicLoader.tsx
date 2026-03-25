import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const HolographicLoader = ({ size = 120, color = '#0891b2' }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(0.8, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      false,
    );

    opacity.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const innerRingStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${-rotation.value * 1.5}deg` },
      { scale: interpolate(scale.value, [0.8, 1.2], [1.2, 0.8]) },
    ],
    opacity: interpolate(opacity.value, [0.5, 1], [1, 0.5]),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, ringStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#fff" stopOpacity="0.9" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#grad)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="70 30"
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.innerRing, innerRingStyle]}>
        <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 70 70">
          <Circle
            cx="35"
            cy="35"
            r="30"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="40 20"
            opacity="0.5"
          />
        </Svg>
      </Animated.View>

      <View style={[styles.center, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  ring: {
    position: 'absolute',
  },
  innerRing: {
    position: 'absolute',
  },
  center: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.8,
  },
});

export default HolographicLoader;
