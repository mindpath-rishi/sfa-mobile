import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  homeService,
  type SalesmanPocketTargetResponse,
  type TargetMetric,
} from '@/features/home/services/home.service';
import { formatLocalApiDate } from '@/shared/utils/date.utils';

const { width: screenWidth } = Dimensions.get('window');

type TargetDashboardData = {
  progress: number;
  achieved: number;
  target: number;
  remaining: number;
  rrr: number;
  crr: number;
  growth: number;
  weeklyData: { week: string; progress: number; date: string }[];
  lmtd: number;
  mtd: number;
  crrValue: number;
  improvement: number;
  asOfLabel: string;
};

const metricOptions: { value: TargetMetric; label: string }[] = [
  { value: 'tonnage', label: 'Tonnage' },
  { value: 'cases', label: 'Cases' },
  { value: 'value', label: 'Value' },
];

const metricLabels: Record<TargetMetric, string> = {
  cases: 'Cases',
  tonnage: 'Tonnage',
  value: 'Value',
};

const emptyTargetData: TargetDashboardData = {
  progress: 0,
  achieved: 0,
  target: 0,
  remaining: 0,
  rrr: 0,
  crr: 0,
  growth: 0,
  weeklyData: [
    { week: 'Week 1', progress: 0, date: '' },
    { week: 'Week 2', progress: 0, date: '' },
    { week: 'Week 3', progress: 0, date: '' },
    { week: 'Week 4', progress: 0, date: '' },
  ],
  lmtd: 0,
  mtd: 0,
  crrValue: 0,
  improvement: 0,
  asOfLabel: '',
};

const buildWeeklyData = (progress: number) =>
  [0.25, 0.5, 0.75, 1].map((factor, index) => ({
    week: `Week ${index + 1}`,
    progress: Number((progress * factor).toFixed(2)),
    date: '',
  }));

const formatNumber = (value: number, metric: TargetMetric) => {
  const safeValue = Number.isFinite(value) ? value : 0;

  if (metric === 'value') {
    return Math.round(safeValue).toLocaleString('en-IN');
  }

  return safeValue.toLocaleString('en-IN', {
    maximumFractionDigits: metric === 'tonnage' ? 2 : 0,
  });
};

const formatPercent = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(2)).toString() : '0';

