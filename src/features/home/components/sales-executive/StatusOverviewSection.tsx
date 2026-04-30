// StatsOverviewSection.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStatsOverviewSectionStyles } from '../../styles/StatusOverviewSection.styles';
import { StatCard } from './StatCard';
import { SectionHeader, AppText } from '@/core/components';
import { homeService } from '@/features/home/services/home.service';

type Props = {
  employeeId: string;
  onRefresh?: () => void;
};

interface StatsData {
  visits: {
    completed: number;
    total: number;
    percentage: number;
  };
  orders: {
    count: number;
    value: number;
    pending: number;
  };
  collections: {
    count: number;
    value: number;
    target: number;
    percentage: number;
  };
  incentives: {
    earned: number;
    target: number;
    nextMilestone: number;
  };
}

export const StatsOverviewSection: React.FC<Props> = ({ employeeId, onRefresh }) => {
  const styles = useStatsOverviewSectionStyles();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    visits: {
      completed: 0,
      total: 0,
      percentage: 0,
    },
    orders: {
      count: 0,
      value: 0,
      pending: 0,
    },
    collections: {
      count: 0,
      value: 0,
      target: 0,
      percentage: 0,
    },
    incentives: {
      earned: 0,
      target: 0,
      nextMilestone: 0,
    },
  });

  const fetchStats = useCallback(
    async (isRefresh = false) => {
      if (!employeeId) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const res = await homeService.getEmployeeStats(employeeId);
        const data = res?.data || {};

        // Calculate percentages
        const visitsPercentage =
          data?.totalVisits > 0 ? (data?.visits / data?.totalVisits) * 100 : 0;

        const collectionsPercentage =
          data?.collections?.target > 0
            ? (data?.collections?.value / data?.collections?.target) * 100
            : 0;

        setStats({
          visits: {
            completed: data?.visits || 0,
            total: data?.totalVisits || 0,
            percentage: visitsPercentage,
          },
          orders: {
            count: data?.orders?.count || 0,
            value: data?.orders?.value || 0,
            pending: data?.orders?.pending || 0,
          },
          collections: {
            count: data?.collections?.count || 0,
            value: data?.collections?.value || 0,
            target: data?.collections?.target || 0,
            percentage: collectionsPercentage,
          },
          incentives: {
            earned: data?.incentives?.earned || 0,
            target: data?.incentives?.target || 0,
            nextMilestone: data?.incentives?.nextMilestone || 0,
          },
        });
      } catch (error: any) {
        console.log('Error fetching stats:', error);
        setError(error?.message || 'Failed to load stats');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [employeeId],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = useCallback(async () => {
    await fetchStats(true);
    if (onRefresh) {
      onRefresh();
    }
  }, [fetchStats, onRefresh]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <SectionHeader title="TODAY'S OVERVIEW" variant="small" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4158D0" />
          <AppText style={styles.loadingText}>Loading stats...</AppText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SectionHeader title="TODAY'S OVERVIEW" variant="small" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <AppText style={styles.errorText}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchStats()}>
            <AppText style={styles.retryButtonText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <SectionHeader title="TODAY'S OVERVIEW" variant="small" />
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4158D0']}
            tintColor="#4158D0"
          />
        }
      >
        {/* Visits Card */}
        <View style={styles.cardWrapper}>
          <StatCard
            title="Visits"
            value={`${stats.visits.completed}/${stats.visits.total}`}
            subtitle={`${stats.visits.percentage.toFixed(0)}% completed`}
            icon="calendar-check"
            color="#4158D0"
            trend={stats.visits.percentage > 70 ? 12 : -5}
            progress={stats.visits.percentage / 100}
            compact={true}
          />
        </View>

        {/* Orders Card */}
        <View style={styles.cardWrapper}>
          <StatCard
            title="Orders"
            value={stats.orders.count.toString()}
            subtitle={`Value: ${formatCurrency(stats.orders.value)}`}
            badge={stats.orders.pending > 0 ? stats.orders.pending : undefined}
            icon="cart"
            color="#C850C0"
            trend={stats.orders.count > 0 ? 8 : 0}
            compact={true}
          />
        </View>

        {/* Collections Card */}
        <View style={styles.cardWrapper}>
          <StatCard
            title="Collections"
            value={formatCurrency(stats.collections.value)}
            subtitle={`${stats.collections.count} transactions`}
            icon="cash-multiple"
            color="#11998e"
            trend={stats.collections.percentage > 50 ? 15 : -3}
          />
        </View>

        {/* Incentives Card */}
        {/* <View style={styles.cardWrapper}>
          <StatCard
            title="Incentives"
            value={formatCurrency(stats.incentives.earned)}
            subtitle={`Next: ${formatCurrency(stats.incentives.nextMilestone)}`}
            icon="trophy-award"
            color="#F37335"
            trend={stats.incentives.earned > 0 ? 20 : 0}
            progress={
              stats.incentives.target > 0 ? stats.incentives.earned / stats.incentives.target : 0
            }
            compact={true}
          />
        </View> */}
      </ScrollView>
    </View>
  );
};
