// src/screens/PocketMISScreen.tsx

// INSTALL FIRST
// expo install @react-native-community/datetimepicker expo-linear-gradient

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '@/features/home/services/home.service';
import { ManagerDatePickerModal } from '@/features/home/components/models/ManagerDatePickerModal';

const { width } = Dimensions.get('window');

// Typography scale - REDUCED SIZES for consistency
const TYPOGRAPHY = {
  h1: { size: 24, weight: '800' as const, lineHeight: 30 },
  h2: { size: 20, weight: '700' as const, lineHeight: 26 },
  h3: { size: 16, weight: '700' as const, lineHeight: 22 },
  h4: { size: 14, weight: '600' as const, lineHeight: 20 },
  body: { size: 13, weight: '400' as const, lineHeight: 18 },
  bodySmall: { size: 12, weight: '400' as const, lineHeight: 16 },
  caption: { size: 10, weight: '400' as const, lineHeight: 14 },
  button: { size: 12, weight: '600' as const, lineHeight: 16 },
  stat: { size: 20, weight: '800' as const, lineHeight: 26 },
  statSmall: { size: 18, weight: '700' as const, lineHeight: 24 },
  time: { size: 12, weight: '500' as const, lineHeight: 16 },
};

const defaultSummaryData = {
  retailing: 0,
  leaveAbsent: '0 / 0',
  officialWork: 0,
  total: 0,
  avgRetailingTime: '--',
  avgTotalTime: '--',
};

const defaultPerformanceData = {
  tc: 0,
  pc: 0,
  upc: 0,
  utc: 0,
  lpc: 0,
  avgFirstCall: '--',
  avgFirstPC: '--',
  avgTC: 0,
  avgPC: 0,
  achievement: 0,
  target: 0,
};

const defaultProductData = {
  sc: 0,
  tc: 0,
  pc: 0,
  netValue: 0,
  cases: 0,
  lpc: 0,
  categories: [] as {
    name: string;
    value: number;
    pcs: number;
    cases: number;
    growth: number;
  }[],
};

type PocketFilter = 'today' | 'week' | 'month' | 'custom';

type DayWiseSummaryItem = {
  date: string;
  label: string;
  retailing: number;
  officialWork: number;
  leave: number;
  absent: number;
  totalActivities: number;
  tc: number;
  pc: number;
  upc: number;
  netValue: number;
  cases: number;
  firstCallTime?: string | null;
  firstPcTime?: string | null;
};

const filterOptions: { value: PocketFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'Current Month' },
  { value: 'custom', label: 'Custom Date' },
];

const formatApiDate = (date: Date) => date.toISOString().split('T')[0];
const formatNumber = (value: number, decimals = 0) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getFilterRange = (
  filter: PocketFilter,
  customRange: { startDate: Date; endDate: Date },
) => {
  const today = startOfDay(new Date());

  if (filter === 'today') {
    return { startDate: today, endDate: today };
  }

  if (filter === 'week') {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());
    return { startDate, endDate: today };
  }

  if (filter === 'month') {
    return {
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: today,
    };
  }

  return customRange;
};

