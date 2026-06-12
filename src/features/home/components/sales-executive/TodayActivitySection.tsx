import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { ActivityItemComponent } from './ActivityItem';
import { TodayActivitiesSectionProps } from '../../types/activity.types';
import { useTodayActivitiesSectionStyles } from '../../styles/TodayActivitiesSection.styles';

export const TodayActivitiesSection: React.FC<TodayActivitiesSectionProps> = ({
  activities = [],
}) => {
  const { colors } = useTheme();
  const styles = useTodayActivitiesSectionStyles();
  const [showAll, setShowAll] = useState(false);

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
      <View style={styles.headerContainer}>
        <View style={styles.headerIcon}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
        </View>
        <AppText style={styles.headerTitle}>Today's activity log</AppText>
      </View>

      {hasActivities ? (
        <FlatList
          data={displayedActivities}
          renderItem={renderActivityItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
          </View>
          <AppText style={styles.emptyStateTitle}>No activities yet</AppText>
          <AppText style={styles.emptyStateSubtitle}>
            Start your first activity to begin tracking
          </AppText>
        </View>
      )}

      {hasMore && hasActivities && (
        <TouchableOpacity
          onPress={() => setShowAll((prev) => !prev)}
          style={styles.showMoreButton}
          activeOpacity={0.7}
        >
          <AppText style={styles.showMoreText}>
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
  );
};
