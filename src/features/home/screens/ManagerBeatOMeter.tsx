import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type { ManagerBeatOMeterResponse } from '../services/home.service';
import { createManagerBeatOMeterStyles } from '../styles/ManagerBeatOMeter.styles';

const BEATS = [
  { id: 'tk', title: 'TK Beatometer', subtitle: 'TK Beatometer' },
  { id: 'test', title: 'Test Beato metter', subtitle: 'Outlet performance' },
];

const INITIAL_BEAT_O_METER: ManagerBeatOMeterResponse = {
  employeeId: '',
  employeeName: 'Manager',
  designation: 'Manager',
  totalOutlets: 16904,
  summary: {
    visitedOutlets: 11681,
    orderedOutlets: 11126,
    visitedPercentage: 69.1,
    orderedPercentage: 65.8,
  },
  outletTypes: [
    {
      type: 'New',
      total: 1,
      mtdVisited: { count: 1, percentage: 100 },
      mtdOrder: { count: 0, percentage: 0 },
    },
    {
      type: 'Active',
      total: 13871,
      mtdVisited: { count: 10864, percentage: 78.3 },
      mtdOrder: { count: 10404, percentage: 75 },
    },
    {
      type: 'To Be Dormant',
      total: 1414,
      mtdVisited: { count: 665, percentage: 47 },
      mtdOrder: { count: 598, percentage: 42.3 },
    },
    {
      type: 'Dormant',
      total: 294,
      mtdVisited: { count: 98, percentage: 33.3 },
      mtdOrder: { count: 88, percentage: 29.9 },
    },
    {
      type: 'No Order',
      total: 83,
      mtdVisited: { count: 25, percentage: 30.1 },
      mtdOrder: { count: 12, percentage: 14.5 },
    },
    {
      type: 'Never Visited',
      total: 1241,
      mtdVisited: { count: 28, percentage: 2.3 },
      mtdOrder: { count: 24, percentage: 1.9 },
    },
  ],
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const formatNumber = (value: unknown) => new Intl.NumberFormat('en-US').format(toNumber(value));

const formatCountPercentage = (count: unknown, percentage: unknown) =>
  `${formatNumber(count)} (${toNumber(percentage).toFixed(1)}%)`;

const clampPercentage = (value: unknown) => Math.max(0, Math.min(toNumber(value), 100));

export default function ManagerBeatOMeterScreen() {
  const { colors } = useTheme();
  const styles = createManagerBeatOMeterStyles(colors);
  const { setHeader } = useHeader();
  const user = useAuthStore((state) => state.user);
  const [selectedBeat, setSelectedBeat] = useState(BEATS[0]);
  const [beatOMeter, setBeatOMeter] = useState<ManagerBeatOMeterResponse>(INITIAL_BEAT_O_METER);

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
    const fallbackOutletTypes = INITIAL_BEAT_O_METER.outletTypes ?? [];
    const rows = beatOMeter.outletTypes?.length ? beatOMeter.outletTypes : fallbackOutletTypes;

    return rows.map((row, index) => {
      const fallback = fallbackOutletTypes[index];
      return {
        type: row.type || fallback?.type || 'Outlet',
        color: row.color || fallback?.color || outletPalette[index % outletPalette.length],
        total: formatNumber(row.total ?? fallback?.total),
        visited: formatCountPercentage(
          row.mtdVisited?.count ?? fallback?.mtdVisited?.count,
          row.mtdVisited?.percentage ?? fallback?.mtdVisited?.percentage,
        ),
        order: formatCountPercentage(
          row.mtdOrder?.count ?? fallback?.mtdOrder?.count,
          row.mtdOrder?.percentage ?? fallback?.mtdOrder?.percentage,
        ),
      };
    });
  }, [beatOMeter.outletTypes, outletPalette]);
  const visitedPercentage = clampPercentage(beatOMeter.summary?.visitedPercentage);
  const unvisitedPercentage = 100 - visitedPercentage;

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

  const fetchBeatOMeter = useCallback(async () => {
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
          outletTypes: response.data.outletTypes?.length
            ? response.data.outletTypes
            : INITIAL_BEAT_O_METER.outletTypes,
        });
      }
    } catch (error) {
      console.warn('Failed to load manager beat-o-meter', error);
    }
  }, []);

  useEffect(() => {
    fetchBeatOMeter();
  }, [fetchBeatOMeter]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.listCard}>
        {BEATS.map((beat) => (
          <TouchableOpacity
            key={beat.id}
            style={[styles.beatRow, selectedBeat.id === beat.id && styles.beatRowActive]}
            activeOpacity={0.82}
            onPress={() => setSelectedBeat(beat)}
          >
            <View>
              <AppText style={styles.beatTitle}>{beat.title}</AppText>
              <AppText style={styles.beatSubtitle}>{beat.subtitle}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textQuaternary} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <AppText style={styles.eyebrow}>All L6Position under you</AppText>
            <AppText style={styles.title}>Manager</AppText>
            <AppText style={styles.subtitle}>
              {user?.name || beatOMeter.employeeName || 'Manager'}
            </AppText>
          </View>
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={18} color={colors.info} />
          </TouchableOpacity>
        </View>

        <View style={styles.totalRow}>
          <AppText style={styles.totalLabel}>Total outlets</AppText>
          <AppText style={styles.totalValue}>{formatNumber(beatOMeter.totalOutlets)}</AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${visitedPercentage}%` }]} />
          <View style={[styles.progressTail, { width: `${unvisitedPercentage}%` }]} />
        </View>

        <View style={styles.tableHeader}>
          <AppText style={[styles.tableHeadText, styles.typeColumn]}>Outlet Type</AppText>
          <AppText style={styles.tableHeadText}>Total</AppText>
          <AppText style={styles.tableHeadText}>MTD Visited</AppText>
          <AppText style={styles.tableHeadText}>MTD Order</AppText>
        </View>

        {outletRows.map((row) => (
          <View key={row.type} style={styles.tableRow}>
            <View style={[styles.colorBar, { backgroundColor: row.color }]} />
            <AppText style={[styles.cellText, styles.typeColumn]}>{row.type}</AppText>
            <AppText style={styles.cellText}>{row.total}</AppText>
            <AppText style={styles.cellText}>{row.visited}</AppText>
            <AppText style={styles.cellText}>{row.order}</AppText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
