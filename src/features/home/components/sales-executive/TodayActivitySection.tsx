// TodayActivitiesSection.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityItemComponent } from './ActivityItem';
import { TodayActivitiesSectionProps } from '../../types/activity.types';
import { AppText, SectionHeader } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper to safely calculate total duration
const calculateTotalDuration = (activities: any[]): string => {
  if (!activities || !Array.isArray(activities) || activities.length === 0) {
    return '0 min';
  }

  let totalMinutes = 0;

  activities.forEach((activity) => {
    try {
      if (activity && activity.startTime) {
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Memoized statistics
  const stats = useMemo(() => {
    if (!activities || activities.length === 0) {
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

  // Sort and limit activities
  const displayedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const sorted = [...activities]
      .filter((a) => a && a._id)
      .sort((a, b) => {
        // Ongoing first
        const aOngoing = a?.status === 'ongoing' || (!a?.endTime && a?.startTime);
        const bOngoing = b?.status === 'ongoing' || (!b?.endTime && b?.startTime);
        if (aOngoing && !bOngoing) return -1;
        if (!aOngoing && bOngoing) return 1;

        // Then by start time (most recent first)
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
  const hasActivities = activities && activities.length > 0;

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const toggleShowAll = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll((prev) => !prev);
  }, []);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        marginBottom: 16,
        paddingHorizontal: 16,
      }}
    >
      {/* Header - Always Visible */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          backgroundColor: colors.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <AppText
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.textSecondary,
            }}
          >
            TODAY ACTIVITIES
          </AppText>
          {hasActivities && (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: colors.primary + '15',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
              }}
            >
              <AppText style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>
                {stats.total}
              </AppText>
            </View>
          )}
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Expandable Content */}
      {isExpanded && (
        <View>
          {/* Stats Summary - Only show if there are activities */}
          {hasActivities && (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {/* Total Duration Card */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <AppText
                  style={{ fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 }}
                >
                  {stats.totalDuration}
                </AppText>
                <AppText style={{ fontSize: 9, color: colors.textSecondary, marginTop: 2 }}>
                  Total Time
                </AppText>
              </View>

              {/* Ongoing Card */}
              {stats.ongoing > 0 && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary + '08',
                    borderRadius: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: colors.primary + '20',
                  }}
                >
                  <Ionicons name="play-circle" size={14} color={colors.primary} />
                  <AppText
                    style={{ fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 }}
                  >
                    {stats.ongoing}
                  </AppText>
                  <AppText style={{ fontSize: 9, color: colors.primary, marginTop: 2 }}>
                    Active
                  </AppText>
                </View>
              )}

              {/* Completion Card */}
              {stats.completed > 0 && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.success + '08',
                    borderRadius: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: colors.success + '20',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <AppText
                    style={{ fontSize: 16, fontWeight: '700', color: colors.success, marginTop: 4 }}
                  >
                    {stats.completionRate}%
                  </AppText>
                  <AppText style={{ fontSize: 9, color: colors.success, marginTop: 2 }}>
                    Completed
                  </AppText>
                </View>
              )}
            </View>
          )}

          {/* Activities List */}
          <ScrollView
            // style={{ maxHeight: showAll ? 500 : 400 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {hasActivities ? (
              displayedActivities.map((item, index) => (
                <ActivityItemComponent
                  key={item._id}
                  item={item}
                  index={index}
                  totalItems={displayedActivities.length}
                />
              ))
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 48,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="time-outline" size={28} color={colors.textSecondary} />
                </View>
                <AppText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                  No activities yet
                </AppText>
                <AppText style={{ fontSize: 11, color: colors.textSecondary }}>
                  Start your first activity to begin tracking
                </AppText>
              </View>
            )}
          </ScrollView>

          {/* Show More / Less Button */}
          {hasMore && hasActivities && (
            <TouchableOpacity
              onPress={toggleShowAll}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                marginTop: 8,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <AppText style={{ fontSize: 12, color: colors.primary, fontWeight: '500' }}>
                {showAll ? 'Show Less' : `Show ${activities.length - 5} More`}
              </AppText>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
