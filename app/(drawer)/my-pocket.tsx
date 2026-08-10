import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Animated, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  homeService,
  type SalesmanDayWiseSummaryItem,
  type SalesmanDispatchStatusItem,
  type SalesmanProductSalesGroupBy,
  type SalesmanReportType,
} from '@/features/home/services/home.service';
import { ManagerDatePickerModal } from '@/features/home/components/models/ManagerDatePickerModal';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
import { AppModal, Skeleton } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { toast } from '@/shared/utils/toast';

// ── Typography scale ──────────────────────────────────────────────────────────
const T = {
  display: { size: 22, weight: '800' as const, lineHeight: 28 },
  title: { size: 15, weight: '700' as const, lineHeight: 22 },
  section: { size: 12, weight: '700' as const, lineHeight: 16 }, // ALL CAPS labels
  value: { size: 18, weight: '800' as const, lineHeight: 24 },
  valueS: { size: 15, weight: '700' as const, lineHeight: 20 },
  body: { size: 13, weight: '400' as const, lineHeight: 19 },
  bodyM: { size: 13, weight: '500' as const, lineHeight: 19 },
  label: { size: 11, weight: '500' as const, lineHeight: 15 },
  micro: { size: 10, weight: '600' as const, lineHeight: 14 },
  button: { size: 12, weight: '600' as const, lineHeight: 16 },
};

// ── Types & defaults ──────────────────────────────────────────────────────────
type PocketFilter = 'today' | 'yesterday' | 'mtd' | 'custom';
type ProductSalesGroup = SalesmanProductSalesGroupBy;
type DayWiseSummaryItem = SalesmanDayWiseSummaryItem;
type ShareReportType = Extract<SalesmanReportType, 'MST' | 'DSR'>;

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
  categories: [] as { name: string; value: number; pcs: number; cases: number; growth: number }[],
};
const defaultVanUtilizationData = {
  openingStockCases: 0,
  topupStockCases: 0,
  totalStockCases: 0,
  salesCases: 0,
  utilizationPercentage: 0,
};

const filterOptions: { value: PocketFilter; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'mtd', label: 'MTD' },
  { value: 'custom', label: 'Custom' },
];

// ── Utility fns ───────────────────────────────────────────────────────────────
const formatNumber = (value: number, decimals = 0) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const formatCaseValue = (value: number) => `${formatNumber(value, value % 1 === 0 ? 0 : 2)} Cases`;

