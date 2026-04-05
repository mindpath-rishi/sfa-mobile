import React, { useCallback } from 'react';
import { View, Alert, Linking, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Outlet } from '../../types/outlet.types';

interface Props {
  outlet: Outlet;
  onCheckIn?: () => void;
  onCallPress?: () => void;
  compact?: boolean;
  variant?: 'pill' | 'chip' | 'card' | 'minimal';
}

export const OutletQuickActions: React.FC<Props> = ({
  outlet,
  onCheckIn,
  onCallPress,
  compact = true,
  variant = 'pill',
}) => {
  const { colors } = useTheme();

  const handleCheckIn = useCallback(() => {
    if (onCheckIn) {
      onCheckIn();
    } else {
      router.push({
        pathname: '/checkin',
        params: {
          customerId: outlet.id,
          customerName: outlet.name,
          outletId: outlet.id,
        },
      });
    }
  }, [onCheckIn, outlet.id, outlet.name]);

  const handleCallPress = useCallback(async () => {
    if (onCallPress) {
      onCallPress();
    } else if (outlet.phone) {
      try {
        const phoneNumber = outlet.phone.replace(/\s/g, '');
        const url = `tel:${phoneNumber}`;
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
          Alert.alert('Call Customer', `Call ${outlet.owner || 'customer'} at ${outlet.phone}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => Linking.openURL(url) },
          ]);
        } else {
          Alert.alert('Error', 'Your device cannot make phone calls');
        }
      } catch (error) {
        console.error('Error opening dialer:', error);
        Alert.alert('Error', 'Unable to make the call');
      }
    } else {
      Alert.alert('No Phone Number', 'This outlet does not have a phone number available');
    }
  }, [onCallPress, outlet.phone, outlet.owner]);

  // Pill variant - Rounded pills with icons
  if (variant === 'pill') {
    return (
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={handleCheckIn}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            paddingVertical: compact ? 6 : 8,
            paddingHorizontal: compact ? 12 : 16,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <Ionicons name="location" size={compact ? 12 : 14} color="#FFFFFF" />
          {!compact && (
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              Check In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCallPress}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            paddingVertical: compact ? 6 : 8,
            paddingHorizontal: compact ? 12 : 16,
            borderRadius: 20,
            gap: 6,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="call-outline" size={compact ? 12 : 14} color={colors.primary} />
          {!compact && (
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: '500',
              }}
            >
              Call
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Chip variant - Smaller, more compact
  if (variant === 'chip') {
    return (
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
        }}
      >
        <TouchableOpacity
          onPress={handleCheckIn}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary + '15',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 12,
            gap: 4,
          }}
        >
          <Ionicons name="location" size={10} color={colors.primary} />
          {!compact && (
            <Text
              style={{
                color: colors.primary,
                fontSize: 10,
                fontWeight: '500',
              }}
            >
              Check In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCallPress}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.info + '15',
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 12,
            gap: 4,
          }}
        >
          <Ionicons name="call-outline" size={10} color={colors.info || '#17a2b8'} />
          {!compact && (
            <Text
              style={{
                color: colors.info || '#17a2b8',
                fontSize: 10,
                fontWeight: '500',
              }}
            >
              Call
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Card variant - Elevated card style
  if (variant === 'card') {
    return (
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          backgroundColor: colors.surface,
          padding: 8,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={handleCheckIn}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            paddingVertical: 8,
            borderRadius: 8,
            gap: 6,
          }}
        >
          <Ionicons name="location" size={14} color="#FFFFFF" />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            Check In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCallPress}
          activeOpacity={0.7}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            paddingVertical: 8,
            borderRadius: 8,
            gap: 6,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Ionicons name="call-outline" size={14} color={colors.primary} />
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            Call
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Minimal variant - Icon only, no backgrounds
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
      }}
    >
      <TouchableOpacity
        onPress={handleCheckIn}
        activeOpacity={0.7}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
          gap: 4,
        }}
      >
        <Ionicons name="location-outline" size={16} color={colors.primary} />
        {!compact && (
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            Check In
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleCallPress}
        activeOpacity={0.7}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
          gap: 4,
        }}
      >
        <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
        {!compact && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            Call
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
