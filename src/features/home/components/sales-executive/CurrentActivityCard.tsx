import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CurrentActivityCardProps } from '../../types/activity.types';
import { useCurrentActivityCardStyles } from '../../styles/CurrentActivityCard.styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppText } from '@/core/components';

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
}) => {
  const styles = useCurrentActivityCardStyles({ selectedActivity });
  const { colors } = useTheme();

  // Timer state
  const [elapsedFormatted, setElapsedFormatted] = useState<string>('00:00');
  const [elapsedHours, setElapsedHours] = useState<number>(0);

  // Memoized parsed times
  const parsedStartTime = useMemo(() => parseStartTime(startTime), [startTime]);
  const otherWorkParsed = useMemo(
    () => (otherWorkStartTime ? parseStartTime(otherWorkStartTime) : null),
    [otherWorkStartTime],
  );

  // Update timer function
  const updateTimer = useCallback(() => {
    const { formatted, hours } = formatElapsedTime(parsedStartTime);
    setElapsedFormatted(formatted);
    setElapsedHours(hours);
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

  // Determine if activity is overdue (more than 4 hours)
  const isOverdue = elapsedHours >= 4;
  const renderActivityHeader = () => (
    <>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: selectedActivityColor + '18' }]}>
            <Ionicons name="pulse-outline" size={14} color={selectedActivityColor} />
          </View>
          <AppText style={styles.sectionTitle}>Current Activity</AppText>
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.success + '12' }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <AppText style={[styles.statusPillText, { color: colors.success }]}>Active</AppText>
        </View>
      </View>

      <View style={styles.activityTimerCard}>
        <View style={styles.activityPanel}>
          <View
            style={[styles.activityIconWrap, { backgroundColor: selectedActivityColor + '18' }]}
          >
            <Ionicons name={selectedActivityIcon as any} size={20} color={selectedActivityColor} />
          </View>
          <View style={styles.activityInfo}>
            <AppText style={styles.activityTypeText}>{selectedActivity}</AppText>
            <AppText style={styles.activityMeta}>
              {selectedActivity === 'Retailing' && selectedRoute
                ? `Route: ${selectedRoute.routeName || 'Assigned route'}${
                    selectedRoute.totalShops ? ` · ${selectedRoute.totalShops} shops` : ''
                  }`
                : 'Active now'}
            </AppText>
          </View>
        </View>

        <View style={styles.timerDivider} />

        <View style={styles.timerRow}>
          <View
            style={[
              styles.timerIconBubble,
              { backgroundColor: isOverdue ? colors.error + '18' : colors.primary + '18' },
            ]}
          >
            <Ionicons
              name={isOverdue ? 'warning-outline' : 'timer-outline'}
              size={20}
              color={isOverdue ? colors.error : colors.primary}
            />
          </View>
          <View style={styles.timerTextBlock}>
            <AppText style={styles.timerLabel}>Current activity timer</AppText>
            <AppText
              style={[styles.timerValue, { color: isOverdue ? colors.error : colors.primary }]}
            >
              {elapsedFormatted}
            </AppText>
          </View>
          <View style={styles.timerMeta}>
            <AppText style={styles.timerMetaLabel}>Started</AppText>
            <AppText style={styles.timerMetaValue}>{startTimeStr}</AppText>
          </View>
        </View>
      </View>
    </>
  );

  // Render other work info
  const renderOtherWorkInfo = () => {
    if (!otherWorkStartTime || selectedActivity === 'Retailing') return null;

    return (
      <View style={[styles.infoCard, styles.otherWorkCard]}>
        <View style={styles.infoCardHeader}>
          <Ionicons name="briefcase-outline" size={14} color={colors.warning} />
          <AppText style={[styles.infoCardTitle, { color: colors.warning }]}>Other Work</AppText>
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

  // Render warning for overdue activity
  const renderOverdueWarning = () => {
    if (!isOverdue) return null;

    return (
      <View style={styles.warningCard}>
        <Ionicons name="alert-circle" size={18} color={colors.error} />
        <AppText style={styles.warningText}>
          Activity exceeds 4 hours. Consider taking a break or ending this activity.
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Activity Section */}
      {renderActivityHeader()}

      {/* Info Grid */}
      <View style={styles.infoGrid}>{renderOtherWorkInfo()}</View>

      {/* Warning Section */}
      {renderOverdueWarning()}
    </View>
  );
};
