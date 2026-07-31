import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText, Skeleton } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type { ManagerBeatOMeterResponse } from '../services/home.service';
import { createManagerBeatOMeterStyles } from '../styles/ManagerBeatOMeter.styles';

const INITIAL_BEAT_O_METER: ManagerBeatOMeterResponse = {
  employeeId: '',
  employeeName: 'Manager',
  position: 'Manager',
  totalOutlets: 0,
  summary: {
    visitedOutlets: 0,
    orderedOutlets: 0,
    visitedPercentage: 0,
    orderedPercentage: 0,
  },
  outletTypes: [],
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const formatNumber = (value: unknown) => new Intl.NumberFormat('en-US').format(toNumber(value));

const formatCountPercentage = (count: unknown, percentage: unknown) =>
  `${formatNumber(count)} (${toNumber(percentage).toFixed(1)}%)`;

const clampPercentage = (value: unknown) => Math.max(0, Math.min(toNumber(value), 100));

const formatPercentage = (value: unknown) => `${clampPercentage(value).toFixed(1)}%`;

function BeatOMeterSkeleton({
  styles,
}: {
  styles: ReturnType<typeof createManagerBeatOMeterStyles>;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.skeletonTitleBlock}>
            <Skeleton width="46%" height={11} borderRadius={6} />
            <Skeleton width="64%" height={25} borderRadius={6} style={styles.skeletonLineGap} />
          </View>
          <Skeleton width={58} height={58} borderRadius={8} />
        </View>
        <View style={styles.primaryMetricRow}>
          <Skeleton width="48%" height={70} borderRadius={8} />
          <Skeleton width="48%" height={70} borderRadius={8} />
        </View>
        <Skeleton width="100%" height={10} borderRadius={6} />
      </View>

      <View style={styles.card}>
        <View style={styles.tableHeader}>
          <Skeleton width="38%" height={18} borderRadius={6} />
          <Skeleton width="20%" height={13} borderRadius={6} />
        </View>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.skeletonOutletRow}>
            <Skeleton width="42%" height={16} borderRadius={6} />
            <Skeleton width="100%" height={6} borderRadius={6} style={styles.skeletonLineGap} />
            <View style={styles.skeletonStatsRow}>
              <Skeleton width="38%" height={24} borderRadius={6} />
              <Skeleton width="38%" height={24} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function ManagerBeatOMeterScreen() {
  const { colors } = useTheme();
  const styles = createManagerBeatOMeterStyles(colors);
  const { setHeader } = useHeader();
  const [beatOMeter, setBeatOMeter] = useState<ManagerBeatOMeterResponse>(INITIAL_BEAT_O_METER);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isFetchingRef = useRef(false);

  const outletPalette = useMemo(
    () => [
      colors.secondary,
      colors.success,
      colors.info,
      colors.warning,
      colors.warningDark,
      colors.error,
    ],
    [
      colors.error,
      colors.info,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.warningDark,
    ],
  );

  const outletRows = useMemo(() => {
    const rows = beatOMeter.outletTypes ?? [];

    return rows.map((row, index) => ({
      type: row.type || 'Outlet',
      color: row.color || outletPalette[index % outletPalette.length],
      total: formatNumber(row.total),
      visited: formatCountPercentage(row.mtdVisited?.count, row.mtdVisited?.percentage),
      order: formatCountPercentage(row.mtdOrder?.count, row.mtdOrder?.percentage),
      visitedPercentage: clampPercentage(row.mtdVisited?.percentage),
      orderPercentage: clampPercentage(row.mtdOrder?.percentage),
    }));
  }, [beatOMeter.outletTypes, outletPalette]);
  const visitedPercentage = clampPercentage(beatOMeter.summary?.visitedPercentage);
  const unvisitedPercentage = 100 - visitedPercentage;
  const orderedPercentage = clampPercentage(beatOMeter.summary?.orderedPercentage);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Beat-O-Meter',
        showBack: true,
        showMenu: false,
        showSearch: true,
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, setHeader]),
  );

  const fetchBeatOMeter = useCallback(async ({ silent }: { silent?: boolean } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await homeService.getManagerBeatOMeter();

      if (response.success && response.data) {
        setBeatOMeter({
          ...INITIAL_BEAT_O_METER,
          ...response.data,
          summary: {
            ...INITIAL_BEAT_O_METER.summary,
            ...response.data.summary,
          },
          outletTypes: response.data.outletTypes?.length ? response.data.outletTypes : [],
        });
        setHasError(false);
      } else if (!silent) {
        setHasError(true);
      }
    } catch (error) {
      console.warn('Failed to load manager beat-o-meter', error);
      setHasError(true);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchBeatOMeter();
    }, [fetchBeatOMeter]),
  );

  const handleRefresh = useCallback(() => {
    if (isFetchingRef.current) {
      return;
    }

    setIsRefreshing(true);
    fetchBeatOMeter({ silent: true });
  }, [fetchBeatOMeter]);

  if (isLoading) {
    return <BeatOMeterSkeleton styles={styles} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {hasError && (
        <TouchableOpacity
          style={styles.errorBanner}
          activeOpacity={0.82}
          onPress={() => fetchBeatOMeter()}
          accessibilityRole="button"
          accessibilityLabel="Retry loading beat-o-meter"
        >
          <Ionicons name="alert-circle-outline" size={17} color={colors.error} />
          <AppText style={styles.errorBannerText}>Couldn't refresh data. Tap to retry.</AppText>
        </TouchableOpacity>
      )}

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryTitleBlock}>
            <AppText style={styles.summaryEyebrow}>MTD coverage health</AppText>
            <AppText style={styles.summaryTitle}>Beat-O-Meter</AppText>
          </View>
          <View style={styles.totalBadge}>
            <AppText style={styles.totalBadgeValue}>
              {formatNumber(beatOMeter.totalOutlets)}
            </AppText>
            <AppText style={styles.totalBadgeLabel}>Outlets</AppText>
          </View>
        </View>

        <View style={styles.primaryMetricRow}>
          <View style={styles.primaryMetric}>
            <View style={[styles.primaryMetricIcon, styles.visitedMetricIcon]}>
              <Ionicons name="walk-outline" size={17} color={colors.success} />
            </View>
            <View style={styles.primaryMetricTextBlock}>
              <AppText style={styles.primaryMetricValue}>
                {formatNumber(beatOMeter.summary?.visitedOutlets)}
              </AppText>
              <AppText style={styles.primaryMetricLabel}>Visited</AppText>
            </View>
            <AppText style={styles.primaryMetricPercent}>
              {formatPercentage(beatOMeter.summary?.visitedPercentage)}
            </AppText>
          </View>

          <View style={styles.primaryMetric}>
            <View style={[styles.primaryMetricIcon, styles.orderedMetricIcon]}>
              <Ionicons name="receipt-outline" size={17} color={colors.info} />
            </View>
            <View style={styles.primaryMetricTextBlock}>
              <AppText style={styles.primaryMetricValue}>
                {formatNumber(beatOMeter.summary?.orderedOutlets)}
              </AppText>
              <AppText style={styles.primaryMetricLabel}>Ordered</AppText>
            </View>
            <AppText style={styles.primaryMetricPercent}>
              {formatPercentage(beatOMeter.summary?.orderedPercentage)}
            </AppText>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <AppText style={styles.progressLabel}>Visited progress</AppText>
          <AppText style={styles.progressValue}>{formatPercentage(visitedPercentage)}</AppText>
        </View>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: visitedPercentage }}
        >
          <View style={[styles.progressFill, { width: `${visitedPercentage}%` }]} />
          <View style={[styles.progressTail, { width: `${unvisitedPercentage}%` }]} />
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <AppText style={styles.legendText}>Visited</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <AppText style={styles.legendText}>Pending</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
            <AppText style={styles.legendText}>
              {formatPercentage(orderedPercentage)} ordered
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.tableHeader}>
          <AppText style={[styles.tableHeadText, styles.typeColumn]}>Outlet Type</AppText>
          <AppText style={styles.tableHeadText}>Total</AppText>
          <AppText style={styles.tableHeadText}>MTD Visited</AppText>
          <AppText style={styles.tableHeadText}>MTD Order</AppText>
        </View>
        {outletRows.length === 0 ? (
          <AppText style={styles.emptyText}>No beat-o-meter data found</AppText>
        ) : (
          outletRows.map((row) => (
            <View key={row.type} style={styles.tableRow}>
              <View style={[styles.colorBar, { backgroundColor: row.color }]} />
              <AppText style={[styles.cellText, styles.typeColumn]}>{row.type}</AppText>
              <AppText style={styles.cellText}>{row.total}</AppText>
              <AppText style={styles.cellText}>{row.visited}</AppText>
              <AppText style={styles.cellText}>{row.order}</AppText>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
