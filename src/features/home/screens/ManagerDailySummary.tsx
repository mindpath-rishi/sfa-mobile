import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type { ManagerFieldUserSummary, ManagerStatsResponse } from '../services/home.service';
import { ManagerDatePickerModal } from '../components/models/ManagerDatePickerModal';

type SummaryStatus = 'retailing' | 'official-work' | 'leave' | 'absent';
type DailyView = 'summary' | 'users' | 'timeline' | 'order';

type UserMetric = {
  label: string;
  value: string;
};

type TimelineActivity = {
  id: string;
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

const STATUS_META: Record<SummaryStatus, { label: string; color: string; softColor: string }> = {
  retailing: { label: 'Retailing', color: '#16A34A', softColor: '#DCFCE7' },
  'official-work': { label: 'Official Work', color: '#2563EB', softColor: '#DBEAFE' },
  leave: { label: 'Leave', color: '#F59E0B', softColor: '#FEF3C7' },
  absent: { label: 'Absent', color: '#DC2626', softColor: '#FEE2E2' },
};

const FIELD_USERS: FieldUser[] = [
  {
    id: 'manpisi',
    name: 'Manpisi',
    position: 'CAF-9489',
    status: 'retailing',
    location: 'Helen kaunda library, Luanshya, Copperbelt P.',
    route: 'MIKOMFWA',
    firstCall: '07:47 AM',
    firstPc: '07:47 AM',
    tc: '20',
    pc: '15',
    lpc: '1.5',
    phone: '+260 96 221 4531',
    activities: [
      {
        id: 'activity-1',
        type: 'VANSALES ACTIVITY',
        time: '07:47 AM',
        duration: '1 mins',
        outlet: '5663-Gifted Shop',
        owner: 'Me Emmanuel',
        order: {
          orderNo: 'ORD-5663-001',
          outlet: '5663-Gifted Shop',
          quantityCases: '4.00',
          quantitySuperUnit: '6.34',
          totalPieces: '64',
          netValue: '1,719.00',
          schemeDiscount: '0.00',
          cashDiscount: '0.00',
          tax: '0.00',
          payableAmount: '1,719.00',
          categories: [
            {
              id: 'laundry',
              name: 'Laundry',
              meta: '4Box 0Pcs',
              value: '1,719.00',
              lines: [],
            },
            {
              id: 'powder',
              name: 'Powder',
              meta: '2Box 0Pcs',
              value: '1,015.00',
              lines: [
                {
                  id: 'powder-1',
                  name: 'JB615-BANJA WASHING POWDER SACKS 6 X 1.5 KG_38892',
                  ptr: 'ZMW 61.33',
                  qty: '1',
                  unit: '1Cases 0Pcs',
                  value: 'ZMW 568.00',
                },
                {
                  id: 'powder-2',
                  name: 'ABL-ALOHA S.RAIN POWDER BUCKET 6X1.5 KG_26032',
                  ptr: 'ZMW 107.83',
                  qty: '1',
                  unit: '1Cases 0Pcs',
                  value: 'ZMW 647.00',
                },
              ],
            },
            {
              id: 'paste',
              name: 'Paste',
              meta: '2Box 0Pcs',
              value: '704.00',
              lines: [
                {
                  id: 'paste-1',
                  name: 'AUL-ALOHA PASTE 20X400G_29966',
                  ptr: 'ZMW 18.20',
                  qty: '1',
                  unit: '1Cases 0Pcs',
                  value: 'ZMW 364.00',
                },
                {
                  id: 'paste-2',
                  name: 'AUL-BANJA HERBAL PASTE 20 X 400G_27887',
                  ptr: 'ZMW 17.00',
                  qty: '1',
                  unit: '1Cases 0Pcs',
                  value: 'ZMW 340.00',
                },
              ],
            },
          ],
        },
        metrics: [
          { label: 'Value(ZMW)', value: '1,719' },
          { label: 'NetValue(ZMW)', value: '1,719' },
          { label: 'Qty(Std Unit)', value: '4' },
          { label: 'Replacement (Unit)', value: '0' },
          { label: 'Focus Product Sales Collection(ZMW)', value: '0.0' },
          { label: 'Outlet Wise Value(ZMW)', value: '0.0' },
        ],
      },
      {
        id: 'activity-2',
        type: 'VANSALES ACTIVITY',
        time: '07:49 AM',
        duration: '< 1 min',
        outlet: '10599-Mr C Chanda',
        owner: 'Mr Chanda',
        metrics: [
          { label: 'Value(ZMW)', value: '418' },
          { label: 'NetValue(ZMW)', value: '418' },
          { label: 'Qty(Std Unit)', value: '2' },
          { label: 'Replacement (Unit)', value: '0' },
          { label: 'Focus Product Sales Collection(ZMW)', value: '0.0' },
          { label: 'Outlet Wise Value(ZMW)', value: '0.0' },
        ],
      },
    ],
  },
  {
    id: 'gabriel-magnus',
    name: 'Gabriel & Magnus',
    position: 'CAF-5288',
    status: 'retailing',
    location: '2MM2-FWP, Northrise, Ndola, Copperbelt Province.',
    route: 'Masala',
    firstCall: '08:49 AM',
    firstPc: '08:49 AM',
    tc: '4',
    pc: '4',
    lpc: '3.5',
    phone: '+260 97 002 1832',
    activities: [
      {
        id: 'activity-3',
        type: 'VANSALES ACTIVITY',
        time: '08:49 AM',
        duration: '< 1 min',
        outlet: '12812-Mukuba Store',
        owner: 'Gabriel',
        metrics: [
          { label: 'Value(ZMW)', value: '910' },
          { label: 'NetValue(ZMW)', value: '910' },
          { label: 'Qty(Std Unit)', value: '3' },
          { label: 'Replacement (Unit)', value: '0' },
          { label: 'Focus Product Sales Collection(ZMW)', value: '0.0' },
          { label: 'Outlet Wise Value(ZMW)', value: '0.0' },
        ],
      },
    ],
  },
  {
    id: 'official-user',
    name: 'Official Work User',
    position: 'CAF-2911',
    status: 'official-work',
    location: 'Regional office, Ndola',
    route: 'Admin',
    firstCall: '--',
    firstPc: '--',
    tc: '1',
    pc: '0',
    lpc: '0.0',
    phone: '+260 96 555 0191',
    activities: [
      {
        id: 'activity-4',
        type: 'OFFICIAL WORK',
        time: '09:15 AM',
        duration: '42 mins',
        outlet: 'Regional office reporting',
        owner: 'Supervisor',
        metrics: [
          { label: 'Value(ZMW)', value: '0' },
          { label: 'NetValue(ZMW)', value: '0' },
          { label: 'Qty(Std Unit)', value: '0' },
        ],
      },
    ],
  },
];

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

const getStaticTimelineUser = (user: FieldUser) =>
  FIELD_USERS.find((fieldUser) => fieldUser.status === user.status) || FIELD_USERS[0];

function SummaryMetric({
  label,
  value,
  color,
  onPress,
}: {
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={stylesBase.summaryMetric} activeOpacity={0.78} onPress={onPress}>
      <View style={[stylesBase.summaryMarker, { backgroundColor: color }]} />
      <AppText style={stylesBase.summaryValue}>{value}</AppText>
      <AppText style={stylesBase.summaryLabel}>{label}</AppText>
    </TouchableOpacity>
  );
}

function UserStat({ label, value }: UserMetric) {
  return (
    <View style={stylesBase.userStat}>
      <AppText style={stylesBase.userStatValue}>{value}</AppText>
      <AppText style={stylesBase.userStatLabel}>{label}</AppText>
    </View>
  );
}

type ManagerDailySummaryScreenProps = {
  forcedView?: DailyView;
};

export default function ManagerDailySummaryScreen({ forcedView }: ManagerDailySummaryScreenProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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

  const status = getParam(params.status) as SummaryStatus | undefined;
  const userId = getParam(params.userId);
  const activityId = getParam(params.activityId);
  const selectedRouteDate = formatRouteDate(selectedDate);
  const selectedUser = useMemo(
    () => [...fieldUsers, ...FIELD_USERS].find((user) => user.id === userId),
    [fieldUsers, userId],
  );
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

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: view === 'order' ? 'Order Details' : selectedUser ? selectedUser.name : 'Daily Summary',
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
        setFieldUsers(response.data.map(mapFieldUserSummary));
      }
    } catch (error) {
      console.warn('Failed to load manager field users', error);
    } finally {
      setLoadingFieldUsers(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchManagerStats(selectedRouteDate),
      view === 'users' ? fetchFieldUsers(selectedRouteDate, debouncedSearchKey) : Promise.resolve(),
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
    if (view === 'users') {
      fetchFieldUsers(selectedRouteDate, debouncedSearchKey);
    }
  }, [debouncedSearchKey, fetchFieldUsers, selectedRouteDate, view]);

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const openUsers = (nextStatus?: SummaryStatus) => {
    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/users',
      params: nextStatus ? { status: nextStatus, date: selectedRouteDate } : { date: selectedRouteDate },
    });
  };

  const openTimeline = (nextUser: FieldUser) => {
    const staticTimelineUser = getStaticTimelineUser(nextUser);

    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/[userId]',
      params: { userId: staticTimelineUser.id, date: selectedRouteDate },
    });
  };

  const openOrder = (nextActivity: TimelineActivity) => {
    if (!nextActivity.order || !selectedUser) return;

    router.push({
      pathname: '/(drawer)/(tabs)/daily-summary/[userId]/order/[activityId]',
      params: { userId: selectedUser.id, activityId: nextActivity.id, date: selectedRouteDate },
    });
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
        <View style={styles.topBar}>
          <View>
            <AppText style={styles.caption}>{formatSelectedDate(selectedDate)}</AppText>
          </View>
          <TouchableOpacity style={styles.refreshButton} activeOpacity={0.78} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color={colors.info} />
          </TouchableOpacity>
        </View>

        {view !== 'order' && (
          <View style={styles.dateCard}>
            <TouchableOpacity style={styles.dateHeader} activeOpacity={0.82} onPress={openDatePicker}>
              <View style={styles.dateTitleRow}>
                <Ionicons name="calendar-clear-outline" size={16} color={colors.info} />
                <AppText style={styles.dateLabel}>{formatSelectedDate(selectedDate)}</AppText>
              </View>
              <View style={styles.dateAction}>
                <AppText style={styles.changeDateText}>Change date</AppText>
                <Ionicons name="chevron-down" size={14} color={colors.textQuaternary} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {(view === 'summary' || view === 'users') && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View>
                <AppText style={styles.sectionTitle}>REPORTING TO YOU</AppText>
                <AppText style={styles.cardTitle}>{user?.name || 'Manager'}</AppText>
                <AppText style={styles.cardSubTitle}>(Manager)</AppText>
              </View>
              <TouchableOpacity activeOpacity={0.78} onPress={() => openUsers()}>
                <AppText style={styles.linkText}>ALL FIELD USER</AppText>
              </TouchableOpacity>
            </View>
            <AppText style={styles.refreshed}>Last Refreshed Just Now</AppText>
            <View style={styles.summaryGrid}>
              <SummaryMetric
                label="Total Users"
                value={summaryCounts.total}
                color={colors.info}
                onPress={() => openUsers()}
              />
              <SummaryMetric
                label="Retailing"
                value={summaryCounts.retailing}
                color={STATUS_META.retailing.color}
                onPress={() => openUsers('retailing')}
              />
              <SummaryMetric
                label="Official Work"
                value={summaryCounts['official-work']}
                color={STATUS_META['official-work'].color}
                onPress={() => openUsers('official-work')}
              />
              <SummaryMetric
                label="Leave"
                value={summaryCounts.leave}
                color={STATUS_META.leave.color}
                onPress={() => openUsers('leave')}
              />
              <SummaryMetric
                label="Absent"
                value={summaryCounts.absent}
                color={STATUS_META.absent.color}
                onPress={() => openUsers('absent')}
              />
              <SummaryMetric
                label="SC"
                value={managerStats.callSummary.sc}
                color={colors.textSecondary}
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
              {(['retailing', 'official-work', 'leave', 'absent'] as SummaryStatus[]).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.compactStat,
                    status === item && { borderBottomColor: STATUS_META[item].color },
                  ]}
                  activeOpacity={0.78}
                  onPress={() => openUsers(item)}
                >
                  <AppText style={styles.compactStatLabel}>{STATUS_META[item].label}</AppText>
                  <AppText style={styles.compactStatValue}>{summaryCounts[item]}</AppText>
                </TouchableOpacity>
              ))}
              <View style={styles.compactStat}>
                <AppText style={styles.compactStatLabel}>Total</AppText>
                <AppText style={styles.compactStatValue}>{summaryCounts.total}</AppText>
              </View>
            </View>
            <AppText style={styles.refreshed}>Last Refreshed Just Now</AppText>
            {filteredUsers.length === 0 ? (
              <AppText style={styles.emptyText}>
                {loadingFieldUsers ? 'Loading field users...' : 'No field users found for this status.'}
              </AppText>
            ) : (
              filteredUsers.map((user) => {
                const meta = STATUS_META[user.status];
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
                      <View>
                        <AppText style={styles.userName}>{user.name}</AppText>
                        <AppText style={styles.userPosition}>({user.position})</AppText>
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
                      <UserStat label="First Call" value={user.firstCall} />
                      <UserStat label="First PC" value={user.firstPc} />
                      <UserStat label="TC" value={user.tc} />
                      <UserStat label="PC" value={user.pc} />
                      <UserStat label="LPC" value={user.lpc} />
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
                <AppText style={styles.userName}>{selectedUser.name}</AppText>
                <Ionicons name="information-circle" size={16} color={colors.info} />
              </View>
              <AppText style={styles.refreshed}>Last Refreshed Just Now</AppText>
            </View>
            <View style={styles.tabsRow}>
              {['TIMELINE', 'MTD', 'ROUTE'].map((tab, index) => (
                <View key={tab} style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
                  <AppText style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</AppText>
                </View>
              ))}
            </View>
            <AppText style={styles.dateTitle}>{formatSelectedDate(selectedDate)}</AppText>
            <View style={[styles.routeBadge, { borderColor: STATUS_META[selectedUser.status].color }]}>
              <AppText style={[styles.routeBadgeText, { color: STATUS_META[selectedUser.status].color }]}>
                {STATUS_META[selectedUser.status].label}
              </AppText>
              <AppText style={styles.routeText}>{selectedUser.route}</AppText>
            </View>
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              <View style={styles.dayStart}>
                <View style={styles.timelineDot}>
                  <Ionicons name="radio-button-on" size={14} color={STATUS_META[selectedUser.status].color} />
                </View>
                <View>
                  <AppText style={styles.activityTitle}>DAY START</AppText>
                  <AppText style={styles.activityTime}>07:41 AM</AppText>
                </View>
                <MaterialCommunityIcons name="camera" size={14} color={colors.textSecondary} />
                <AppText style={styles.selfieText}>SELFIE</AppText>
              </View>
              {selectedUser.activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  activeOpacity={0.82}
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
              ))}
            </View>
          </>
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
                <AppText style={styles.orderHeroSub}>LC : {selectedActivity.order.totalPieces}</AppText>
              </View>
              <View style={styles.orderHeroRight}>
                <AppText style={styles.orderHeroValue}>ZMW {selectedActivity.order.netValue}</AppText>
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
                    index % 2 === 0 ? styles.orderCategoryHeaderBlue : styles.orderCategoryHeaderMuted,
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
                <AppText style={styles.orderSummaryValue}>ZMW {selectedActivity.order.netValue}</AppText>
              </View>
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderDiscountLabel}>Scheme Discount:</AppText>
                <AppText style={styles.orderDiscountValue}>ZMW {selectedActivity.order.schemeDiscount}</AppText>
              </View>
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderDiscountLabel}>Cash Discount</AppText>
                <AppText style={styles.orderDiscountValue}>ZMW {selectedActivity.order.cashDiscount}</AppText>
              </View>
              <View style={styles.orderDivider} />
              <View style={styles.orderSummaryRow}>
                <AppText style={styles.orderSummaryLabel}>Net Amount</AppText>
                <AppText style={styles.orderSummaryValue}>ZMW {selectedActivity.order.netValue}</AppText>
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