export default function PocketMISScreen() {
  const [showProductWiseModal, setShowProductWiseModal] = useState(false);
  const [showDayWiseModal, setShowDayWiseModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PocketFilter>('month');
  const [selectedCategory, setSelectedCategory] = useState('PRIMARYCATEGORY');
  const [customRange, setCustomRange] = useState(() => {
    const today = startOfDay(new Date());
    return { startDate: today, endDate: today };
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('performance');
  const [summaryData, setSummaryData] = useState(defaultSummaryData);
  const [performanceData, setPerformanceData] = useState(defaultPerformanceData);
  const [productData, setProductData] = useState(defaultProductData);
  const [dayWiseSummary, setDayWiseSummary] = useState<DayWiseSummaryItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<
    { icon: string; text: string; time: string; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const scrollY = new Animated.Value(0);
  const { colors, isDark } = useTheme();
  const selectedRange = getFilterRange(selectedFilter, customRange);

  const openDateRangePicker = () => {
    setSelectedFilter('custom');
    setShowDateRangePicker(true);
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatRangeLabel = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    if (formatApiDate(startDate) === formatApiDate(endDate)) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const loadPocketData = useCallback(async () => {
    setLoading(true);

    try {
      const range = getFilterRange(selectedFilter, customRange);
      const response = await homeService.getSalesmanPocketAndTarget({
        startDate: formatApiDate(range.startDate),
        endDate: formatApiDate(range.endDate),
      });
      const data = response.data;
      const pocket = data?.pocket;
      const target = data?.target;
      const dayWise = data?.dayWiseSummary || [];

      setSummaryData({
        retailing: Number(data?.retailingDays || 0),
        leaveAbsent: `${dayWise.reduce((sum, item) => sum + Number(item.leave || 0), 0)} / ${dayWise.reduce(
          (sum, item) => sum + Number(item.absent || 0),
          0,
        )}`,
        officialWork: dayWise.reduce((sum, item) => sum + Number(item.officialWork || 0), 0),
        total: dayWise.reduce((sum, item) => sum + Number(item.totalActivities || 0), 0),
        avgRetailingTime: '--',
        avgTotalTime: '--',
      });

      setPerformanceData({
        tc: Number(pocket?.tc || 0),
        pc: Number(pocket?.pc || 0),
        upc: Number(pocket?.upc || 0),
        utc: Number(pocket?.utc || 0),
        lpc: Number(pocket?.lpc || 0),
        avgFirstCall: '--',
        avgFirstPC: '--',
        avgTC: Number(pocket?.avgTc || 0),
        avgPC: Number(pocket?.avgPc || 0),
        achievement: Number(target?.achievementPercentage || 0),
        target: Number(target?.targetCases || 0),
      });

      setProductData({
        sc: Number(target?.achievedValue || 0),
        tc: Number(pocket?.tc || 0),
        pc: Number(pocket?.pc || 0),
        netValue: Number(target?.achievedValue || 0),
        cases: Number(target?.achievedCases || 0),
        lpc: Number(pocket?.lpc || 0),
        categories: [],
      });

      setDayWiseSummary(dayWise);

      setRecentActivities([
        {
          icon: 'checkmark-circle',
          text: `TC ${formatNumber(Number(pocket?.tc || 0))}, PC ${formatNumber(
            Number(pocket?.pc || 0),
          )}`,
          time: formatRangeLabel(range),
          color: colors.success,
        },
        {
          icon: 'trending-up',
          text: `Achievement ${formatNumber(Number(target?.achievementPercentage || 0), 2)}%`,
          time: `${formatNumber(Number(target?.achievedCases || 0), 2)} cases`,
          color: colors.primary,
        },
        {
          icon: 'storefront',
          text: `UPC ${formatNumber(Number(pocket?.upc || 0))}, UTC ${formatNumber(
            Number(pocket?.utc || 0),
          )}`,
          time: `${Number(data?.retailingDays || 0)} retailing days`,
          color: colors.warning,
        },
      ]);
    } catch (error) {
      console.warn('Failed to load pocket dashboard:', error);
      setSummaryData(defaultSummaryData);
      setPerformanceData(defaultPerformanceData);
      setProductData(defaultProductData);
      setDayWiseSummary([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  }, [colors.primary, colors.success, colors.warning, customRange, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      loadPocketData();
    }, [loadPocketData]),
  );

  const SummaryItem = ({ value, label, color, icon, trend }: any) => (
    <View style={{ width: '33%', alignItems: 'center', marginBottom: 16 }}>
      {icon && (
        <View style={{ marginBottom: 4 }}>
          <Ionicons name={icon} size={16} color={color || colors.primary} />
        </View>
      )}
      <Text
        style={{
          fontSize: TYPOGRAPHY.stat.size,
          fontWeight: TYPOGRAPHY.stat.weight,
          color: color || colors.textPrimary,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: TYPOGRAPHY.caption.size,
          color: colors.textTertiary,
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
      {trend && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <Ionicons
            name={trend > 0 ? 'trending-up' : 'trending-down'}
            size={8}
            color={trend > 0 ? colors.success : colors.error}
          />
          <Text
            style={{
              fontSize: TYPOGRAPHY.caption.size,
              marginLeft: 2,
              color: trend > 0 ? colors.success : colors.error,
            }}
          >
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
  );

  const SectionHeader = ({ title, icon, section, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingVertical: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Ionicons name={icon} size={14} color={colors.primary} />
        </View>
        <Text
          style={{
            fontSize: TYPOGRAPHY.h3.size,
            fontWeight: TYPOGRAPHY.h3.weight,
            color: colors.textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name={expandedSection === section ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={colors.textTertiary}
      />
    </TouchableOpacity>
  );

  const GradientCard = ({ children, colors: gradientColors, style }: any) => (
    <LinearGradient
      colors={gradientColors || colors.gradientPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 16, padding: 14, marginBottom: 12 }, style]}
    >
      {children}
    </LinearGradient>
  );

  const QuickActionButton = ({ title, icon, onPress, gradient, subtitle }: any) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 14,
          minHeight: 110,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name={icon} size={20} color={colors.primaryContrast} />
        </View>
        <View>
          <Text
            style={{
              fontSize: TYPOGRAPHY.body.size,
              fontWeight: '700',
              lineHeight: 16,
              color: colors.primaryContrast,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: TYPOGRAPHY.caption.size,
                color: colors.primaryContrast + 'CC',
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
          <Feather
            name="arrow-right"
            size={14}
            color={colors.primaryContrast}
            style={{ marginTop: 8 }}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ProductWiseModal = () => (
    <Modal visible={showProductWiseModal} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowProductWiseModal(false)}>
                <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.h2.size,
                  fontWeight: TYPOGRAPHY.h2.weight,
                  marginLeft: 12,
                  color: colors.primaryContrast,
                }}
              >
                Product Wise Sales
              </Text>
            </View>
            <TouchableOpacity>
              <Feather name="download" size={18} color={colors.primaryContrast} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 14 }}
          >
            {filterOptions.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => {
                  setSelectedFilter(item.value);
                  if (item.value === 'custom') setShowDateRangePicker(true);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.primary,
                  backgroundColor: selectedFilter === item.value ? colors.primary : colors.surface,
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.button.size,
                    fontWeight: TYPOGRAPHY.button.weight,
                    color:
                      selectedFilter === item.value ? colors.primaryContrast : colors.textPrimary,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <GradientCard colors={colors.gradientPrimary}>
            <Text
              style={{
                color: colors.primaryContrast,
                fontSize: TYPOGRAPHY.h4.size,
                fontWeight: TYPOGRAPHY.h4.weight,
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              Overview
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <SummaryItem
                value={productData.sc}
                label="SC"
                icon="stats-chart"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.tc}
                label="TC"
                icon="time"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.pc}
                label="PC"
                icon="cart"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={`ZMW ${productData.netValue}`}
                label="Net Value"
                icon="cash"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.cases}
                label="Cases"
                icon="cube"
                color={colors.primaryContrast}
              />
              <SummaryItem
                value={productData.lpc}
                label="LPC"
                icon="people"
                color={colors.primaryContrast}
              />
            </View>
          </GradientCard>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              marginTop: 8,
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {['PRIMARYCATEGORY', 'SECONDARYCATEGORY', 'SKU'].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedCategory(item)}
                  style={{
                    flex: 1,
                    backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
                    paddingVertical: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.caption.size,
                      fontWeight: '700',
                      color:
                        selectedCategory === item ? colors.primaryContrast : colors.textPrimary,
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 8,
                paddingHorizontal: 8,
                paddingVertical: 6,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  flex: 2,
                  fontSize: TYPOGRAPHY.bodySmall.size,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Value
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: TYPOGRAPHY.bodySmall.size,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Pcs
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: 'right',
                  fontSize: TYPOGRAPHY.bodySmall.size,
                  fontWeight: '600',
                  color: colors.textSecondary,
                }}
              >
                Cases
              </Text>
            </View>

            {productData.categories.length === 0 ? (
              <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                <Text style={{ color: colors.textTertiary, fontSize: TYPOGRAPHY.bodySmall.size }}>
                  No product sales available
                </Text>
              </View>
            ) : (
              productData.categories.map((item, index) => (
                <TouchableOpacity key={index} activeOpacity={0.8}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 8,
                    paddingVertical: 12,
                    borderBottomWidth: index < productData.categories.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flex: 2 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.bodySmall.size,
                        fontWeight: '700',
                        color: colors.primary,
                      }}
                    >
                      {index + 1}. {item.name}
                    </Text>
                    <Text
                      style={{
                        marginTop: 2,
                        fontSize: TYPOGRAPHY.body.size,
                        fontWeight: '600',
                        color: colors.textPrimary,
                      }}
                    >
                      ZMW {item.value}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                      <Ionicons name="trending-up" size={8} color={colors.success} />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.caption.size,
                          color: colors.success,
                          marginLeft: 2,
                        }}
                      >
                        +{item.growth}%
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: TYPOGRAPHY.body.size,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginTop: 12,
                    }}
                  >
                    {item.pcs}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      fontSize: TYPOGRAPHY.body.size,
                      fontWeight: '600',
                      color: colors.textPrimary,
                      marginTop: 12,
                    }}
                  >
                    {item.cases}
                  </Text>
                </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const DayWiseModal = () => (
    <Modal visible={showDayWiseModal} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowDayWiseModal(false)}>
              <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: TYPOGRAPHY.h2.size,
                fontWeight: TYPOGRAPHY.h2.weight,
                marginLeft: 12,
                color: colors.primaryContrast,
              }}
            >
              Day Wise Summary
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }}
        >
          {dayWiseSummary.length === 0 ? (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <Text style={{ color: colors.textTertiary, fontSize: TYPOGRAPHY.bodySmall.size }}>
                No day wise summary available
              </Text>
            </View>
          ) : (
            dayWiseSummary.map((item) => (
            <TouchableOpacity key={item.date} activeOpacity={0.9}>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.bodySmall.size,
                      color: colors.textTertiary,
                      fontWeight: '600',
                    }}
                  >
                    {item.label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.successLight,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.success,
                        fontSize: TYPOGRAPHY.caption.size,
                        fontWeight: '600',
                      }}
                    >
                      PC {formatNumber(item.pc)}
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={colors.gradientSuccess}
                  style={{ borderRadius: 10, overflow: 'hidden', marginVertical: 8 }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primaryContrast,
                        fontWeight: '700',
                        fontSize: TYPOGRAPHY.body.size,
                      }}
                    >
                      Retailing
                    </Text>
                    <Text
                      style={{
                        color: colors.primaryContrast,
                        fontSize: TYPOGRAPHY.statSmall.size,
                        fontWeight: '800',
                      }}
                    >
                      {formatNumber(item.retailing)}
                    </Text>
                  </View>
                </LinearGradient>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 6,
                    padding: 6,
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: TYPOGRAPHY.caption.size,
                      color: colors.textTertiary,
                      flex: 1,
                    }}
                  >
                    TC {formatNumber(item.tc)} | UPC {formatNumber(item.upc)} | Cases{' '}
                    {formatNumber(item.cases, 2)} | ZMW {formatNumber(item.netValue, 2)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {[
                    { label: 'First Call', value: item.firstCallTime || '--' },
                    { label: 'First PC', value: item.firstPcTime || '--' },
                    { label: 'TC', value: formatNumber(item.tc) },
                  ].map((stat, i) => (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.primaryLight + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginBottom: 2,
                        }}
                      >
                        <Ionicons
                          name={
                            i === 0
                              ? 'call-outline'
                              : i === 1
                                ? 'phone-portrait-outline'
                                : 'time-outline'
                          }
                          size={12}
                          color={colors.primary}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: i === 2 ? TYPOGRAPHY.statSmall.size : TYPOGRAPHY.bodySmall.size,
                          fontWeight: '800',
                          color: colors.textPrimary,
                        }}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          fontSize: TYPOGRAPHY.caption.size,
                          color: colors.textTertiary,
                        }}
                      >
                        {stat.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <ManagerDatePickerModal
        visible={showDateRangePicker}
        value={customRange.startDate}
        rangeValue={customRange}
        mode="range"
        title="Select custom date range"
        onClose={() => setShowDateRangePicker(false)}
        onApply={() => {}}
        onApplyRange={(range) => setCustomRange(range)}
      />

      <ProductWiseModal />
      <DayWiseModal />

      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* HEADER */}
        <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.h1.size,
                  fontWeight: TYPOGRAPHY.h1.weight,
                  color: colors.textPrimary,
                }}
              >
                My Pocket MIS
              </Text>
              <Text
                style={{ marginTop: 2, fontSize: TYPOGRAPHY.body.size, color: colors.textTertiary }}
              >
                Performance Dashboard
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: colors.success,
                    marginRight: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.caption.size,
                    color: colors.success,
                    fontWeight: '600',
                  }}
                >
                  Live Updates
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={openDateRangePicker}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                <Text
                style={{
                  marginLeft: 4,
                  fontSize: TYPOGRAPHY.time.size,
                  fontWeight: '600',
                  color: colors.textPrimary,
                }}
              >
                {formatRangeLabel(selectedRange)}
              </Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 14 }}
          >
            {filterOptions.map((item) => {
              const active = selectedFilter === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.82}
                  onPress={() => {
                    setSelectedFilter(item.value);
                    if (item.value === 'custom') setShowDateRangePicker(true);
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderRadius: 18,
                    paddingVertical: 7,
                    paddingHorizontal: 14,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.button.size,
                      fontWeight: TYPOGRAPHY.button.weight,
                      color: active ? colors.primaryContrast : colors.textPrimary,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* QUICK ACTION BUTTONS */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 18, gap: 10 }}>
          <QuickActionButton
            title="Day Wise Summary"
            subtitle=""
            icon="calendar-outline"
            onPress={() => setShowDayWiseModal(true)}
            gradient={colors.gradientPrimary}
          />
          <QuickActionButton
            title="Product Sales"
            subtitle="Track performance"
            icon="cube-outline"
            onPress={() => setShowProductWiseModal(true)}
            gradient={colors.gradientSuccess}
          />
          <QuickActionButton
            title="Dispatch Status"
            subtitle=""
            icon="car-outline"
            onPress={() => {}}
            gradient={[colors.warning, colors.warningDark] as const}
          />
        </View>

        {/* SHARE CARD */}
        <GradientCard
          colors={[colors.secondary, colors.secondaryDark]}
          style={{ marginHorizontal: 16, marginTop: 18 }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: TYPOGRAPHY.h4.size,
              fontWeight: '800',
              color: colors.secondaryContrast,
              marginBottom: 4,
            }}
          >
            Share Your Progress
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: TYPOGRAPHY.caption.size,
              color: colors.secondaryContrast + 'CC',
              marginBottom: 14,
            }}
          >
            Keep your manager updated with daily achievements
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['SHARE MSR', 'SHARE DSR'].map((item, index) => (
              <TouchableOpacity key={index} style={{ flex: 1 }}>
                <LinearGradient
                  colors={
                    index === 0
                      ? [colors.surface, colors.backgroundSecondary]
                      : ['#1E293B', '#0F172A']
                  }
                  style={{
                    paddingVertical: 8,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={14}
                    color={index === 0 ? colors.primary : colors.primaryContrast}
                  />
                  <Text
                    style={{
                      marginLeft: 4,
                      fontSize: TYPOGRAPHY.button.size,
                      fontWeight: '600',
                      color: index === 0 ? colors.primary : colors.primaryContrast,
                    }}
                  >
                    {item}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </GradientCard>

        {/* ACHIEVEMENT CARD */}
        {/* <View style={{ marginHorizontal: 16, marginTop: 18 }}>
          <LinearGradient
            colors={[colors.info, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 14 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  color: colors.primaryContrast,
                  fontSize: TYPOGRAPHY.h4.size,
                  fontWeight: '800',
                }}
              >
                Monthly Target
              </Text>
              <FontAwesome5 name="medal" size={18} color={colors.primaryContrast} />
            </View>
            <View style={{ alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colors.primaryContrast, fontSize: 28, fontWeight: '800' }}>
                {performanceData.achievement}%
              </Text>
              <Text
                style={{
                  color: colors.primaryContrast + 'CC',
                  fontSize: TYPOGRAPHY.caption.size,
                  marginTop: 2,
                }}
              >
                Achievement Rate
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                height: 5,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 2.5,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={colors.gradientSuccess}
                style={{
                  width: `${performanceData.achievement}%`,
                  height: '100%',
                  borderRadius: 2.5,
                }}
              />
            </View>
            <Text
              style={{
                color: colors.primaryContrast + 'CC',
                fontSize: TYPOGRAPHY.caption.size,
                textAlign: 'center',
                marginTop: 6,
              }}
            >
              Target: {performanceData.target} | Achieved: {performanceData.achievement}
            </Text>
          </LinearGradient>
        </View> */}

        {/* DAY WISE SUMMARY SECTION */}
        <View style={{ marginTop: 22, marginHorizontal: 16 }}>
          <SectionHeader
            title="DAY WISE SUMMARY"
            icon="calendar"
            section="daywise"
            onPress={() => setExpandedSection(expandedSection === 'daywise' ? null : 'daywise')}
          />
          {expandedSection === 'daywise' && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <SummaryItem
                  value={summaryData.retailing}
                  label="Retailing"
                  color={colors.success}
                  icon="storefront"
                  trend={12}
                />
                <SummaryItem
                  value={summaryData.leaveAbsent}
                  label="Leave / Absent"
                  color={colors.warning}
                  icon="calendar"
                />
                <SummaryItem
                  value={summaryData.avgRetailingTime}
                  label="Avg. Retailing Time"
                  icon="time"
                  color={colors.info}
                />
                <SummaryItem
                  value={summaryData.officialWork}
                  label="Official Work"
                  icon="briefcase"
                  color={colors.success}
                />
                <SummaryItem
                  value={summaryData.total}
                  label="Total Activities"
                  icon="checkmark-done"
                  color={colors.primary}
                />
                <SummaryItem
                  value={summaryData.avgTotalTime}
                  label="Avg. Total Time"
                  icon="hourglass"
                  color={colors.textTertiary}
                />
              </View>
            </View>
          )}
        </View>

        {/* PERFORMANCE SUMMARY SECTION */}
        <View style={{ marginTop: 14, marginHorizontal: 16 }}>
          <SectionHeader
            title="PERFORMANCE SUMMARY"
            icon="stats-chart"
            section="performance"
            onPress={() =>
              setExpandedSection(expandedSection === 'performance' ? null : 'performance')
            }
          />
          {expandedSection === 'performance' && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.primaryLight + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    color: colors.primary,
                    fontSize: TYPOGRAPHY.caption.size,
                  }}
                >
                  MTD
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <SummaryItem
                  value={performanceData.tc}
                  label="Total Calls"
                  icon="call"
                  color={colors.primary}
                  trend={5}
                />
                <SummaryItem
                  value={performanceData.pc}
                  label="Productive Calls"
                  icon="checkmark-circle"
                  color={colors.success}
                  trend={8}
                />
                <SummaryItem
                  value={performanceData.upc}
                  label="Unique PC"
                  icon="person"
                  color={colors.info}
                />
                <SummaryItem
                  value={performanceData.utc}
                  label="Unique TC"
                  icon="people"
                  color={colors.primary}
                />
                <SummaryItem
                  value={performanceData.lpc}
                  label="LPC"
                  icon="location"
                  color={colors.warning}
                  trend={-2}
                />
              </View>

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />

              <View
                style={{
                  backgroundColor: colors.infoLight + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontWeight: '700',
                    color: colors.info,
                    fontSize: TYPOGRAPHY.caption.size,
                  }}
                >
                  AVERAGE METRICS
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <SummaryItem
                  value={performanceData.avgFirstCall}
                  label="Avg First Call Time"
                  icon="alarm"
                  color={colors.info}
                />
                <SummaryItem
                  value={performanceData.avgFirstPC}
                  label="Avg First PC Time"
                  icon="timer"
                  color={colors.info}
                />
                <SummaryItem
                  value={performanceData.avgTC}
                  label="Avg TC/Day"
                  icon="bar-chart"
                  color={colors.primary}
                />
                <SummaryItem
                  value={performanceData.avgPC}
                  label="Avg PC/Day"
                  icon="trending-up"
                  color={colors.success}
                />
              </View>
            </View>
          )}
        </View>

        {/* RECENT ACTIVITIES */}
        <View style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.h3.size,
              fontWeight: TYPOGRAPHY.h3.weight,
              marginBottom: 12,
              color: colors.textPrimary,
            }}
          >
            Recent Activities
          </Text>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {recentActivities.length === 0 ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.textTertiary, fontSize: TYPOGRAPHY.bodySmall.size }}>
                  No recent activity available
                </Text>
              </View>
            ) : (
              recentActivities.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: index < recentActivities.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: item.color + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.body.size,
                      fontWeight: '600',
                      color: colors.textPrimary,
                    }}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.caption.size,
                      color: colors.textTertiary,
                      marginTop: 1,
                    }}
                  >
                    {item.time}
                  </Text>
                </View>
                <Feather name="more-horizontal" size={14} color={colors.textTertiary} />
              </View>
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
