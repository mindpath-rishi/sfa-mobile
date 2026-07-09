import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText, Skeleton } from '@/core/components';
import { useAuthStore } from '@/core/store/auth.store';
import { homeService } from '@/features/home/services/home.service';
import type {
  ManagerOrderSummaryResponse,
  ManagerTargetResponse,
  TargetMetric,
} from '@/features/home/services/home.service';
import { categoryService, type Category } from '@/shared/services/category.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
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

type SummaryDateFilter = 'today' | 'yesterday' | 'mtd' | 'custom';

const SUMMARY_DATE_FILTERS: { value: SummaryDateFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'mtd', label: 'MTD' },
  { value: 'custom', label: 'Custom' },
];

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

const OUTLET_SUMMARY: Omit<OutletSummary, 'color'>[] = [
  { label: 'UTC', value: '0', progress: 0 },
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
const TARGET_NOT_CONFIGURED_HINT = 'Target has not been configured for this period';

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

const getManagerUboTargetMetric = (target: ManagerTargetResponse | null) => {
  const targetValue = Number(target?.uboTarget || 0);
  const achievedValue = Number(target?.uboAchievement || 0);
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

function OutletCircleMetric({
  label,
  percentage,
  color,
  colors,
}: {
  label: string;
  percentage: number;
  color: string;
  colors: any;
}) {
  const size = 66;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clampPercentage(percentage);

  return (
    <View style={stylesBase.outletCircleMetric}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={colors.backgroundTertiary}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * circumference} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={stylesBase.outletCircleValueWrap}>
          <AppText style={[stylesBase.outletCircleValue, { color: colors.textPrimary }]}>
            {Math.round(progress)}%
          </AppText>
        </View>
      </View>
      <AppText style={[stylesBase.outletCircleLabel, { color: colors.textSecondary }]}>
        {label}
      </AppText>
    </View>
  );
}

function ManagerSkeleton({
  colors,
  styles,
}: {
  colors: any;
  styles: ReturnType<typeof createManagerStyles>;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      <View style={styles.headerPanel}>
        <View style={styles.skeletonFilterRow}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} width={72} height={34} borderRadius={18} />
          ))}
        </View>
      </View>

      <View style={styles.skeletonSectionHeader}>
        <View style={styles.headerText}>
          <Skeleton width="46%" height={16} borderRadius={8} />
          <Skeleton width="72%" height={11} borderRadius={6} style={styles.skeletonLineGap} />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        {Array.from({ length: 2 }).map((_, cardIndex) => (
          <View key={cardIndex} style={styles.card}>
            <View style={styles.cardHeader}>
              <Skeleton width="42%" height={16} borderRadius={8} />
              <Skeleton width={cardIndex === 0 ? 92 : 18} height={18} borderRadius={9} />
            </View>
            {Array.from({ length: cardIndex === 0 ? 4 : 2 }).map((_, rowIndex) => (
              <View key={rowIndex} style={styles.skeletonSummaryRow}>
                <Skeleton width="48%" height={12} borderRadius={6} />
                <Skeleton width={34} height={12} borderRadius={6} />
              </View>
            ))}
            <Skeleton width="100%" height={cardIndex === 0 ? 22 : 48} borderRadius={10} />
          </View>
        ))}
      </View>

      <View style={styles.skeletonSectionHeader}>
        <View style={styles.headerText}>
          <Skeleton width="50%" height={16} borderRadius={8} />
          <Skeleton width="64%" height={11} borderRadius={6} style={styles.skeletonLineGap} />
        </View>
        <Skeleton width={56} height={22} borderRadius={7} />
      </View>

      {Array.from({ length: 2 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerText}>
              <Skeleton width="74%" height={15} borderRadius={8} />
              <Skeleton width="46%" height={10} borderRadius={5} style={styles.skeletonLineGap} />
            </View>
            <Skeleton width={20} height={20} variant="circle" />
          </View>
          <Skeleton width="100%" height={32} borderRadius={8} />
          <Skeleton width={180} height={104} borderRadius={52} style={styles.skeletonGauge} />
          <Skeleton width="100%" height={34} borderRadius={10} />
        </View>
      ))}

      <View style={styles.skeletonSectionHeader}>
        <View style={styles.headerText}>
          <Skeleton width="42%" height={16} borderRadius={8} />
          <Skeleton width="70%" height={11} borderRadius={6} style={styles.skeletonLineGap} />
        </View>
        <Skeleton width={38} height={22} borderRadius={7} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Skeleton width="58%" height={15} borderRadius={8} />
          <Skeleton width={38} height={20} borderRadius={7} />
        </View>
        <Skeleton width="100%" height={32} borderRadius={8} />
        <View style={styles.skeletonChartRow}>
          <Skeleton width={116} height={116} variant="circle" />
          <View style={styles.legend}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} width="100%" height={18} borderRadius={8} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Skeleton width="44%" height={15} borderRadius={8} />
          <Skeleton width={38} height={20} borderRadius={7} />
        </View>
        <Skeleton width="100%" height={32} borderRadius={8} />
        <View style={[styles.routeInfo, { backgroundColor: colors.backgroundSecondary }]}>
          <Skeleton width={34} height={34} variant="circle" />
          <View style={styles.headerText}>
            <Skeleton width="36%" height={12} borderRadius={6} />
            <Skeleton width="58%" height={10} borderRadius={5} style={styles.skeletonLineGap} />
          </View>
        </View>
        <Skeleton width="100%" height={28} borderRadius={7} />
        <Skeleton width="74%" height={28} borderRadius={7} />
      </View>
    </ScrollView>
  );
}