const stylesBase = StyleSheet.create({
  summaryMetric: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryMarker: {
    width: 16,
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  summaryLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
  },
  userStat: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  userStatValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  userStatLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 12,
      paddingBottom: 30,
      gap: 10,
    },
    topBar: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    brandAccent: {
      color: colors.info,
    },
    caption: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: '700',
      color: colors.info,
    },
    refreshButton: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      backgroundColor: colors.infoLight,
    },
    dateCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateHeader: {
      minHeight: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    dateTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateLabel: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    dateAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    changeDateText: {
      fontSize: 9,
      fontWeight: '800',
      color: colors.textQuaternary,
    },
    summaryCard: {
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 9,
      fontWeight: '800',
      color: colors.textQuaternary,
    },
    cardTitle: {
      marginTop: 6,
      fontSize: 14,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    cardSubTitle: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    linkText: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.info,
    },
    refreshed: {
      alignSelf: 'flex-end',
      marginTop: 4,
      fontSize: 9,
      fontWeight: '700',
      color: colors.textQuaternary,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    searchRow: {
      height: 42,
      borderRadius: 6,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.infoLight,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    searchInput: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    compactStats: {
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      paddingTop: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    compactStat: {
      width: '50%',
      paddingVertical: 8,
      paddingHorizontal: 6,
      borderBottomWidth: 2,
      borderBottomColor: colors.borderLight,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    compactStatLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    compactStatValue: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    userCard: {
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 8,
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    userName: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    userPosition: {
      marginTop: 1,
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    iconActions: {
      flexDirection: 'row',
      gap: 8,
    },
    circleIcon: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      backgroundColor: colors.infoLight,
    },
    routeBadge: {
      minHeight: 28,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    routeBadgeText: {
      width: '40%',
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '900',
    },
    routeText: {
      flex: 1,
      fontSize: 10,
      fontWeight: '900',
      color: colors.textPrimary,
      textAlign: 'center',
    },
    locationText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textTertiary,
    },
    userStats: {
      flexDirection: 'row',
      paddingTop: 4,
      gap: 8,
    },
    emptyText: {
      paddingVertical: 20,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '800',
      color: colors.textTertiary,
    },
    timelineHeader: {
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timelineTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tabsRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabItem: {
      flex: 1,
      minHeight: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabItemActive: {
      borderBottomColor: colors.info,
    },
    tabText: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.textTertiary,
    },
    tabTextActive: {
      color: colors.info,
    },
    dateTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    timeline: {
      paddingLeft: 18,
      gap: 10,
    },
    timelineLine: {
      position: 'absolute',
      left: 24,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: colors.info,
    },
    dayStart: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingLeft: 14,
    },
    timelineDot: {
      position: 'absolute',
      left: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineDotSmall: {
      position: 'absolute',
      left: -21,
      top: 24,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.infoLight,
      borderWidth: 2,
      borderColor: colors.info,
    },
    activityCard: {
      marginLeft: 14,
      borderRadius: 8,
      padding: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    activityTitle: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textSecondary,
    },
    activityTime: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    duration: {
      fontSize: 9,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    selfieText: {
      fontSize: 9,
      fontWeight: '900',
      color: colors.textSecondary,
    },
    outletRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 8,
    },
    outletName: {
      flex: 1,
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    ownerName: {
      maxWidth: '38%',
      fontSize: 10,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    metricGrid: {
      marginTop: 10,
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    metricCell: {
      width: '33.33%',
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
    },
    metricValue: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    metricLabel: {
      marginTop: 3,
      textAlign: 'center',
      fontSize: 8,
      fontWeight: '700',
      color: colors.textTertiary,
    },
    orderScreen: {
      gap: 8,
    },
    orderHero: {
      minHeight: 74,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: '#D4FFD0',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#B6F3B0',
    },
    orderHeroText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderHeroSub: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    orderHeroRight: {
      alignItems: 'flex-end',
      minWidth: 92,
    },
    orderHeroValue: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderOutlet: {
      paddingHorizontal: 2,
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderCategory: {
      overflow: 'hidden',
      borderRadius: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    orderCategoryHeader: {
      minHeight: 42,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    orderCategoryHeaderBlue: {
      backgroundColor: '#E4EEF5',
    },
    orderCategoryHeaderMuted: {
      backgroundColor: '#F2F2F2',
    },
    orderCategoryName: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderCategoryMeta: {
      marginTop: 2,
      fontSize: 9,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    orderCategoryValue: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderLine: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      backgroundColor: colors.surface,
    },
    orderLineName: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderLineMeta: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    orderLineMetaText: {
      fontSize: 8,
      fontWeight: '800',
      color: colors.textTertiary,
    },
    orderUnitPill: {
      minHeight: 16,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: colors.borderLight,
    },
    orderUnitPillText: {
      fontSize: 7,
      fontWeight: '900',
      color: colors.textSecondary,
    },
    orderLineValue: {
      marginLeft: 'auto',
      fontSize: 8,
      fontWeight: '900',
      color: colors.textSecondary,
    },
    orderSummary: {
      marginTop: 2,
      borderRadius: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: 'hidden',
    },
    orderSummaryHeader: {
      minHeight: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFC945',
    },
    orderSummaryHeaderText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderSummaryRow: {
      minHeight: 22,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    orderSummaryLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    orderSummaryValue: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    orderDiscountLabel: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.error,
    },
    orderDiscountValue: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.error,
    },
    orderDivider: {
      height: 1,
      marginVertical: 4,
      backgroundColor: colors.border,
    },
    orderPayableLabel: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.success,
    },
    orderPayableValue: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.success,
    },
  });
