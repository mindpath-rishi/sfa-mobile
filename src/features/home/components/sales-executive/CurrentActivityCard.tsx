import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CurrentActivityCardProps } from '../../types/activity.types';
import { useCurrentActivityCardStyles } from '../../styles/CurrentActivityCard.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';

// Helper function to format elapsed time
const formatElapsedTime = (
  startTime: Date,
): { formatted: string; hours: number; minutes: number } => {
  const now = new Date();
  const elapsedMs = now.getTime() - startTime.getTime();
  if (elapsedMs < 0) return { formatted: '00:00', hours: 0, minutes: 0 };

  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % 3600000) / (1000 * 60));
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return { formatted, hours, minutes };
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
  const styles = useCurrentActivityCardStyles({ selectedActivity });
  const { colors } = useTheme();
  const [elapsedFormatted, setElapsedFormatted] = useState<string>('00:00');
  const [elapsedHours, setElapsedHours] = useState<number>(0);

  const parsedStartTime = useMemo(() => parseStartTime(startTime), [startTime]);
  const otherWorkParsed = useMemo(
    () => (otherWorkStartTime ? parseStartTime(otherWorkStartTime) : null),
    [otherWorkStartTime],
  );

  const updateTimer = useCallback(() => {
    const { formatted, hours } = formatElapsedTime(parsedStartTime);
    setElapsedFormatted(formatted);
    setElapsedHours(hours);
  }, [parsedStartTime]);

  useEffect(() => {
    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [updateTimer]);

  const startTimeStr = parsedStartTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const otherWorkDuration = useMemo(() => {
    if (!otherWorkParsed) return null;
    const minutes = Math.floor((new Date().getTime() - otherWorkParsed.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }, [otherWorkParsed]);

  // Determine if activity is overdue (more than 4 hours)
  const isOverdue = elapsedHours >= 4;
  const warningColor = isOverdue ? '#FF6B6B' : selectedActivityColor;

  return (
    <View style={styles.activeCard}>
      {/* Main Activity Row - Compact */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <LinearGradient
          colors={[selectedActivityColor, selectedActivityColor + 'DD']}
          style={[styles.activityIconLarge, { width: 48, height: 48, borderRadius: 12 }]}
        >
          <Ionicons name={selectedActivityIcon as any} size={24} color="white" />
        </LinearGradient>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <AppText style={[styles.textXSmallBold, { color: colors.textSecondary }]}>
              {selectedActivity}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#4CAF50',
                  marginRight: 4,
                }}
              />
              <AppText style={[styles.textXSmallBold, { color: '#4CAF50' }]}>
                ACTIVE
              </AppText>
            </View>
          </View>

          {/* Timer - Large and Clear */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
            <AppText
              style={[styles.titleMedium, { fontSize: 22, fontWeight: '700', color: warningColor }]}
            >
              {elapsedFormatted}
            </AppText>
            <AppText style={[styles.textXSmall, { marginLeft: 6, color: colors.textSecondary }]}>
              since {startTimeStr}
            </AppText>
          </View>
        </View>
      </View>

      {/* Compact Info Grid */}
      <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
        {/* Route Info */}
        {selectedActivity === 'Retailing' && selectedRoute && (
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 8, padding: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="map-outline" size={12} color={colors.primary} />
              <AppText style={[styles.textXSmallBold, { marginLeft: 4, color: colors.primary }]}>
                ROUTE
              </AppText>
            </View>
            <AppText style={styles.titleSmall} numberOfLines={1}>
              {selectedRoute['routeName']}
            </AppText>
            <View style={{ flexDirection: 'row', marginTop: 2 }}>
              {selectedRoute['totalShops'] && (
                <AppText style={[styles.textXSmall, { color: colors.textSecondary }]}>
                  {selectedRoute['totalShops']} stops
                </AppText>
              )}
            </View>
          </View>
        )}

        {/* Van Info */}
        {assignedVan && (
          <View
            style={{
              flex: selectedActivity === 'Retailing' ? 1 : 1,
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="car-outline" size={12} color={colors.primary} />
              <AppText style={[styles.textXSmallBold, { marginLeft: 4, color: colors.primary }]}>
                VAN
              </AppText>
            </View>
            <AppText style={styles.titleSmall} numberOfLines={1}>
              {assignedVan.name}
            </AppText>
            <AppText style={[styles.textXSmall, { color: colors.textSecondary }]}>
              {assignedVan.vanNumber || assignedVan.name} • {assignedVan.capacity || 'Std'} Tonnages
            </AppText>
          </View>
        )}

        {/* Other Work Badge - Compact */}
        {otherWorkStartTime && selectedActivity !== 'Retailing' && (
          <View
            style={{
              backgroundColor: colors.warning + '20',
              borderRadius: 8,
              padding: 8,
              justifyContent: 'center',
            }}
          >
            <Ionicons name="briefcase-outline" size={16} color={colors.warning} />
            <AppText
              style={[styles.textXSmall, { color: colors.warning, marginTop: 2 }]}
            >
              {otherWorkDuration}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};
