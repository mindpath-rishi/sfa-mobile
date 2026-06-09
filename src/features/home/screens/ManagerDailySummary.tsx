import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type {
  ManagerFieldUserSummary,
  ManagerStatsResponse,
  ManagerUserTimelineResponse,
  TargetMetric,
} from '../services/home.service';
import { ManagerDatePickerModal } from '../components/models/ManagerDatePickerModal';
import {
  createBaseStyles,
  createManagerDailySummaryStyles,
} from '../styles/ManagerDailySummary.styles';

type SummaryStatus = 'retailing' | 'official-work' | 'leave' | 'absent';
type DailyView = 'summary' | 'users' | 'timeline' | 'order';

type UserMetric = {
  label: string;
  value: string;
};

const METRIC_OPTIONS: { value: TargetMetric; label: string; unit: string }[] = [
  { value: 'cases', label: 'Cases', unit: 'Cases' },
  { value: 'tonnage', label: 'Tonnage', unit: 'Tonnage' },
  { value: 'value', label: 'Value', unit: 'Value' },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));

const uniqueBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

type TimelineActivity = {
  id: string;
  source?: string;
  type: string;
  time: string;
  duration: string;
  outlet: string;
  owner: string;
  metrics: UserMetric[];
  order?: OrderDetail;
};

type OrderLine = {
  id: string;
  name: string;
  ptr: string;
  qty: string;
  unit: string;
  value: string;
};

type OrderCategory = {
  id: string;
  name: string;
  meta: string;
  value: string;
  lines: OrderLine[];
};

type OrderDetail = {
  orderNo: string;
  outlet: string;
  quantityCases: string;
  quantitySuperUnit: string;
  totalPieces: string;
  netValue: string;
  categories: OrderCategory[];
  schemeDiscount: string;
  cashDiscount: string;
  tax: string;
  payableAmount: string;
};

type FieldUser = {
  id: string;
  name: string;
  position: string;
  status: SummaryStatus;
  activityName?: string;
  activityColor?: string;
  location: string;
  route: string;
  firstCall: string;
  firstPc: string;
  tc: string;
  pc: string;
  lpc: string;
  phone: string;
  activities: TimelineActivity[];
};

const STATUS_LABELS: Record<SummaryStatus, string> = {
  retailing: 'Retailing',
  'official-work': 'Official Work',
  leave: 'Leave',
  absent: 'Absent',
};

const SUMMARY_COUNTS: Record<SummaryStatus | 'total', number> = {
  total: 190,
  retailing: 152,
  'official-work': 1,
  leave: 0,
  absent: 37,
};

const INITIAL_MANAGER_STATS: ManagerStatsResponse = {
  userSummary: {
    total: SUMMARY_COUNTS.total,
    retailing: SUMMARY_COUNTS.retailing,
    officeWork: SUMMARY_COUNTS['official-work'],
    leave: SUMMARY_COUNTS.leave,
    absent: SUMMARY_COUNTS.absent,
  },
  callSummary: {
    productivity: 89,
    covered: 3,
    pc: 463,
    tc: 515,
    sc: 19356,
    qtyCases: 2425.1,
    qtyTonnage: 0,
    qtyValue: 19356,
  },
};

const getParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const parseRouteDate = (value?: string) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
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

const getStatusFromActivity = (activityName?: string | null): SummaryStatus => {
  const normalizedActivity = activityName?.trim().toLowerCase();

  if (normalizedActivity === 'retailing') return 'retailing';
  if (normalizedActivity === 'official work') return 'official-work';
  if (normalizedActivity === 'leave') return 'leave';
  if (normalizedActivity === 'absent') return 'absent';

  return 'absent';
};

