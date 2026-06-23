import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type { ManagerTeamCoverageResponse } from '../services/home.service';
import { createManagerTeamCoverageStyles } from '../styles/ManagerTeamCoverage.styles';

const INITIAL_TEAM_COVERAGE: ManagerTeamCoverageResponse = {
  users: 0,
  vans: 0,
  warehouse: 12,
  routes: 463,
  outlets: 16904,
  outletsPlanned: 65,
  upc: 11126,
  uic: 11126,
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

export default function ManagerTeamCoverageScreen() {
  const { colors } = useTheme();
  const styles = createManagerTeamCoverageStyles(colors);
  const { setHeader } = useHeader();
  const user = useAuthStore((state) => state.user);
  const [teamCoverage, setTeamCoverage] =
    useState<ManagerTeamCoverageResponse>(INITIAL_TEAM_COVERAGE);
  const userName = user?.name || user?.employeeName || 'Manager';
  const userRole = user?.designation || user?.role || 'Area Manager';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();

  const coverageStats = useMemo(
    () => [
      { label: 'Warehouse', value: formatNumber(teamCoverage.warehouse), icon: 'warehouse' },
      { label: 'Routes', value: formatNumber(teamCoverage.routes), icon: 'routes' },
      { label: 'Outlets', value: formatNumber(teamCoverage.outlets), icon: 'storefront-outline' },
      {
        label: 'Outlets Planned',
        value: formatNumber(teamCoverage.outletsPlanned),
        icon: 'calendar-check-outline',
      },
      { label: 'UPC', value: formatNumber(teamCoverage.upc), icon: 'chart-line' },
      { label: 'UIC', value: formatNumber(teamCoverage.uic), icon: 'clipboard-list-outline' },
    ],
    [teamCoverage],
  );

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

  const fetchTeamCoverage = useCallback(async () => {
    try {
      const response = await homeService.getManagerTeamCoverage();

      if (response.success && response.data) {
        setTeamCoverage(response.data);
      }
    } catch (error) {
      console.warn('Failed to load manager team coverage', error);
    }
  }, []);

  useEffect(() => {
    fetchTeamCoverage();
  }, [fetchTeamCoverage]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.managerInfo}>
            <View style={styles.managerAvatar}>
              <AppText style={styles.managerAvatarText}>{userInitials || 'M'}</AppText>
            </View>
            <View style={styles.managerTextBlock}>
              <AppText style={styles.title}>{userName}</AppText>
              <AppText style={styles.position}>{userRole}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={15} color={colors.primary} />
            </View>
            <View style={styles.infoTextBlock}>
              <AppText style={styles.infoLabel}>User</AppText>
              <AppText style={styles.infoValue}>{formatNumber(teamCoverage.users ?? 0)}</AppText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="van-passenger" size={15} color={colors.primary} />
            </View>
            <View style={styles.infoTextBlock}>
              <AppText style={styles.infoLabel}>Van</AppText>
              <AppText style={styles.infoValue}>{formatNumber(teamCoverage.vans ?? 0)}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          {coverageStats.map((item) => (
            <View key={item.label} style={styles.stat}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <AppText style={styles.statValue}>{item.value}</AppText>
              <AppText style={styles.statLabel}>{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