const parseTimeToMinutes = (value?: string | null) => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const formatMinutesToTime = (value: number) => {
  const hours24 = Math.floor(value / 60) % 24;
  const minutes = value % 60;
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${meridiem}`;
};

const averageDailyTime = (values: Array<string | null | undefined>) => {
  const minutes = values.map(parseTimeToMinutes).filter((v): v is number => v !== null);
  if (!minutes.length) return '--';
  const avg = Math.round(minutes.reduce((s, v) => s + v, 0) / minutes.length);
  return formatMinutesToTime(avg);
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getFilterRange = (filter: PocketFilter, custom: { startDate: Date; endDate: Date }) => {
  const today = startOfDay(new Date());
  if (filter === 'today') return { startDate: today, endDate: today };
  if (filter === 'yesterday') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return { startDate: yesterday, endDate: yesterday };
  }
  if (filter === 'mtd') {
    return { startDate: new Date(today.getFullYear(), today.getMonth(), 1), endDate: today };
  }
  return custom;
};

const fmt = (d: Date) =>
  `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;

const formatRangeLabel = ({ startDate, endDate }: { startDate: Date; endDate: Date }) =>
  formatLocalApiDate(startDate) === formatLocalApiDate(endDate)
    ? fmt(startDate)
    : `${fmt(startDate)} – ${fmt(endDate)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

// Stat cell used in summary grids
const StatCell = ({
  icon,
  value,
  label,
  accent,
  colors: c,
}: {
  icon: string;
  value: string | number;
  label: string;
  accent: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View style={{ width: '33%', paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' }}>
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: accent + '18',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <Ionicons name={icon as any} size={16} color={accent} />
    </View>
    <Text style={{ fontSize: T.valueS.size, fontWeight: T.valueS.weight, color: c.textPrimary }}>
      {value}
    </Text>
    <Text
      style={{
        fontSize: T.label.size,
        color: c.textSecondary,
        marginTop: 2,
        textAlign: 'center',
        lineHeight: T.label.lineHeight,
      }}
    >
      {label}
    </Text>
  </View>
);

// Collapsible section with a clear accent-bar title
const Section = ({
  title,
  icon,
  sectionKey,
  expanded,
  onToggle,
  children,
  colors: c,
}: {
  title: string;
  icon: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View style={{ marginTop: 16, marginHorizontal: 16 }}>
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: c.surface,
        borderRadius: expanded ? 14 : 14,
        borderBottomLeftRadius: expanded ? 0 : 14,
        borderBottomRightRadius: expanded ? 0 : 14,
        borderWidth: 1,
        borderColor: c.border,
        borderBottomColor: expanded ? 'transparent' : c.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: c.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name={icon as any} size={15} color={c.primary} />
        </View>
        <Text
          style={{
            fontSize: T.section.size,
            fontWeight: T.section.weight,
            color: c.textPrimary,
            letterSpacing: 0.6,
          }}
        >
          {title}
        </Text>
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: c.primary + '12',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={c.primary} />
      </View>
    </TouchableOpacity>

    {expanded && (
      <View
        style={{
          backgroundColor: c.surface,
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: c.border,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          padding: 14,
        }}
      >
        {children}
      </View>
    )}
  </View>
);

// Quick action tile — visually distinct per action
const ActionTile = ({
  title,
  subtitle,
  icon,
  onPress,
  accentColor,
  colors: c,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  accentColor: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1 }}>
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: 16,
        padding: 14,
        minHeight: 100,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: c.border,
        // Left accent strip
        overflow: 'hidden',
      }}
    >
      {/* Accent strip */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: accentColor,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />
      <View style={{ marginLeft: 4 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: accentColor + '18',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons name={icon as any} size={18} color={accentColor} />
        </View>
        <Text
          style={{
            fontSize: T.bodyM.size,
            fontWeight: T.title.weight,
            color: c.textPrimary,
            lineHeight: 17,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: T.label.size, color: c.textSecondary, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather
        name="chevron-right"
        size={13}
        color={accentColor}
        style={{ alignSelf: 'flex-end', marginTop: 6 }}
      />
    </View>
  </TouchableOpacity>
);

// Badge sub-label (MTD / AVERAGE METRICS etc.)
const SubBadge = ({ label, color }: { label: string; color: string }) => (
  <View
    style={{
      backgroundColor: color + '14',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 12,
    }}
  >
    <Text
      style={{
        fontSize: T.micro.size,
        fontWeight: T.micro.weight,
        color,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
export default function PocketMISScreen() {
  const [showProductWiseModal, setShowProductWiseModal] = useState(false);
  const [showDayWiseModal, setShowDayWiseModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PocketFilter>('today');
  const [selectedCategory, setSelectedCategory] = useState<ProductSalesGroup>('PRIMARYCATEGORY');
  const [customRange, setCustomRange] = useState(() => {
    const today = startOfDay(new Date());
    return { startDate: today, endDate: today };
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    daywise: true,
    performance: true,
    vanUtilization: true,
  });
  const [summaryData, setSummaryData] = useState(defaultSummaryData);
  const [performanceData, setPerformanceData] = useState(defaultPerformanceData);
  const [productData, setProductData] = useState(defaultProductData);
  const [vanUtilizationData, setVanUtilizationData] = useState(defaultVanUtilizationData);
  const [dayWiseSummary, setDayWiseSummary] = useState<DayWiseSummaryItem[]>([]);
  const [dispatchStatus, setDispatchStatus] = useState<SalesmanDispatchStatusItem[]>([]);
  const [dayWiseLoading, setDayWiseLoading] = useState(false);
  const [productWiseLoading, setProductWiseLoading] = useState(false);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [sharingType, setSharingType] = useState<ShareReportType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fix: scrollY must be stable across renders
  const scrollY = useRef(new Animated.Value(0)).current;
  const { colors, isDark } = useTheme();
  const { setHeader } = useHeader();
  const selectedRange = getFilterRange(selectedFilter, customRange);

  const getRangeParams = useCallback(() => {
    const range = getFilterRange(selectedFilter, customRange);
    return {
      startDate: formatLocalApiDate(range.startDate),
      endDate: formatLocalApiDate(range.endDate),
    };
  }, [customRange, selectedFilter]);

  const openDateRangePicker = () => {
    setSelectedFilter('custom');
    setShowDateRangePicker(true);
  };

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((current) => ({ ...current, [section]: !current[section] }));
  }, []);

  const fetchDayWiseSummary = useCallback(async () => {
    const range = getFilterRange(selectedFilter, customRange);
    setDayWiseLoading(true);
    try {
      const response = await homeService.getSalesmanDayWiseSummary({
        startDate: formatLocalApiDate(range.startDate),
        endDate: formatLocalApiDate(range.endDate),
      });
      if (response.success && response.data) setDayWiseSummary(response.data);
    } catch (error) {
      console.warn('Failed to load day wise summary:', error);
    } finally {
      setDayWiseLoading(false);
    }
  }, [customRange, selectedFilter]);

  const fetchProductSales = useCallback(async () => {
    const range = getFilterRange(selectedFilter, customRange);
    setProductWiseLoading(true);
    try {
      const response = await homeService.getSalesmanProductSales({
        startDate: formatLocalApiDate(range.startDate),
        endDate: formatLocalApiDate(range.endDate),
        groupBy: selectedCategory,
      });
      if (response.success && response.data) {
        setProductData({
          sc: Number(response.data.overview?.sc || 0),
          tc: Number(response.data.overview?.tc || 0),
          pc: Number(response.data.overview?.pc || 0),
          netValue: Number(response.data.overview?.netValue || 0),
          cases: Number(response.data.overview?.cases || 0),
          lpc: Number(response.data.overview?.lpc || 0),
          categories: response.data.categories || [],
        });
      }
    } catch (error) {
      console.warn('Failed to load product sales:', error);
      setProductData(defaultProductData);
    } finally {
      setProductWiseLoading(false);
    }
  }, [customRange, selectedCategory, selectedFilter]);

  const fetchDispatchStatus = useCallback(async () => {
    setDispatchLoading(true);
    try {
      const response = await homeService.getSalesmanDispatchOrders(getRangeParams());
      const data = response.data as
        | SalesmanDispatchStatusItem[]
        | {
            orders?: SalesmanDispatchStatusItem[];
            items?: SalesmanDispatchStatusItem[];
            records?: SalesmanDispatchStatusItem[];
          }
        | null;

      if (response.success && Array.isArray(data)) {
        setDispatchStatus(data);
      } else if (response.success && data) {
        const grouped = data as {
          orders?: SalesmanDispatchStatusItem[];
          items?: SalesmanDispatchStatusItem[];
          records?: SalesmanDispatchStatusItem[];
        };
        setDispatchStatus(grouped.orders || grouped.items || grouped.records || []);
      } else {
        setDispatchStatus([]);
      }
    } catch (error) {
      console.warn('Failed to load dispatch status:', error);
      setDispatchStatus([]);
      toast.error('Failed to load dispatch status');
    } finally {
      setDispatchLoading(false);
    }
  }, [getRangeParams]);

  const openDispatchStatus = useCallback(() => {
    setShowDispatchModal(true);
    void fetchDispatchStatus();
  }, [fetchDispatchStatus]);

  const handleShareReport = useCallback(
    async (type: ShareReportType) => {
      setSharingType(type);
      try {
        const params = getRangeParams();
        const response = await homeService.shareSalesmanReport(type, params);

        if (!response.success) {
          toast.error(response.message || `Failed to share ${type}`);
          return;
        }

        const data = response.data || {};
        const reportUrl = data.url || data.reportUrl || data.fileUrl;
        const message =
          data.shareText ||
          data.text ||
          data.message ||
          `${type} report for ${formatRangeLabel(selectedRange)}`;

        await Share.share({
          title: `${type} Report`,
          message: reportUrl ? `${message}\n${reportUrl}` : message,
          url: reportUrl,
        });
        toast.success(`${type} report ready to share`);
      } catch (error) {
        console.warn(`Failed to share ${type}:`, error);
        toast.error(`Failed to share ${type}`);
      } finally {
        setSharingType(null);
      }
    },
    [getRangeParams, selectedRange],
  );

  const getDayStatusDisplay = (item: DayWiseSummaryItem) => {
    const status =
      item.dayStatus ||
      (Number(item.leave || 0) > 0
        ? 'Leave'
        : Number(item.retailing || 0) > 0 || Number(item.tc || 0) > 0 || Number(item.pc || 0) > 0
          ? 'Retailing'
          : Number(item.officialWork || 0) > 0
            ? 'Official Work'
            : 'Absent');
    if (status === 'Leave')
      return {
        label: 'Leave',
        value: formatNumber(item.leave || 1),
        colors: [colors.warning, colors.warningDark] as const,
      };
    if (status === 'Absent')
      return {
        label: 'Absent',
        value: formatNumber(item.absent || 1),
        colors: [colors.error, colors.errorDark] as const,
      };
    if (status === 'Official Work')
      return {
        label: 'Official Work',
        value: formatNumber(item.officialWork || 0),
        colors: [colors.info, colors.infoDark] as const,
      };
    return {
      label: 'Retailing',
      value: formatNumber(item.retailing || 0),
      colors: colors.gradientSuccess,
    };
  };

  const loadPocketData = useCallback(async () => {
    setLoading(true);
    try {
      const range = getFilterRange(selectedFilter, customRange);
      const response = await homeService.getSalesmanPocketAndTarget({
        startDate: formatLocalApiDate(range.startDate),
        endDate: formatLocalApiDate(range.endDate),
      });
      const data = response.data;
      const pocket = data?.pocket;
      const target = data?.target;
      const dayWise = data?.dayWiseSummary || [];
      const vanUtilization = data?.vanUtilization;

      setSummaryData({
        retailing: Number(data?.retailingDays || 0),
        leaveAbsent: `${dayWise.reduce((s, i) => s + Number(i.leave || 0), 0)} / ${dayWise.reduce((s, i) => s + Number(i.absent || 0), 0)}`,
        officialWork: dayWise.reduce((s, i) => s + Number(i.officialWork || 0), 0),
        total: dayWise.reduce((s, i) => s + Number(i.totalActivities || 0), 0),
        avgRetailingTime: data?.avgRetailingTime || '--',
        avgTotalTime: data?.avgTotalTime || '--',
      });

      setPerformanceData({
        tc: Number(pocket?.tc || 0),
        pc: Number(pocket?.pc || 0),
        upc: Number(pocket?.upc || 0),
        utc: Number(pocket?.utc || 0),
        lpc: Number(pocket?.lpc || 0),
        avgFirstCall:
          pocket?.avgFirstCallTime || averageDailyTime(dayWise.map((i) => i.firstCallTime)),
        avgFirstPC: pocket?.avgFirstPcTime || averageDailyTime(dayWise.map((i) => i.firstPcTime)),
        avgTC: Number(pocket?.avgTc || 0),
        avgPC: Number(pocket?.avgPc || 0),
        achievement: Number(target?.achievementPercentage || 0),
        target: Number(target?.targetCases || 0),
      });

      setVanUtilizationData({
        openingStockCases: Number(vanUtilization?.openingStockCases || 0),
        topupStockCases: Number(vanUtilization?.topupStockCases || 0),
        totalStockCases: Number(vanUtilization?.totalStockCases || 0),
        salesCases: Number(vanUtilization?.salesCases || 0),
        utilizationPercentage: Number(vanUtilization?.utilizationPercentage || 0),
      });

      setDayWiseSummary(dayWise);
    } catch (error) {
      console.warn('Failed to load pocket dashboard:', error);
      setSummaryData(defaultSummaryData);
      setPerformanceData(defaultPerformanceData);
      setVanUtilizationData(defaultVanUtilizationData);
      setDayWiseSummary([]);
    } finally {
      setLoading(false);
    }
  }, [colors.primary, colors.success, colors.warning, customRange, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'My Pocket MIS',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
      loadPocketData();
    }, [colors.primary, loadPocketData, setHeader]),
  );

  useEffect(() => {
    if (showProductWiseModal) void fetchProductSales();
  }, [fetchProductSales, showProductWiseModal]);

  // ── Skeleton ────────────────────────────────────────────────────────────────
  const SkeletonCard = ({ children, style }: any) => (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const renderPocketSkeleton = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40, gap: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Skeleton height={13} width={154} borderRadius={6} />
        <Skeleton height={34} width={128} borderRadius={12} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[78, 104, 90, 78].map((w, i) => (
          <View key={i} style={{ marginRight: 8 }}>
            <Skeleton height={34} width={w} borderRadius={18} />
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} style={{ flex: 1, minHeight: 100 }}>
            <Skeleton height={34} width={34} borderRadius={10} />
            <View style={{ gap: 6, marginTop: 20 }}>
              <Skeleton height={14} width="88%" borderRadius={7} />
              <Skeleton height={10} width="58%" borderRadius={5} />
            </View>
          </SkeletonCard>
        ))}
      </View>
      {[1, 2].map((s) => (
        <View key={s}>
          <SkeletonCard
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Skeleton height={28} width={28} borderRadius={8} />
              <Skeleton height={14} width={140} borderRadius={7} />
            </View>
          </SkeletonCard>
          <SkeletonCard
            style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 0 }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={{ width: '33%', alignItems: 'center', paddingVertical: 12, gap: 6 }}
                >
                  <Skeleton height={34} width={34} borderRadius={10} />
                  <Skeleton height={18} width={48} borderRadius={8} />
                  <Skeleton height={10} width={62} borderRadius={5} />
                </View>
              ))}
            </View>
          </SkeletonCard>
        </View>
      ))}
    </View>
  );

  const renderDayWiseSkeleton = () => (
    <View style={{ gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Skeleton height={12} width={92} borderRadius={6} />
            <Skeleton height={18} width={58} borderRadius={9} />
          </View>
          <Skeleton height={42} width="100%" borderRadius={10} />
          <Skeleton height={28} width="100%" borderRadius={8} style={{ marginTop: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <Skeleton height={24} width={24} variant="circle" />
                <Skeleton height={14} width={48} borderRadius={7} />
                <Skeleton height={10} width={56} borderRadius={5} />
              </View>
            ))}
          </View>
        </SkeletonCard>
      ))}
    </View>
  );

  const renderProductWiseSkeleton = () => (
    <View style={{ gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ flexDirection: 'row', paddingVertical: 10, gap: 12 }}>
          <View style={{ flex: 2, gap: 8 }}>
            <Skeleton height={14} width="72%" borderRadius={7} />
            <Skeleton height={16} width="48%" borderRadius={8} />
            <Skeleton height={10} width={54} borderRadius={5} />
          </View>
          <Skeleton height={16} width={34} borderRadius={8} />
          <Skeleton height={16} width={42} borderRadius={8} />
        </View>
      ))}
    </View>
  );

  // ── Modals ──────────────────────────────────────────────────────────────────
  const ModalHeader = ({
    title,
    onClose,
    rightAction,
  }: {
    title: string;
    onClose: () => void;
    rightAction?: React.ReactNode;
  }) => (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: T.title.size,
              fontWeight: T.title.weight,
              color: colors.primaryContrast,
            }}
          >
            {title}
          </Text>
        </View>
        {rightAction}
      </View>
    </LinearGradient>
  );

  const FilterChips = ({ inModal = false }: { inModal?: boolean }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 14 }}>
      {filterOptions.map((item) => {
        const active = selectedFilter === item.value;
        return (
          <TouchableOpacity
            key={item.value}
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
              paddingHorizontal: 16,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: T.button.size,
                fontWeight: T.button.weight,
                color: active ? colors.primaryContrast : colors.textSecondary,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderProductWiseModal = () => (
    <AppModal
      visible={showProductWiseModal}
      onClose={() => setShowProductWiseModal(false)}
      size="full"
      position="top"
      animation="slide"
      swipeDirection="up"
      showHeader={false}
      showBackdrop={false}
      style={{ height: '100%', borderRadius: 0 }}
      contentStyle={{ flex: 1, padding: 0, backgroundColor: colors.background }}
      closeOnBackdropPress={false}
    >
      <>
        <StatusBar
          backgroundColor={colors.background}
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />
        <ModalHeader
          title="Product Sales"
          onClose={() => setShowProductWiseModal(false)}
          rightAction={
            <TouchableOpacity>
              <Feather name="download" size={18} color={colors.primaryContrast} />
            </TouchableOpacity>
          }
        />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }}>
          <FilterChips inModal />

          {/* Overview */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: T.section.size,
                fontWeight: T.section.weight,
                color: colors.textSecondary,
                letterSpacing: 0.6,
                marginBottom: 12,
              }}
            >
              OVERVIEW
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {[
                { icon: 'stats-chart', value: productData.sc, label: 'SC' },
                { icon: 'time', value: productData.tc, label: 'TC' },
                { icon: 'cart', value: productData.pc, label: 'PC' },
                { icon: 'cash', value: `ZMW ${productData.netValue}`, label: 'Net Value' },
                { icon: 'cube', value: productData.cases, label: 'Cases' },
                { icon: 'people', value: productData.lpc, label: 'LPC' },
              ].map((s) => (
                <StatCell
                  key={s.label}
                  icon={s.icon}
                  value={s.value}
                  label={s.label}
                  accent={colors.primary}
                  colors={colors}
                />
              ))}
            </View>
          </View>

          {/* Category toggle */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {(['PRIMARYCATEGORY', 'SECONDARYCATEGORY', 'SKU'] as ProductSalesGroup[]).map(
                (cat, idx, arr) => {
                  const active = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        alignItems: 'center',
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderRightWidth: idx < arr.length - 1 ? 1 : 0,
                        borderRightColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: T.micro.size,
                          fontWeight: T.micro.weight,
                          color: active ? colors.primaryContrast : colors.textSecondary,
                          letterSpacing: 0.4,
                        }}
                      >
                        {cat.replace('CATEGORY', ' CAT').replace('SECONDARY', 'SEC ')}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </View>

          {/* Table header */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 8,
              paddingVertical: 7,
              backgroundColor: colors.background,
              borderRadius: 8,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                flex: 2,
                fontSize: T.label.size,
                fontWeight: '600',
                color: colors.textSecondary,
              }}
            >
              Name / Value
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: T.label.size,
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
                fontSize: T.label.size,
                fontWeight: '600',
                color: colors.textSecondary,
              }}
            >
              Cases
            </Text>
          </View>

          {productWiseLoading ? (
            renderProductWiseSkeleton()
          ) : productData.categories.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: T.label.size }}>
                No product sales for this period
              </Text>
            </View>
          ) : (
            productData.categories.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 8,
                  paddingVertical: 13,
                  borderBottomWidth: index < productData.categories.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{ flex: 2 }}>
                  <Text
                    style={{
                      fontSize: T.label.size,
                      fontWeight: '500',
                      color: colors.textSecondary,
                    }}
                  >
                    {index + 1}. {item.name}
                  </Text>
                  <Text
                    style={{
                      marginTop: 3,
                      fontSize: T.bodyM.size,
                      fontWeight: T.valueS.weight,
                      color: colors.textPrimary,
                    }}
                  >
                    ZMW {item.value}
                  </Text>
                  {item.growth > 0 && (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 }}
                    >
                      <Ionicons name="trending-up" size={10} color={colors.success} />
                      <Text
                        style={{ fontSize: T.micro.size, color: colors.success, fontWeight: '600' }}
                      >
                        +{item.growth}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: T.bodyM.size,
                    fontWeight: '500',
                    color: colors.textPrimary,
                    alignSelf: 'center',
                  }}
                >
                  {item.pcs}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    fontSize: T.bodyM.size,
                    fontWeight: '500',
                    color: colors.textPrimary,
                    alignSelf: 'center',
                  }}
                >
                  {item.cases}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <ManagerDatePickerModal
          visible={showDateRangePicker}
          value={customRange.startDate}
          rangeValue={customRange}
          mode="range"
          title="Select date range"
          onClose={() => setShowDateRangePicker(false)}
          onApply={() => {}}
          onApplyRange={(range) => setCustomRange(range)}
        />
      </>
    </AppModal>
  );

  const renderDayWiseModal = () => (
    <AppModal
      visible={showDayWiseModal}
      onClose={() => setShowDayWiseModal(false)}
      size="full"
      position="top"
      animation="slide"
      swipeDirection="up"
      showHeader={false}
      showBackdrop={false}
      style={{ height: '100%', borderRadius: 0 }}
      contentStyle={{ flex: 1, padding: 0, backgroundColor: colors.background }}
      closeOnBackdropPress={false}
    >
      <>
        <ModalHeader title="Day Wise Summary" onClose={() => setShowDayWiseModal(false)} />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 30,
            gap: 10,
          }}
        >
          {dayWiseLoading ? (
            renderDayWiseSkeleton()
          ) : dayWiseSummary.length === 0 ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: T.label.size }}>
                No data for this period
              </Text>
            </View>
          ) : (
            dayWiseSummary.map((item) => {
              const sd = getDayStatusDisplay(item);
              return (
                <View
                  key={item.date}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {/* Row 1: date + PC badge */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: T.label.size,
                        color: colors.textSecondary,
                        fontWeight: '500',
                      }}
                    >
                      {item.label}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.successLight,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{ color: colors.success, fontSize: T.micro.size, fontWeight: '700' }}
                      >
                        PC {formatNumber(item.pc)}
                      </Text>
                    </View>
                  </View>

                  {/* Status banner */}
                  <LinearGradient
                    colors={sd.colors}
                    style={{
                      borderRadius: 10,
                      padding: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primaryContrast,
                        fontWeight: '700',
                        fontSize: T.body.size,
                      }}
                    >
                      {sd.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.primaryContrast,
                        fontSize: T.valueS.size,
                        fontWeight: '800',
                      }}
                    >
                      {sd.value}
                    </Text>
                  </LinearGradient>

                  {/* Detail strip */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 8,
                      padding: 7,
                      backgroundColor: colors.background,
                      borderRadius: 8,
                    }}
                  >
                    <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
                    <Text
                      style={{
                        marginLeft: 5,
                        fontSize: T.label.size,
                        color: colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      TC {formatNumber(item.tc)} · UPC {formatNumber(item.upc)} · Cases{' '}
                      {formatNumber(item.cases, 2)} · ZMW {formatNumber(item.netValue, 2)}
                    </Text>
                  </View>

                  {/* Footer stats */}
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 12,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    {[
                      {
                        icon: 'call-outline',
                        label: 'First Call',
                        value: item.firstCallTime || '--',
                      },
                      {
                        icon: 'phone-portrait-outline',
                        label: 'First PC',
                        value: item.firstPcTime || '--',
                      },
                      { icon: 'time-outline', label: 'TC', value: formatNumber(item.tc) },
                    ].map((stat, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: colors.primary + '14',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <Ionicons name={stat.icon as any} size={12} color={colors.primary} />
                        </View>
                        <Text
                          style={{
                            fontSize: T.bodyM.size,
                            fontWeight: '600',
                            color: colors.textPrimary,
                          }}
                        >
                          {stat.value}
                        </Text>
                        <Text
                          style={{
                            fontSize: T.label.size,
                            color: colors.textSecondary,
                            marginTop: 1,
                          }}
                        >
                          {stat.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </>
    </AppModal>
  );

  const renderDispatchStatusModal = () => (
    <AppModal
      visible={showDispatchModal}
      onClose={() => setShowDispatchModal(false)}
      size="full"
      position="top"
      animation="slide"
      swipeDirection="up"
      showHeader={false}
      showBackdrop={false}
      style={{ height: '100%', borderRadius: 0 }}
      contentStyle={{ flex: 1, padding: 0, backgroundColor: colors.background }}
      closeOnBackdropPress={false}
    >
      <>
        <ModalHeader
          title="Dispatch Status"
          onClose={() => setShowDispatchModal(false)}
          rightAction={
            <TouchableOpacity
              onPress={fetchDispatchStatus}
              disabled={dispatchLoading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="refresh-cw" size={17} color={colors.primaryContrast} />
            </TouchableOpacity>
          }
        />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 30,
            gap: 10,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: T.label.size }}>
              {formatRangeLabel(selectedRange)}
            </Text>
            <Text style={{ color: colors.primary, fontSize: T.label.size, fontWeight: '700' }}>
              {dispatchStatus.length} Orders
            </Text>
          </View>

          {dispatchLoading ? (
            <View style={{ gap: 10 }}>
              {[1, 2, 3, 4].map((item) => (
                <SkeletonCard key={item}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Skeleton height={16} width={110} borderRadius={8} />
                    <Skeleton height={22} width={76} borderRadius={11} />
                  </View>
                  <Skeleton height={12} width="72%" borderRadius={6} style={{ marginTop: 12 }} />
                  <Skeleton height={34} width="100%" borderRadius={10} style={{ marginTop: 12 }} />
                </SkeletonCard>
              ))}
            </View>
          ) : dispatchStatus.length === 0 ? (
            <View style={{ paddingVertical: 42, alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.warning + '14',
                }}
              >
                <Ionicons name="car-outline" size={24} color={colors.warning} />
              </View>
              <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: T.body.size }}>
                No dispatch records
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: T.label.size }}>
                Try another date range.
              </Text>
            </View>
          ) : (
            dispatchStatus.map((item, index) => {
              const status = item.status || 'Pending';
              const accent =
                status.toLowerCase().includes('dispatch') ||
                status.toLowerCase().includes('delivered')
                  ? colors.success
                  : status.toLowerCase().includes('cancel')
                    ? colors.error
                    : colors.warning;
              const title = item.orderNo || item.orderId || `Order ${index + 1}`;
              const outlet = item.outletName || item.outlet || 'Outlet';

              return (
                <View
                  key={`${title}-${index}`}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: T.bodyM.size,
                          fontWeight: '700',
                        }}
                        numberOfLines={1}
                      >
                        {title}
                      </Text>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: T.label.size,
                          marginTop: 3,
                        }}
                        numberOfLines={1}
                      >
                        {outlet}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: accent + '16',
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                      }}
                    >
                      <Text style={{ color: accent, fontSize: T.micro.size, fontWeight: '800' }}>
                        {status}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      marginTop: 12,
                      padding: 10,
                      borderRadius: 10,
                      backgroundColor: colors.background,
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      rowGap: 8,
                    }}
                  >
                    {[
                      { label: 'Invoice', value: item.invoiceNo || '--' },
                      { label: 'Cases', value: formatNumber(Number(item.cases || 0), 2) },
                      {
                        label: 'Value',
                        value: `ZMW ${formatNumber(Number(item.netValue || 0), 2)}`,
                      },
                      { label: 'Vehicle', value: item.vehicleNo || '--' },
                    ].map((stat) => (
                      <View key={stat.label} style={{ width: '50%' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: T.micro.size }}>
                          {stat.label}
                        </Text>
                        <Text
                          style={{
                            color: colors.textPrimary,
                            fontSize: T.label.size,
                            fontWeight: '700',
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {stat.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </>
    </AppModal>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderProductWiseModal()}
      {renderDayWiseModal()}
      {renderDispatchStatusModal()}
      {!showProductWiseModal && (
        <ManagerDatePickerModal
          visible={showDateRangePicker}
          value={customRange.startDate}
          rangeValue={customRange}
          mode="range"
          title="Select date range"
          onClose={() => setShowDateRangePicker(false)}
          onApply={() => {}}
          onApplyRange={(range) => setCustomRange(range)}
        />
      )}

      {loading ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {renderPocketSkeleton()}
        </ScrollView>
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
        >
          {/* ── Date filters ─────────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 9,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: colors.success + '16',
                  borderWidth: 1,
                  borderColor: colors.success + '30',
                }}
              >
                <Ionicons name="radio-outline" size={12} color={colors.success} />
                <Text style={{ fontSize: T.label.size, color: colors.success, fontWeight: '800' }}>
                  Live
                </Text>
              </View>

              <TouchableOpacity
                onPress={openDateRangePicker}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 1,
                }}
              >
                <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                <Text
                  style={{ fontSize: T.label.size, fontWeight: '600', color: colors.textPrimary }}
                  numberOfLines={1}
                >
                  {formatRangeLabel(selectedRange)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
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
                        fontSize: T.button.size,
                        fontWeight: T.button.weight,
                        color: active ? colors.primaryContrast : colors.textSecondary,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 10 }}>
            <ActionTile
              title="Day Wise Summary"
              subtitle={`${dayWiseSummary.length} days`}
              icon="calendar-outline"
              onPress={() => {
                setShowDayWiseModal(true);
                void fetchDayWiseSummary();
              }}
              accentColor={colors.primary}
              colors={colors}
            />
            <ActionTile
              title="Product Sales"
              subtitle={`${productData.categories.length} categories`}
              icon="cube-outline"
              onPress={() => setShowProductWiseModal(true)}
              accentColor={colors.success}
              colors={colors}
            />
            <ActionTile
              title="Dispatch Status"
              subtitle="View orders"
              icon="car-outline"
              onPress={openDispatchStatus}
              accentColor={colors.warning}
              colors={colors}
            />
          </View>

          {/* ── Share card ────────────────────────────────────────────────── */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 16,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: colors.primary + '12',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: T.bodyM.size,
                  fontWeight: T.title.weight,
                  color: colors.textPrimary,
                }}
              >
                Share daily report
              </Text>
              <Text style={{ fontSize: T.label.size, color: colors.textSecondary, marginTop: 2 }}>
                Keep your manager updated
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['MST', 'DSR'] as ShareReportType[]).map((type, i) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleShareReport(type)}
                  disabled={sharingType !== null}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 10,
                    backgroundColor: i === 0 ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: i === 0 ? colors.primary : colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={12}
                    color={i === 0 ? colors.primaryContrast : colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: T.micro.size,
                      fontWeight: '700',
                      color: i === 0 ? colors.primaryContrast : colors.textSecondary,
                    }}
                  >
                    {sharingType === type ? '...' : type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Day Wise Summary section ─────────────────────────────────── */}
          <Section
            title="DAY WISE SUMMARY"
            icon="calendar"
            sectionKey="daywise"
            expanded={expandedSections.daywise}
            onToggle={() => toggleSection('daywise')}
            colors={colors}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <StatCell
                icon="storefront"
                value={summaryData.retailing}
                label="Retailing"
                accent={colors.success}
                colors={colors}
              />
              <StatCell
                icon="calendar"
                value={summaryData.leaveAbsent}
                label="Leave / Absent"
                accent={colors.warning}
                colors={colors}
              />
              <StatCell
                icon="time"
                value={summaryData.avgRetailingTime}
                label="Avg Retailing"
                accent={colors.info}
                colors={colors}
              />
              <StatCell
                icon="briefcase"
                value={summaryData.officialWork}
                label="Official Work"
                accent={colors.primary}
                colors={colors}
              />
              <StatCell
                icon="checkmark-done"
                value={summaryData.total}
                label="Total Activities"
                accent={colors.primary}
                colors={colors}
              />
              <StatCell
                icon="hourglass"
                value={summaryData.avgTotalTime}
                label="Avg Total Time"
                accent={colors.textTertiary}
                colors={colors}
              />
            </View>
          </Section>

          {/* ── Performance Summary section ──────────────────────────────── */}
          <Section
            title="PERFORMANCE SUMMARY"
            icon="stats-chart"
            sectionKey="performance"
            expanded={expandedSections.performance}
            onToggle={() => toggleSection('performance')}
            colors={colors}
          >
            <SubBadge label="MTD" color={colors.primary} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <StatCell
                icon="call"
                value={performanceData.tc}
                label="Total Calls"
                accent={colors.primary}
                colors={colors}
              />
              <StatCell
                icon="checkmark-circle"
                value={performanceData.pc}
                label="Productive"
                accent={colors.success}
                colors={colors}
              />
              <StatCell
                icon="person"
                value={performanceData.upc}
                label="Unique PC"
                accent={colors.info}
                colors={colors}
              />
              <StatCell
                icon="people"
                value={performanceData.utc}
                label="Unique TC"
                accent={colors.primary}
                colors={colors}
              />
              <StatCell
                icon="location"
                value={performanceData.lpc}
                label="LPC"
                accent={colors.warning}
                colors={colors}
              />
            </View>

            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

            <SubBadge label="AVERAGE METRICS" color={colors.info} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <StatCell
                icon="alarm"
                value={performanceData.avgFirstCall}
                label="Avg First Call"
                accent={colors.info}
                colors={colors}
              />
              <StatCell
                icon="timer"
                value={performanceData.avgFirstPC}
                label="Avg First PC"
                accent={colors.info}
                colors={colors}
              />
              <StatCell
                icon="bar-chart"
                value={performanceData.avgTC}
                label="Avg TC / Day"
                accent={colors.primary}
                colors={colors}
              />
              <StatCell
                icon="trending-up"
                value={performanceData.avgPC}
                label="Avg PC / Day"
                accent={colors.success}
                colors={colors}
              />
            </View>
          </Section>

          {/* ── Van Utilization section ─────────────────────────────────── */}
          <Section
            title="VAN UTILIZATION"
            icon="speedometer"
            sectionKey="vanUtilization"
            expanded={expandedSections.vanUtilization}
            onToggle={() => toggleSection('vanUtilization')}
            colors={colors}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.success + '12',
                borderWidth: 1,
                borderColor: colors.success + '28',
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: T.label.size,
                    fontWeight: '700',
                  }}
                >
                  Current Utilization
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 28,
                    fontWeight: '900',
                    marginTop: 2,
                  }}
                >
                  {formatNumber(vanUtilizationData.utilizationPercentage, 2)}%
                </Text>
              </View>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.success + '18',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="speedometer-outline" size={24} color={colors.success} />
              </View>
            </View>

            <View
              style={{
                borderRadius: 14,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              {[
                {
                  label: 'Opening Stock',
                  value: formatCaseValue(vanUtilizationData.openingStockCases),
                  icon: 'archive-outline',
                  color: colors.info,
                },
                {
                  label: 'Stock top up',
                  value: formatCaseValue(vanUtilizationData.topupStockCases),
                  icon: 'add-circle-outline',
                  color: colors.success,
                },
                {
                  label: 'Total Stock',
                  value: formatCaseValue(vanUtilizationData.totalStockCases),
                  icon: 'cube-outline',
                  color: colors.primary,
                },
                {
                  label: 'Sales',
                  value: formatCaseValue(vanUtilizationData.salesCases),
                  icon: 'cart-outline',
                  color: colors.warning,
                },
              ].map((row, index, rows) => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderBottomWidth: index === rows.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      backgroundColor: row.color + '16',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={row.icon as any} size={15} color={row.color} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      color: colors.textSecondary,
                      fontSize: T.body.size,
                      fontWeight: '700',
                    }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      minWidth: 100,
                      textAlign: 'right',
                      color: colors.textPrimary,
                      fontSize: T.bodyM.size,
                      fontWeight: '900',
                    }}
                    numberOfLines={1}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ marginTop: 14 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 7,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: T.label.size }}>
                  Utilization
                </Text>
                <Text style={{ color: colors.success, fontSize: T.label.size, fontWeight: '800' }}>
                  {formatNumber(vanUtilizationData.utilizationPercentage, 2)}%
                </Text>
              </View>
              <View
                style={{
                  height: 9,
                  borderRadius: 999,
                  backgroundColor: colors.border,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${Math.min(Math.max(vanUtilizationData.utilizationPercentage, 0), 100)}%`,
                    height: '100%',
                    borderRadius: 999,
                    backgroundColor: colors.success,
                  }}
                />
              </View>
            </View>
          </Section>

          {/* Bottom spacing */}
          <View style={{ height: 16 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
}
