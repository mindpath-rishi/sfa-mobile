import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, Platform, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  enabled?: boolean;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 4,
  colors: propColors,
  enabled = true,
}) => {
  const { colors: themeColors } = useTheme();

  if (!enabled) return null;

  const particleColors = propColors || [
    themeColors.primary + '15',
    themeColors.success + '10',
    themeColors.info + '12',
  ];

  // Web version with CSS animations
  if (Platform.OS === 'web') {
    // Add keyframes to document (only once)
    if (typeof document !== 'undefined' && !document.getElementById('particle-keyframes')) {
      const style = document.createElement('style');
      style.id = 'particle-keyframes';
      style.textContent = `
        @keyframes float-particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(30px, -20px) scale(1.2);
            opacity: 0.4;
          }
          50% {
            transform: translate(50px, 30px) scale(0.9);
            opacity: 0.3;
          }
          75% {
            transform: translate(-20px, 40px) scale(1.1);
            opacity: 0.5;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const particles = useMemo(
      () =>
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          size: 30 + i * 15,
          left: Math.random() * 100,
          top: Math.random() * 100,
          color: particleColors[i % particleColors.length],
          duration: 15 + i * 5,
          delay: i * 2,
          xMove: 30 + Math.random() * 40,
          yMove: 20 + Math.random() * 40,
        })),
      [count, particleColors],
    );

    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {particles.map((particle) => (
          <View
            key={particle.id}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: particle.color,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              // animation: `float-particle ${particle.duration}s infinite ease-in-out`,
              // animationDelay: `${particle.delay}s`,
              transform: 'translate(0, 0)',
            }}
          />
        ))}
      </View>
    );
  }

  // Native version with Reanimated
  const NativeParticles = () => {
    const particles = useMemo(
      () =>
        Array.from({ length: count }).map((_, i) => ({
          id: i,
          size: 30 + i * 12,
          initialX: Math.random() * width,
          initialY: Math.random() * height,
          color: particleColors[i % particleColors.length],
        })),
      [count, particleColors],
    );

    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {particles.map((particle) => (
          <NativeParticle key={particle.id} {...particle} />
        ))}
      </View>
    );
  };

  return <NativeParticles />;
};

// Native particle with Reanimated
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  withDelay,
} from 'react-native-reanimated';

const NativeParticle: React.FC<{
  size: number;
  initialX: number;
  initialY: number;
  color: string;
}> = ({ size, initialX, initialY, color }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    const duration = 8000 + Math.random() * 4000;
    const xOffset = 30 + Math.random() * 40;
    const yOffset = 30 + Math.random() * 40;
    const delay = Math.random() * 2000;

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(xOffset, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(yOffset, {
          duration: duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.3, {
          duration: duration * 1.5,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.5, {
          duration: duration * 2,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const particleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        particleStyle,
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top: initialY,
          left: initialX,
        },
      ]}
    />
  );
};
