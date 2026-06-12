import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import {
  homeService,
  type SalesmanDayWiseSummaryItem,
} from '@/features/home/services/home.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
import { useStatsOverviewSectionStyles } from '../../styles/StatusOverviewSection.styles';

type Props = {
  employeeId: string;
  onRefresh?: () => void;
};

interface StatsData {
  totalCalls: number;
  productiveCalls: number;
  unproductiveCalls: number;
  salesValue: number;
  cases: number;
}

const EMPTY_STATS: StatsData = {
  totalCalls: 0,
  productiveCalls: 0,
  unproductiveCalls: 0,
  salesValue: 0,
  cases: 0,
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapTodaySummaryToStats = (summary?: SalesmanDayWiseSummaryItem): StatsData => ({
  totalCalls: toNumber(summary?.tc),
  productiveCalls: toNumber(summary?.pc),
  unproductiveCalls: toNumber(summary?.upc),
  salesValue: toNumber(summary?.netValue),
  cases: toNumber(summary?.cases),
});

export const StatsOverviewSection: React.FC<Props> = ({ employeeId: _employeeId, onRefresh }) => {
  const { colors } = useTheme();
  const styles = useStatsOverviewSectionStyles();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>(EMPTY_STATS);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const today = formatLocalApiDate(new Date());
      const res = await homeService.getSalesmanDayWiseSummary({
        startDate: today,
        endDate: today,
      });
      const summaries = Array.isArray(res?.data) ? res.data : [];
      const todaySummary = summaries.find((item) => item.date === today) ?? summaries[0];

      setStats(mapTodaySummaryToStats(todaySummary));
    } catch (err: any) {
      console.log('Error fetching today stats:', err);
      setError(err?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = useCallback(async () => {
    await fetchStats(true);
    onRefresh?.();
  }, [fetchStats, onRefresh]);

  const formatCurrency = useCallback((value: number) => {
    return `K ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)}`;
  }, []);

  const statTiles = useMemo(() => {
    const strikeRate =
      stats.totalCalls > 0 ? Math.round((stats.productiveCalls / stats.totalCalls) * 100) : 0;

    return [
      {
        title: 'Outlets visited',
        value: stats.totalCalls.toString(),
        subtitle: `${stats.unproductiveCalls} unproductive`,
        positive: true,
        icon: 'store-check-outline',
        color: colors.success,
      },
      {
        title: 'Sales value',
        value: formatCurrency(stats.salesValue),
        subtitle: `${stats.cases.toLocaleString('en-IN')} cases`,
        positive: false,
        icon: 'cash-multiple',
        color: colors.primary,
      },
      {
        title: 'Orders placed',
        value: stats.productiveCalls.toString(),
        subtitle: `${Math.max(stats.totalCalls - stats.productiveCalls, 0)} no order`,
        positive: false,
        icon: 'clipboard-text-outline',
        color: colors.info,
      },
      {
        title: 'Strike rate',
        value: `${strikeRate}%`,
        subtitle: strikeRate >= 70 ? 'Above average' : 'Needs focus',
        positive: strikeRate >= 70,
        icon: 'target',
        color: strikeRate >= 70 ? colors.success : colors.warning,
      },
    ];
  }, [colors.info, colors.primary, colors.success, colors.warning, formatCurrency, stats]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="chart-box-outline" size={15} color={colors.primary} />
        </View>
        <AppText style={styles.headerTitle}>Today's stats</AppText>
      </View>
      <TouchableOpacity
        onPress={handleRefresh}
        style={styles.refreshButton}
        activeOpacity={0.7}
        disabled={refreshing}
      >
        <MaterialCommunityIcons name="refresh" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText style={styles.loadingText}>Loading stats...</AppText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={28} color={colors.error} />
          <AppText style={styles.errorText}>{error}</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={styles.grid}>
        {statTiles.map((tile) => (
          <View key={tile.title} style={styles.tile}>
            <View style={styles.tileHeader}>
              <View style={[styles.tileIcon, { backgroundColor: tile.color + '14' }]}>
                <MaterialCommunityIcons name={tile.icon as any} size={16} color={tile.color} />
              </View>
              <AppText style={styles.tileTitle}>{tile.title}</AppText>
            </View>
            <AppText style={styles.tileValue}>{tile.value}</AppText>
            <AppText style={[styles.tileSubtitle, tile.positive && styles.tileSubtitlePositive]}>
              {tile.subtitle}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};
