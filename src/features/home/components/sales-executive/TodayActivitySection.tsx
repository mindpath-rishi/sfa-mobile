import React from 'react';
import { View, Text } from 'react-native';
import { AppCard } from '@/core/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useTodayActivitiesSectionStyles } from '../../styles/TodayActivitiesSection.styles';
import { SectionHeader } from './SectionHeader';
import { ActivityItemComponent } from './ActivityItem';
import { TodayActivitiesSectionProps } from '../../types/activity.types';
import { AppText } from '@/core/components';

export const TodayActivitiesSection: React.FC<TodayActivitiesSectionProps> = ({ activities }) => {
  const styles = useTodayActivitiesSectionStyles();

  return (
    <View style={styles.container}>
      <SectionHeader title="TODAY'S ACTIVITIES" />
      <AppCard variant="elevated" padding="lg" style={styles.activitiesCard}>
        {activities.length > 0 ? (
          activities.map((item, index) => (
            <ActivityItemComponent
              key={item.id}
              item={item}
              index={index}
              totalItems={activities.length}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={36} style={styles.emptyStateIcon} />
            <AppText style={styles.emptyStateText}>No activities yet today</AppText>
          </View>
        )}
      </AppCard>
    </View>
  );
};
