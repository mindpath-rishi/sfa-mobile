import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
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
type TimelineTab = 'timeline' | 'mtd' | 'route';

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

type MTDStat = {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
};

type RouteStop = {
  id: string;
  name: string;
  time: string;
  status: 'completed' | 'pending' | 'missed';
  type: string;
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

const formatSelectedDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
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

  return `${displayHours}:${minutes} ${period}`;
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
    <TouchableOpacity style={styles.summaryMetric} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.summaryMetricTop}>
        <View style={[styles.summaryMarker, { backgroundColor: color }]} />
        <Ionicons name="chevron-forward" size={10} color={mutedColor} />
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
      <AppText style={styles.userStatValue}>{value || '--'}</AppText>
      <AppText style={styles.userStatLabel}>{label}</AppText>
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
  const [activeTab, setActiveTab] = useState<TimelineTab>('timeline');

  const status = getParam(params.status) as SummaryStatus | undefined;
  const userId = getParam(params.userId);
  const activityId = getParam(params.activityId);
  const selectedRouteDate = formatLocalApiDate(selectedDate);
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

  // Mock MTD data
  const mtdStats: MTDStat[] = useMemo(() => [
    { label: 'Total Calls', value: '1,247', change: '+12%', isPositive: true },
    { label: 'Orders', value: '342', change: '+8%', isPositive: true },
    { label: 'Revenue', value: 'ZMW 45,231', change: '+15%', isPositive: true },
    { label: 'Cases Sold', value: '2,431', change: '-3%', isPositive: false },
    { label: 'Coverage', value: '87%', change: '+5%', isPositive: true },
    { label: 'Productivity', value: '92%', change: '+2%', isPositive: true },
  ], []);

  // Mock Route stops data
  const routeStops: RouteStop[] = useMemo(() => [
    { id: '1', name: 'George Supermarket', time: '08:30 AM', status: 'completed', type: 'Outlet' },
    { id: '2', name: 'Linda Store', time: '10:00 AM', status: 'completed', type: 'Outlet' },
    { id: '3', name: 'Peter Mart', time: '11:30 AM', status: 'completed', type: 'Outlet' },
    { id: '4', name: 'City Mall', time: '01:00 PM', status: 'pending', type: 'Outlet' },
    { id: '5', name: 'Downtown Shop', time: '02:30 PM', status: 'pending', type: 'Outlet' },
    { id: '6', name: 'Main Street Store', time: '04:00 PM', status: 'pending', type: 'Outlet' },
  ], []);

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

  const userInitials = (user?.name || 'Manager')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();

  const handleWhatsApp = (phoneNumber: string) => {
    console.log('WhatsApp to:', phoneNumber);
  };

  const handleCall = (phoneNumber: string) => {
    console.log('Call to:', phoneNumber);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={16} color={colors.success} />;
      case 'pending':
        return <Ionicons name="time-outline" size={16} color={colors.warning} />;
      case 'missed':
        return <Ionicons name="close-circle" size={16} color={colors.error} />;
      default:
        return null;
    }
  };

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
        {/* Date selection - Only show on summary screen */}
        {view === 'summary' && (
          <TouchableOpacity style={styles.dailyHeader} activeOpacity={0.7} onPress={openDatePicker}>
            <View style={styles.dailyHeaderMain}>
              <View style={styles.dailyIcon}>
                <Ionicons name="calendar-clear-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.dailyHeaderText}>
                <AppText style={styles.sectionTitle}>DAILY SUMMARY</AppText>
                <AppText style={styles.dailyTitle}>{formatSelectedDate(selectedDate)}</AppText>
              </View>
            </View>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Summary Card - Only on summary screen */}
        {view === 'summary' && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View style={styles.managerInfo}>
                <View style={styles.managerAvatar}>
                  <AppText style={styles.managerAvatarText}>{userInitials || 'M'}</AppText>
                </View>
                <View style={styles.managerTextBlock}>
                  <AppText style={styles.sectionTitle}>REPORTING TO YOU</AppText>
                  <AppText style={styles.cardTitle}>{user?.name || 'Manager'}</AppText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.linkButton}
                activeOpacity={0.7}
                onPress={() => openUsers()}
              >
                <AppText style={styles.linkText}>All Users</AppText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.metricToggle}>
              {METRIC_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.7}
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
                label="Total"
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
                label="Office Work"
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

        {/* Users Screen */}
        {view === 'users' && (
          <>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={14} color={colors.textTertiary} />
              <TextInput
                value={searchKey}
                onChangeText={setSearchKey}
                placeholder="Search users..."
                placeholderTextColor={colors.textTertiary}
                style={styles.searchInput}
              />
              {searchKey ? (
                <TouchableOpacity activeOpacity={0.7} onPress={() => setSearchKey('')}>
                  <Ionicons name="close-circle" size={14} color={colors.textTertiary} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="filter" size={14} color={colors.info} />
              )}
            </View>
            
            <View style={styles.listHeaderRow}>
              <AppText style={styles.listHeaderTitle}>Field Users</AppText>
              <AppText style={styles.listHeaderMeta}>
                {filteredUsers.length}/{fieldUsers.length}
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
                    activeOpacity={0.7}
                    onPress={() => openTimeline(user)}
                  >
                    <View style={styles.userHeader}>
                      <View style={styles.userIdentity}>
                        <View style={styles.userAvatar}>
                          <AppText style={[styles.userAvatarText]}>
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
                          <AppText style={styles.userPosition}>{user.position}</AppText>
                        </View>
                      </View>
                      <View style={styles.iconActions}>
                        <TouchableOpacity 
                          style={styles.whatsappButton} 
                          activeOpacity={0.7}
                          onPress={() => handleWhatsApp(user.phone)}
                        >
                          <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.callButton} 
                          activeOpacity={0.7}
                          onPress={() => handleCall(user.phone)}
                        >
                          <Ionicons name="call" size={14} color={colors.primary} />
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
                      <UserStat label="FC" value={user.firstCall} styles={baseStyles} />
                      <UserStat label="FPC" value={user.firstPc} styles={baseStyles} />
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

        {/* Timeline Screen */}
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
            </View>
            
            <View style={styles.tabsRow}>
              {(['timeline', 'mtd', 'route'] as TimelineTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <AppText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.toUpperCase()}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.routeInfoCard}>
              <View style={[styles.statusBadge, { backgroundColor: statusMeta[selectedUser.status].color + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusMeta[selectedUser.status].color }]} />
                <AppText style={[styles.statusText, { color: statusMeta[selectedUser.status].color }]}>
                  {statusMeta[selectedUser.status].label}
                </AppText>
              </View>
              <View style={styles.routeInfoRow}>
                <Ionicons name="map-outline" size={12} color={colors.textTertiary} />
                <AppText style={styles.routeInfoText}>{selectedUser.route}</AppText>
              </View>
              <View style={styles.routeInfoRow}>
                <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                <AppText style={styles.routeInfoText} numberOfLines={1}>
                  {selectedUser.location}
                </AppText>
              </View>
            </View>
            
            <View style={styles.userStatsSummary}>
              <View style={styles.userStatItem}>
                <AppText style={styles.userStatItemValue}>{selectedUser.firstCall || '--'}</AppText>
                <AppText style={styles.userStatItemLabel}>First Call</AppText>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <AppText style={styles.userStatItemValue}>{selectedUser.firstPc || '--'}</AppText>
                <AppText style={styles.userStatItemLabel}>First PC</AppText>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <AppText style={styles.userStatItemValue}>{selectedUser.tc || '0'}</AppText>
                <AppText style={styles.userStatItemLabel}>TC</AppText>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <AppText style={styles.userStatItemValue}>{selectedUser.pc || '0'}</AppText>
                <AppText style={styles.userStatItemLabel}>PC</AppText>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <AppText style={styles.userStatItemValue}>{selectedUser.lpc || '0'}</AppText>
                <AppText style={styles.userStatItemLabel}>LPC</AppText>
              </View>
            </View>

            {/* Timeline Tab Content */}
            {activeTab === 'timeline' && (
              <View style={styles.timeline}>
                <View style={styles.timelineLine} />
                
                <View style={styles.dayStartContainer}>
                  <View style={styles.timelineDot}>
                    <Ionicons
                      name="radio-button-on"
                      size={14}
                      color={statusMeta[selectedUser.status].color}
                    />
                  </View>
                  <View style={styles.dayStartCard}>
                    <View style={styles.dayStartContent}>
                      <View style={styles.dayStartInfo}>
                        <AppText style={styles.dayStartTitle}>DAY START</AppText>
                        <AppText style={styles.dayStartTime}>
                          {userId ? timelinesByUser[userId]?.dayStartTime || '--' : '--'}
                        </AppText>
                      </View>
                      <View style={styles.selfieContainer}>
                        <TouchableOpacity style={styles.selfieButton} activeOpacity={0.7}>
                          <MaterialCommunityIcons name="camera" size={14} color={colors.primaryContrast} />
                          <AppText style={styles.selfieButtonText}>SELFIE</AppText>
                        </TouchableOpacity>
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
                              color={colors.textTertiary}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
                
                {loadingTimeline && selectedUser.activities.length === 0 ? (
                  <AppText style={styles.emptyText}>Loading timeline...</AppText>
                ) : selectedUser.activities.length === 0 ? (
                  <AppText style={styles.emptyText}>No timeline data found for this date.</AppText>
                ) : (
                  selectedUser.activities.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      style={styles.activityCardWrapper}
                      activeOpacity={activity.order ? 0.7 : 1}
                      onPress={() => openOrder(activity)}
                    >
                      <View style={styles.timelineDotSmall} />
                      <View style={styles.activityCard}>
                        <View style={styles.activityHeader}>
                          <View style={styles.activityHeaderLeft}>
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
                              <AppText style={styles.metricLabel}>{metric.label}</AppText>
                            </View>
                          ))}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            {/* MTD Tab Content */}
            {activeTab === 'mtd' && (
              <View style={styles.mtdContainer}>
                <View style={styles.mtdHeader}>
                  <AppText style={styles.mtdHeaderTitle}>Month-to-Date Performance</AppText>
                  <AppText style={styles.mtdHeaderSubtitle}>
                    {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
                  </AppText>
                </View>
                <View style={styles.mtdGrid}>
                  {mtdStats.map((stat, index) => (
                    <View key={index} style={styles.mtdCard}>
                      <AppText style={styles.mtdCardLabel}>{stat.label}</AppText>
                      <AppText style={styles.mtdCardValue}>{stat.value}</AppText>
                      {stat.change && (
                        <View style={styles.mtdChangeContainer}>
                          <Ionicons 
                            name={stat.isPositive ? 'trending-up' : 'trending-down'} 
                            size={10} 
                            color={stat.isPositive ? colors.success : colors.error} 
                          />
                          <AppText style={[styles.mtdChange, { color: stat.isPositive ? colors.success : colors.error }]}>
                            {stat.change}
                          </AppText>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Route Tab Content */}
            {activeTab === 'route' && (
              <View style={styles.routeContainer}>
                <View style={styles.routeHeader}>
                  <View style={styles.routeHeaderLeft}>
                    <MaterialCommunityIcons name="map-marker-path" size={18} color={colors.primary} />
                    <AppText style={styles.routeHeaderTitle}>Today's Route Plan</AppText>
                  </View>
                  <View style={styles.routeProgress}>
                    <AppText style={styles.routeProgressText}>
                      {routeStops.filter(s => s.status === 'completed').length}/{routeStops.length} Completed
                    </AppText>
                  </View>
                </View>
                
                <View style={styles.routeTimeline}>
                  {routeStops.map((stop, index) => (
                    <View key={stop.id} style={styles.routeStopItem}>
                      <View style={styles.routeStopLine}>
                        {index === 0 && <View style={styles.routeLineTop} />}
                        {getStatusIcon(stop.status)}
                        {index < routeStops.length - 1 && <View style={styles.routeLineBottom} />}
                      </View>
                      <View style={styles.routeStopContent}>
                        <View style={styles.routeStopHeader}>
                          <AppText style={styles.routeStopName}>{stop.name}</AppText>
                          <AppText style={styles.routeStopType}>{stop.type}</AppText>
                        </View>
                        <View style={styles.routeStopTime}>
                          <Ionicons name="time-outline" size={10} color={colors.textTertiary} />
                          <AppText style={styles.routeStopTimeText}>{stop.time}</AppText>
                        </View>
                        <View style={styles.routeStopStatus}>
                          <AppText style={[styles.routeStopStatusText, {
                            color: stop.status === 'completed' ? colors.success : 
                                   stop.status === 'pending' ? colors.warning : colors.error
                          }]}>
                            {stop.status.toUpperCase()}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
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
                  Cases: {selectedActivity.order.quantityCases}
                </AppText>
                <AppText style={styles.orderHeroText}>
                  SuperUnit: {selectedActivity.order.quantitySuperUnit}
                </AppText>
                <AppText style={styles.orderHeroSub}>
                  Pieces: {selectedActivity.order.totalPieces}
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
                      <AppText style={styles.orderLineMetaText}>PTR {line.ptr}</AppText>
                      <AppText style={styles.orderLineMetaText}>×{line.qty}</AppText>
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
