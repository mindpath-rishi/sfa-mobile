import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CurrentActivityCardProps } from '../../types/activity.types';
import { useCurrentActivityCardStyles } from '../../styles/CurrentActivityCard.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';

export const CurrentActivityCard: React.FC<CurrentActivityCardProps> = ({
  selectedActivity,
  selectedActivityColor,
  selectedActivityIcon,
  startTime,
  otherWorkStartTime,
  selectedRoute,
  assignedVan,
  onPressChange,
  onPressEnd,
}) => {
  const styles = useCurrentActivityCardStyles({ selectedActivity });
  const { colors } = useTheme();

  return (
    <View style={styles.activeCard}>
      {/* Current Activity */}
      <View style={styles.activityHighlightCard}>
        <LinearGradient
          colors={[selectedActivityColor, selectedActivityColor + 'DD']}
          style={styles.activityIconLarge}
        >
          <Ionicons name={selectedActivityIcon as any} size={28} color="white" />
        </LinearGradient>
        <View style={styles.activityContent}>
          <AppText style={styles.textXSmall}>CURRENT ACTIVITY</AppText>
          <AppText style={styles.titleMedium}>{selectedActivity}</AppText>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color={styles.textSmall.color} />
            <AppText style={styles.textSmall}>
              {startTime}
              {otherWorkStartTime && selectedActivity !== 'Retailing' && (
                <AppText style={styles.textAccent}> • Running</AppText>
              )}
            </AppText>
          </View>
        </View>
        <View style={styles.activeBadge}>
          <AppText style={styles.activeBadgeText}>ACTIVE</AppText>
        </View>
      </View>

      {/* Route & Van Info */}
      {selectedActivity === 'Retailing' && selectedRoute && (
        <View style={styles.infoHighlightCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="map-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <AppText style={styles.textXSmall}>ROUTE</AppText>
              <AppText style={styles.titleSmall}>{selectedRoute.name}</AppText>
              <AppText style={styles.textXSmall}>
                {selectedRoute.stops} stops • {selectedRoute.distance}
              </AppText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="car-outline" size={16} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <AppText style={styles.textXSmall}>VAN</AppText>
              <AppText style={styles.titleSmall}>{assignedVan.name}</AppText>
              <AppText style={styles.textXSmall}>
                {assignedVan.type} • {assignedVan.capacity}
              </AppText>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={onPressChange} style={styles.smallActionButton}>
          <Ionicons name="refresh" size={14} color={styles.changeActionText.color} />
          <AppText style={styles.changeActionText}>CHANGE</AppText>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPressEnd} style={styles.smallActionButton}>
          <Ionicons name="stop-circle" size={14} color={styles.endActionText.color} />
          <AppText style={styles.endActionText}>END</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
