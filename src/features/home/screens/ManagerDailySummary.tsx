import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText, Skeleton } from '@/core/components';
import { toast } from '@/core/utils';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
import { homeService } from '../services/home.service';
import type {
  ManagerFieldUserSummary,
  ManagerStatsResponse,
  ManagerUserMtdSummaryResponse,
  ManagerUserRoutePlanResponse,
  ManagerUserTimelineResponse,
  TimelineLocation,
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

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));

const formatPercent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

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
  location?: TimelineLocation | null;
  checkInLocation?: TimelineLocation | null;
  checkOutLocation?: TimelineLocation | null;
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

const LIVE_LOCATION_REFRESH_MS = 5_000;

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
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);

const getStatusFromActivity = (activityName?: string | null): SummaryStatus => {
  const normalizedActivity = activityName?.trim().toLowerCase();

  if (normalizedActivity === 'retailing') return 'retailing';
  if (normalizedActivity === 'official work' || normalizedActivity === 'office work') {
    return 'official-work';
  }
  if (normalizedActivity === 'leave') return 'leave';
  if (normalizedActivity === 'absent' || normalizedActivity === 'offline') return 'absent';

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
  const isAbsent = status === 'absent';

  return {
    id: user.employeeId,
    name: user.employeeName || 'Unknown User',
    position: user.employeeId,
    status,
    activityName: isAbsent ? STATUS_LABELS.absent : user.activity?.name,
    activityColor: isAbsent ? undefined : user.activity?.color,
    location: isAbsent ? '--' : user.location || '--',
    route: isAbsent ? '--' : user.routeName || '--',
    firstCall: isAbsent ? '--' : formatApiTime(summary.firstCallTime),
    firstPc: isAbsent ? '--' : formatApiTime(summary.firstPcTime),
    tc: isAbsent ? '0' : `${summary.tc ?? 0}`,
    pc: isAbsent ? '0' : `${summary.pc ?? 0}`,
    lpc: isAbsent ? '0' : `${summary.lpc ?? 0}`,
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

const getNormalizedPhoneNumber = (phoneNumber?: string) =>
  phoneNumber?.replace(/[^\d+]/g, '').trim() || '';

const getSearchableText = (fieldUser: FieldUser) =>
  [
    fieldUser.name,
    fieldUser.position,
    fieldUser.phone,
    fieldUser.route,
    fieldUser.location,
    fieldUser.activityName,
    STATUS_LABELS[fieldUser.status],
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const canOpenUserDetails = (fieldUser?: Pick<FieldUser, 'status'>) =>
  fieldUser?.status === 'retailing' || fieldUser?.status === 'official-work';

function AttendanceRow({
  label,
  value,
  subLabel,
  color,
  badgeLabel,
  badgeBackgroundColor,
  styles,
  mutedColor,
  onPress,
}: {
  label: string;
  value: number;
  subLabel: string;
  color: string;
  badgeLabel: string;
  badgeBackgroundColor: string;
  styles: ReturnType<typeof createManagerDailySummaryStyles>;
  mutedColor: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.attendanceRow} activeOpacity={0.75} onPress={onPress}>
      <View style={[styles.attendanceAccent, { backgroundColor: color }]} />
      <AppText style={styles.attendanceValue}>{formatNumber(value)}</AppText>
      <View style={styles.attendanceTextBlock}>
        <AppText style={styles.attendanceLabel}>{label}</AppText>
        <AppText style={styles.attendanceSubLabel}>{subLabel}</AppText>
      </View>
      <View style={[styles.attendanceBadge, { backgroundColor: badgeBackgroundColor }]}>
        <AppText style={[styles.attendanceBadgeText, { color }]}>{badgeLabel}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={12} color={mutedColor} />
    </TouchableOpacity>
  );
}

function CallSummaryCard({
  label,
  value,
  styles,
}: {
  label: string;
  value: number;
  styles: ReturnType<typeof createManagerDailySummaryStyles>;
}) {
  return (
    <View style={styles.callSummaryCard}>
      <AppText style={styles.callSummaryValue}>{formatNumber(value)}</AppText>
      <AppText style={styles.callSummaryLabel}>{label}</AppText>
    </View>
  );
}

function DailySummarySkeleton({
  styles,
}: {
  styles: ReturnType<typeof createManagerDailySummaryStyles>;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.dailyHeaderMain}>
          <Skeleton width={36} height={36} borderRadius={8} />
          <View style={styles.dailyHeaderText}>
            <Skeleton width="55%" height={14} borderRadius={5} />
            <Skeleton width="38%" height={10} borderRadius={5} style={{ marginTop: 5 }} />
          </View>
        </View>
        <Skeleton width={104} height={30} borderRadius={8} />
      </View>

      <View style={styles.summaryKpiRow}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={48} width="23%" borderRadius={8} />
        ))}
      </View>

      <View style={styles.attendancePanel}>
        <View style={styles.attendanceHeader}>
          <Skeleton width="32%" height={14} borderRadius={5} />
          <Skeleton width="16%" height={10} borderRadius={5} />
        </View>
        <View style={styles.attendanceList}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={48} width="100%" borderRadius={8} />
          ))}
        </View>
        <Skeleton width="30%" height={14} borderRadius={5} style={{ marginTop: 12 }} />
        <View style={[styles.callSummaryGrid, { marginTop: 8 }]}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={52} width="31%" borderRadius={8} />
          ))}
        </View>
      </View>
    </View>
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
  const params = useLocalSearchParams<{
    status?: SummaryStatus;
    userId?: string;
    view?: DailyView;
    activityId?: string;
    date?: string;
  }>();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => parseRouteDate(getParam(params.date)));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [managerStats, setManagerStats] = useState<ManagerStatsResponse>(INITIAL_MANAGER_STATS);
  const [fieldUsers, setFieldUsers] = useState<FieldUser[]>([]);
  const [searchKey, setSearchKey] = useState('');
  const [debouncedSearchKey, setDebouncedSearchKey] = useState('');
  const [loadingFieldUsers, setLoadingFieldUsers] = useState(false);
  const [timelinesByUser, setTimelinesByUser] = useState<
    Record<string, ManagerUserTimelineResponse>
  >({});
  const [mtdSummaryByUser, setMtdSummaryByUser] = useState<
    Record<string, ManagerUserMtdSummaryResponse>
  >({});
  const [routePlanByUser, setRoutePlanByUser] = useState<
    Record<string, ManagerUserRoutePlanResponse>
  >({});
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingMtdSummary, setLoadingMtdSummary] = useState(false);
  const [loadingRoutePlan, setLoadingRoutePlan] = useState(false);
  const [activeTab, setActiveTab] = useState<TimelineTab>('timeline');
  const isFetchingManagerStatsRef = useRef(false);
  const isFetchingTimelineRef = useRef(false);

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
  const filteredUsers = useMemo(() => {
    const search = searchKey.trim().toLowerCase();

    return fieldUsers.filter((fieldUser) => {
      const matchesStatus = !status || fieldUser.status === status;
      const matchesSearch = !search || getSearchableText(fieldUser).includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [fieldUsers, searchKey, status]);
  const summaryCounts: Record<SummaryStatus | 'total', number> = {
    total: managerStats.userSummary.total,
    retailing: managerStats.userSummary.retailing,
    'official-work': managerStats.userSummary.officeWork,
    leave: managerStats.userSummary.leave,
    absent: managerStats.userSummary.absent,
  };

  const selectedMtdSummary = userId ? mtdSummaryByUser[userId] : undefined;
  const mtdStats: MTDStat[] = useMemo(
    () => [
      { label: 'UTC', value: formatNumber(selectedMtdSummary?.utc ?? 0) },
      { label: 'UPC', value: formatNumber(selectedMtdSummary?.upc ?? 0) },
      { label: 'Zero Order', value: formatNumber(selectedMtdSummary?.zeroOrder ?? 0) },
      { label: 'Not Visited', value: formatNumber(selectedMtdSummary?.notVisited ?? 0) },
      { label: 'Total', value: formatNumber(selectedMtdSummary?.total ?? 0) },
    ],
    [selectedMtdSummary],
  );

  const routeStops: RouteStop[] = useMemo(
    () => (userId ? (routePlanByUser[userId]?.stops ?? []) : []),
    [routePlanByUser, userId],
  );
  const routeFallbackStops: RouteStop[] = useMemo(() => {
    if (!selectedUser || selectedUser.status === 'absent' || selectedUser.route === '--') return [];
    if (routeStops.length > 0) return routeStops;

    return [
      {
        id: `${selectedUser.id}-today-route`,
        name: selectedUser.route,
        time: selectedRouteDate,
        status: 'pending',
        type: 'Route',
      },
    ];
  }, [routeStops, selectedRouteDate, selectedUser]);
  const selectedTimeline = userId ? timelinesByUser[userId] : undefined;
  const dayStartImageUrl = selectedTimeline?.dayStartImageUrl;

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
    if (isFetchingManagerStatsRef.current) return;

    isFetchingManagerStatsRef.current = true;

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
    } finally {
      isFetchingManagerStatsRef.current = false;
      setLoadingSummary(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoadingSummary(true);
      fetchManagerStats(selectedRouteDate);
    }, [fetchManagerStats, selectedRouteDate]),
  );

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

  const fetchUserTimeline = useCallback(
    async (employeeId: string, date?: string, silent = false) => {
      if (isFetchingTimelineRef.current) return;
      isFetchingTimelineRef.current = true;
      if (!silent) setLoadingTimeline(true);

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
        isFetchingTimelineRef.current = false;
        if (!silent) setLoadingTimeline(false);
      }
    },
    [],
  );

  const fetchUserMtdSummary = useCallback(async (employeeId: string, date?: string) => {
    setLoadingMtdSummary(true);

    try {
      const response = await homeService.getManagerUserMtdSummary({
        employeeId,
        date,
      });

      if ((response.success || response.statusCode === 200) && response.data) {
        setMtdSummaryByUser((prev) => ({
          ...prev,
          [employeeId]: response.data,
        }));
      }
    } catch (error) {
      console.warn('Failed to load manager user MTD summary', error);
    } finally {
      setLoadingMtdSummary(false);
    }
  }, []);

  const fetchUserRoutePlan = useCallback(async (employeeId: string, date?: string) => {
    setLoadingRoutePlan(true);

    try {
      const response = await homeService.getManagerUserRoutePlan({
        employeeId,
        date,
      });

      if ((response.success || response.statusCode === 200) && response.data) {
        setRoutePlanByUser((prev) => ({
          ...prev,
          [employeeId]: response.data,
        }));
      }
    } catch (error) {
      console.warn('Failed to load manager user route plan', error);
    } finally {
      setLoadingRoutePlan(false);
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
      userId && (view === 'timeline' || view === 'order')
        ? fetchUserMtdSummary(userId, selectedRouteDate)
        : Promise.resolve(),
      userId && (view === 'timeline' || view === 'order')
        ? fetchUserRoutePlan(userId, selectedRouteDate)
        : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

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
      fetchUserMtdSummary(userId, selectedRouteDate);
      fetchUserRoutePlan(userId, selectedRouteDate);
    }
  }, [fetchUserMtdSummary, fetchUserRoutePlan, fetchUserTimeline, selectedRouteDate, userId, view]);

  useFocusEffect(
    useCallback(() => {
      const isViewingLiveUser = userId && (view === 'timeline' || view === 'order');
      const isToday = selectedRouteDate === formatLocalApiDate(new Date());
      if (!isViewingLiveUser || !isToday) return undefined;

      const timer = setInterval(() => {
        void fetchUserTimeline(userId, selectedRouteDate, true);
      }, LIVE_LOCATION_REFRESH_MS);

      return () => clearInterval(timer);
    }, [fetchUserTimeline, selectedRouteDate, userId, view]),
  );

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
  const attendanceRows = [
    {
      key: 'total',
      label: 'All users',
      value: summaryCounts.total,
      subLabel: '100%',
      color: colors.primary,
      badgeLabel: 'Total',
      badgeBackgroundColor: `${colors.primary}15`,
      onPress: () => openUsers(),
    },
    {
      key: 'retailing',
      label: STATUS_LABELS.retailing,
      value: summaryCounts.retailing,
      subLabel: `${formatPercent(summaryCounts.retailing, summaryCounts.total)}% of total`,
      color: statusMeta.retailing.color,
      badgeLabel: 'Active',
      badgeBackgroundColor: colors.successLight,
      onPress: () => openUsers('retailing'),
    },
    {
      key: 'official-work',
      label: STATUS_LABELS['official-work'],
      value: summaryCounts['official-work'],
      subLabel: `${formatPercent(summaryCounts['official-work'], summaryCounts.total)}% of total`,
      color: statusMeta['official-work'].color,
      badgeLabel: 'Office',
      badgeBackgroundColor: colors.infoLight,
      onPress: () => openUsers('official-work'),
    },
    {
      key: 'leave',
      label: 'On leave',
      value: summaryCounts.leave,
      subLabel: `${formatPercent(summaryCounts.leave, summaryCounts.total)}% of total`,
      color: statusMeta.leave.color,
      badgeLabel: 'Leave',
      badgeBackgroundColor: colors.warningLight,
      onPress: () => openUsers('leave'),
    },
    {
      key: 'absent',
      label: STATUS_LABELS.absent,
      value: summaryCounts.absent,
      subLabel: `${formatPercent(summaryCounts.absent, summaryCounts.total)}% of total`,
      color: statusMeta.absent.color,
      badgeLabel: 'Absent',
      badgeBackgroundColor: colors.errorLight,
      onPress: () => openUsers('absent'),
    },
  ];

  const openTimeline = (nextUser: FieldUser) => {
    if (!canOpenUserDetails(nextUser)) {
      toast.info(`Timeline is not available for ${STATUS_LABELS[nextUser.status]} users.`);
      return;
    }

    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/[userId]',
      params: { userId: nextUser.id, date: selectedRouteDate },
    });
  };

  const openOrder = (nextActivity: TimelineActivity) => {
    if (!nextActivity.order || !selectedUser || !canOpenUserDetails(selectedUser)) return;

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

  const handleWhatsApp = async (phoneNumber: string) => {
    const phone = getNormalizedPhoneNumber(phoneNumber);

    if (!phone) {
      toast.error('Phone number not available');
      return;
    }

    const whatsappUrl = `whatsapp://send?phone=${encodeURIComponent(phone)}`;
    const browserUrl = `https://wa.me/${phone.replace(/^\+/, '')}`;

    try {
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
      await Linking.openURL(canOpenWhatsApp ? whatsappUrl : browserUrl);
    } catch (error) {
      console.warn('Failed to open WhatsApp', error);
      Alert.alert('Error', 'Unable to open WhatsApp for this number.');
    }
  };

  const handleCall = async (phoneNumber: string) => {
    const phone = getNormalizedPhoneNumber(phoneNumber);

    if (!phone) {
      toast.error('Phone number not available');
      return;
    }

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      console.warn('Failed to open dialer', error);
      Alert.alert('Error', 'Unable to start a phone call.');
    }
  };

  const openDayStartSelfie = async () => {
    if (!dayStartImageUrl) {
      toast.info('Day start selfie not available');
      return;
    }

    try {
      await Linking.openURL(dayStartImageUrl);
    } catch (error) {
      console.warn('Failed to open day start selfie', error);
      Alert.alert('Error', 'Unable to open day start selfie.');
    }
  };

  const hasLocation = (location?: TimelineLocation | null) =>
    Number.isFinite(Number(location?.latitude)) && Number.isFinite(Number(location?.longitude));

  const formatLocationTime = (location?: TimelineLocation | null) => {
    if (!location?.capturedAt) return '';
    const locationDate = new Date(location.capturedAt);
    if (Number.isNaN(locationDate.getTime())) return '';

    return locationDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const openLocationNavigation = async (location?: TimelineLocation | null, label = 'Location') => {
    if (!hasLocation(location)) {
      toast.info(`${label} not available`);
      return;
    }

    const latitude = Number(location?.latitude);
    const longitude = Number(location?.longitude);
    const encodedLabel = encodeURIComponent(label);
    const nativeUrl = Platform.select({
      ios: `maps://?daddr=${latitude},${longitude}&q=${encodedLabel}`,
      android: `google.navigation:q=${latitude},${longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    });
    const fallbackUrl = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${encodedLabel}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
      web: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    try {
      await Linking.openURL(nativeUrl || fallbackUrl || '');
    } catch (error) {
      try {
        await Linking.openURL(fallbackUrl || '');
      } catch (fallbackError) {
        console.warn('Failed to open map navigation', fallbackError);
        Alert.alert('Error', 'Unable to open map navigation.');
      }
    }
  };

  const renderLocationAction = (
    label: string,
    location?: TimelineLocation | null,
    buttonText = 'Navigate',
    showUnavailable = true,
  ) => {
    const available = hasLocation(location);
    if (!available && !showUnavailable) return null;

    return (
      <TouchableOpacity
        style={[styles.locationAction, !available && styles.locationActionDisabled]}
        activeOpacity={available ? 0.75 : 1}
        disabled={!available}
        onPress={(event) => {
          event.stopPropagation?.();
          openLocationNavigation(location, label);
        }}
      >
        <Ionicons
          name={available ? 'navigate-outline' : 'location-outline'}
          size={12}
          color={available ? colors.info : colors.textTertiary}
        />
        <AppText
          style={[styles.locationActionText, !available && styles.locationActionTextDisabled]}
        >
          {available ? buttonText : 'No GPS'}
        </AppText>
      </TouchableOpacity>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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
        {/* Summary Card - Only on summary screen */}
        {view === 'summary' &&
          (loadingSummary ? (
            <DailySummarySkeleton styles={styles} />
          ) : (
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <View style={styles.dailyHeaderMain}>
                  <View style={styles.dailyIcon}>
                    <Ionicons name="analytics-outline" size={19} color={colors.primary} />
                  </View>
                  <View style={styles.dailyHeaderText}>
                    <AppText style={styles.dailyTitle}>Daily overview</AppText>
                    <AppText style={styles.sectionTitle}>Team performance</AppText>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.dateButton}
                  activeOpacity={0.7}
                  onPress={openDatePicker}
                >
                  <Ionicons name="calendar-clear-outline" size={12} color={colors.primary} />
                  <AppText style={styles.dateButtonText}>
                    {formatSelectedDate(selectedDate)}
                  </AppText>
                  <Ionicons name="chevron-down" size={10} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.summaryKpiRow}>
                <View style={styles.summaryKpiCard}>
                  <AppText style={styles.summaryKpiValue}>
                    {formatNumber(managerStats.callSummary.tc)}
                  </AppText>
                  <AppText style={styles.summaryKpiLabel}>TC</AppText>
                </View>
                <View style={styles.summaryKpiCard}>
                  <AppText style={styles.summaryKpiValue}>
                    {formatNumber(managerStats.callSummary.pc)}
                  </AppText>
                  <AppText style={styles.summaryKpiLabel}>PC</AppText>
                </View>
                <View style={styles.summaryKpiCard}>
                  <AppText style={styles.summaryKpiValue}>
                    {formatNumber(managerStats.callSummary.sc)}
                  </AppText>
                  <AppText style={styles.summaryKpiLabel}>SC</AppText>
                </View>
                <View style={styles.summaryKpiCard}>
                  <AppText style={styles.summaryKpiValue}>
                    {formatNumber(managerStats.callSummary.productivity)}%
                  </AppText>
                  <AppText style={styles.summaryKpiLabel}>Productivity</AppText>
                </View>
              </View>

              <View style={styles.attendancePanel}>
                <View style={styles.attendanceHeader}>
                  <AppText style={styles.attendanceTitle}>Attendance</AppText>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => openUsers()}>
                    <AppText style={styles.viewAllText}>View all</AppText>
                  </TouchableOpacity>
                </View>
                <View style={styles.attendanceList}>
                  {attendanceRows.map((item) => (
                    <AttendanceRow
                      key={item.key}
                      label={item.label}
                      value={item.value}
                      subLabel={item.subLabel}
                      color={item.color}
                      badgeLabel={item.badgeLabel}
                      badgeBackgroundColor={item.badgeBackgroundColor}
                      mutedColor={colors.textQuaternary}
                      styles={styles}
                      onPress={item.onPress}
                    />
                  ))}
                </View>
                <AppText style={styles.callSummaryTitle}>Call summary</AppText>
                <View style={styles.callSummaryGrid}>
                  <CallSummaryCard
                    label="Cases"
                    value={managerStats.callSummary.qtyCases ?? 0}
                    styles={styles}
                  />
                  <CallSummaryCard
                    label="Value"
                    value={managerStats.callSummary.qtyValue ?? managerStats.callSummary.sc}
                    styles={styles}
                  />
                  <CallSummaryCard
                    label="Tonnage"
                    value={managerStats.callSummary.qtyTonnage ?? 0}
                    styles={styles}
                  />
                </View>
              </View>
            </View>
          ))}

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

            {loadingFieldUsers && filteredUsers.length === 0 ? (
              <View style={{ gap: 10 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} height={88} width="100%" borderRadius={14} />
                ))}
              </View>
            ) : filteredUsers.length === 0 ? (
              <AppText style={styles.emptyText}>No field users found for this status.</AppText>
            ) : (
              filteredUsers.map((user) => {
                const meta = statusMeta[user.status];
                const activityColor = user.activityColor || meta.color;
                const activityLabel = user.activityName || meta.label;
                const userDetailsEnabled = canOpenUserDetails(user);
                return (
                  <TouchableOpacity
                    key={user.id}
                    style={[styles.userCard, !userDetailsEnabled && styles.userCardDisabled]}
                    activeOpacity={userDetailsEnabled ? 0.7 : 1}
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
                          onPress={(event) => {
                            event.stopPropagation();
                            handleWhatsApp(user.phone);
                          }}
                        >
                          <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.callButton}
                          activeOpacity={0.7}
                          onPress={(event) => {
                            event.stopPropagation();
                            handleCall(user.phone);
                          }}
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
                    {!userDetailsEnabled && (
                      <AppText style={styles.userUnavailableText}>
                        Timeline not available for {meta.label}
                      </AppText>
                    )}

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
        {view === 'timeline' && selectedUser && canOpenUserDetails(selectedUser) && (
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
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusMeta[selectedUser.status].color + '15' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusMeta[selectedUser.status].color },
                  ]}
                />
                <AppText
                  style={[styles.statusText, { color: statusMeta[selectedUser.status].color }]}
                >
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
              <View style={styles.routeInfoRow}>
                <Ionicons name="navigate-circle-outline" size={12} color={colors.textTertiary} />
                <AppText style={styles.routeInfoText} numberOfLines={1}>
                  Current location
                  {formatLocationTime(selectedTimeline?.currentLocation)
                    ? ` • ${formatLocationTime(selectedTimeline?.currentLocation)}`
                    : ''}
                </AppText>
                {renderLocationAction('Current location', selectedTimeline?.currentLocation)}
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
                          {selectedTimeline?.dayStartTime || '--'}
                        </AppText>
                      </View>
                      <View style={styles.selfieContainer}>
                        {renderLocationAction(
                          'Day start location',
                          selectedTimeline?.dayStartLocation,
                        )}
                        {dayStartImageUrl ? (
                          <TouchableOpacity activeOpacity={0.8} onPress={openDayStartSelfie}>
                            <Image
                              source={{ uri: dayStartImageUrl }}
                              style={styles.dayStartImage}
                            />
                          </TouchableOpacity>
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
                  <View style={{ gap: 12 }}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} height={92} width="100%" borderRadius={14} />
                    ))}
                  </View>
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
                        {(hasLocation(activity.checkInLocation) ||
                          hasLocation(activity.checkOutLocation) ||
                          hasLocation(activity.location)) && (
                          <View style={styles.activityLocationRow}>
                            <View style={styles.activityLocationTextWrap}>
                              <Ionicons
                                name="location-outline"
                                size={12}
                                color={colors.textTertiary}
                              />
                              <AppText style={styles.activityLocationText} numberOfLines={1}>
                                Visit location
                              </AppText>
                            </View>
                            {renderLocationAction(
                              'Visit check-in location',
                              activity.checkInLocation || activity.location,
                              'Check-in',
                              false,
                            )}
                            {renderLocationAction(
                              'Visit check-out location',
                              activity.checkOutLocation,
                              'Check-out',
                              false,
                            )}
                          </View>
                        )}
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
                {(selectedTimeline?.dayEndTime ||
                  hasLocation(selectedTimeline?.dayEndLocation)) && (
                  <View style={styles.dayStartContainer}>
                    <View style={styles.timelineDot}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    </View>
                    <View style={styles.dayStartCard}>
                      <View style={styles.dayStartContent}>
                        <View style={styles.dayStartInfo}>
                          <AppText style={styles.dayStartTitle}>DAY END</AppText>
                          <AppText style={styles.dayStartTime}>
                            {selectedTimeline?.dayEndTime || '--'}
                          </AppText>
                          {renderLocationAction(
                            'Day end location',
                            selectedTimeline?.dayEndLocation,
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* MTD Tab Content */}
            {activeTab === 'mtd' && (
              <View style={styles.mtdContainer}>
                <View style={styles.mtdHeader}>
                  <AppText style={styles.mtdHeaderTitle}>Month-to-Date Performance</AppText>
                  <AppText style={styles.mtdHeaderSubtitle}>
                    {new Date().toLocaleString('default', { month: 'long' })}{' '}
                    {new Date().getFullYear()}
                  </AppText>
                </View>
                <View style={styles.mtdGrid}>
                  {mtdStats.map((stat) => (
                    <View key={stat.label} style={styles.mtdCard}>
                      <AppText style={styles.mtdCardLabel}>{stat.label}</AppText>
                      <AppText style={styles.mtdCardValue}>{stat.value}</AppText>
                    </View>
                  ))}
                </View>
                {loadingMtdSummary && (
                  <View style={{ gap: 10 }}>
                    <Skeleton height={86} width="100%" borderRadius={14} />
                    <Skeleton height={86} width="100%" borderRadius={14} />
                  </View>
                )}
              </View>
            )}

            {/* Route Tab Content */}
            {activeTab === 'route' && (
              <View style={styles.routeContainer}>
                <View style={styles.routeHeader}>
                  <View style={styles.routeHeaderLeft}>
                    <MaterialCommunityIcons
                      name="map-marker-path"
                      size={18}
                      color={colors.primary}
                    />
                    <AppText style={styles.routeHeaderTitle}>Today's Route Plan</AppText>
                  </View>
                  <View style={styles.routeProgress}>
                    <AppText style={styles.routeProgressText}>
                      {routeStops.filter((stop) => stop.status === 'completed').length}/
                      {routeFallbackStops.length} Completed
                    </AppText>
                  </View>
                </View>

                <View style={styles.routeTimeline}>
                  {loadingRoutePlan ? (
                    <View style={{ gap: 10 }}>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} height={72} width="100%" borderRadius={12} />
                      ))}
                    </View>
                  ) : routeFallbackStops.length === 0 ? (
                    <AppText style={styles.emptyText}>No route plan found for this date.</AppText>
                  ) : (
                    routeFallbackStops.map((stop, index) => (
                      <View key={stop.id} style={styles.routeStopItem}>
                        <View style={styles.routeStopLine}>
                          {index === 0 && <View style={styles.routeLineTop} />}
                          {getStatusIcon(stop.status)}
                          {index < routeFallbackStops.length - 1 && (
                            <View style={styles.routeLineBottom} />
                          )}
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
                            <AppText
                              style={[
                                styles.routeStopStatusText,
                                {
                                  color:
                                    stop.status === 'completed'
                                      ? colors.success
                                      : stop.status === 'pending'
                                        ? colors.warning
                                        : colors.error,
                                },
                              ]}
                            >
                              {stop.status.toUpperCase()}
                            </AppText>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {view === 'timeline' && selectedUser && !canOpenUserDetails(selectedUser) && (
          <AppText style={styles.emptyText}>
            Timeline is not available for {statusMeta[selectedUser.status].label} users.
          </AppText>
        )}

        {view === 'timeline' && !selectedUser && (
          <AppText style={styles.emptyText}>
            {loadingFieldUsers ? 'Loading field user...' : 'Field user not found.'}
          </AppText>
        )}

        {view === 'order' && selectedUser && !canOpenUserDetails(selectedUser) && (
          <AppText style={styles.emptyText}>
            Order details are not available for {statusMeta[selectedUser.status].label} users.
          </AppText>
        )}

        {view === 'order' &&
          (!selectedUser || canOpenUserDetails(selectedUser)) &&
          !selectedActivity?.order && (
            <AppText style={styles.emptyText}>
              {loadingTimeline ? 'Loading order...' : 'Order details not found for this activity.'}
            </AppText>
          )}

        {view === 'order' &&
          selectedUser &&
          canOpenUserDetails(selectedUser) &&
          selectedActivity?.order && (
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
                  <AppText style={styles.orderSummaryValue}>
                    ZMW {selectedActivity.order.tax}
                  </AppText>
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