const formatApiTime = (value?: string | null) => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  const hours = date.getUTCHours();
  const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${`${displayHours}`.padStart(2, '0')}:${minutes} ${period}`;
};

const mapFieldUserSummary = (user: ManagerFieldUserSummary): FieldUser => {
  const status = getStatusFromActivity(user.activity?.name);
  const summary = user.summary ?? {};

  return {
    id: user.employeeId,
    name: user.employeeName || 'Unknown User',
    position: user.employeeId,
    status,
    activityName: user.activity?.name,
    activityColor: user.activity?.color,
    location: user.location || '--',
    route: user.routeName || '--',
    firstCall: formatApiTime(summary.firstCallTime),
    firstPc: formatApiTime(summary.firstPcTime),
    tc: `${summary.tc ?? 0}`,
    pc: `${summary.pc ?? 0}`,
    lpc: `${summary.lpc ?? 0}`,
    phone: user.mobile || '',
    activities: [],
  };
};

const dedupeTimelineActivities = (activities: TimelineActivity[]) =>
  uniqueBy(
    activities.map((activity) => ({
      ...activity,
      metrics: uniqueBy(activity.metrics || [], (metric) => metric.label),
      order: activity.order
        ? {
            ...activity.order,
            categories: uniqueBy(activity.order.categories || [], (category) => category.id).map(
              (category) => ({
                ...category,
                lines: uniqueBy(category.lines || [], (line) => line.id),
              }),
            ),
          }
        : undefined,
    })),
    (activity) =>
      `${activity.source || 'activity'}-${activity.id}-${activity.time}-${activity.outlet}`,
  );

function SummaryMetric({
  label,
  value,
  color,
  mutedColor,
  styles,
  onPress,
}: {
  label: string;
  value: number;
  color: string;
  mutedColor: string;
  styles: ReturnType<typeof createBaseStyles>;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.summaryMetric} activeOpacity={0.78} onPress={onPress}>
      <View style={styles.summaryMetricTop}>
        <View style={[styles.summaryMarker, { backgroundColor: color }]} />
        <Ionicons name="chevron-forward" size={12} color={mutedColor} />
      </View>
      <AppText style={styles.summaryLabel}>{label}</AppText>
      <AppText style={styles.summaryValue}>{formatNumber(value)}</AppText>
    </TouchableOpacity>
  );
}

function UserStat({
  label,
  value,
  styles,
}: UserMetric & { styles: ReturnType<typeof createBaseStyles> }) {
  return (
    <View style={styles.userStat}>
      <AppText style={styles.userStatLabel}>{label}</AppText>
      <AppText style={styles.userStatValue}>{value}</AppText>
    </View>
  );
}

type ManagerDailySummaryScreenProps = {
  forcedView?: DailyView;
};

export default function ManagerDailySummaryScreen({ forcedView }: ManagerDailySummaryScreenProps) {
  const { colors } = useTheme();
  const styles = createManagerDailySummaryStyles(colors);
  const baseStyles = useMemo(() => createBaseStyles(colors), [colors]);
  const { setHeader } = useHeader();
  const user = useAuthStore((state) => state.user);
  const params = useLocalSearchParams<{
    status?: SummaryStatus;
    userId?: string;
    view?: DailyView;
    activityId?: string;
    date?: string;
  }>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => parseRouteDate(getParam(params.date)));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [managerStats, setManagerStats] = useState<ManagerStatsResponse>(INITIAL_MANAGER_STATS);
  const [fieldUsers, setFieldUsers] = useState<FieldUser[]>([]);
  const [searchKey, setSearchKey] = useState('');
  const [debouncedSearchKey, setDebouncedSearchKey] = useState('');
  const [loadingFieldUsers, setLoadingFieldUsers] = useState(false);
  const [summaryMetric, setSummaryMetric] = useState<TargetMetric>('cases');
  const [timelinesByUser, setTimelinesByUser] = useState<
    Record<string, ManagerUserTimelineResponse>
  >({});
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const status = getParam(params.status) as SummaryStatus | undefined;
  const userId = getParam(params.userId);
  const activityId = getParam(params.activityId);
  const selectedRouteDate = formatRouteDate(selectedDate);
  const statusMeta = useMemo(
    () => ({
      retailing: { label: STATUS_LABELS.retailing, color: colors.success },
      'official-work': { label: STATUS_LABELS['official-work'], color: colors.info },
      leave: { label: STATUS_LABELS.leave, color: colors.warning },
      absent: { label: STATUS_LABELS.absent, color: colors.error },
    }),
    [colors.error, colors.info, colors.success, colors.warning],
  );
  const routeSelectedUser = useMemo(
    () => fieldUsers.find((user) => user.id === userId),
    [fieldUsers, userId],
  );
  const selectedUser = useMemo(() => {
    if (!routeSelectedUser) return undefined;
    return {
      ...routeSelectedUser,
      activities: userId
        ? (timelinesByUser[userId]?.activities ?? [])
        : routeSelectedUser.activities,
    };
  }, [routeSelectedUser, timelinesByUser, userId]);
  const selectedActivity = useMemo(
    () => selectedUser?.activities.find((activity) => activity.id === activityId),
    [activityId, selectedUser],
  );
  const routeView: DailyView = selectedActivity?.order
    ? 'order'
    : selectedUser
      ? 'timeline'
      : getParam(params.view) === 'users'
        ? 'users'
        : 'summary';
  const view: DailyView = forcedView || routeView;
  const filteredUsers = useMemo(
    () => fieldUsers.filter((user) => !status || user.status === status),
    [fieldUsers, status],
  );
  const summaryCounts: Record<SummaryStatus | 'total', number> = {
    total: managerStats.userSummary.total,
    retailing: managerStats.userSummary.retailing,
    'official-work': managerStats.userSummary.officeWork,
    leave: managerStats.userSummary.leave,
    absent: managerStats.userSummary.absent,
  };
  const selectedSummaryMetric = useMemo(() => {
    if (summaryMetric === 'tonnage') {
      return {
        value: managerStats.callSummary.qtyTonnage ?? 0,
        unit: 'Tonnage',
      };
    }

    if (summaryMetric === 'value') {
      return {
        value: managerStats.callSummary.qtyValue ?? managerStats.callSummary.sc ?? 0,
        unit: 'Value',
      };
    }

    return {
      value: managerStats.callSummary.qtyCases ?? 0,
      unit: 'Cases',
    };
  }, [managerStats.callSummary, summaryMetric]);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title:
          view === 'order' ? 'Order Details' : selectedUser ? selectedUser.name : 'Daily Summary',
        showBack: view !== 'summary',
        showMenu: view === 'summary',
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, selectedUser, setHeader, view]),
  );

  const fetchManagerStats = useCallback(async (date?: string) => {
    try {
      const response = await homeService.getManagerStats(date);

      if (response.success && response.data) {
        setManagerStats({
          userSummary: response.data.userSummary ?? INITIAL_MANAGER_STATS.userSummary,
          callSummary: response.data.callSummary ?? INITIAL_MANAGER_STATS.callSummary,
        });
      }
    } catch (error) {
      console.warn('Failed to load daily summary manager stats', error);
    }
  }, []);

  const fetchFieldUsers = useCallback(async (date?: string, nextSearchKey?: string) => {
    setLoadingFieldUsers(true);

    try {
      const response = await homeService.getManagerFieldUsers({
        date,
        searchKey: nextSearchKey?.trim(),
      });

      if ((response.success || response.statusCode === 200) && Array.isArray(response.data)) {
        setFieldUsers(
          uniqueBy(response.data.map(mapFieldUserSummary), (fieldUser) => fieldUser.id),
        );
      }
    } catch (error) {
      console.warn('Failed to load manager field users', error);
    } finally {
      setLoadingFieldUsers(false);
    }
  }, []);

  const fetchUserTimeline = useCallback(async (employeeId: string, date?: string) => {
    setLoadingTimeline(true);

    try {
      const response = await homeService.getManagerUserTimeline({
        employeeId,
        date,
      });

      if ((response.success || response.statusCode === 200) && response.data) {
        setTimelinesByUser((prev) => ({
          ...prev,
          [employeeId]: {
            ...response.data,
            activities: dedupeTimelineActivities(response.data.activities || []),
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to load manager user timeline', error);
    } finally {
      setLoadingTimeline(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchManagerStats(selectedRouteDate),
      view === 'users' || view === 'timeline' || view === 'order'
        ? fetchFieldUsers(selectedRouteDate, debouncedSearchKey)
        : Promise.resolve(),
      userId && (view === 'timeline' || view === 'order')
        ? fetchUserTimeline(userId, selectedRouteDate)
        : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchManagerStats(selectedRouteDate);
  }, [fetchManagerStats, selectedRouteDate]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchKey(searchKey.trim()), 350);

    return () => clearTimeout(timer);
  }, [searchKey]);

  useEffect(() => {
    if (view === 'users' || view === 'timeline' || view === 'order') {
      fetchFieldUsers(selectedRouteDate, debouncedSearchKey);
    }
  }, [debouncedSearchKey, fetchFieldUsers, selectedRouteDate, view]);

  useEffect(() => {
    if (userId && (view === 'timeline' || view === 'order')) {
      fetchUserTimeline(userId, selectedRouteDate);
    }
  }, [fetchUserTimeline, selectedRouteDate, userId, view]);

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const openUsers = (nextStatus?: SummaryStatus) => {
    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/users',
      params: nextStatus
        ? { status: nextStatus, date: selectedRouteDate }
        : { date: selectedRouteDate },
    });
  };

  const openTimeline = (nextUser: FieldUser) => {
    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/[userId]',
      params: { userId: nextUser.id, date: selectedRouteDate },
    });
  };

  const openOrder = (nextActivity: TimelineActivity) => {
    if (!nextActivity.order || !selectedUser) return;

    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/[userId]/order/[activityId]',
      params: { userId: selectedUser.id, activityId: nextActivity.id, date: selectedRouteDate },
    });
  };

  const openSummary = () => {
    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary',
      params: { date: selectedRouteDate },
    });
  };

  const flowSteps = [
    {
      key: 'summary',
      label: 'Summary',
      enabled: true,
      active: view === 'summary',
      onPress: openSummary,
    },
    {
      key: 'users',
      label: 'Users',
      enabled: true,
      active: view === 'users',
      onPress: () => openUsers(status),
    },
    {
      key: 'timeline',
      label: 'Timeline',
      enabled: Boolean(selectedUser),
      active: view === 'timeline',
      onPress: () => selectedUser && openTimeline(selectedUser),
    },
    {
      key: 'order',
      label: 'Order',
      enabled: Boolean(selectedActivity),
      active: view === 'order',
      onPress: () => {},
    },
  ];
  const userInitials = (user?.name || 'Manager')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      <ManagerDatePickerModal
        visible={showDatePicker}
        value={selectedDate}
        title="Select summary date"
        onClose={() => setShowDatePicker(false)}
        onApply={setSelectedDate}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {view !== 'order' && (
          <View style={styles.dailyHeader}>
            <View style={styles.dailyHeaderMain}>
              <View style={styles.dailyIcon}>
                <Ionicons name="calendar-clear-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.dailyHeaderText}>
                <AppText style={styles.sectionTitle}>DAILY SUMMARY</AppText>
                <AppText style={styles.dailyTitle}>{formatSelectedDate(selectedDate)}</AppText>
              </View>
            </View>
            <TouchableOpacity
              style={styles.dateButton}
              activeOpacity={0.82}
              onPress={openDatePicker}
            >
              <Ionicons name="swap-horizontal" size={15} color={colors.primary} />
              <AppText style={styles.dateButtonText}>Change</AppText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.flowNav}>
          {flowSteps.map((step, index) => (
            <React.Fragment key={step.key}>
              <TouchableOpacity
                style={[
                  styles.flowStep,
                  step.active && styles.flowStepActive,
                  !step.enabled && styles.flowStepDisabled,
                ]}
                activeOpacity={step.enabled ? 0.82 : 1}
                onPress={step.enabled ? step.onPress : undefined}
              >
                <AppText
                  style={[
                    styles.flowStepText,
                    step.active && styles.flowStepTextActive,
                    !step.enabled && styles.flowStepTextDisabled,
                  ]}
                >
                  {step.label}
                </AppText>
              </TouchableOpacity>
              {index < flowSteps.length - 1 && (
                <Ionicons name="chevron-forward" size={12} color={colors.textQuaternary} />
              )}
            </React.Fragment>
          ))}
          <TouchableOpacity style={styles.flowRefresh} activeOpacity={0.78} onPress={onRefresh}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {(view === 'summary' || view === 'users') && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.managerInfo}>
                <View style={styles.managerAvatar}>
                  <AppText style={styles.managerAvatarText}>{userInitials || 'M'}</AppText>
                </View>
                <View style={styles.managerTextBlock}>
                  <AppText style={styles.sectionTitle}>REPORTING TO YOU</AppText>
                  <AppText style={styles.cardTitle}>{user?.name || 'Manager'}</AppText>
                  <AppText style={styles.cardSubTitle}>(Manager)</AppText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.linkButton}
                activeOpacity={0.78}
                onPress={() => openUsers()}
              >
                <AppText style={styles.linkText}>ALL FIELD USER</AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.refreshMetaRow}>
              <Ionicons name="time-outline" size={12} color={colors.textQuaternary} />
              <AppText style={styles.refreshed}>Last refreshed just now</AppText>
            </View>
            <View style={styles.metricToggle}>
              {METRIC_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.82}
                  onPress={() => setSummaryMetric(option.value)}
                  style={[
                    styles.metricToggleItem,
                    summaryMetric === option.value && styles.metricToggleItemActive,
                  ]}
                >
                  <AppText
                    style={[
                      styles.metricToggleText,
                      summaryMetric === option.value && styles.metricToggleTextActive,
                    ]}
                  >
                    {option.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.summaryGrid}>
              <SummaryMetric
                label="Total Users"
                value={summaryCounts.total}
                color={colors.info}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
                onPress={() => openUsers()}
              />
              <SummaryMetric
                label="Retailing"
                value={summaryCounts.retailing}
                color={statusMeta.retailing.color}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
                onPress={() => openUsers('retailing')}
              />
              <SummaryMetric
                label="Official Work"
                value={summaryCounts['official-work']}
                color={statusMeta['official-work'].color}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
                onPress={() => openUsers('official-work')}
              />
              <SummaryMetric
                label="Leave"
                value={summaryCounts.leave}
                color={statusMeta.leave.color}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
                onPress={() => openUsers('leave')}
              />
              <SummaryMetric
                label="Absent"
                value={summaryCounts.absent}
                color={statusMeta.absent.color}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
                onPress={() => openUsers('absent')}
              />
              <SummaryMetric
                label="SC"
                value={managerStats.callSummary.sc}
                color={colors.textSecondary}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
              />
              <SummaryMetric
                label="TC"
                value={managerStats.callSummary.tc}
                color={colors.info}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
              />
              <SummaryMetric
                label="PC"
                value={managerStats.callSummary.pc}
                color={statusMeta.retailing.color}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
              />
              <SummaryMetric
                label={selectedSummaryMetric.unit}
                value={selectedSummaryMetric.value}
                color={colors.primary}
                mutedColor={colors.textQuaternary}
                styles={baseStyles}
              />
            </View>
          </View>
        )}

        {view === 'users' && (
          <>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={colors.textTertiary} />
              <TextInput
                value={searchKey}
                onChangeText={setSearchKey}
                placeholder="Search"
                placeholderTextColor={colors.textTertiary}
                style={styles.searchInput}
              />
              {searchKey ? (
                <TouchableOpacity activeOpacity={0.78} onPress={() => setSearchKey('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="filter" size={16} color={colors.info} />
              )}
            </View>
            <View style={styles.compactStats}>
              {(['retailing', 'official-work', 'leave', 'absent'] as SummaryStatus[]).map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.compactStat,
                      status === item && { borderBottomColor: statusMeta[item].color },
                    ]}
                    activeOpacity={0.78}
                    onPress={() => openUsers(item)}
                  >
                    <AppText style={styles.compactStatLabel}>{statusMeta[item].label}</AppText>
                    <AppText style={styles.compactStatValue}>{summaryCounts[item]}</AppText>
                  </TouchableOpacity>
                ),
              )}
              <TouchableOpacity
                style={[styles.compactStat, !status && { borderBottomColor: colors.info }]}
                activeOpacity={0.78}
                onPress={() => openUsers()}
              >
                <AppText style={styles.compactStatLabel}>Total</AppText>
                <AppText style={styles.compactStatValue}>{summaryCounts.total}</AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.listHeaderRow}>
              <AppText style={styles.listHeaderTitle}>Field Users</AppText>
              <AppText style={styles.listHeaderMeta}>
                {filteredUsers.length} of {fieldUsers.length}
              </AppText>
            </View>
            {filteredUsers.length === 0 ? (
              <AppText style={styles.emptyText}>
                {loadingFieldUsers
                  ? 'Loading field users...'
                  : 'No field users found for this status.'}
              </AppText>
            ) : (
              filteredUsers.map((user) => {
                const meta = statusMeta[user.status];
                const activityColor = user.activityColor || meta.color;
                const activityLabel = user.activityName || meta.label;
                return (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userCard}
                    activeOpacity={0.82}
                    onPress={() => openTimeline(user)}
                  >
                    <View style={styles.userHeader}>
                      <View style={styles.userIdentity}>
                        <View style={styles.userAvatar}>
                          <AppText style={[styles.userAvatarText, { color: activityColor }]}>
                            {user.name
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((item) => item[0])
                              .join('')
                              .toUpperCase() || 'U'}
                          </AppText>
                        </View>
                        <View style={styles.userNameBlock}>
                          <AppText style={styles.userName}>{user.name}</AppText>
                          <AppText style={styles.userPosition}>({user.position})</AppText>
                        </View>
                      </View>
                      <View style={styles.iconActions}>
                        <TouchableOpacity style={styles.circleIcon} activeOpacity={0.78}>
                          <Ionicons name="logo-whatsapp" size={14} color={colors.info} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleIcon} activeOpacity={0.78}>
                          <Ionicons name="call" size={14} color={colors.info} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[styles.routeBadge, { borderColor: activityColor }]}>
                      <AppText style={[styles.routeBadgeText, { color: activityColor }]}>
                        {activityLabel}
                      </AppText>
                      <AppText style={styles.routeText}>{user.route}</AppText>
                    </View>
                    <AppText style={styles.locationText} numberOfLines={1}>
                      {user.location}
                    </AppText>
                    <View style={styles.userStats}>
                      <UserStat label="First Call" value={user.firstCall} styles={baseStyles} />
                      <UserStat label="First PC" value={user.firstPc} styles={baseStyles} />
                      <UserStat label="TC" value={user.tc} styles={baseStyles} />
                      <UserStat label="PC" value={user.pc} styles={baseStyles} />
                      <UserStat label="LPC" value={user.lpc} styles={baseStyles} />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {view === 'timeline' && selectedUser && (
          <>
            <View style={styles.timelineHeader}>
              <View style={styles.timelineTitleRow}>
                <View style={styles.userAvatar}>
                  <AppText style={styles.userAvatarText}>
                    {selectedUser.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((item) => item[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </AppText>
                </View>
                <View style={styles.timelineTitleText}>
                  <AppText style={styles.userName}>{selectedUser.name}</AppText>
                  <AppText style={styles.userPosition}>{selectedUser.position}</AppText>
                </View>
              </View>
              <View style={styles.refreshMetaRow}>
                <Ionicons name="time-outline" size={12} color={colors.textQuaternary} />
                <AppText style={styles.refreshed}>Last refreshed just now</AppText>
              </View>
            </View>
            <View style={styles.tabsRow}>
              {['TIMELINE', 'MTD', 'ROUTE'].map((tab, index) => (
                <View key={tab} style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
                  <AppText style={[styles.tabText, index === 0 && styles.tabTextActive]}>
                    {tab}
                  </AppText>
                </View>
              ))}
            </View>
            <AppText style={styles.dateTitle}>{formatSelectedDate(selectedDate)}</AppText>
            <View
              style={[styles.routeBadge, { borderColor: statusMeta[selectedUser.status].color }]}
            >
              <AppText
                style={[styles.routeBadgeText, { color: statusMeta[selectedUser.status].color }]}
              >
                {statusMeta[selectedUser.status].label}
              </AppText>
              <AppText style={styles.routeText}>{selectedUser.route}</AppText>
            </View>
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              <View style={styles.dayStart}>
                <View style={styles.timelineDot}>
                  <Ionicons
                    name="radio-button-on"
                    size={14}
                    color={statusMeta[selectedUser.status].color}
                  />
                </View>
                <View style={styles.dayStartText}>
                  <AppText style={styles.activityTitle}>DAY START</AppText>
                  <AppText style={styles.activityTime}>
                    {userId ? timelinesByUser[userId]?.dayStartTime || '--' : '--'}
                  </AppText>
                </View>
                <View style={styles.selfiePill}>
                  <MaterialCommunityIcons name="camera" size={13} color={colors.primary} />
                  <AppText style={styles.selfieText}>SELFIE</AppText>
                </View>
                {userId && timelinesByUser[userId]?.dayStartImageUrl ? (
                  <Image
                    source={{ uri: timelinesByUser[userId].dayStartImageUrl }}
                    style={styles.dayStartImage}
                  />
                ) : (
                  <View style={styles.dayStartImagePlaceholder}>
                    <MaterialCommunityIcons
                      name="camera-off"
                      size={16}
                      color={colors.textQuaternary}
                    />
                  </View>
                )}
              </View>
              {loadingTimeline && selectedUser.activities.length === 0 ? (
                <AppText style={styles.emptyText}>Loading timeline...</AppText>
              ) : selectedUser.activities.length === 0 ? (
                <AppText style={styles.emptyText}>No timeline data found for this date.</AppText>
              ) : (
                selectedUser.activities.map((activity) => (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.activityCard}
                    activeOpacity={activity.order ? 0.82 : 1}
                    onPress={() => openOrder(activity)}
                  >
                    <View style={styles.timelineDotSmall} />
                    <View style={styles.activityHeader}>
                      <View>
                        <AppText style={styles.activityTitle}>{activity.type}</AppText>
                        <AppText style={styles.activityTime}>{activity.time}</AppText>
                      </View>
                      <AppText style={styles.duration}>{activity.duration}</AppText>
                    </View>
                    <View style={styles.outletRow}>
                      <AppText style={styles.outletName} numberOfLines={1}>
                        {activity.outlet}
                      </AppText>
                      <AppText style={styles.ownerName} numberOfLines={1}>
                        {activity.owner}
                      </AppText>
                    </View>
                    <View style={styles.metricGrid}>
                      {activity.metrics.map((metric) => (
                        <View key={`${activity.id}-${metric.label}`} style={styles.metricCell}>
                          <AppText style={styles.metricValue}>{metric.value}</AppText>
                          <AppText style={styles.metricLabel} numberOfLines={2}>
                            {metric.label}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}

        {view === 'timeline' && !selectedUser && (
          <AppText style={styles.emptyText}>
            {loadingFieldUsers ? 'Loading field user...' : 'Field user not found.'}
          </AppText>
        )}

        {view === 'order' && !selectedActivity?.order && (
          <AppText style={styles.emptyText}>
            {loadingTimeline ? 'Loading order...' : 'Order details not found for this activity.'}
          </AppText>
        )}

        {view === 'order' && selectedActivity?.order && (
          <View style={styles.orderScreen}>
            <View style={styles.orderHero}>
              <View>
                <AppText style={styles.orderHeroText}>
                  Quantity(Cases)/ {selectedActivity.order.quantityCases}
                </AppText>
                <AppText style={styles.orderHeroText}>
                  Quantity(SuperUnit): {selectedActivity.order.quantitySuperUnit}
                </AppText>
                <AppText style={styles.orderHeroSub}>
                  LC : {selectedActivity.order.totalPieces}
                </AppText>
              </View>
              <View style={styles.orderHeroRight}>
                <AppText style={styles.orderHeroValue}>
                  ZMW {selectedActivity.order.netValue}
                </AppText>
                <AppText style={styles.orderHeroSub}>Net Value</AppText>
              </View>
            </View>

            <AppText style={styles.orderOutlet} numberOfLines={1}>
              {selectedActivity.order.outlet}
            </AppText>

            {selectedActivity.order.categories.map((category, index) => (
              <View key={category.id} style={styles.orderCategory}>
                <View
                  style={[
                    styles.orderCategoryHeader,
                    index % 2 === 0
                      ? styles.orderCategoryHeaderBlue
                      : styles.orderCategoryHeaderMuted,
                  ]}
                >
                  <View>
                    <AppText style={styles.orderCategoryName}>{category.name}</AppText>
                    <AppText style={styles.orderCategoryMeta}>{category.meta}</AppText>
                  </View>
                  <AppText style={styles.orderCategoryValue}>ZMW {category.value}</AppText>
                </View>

                {category.lines.map((line) => (
                  <View key={line.id} style={styles.orderLine}>
                    <AppText style={styles.orderLineName}>{line.name}</AppText>
                    <View style={styles.orderLineMeta}>
                      <AppText style={styles.orderLineMetaText}>PTR</AppText>
                      <AppText style={styles.orderLineMetaText}>{line.ptr}</AppText>
                      <AppText style={styles.orderLineMetaText}>x</AppText>
                      <AppText style={styles.orderLineMetaText}>{line.qty}</AppText>
                      <View style={styles.orderUnitPill}>
                        <AppText style={styles.orderUnitPillText}>{line.unit}</AppText>
                      </View>
                      <AppText style={styles.orderLineValue}>{line.value}</AppText>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.orderSummary}>
              <View style={styles.orderSummaryHeader}>
                <AppText style={styles.orderSummaryHeaderText}>Order Summary</AppText>
              </View>
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderSummaryLabel}>Total</AppText>
                <AppText style={styles.orderSummaryValue}>
                  ZMW {selectedActivity.order.netValue}
                </AppText>
              </View>
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderDiscountLabel}>Scheme Discount:</AppText>
                <AppText style={styles.orderDiscountValue}>
                  ZMW {selectedActivity.order.schemeDiscount}
                </AppText>
              </View>
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderDiscountLabel}>Cash Discount</AppText>
                <AppText style={styles.orderDiscountValue}>
                  ZMW {selectedActivity.order.cashDiscount}
                </AppText>
              </View>
              <View style={styles.orderDivider} />
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderSummaryLabel}>Net Amount</AppText>
                <AppText style={styles.orderSummaryValue}>
                  ZMW {selectedActivity.order.netValue}
                </AppText>
              </View>
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderSummaryLabel}>Tax</AppText>
                <AppText style={styles.orderSummaryValue}>ZMW {selectedActivity.order.tax}</AppText>
              </View>
              <View style={styles.orderDivider} />
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderPayableLabel}>Payable Amount</AppText>
                <AppText style={styles.orderPayableValue}>
                  ZMW {selectedActivity.order.payableAmount}
                </AppText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
