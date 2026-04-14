import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Get size values
  const getSize = () => {
    switch (size) {
      case 'small':
        return { container: 44, icon: 20, fontSize: 11 };
      case 'large':
        return { container: 68, icon: 28, fontSize: 12 };
      default:
        return { container: 56, icon: 24, fontSize: 12 };
    }
  };

  const sizeValues = getSize();

  const handlePress = () => {
    if (disabled) return;
    scale.value = withSequence(withSpring(0.9, { damping: 10 }), withSpring(1, { damping: 10 }));
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={1}>
      <Animated.View
        style={[animatedStyle, { alignItems: 'center', width: sizeValues.container + 16 }]}
      >
        <View>
          <LinearGradient
            colors={[color, color + 'CC']}
            style={{
              width: sizeValues.container,
              height: sizeValues.container,
              borderRadius: sizeValues.container / 2,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Ionicons name={icon} size={sizeValues.icon} color="white" />
          </LinearGradient>

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
                borderColor: 'white',
              }}
            >
              <AppText style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                {badge > 99 ? '99+' : badge}
              </AppText>
            </View>
          )}
        </View>

        <AppText
          style={{
            color: disabled ? colors.textTertiary : colors.textSecondary,
            fontSize: sizeValues.fontSize,
            textAlign: 'center',
          }}
        >
          {label}
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
};
