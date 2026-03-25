import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Text from '../Text/Text';
import { ProgressBarProps } from './ProgressBar.types';
import { useProgressBarStyles } from './ProgressBar.styles';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'top',
  indeterminate = false,
  animated = true,
  style,
  testID = 'progress-bar',
}) => {
  const styles = useProgressBarStyles(variant, size, progress, style);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && !indeterminate) {
      Animated.timing(animatedWidth, {
        toValue: Math.min(100, Math.max(0, progress)),
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);

  const fillWidth = indeterminate
    ? '50%'
    : animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
      });

  const renderLabel = () => {
    if (!showLabel) return null;

    const label = (
      <View style={styles.labelContainer}>
        <Text variant="caption" style={styles.label}>
          Progress
        </Text>
        <Text variant="caption" style={styles.percentage}>
          {Math.round(progress)}%
        </Text>
      </View>
    );

    return label;
  };

  return (
    <View style={styles.container} testID={testID}>
      {labelPosition === 'top' && renderLabel()}

      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: fillWidth }]} />
      </View>

      {labelPosition === 'bottom' && renderLabel()}
    </View>
  );
};