export default function ManagerHomeScreen() {
  const { colors } = useTheme();
  const styles = createManagerStyles(colors);
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [summaryDateRange, setSummaryDateRange] = useState(getCurrentMonthRange);
  const [summaryDateFilter, setSummaryDateFilter] = useState<SummaryDateFilter>('mtd');
  const [showSummaryDatePicker, setShowSummaryDatePicker] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummaryData>(INITIAL_USER_SUMMARY);
  const [callSummary, setCallSummary] = useState<CallSummaryData>(INITIAL_CALL_SUMMARY);
  const [managerOrderSummary, setManagerOrderSummary] =
    useState<ManagerOrderSummaryResponse | null>(null);
  const [primaryCategories, setPrimaryCategories] = useState<Category[]>([]);
  const [primaryTargetMetric, setPrimaryTargetMetric] = useState<TargetMetric>('cases');
  const [uboTargetMetric, setUboTargetMetric] = useState<TargetMetric>('cases');
  const [categoryOrderMetric, setCategoryOrderMetric] = useState<TargetMetric>('cases');
  const [positionOrderMetric, setPositionOrderMetric] = useState<TargetMetric>('cases');
  const [managerTarget, setManagerTarget] = useState<ManagerTargetResponse | null>(null);
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

  const selectedRouteDate = formatLocalApiDate(new Date());
  const summaryStartRouteDate = formatLocalApiDate(summaryDateRange.startDate);
  const summaryEndRouteDate = formatLocalApiDate(summaryDateRange.endDate);
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
      return primaryCategories.map((item, index) => ({
        label: item.name,
        value: 0,
        metricValue: '0',
        color: categoryOrderColors[index % categoryOrderColors.length],
      }));
    }

    return categories.map((item, index) => ({
      label: item.category,
      value: getCategoryPercentage(item, categoryOrderMetric),
      metricValue: formatNumber(getCategoryMetric(item, categoryOrderMetric)),
      color: categoryOrderColors[index % categoryOrderColors.length],
    }));
  }, [categoryOrderColors, categoryOrderMetric, managerOrderSummary, primaryCategories]);
  const categoryOrderTotal =
    categoryOrderMetric === 'value'
      ? formatNumber(managerOrderSummary?.primaryCategoryWiseOrder?.totalValue ?? 0)
      : categoryOrderMetric === 'tonnage'
        ? formatNumber(managerOrderSummary?.primaryCategoryWiseOrder?.totalTonnage ?? 0)
        : formatNumber(managerOrderSummary?.primaryCategoryWiseOrder?.totalCases ?? 0);
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
        label: 'UTC',
        value: formatNumber(summary.utc?.count ?? summary.productivity?.tc ?? callSummary.tc),
        progress:
          clampPercentage(
            summary.utc?.percentage ??
              (summary.total.count > 0
                ? ((summary.productivity?.tc ?? callSummary.tc) / summary.total.count) * 100
                : 0),
          ) / 100,
        color: colors.successDark,
      },
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
    colors.successDark,
    colors.warning,
    callSummary.pc,
    callSummary.productivity,
    callSummary.tc,
    managerOrderSummary,
    outletSummaryColors,
  ]);
  const outletProductivity = clampPercentage(
    managerOrderSummary?.outletSummary?.productivity?.percentage ?? callSummary.productivity,
  );
  const outletCovered = clampPercentage(
    managerOrderSummary?.outletSummary?.utc?.percentage ?? callSummary.covered,
  );
  const outletOrdered = clampPercentage(
    managerOrderSummary?.outletSummary?.ordered?.percentage ??
      managerOrderSummary?.outletSummary?.upc?.percentage ??
      0,
  );
  const outletPc = managerOrderSummary?.outletSummary?.productivity?.pc ?? callSummary.pc;
  const outletTc = managerOrderSummary?.outletSummary?.productivity?.tc ?? callSummary.tc;
  // const primaryTargetSnapshot = getManagerTargetMetric(managerTarget, primaryTargetMetric);
  const primaryTargetSnapshot = getManagerTargetMetric(managerTarget, primaryTargetMetric);

  const uboTargetSnapshot = getManagerUboTargetMetric(managerTarget);
  const managerInitials =
    user?.name
      ?.split(' ')
      ?.map((word: string) => word[0])
      ?.join('')
      ?.toUpperCase()
      ?.slice(0, 2) || 'FM';

  const TARGETS = [
    {
      title: 'User wise Primary Category Targets',
      period: getCurrentMonthPeriod(),
      hint: TARGET_NOT_CONFIGURED_HINT,
      type: 'primary',
    },
    {
      title: 'User Wise Target UBO',
      period: getCurrentMonthPeriod(),
      hint: TARGET_NOT_CONFIGURED_HINT,
      type: 'ubo',
    },
  ];

  const fetchManagerStats = async (range = summaryDateRange) => {
    try {
      const response = await homeService.getManagerStats({
        startDate: formatLocalApiDate(range.startDate),
        endDate: formatLocalApiDate(range.endDate),
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

  const fetchManagerOrderSummary = async (range = summaryDateRange) => {
    try {
      const response = await homeService.getManagerOrderSummary({
        startDate: formatLocalApiDate(range.startDate),
        endDate: formatLocalApiDate(range.endDate),
      });

      if (response.success && response.data) {
        setManagerOrderSummary(response.data as ManagerOrderSummaryResponse);
      }
    } catch (error) {
      console.warn('Failed to load manager order summary', error);
    }
  };

  const fetchPrimaryCategories = async () => {
    try {
      const response = await categoryService.fetchCategory({
        page: 1,
        limit: 100,
        type: 'PARENT',
        status: 'ACTIVE',
      });

      if (response.success && response.data) {
        setPrimaryCategories(response.data as Category[]);
      }
    } catch (error) {
      console.warn('Failed to load primary categories', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchManagerStats(summaryDateRange),
      fetchManagerOrderSummary(summaryDateRange),
      fetchPrimaryCategories(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      try {
        await Promise.all([
          fetchManagerStats(summaryDateRange),
          fetchManagerOrderSummary(summaryDateRange),
        ]);
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      mounted = false;
    };
  }, [summaryStartRouteDate, summaryEndRouteDate]);

  useEffect(() => {
    fetchManagerTarget();
    fetchPrimaryCategories();
  }, []);

  const applySummaryDateFilter = (filter: SummaryDateFilter) => {
    setSummaryDateFilter(filter);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'today') {
      setSummaryDateRange({ startDate: today, endDate: today });
      return;
    }
    if (filter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setSummaryDateRange({ startDate: yesterday, endDate: yesterday });
      return;
    }
    if (filter === 'mtd') {
      setSummaryDateRange({
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: today,
      });
      return;
    }
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

  const renderSectionHeader = (title: string, subtitle: string, badge?: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.headerText}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        <AppText style={styles.sectionSubtitle}>{subtitle}</AppText>
      </View>
      {badge ? <AppText style={styles.sectionBadge}>{badge}</AppText> : null}
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
        onApplyRange={(range) => {
          setSummaryDateFilter('custom');
          setSummaryDateRange(range);
        }}
      />
      {isInitialLoading ? <ManagerSkeleton colors={colors} styles={styles} /> : null}
      {!isInitialLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          <View style={styles.headerPanel}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryFilterRow}
            >
              {SUMMARY_DATE_FILTERS.map((filter) => {
                const active = summaryDateFilter === filter.value;
                return (
                  <TouchableOpacity
                    key={filter.value}
                    activeOpacity={0.82}
                    onPress={() => applySummaryDateFilter(filter.value)}
                    style={[styles.summaryFilterChip, active && styles.summaryFilterChipActive]}
                  >
                    <AppText
                      style={[styles.summaryFilterText, active && styles.summaryFilterTextActive]}
                    >
                      {filter.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {renderSectionHeader('Workforce Summary', 'Today and selected-period team activity')}
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
                  // onPress={() =>
                  //   router.push({
                  //     pathname: '/(drawer)/(tabs)/daily-summary/users',
                  //     params: {
                  //       status: item.label.toLowerCase().replace(/\s+/g, '-'),
                  //       date: selectedRouteDate,
                  //     },
                  //   })
                  // }
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
                <MaterialCommunityIcons
                  name="phone-check-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.callCircleRow}>
                <View style={styles.callCircleItem}>
                  <View style={styles.callCircle}>
                    <AppText style={styles.callValue}>{callSummary.productivity}%</AppText>
                  </View>
                  <AppText style={styles.callLabel}>Productivity</AppText>
                </View>
                <View style={styles.callCircleItem}>
                  <View style={styles.callCircleMuted}>
                    <AppText style={styles.callValue}>{callSummary.covered}%</AppText>
                  </View>
                  <AppText style={styles.callLabel}>Covered</AppText>
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

          {renderSectionHeader(
            'Target Performance',
            `${formatNumber(primaryTargetSnapshot.percentage)}% achieved for selected metric`,
            getMetricLabel(primaryTargetMetric),
          )}
          {TARGETS.map((target, index) => {
            const isPrimaryTarget = target.type === 'primary';
            const isUboTarget = target.type === 'ubo';

            const sectionMetric = primaryTargetMetric;
            const sectionMetricUnit = getMetricLabel(sectionMetric);

            const targetMetric = isPrimaryTarget
              ? getManagerTargetMetric(managerTarget, sectionMetric)
              : uboTargetSnapshot;

            const targetMetricValue = isPrimaryTarget
              ? `${formatNumber(targetMetric.achievedValue)} ${sectionMetricUnit}`
              : `${formatNumber(targetMetric.achievedValue)} Outlets`;

            const targetMetricHint = isPrimaryTarget
              ? targetMetric.targetValue > 0
                ? targetMetric.remainingValue > 0
                  ? `Only ${formatNumber(targetMetric.remainingValue)} more ${sectionMetricUnit} to achieve your target`
                  : 'Target achieved for selected metric'
                : target.hint
              : targetMetric.targetValue > 0
                ? targetMetric.remainingValue > 0
                  ? `Only ${formatNumber(targetMetric.remainingValue)} more billed outlets to achieve your UBO target`
                  : 'UBO target achieved'
                : 'No UBO target assigned for current month';

            const content = (
              <>
                <View style={styles.cardHeader}>
                  <View style={styles.headerText}>
                    <AppText style={styles.cardTitle}>{target.title}</AppText>
                    <AppText style={styles.cardMeta}>{target.period}</AppText>
                  </View>
                  <Ionicons
                    name={
                      isPrimaryTarget ? 'chevron-forward-circle-outline' : 'stats-chart-outline'
                    }
                    size={20}
                    color={colors.primary}
                  />
                </View>

                {isPrimaryTarget
                  ? renderMetricToggle(primaryTargetMetric, setPrimaryTargetMetric)
                  : null}

                {isUboTarget ? (
                  <View style={styles.metricToggle}>
                    <View style={[styles.metricToggleItem, styles.metricToggleItemActive]}>
                      <AppText style={[styles.metricToggleText, styles.metricToggleTextActive]}>
                        UBO
                      </AppText>
                    </View>
                  </View>
                ) : null}

                <Gauge
                  percentage={targetMetric.percentage}
                  value={targetMetricValue}
                  color={targetMetric.percentage > 0 ? colors.success : colors.border}
                  colors={colors}
                />

                <View
                  style={[styles.targetHint, !targetMetric.targetValue && styles.targetHintMuted]}
                >
                  <Ionicons
                    name={
                      targetMetric.targetValue > 0 ? 'bulb-outline' : 'information-circle-outline'
                    }
                    size={14}
                    color={
                      targetMetric.targetValue > 0 ? colors.primaryContrast : colors.textTertiary
                    }
                  />
                  <AppText
                    style={[
                      styles.targetHintText,
                      !targetMetric.targetValue && styles.targetHintTextMuted,
                    ]}
                  >
                    {targetMetricHint}
                  </AppText>
                </View>
              </>
            );

            if (isPrimaryTarget) {
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

          {renderSectionHeader(
            'Order Analytics',
            'Category and position-wise order movement',
            'MTD',
          )}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>Primary Category Wise Order</AppText>
              <AppText style={styles.mtdBadge}>MTD</AppText>
            </View>
            {renderMetricToggle(categoryOrderMetric, setCategoryOrderMetric)}
            <View style={styles.chartRow}>
              <DonutChart data={categoryOrders} total={categoryOrderTotal} colors={colors} />
              {categoryOrders.length > 0 ? (
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
              ) : (
                <AppText style={styles.chartEmptyText}>No category order data available</AppText>
              )}
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
                <AppText style={styles.avatarText}>{managerInitials}</AppText>
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
                style={[
                  styles.progressFill,
                  { width: '100%', backgroundColor: orderProgressColor },
                ]}
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

          {renderSectionHeader('Outlet Execution', 'Coverage and zero-order health')}
          <View style={[styles.card, styles.outletSummaryCard]}>
            <View style={styles.cardHeader}>
              <AppText style={styles.cardTitle}>Outlets Summary</AppText>
              <AppText style={styles.mtdBadge}>
                {summaryDateFilter === 'mtd'
                  ? 'MTD'
                  : summaryDateFilter === 'today'
                    ? 'TODAY'
                    : summaryDateFilter === 'yesterday'
                      ? 'YESTERDAY'
                      : 'CUSTOM'}
              </AppText>
            </View>
            <View style={styles.outletSummaryContent}>
              <View style={styles.outletSummaryList}>
                {outletSummaryRows.map((item) => (
                  <View key={item.label} style={styles.outletCompactRow}>
                    <View style={styles.outletCompactHeader}>
                      <AppText style={styles.outletCompactLabel}>{item.label}</AppText>
                      <AppText style={styles.outletCompactValue}>{item.value}</AppText>
                    </View>
                    <View style={styles.outletProgressTrack}>
                      <View
                        style={[
                          styles.outletProgressFill,
                          { width: `${item.progress * 100}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.outletMetricPanel}>
                <AppText style={styles.outletMetricTitle}>Productivity</AppText>
                <View style={styles.productivityMetricRow}>
                  <View style={styles.productivityCounts}>
                    <AppText style={styles.productivityCountLabel}>PC</AppText>
                    <AppText style={styles.productivityCountValue}>
                      {formatNumber(outletPc)}
                    </AppText>
                    <AppText style={styles.productivityCountLabel}>TC</AppText>
                    <AppText style={styles.productivityCountValue}>
                      {formatNumber(outletTc)}
                    </AppText>
                  </View>
                  <OutletCircleMetric
                    label=""
                    percentage={outletProductivity}
                    color={colors.success}
                    colors={colors}
                  />
                </View>
                <View style={styles.outletBottomMetrics}>
                  <OutletCircleMetric
                    label="Covered"
                    percentage={outletCovered}
                    color={colors.secondary}
                    colors={colors}
                  />
                  <OutletCircleMetric
                    label="Ordered"
                    percentage={outletOrdered}
                    color={colors.error}
                    colors={colors}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
