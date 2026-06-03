import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';

const COVERAGE_STATS = [
  { label: 'Warehouse', value: '12', icon: 'warehouse' },
  { label: 'Routes', value: '463', icon: 'routes' },
  { label: 'Outlets', value: '16,904', icon: 'storefront-outline' },
  { label: 'Outlets Planned', value: '65', icon: 'calendar-check-outline' },
  { label: 'UPC', value: '11,126', icon: 'chart-line' },
  { label: 'UIC', value: '11,681', icon: 'clipboard-list-outline' },
];

export default function ManagerTeamCoverageScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Team Coverage',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, setHeader]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.toolbar}>
        <AppText style={styles.toolbarLabel}>Reporting to you</AppText>
        <TouchableOpacity style={styles.linkButton} activeOpacity={0.8}>
          <AppText style={styles.linkText}>All field user</AppText>
          <Ionicons name="chevron-forward" size={14} color={colors.info} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <AppText style={styles.position}>L6Position</AppText>
            <AppText style={styles.title}>Distributor Manager</AppText>
            <AppText style={styles.subtitle}>Anwar Quazi</AppText>
          </View>
          <View style={styles.badge}>
            <AppText style={styles.badgeText}>MTD</AppText>
          </View>
        </View>

        <View style={styles.grid}>
          {COVERAGE_STATS.map((item) => (
            <View key={item.label} style={styles.stat}>
              <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.primary} />
              <AppText style={styles.statValue}>{item.value}</AppText>
              <AppText style={styles.statLabel}>{item.label}</AppText>
            </View>
          ))}
        </View>
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
      padding: 14,
      paddingBottom: 32,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    toolbarLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    linkText: {
      color: colors.info,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    position: {
      color: colors.textTertiary,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '800',
      marginTop: 3,
    },
    subtitle: {
      color: colors.textTertiary,
      fontSize: 12,
      marginTop: 2,
    },
    badge: {
      backgroundColor: colors.infoLight,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeText: {
      color: colors.info,
      fontSize: 11,
      fontWeight: '800',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 16,
    },
    stat: {
      width: '33.333%',
      alignItems: 'center',
      gap: 5,
    },
    statValue: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '800',
    },
    statLabel: {
      color: colors.textTertiary,
      fontSize: 11,
      textAlign: 'center',
    },
  });
