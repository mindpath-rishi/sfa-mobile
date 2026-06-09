import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  FadeInUp,
} from 'react-native-reanimated';

import { AppText, AppCard } from '@/core/components';
import { Outlet } from '../../types/outlet.types';
import { OutletAvatar } from './OutletAvatar';
import { useOutletCardStyles } from '../../styles/OutletCard.styles';

interface Props {
  outlet: Outlet;
  index: number;
  onPress?: (outlet: Outlet) => void;
}

export const OutletCard: React.FC<Props> = ({ outlet, index, onPress }) => {
  const { colors } = useTheme();
  const styles = useOutletCardStyles();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 }),
    );

    if (onPress) {
      onPress(outlet);
    } else {
      router.push(`/outlets/${outlet.customerId}`);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formattedDistance = useMemo(() => {
    if (!outlet.distance) return null;
    return typeof outlet.distance === 'number'
      ? `${outlet.distance.toFixed(1)} km`
      : outlet.distance;
  }, [outlet.distance]);

  const getStatusConfig = () => {
    switch (outlet.status) {
      case 'ACTIVE':
        return { color: colors.success, label: 'Active' };
      case 'INACTIVE':
        return { color: colors.error, label: 'Inactive' };
      default:
        return { color: colors.textSecondary, label: outlet.status };
    }
  };

  const { color: statusColor, label: statusLabel } = getStatusConfig();

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 35)
        .springify()
        .damping(14)}
      style={animatedStyle}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.92}>
          <AppCard variant="elevated" padding="md" style={styles.card}>
            <View style={styles.row}>
              {/* Avatar */}
              <OutletAvatar outlet={outlet} />

              {/* Body */}
              <View style={styles.body}>
                {/* Name + status */}
                <View style={styles.nameRow}>
                  <AppText style={styles.name} numberOfLines={1}>
                    {outlet.name}
                  </AppText>
                  <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                    <AppText style={[styles.statusLabel, { color: statusColor }]}>
                      {statusLabel}
                    </AppText>
                  </View>
                </View>

                {/* Location + distance */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={11} color={colors.textTertiary} />
                  <AppText style={styles.locationText} numberOfLines={1}>
                    {outlet.address?.line1}
                  </AppText>
                  {formattedDistance && (
                    <View style={styles.distancePill}>
                      <AppText style={styles.distanceText}>{formattedDistance}</AppText>
                    </View>
                  )}
                </View>

                {/* Two chips: type + owner */}
                <View style={styles.chipsRow}>
                  <View style={styles.chipFixed}>
                    <AppText style={styles.chipText}>{outlet.customerTypeId}</AppText>
                  </View>
                  <View style={styles.chipFlex}>
                    <AppText style={styles.chipText} numberOfLines={1}>
                      {outlet.ownerName}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
            </View>
          </AppCard>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
