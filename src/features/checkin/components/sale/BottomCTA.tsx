// components/SalesSummary/components/BottomCTA.tsx
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
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: insets.bottom || 16,
        backgroundColor: colors.background,
        borderTopWidth: 0.5,
        borderTopColor: colors.border + '25',
      }}
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 14,
          backgroundColor: hasItems && !isProcessing ? colors.primary : colors.surface,
          borderWidth: 0.5,
          borderColor: hasItems && !isProcessing ? colors.primary : colors.border + '40',
        }}
        onPress={onPress}
        disabled={!hasItems || isProcessing}
        activeOpacity={0.82}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: hasItems ? 'white' : colors.textTertiary,
              }}
            >
              {hasItems ? 'Proceed to payment' : 'Add items to continue'}
            </Text>

            {hasItems && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                  ZMW {total.toFixed(2)}
                </Text>
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.22)',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 18,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: 'white' }}>
                    {units} {units === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
