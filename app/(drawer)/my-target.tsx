import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

const { width: screenWidth } = Dimensions.get('window');

export default function TargetDashboard() {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'lastMonth' | 'currentMonth'>(
    'currentMonth',
  );

  // Data for Last Month
  const lastMonthData = {
    progress: 0.7,
    achieved: 1,
    target: 150,
    remaining: 149,
    rrr: 68,
    crr: 0.04,
    growth: -0.6,
    weeklyData: [
      { week: 'Week 1', progress: 0.1, date: 'Mar 1-7' },
      { week: 'Week 2', progress: 0.2, date: 'Mar 8-14' },
      { week: 'Week 3', progress: 0.4, date: 'Mar 15-21' },
      { week: 'Week 4', progress: 0.7, date: 'Mar 22-28' },
    ],
    lmtd: 0.7,
    mtd: 0.7,
    crrValue: 0.7,
    improvement: 0,
  };

  // Data for Current Month
  const currentMonthData = {
    progress: 1.3,
    achieved: 2,
    target: 150,
    remaining: 148,
    rrr: 74,
    crr: 0.07,
    growth: 0.7,
    weeklyData: [
      { week: 'Week 1', progress: 0.3, date: 'Apr 1-7' },
      { week: 'Week 2', progress: 0.5, date: 'Apr 8-14' },
      { week: 'Week 3', progress: 0.8, date: 'Apr 15-21' },
      { week: 'Week 4', progress: 1.3, date: 'Apr 22-28' },
    ],
    lmtd: 0.7,
    mtd: 1.3,
    crrValue: 1.3,
    improvement: 0.6,
  };

  const currentData = selectedPeriod === 'currentMonth' ? currentMonthData : lastMonthData;

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
              marginTop: 24,
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

        {/* Progress Card */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: -24,
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
                    {currentData.achieved}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>TARGET</Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary }}>
                    {currentData.target}
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
                  {currentData.remaining} remaining to achieve target
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
              {currentData.rrr}%
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
              Repeat Rate Ratio
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
              {currentData.crr.toFixed(3)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>
              Conversion Rate Ratio
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
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 0.5 }}>
                PERFORMANCE TREND
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}
              >
                Weekly Progress
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
            </View>
          </View>

          <AreaChart
            data={chartData}
            color={selectedPeriod === 'currentMonth' ? colors.primary : colors.textSecondary}
          />

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
          </View>
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
            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>as of 28 Apr 2024</Text>
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
                    {currentData.lmtd}%
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
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>CRR</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                    {currentData.lmtd}%
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
                    {currentData.mtd}%
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
                      {currentData.growth}% growth
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>CRR</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.success }}>
                    {currentData.crrValue}%
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
                  +{currentData.improvement}% improvement
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
                  {currentData.remaining}
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
                    width: `${(currentData.achieved / currentData.target) * 100}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                {Math.round((currentData.achieved / currentData.target) * 100)}%
              </Text>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
