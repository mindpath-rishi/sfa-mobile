import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  homeService,
  TargetMetric,
  UserPrimaryCategoryTargetSummary,
  UserWiseTargetSummary,
} from '@/features/home/services/home.service';
import {
  createManagerTargetsBaseStyles,
  createManagerTargetsStyles,
} from '../styles/ManagerTargets.styles';

type TargetUser = UserWiseTargetSummary & {
  children?: TargetUser[];
};

const TARGET_USERS: TargetUser[] = [];

const findUser = (id?: string | string[], users: TargetUser[] = []) => {
  if (!id || Array.isArray(id)) return undefined;

  for (const user of users) {
    if (user.employeeId === id) return user;
    const child = user.children?.find((item) => item.employeeId === id);
    if (child) return child;
  }

  return undefined;
};

const formatRouteDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatSelectedDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const getCurrentMonthPeriod = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  return `${formatSelectedDate(startDate)} - ${formatSelectedDate(now)}`;
};

const METRIC_OPTIONS: { value: TargetMetric; label: string; unit: string }[] = [
  { value: 'cases', label: 'Cases', unit: 'Cases' },
  { value: 'value', label: 'Value', unit: 'Value' },
  { value: 'tonnage', label: 'Tonnage', unit: 'Tonnage' },
];

