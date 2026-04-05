import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomCTAProps {
  hasItems: boolean;
  isProcessing: boolean;
  total: number;
  units: number;
  onPress: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({
  hasItems,
  isProcessing,
  total,
  units,
  onPress,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(18)}
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        paddingBottom: insets.bottom || 0,
      }}
    >
      <TouchableOpacity
        style={{
          borderRadius: 30,
          paddingVertical: 14,
          paddingHorizontal: 18,
          backgroundColor: hasItems && !isProcessing ? colors.primary : colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 0.5,
          borderColor: hasItems && !isProcessing ? colors.primary : colors.border + '40',
        }}
        onPress={onPress}
        disabled={!hasItems || isProcessing}
        activeOpacity={0.9}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* LEFT CONTENT */}
            <View>
              <Text
                style={{
                  color: hasItems ? 'white' : colors.textTertiary,
                  fontSize: 13,
                  opacity: 0.9,
                  marginBottom: 2,
                }}
              >
                {hasItems ? 'Ready to payment' : 'Add items to continue'}
              </Text>

              {hasItems && (
                <Text
                  style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  {units} {units === 1 ? 'unit' : 'units'} • ZMW {total.toFixed(2)}
                </Text>
              )}
            </View>

            {/* RIGHT ICON */}
            {hasItems && <Ionicons name="arrow-forward-circle" size={28} color="white" />}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
