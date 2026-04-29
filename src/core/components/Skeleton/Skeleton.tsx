import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { SkeletonProps } from './Skeleton.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { createSkeletonStyles } from './Skeleton.styles';

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  variant = 'rect',
  borderRadius,
  animated = true,
  style,
  testID = 'skeleton',
}) => {
  const { colors } = useTheme();
  const styles = createSkeletonStyles(colors);

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!animated) return;

    // Main shimmer animation
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    );
    
    // Optional: Pulsing opacity for more dynamic effect
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    shimmerLoop.start();
    pulseLoop.start();

    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [animated]);

  // Diagonal shimmer effect with skew
  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-200, 0, 200],
  });

  const getBorderRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    switch (variant) {
      case 'circle':
        return 999;
      case 'text':
        return 4;
      default:
        return 8;
    }
  };

  const variantStyle =
    variant === 'circle' ? styles.circle : variant === 'text' ? styles.text : styles.rect;

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        variantStyle,
        {
          width,
          height,
          borderRadius: getBorderRadius(),
        },
        style,
      ]}
    >
      {animated && (
        <>
          {/* Main shimmer effect */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX }, { skewX: '-15deg' }],
                opacity: shimmerOpacity,
              },
            ]}
          />
          
          {/* Secondary subtle shimmer for depth */}
          <Animated.View
            style={[
              styles.shimmerSecondary,
              {
                transform: [{ translateX: Animated.multiply(translateX, -0.5) }, { skewX: '-15deg' }],
              },
            ]}
          />
        </>
      )}
    </View>
  );
};

export default Skeleton;