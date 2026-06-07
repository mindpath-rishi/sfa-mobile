import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { homeService } from '@/features/home/services/home.service';
import type {
  ManagerOrderSummaryResponse,
  ManagerTargetResponse,
} from '@/features/home/services/home.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { ManagerDatePickerModal } from '../components/models/ManagerDatePickerModal';

type SummaryRow = {
  label: string;
  value: number;
  color: string;
};

type CategoryOrder = {
  label: string;
  value: number;
  cases: string;
  color: string;
};

type OutletSummary = {
  label: string;
  value: string;
  progress: number;
  color: string;
};

type UserSummaryData = {
  retailing: number;
  officeWork: number;
  leave: number;
  absent: number;
  total: number;
};

type CallSummaryData = {
  productivity: number;
  covered: number;
  pc: number;
  tc: number;
  sc: number;
  qtyCases: number;
};

const INITIAL_USER_SUMMARY: UserSummaryData = {
  retailing: 152,
  officeWork: 1,
  leave: 0,
  absent: 37,
  total: 190,
};

const INITIAL_CALL_SUMMARY: CallSummaryData = {
  productivity: 89,
  covered: 3,
  pc: 463,
  tc: 515,
  sc: 19356,
  qtyCases: 2425.1,
};

const CATEGORY_ORDERS: CategoryOrder[] = [
  { label: 'Laundry', value: 54, cases: '60,603.8', color: '#58B989' },
  { label: 'Confectionery', value: 25, cases: '28,431.3', color: '#18B72D' },
  { label: 'Personal Care', value: 15, cases: '16,721.5', color: '#C75A95' },
  { label: 'Household', value: 6, cases: '6,699.8', color: '#EF5DA8' },
];

const OUTLET_SUMMARY: OutletSummary[] = [
  { label: 'UPC', value: '11,881.0', progress: 0.86, color: '#16A34A' },
  { label: 'Zero Order', value: '555.0', progress: 0.24, color: '#F59E0B' },
  { label: 'Not Visited', value: '5,223.0', progress: 0.69, color: '#EF5DA8' },
  { label: 'Total', value: '19,064.0', progress: 0.66, color: '#8B5CF6' },
];

const CATEGORY_ORDER_COLORS = [
  '#58B989',
  '#18B72D',
  '#C75A95',
  '#EF5DA8',
  '#8B5CF6',
  '#F59E0B',
];

const formatSelectedDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const getCurrentMonthPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const formattedStart = formatSelectedDate(startDate);
  const formattedEnd = formatSelectedDate(endDate);

  return `${formattedStart} - ${formattedEnd}`;
};

const formatRouteDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

const clampPercentage = (value: number) => Math.max(0, Math.min(value, 100));

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
};

