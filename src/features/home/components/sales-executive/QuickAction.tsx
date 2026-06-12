import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { QuickActionProps } from '../../types/quickaction.types';
import { AppText } from '@/core/components';

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  color,
  onPress,
  badge,
  size = 'medium',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const buttonSize = size === 'large' ? 62 : size === 'small' ? 48 : 56;
  const iconSize = size === 'large' ? 26 : size === 'small' ? 18 : 23;

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(withSpring(0.9, { damping: 10 }), withSpring(1, { damping: 10 }));
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={1}
      style={{ width: 76, alignItems: 'flex-start' }}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: '100%',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingVertical: 4,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: color + '18',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: color + '28',
          }}
        >
          <Ionicons name={icon} size={iconSize} color={color} />

          {badge !== undefined && badge > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.error,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
                borderWidth: 1.5,
                borderColor: colors.surface,
              }}
            >
              <AppText style={{ color: colors.textInverse, fontSize: 11, fontWeight: 'bold' }}>
                {badge > 99 ? '99+' : badge}
              </AppText>
            </View>
          )}
        </View>

        <AppText
          style={{
            color: disabled ? colors.textTertiary : colors.textPrimary,
            fontSize: 12,
            fontWeight: '500',
            textAlign: 'left',
            marginTop: 7,
          }}
          numberOfLines={2}
        >
          {label}
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
};
