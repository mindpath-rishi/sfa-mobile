import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type { ManagerBeatOMeterResponse } from '../services/home.service';

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
      color: '#A855F7',
      total: 1,
      mtdVisited: { count: 1, percentage: 100 },
      mtdOrder: { count: 0, percentage: 0 },
    },
    {
      type: 'Active',
      color: '#22C55E',
      total: 13871,
      mtdVisited: { count: 10864, percentage: 78.3 },
      mtdOrder: { count: 10404, percentage: 75 },
    },
    {
      type: 'To Be Dormant',
      color: '#3B82F6',
      total: 1414,
      mtdVisited: { count: 665, percentage: 47 },
      mtdOrder: { count: 598, percentage: 42.3 },
    },
    {
      type: 'Dormant',
      color: '#F59E0B',
      total: 294,
      mtdVisited: { count: 98, percentage: 33.3 },
      mtdOrder: { count: 88, percentage: 29.9 },
    },
    {
      type: 'No Order',
      color: '#F97316',
      total: 83,
      mtdVisited: { count: 25, percentage: 30.1 },
      mtdOrder: { count: 12, percentage: 14.5 },
    },
    {
      type: 'Never Visited',
      color: '#EF4444',
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
  const styles = createStyles(colors);
  const { setHeader } = useHeader();
  const user = useAuthStore((state) => state.user);
  const [selectedBeat, setSelectedBeat] = useState(BEATS[0]);
  const [beatOMeter, setBeatOMeter] = useState<ManagerBeatOMeterResponse>(INITIAL_BEAT_O_METER);

  const outletRows = useMemo(
    () =>
      (beatOMeter.outletTypes?.length
        ? beatOMeter.outletTypes
        : INITIAL_BEAT_O_METER.outletTypes
      ).map((row, index) => {
        const fallback = INITIAL_BEAT_O_METER.outletTypes[index];

        return {
          type: row.type || fallback?.type || 'Outlet',
          color: row.color || fallback?.color || '#3B82F6',
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
      }),
    [beatOMeter.outletTypes],
  );
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 12,
      paddingBottom: 32,
      gap: 12,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    beatRow: {
      minHeight: 62,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    beatRowActive: {
      backgroundColor: colors.infoLight,
    },
    beatTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    beatSubtitle: {
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 2,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    eyebrow: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 2,
    },
    shareButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.infoLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    totalLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    totalValue: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },
    progressTrack: {
      height: 18,
      borderRadius: 4,
      overflow: 'hidden',
      flexDirection: 'row',
      marginTop: 6,
      marginBottom: 18,
    },
    progressFill: {
      backgroundColor: '#42A832',
    },
    progressTail: {
      backgroundColor: '#F04D4D',
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    tableHeadText: {
      flex: 1,
      color: colors.primaryDark,
      fontSize: 11,
      fontWeight: '900',
      textAlign: 'right',
      textTransform: 'uppercase',
    },
    typeColumn: {
      flex: 1.35,
      textAlign: 'left',
    },
    tableRow: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
    },
    colorBar: {
      width: 6,
      height: 24,
      borderRadius: 2,
      marginRight: 8,
    },
    cellText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'right',
    },
  });
