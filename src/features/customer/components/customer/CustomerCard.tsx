import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppCard } from '@/core/components/Card';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  FadeInDown,
} from 'react-native-reanimated';
import { CustomerAvatar } from './CustomerAvatar';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { CustomerTags } from './CustomerTags';
import { CustomerStats } from './CustomerStats';
import { CustomerVisitInfo } from './CustomerVisitInfo';
import { CustomerQuickActions } from './CustomerQuickActions';
import { Customer } from '../../types/customer.types';
import { useCustomerCardStyles } from '../../styles/CustomerCard.styles';
import { AppText } from '@/core/components';

interface Props {
  customer: Customer;
  index: number;
}

export const CustomerCard: React.FC<Props> = ({ customer, index }) => {
  const { colors } = useTheme();
  const styles = useCustomerCardStyles();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.98, { damping: 3 }), withSpring(1, { damping: 3 }));
    router.push(`/customers/${customer.id}`);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={animatedStyle}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <AppCard variant="elevated" padding="md" style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <CustomerAvatar customer={customer} />
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <AppText style={styles.customerName}>{customer.name}</AppText>
                <CustomerStatusBadge status={customer.status} />
              </View>
              <AppText style={styles.customerInfo}>
                {customer.owner} • {customer.type}
              </AppText>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={12} color={colors.textTertiary} />
                <AppText style={styles.locationText}>
                  {customer.distance} • {customer.location}
                </AppText>
              </View>
            </View>
          </View>

          <CustomerTags tags={customer.tags} />
          <CustomerStats customer={customer} />
          <CustomerVisitInfo customer={customer} />
          <CustomerQuickActions customer={customer} />
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
};