const formatDateLabel = (date?: string) => {
  const parsedDate = date ? new Date(date) : new Date();

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const mapTargetResponse = (
  data: SalesmanPocketTargetResponse | undefined,
  metric: TargetMetric,
): TargetDashboardData => {
  const target = data?.target;
  const selected = target?.selected;
  const achieved = Number(
    selected?.achieved ??
      (metric === 'tonnage'
        ? target?.achievedTonnage
        : metric === 'value'
          ? target?.achievedValue
          : target?.achievedCases) ??
      0,
  );
  const targetValue = Number(
    selected?.target ??
      (metric === 'tonnage'
        ? target?.targetTonnage
        : metric === 'value'
          ? target?.targetValue
          : target?.targetCases) ??
      0,
  );
  const progress = Number(selected?.achievementPercentage ?? target?.achievementPercentage ?? 0);
  const remaining = Number(
    selected?.remaining ??
      (metric === 'tonnage'
        ? target?.remainingTonnage
        : metric === 'value'
          ? target?.remainingValue
          : target?.remainingCases) ??
      Math.max(targetValue - achieved, 0),
  );
  const rrr = Number(selected?.rrr ?? target?.rrr ?? 0);
  const crr = Number(selected?.crr ?? target?.crr ?? 0);

  return {
    progress,
    achieved,
    target: targetValue,
    remaining,
    rrr: Number(rrr.toFixed(2)),
    crr: Number(crr.toFixed(2)),
    growth: Number(selected?.improvement ?? progress),
    weeklyData: buildWeeklyData(progress),
    lmtd: Number(selected?.lmtd ?? 0),
    mtd: Number(selected?.mtd ?? progress),
    crrValue: Number(crr.toFixed(2)),
    improvement: Number(selected?.improvement ?? 0),
    asOfLabel: formatDateLabel(data?.endDate),
  };
};

export default function TargetDashboard() {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'lastMonth' | 'currentMonth'>(
    'currentMonth',
  );
  const [selectedMetric, setSelectedMetric] = useState<TargetMetric>('cases');
  const [currentMonthData, setCurrentMonthData] = useState<TargetDashboardData>(emptyTargetData);
  const [lastMonthData, setLastMonthData] = useState<TargetDashboardData>(emptyTargetData);
  const [loading, setLoading] = useState(true);

  const loadTarget = useCallback(async () => {
    setLoading(true);

    try {
      const now = new Date();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const lastMonthDate = formatLocalApiDate(lastMonthEnd);
      const [targetResponse, lastTargetResponse] = await Promise.all([
        homeService.getSalesmanPocketAndTarget({ metric: selectedMetric }),
        homeService.getSalesmanPocketAndTarget({ date: lastMonthDate, metric: selectedMetric }),
      ]);

      setCurrentMonthData(mapTargetResponse(targetResponse.data, selectedMetric));
      setLastMonthData(mapTargetResponse(lastTargetResponse.data, selectedMetric));
    } catch (error) {
      console.warn('Failed to load target dashboard:', error);
      setCurrentMonthData(emptyTargetData);
      setLastMonthData(emptyTargetData);
    } finally {
      setLoading(false);
    }
  }, [selectedMetric]);

  useFocusEffect(
    useCallback(() => {
      loadTarget();
    }, [loadTarget]),
  );

  const currentData = selectedPeriod === 'currentMonth' ? currentMonthData : lastMonthData;
  const selectedMetricLabel = metricLabels[selectedMetric];
  const targetProgress =
    currentData.target > 0 ? Math.min((currentData.achieved / currentData.target) * 100, 100) : 0;

  // Custom Area Chart Component
  const AreaChart = ({ data, color, height = 200, width = screenWidth - 72 }) => {
    const padding = { top: 20, bottom: 30, left: 35, right: 20 };
    const chartHeight = height - padding.top - padding.bottom;
    const chartWidth = width - padding.left - padding.right;

    const maxValue = Math.max(...data.map((d) => d.value), 2);
    const minValue = 0;

    const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) =>
      height - padding.bottom - ((value - minValue) / (maxValue - minValue)) * chartHeight;

    let areaPath = '';
    let linePath = '';
    let points: { x: number; y: number }[] = [];

    data.forEach((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      points.push({ x, y });

      if (index === 0) {
        areaPath += `M ${x} ${y}`;
        linePath += `M ${x} ${y}`;
      } else {
        areaPath += ` L ${x} ${y}`;
        linePath += ` L ${x} ${y}`;
      }
    });

    areaPath += ` L ${getX(data.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

    return (
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </SvgGradient>
        </Defs>

        {[0, 0.5, 1, 1.5, 2].map((value) => {
          const y = getY(value);
          if (y >= padding.top && y <= height - padding.bottom) {
            return (
              <G key={value}>
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize={10}
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {value}%
                </SvgText>
              </G>
            );
          }
          return null;
        })}

        <Path d={areaPath} fill="url(#areaGradient)" />
        <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" />

        {points.map((point, index) => (
          <G key={index}>
            <Circle cx={point.x} cy={point.y} r={4} fill={color} stroke="#FFF" strokeWidth={2} />
            <SvgText
              x={point.x}
              y={point.y - 12}
              fontSize={11}
              fill={color}
              fontWeight="bold"
              textAnchor="middle"
            >
              {data[index].value}%
            </SvgText>
            <SvgText
              x={point.x}
              y={height - padding.bottom + 20}
              fontSize={11}
              fill="#6B7280"
              textAnchor="middle"
            >
              {data[index].label}
            </SvgText>
          </G>
        ))}
      </Svg>
    );
  };

  // Circular Progress Component
  const CircularProgress = ({
    percentage,
    size = 120,
    color,
  }: {
    percentage: number;
    size?: number;
    color: string;
  }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + '20'}
          strokeWidth={8}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
        <SvgText
          x={size / 2}
          y={size / 2 - 5}
          fontSize={28}
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
        >
          {percentage}%
        </SvgText>
        <SvgText x={size / 2} y={size / 2 + 15} fontSize={11} fill="#6B7280" textAnchor="middle">
          Progress
        </SvgText>
      </Svg>
    );
  };

  const chartData = currentData.weeklyData.map((item) => ({
    label: item.week,
    value: item.progress,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 16,
            paddingBottom: 40,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* Period Selector - Working Tabs */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface + '15',
              borderRadius: 16,
              padding: 4,
              borderWidth: 1,
              borderColor: colors.surface + '10',
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: selectedPeriod === 'lastMonth' ? colors.surface : 'transparent',
                shadowColor: selectedPeriod === 'lastMonth' ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => setSelectedPeriod('lastMonth')}
            >
              <Text
                style={{
                  color: selectedPeriod === 'lastMonth' ? colors.primary : colors.surface,
                  fontWeight: selectedPeriod === 'lastMonth' ? '700' : '500',
                  fontSize: 14,
                }}
              >
                Last Month
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: selectedPeriod === 'currentMonth' ? colors.surface : 'transparent',
                shadowColor: selectedPeriod === 'currentMonth' ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
              onPress={() => setSelectedPeriod('currentMonth')}
            >
              <Text
                style={{
                  color: selectedPeriod === 'currentMonth' ? colors.primary : colors.surface,
                  fontWeight: selectedPeriod === 'currentMonth' ? '700' : '500',
                  fontSize: 14,
                }}
              >
                Current Month
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 16,
            marginTop: -24,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.borderLight,
            backgroundColor: colors.surface,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          {metricOptions.map((option) => {
            const isSelected = option.value === selectedMetric;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.82}
                onPress={() => setSelectedMetric(option.value)}
                style={{
                  flex: 1,
                  minHeight: 34,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 8,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: isSelected ? colors.primaryContrast : colors.textSecondary,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress Card */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 1,
            }}
          >
            {selectedPeriod === 'currentMonth' ? 'CURRENT' : 'LAST'} MONTH'S PROGRESS
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
            Showing target by {selectedMetricLabel}
          </Text>

          {loading && selectedPeriod === 'currentMonth' && (
            <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 24 }}>
            <CircularProgress
              percentage={currentData.progress}
              color={selectedPeriod === 'currentMonth' ? colors.primary : colors.textSecondary}
            />

            <View style={{ flex: 1, gap: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>ACHIEVED</Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: colors.success }}>
                    {formatNumber(currentData.achieved, selectedMetric)}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>TARGET</Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
                    {formatNumber(currentData.target, selectedMetric)}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: colors.warning + '08',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="flag-outline" size={16} color={colors.warning} />
                <Text style={{ color: colors.warning, fontSize: 12, fontWeight: '500' }}>
                  {formatNumber(currentData.remaining, selectedMetric)} {selectedMetricLabel}{' '}
                  remaining to achieve target
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16 }}>
          <LinearGradient
            colors={[colors.primary + '08', colors.primary + '02']}
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.primary + '10',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.primary + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <FontAwesome5 name="chart-line" size={22} color={colors.primary} />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 0.5 }}>
              RRR
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 4 }}>
              {formatNumber(currentData.rrr, selectedMetric)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
              Required Run Rate
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={[colors.success + '08', colors.success + '02']}
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.success + '10',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.success + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <MaterialIcons name="trending-up" size={22} color={colors.success} />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 0.5 }}>
              CRR
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.success, marginTop: 4 }}>
              {formatNumber(currentData.crr, selectedMetric)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
              Current Run Rate
            </Text>
          </LinearGradient>
        </View>

        {/* Trend Chart */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            {/* <View>
              <Text style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 0.5 }}>
                PERFORMANCE TREND
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}
              >
                Weekly Progress
              </Text>
            </View> */}
            {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons
                name={currentData.growth >= 0 ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={currentData.growth >= 0 ? colors.success : colors.error}
              />
              <Text
                style={{
                  color: currentData.growth >= 0 ? colors.success : colors.error,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {currentData.growth >= 0 ? '+' : ''}
                {currentData.growth}%
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>vs last month</Text>
            </View> */}
          </View>

          {/* <AreaChart
            data={chartData}
            color={selectedPeriod === 'currentMonth' ? colors.primary : colors.textSecondary}
          /> */}
          {/* 
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor:
                    selectedPeriod === 'currentMonth' ? colors.primary : colors.textSecondary,
                }}
              />
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Weekly Progress (%)</Text>
            </View>
          </View> */}
        </View>

        {/* Comparison Table */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            backgroundColor: colors.surface,
            borderRadius: 24,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
              LMTD vs MTD
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
              {currentData.asOfLabel ? `as of ${currentData.asOfLabel}` : ''}
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {/* LMTD Row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.background,
                borderRadius: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
                    LMTD
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                    {formatPercent(currentData.lmtd)}%
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="remove-outline" size={12} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginLeft: 2 }}>
                      Baseline
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>ACH %</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                    {formatPercent(currentData.lmtd)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* MTD Row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.primary + '05',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.primary + '10',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
                    MTD
                  </Text>
                </View>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}>
                    {formatPercent(currentData.mtd)}%
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons
                      name={currentData.growth >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={currentData.growth >= 0 ? colors.success : colors.error}
                    />
                    <Text
                      style={{
                        color: currentData.growth >= 0 ? colors.success : colors.error,
                        fontSize: 10,
                        marginLeft: 2,
                      }}
                    >
                      {currentData.growth >= 0 ? '+' : ''}
                      {formatPercent(currentData.growth)}% growth
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>CRR</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>
                    {formatNumber(currentData.crrValue, selectedMetric)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Improvement Badge */}
          {currentData.improvement > 0 && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.divider,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.success + '15',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="trending-up" size={14} color={colors.success} />
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: '600' }}>
                  +{formatPercent(currentData.improvement)}% improvement
                </Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>in Conversion Rate</Text>
            </View>
          )}
        </View>

        {/* Motivational Card */}
        <LinearGradient
          colors={[colors.primary + '12', colors.primary + '06']}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 16,
            padding: 20,
            borderRadius: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.primary + '15',
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Ionicons name="rocket" size={28} color={colors.primary} />
          </View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            {currentData.remaining === 0 ? 'Target Achieved! 🎉' : "You're almost there! 🎯"}
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 8 }}
          >
            {currentData.remaining > 0 ? (
              <>
                Only{' '}
                <Text style={{ color: colors.primary, fontWeight: '700' }}>
                  {formatNumber(currentData.remaining, selectedMetric)} {selectedMetricLabel}
                </Text>{' '}
                more to reach your target
              </>
            ) : (
              'Congratulations on achieving your target!'
            )}
          </Text>
          {currentData.remaining > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
                gap: 8,
                width: '100%',
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: colors.primary + '15',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${targetProgress}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                {Math.round(targetProgress)}%
              </Text>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
