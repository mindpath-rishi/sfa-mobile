import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomCTAProps {
  hasItems: boolean;
  isProcessing: boolean;
  total: number;
  units: number;
  onPress: () => void;
  buttonText?: string;
  mode?: 'sales' | 'topup';
}

export const BottomCTA: React.FC<BottomCTAProps> = ({
  hasItems,
  isProcessing,
  total,
  units,
  onPress,
  buttonText,
  mode = 'sales',
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const defaultButtonText = mode === 'sales' ? 'Proceed to Payment' : 'Submit Top-up Request';
  const displayButtonText = buttonText || defaultButtonText;

  const getButtonText = () => {
    if (!hasItems) {
      return mode === 'sales' ? 'Add items to continue' : 'Add items to top-up';
    }
    return `  K${total.toLocaleString()} • ${displayButtonText}`;
  };

  return (
    <View
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
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: hasItems && !isProcessing ? colors.primary : colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderWidth: 0.5,
          borderColor: hasItems && !isProcessing ? colors.primary : colors.border + '40',
        }}
        onPress={onPress}
        disabled={!hasItems || isProcessing}
        activeOpacity={0.8}
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
            <Text
              style={{
                color: hasItems ? 'white' : colors.textTertiary,
                fontSize: 14,
                fontWeight: '600',
                flex: 1,
              }}
              numberOfLines={1}
            >
              {getButtonText()}
            </Text>

            {/* RIGHT ICON */}
            {hasItems && (
              <Ionicons
                name={mode === 'sales' ? 'arrow-forward' : 'send'}
                size={18}
                color="white"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
