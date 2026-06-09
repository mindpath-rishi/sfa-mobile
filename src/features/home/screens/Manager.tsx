import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { homeService } from '@/features/home/services/home.service';
import type {
  ManagerOrderSummaryResponse,
  ManagerTargetResponse,
  TargetMetric,
} from '@/features/home/services/home.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { ManagerDatePickerModal } from '../components/models/ManagerDatePickerModal';

import { createManagerStyles, managerStylesBase as stylesBase } from '../styles/Manager.styles';

type SummaryRow = {
  label: string;
  value: number;
  color: string;
};

type CategoryOrder = {
  label: string;
  value: number;
  metricValue: string;
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

const CATEGORY_ORDERS: Omit<CategoryOrder, 'color'>[] = [
  { label: 'Laundry', value: 54, metricValue: '60,603.8' },
  { label: 'Confectionery', value: 25, metricValue: '28,431.3' },
  { label: 'Personal Care', value: 15, metricValue: '16,721.5' },
  { label: 'Household', value: 6, metricValue: '6,699.8' },
];

const OUTLET_SUMMARY: Omit<OutletSummary, 'color'>[] = [
  { label: 'UPC', value: '0', progress: 0 },
  { label: 'Zero Order', value: '0', progress: 0 },
  { label: 'Not Visited', value: '0', progress: 0 },
  { label: 'Total', value: '0', progress: 0 },
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

const getCurrentMonthRange = () => {
  const now = new Date();

  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: now,
  };
};

const formatRouteDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatRangeLabel = (startDate: Date, endDate: Date) =>
  `${new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(startDate)} - ${new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(endDate)}`;

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

const METRIC_OPTIONS: { value: TargetMetric; label: string; unit: string }[] = [
  { value: 'cases', label: 'Cases', unit: 'Cases' },
  { value: 'value', label: 'Value', unit: 'Value' },
  { value: 'tonnage', label: 'Tonnage', unit: 'Tonnage' },
];

const getMetricLabel = (metric: TargetMetric) =>
  METRIC_OPTIONS.find((item) => item.value === metric)?.unit || 'Cases';

const getCategoryMetric = (
  item: ManagerOrderSummaryResponse['primaryCategoryWiseOrder']['categories'][number],
  metric: TargetMetric,
) => {
  if (metric === 'value') return Number(item.value || 0);
  if (metric === 'tonnage') return Number(item.tonnage || 0);
  return Number(item.cases || 0);
};

const getCategoryPercentage = (
  item: ManagerOrderSummaryResponse['primaryCategoryWiseOrder']['categories'][number],
  metric: TargetMetric,
) => {
  if (metric === 'value') return Number(item.valuePercentage ?? item.percentage ?? 0);
  if (metric === 'tonnage') return Number(item.tonnagePercentage ?? item.percentage ?? 0);
  return Number(item.percentage || 0);
};

const getOrderMetricValue = (
  summary: ManagerOrderSummaryResponse['managerOrderSummary'] | undefined,
  metric: TargetMetric,
  type: 'order' | 'validation',
) => {
  if (!summary) return 0;

  if (metric === 'value') {
    return Number(
      type === 'order'
        ? (summary.orderValue ?? summary.validation)
        : (summary.validationValue ?? summary.validation),
    );
  }

  if (metric === 'tonnage') {
    return Number(type === 'order' ? summary.orderTonnage : summary.validationTonnage || 0);
  }

  return Number(
    type === 'order'
      ? (summary.orderCases ?? summary.orders)
      : (summary.validationCases ?? summary.orders),
  );
};

const getManagerTargetMetric = (target: ManagerTargetResponse | null, metric: TargetMetric) => {
  const targetValue =
    metric === 'value'
      ? Number(target?.targetValue || 0)
      : metric === 'tonnage'
        ? Number(target?.targetTonnage || 0)
        : Number(target?.targetCases || 0);

  const achievedValue =
    metric === 'value'
      ? Number(target?.achievedValue || 0)
      : metric === 'tonnage'
        ? Number(target?.achievedTonnage || 0)
        : Number(target?.achievedCases || 0);

  const remainingValue = Math.max(targetValue - achievedValue, 0);
  const percentage = targetValue > 0 ? clampPercentage((achievedValue / targetValue) * 100) : 0;

  return {
    targetValue,
    achievedValue,
    remainingValue,
    percentage,
  };
};

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
          stroke={colors.warningLight}
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
  const styles = createManagerStyles(colors);
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryDateRange, setSummaryDateRange] = useState(getCurrentMonthRange);
  const [showSummaryDatePicker, setShowSummaryDatePicker] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummaryData>(INITIAL_USER_SUMMARY);
  const [callSummary, setCallSummary] = useState<CallSummaryData>(INITIAL_CALL_SUMMARY);
  const [managerOrderSummary, setManagerOrderSummary] =
    useState<ManagerOrderSummaryResponse | null>(null);
  const [primaryTargetMetric, setPrimaryTargetMetric] = useState<TargetMetric>('cases');
  const [uboTargetMetric, setUboTargetMetric] = useState<TargetMetric>('cases');
  const [categoryOrderMetric, setCategoryOrderMetric] = useState<TargetMetric>('cases');
  const [positionOrderMetric, setPositionOrderMetric] = useState<TargetMetric>('cases');
  const categoryOrderColors = useMemo(
    () => [
      colors.success,
      colors.successDark,
      colors.secondary,
      colors.info,
      colors.warning,
      colors.error,
    ],
    [
      colors.error,
      colors.info,
      colors.secondary,
      colors.success,
      colors.successDark,
      colors.warning,
    ],
  );
  const outletSummaryColors = useMemo(
    () => [colors.success, colors.warning, colors.secondary, colors.info],
    [colors.info, colors.secondary, colors.success, colors.warning],
  );
  const orderProgressColor = colors.secondary;
  const validationProgressColor = colors.info;

  const selectedRouteDate = formatRouteDate(new Date());
  const summaryStartRouteDate = formatRouteDate(summaryDateRange.startDate);
  const summaryEndRouteDate = formatRouteDate(summaryDateRange.endDate);
  const summaryDateRangeLabel = formatRangeLabel(
    summaryDateRange.startDate,
    summaryDateRange.endDate,
  );
  const userSummaryRows: SummaryRow[] = [
    { label: 'Retailing', value: userSummary.retailing, color: colors.success },
    { label: 'Official Work', value: userSummary.officeWork, color: colors.info },
    { label: 'Leave', value: userSummary.leave, color: colors.warning },
    { label: 'Absent', value: userSummary.absent, color: colors.error },
  ];
  const totalUsers =
    userSummary.total ?? userSummaryRows.reduce((sum, item) => sum + item.value, 0);
  const categoryOrders = useMemo<CategoryOrder[]>(() => {
    const categories = managerOrderSummary?.primaryCategoryWiseOrder?.categories;

    if (!categories?.length) {
      return CATEGORY_ORDERS.map((item, index) => ({
        ...item,
        color: categoryOrderColors[index % categoryOrderColors.length],
      }));
    }

    return categories.map((item, index) => ({
      label: item.category,
      value: getCategoryPercentage(item, categoryOrderMetric),
      metricValue: formatNumber(getCategoryMetric(item, categoryOrderMetric)),
      color: categoryOrderColors[index % categoryOrderColors.length],
    }));
  }, [categoryOrderColors, categoryOrderMetric, managerOrderSummary]);
  const categoryOrderTotal =
    categoryOrderMetric === 'value'
      ? formatNumber(managerOrderSummary?.primaryCategoryWiseOrder?.totalValue ?? 0)
      : categoryOrderMetric === 'tonnage'
        ? formatNumber(managerOrderSummary?.primaryCategoryWiseOrder?.totalTonnage ?? 0)
        : managerOrderSummary?.primaryCategoryWiseOrder?.totalCases !== undefined
          ? formatNumber(managerOrderSummary.primaryCategoryWiseOrder.totalCases)
          : '112,456.3';
  const categoryOrderUnit = getMetricLabel(categoryOrderMetric);
  const positionOrderUnit = getMetricLabel(positionOrderMetric);
  const orderCases = getOrderMetricValue(
    managerOrderSummary?.managerOrderSummary,
    positionOrderMetric,
    'order',
  );
  const validationCases = getOrderMetricValue(
    managerOrderSummary?.managerOrderSummary,
    positionOrderMetric,
    'validation',
  );
  const validationPercentage =
    orderCases > 0 ? clampPercentage((validationCases / orderCases) * 100) : 0;
  const outletSummaryRows = useMemo<OutletSummary[]>(() => {
    const summary = managerOrderSummary?.outletSummary;

    if (!summary) {
      return OUTLET_SUMMARY.map((item, index) => ({
        ...item,
        color: outletSummaryColors[index % outletSummaryColors.length],
      }));
    }

    return [
      {
        label: 'UPC',
        value: formatNumber(summary.upc.count),
        progress: clampPercentage(summary.upc.percentage) / 100,
        color: colors.success,
      },
      {
        label: 'Zero Order',
        value: formatNumber(summary.zeroOrder.count),
        progress: clampPercentage(summary.zeroOrder.percentage) / 100,
        color: colors.warning,
      },
      {
        label: 'Not Visited',
        value: formatNumber(summary.notVisited.count),
        progress: clampPercentage(summary.notVisited.percentage) / 100,
        color: colors.secondary,
      },
      {
        label: 'Total',
        value: formatNumber(summary.total.count),
        progress: clampPercentage(summary.total.percentage) / 100,
        color: colors.info,
      },
    ];
  }, [
    colors.info,
    colors.secondary,
    colors.success,
    colors.warning,
    managerOrderSummary,
    outletSummaryColors,
  ]);
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

  const fetchManagerStats = async (range = summaryDateRange) => {
    try {
      const response = await homeService.getManagerStats({
        startDate: formatRouteDate(range.startDate),
        endDate: formatRouteDate(range.endDate),
      });

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

  const fetchManagerOrderSummary = async () => {
    try {
      const response = await homeService.getManagerOrderSummary();

      if (response.success && response.data) {
        setManagerOrderSummary(response.data as ManagerOrderSummaryResponse);
      }
    } catch (error) {
      console.warn('Failed to load manager order summary', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchManagerStats(summaryDateRange);
    await fetchManagerOrderSummary();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchManagerStats(summaryDateRange);
  }, [summaryStartRouteDate, summaryEndRouteDate]);

  useEffect(() => {
    fetchManagerTarget();
    fetchManagerOrderSummary();
  }, []);

  const openSummaryDatePicker = () => {
    setShowSummaryDatePicker(true);
  };

  const renderMetricToggle = (value: TargetMetric, onChange: (metric: TargetMetric) => void) => (
    <View style={styles.metricToggle}>
      {METRIC_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          activeOpacity={0.82}
          onPress={() => onChange(option.value)}
          style={[styles.metricToggleItem, value === option.value && styles.metricToggleItemActive]}
        >
          <AppText
            style={[
              styles.metricToggleText,
              value === option.value && styles.metricToggleTextActive,
            ]}
          >
            {option.label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ManagerDatePickerModal
        visible={showSummaryDatePicker}
        value={summaryDateRange.startDate}
        rangeValue={summaryDateRange}
        mode="range"
        title="Select summary date range"
        onClose={() => setShowSummaryDatePicker(false)}
        onApply={() => {}}
        onApplyRange={setSummaryDateRange}
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
          <TouchableOpacity
            style={styles.dateHeader}
            activeOpacity={0.82}
            onPress={openSummaryDatePicker}
          >
            <View style={styles.dateTitleRow}>
              <Ionicons name="calendar-number-outline" size={16} color={colors.primary} />
              <View style={styles.headerText}>
                <AppText style={styles.dateLabel}>User & Call Summary</AppText>
                <AppText style={styles.cardMeta}>{summaryDateRangeLabel}</AppText>
              </View>
            </View>
            <View style={styles.dateAction}>
              <AppText style={styles.refreshedText}>Change range</AppText>
              <Ionicons name="chevron-down" size={14} color={colors.textQuaternary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>User Summary</AppText>
              <AppText style={styles.cardMeta}>{summaryDateRangeLabel}</AppText>
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
          const sectionMetric = index === 0 ? primaryTargetMetric : uboTargetMetric;
          const sectionMetricUnit = getMetricLabel(sectionMetric);
          const targetMetric =
            index === 0
              ? getManagerTargetMetric(managerTarget, sectionMetric)
              : {
                  targetValue: 0,
                  achievedValue: 0,
                  remainingValue: 0,
                  percentage: 0,
                };
          const targetMetricValue = `${formatNumber(targetMetric.achievedValue)} ${sectionMetricUnit}`;
          const targetMetricHint =
            index === 0 && targetMetric.targetValue > 0
              ? `Only ${formatNumber(targetMetric.remainingValue)} more ${sectionMetricUnit} to achieve your target`
              : target.hint;

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
              {renderMetricToggle(
                sectionMetric,
                index === 0 ? setPrimaryTargetMetric : setUboTargetMetric,
              )}
              <Gauge
                percentage={index === 0 ? targetMetric.percentage : target.percentage}
                value={index === 0 ? targetMetricValue : `0 ${sectionMetricUnit}`}
                color={index === 0 ? colors.success : colors.border}
                colors={colors}
              />
              <View style={[styles.targetHint, index === 1 && styles.targetHintMuted]}>
                <Ionicons
                  name={index === 0 ? 'bulb-outline' : 'information-circle-outline'}
                  size={14}
                  color={index === 0 ? colors.primaryContrast : colors.textTertiary}
                />
                <AppText style={[styles.targetHintText, index === 1 && styles.targetHintTextMuted]}>
                  {targetMetricHint}
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
          {renderMetricToggle(categoryOrderMetric, setCategoryOrderMetric)}
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
                    <AppText style={styles.legendValue}>
                      {item.metricValue} {categoryOrderUnit}
                    </AppText>
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
          {renderMetricToggle(positionOrderMetric, setPositionOrderMetric)}
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
              <View style={[styles.statusDot, { backgroundColor: orderProgressColor }]} />
              <AppText style={styles.cardMeta}>Order</AppText>
            </View>
            <View style={styles.progressLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: validationProgressColor }]} />
              <AppText style={styles.cardMeta}>Validation</AppText>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: '100%', backgroundColor: orderProgressColor }]}
            />
            <AppText style={styles.progressText}>
              {formatNumber(orderCases)} {positionOrderUnit}
            </AppText>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${validationPercentage}%`, backgroundColor: validationProgressColor },
              ]}
            />
            <AppText style={styles.progressText}>
              {formatNumber(validationCases)} {positionOrderUnit}
            </AppText>
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
                PC: {formatNumber(outletProductivity?.pc ?? 0)} | TC:{' '}
                {formatNumber(outletProductivity?.tc ?? 0)}
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
