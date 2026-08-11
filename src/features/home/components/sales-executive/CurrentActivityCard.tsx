import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CurrentActivityCardProps } from '../../types/activity.types';
import { useCurrentActivityCardStyles } from '../../styles/CurrentActivityCard.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';
import { useRouter } from 'expo-router';

// Helper function to format elapsed time
const formatElapsedTime = (
  startTime: Date,
): { formatted: string; hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const elapsedMs = now.getTime() - startTime.getTime();
  if (elapsedMs < 0) return { formatted: '00:00', hours: 0, minutes: 0, seconds: 0 };

  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return { formatted, hours, minutes, seconds };
};

const parseStartTime = (startTime: any): Date => {
  if (startTime instanceof Date) return startTime;
  const parsed = new Date(startTime);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const CurrentActivityCard: React.FC<CurrentActivityCardProps> = ({
  selectedActivity,
  selectedActivityColor,
  selectedActivityIcon,
  startTime,
  otherWorkStartTime,
  selectedRoute,
  assignedVan,
}) => {
  const styles = useCurrentActivityCardStyles({ selectedActivity: selectedActivity || '' });
  const { colors } = useTheme();
  const router = useRouter();

  // Timer state
  const [elapsedFormatted, setElapsedFormatted] = useState<string>('00:00');

  // Memoized parsed times
  const parsedStartTime = useMemo(() => parseStartTime(startTime), [startTime]);
  const otherWorkParsed = useMemo(
    () => (otherWorkStartTime ? parseStartTime(otherWorkStartTime) : null),
    [otherWorkStartTime],
  );

  // Update timer function
  const updateTimer = useCallback(() => {
    const { formatted } = formatElapsedTime(parsedStartTime);
    setElapsedFormatted(formatted);
  }, [parsedStartTime]);

  // Start timer interval
  useEffect(() => {
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [updateTimer]);

  // Formatted start time
  const startTimeStr = useMemo(
    () =>
      parsedStartTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    [parsedStartTime],
  );

  // Other work duration
  const otherWorkDuration = useMemo(() => {
    if (!otherWorkParsed) return null;
    const minutes = Math.floor((new Date().getTime() - otherWorkParsed.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }, [otherWorkParsed]);

  // Get status text and color
  const statusConfig = {
    text: 'ACTIVE',
    color: '#4CAF50',
    bgColor: '#4CAF5020',
  };

  // Render activity header section
  const renderActivityHeader = () => (
    <View style={styles.activityHeader}>
      <LinearGradient
        colors={[selectedActivityColor, selectedActivityColor + 'DD']}
        style={styles.activityIcon}
      >
        <Ionicons name={selectedActivityIcon as any} size={24} color="white" />
      </LinearGradient>

      <View style={styles.activityInfo}>
        <View style={styles.activityTitleRow}>
          <AppText style={styles.activityTypeText}>{selectedActivity}</AppText>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <AppText style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </AppText>
          </View>
        </View>

        <View style={styles.timerSection}>
          <AppText style={[styles.timerText, { color: selectedActivityColor }]}>
            {elapsedFormatted}
          </AppText>
          <AppText style={styles.startTimeText}>since {startTimeStr}</AppText>
        </View>
      </View>
    </View>
  );

  // Render route details
  const renderRouteDetails = () => {
    if (selectedActivity !== 'Retailing' || !selectedRoute) return null;

    return (
      <TouchableOpacity
        style={styles.infoCard}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Open route details for ${selectedRoute.routeName}`}
        onPress={() => router.push('/route')}
      >
        <View style={styles.infoCardHeader}>
          <Ionicons name="map-outline" size={14} color={colors.primary} />
          <AppText style={styles.infoCardTitle}>Route Details</AppText>
        </View>
        <AppText style={styles.routeName} numberOfLines={1}>
          {selectedRoute.routeName}
        </AppText>
        {selectedRoute.totalShops && (
          <View style={styles.routeStats}>
            <Ionicons name="business-outline" size={12} color={colors.textSecondary} />
            <AppText style={styles.routeStatsText}>{selectedRoute.totalShops} Outlets</AppText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render other work info
  const renderOtherWorkInfo = () => {
    if (!otherWorkStartTime || selectedActivity === 'Retailing') return null;

    return (
      <View style={[styles.infoCard, styles.otherWorkCard]}>
        <View style={styles.infoCardHeader}>
          <Ionicons name="briefcase-outline" size={14} color={colors.warning} />
          <AppText style={styles.infoCardTitle}>Other Work</AppText>
        </View>
        <View style={styles.otherWorkDurationContainer}>
          <Ionicons name="time-outline" size={16} color={colors.warning} />
          <AppText style={[styles.otherWorkDuration, { color: colors.warning }]}>
            {otherWorkDuration}
          </AppText>
        </View>
      </View>
    );
  };

  // Render van info
  const renderVanInfo = () => {
    if (!assignedVan) return null;

    return (
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Ionicons name="car-outline" size={14} color={colors.info} />
          <AppText style={styles.infoCardTitle}>Assigned Van</AppText>
        </View>
        <AppText style={styles.vanName} numberOfLines={1}>
          {(assignedVan as any).vanName || (assignedVan as any).registrationNumber || 'N/A'}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Activity Section */}
      {renderActivityHeader()}

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        {renderRouteDetails()}
        {renderOtherWorkInfo()}
        {/* {renderVanInfo()} */}
      </View>
    </View>
  );
};
