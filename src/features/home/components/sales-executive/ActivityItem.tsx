// ActivityItemComponent.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { TodayActivity } from '../../types/activity.types';
import { AppText } from '@/core/components';

interface ActivityItemComponentProps {
  item: TodayActivity;
  index: number;
  totalItems: number;
  onPress?: () => void;
}

// Helper to format duration
const formatDuration = (startTime: string, endTime?: string) => {
  if (!startTime) return '';

  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const durationMs = end.getTime() - start.getTime();

  if (durationMs < 0) return '';

  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const ActivityItemComponent: React.FC<ActivityItemComponentProps> = ({
  item,
  index,
  totalItems,
  onPress,
}) => {
  const { colors } = useTheme();
  const isOngoing = item.status === 'ongoing' || (!item.endTime && item.startTime);
  const isCompleted = item.status === 'completed' || item.endTime;

  // Memoized calculations
  const duration = useMemo(
    () => formatDuration(item.startTime, item.endTime),
    [item.startTime, item.endTime],
  );

  const startTimeStr = useMemo(() => {
    if (!item.startTime) return '';
    return new Date(item.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [item.startTime]);

  const endTimeStr = useMemo(() => {
    if (!item.endTime) return '';
    return new Date(item.endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [item.endTime]);

  // Get icon based on activity type
  const getIconName = (type: string) => {
    const iconMap: Record<string, string> = {
      van_change: 'swap-horizontal',
      office: 'business',
      collection: 'cash',
      meeting: 'people',
      retailing: 'storefront',
      break: 'cafe',
      driving: 'car',
      training: 'school',
      maintenance: 'build',
      other: 'briefcase',
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (type.includes(key)) return icon;
    }
    return 'time';
  };

  // Get display text
  const getDisplayText = (type: string) => {
    const textMap: Record<string, string> = {
      van_change: 'Van Change',
      office_work: 'Office Work',
      cash_collection: 'Cash Collection',
      team_meeting: 'Team Meeting',
      retailing: 'Retailing',
      break: 'Break',
      driving: 'Driving',
    };

    return textMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get status color
  const getStatusColor = () => {
    if (isOngoing) return colors.primary;
    if (isCompleted) return colors.success;
    return colors.textSecondary;
  };

  const statusColor = getStatusColor();
  const backgroundColor = isOngoing ? colors.primary + '10' : colors.surface;
  const borderColor = isOngoing ? colors.primary + '30' : colors.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor,
          borderLeftColor: isOngoing ? colors.primary : 'transparent',
          borderLeftWidth: isOngoing ? 3 : 0,
          marginBottom: index === totalItems - 1 ? 0 : 8,
        },
      ]}
    >
      <View style={styles.contentWrapper}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: statusColor + '15',
            },
          ]}
        >
          <Ionicons name={getIconName(item.name) as any} size={18} color={statusColor} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.headerRow}>
            <AppText style={[styles.activityName, { color: colors.primary }]}>
              {getDisplayText(item.name)}
            </AppText>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <AppText style={[styles.statusText, { color: statusColor }]}>
                {isOngoing ? 'ACTIVE' : isCompleted ? 'DONE' : 'PENDING'}
              </AppText>
            </View>
          </View>

          <View style={styles.detailsRow}>
            {/* Time Range */}
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={10} color={colors.textSecondary} />
              <AppText style={[styles.timeText, { color: colors.textSecondary }]}>
                {startTimeStr}
                {endTimeStr && ` - ${endTimeStr}`}
              </AppText>
            </View>

            {/* Duration */}
            {duration && (
              <View style={styles.durationInfo}>
                <Ionicons name="hourglass-outline" size={10} color={colors.textSecondary} />
                <AppText style={[styles.durationText, { color: colors.textSecondary }]}>
                  {duration}
                </AppText>
              </View>
            )}
          </View>

          {/* Additional Info (if available) */}
          {item.routeName && (
            <View style={styles.additionalInfo}>
              <Ionicons name="map-outline" size={10} color={colors.textSecondary} />
              <AppText style={[styles.additionalText, { color: colors.textSecondary }]}>
                {item.routeName}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  additionalText: {
    fontSize: 10,
  },
});