function DonutChart({
  data,
  total,
  colors,
}: {
  data: CategoryOrder[];
  total: string;
  colors: any;
}) {
  const size = 116;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={stylesBase.donutWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.borderLight}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {data.map((item) => {
          const dashLength = (item.value / 100) * circumference;
          const strokeDashoffset = -offset;
          offset += dashLength;

          return (
            <Circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </Svg>
      <View style={stylesBase.donutCenter}>
        <AppText style={{ fontSize: 10, color: colors.textTertiary }}>Total</AppText>
        <AppText style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
          {total}
        </AppText>
      </View>
    </View>
  );
}

function Gauge({
  percentage,
  value,
  color,
  colors,
}: {
  percentage: number;
  value: string;
  color: string;
  colors: any;
}) {
  const width = 180;
  const height = 104;
  const radius = 70;
  const centerX = 90;
  const centerY = 88;
  const progressAngle = Math.max(0, Math.min(percentage, 100)) * 1.8;

  return (
    <View style={stylesBase.gaugeWrap}>
      <Svg width={width} height={height}>
        <Path
          d={describeArc(centerX, centerY, radius, 0, 180)}
          stroke={colors.borderLight}
          strokeWidth={14}
          strokeLinecap="round"
          fill="transparent"
        />
        <Path
          d={describeArc(centerX, centerY, radius, 0, progressAngle)}
          stroke={percentage > 0 ? color : colors.border}
          strokeWidth={14}
          strokeLinecap="round"
          fill="transparent"
        />
        <Path
          d={describeArc(centerX, centerY, radius, 65, 115)}
          stroke="#FDE68A"
          strokeWidth={14}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>
      <View style={stylesBase.gaugeValue}>
        <AppText style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary }}>
          {percentage.toFixed(1)}%
        </AppText>
        <AppText style={{ fontSize: 11, fontWeight: '700', color: colors.textTertiary }}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

export default function ManagerHomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummaryData>(INITIAL_USER_SUMMARY);
  const [callSummary, setCallSummary] = useState<CallSummaryData>(INITIAL_CALL_SUMMARY);
  const [managerOrderSummary, setManagerOrderSummary] =
    useState<ManagerOrderSummaryResponse | null>(null);

  const selectedRouteDate = formatRouteDate(selectedDate);
  const userSummaryRows: SummaryRow[] = [
    { label: 'Retailing', value: userSummary.retailing, color: '#16A34A' },
    { label: 'Official Work', value: userSummary.officeWork, color: '#2563EB' },
    { label: 'Leave', value: userSummary.leave, color: '#F59E0B' },
    { label: 'Absent', value: userSummary.absent, color: '#DC2626' },
  ];
  const totalUsers = userSummary.total ?? userSummaryRows.reduce((sum, item) => sum + item.value, 0);
  const categoryOrders = useMemo<CategoryOrder[]>(() => {
    const categories = managerOrderSummary?.primaryCategoryWiseOrder?.categories;

    if (!categories?.length) return CATEGORY_ORDERS;

    return categories.map((item, index) => ({
      label: item.category,
      value: item.percentage,
      cases: formatNumber(item.cases),
      color: CATEGORY_ORDER_COLORS[index % CATEGORY_ORDER_COLORS.length],
    }));
  }, [managerOrderSummary]);
  const categoryOrderTotal = managerOrderSummary?.primaryCategoryWiseOrder?.totalCases !== undefined
    ? formatNumber(managerOrderSummary.primaryCategoryWiseOrder.totalCases)
    : '112,456.3';
  const orderCases = managerOrderSummary?.managerOrderSummary?.orders ?? 112456.3;
  const validationCases = managerOrderSummary?.managerOrderSummary?.validation ?? 112456.3;
  const validationPercentage =
    orderCases > 0 ? clampPercentage((validationCases / orderCases) * 100) : 0;
  const outletSummaryRows = useMemo<OutletSummary[]>(() => {
    const summary = managerOrderSummary?.outletSummary;

    if (!summary) return OUTLET_SUMMARY;

    return [
      {
        label: 'UPC',
        value: formatNumber(summary.upc.count),
        progress: clampPercentage(summary.upc.percentage) / 100,
        color: '#16A34A',
      },
      {
        label: 'Zero Order',
        value: formatNumber(summary.zeroOrder.count),
        progress: clampPercentage(summary.zeroOrder.percentage) / 100,
        color: '#F59E0B',
      },
      {
        label: 'Not Visited',
        value: formatNumber(summary.notVisited.count),
        progress: clampPercentage(summary.notVisited.percentage) / 100,
        color: '#EF5DA8',
      },
      {
        label: 'Total',
        value: formatNumber(summary.total.count),
        progress: clampPercentage(summary.total.percentage) / 100,
        color: '#8B5CF6',
      },
    ];
  }, [managerOrderSummary]);
  const outletProductivity = managerOrderSummary?.outletSummary?.productivity;
  const productivityPercentage = outletProductivity?.percentage;

  const TARGETS = [
    {
      title: 'User wise Primary Category Targets',
      period: getCurrentMonthPeriod(),
      percentage: 34,
      value: '112 K Cases',
      hint: 'Only 217,383.55 more Cases to achieve your target',
    },
    {
      title: 'User Wise Target UBO',
      period: 'N/A - N/A',
      percentage: 0,
      value: '0',
      hint: 'Target has not been configured for this period',
    },
  ];

  const [managerTarget, setManagerTarget] = useState<ManagerTargetResponse | null>(null);

  const fetchManagerStats = async (date?: string) => {
    try {
      const response = await homeService.getManagerStats(date);

      if (response.success && response.data) {
        setUserSummary(response.data.userSummary ?? INITIAL_USER_SUMMARY);
        setCallSummary(response.data.callSummary ?? INITIAL_CALL_SUMMARY);
      }
    } catch (error) {
      console.warn('Failed to load manager stats', error);
    }
  };

  const fetchManagerTarget = async () => {
    try {
      const response = await homeService.getManagerTarget();

      if (response.success && response.data) {
        setManagerTarget(response.data as ManagerTargetResponse);
      }
    } catch (error) {
      console.warn('Failed to load manager target', error);
    }
  };

  const fetchManagerOrderSummary = async (date?: string) => {
    try {
      const response = await homeService.getManagerOrderSummary(date);

      if (response.success && response.data) {
        setManagerOrderSummary(response.data as ManagerOrderSummaryResponse);
      }
    } catch (error) {
      console.warn('Failed to load manager order summary', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchManagerStats(selectedRouteDate);
    await fetchManagerOrderSummary(selectedRouteDate);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchManagerStats(selectedRouteDate);
    fetchManagerTarget();
    fetchManagerOrderSummary(selectedRouteDate);
  }, [selectedRouteDate]);

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <ManagerDatePickerModal
        visible={showDatePicker}
        value={selectedDate}
        title="Select dashboard date"
        onClose={() => setShowDatePicker(false)}
        onApply={setSelectedDate}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View>
            <AppText style={styles.eyebrow}>Manager Dashboard</AppText>
            <AppText style={styles.title}>{user?.name || 'Field Manager'}</AppText>
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dateCard}>
          <TouchableOpacity style={styles.dateHeader} activeOpacity={0.82} onPress={openDatePicker}>
            <View style={styles.dateTitleRow}>
              <Ionicons name="calendar-clear-outline" size={16} color={colors.primary} />
              <AppText style={styles.dateLabel}>{formatSelectedDate(selectedDate)}</AppText>
            </View>
            <View style={styles.dateAction}>
              <AppText style={styles.refreshedText}>Change date</AppText>
              <Ionicons name="chevron-down" size={14} color={colors.textQuaternary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>User Summary</AppText>
              <AppText style={styles.cardMeta}>
                {new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(
                  selectedDate,
                )}
              </AppText>
            </View>
            {userSummaryRows.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.summaryRow}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: '/(drawer)/(tabs)/daily-summary/users',
                    params: {
                      status: item.label.toLowerCase().replace(/\s+/g, '-'),
                      date: selectedRouteDate,
                    },
                  })
                }
              >
                <View style={styles.summaryLabelWrap}>
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <AppText style={styles.summaryLabel}>{item.label}</AppText>
                </View>
                <AppText style={styles.summaryValue}>{item.value}</AppText>
              </TouchableOpacity>
            ))}
            <View style={styles.totalRow}>
              <AppText style={styles.totalLabel}>Total</AppText>
              <AppText style={styles.totalValue}>{totalUsers}</AppText>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>Call Summary</AppText>
              <MaterialCommunityIcons name="phone-check-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.callCircleRow}>
              <View style={styles.callCircle}>
                <AppText style={styles.callValue}>{callSummary.productivity}</AppText>
                <AppText style={styles.callLabel}>Productivity %</AppText>
              </View>
              <View style={styles.callCircleMuted}>
                <AppText style={styles.callValue}>{callSummary.covered}</AppText>
                <AppText style={styles.callLabel}>Covered %</AppText>
              </View>
            </View>
            <View style={styles.callMetrics}>
              <View style={styles.metricItem}>
                <AppText style={styles.metricValue}>{callSummary.pc}</AppText>
                <AppText style={styles.metricLabel}>PC</AppText>
              </View>
              <View style={styles.metricItem}>
                <AppText style={styles.metricValue}>{callSummary.tc}</AppText>
                <AppText style={styles.metricLabel}>TC</AppText>
              </View>
              <View style={styles.metricItem}>
                <AppText style={styles.metricValue}>{callSummary.sc}</AppText>
                <AppText style={styles.metricLabel}>SC</AppText>
              </View>
            </View>
            <View style={styles.orderValue}>
              <AppText style={styles.orderValueLabel}>Qty Cases</AppText>
              <AppText style={styles.orderValueText}>{callSummary.qtyCases}</AppText>
            </View>
          </View>
        </View>

        {TARGETS.map((target, index) => {
          const content = (
            <>
              <View style={styles.cardHeader}>
                <View style={styles.headerText}>
                  <AppText style={styles.cardTitle}>{target.title}</AppText>
                  <AppText style={styles.cardMeta}>{target.period}</AppText>
                </View>
                <Ionicons
                  name={index === 0 ? 'chevron-forward-circle-outline' : 'stats-chart-outline'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Gauge
                percentage={
                  index === 0
                    ? managerTarget?.achievementPercentage ?? target.percentage
                    : target.percentage
                }
                value={index === 0 ? managerTarget?.display?.achievedCases ?? target.value : target.value}
                color={index === 0 ? '#10B981' : colors.border}
                colors={colors}
              />
              <View style={[styles.targetHint, index === 1 && styles.targetHintMuted]}>
                <Ionicons
                  name={index === 0 ? 'bulb-outline' : 'information-circle-outline'}
                  size={14}
                  color={index === 0 ? colors.primaryContrast : colors.textTertiary}
                />
                <AppText style={[styles.targetHintText, index === 1 && styles.targetHintTextMuted]}>
                  {index === 0 ? managerTarget?.display?.remainingMessage ?? target.hint : target.hint}
                </AppText>
              </View>
            </>
          );

          if (index === 0) {
            return (
              <TouchableOpacity
                key={target.title}
                style={styles.card}
                activeOpacity={0.82}
                onPress={() =>
                  router.push({
                    pathname: '/(drawer)/manager-targets',
                    params: { date: selectedRouteDate },
                  })
                }
              >
                {content}
              </TouchableOpacity>
            );
          }

          return (
            <View key={target.title} style={styles.card}>
              {content}
            </View>
          );
        })}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText style={styles.cardTitle}>Primary Category Wise Order</AppText>
            <AppText style={styles.mtdBadge}>MTD</AppText>
          </View>
          <View style={styles.chartRow}>
            <DonutChart data={categoryOrders} total={categoryOrderTotal} colors={colors} />
            <View style={styles.legend}>
              {categoryOrders.map((item) => (
                <View key={item.label} style={styles.legendRow}>
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <View style={styles.legendTextWrap}>
                    <AppText style={styles.legendLabel} numberOfLines={1}>
                      {item.label}
                    </AppText>
                    <AppText style={styles.legendValue}>{item.cases} Cases</AppText>
                  </View>
                  <AppText style={styles.legendPercent}>{item.value}%</AppText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText style={styles.cardTitle}>Position Wise Order</AppText>
            <AppText style={styles.mtdBadge}>MTD</AppText>
          </View>
          <View style={styles.routeInfo}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>
                {user?.name
                  ?.split(' ')
                  ?.map((word: string) => word[0])
                  ?.join('')
                  ?.toUpperCase()
                  ?.slice(0, 2) || 'M'}
              </AppText>
            </View>
            <View style={styles.headerText}>
              <AppText style={styles.routeName}>Manager</AppText>
              <AppText style={styles.cardMeta}>{user?.name || 'Manager'}</AppText>
            </View>
          </View>
          <View style={styles.progressLegend}>
            <View style={styles.progressLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: '#B15CC8' }]} />
              <AppText style={styles.cardMeta}>Order</AppText>
            </View>
            <View style={styles.progressLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
              <AppText style={styles.cardMeta}>Validation</AppText>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '100%', backgroundColor: '#B15CC8' }]} />
            <AppText style={styles.progressText}>{formatNumber(orderCases)} Cases</AppText>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${validationPercentage}%`, backgroundColor: '#93C5FD' },
              ]}
            />
            <AppText style={styles.progressText}>{formatNumber(validationCases)} Cases</AppText>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppText style={styles.cardTitle}>Outlets Summary</AppText>
            <AppText style={styles.mtdBadge}>MTD</AppText>
          </View>
          {outletSummaryRows.map((item) => (
            <View key={item.label} style={styles.outletRow}>
              <View style={styles.outletText}>
                <AppText style={styles.summaryLabel}>{item.label}</AppText>
                <AppText style={styles.summaryValue}>{item.value}</AppText>
              </View>
              <View style={styles.outletProgressTrack}>
                <View
                  style={[
                    styles.outletProgressFill,
                    { width: `${item.progress * 100}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
              <View style={[styles.percentBadge, { borderColor: item.color }]}>
                <AppText style={[styles.percentBadgeText, { color: item.color }]}>
                  {Math.round(item.progress * 100)}%
                </AppText>
              </View>
            </View>
          ))}
          <View style={styles.productivityBox}>
            <Ionicons name="trending-up-outline" size={16} color={colors.success} />
            <View>
              <AppText style={styles.productivityTitle}>Productivity</AppText>
              <AppText style={styles.cardMeta}>
                PC: {formatNumber(outletProductivity?.pc ?? 24940)} | TC:{' '}
                {formatNumber(outletProductivity?.tc ?? 28711)}
                {productivityPercentage !== undefined
                  ? ` | ${formatNumber(productivityPercentage)}%`
                  : ''}
              </AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const stylesBase = StyleSheet.create({
  donutWrap: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeWrap: {
    height: 122,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    position: 'absolute',
    top: 56,
    alignItems: 'center',
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 28,
      gap: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    eyebrow: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 2,
    },
    filterButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateHeader: {
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
    dateAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    refreshedText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textQuaternary,
    },
    summaryGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 8,
    },
    headerText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    cardMeta: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textTertiary,
      marginTop: 2,
    },
    summaryRow: {
      minHeight: 30,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    summaryLabelWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingRight: 4,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    summaryLabel: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 9,
    },
    totalLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    totalValue: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.primary,
    },
    callCircleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      gap: 10,
      marginBottom: 10,
    },
    callCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.success,
    },
    callCircleMuted: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.border,
    },
    callValue: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    callLabel: {
      fontSize: 8,
      fontWeight: '700',
      color: colors.textTertiary,
      textAlign: 'center',
    },
    callMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    metricItem: {
      alignItems: 'center',
      flex: 1,
    },
    metricValue: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    metricLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textTertiary,
    },
    orderValue: {
      borderRadius: 10,
      backgroundColor: colors.info,
      paddingVertical: 8,
      alignItems: 'center',
    },
    orderValueLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.primaryContrast,
      opacity: 0.85,
    },
    orderValueText: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.primaryContrast,
    },
    targetHint: {
      minHeight: 34,
      borderRadius: 10,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
    },
    targetHintMuted: {
      backgroundColor: colors.backgroundSecondary,
    },
    targetHintText: {
      flex: 1,
      fontSize: 10,
      fontWeight: '700',
      color: colors.primaryContrast,
    },
    targetHintTextMuted: {
      color: colors.textTertiary,
    },
    mtdBadge: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.primary,
      backgroundColor: colors.infoLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 7,
      overflow: 'hidden',
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legend: {
      flex: 1,
      gap: 8,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendTextWrap: {
      flex: 1,
    },
    legendLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    legendValue: {
      fontSize: 9,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    legendPercent: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    routeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '18',
    },
    avatarText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.primary,
    },
    routeName: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    progressLegend: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
    },
    progressLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    progressTrack: {
      height: 22,
      borderRadius: 5,
      backgroundColor: colors.backgroundTertiary,
      overflow: 'hidden',
      marginBottom: 6,
      justifyContent: 'center',
    },
    progressFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: 5,
    },
    progressText: {
      alignSelf: 'flex-end',
      paddingRight: 8,
      fontSize: 10,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    outletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 0,
    },
    outletText: {
      width: 70,
    },
    outletProgressTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: colors.backgroundTertiary,
    },
    outletProgressFill: {
      height: '100%',
      borderRadius: 4,
    },
    percentBadge: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    percentBadgeText: {
      fontSize: 11,
      fontWeight: '900',
    },
    productivityBox: {
      minHeight: 28,
      borderRadius: 6,
      paddingHorizontal: 4,
      paddingVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.successLight,
      marginTop: 0,
    },
    productivityTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.success,
    },
  });
