import React, { useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChipProps } from './Chip.types';
import { useChipStyles } from './Chip.styles';

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  outline = false,
  closable = false,
  onClose,
  onPress,
  disabled = false,
  style,
  labelStyle,
  testID = 'chip',
}) => {
  const [pressed, setPressed] = useState(false);
  const styles = useChipStyles(variant, size, outline, disabled, pressed, style);
  const isPressable = !!onPress;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => isPressable && setPressed(true)}
      onPressOut={() => isPressable && setPressed(false)}
      disabled={disabled || !isPressable}
      activeOpacity={1}
      testID={testID}
    >
      <View style={styles.chip}>
        <Text style={[styles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Text>

        {closable && (
          <TouchableOpacity
            onPress={onClose}
            disabled={disabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={`${testID}-close`}
          >
            <Ionicons
              name="close"
              size={styles.label.fontSize}
              color={styles.label.color}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};
