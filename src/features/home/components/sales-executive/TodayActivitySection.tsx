// TodayActivitiesSection.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  UIManager,
  LayoutAnimation,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityItemComponent } from './ActivityItem';
import { TodayActivitiesSectionProps } from '../../types/activity.types';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useTodayActivitiesSectionStyles } from '../../styles/TodayActivitiesSection.styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const calculateTotalDuration = (activities: any[]): string => {
  if (!activities?.length) return '0 min';

  let totalMinutes = 0;

  activities.forEach((activity) => {
    try {
      if (activity?.startTime) {
        const start = new Date(activity.startTime);
        if (isNaN(start.getTime())) return;

        const end = activity.endTime ? new Date(activity.endTime) : new Date();
        if (isNaN(end.getTime())) return;

        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        if (duration > 0 && isFinite(duration)) {
          totalMinutes += duration;
        }
      }
    } catch (error) {
      // Skip invalid activities
    }
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);

  if (hours === 0 && minutes === 0) return '0 min';
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours}h ${minutes}m`;
};

export const TodayActivitiesSection: React.FC<TodayActivitiesSectionProps> = ({
  activities = [],
}) => {
  const { colors } = useTheme();
  const styles = useTodayActivitiesSectionStyles();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const stats = useMemo(() => {
    if (!activities?.length) {
      return {
        ongoing: 0,
        completed: 0,
        total: 0,
        totalDuration: '0 min',
        completionRate: 0,
      };
    }

    const ongoing = activities.filter((a) => {
      return a?.status === 'ongoing' || (!a?.endTime && a?.startTime);
    });

    const completed = activities.filter((a) => {
      return a?.status === 'completed' || a?.endTime;
    });

    const totalDuration = calculateTotalDuration(activities);
    const completionRate = Math.round((completed.length / activities.length) * 100);

    return {
      ongoing: ongoing.length,
      completed: completed.length,
      total: activities.length,
      totalDuration,
      completionRate: isNaN(completionRate) ? 0 : completionRate,
    };
  }, [activities]);

  const displayedActivities = useMemo(() => {
    if (!activities?.length) return [];

    const sorted = [...activities]
      .filter((a) => a?._id)
      .sort((a, b) => {
        const aOngoing = a?.status === 'ongoing' || (!a?.endTime && a?.startTime);
        const bOngoing = b?.status === 'ongoing' || (!b?.endTime && b?.startTime);
        if (aOngoing && !bOngoing) return -1;
        if (!aOngoing && bOngoing) return 1;

        if (!a?.startTime) return 1;
        if (!b?.startTime) return -1;

        try {
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        } catch {
          return 0;
        }
      });

    return showAll ? sorted : sorted.slice(0, 5);
  }, [activities, showAll]);

  const hasMore = activities.length > 5;
  const hasActivities = activities.length > 0;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const renderActivityItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <ActivityItemComponent
        key={item._id}
        item={item}
        index={index}
        totalItems={displayedActivities.length}
      />
    ),
    [displayedActivities.length],
  );

  const keyExtractor = useCallback((item: any) => item._id, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7} style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>
            TODAY ACTIVITIES
          </AppText>
          {hasActivities && (
            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
              <AppText style={[styles.badgeText, { color: colors.primary }]}>{stats.total}</AppText>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View>
          {hasActivities && (
            <View style={styles.statsContainer}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <AppText style={[styles.statValue, { color: colors.textPrimary }]}>
                  {stats.totalDuration}
                </AppText>
                <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Time
                </AppText>
              </View>

              {stats.ongoing > 0 && (
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.primary + '08',
                      borderColor: colors.primary + '20',
                    },
                  ]}
                >
                  <Ionicons name="play-circle" size={14} color={colors.primary} />
                  <AppText style={[styles.statValue, { color: colors.textPrimary }]}>
                    {stats.ongoing}
                  </AppText>
                  <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Active
                  </AppText>
                </View>
              )}

              {stats.completed > 0 && (
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.success + '08',
                      borderColor: colors.success + '20',
                    },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <AppText style={[styles.statValue, { color: colors.textPrimary }]}>
                    {stats.completionRate}%
                  </AppText>
                  <AppText style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Completed
                  </AppText>
                </View>
              )}
            </View>
          )}

          {hasActivities ? (
            <FlatList
              data={displayedActivities}
              renderItem={renderActivityItem}
              keyExtractor={keyExtractor}
              scrollEnabled={false} // Important: Disable internal scrolling
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={5}
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={[styles.emptyStateIconContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="time-outline" size={28} color={colors.textSecondary} />
              </View>
              <AppText style={[styles.emptyStateTitle, { color: colors.textSecondary }]}>
                No activities yet
              </AppText>
              <AppText style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
                Start your first activity to begin tracking
              </AppText>
            </View>
          )}

          {hasMore && hasActivities && (
            <TouchableOpacity
              onPress={toggleShowAll}
              style={[
                styles.showMoreButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <AppText style={[styles.showMoreText, { color: colors.primary }]}>
                {showAll ? 'Show Less' : `Show ${activities.length - 5} More`}
              </AppText>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
                style={styles.showMoreIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
