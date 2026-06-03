import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';

const BEATS = [
  { id: 'tk', title: 'TK Beatometer', subtitle: 'TK Beatometer' },
  { id: 'test', title: 'Test Beato metter', subtitle: 'Outlet performance' },
];

const OUTLET_ROWS = [
  { type: 'New', total: '1', visited: '1 (100.0%)', order: '0 (0.0%)', color: '#A855F7' },
  {
    type: 'Active',
    total: '13871',
    visited: '10864 (78.3%)',
    order: '10404 (75.0%)',
    color: '#22C55E',
  },
  {
    type: 'To Be Dormant',
    total: '1414',
    visited: '665 (47.0%)',
    order: '598 (42.3%)',
    color: '#3B82F6',
  },
  { type: 'Dormant', total: '294', visited: '98 (33.3%)', order: '88 (29.9%)', color: '#F59E0B' },
  { type: 'No Order', total: '83', visited: '25 (30.1%)', order: '12 (14.5%)', color: '#F97316' },
  { type: 'Never Visited', total: '1241', visited: '28 (2.3%)', order: '24 (1.9%)', color: '#EF4444' },
];

export default function ManagerBeatOMeterScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();
  const [selectedBeat, setSelectedBeat] = useState(BEATS[0]);

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
            <AppText style={styles.title}>Distributor Manager</AppText>
            <AppText style={styles.subtitle}>Anwar Quazi</AppText>
          </View>
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={18} color={colors.info} />
          </TouchableOpacity>
        </View>

        <View style={styles.totalRow}>
          <AppText style={styles.totalLabel}>Total outlets</AppText>
          <AppText style={styles.totalValue}>16904</AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '82%' }]} />
          <View style={[styles.progressTail, { width: '18%' }]} />
        </View>

        <View style={styles.tableHeader}>
          <AppText style={[styles.tableHeadText, styles.typeColumn]}>Outlet Type</AppText>
          <AppText style={styles.tableHeadText}>Total</AppText>
          <AppText style={styles.tableHeadText}>MTD Visited</AppText>
          <AppText style={styles.tableHeadText}>MTD Order</AppText>
        </View>

        {OUTLET_ROWS.map((row) => (
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
