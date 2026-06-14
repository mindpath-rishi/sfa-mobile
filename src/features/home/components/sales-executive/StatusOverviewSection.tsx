// StatsOverviewSection.tsx - Updated
import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useStatsOverviewSectionStyles } from '../../styles/StatusOverviewSection.styles';
import { AppText, Skeleton } from '@/core/components';
import { homeService } from '@/features/home/services/home.service';
import { useTheme } from '@/shared/hooks/useTheme';

type Props = {
  employeeId: string;
  routeCustomerCount?: number;
  onRefresh?: () => void;
};

interface StatsData {
  visits: {
    completed: number;
    total: number;
    percentage: number;
  };
  calls: {
    pc: number;
    tc: number;
    percentage: number;
  };
  orders: {
    count: number;
    value: number;
    cases: number;
    weight: number;
    pending: number;
  };
  incentives: {
    earned: number;
    target: number;
    nextMilestone: number;
  };
}

export const StatsOverviewSection: React.FC<Props> = ({
  employeeId,
  routeCustomerCount,
  onRefresh,
}) => {
  const { colors } = useTheme();
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
    calls: {
      pc: 0,
      tc: 0,
      percentage: 0,
    },
    orders: {
      count: 0,
      value: 0,
      cases: 0,
      weight: 0,
      pending: 0,
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

        const completedVisits = Number(data?.visits || 0);
        const selectedRouteCustomers = Number(routeCustomerCount || 0);
        const totalVisits =
          selectedRouteCustomers > 0 ? selectedRouteCustomers : Number(data?.totalVisits || 0);
        const visitsPercentage = totalVisits > 0 ? (completedVisits / totalVisits) * 100 : 0;
        const tc = Number(data?.tc ?? completedVisits ?? 0);
        const pc = Number(data?.pc ?? data?.orders?.count ?? 0);
        const callPercentage = tc > 0 ? (pc / tc) * 100 : 0;

        setStats({
          visits: {
            completed: completedVisits,
            total: totalVisits,
            percentage: visitsPercentage,
          },
          calls: {
            pc,
            tc,
            percentage: callPercentage,
          },
          orders: {
            count: data?.orders?.count || 0,
            value: data?.orders?.value || 0,
            cases: data?.orders?.cases || 0,
            weight: data?.orders?.weight || 0,
            pending: data?.orders?.pending || 0,
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
    [employeeId, routeCustomerCount],
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

  const formatNumber = useCallback((value: number, digits = 0) => {
    return new Intl.NumberFormat('en-ZM', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number(value || 0));
  }, []);

  const renderMetricGraphic = ({
    title,
    value,
    subtitle,
    icon,
    progress,
    colors: gradientColors,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    progress: number;
    colors: [string, string];
  }) => {
    const safeProgress = Math.max(0, Math.min(100, progress));

    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.metricGraphic}
      >
        <View style={styles.metricHeader}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons name={icon as any} size={18} color="#FFFFFF" />
          </View>
          <AppText style={styles.metricTitle} numberOfLines={1}>
            {title}
          </AppText>
        </View>

        <AppText
          style={styles.metricValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {value}
        </AppText>

        <View style={styles.metricFooter}>
          <AppText
            style={styles.metricSubtitle}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {subtitle}
          </AppText>
          <View style={styles.metricTrack}>
            <View style={[styles.metricProgress, { width: `${safeProgress}%` }]} />
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderStatsSkeleton = () => (
    <View style={styles.cardsList}>
      <View style={styles.statsRow}>
        {[1, 2].map((item) => (
          <View key={item} style={styles.halfCardWrapper}>
            <View style={styles.skeletonCard}>
              <Skeleton height={40} width={40} borderRadius={8} />
              <View style={styles.skeletonCardContent}>
                <Skeleton height={12} width={68} borderRadius={6} />
                <Skeleton height={22} width={84} borderRadius={8} />
                <Skeleton height={12} width={104} borderRadius={6} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading || refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <AppText style={styles.headerTitle}>TODAY'S OVERVIEW</AppText>
          <Skeleton height={32} width={32} variant="circle" />
        </View>
        {renderStatsSkeleton()}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <AppText style={styles.headerTitle}>TODAY'S OVERVIEW</AppText>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
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
        <AppText style={styles.headerTitle}>TODAY'S OVERVIEW</AppText>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.refreshButton}
          activeOpacity={0.7}
          disabled={refreshing}
        >
          <MaterialCommunityIcons name="refresh" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsList}>
        <View style={styles.statsRow}>
          <View style={styles.halfCardWrapper}>
            {renderMetricGraphic({
              title: 'Today PC/TC',
              value: `${stats.calls.pc}/${stats.calls.tc}`,
              subtitle: `${stats.calls.percentage.toFixed(0)}% productive calls`,
              icon: 'calendar-check',
              progress: stats.calls.percentage,
              colors: ['#4158D0', '#38BDF8'],
            })}
          </View>

          <View style={styles.halfCardWrapper}>
            {renderMetricGraphic({
              title: 'Order Value',
              value: formatCurrency(stats.orders.value),
              subtitle: `Cases: ${formatNumber(stats.orders.cases, 1)} | Weight: ${formatNumber(stats.orders.weight, 2)}`,
              icon: 'cart',
              progress: stats.orders.value > 0 ? 100 : 0,
              colors: ['#C850C0', '#FF8A65'],
            })}
          </View>
        </View>
      </View>
    </View>
  );
};