const formatMetric = (value: number, metric: TargetMetric) => {
  const unit = METRIC_OPTIONS.find((option) => option.value === metric)?.unit || 'Cases';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)} ${unit}`;
};

const getTargetValue = (user: TargetUser, metric: TargetMetric) => {
  if (metric === 'value') return Number(user.targetValue || 0);
  if (metric === 'tonnage') return Number(user.targetTonnage || 0);
  return Number(user.targetCases || 0);
};

const getAchievementValue = (user: TargetUser, metric: TargetMetric) => {
  if (metric === 'value') return Number(user.achievementValue || 0);
  if (metric === 'tonnage') return Number(user.achievementTonnage || 0);
  return Number(user.achievementCases || 0);
};

const getRemainingValue = (item: UserPrimaryCategoryTargetSummary, metric: TargetMetric) => {
  if (metric === 'value') return Number(item.remainingValue || 0);
  if (metric === 'tonnage') return Number(item.remainingTonnage || 0);
  return Number(item.remainingCases || 0);
};

const getCategoryTargetValue = (item: UserPrimaryCategoryTargetSummary, metric: TargetMetric) => {
  if (metric === 'value') return Number(item.targetValue || 0);
  if (metric === 'tonnage') return Number(item.targetTonnage || 0);
  return Number(item.targetCases || 0);
};

const getCategoryAchievementValue = (
  item: UserPrimaryCategoryTargetSummary,
  metric: TargetMetric,
) => {
  if (metric === 'value') return Number(item.achievementValue || 0);
  if (metric === 'tonnage') return Number(item.achievementTonnage || 0);
  return Number(item.achievementCases || 0);
};

function TargetMetricItem({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const stylesBase = createManagerTargetsBaseStyles(colors);

  return (
    <View style={stylesBase.metric}>
      <AppText style={stylesBase.metricValue} numberOfLines={1}>
        {value}
      </AppText>
      <AppText style={stylesBase.metricLabel}>{label}</AppText>
    </View>
  );
}

function TargetUserCard({
  user,
  colors,
  metric,
  onPress,
  onViewCategory,
  categoryExpanded,
}: {
  user: TargetUser;
  colors: any;
  metric: TargetMetric;
  onPress?: () => void;
  onViewCategory: () => void;
  categoryExpanded: boolean;
}) {
  const styles = createManagerTargetsStyles(colors);
  const hasDrillDown = Boolean(onPress);
  const targetValue = getTargetValue(user, metric);
  const achievementValue = getAchievementValue(user, metric);
  const achievementPercentage =
    targetValue > 0 ? Math.min((achievementValue / targetValue) * 100, 100) : 0;

  return (
    <View style={styles.userCard}>
      <View style={styles.userCardHeader}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>
            {user.employeeName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </AppText>
        </View>
        <View style={styles.userTitleWrap}>
          <AppText style={styles.userName}>{user.employeeName}</AppText>
          <AppText style={styles.userPosition}>{user.designation || 'User'}</AppText>
        </View>
        {hasDrillDown && (
          <TouchableOpacity style={styles.drillButton} activeOpacity={0.82} onPress={onPress}>
            <AppText style={styles.drillText}>Team</AppText>
            <Ionicons name="chevron-forward" size={13} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metricsRow}>
        <TargetMetricItem label="Target" value={formatMetric(targetValue, metric)} />
        <TargetMetricItem label="Achievement" value={formatMetric(achievementValue, metric)} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${achievementPercentage}%` }]} />
      </View>
      <View style={styles.progressMetaRow}>
        <AppText style={styles.progressMetaText}>{achievementPercentage.toFixed(1)}%</AppText>
        <AppText style={styles.progressMetaText}>
          Remaining {formatMetric(Math.max(targetValue - achievementValue, 0), metric)}
        </AppText>
      </View>

      <View style={styles.rateRow}>
        <View style={styles.rateBadge}>
          <AppText style={styles.rateLabel}>RRR: {user.rrr}</AppText>
        </View>
        <View style={styles.rateBadge}>
          <AppText style={styles.rateLabel}>CRR: {user.crr}</AppText>
        </View>
      </View>

      <TouchableOpacity style={styles.categoryButton} activeOpacity={0.82} onPress={onViewCategory}>
        <AppText style={styles.categoryButtonText}>
          {categoryExpanded ? 'Hide Primary Category' : 'View Primary Category'}
        </AppText>
        <Ionicons
          name={categoryExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

function CategoryTargetPanel({
  user,
  data,
  metric,
  colors,
  loading,
}: {
  user: TargetUser;
  data: UserPrimaryCategoryTargetSummary[];
  metric: TargetMetric;
  colors: any;
  loading: boolean;
}) {
  const styles = createManagerTargetsStyles(colors);

  return (
    <View style={styles.categoryPanel}>
      <View style={styles.categoryPanelHeader}>
        <View>
          <AppText style={styles.categoryPanelTitle}>Primary Category Targets</AppText>
          <AppText style={styles.categoryPanelSubtitle}>{user.employeeName}</AppText>
        </View>
        <AppText style={styles.categoryPanelBadge}>
          {METRIC_OPTIONS.find((item) => item.value === metric)?.label}
        </AppText>
      </View>

      {loading ? (
        <AppText style={styles.emptyText}>Loading categories...</AppText>
      ) : data.length === 0 ? (
        <AppText style={styles.emptyText}>No category targets found</AppText>
      ) : (
        data.map((item) => {
          const target = getCategoryTargetValue(item, metric);
          const achievement = getCategoryAchievementValue(item, metric);
          const remaining = getRemainingValue(item, metric);
          const percentage = target > 0 ? Math.min((achievement / target) * 100, 100) : 0;

          return (
            <View key={item.categoryId} style={styles.categoryRow}>
              <View style={styles.categoryRowTop}>
                <AppText style={styles.categoryName} numberOfLines={1}>
                  {item.category}
                </AppText>
                <AppText style={styles.categoryPercent}>{percentage.toFixed(1)}%</AppText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
              </View>
              <View style={styles.categoryMetricsGrid}>
                <TargetMetricItem label="Target" value={formatMetric(target, metric)} />
                <TargetMetricItem label="Achieved" value={formatMetric(achievement, metric)} />
                <TargetMetricItem label="Remaining" value={formatMetric(remaining, metric)} />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function ManagerTargetsScreen() {
  const { colors } = useTheme();
  const styles = createManagerTargetsStyles(colors);
  const { setHeader } = useHeader();
  const params = useLocalSearchParams<{ userId?: string; date?: string }>();
  const [targetUsers, setTargetUsers] = useState<TargetUser[]>(TARGET_USERS);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<TargetMetric>('cases');
  const [expandedCategoryUserId, setExpandedCategoryUserId] = useState<string | null>(null);
  const [categoryTargetsByUser, setCategoryTargetsByUser] = useState<
    Record<string, UserPrimaryCategoryTargetSummary[]>
  >({});
  const [categoryLoadingUserId, setCategoryLoadingUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => findUser(params.userId, targetUsers),
    [params.userId, targetUsers],
  );
  const users = selectedUser
    ? selectedUser.children?.length
      ? selectedUser.children
      : [selectedUser]
    : targetUsers;
  const selectedRouteDate = formatRouteDate(new Date());

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: `Primary Targets (${METRIC_OPTIONS.find((item) => item.value === selectedMetric)?.label})`,
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, selectedMetric, setHeader]),
  );

  const fetchTargetSummary = async () => {
    setLoading(true);

    try {
      const response = await homeService.getUserWiseTargetSummary(selectedRouteDate);

      if (response.success && response.data) {
        setTargetUsers(response.data as TargetUser[]);
      }
    } catch (error) {
      console.warn('Failed to load user-wise target summary', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategoryTargets = async (user: TargetUser) => {
    if (expandedCategoryUserId === user.employeeId) {
      setExpandedCategoryUserId(null);
      return;
    }

    setExpandedCategoryUserId(user.employeeId);

    if (categoryTargetsByUser[user.employeeId]) return;

    setCategoryLoadingUserId(user.employeeId);

    try {
      const response = await homeService.getUserPrimaryCategoryTargets({
        employeeId: user.employeeId,
        date: selectedRouteDate,
      });

      if (response.success && response.data) {
        setCategoryTargetsByUser((current) => ({
          ...current,
          [user.employeeId]: response.data || [],
        }));
      }
    } catch (error) {
      console.warn('Failed to load user primary category targets', error);
      setCategoryTargetsByUser((current) => ({
        ...current,
        [user.employeeId]: [],
      }));
    } finally {
      setCategoryLoadingUserId(null);
    }
  };

  useEffect(() => {
    fetchTargetSummary();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBand}>
          <View style={styles.heroIcon}>
            <Ionicons name="flag-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.parentTextWrap}>
            <AppText style={styles.heroTitle}>User wise Primary Category Targets</AppText>
            <AppText style={styles.parentSubtitle}>{getCurrentMonthPeriod()}</AppText>
          </View>
        </View>

        {selectedUser && (
          <View style={styles.parentBanner}>
            <Ionicons name="git-branch-outline" size={16} color={colors.primary} />
            <View style={styles.parentTextWrap}>
              <AppText style={styles.parentTitle}>
                Viewing team under {selectedUser.employeeName}
              </AppText>
              <AppText style={styles.parentSubtitle}>Primary category target drill-down</AppText>
            </View>
          </View>
        )}

        <View style={styles.metricToggle}>
          {METRIC_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.82}
              onPress={() => setSelectedMetric(option.value)}
              style={[
                styles.metricToggleItem,
                selectedMetric === option.value && styles.metricToggleItemActive,
              ]}
            >
              <AppText
                style={[
                  styles.metricToggleText,
                  selectedMetric === option.value && styles.metricToggleTextActive,
                ]}
              >
                {option.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <AppText style={styles.emptyText}>Loading target summary...</AppText>}

        {users.map((user) => (
          <React.Fragment key={user.employeeId}>
            <TargetUserCard
              user={user}
              colors={colors}
              metric={selectedMetric}
              categoryExpanded={expandedCategoryUserId === user.employeeId}
              onViewCategory={() => handleToggleCategoryTargets(user)}
              onPress={
                user.children?.length
                  ? () =>
                      router.push({
                        pathname: '/(drawer)/manager-targets',
                        params: { userId: user.employeeId },
                      })
                  : undefined
              }
            />
            {expandedCategoryUserId === user.employeeId && (
              <CategoryTargetPanel
                user={user}
                data={categoryTargetsByUser[user.employeeId] || []}
                metric={selectedMetric}
                colors={colors}
                loading={categoryLoadingUserId === user.employeeId}
              />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}
