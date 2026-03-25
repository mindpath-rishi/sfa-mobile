import React from 'react';
import { View, ScrollView } from 'react-native';
import { useStatsOverviewSectionStyles } from '../../styles/StatusOverviewSection.styles';
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
import { StatsOverviewSectionProps } from '../../types/stat.types';

export const StatsOverviewSection: React.FC<StatsOverviewSectionProps> = ({
  todayVisits,
  totalVisits,
  pendingOrders,
  collections,
  incentives,
}) => {
  const styles = useStatsOverviewSectionStyles();

  return (
    <View style={styles.container}>
      <SectionHeader title="TODAY'S OVERVIEW" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatCard
          title="Visits"
          value={`${todayVisits}/${totalVisits}`}
          icon="calendar"
          color="#4158D0"
          trend={12}
        />
        <StatCard
          title="Orders"
          value={pendingOrders.toString()}
          icon="cart"
          color="#C850C0"
          trend={-5}
        />
        <StatCard title="Collections" value={collections} icon="cash" color="#11998e" trend={8} />
        <StatCard title="Incentives" value={incentives} icon="trophy" color="#F37335" trend={15} />
      </ScrollView>
    </View>
  );
};
