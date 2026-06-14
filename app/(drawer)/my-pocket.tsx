// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
// import { useFocusEffect } from 'expo-router';
// import { useTheme } from '@/shared/hooks/useTheme';
// import {
//   homeService,
//   type SalesmanDayWiseSummaryItem,
//   type SalesmanProductSalesGroupBy,
// } from '@/features/home/services/home.service';
// import { ManagerDatePickerModal } from '@/features/home/components/models/ManagerDatePickerModal';
// import { formatLocalApiDate } from '@/shared/utils/date.utils';
// import { AppModal, Skeleton } from '@/core/components';

// const { width } = Dimensions.get('window');

// // Matches the profile screen typography roles.
// const TYPOGRAPHY = {
//   h1: { size: 24, weight: '700' as const, lineHeight: 30 },
//   h2: { size: 16, weight: '600' as const, lineHeight: 22 },
//   h3: { size: 16, weight: '600' as const, lineHeight: 22 },
//   h4: { size: 16, weight: '600' as const, lineHeight: 22 },
//   body: { size: 14, weight: '400' as const, lineHeight: 20 },
//   bodySmall: { size: 11, weight: '400' as const, lineHeight: 15 },
//   caption: { size: 11, weight: '400' as const, lineHeight: 15 },
//   button: { size: 12, weight: '500' as const, lineHeight: 16 },
//   stat: { size: 16, weight: '700' as const, lineHeight: 22 },
//   statSmall: { size: 16, weight: '700' as const, lineHeight: 22 },
//   time: { size: 12, weight: '500' as const, lineHeight: 16 },
// };

// const defaultSummaryData = {
//   retailing: 0,
//   leaveAbsent: '0 / 0',
//   officialWork: 0,
//   total: 0,
//   avgRetailingTime: '--',
//   avgTotalTime: '--',
// };

// const defaultPerformanceData = {
//   tc: 0,
//   pc: 0,
//   upc: 0,
//   utc: 0,
//   lpc: 0,
//   avgFirstCall: '--',
//   avgFirstPC: '--',
//   avgTC: 0,
//   avgPC: 0,
//   achievement: 0,
//   target: 0,
// };

// const defaultProductData = {
//   sc: 0,
//   tc: 0,
//   pc: 0,
//   netValue: 0,
//   cases: 0,
//   lpc: 0,
//   categories: [] as {
//     name: string;
//     value: number;
//     pcs: number;
//     cases: number;
//     growth: number;
//   }[],
// };

// type PocketFilter = 'today' | 'week' | 'month' | 'custom';
// type ProductSalesGroup = SalesmanProductSalesGroupBy;

// type DayWiseSummaryItem = SalesmanDayWiseSummaryItem;

// const filterOptions: { value: PocketFilter; label: string }[] = [
//   { value: 'today', label: 'Today' },
//   { value: 'week', label: 'This Week' },
//   { value: 'month', label: 'Current Month' },
//   { value: 'custom', label: 'Custom Date' },
// ];

// const formatNumber = (value: number, decimals = 0) =>
//   Number(value || 0).toLocaleString(undefined, {
//     minimumFractionDigits: decimals,
//     maximumFractionDigits: decimals,
//   });

// const parseTimeToMinutes = (value?: string | null) => {
//   if (!value) return null;

//   const normalized = value.trim();
//   const match = normalized.match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?$/i);

//   if (!match) return null;

//   let hours = Number(match[1]);
//   const minutes = Number(match[2]);
//   const meridiem = match[3]?.toUpperCase();

//   if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

//   if (meridiem === 'PM' && hours < 12) hours += 12;
//   if (meridiem === 'AM' && hours === 12) hours = 0;

//   return hours * 60 + minutes;
// };

// const formatMinutesToTime = (value: number) => {
//   const hours24 = Math.floor(value / 60) % 24;
//   const minutes = value % 60;
//   const meridiem = hours24 >= 12 ? 'PM' : 'AM';
//   const hours12 = hours24 % 12 || 12;

//   return `${hours12.toString().padStart(2, '0')}:${minutes
//     .toString()
//     .padStart(2, '0')} ${meridiem}`;
// };

// const averageDailyTime = (values: Array<string | null | undefined>) => {
//   const minutes = values.map(parseTimeToMinutes).filter((value): value is number => value !== null);

//   if (!minutes.length) return '--';

//   const averageMinutes = Math.round(
//     minutes.reduce((sum, value) => sum + value, 0) / minutes.length,
//   );

//   return formatMinutesToTime(averageMinutes);
// };

// const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// const getFilterRange = (filter: PocketFilter, customRange: { startDate: Date; endDate: Date }) => {
//   const today = startOfDay(new Date());

//   if (filter === 'today') {
//     return { startDate: today, endDate: today };
//   }

//   if (filter === 'week') {
//     const startDate = new Date(today);
//     startDate.setDate(today.getDate() - today.getDay());
//     return { startDate, endDate: today };
//   }

//   if (filter === 'month') {
//     return {
//       startDate: new Date(today.getFullYear(), today.getMonth(), 1),
//       endDate: today,
//     };
//   }

//   return customRange;
// };

// export default function PocketMISScreen() {
//   const [showProductWiseModal, setShowProductWiseModal] = useState(false);
//   const [showDayWiseModal, setShowDayWiseModal] = useState(false);
//   const [selectedFilter, setSelectedFilter] = useState<PocketFilter>('month');
//   const [selectedCategory, setSelectedCategory] = useState<ProductSalesGroup>('PRIMARYCATEGORY');
//   const [customRange, setCustomRange] = useState(() => {
//     const today = startOfDay(new Date());
//     return { startDate: today, endDate: today };
//   });
//   const [showDateRangePicker, setShowDateRangePicker] = useState(false);
//   const [expandedSection, setExpandedSection] = useState<string | null>('performance');
//   const [summaryData, setSummaryData] = useState(defaultSummaryData);
//   const [performanceData, setPerformanceData] = useState(defaultPerformanceData);
//   const [productData, setProductData] = useState(defaultProductData);
//   const [dayWiseSummary, setDayWiseSummary] = useState<DayWiseSummaryItem[]>([]);
//   const [dayWiseLoading, setDayWiseLoading] = useState(false);
//   const [productWiseLoading, setProductWiseLoading] = useState(false);
//   const [recentActivities, setRecentActivities] = useState<
//     { icon: string; text: string; time: string; color: string }[]
//   >([]);
//   const [loading, setLoading] = useState(true);

//   const scrollY = new Animated.Value(0);
//   const { colors, isDark } = useTheme();
//   const selectedRange = getFilterRange(selectedFilter, customRange);

//   const openDateRangePicker = () => {
//     setSelectedFilter('custom');
//     setShowDateRangePicker(true);
//   };

//   const formatDate = (date: Date) => {
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = date.toLocaleString('default', { month: 'short' });
//     const year = date.getFullYear();
//     return `${day} ${month} ${year}`;
//   };

//   const formatRangeLabel = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
//     if (formatLocalApiDate(startDate) === formatLocalApiDate(endDate)) {
//       return formatDate(startDate);
//     }

//     return `${formatDate(startDate)} - ${formatDate(endDate)}`;
//   };

//   const fetchDayWiseSummary = useCallback(async () => {
//     const range = getFilterRange(selectedFilter, customRange);

//     setDayWiseLoading(true);

//     try {
//       const response = await homeService.getSalesmanDayWiseSummary({
//         startDate: formatLocalApiDate(range.startDate),
//         endDate: formatLocalApiDate(range.endDate),
//       });

//       if (response.success && response.data) {
//         setDayWiseSummary(response.data);
//       }
//     } catch (error) {
//       console.warn('Failed to load day wise summary:', error);
//     } finally {
//       setDayWiseLoading(false);
//     }
//   }, [customRange, selectedFilter]);

//   const openDayWiseSummary = () => {
//     setShowDayWiseModal(true);
//     void fetchDayWiseSummary();
//   };

//   const fetchProductSales = useCallback(async () => {
//     const range = getFilterRange(selectedFilter, customRange);

//     setProductWiseLoading(true);

//     try {
//       const response = await homeService.getSalesmanProductSales({
//         startDate: formatLocalApiDate(range.startDate),
//         endDate: formatLocalApiDate(range.endDate),
//         groupBy: selectedCategory,
//       });

//       if (response.success && response.data) {
//         setProductData({
//           sc: Number(response.data.overview?.sc || 0),
//           tc: Number(response.data.overview?.tc || 0),
//           pc: Number(response.data.overview?.pc || 0),
//           netValue: Number(response.data.overview?.netValue || 0),
//           cases: Number(response.data.overview?.cases || 0),
//           lpc: Number(response.data.overview?.lpc || 0),
//           categories: response.data.categories || [],
//         });
//       }
//     } catch (error) {
//       console.warn('Failed to load product sales:', error);
//       setProductData(defaultProductData);
//     } finally {
//       setProductWiseLoading(false);
//     }
//   }, [customRange, selectedCategory, selectedFilter]);

//   const openProductWiseSummary = () => {
//     setShowProductWiseModal(true);
//   };

//   const getDayStatusDisplay = (item: DayWiseSummaryItem) => {
//     const status =
//       item.dayStatus ||
//       (Number(item.leave || 0) > 0
//         ? 'Leave'
//         : Number(item.retailing || 0) > 0 || Number(item.tc || 0) > 0 || Number(item.pc || 0) > 0
//           ? 'Retailing'
//           : Number(item.officialWork || 0) > 0
//             ? 'Official Work'
//             : 'Absent');

//     if (status === 'Leave') {
//       return {
//         label: 'Leave',
//         value: formatNumber(item.leave || 1),
//         colors: [colors.warning, colors.warningDark] as const,
//       };
//     }

//     if (status === 'Absent') {
//       return {
//         label: 'Absent',
//         value: formatNumber(item.absent || 1),
//         colors: [colors.error, colors.errorDark] as const,
//       };
//     }

//     if (status === 'Official Work') {
//       return {
//         label: 'Official Work',
//         value: formatNumber(item.officialWork || 0),
//         colors: [colors.info, colors.infoDark] as const,
//       };
//     }

//     return {
//       label: 'Retailing',
//       value: formatNumber(item.retailing || 0),
//       colors: colors.gradientSuccess,
//     };
//   };

//   const loadPocketData = useCallback(async () => {
//     setLoading(true);

//     try {
//       const range = getFilterRange(selectedFilter, customRange);
//       const response = await homeService.getSalesmanPocketAndTarget({
//         startDate: formatLocalApiDate(range.startDate),
//         endDate: formatLocalApiDate(range.endDate),
//       });
//       const data = response.data;
//       const pocket = data?.pocket;
//       const target = data?.target;
//       const dayWise = data?.dayWiseSummary || [];

//       setSummaryData({
//         retailing: Number(data?.retailingDays || 0),
//         leaveAbsent: `${dayWise.reduce((sum, item) => sum + Number(item.leave || 0), 0)} / ${dayWise.reduce(
//           (sum, item) => sum + Number(item.absent || 0),
//           0,
//         )}`,
//         officialWork: dayWise.reduce((sum, item) => sum + Number(item.officialWork || 0), 0),
//         total: dayWise.reduce((sum, item) => sum + Number(item.totalActivities || 0), 0),
//         avgRetailingTime: data?.avgRetailingTime || '--',
//         avgTotalTime: data?.avgTotalTime || '--',
//       });

//       setPerformanceData({
//         tc: Number(pocket?.tc || 0),
//         pc: Number(pocket?.pc || 0),
//         upc: Number(pocket?.upc || 0),
//         utc: Number(pocket?.utc || 0),
//         lpc: Number(pocket?.lpc || 0),
//         avgFirstCall:
//           pocket?.avgFirstCallTime || averageDailyTime(dayWise.map((item) => item.firstCallTime)),
//         avgFirstPC:
//           pocket?.avgFirstPcTime || averageDailyTime(dayWise.map((item) => item.firstPcTime)),
//         avgTC: Number(pocket?.avgTc || 0),
//         avgPC: Number(pocket?.avgPc || 0),
//         achievement: Number(target?.achievementPercentage || 0),
//         target: Number(target?.targetCases || 0),
//       });

//       setDayWiseSummary(dayWise);

//       setRecentActivities([
//         {
//           icon: 'checkmark-circle',
//           text: `TC ${formatNumber(Number(pocket?.tc || 0))}, PC ${formatNumber(
//             Number(pocket?.pc || 0),
//           )}`,
//           time: formatRangeLabel(range),
//           color: colors.success,
//         },
//         {
//           icon: 'trending-up',
//           text: `Achievement ${formatNumber(Number(target?.achievementPercentage || 0), 2)}%`,
//           time: `${formatNumber(Number(target?.achievedCases || 0), 2)} cases`,
//           color: colors.primary,
//         },
//         {
//           icon: 'storefront',
//           text: `UPC ${formatNumber(Number(pocket?.upc || 0))}, UTC ${formatNumber(
//             Number(pocket?.utc || 0),
//           )}`,
//           time: `${Number(data?.retailingDays || 0)} retailing days`,
//           color: colors.warning,
//         },
//       ]);
//     } catch (error) {
//       console.warn('Failed to load pocket dashboard:', error);
//       setSummaryData(defaultSummaryData);
//       setPerformanceData(defaultPerformanceData);
//       setDayWiseSummary([]);
//       setRecentActivities([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [colors.primary, colors.success, colors.warning, customRange, selectedFilter]);

//   useFocusEffect(
//     useCallback(() => {
//       loadPocketData();
//     }, [loadPocketData]),
//   );

//   useEffect(() => {
//     if (showProductWiseModal) {
//       void fetchProductSales();
//     }
//   }, [fetchProductSales, showProductWiseModal]);

//   const SummaryItem = ({ value, label, color, labelColor, iconColor, icon, trend }: any) => (
//     <View style={{ width: '33%', alignItems: 'center', marginBottom: 16 }}>
//       {icon && (
//         <View style={{ marginBottom: 4 }}>
//           <Ionicons name={icon} size={16} color={iconColor || color || colors.primary} />
//         </View>
//       )}
//       <Text
//         style={{
//           fontSize: TYPOGRAPHY.stat.size,
//           fontWeight: TYPOGRAPHY.stat.weight,
//           color: colors.textPrimary,
//         }}
//       >
//         {value}
//       </Text>
//       <Text
//         style={{
//           fontSize: TYPOGRAPHY.caption.size,
//           color: labelColor || colors.textSecondary,
//           marginTop: 2,
//           textAlign: 'center',
//         }}
//       >
//         {label}
//       </Text>
//       {trend && (
//         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
//           <Ionicons
//             name={trend > 0 ? 'trending-up' : 'trending-down'}
//             size={8}
//             color={trend > 0 ? colors.success : colors.error}
//           />
//           <Text
//             style={{
//               fontSize: TYPOGRAPHY.caption.size,
//               marginLeft: 2,
//               color: trend > 0 ? colors.success : colors.error,
//             }}
//           >
//             {Math.abs(trend)}%
//           </Text>
//         </View>
//       )}
//     </View>
//   );

//   const SectionHeader = ({ title, icon, section, onPress }: any) => (
//     <TouchableOpacity
//       onPress={onPress}
//       style={{
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 12,
//         paddingVertical: 4,
//       }}
//     >
//       <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//         <View
//           style={{
//             width: 24,
//             height: 24,
//             borderRadius: 6,
//             backgroundColor: colors.primary + '15',
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginRight: 8,
//           }}
//         >
//           <Ionicons name={icon} size={14} color={colors.primary} />
//         </View>
//         <Text
//           style={{
//             fontSize: TYPOGRAPHY.h3.size,
//             fontWeight: TYPOGRAPHY.h3.weight,
//             color: colors.textPrimary,
//           }}
//         >
//           {title}
//         </Text>
//       </View>
//       <Ionicons
//         name={expandedSection === section ? 'chevron-up' : 'chevron-down'}
//         size={18}
//         color={colors.textTertiary}
//       />
//     </TouchableOpacity>
//   );

//   const GradientCard = ({ children, colors: gradientColors, style }: any) => (
//     <LinearGradient
//       colors={gradientColors || colors.gradientPrimary}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={[{ borderRadius: 16, padding: 14, marginBottom: 12 }, style]}
//     >
//       {children}
//     </LinearGradient>
//   );

//   const QuickActionButton = ({ title, icon, onPress, gradient, subtitle }: any) => (
//     <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flex: 1 }}>
//       <LinearGradient
//         colors={gradient}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={{
//           borderRadius: 16,
//           padding: 14,
//           minHeight: 110,
//           justifyContent: 'space-between',
//         }}
//       >
//         <View
//           style={{
//             width: 36,
//             height: 36,
//             borderRadius: 10,
//             backgroundColor: 'rgba(255,255,255,0.2)',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}
//         >
//           <Ionicons name={icon} size={20} color={colors.primaryContrast} />
//         </View>
//         <View>
//           <Text
//             style={{
//               fontSize: TYPOGRAPHY.body.size,
//               fontWeight: '700',
//               lineHeight: 16,
//               color: colors.primaryContrast,
//             }}
//           >
//             {title}
//           </Text>
//           {subtitle && (
//             <Text
//               style={{
//                 fontSize: TYPOGRAPHY.caption.size,
//                 color: colors.primaryContrast + 'CC',
//                 marginTop: 2,
//               }}
//             >
//               {subtitle}
//             </Text>
//           )}
//           <Feather
//             name="arrow-right"
//             size={14}
//             color={colors.primaryContrast}
//             style={{ marginTop: 8 }}
//           />
//         </View>
//       </LinearGradient>
//     </TouchableOpacity>
//   );

//   const SkeletonCard = ({ children, style }: any) => (
//     <View
//       style={[
//         {
//           backgroundColor: colors.surface,
//           borderRadius: 16,
//           padding: 14,
//           borderWidth: 1,
//           borderColor: colors.border,
//         },
//         style,
//       ]}
//     >
//       {children}
//     </View>
//   );

//   const renderPocketSkeleton = () => (
//     <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 40 }}>
//       <View
//         style={{
//           flexDirection: 'row',
//           alignItems: 'flex-start',
//           justifyContent: 'space-between',
//           gap: 14,
//         }}
//       >
//         <View style={{ flex: 1, gap: 8 }}>
//           <Skeleton height={28} width="72%" borderRadius={8} />
//           <Skeleton height={14} width="52%" borderRadius={7} />
//           <Skeleton height={12} width={84} borderRadius={6} />
//         </View>
//         <Skeleton height={34} width={118} borderRadius={12} />
//       </View>

//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 18 }}>
//         {[1, 2, 3, 4].map((item) => (
//           <View key={item} style={{ marginRight: 8 }}>
//             <Skeleton height={34} width={item === 2 ? 104 : 78} borderRadius={18} />
//           </View>
//         ))}
//       </ScrollView>

//       <View style={{ flexDirection: 'row', marginTop: 18, gap: 10 }}>
//         {[1, 2, 3].map((item) => (
//           <SkeletonCard key={item} style={{ flex: 1, minHeight: 110 }}>
//             <Skeleton height={36} width={36} borderRadius={10} />
//             <View style={{ gap: 6, marginTop: 22 }}>
//               <Skeleton height={14} width="88%" borderRadius={7} />
//               <Skeleton height={10} width="58%" borderRadius={5} />
//             </View>
//           </SkeletonCard>
//         ))}
//       </View>

//       <SkeletonCard style={{ marginTop: 18, alignItems: 'center', gap: 12 }}>
//         <Skeleton height={18} width={160} borderRadius={8} />
//         <Skeleton height={12} width="72%" borderRadius={6} />
//         <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
//           <Skeleton height={34} width="48%" borderRadius={12} />
//           <Skeleton height={34} width="48%" borderRadius={12} />
//         </View>
//       </SkeletonCard>

//       {[1, 2].map((section) => (
//         <View key={section} style={{ marginTop: 18 }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
//             <Skeleton height={24} width={24} borderRadius={6} />
//             <View style={{ marginLeft: 8, flex: 1 }}>
//               <Skeleton height={18} width={section === 1 ? 150 : 176} borderRadius={8} />
//             </View>
//             <Skeleton height={18} width={18} variant="circle" />
//           </View>
//           <SkeletonCard>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//               {[1, 2, 3, 4, 5, 6].map((item) => (
//                 <View key={item} style={{ width: '33%', alignItems: 'center', marginBottom: 16 }}>
//                   <Skeleton height={16} width={16} variant="circle" />
//                   <Skeleton height={24} width={42} borderRadius={8} style={{ marginTop: 6 }} />
//                   <Skeleton height={10} width={68} borderRadius={5} style={{ marginTop: 6 }} />
//                 </View>
//               ))}
//             </View>
//           </SkeletonCard>
//         </View>
//       ))}

//       <View style={{ marginTop: 18 }}>
//         <Skeleton height={18} width={132} borderRadius={8} />
//         <SkeletonCard style={{ marginTop: 12, gap: 12 }}>
//           {[1, 2, 3].map((item) => (
//             <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//               <Skeleton height={32} width={32} variant="circle" />
//               <View style={{ flex: 1, gap: 6 }}>
//                 <Skeleton height={14} width="68%" borderRadius={7} />
//                 <Skeleton height={10} width="42%" borderRadius={5} />
//               </View>
//             </View>
//           ))}
//         </SkeletonCard>
//       </View>
//     </View>
//   );

//   const renderDayWiseSkeleton = () => (
//     <View style={{ gap: 12 }}>
//       {[1, 2, 3, 4].map((item) => (
//         <SkeletonCard key={item}>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
//             <Skeleton height={12} width={92} borderRadius={6} />
//             <Skeleton height={18} width={58} borderRadius={9} />
//           </View>
//           <Skeleton height={42} width="100%" borderRadius={10} />
//           <Skeleton height={28} width="100%" borderRadius={8} style={{ marginTop: 10 }} />
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
//             {[1, 2, 3].map((stat) => (
//               <View key={stat} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
//                 <Skeleton height={24} width={24} variant="circle" />
//                 <Skeleton height={14} width={48} borderRadius={7} />
//                 <Skeleton height={10} width={58} borderRadius={5} />
//               </View>
//             ))}
//           </View>
//         </SkeletonCard>
//       ))}
//     </View>
//   );

//   const renderProductWiseSkeleton = () => (
//     <View style={{ gap: 12 }}>
//       {[1, 2, 3, 4, 5].map((item) => (
//         <View key={item} style={{ flexDirection: 'row', paddingVertical: 10, gap: 12 }}>
//           <View style={{ flex: 2, gap: 8 }}>
//             <Skeleton height={14} width="72%" borderRadius={7} />
//             <Skeleton height={16} width="48%" borderRadius={8} />
//             <Skeleton height={10} width={54} borderRadius={5} />
//           </View>
//           <Skeleton height={16} width={34} borderRadius={8} />
//           <Skeleton height={16} width={42} borderRadius={8} />
//         </View>
//       ))}
//     </View>
//   );

//   const closeProductWiseModal = () => setShowProductWiseModal(false);
//   const closeDayWiseModal = () => setShowDayWiseModal(false);

//   const renderProductWiseModal = () => (
//     <AppModal
//       visible={showProductWiseModal}
//       onClose={closeProductWiseModal}
//       size="full"
//       position="top"
//       animation="slide"
//       swipeDirection="up"
//       showHeader={false}
//       showBackdrop={false}
//       style={{ height: '100%', borderRadius: 0 }}
//       contentStyle={{ flex: 1, padding: 0, backgroundColor: colors.background }}
//       closeOnBackdropPress={false}
//     >
//       <>
//         <StatusBar
//           backgroundColor={colors.background}
//           barStyle={isDark ? 'light-content' : 'dark-content'}
//         />

//         <LinearGradient
//           colors={[colors.primary, colors.primaryDark]}
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 14,
//             borderBottomLeftRadius: 20,
//             borderBottomRightRadius: 20,
//           }}
//         >
//           <View
//             style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
//           >
//             <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//               <TouchableOpacity onPress={closeProductWiseModal}>
//                 <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
//               </TouchableOpacity>
//               <Text
//                 style={{
//                   fontSize: TYPOGRAPHY.h2.size,
//                   fontWeight: TYPOGRAPHY.h2.weight,
//                   marginLeft: 12,
//                   color: colors.primaryContrast,
//                 }}
//               >
//                 Product Wise Sales
//               </Text>
//             </View>
//             <TouchableOpacity>
//               <Feather name="download" size={18} color={colors.primaryContrast} />
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>

//         <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 30 }}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={{ marginVertical: 14 }}
//           >
//             {filterOptions.map((item) => (
//               <TouchableOpacity
//                 key={item.value}
//                 onPress={() => {
//                   setSelectedFilter(item.value);
//                   if (item.value === 'custom') setShowDateRangePicker(true);
//                 }}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: colors.primary,
//                   backgroundColor: selectedFilter === item.value ? colors.primary : colors.surface,
//                   borderRadius: 20,
//                   paddingVertical: 6,
//                   paddingHorizontal: 16,
//                   marginRight: 8,
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: TYPOGRAPHY.button.size,
//                     fontWeight: TYPOGRAPHY.button.weight,
//                     color:
//                       selectedFilter === item.value ? colors.primaryContrast : colors.textPrimary,
//                   }}
//                 >
//                   {item.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <View
//             style={{
//               backgroundColor: colors.surface,
//               borderRadius: 14,
//               padding: 14,
//               marginBottom: 12,
//               borderWidth: 1,
//               borderColor: colors.border,
//             }}
//           >
//             <Text
//               style={{
//                 color: colors.textPrimary,
//                 fontSize: TYPOGRAPHY.h4.size,
//                 fontWeight: TYPOGRAPHY.h4.weight,
//                 marginBottom: 10,
//                 textAlign: 'center',
//               }}
//             >
//               Overview
//             </Text>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//               <SummaryItem
//                 value={productData.sc}
//                 label="SC"
//                 icon="stats-chart"
//                 color={colors.textPrimary}
//                 labelColor={colors.textSecondary}
//                 iconColor={colors.primary}
//               />
//               <SummaryItem
//                 value={productData.tc}
//                 label="TC"
//                 icon="time"
//                 color={colors.textPrimary}
//                 labelColor={colors.textSecondary}
//                 iconColor={colors.primary}
//               />
//               <SummaryItem
//                 value={productData.pc}
//                 label="PC"
//                 icon="cart"
//                 color={colors.textPrimary}
//                 labelColor={colors.textSecondary}
//                 iconColor={colors.primary}
//               />
//               <SummaryItem
//                 value={`ZMW ${productData.netValue}`}
//                 label="Net Value"
//                 icon="cash"
//                 color={colors.textPrimary}
//                 labelColor={colors.textSecondary}
//                 iconColor={colors.primary}
//               />
//               <SummaryItem
//                 value={productData.cases}
//                 label="Cases"
//                 icon="cube"
//                 color={colors.textPrimary}
//                 labelColor={colors.textSecondary}
//                 iconColor={colors.primary}
//               />
//               <SummaryItem
//                 value={productData.lpc}
//                 label="LPC"
//                 icon="people"
//                 color={colors.textPrimary}
//                 labelColor={colors.textSecondary}
//                 iconColor={colors.primary}
//               />
//             </View>
//           </View>

//           <View
//             style={{
//               backgroundColor: colors.surface,
//               borderRadius: 14,
//               borderWidth: 1,
//               borderColor: colors.border,
//               marginTop: 8,
//               overflow: 'hidden',
//             }}
//           >
//             <View style={{ flexDirection: 'row' }}>
//               {(['PRIMARYCATEGORY', 'SECONDARYCATEGORY', 'SKU'] as ProductSalesGroup[]).map(
//                 (item) => (
//                   <TouchableOpacity
//                     key={item}
//                     onPress={() => setSelectedCategory(item)}
//                     style={{
//                       flex: 1,
//                       backgroundColor: selectedCategory === item ? colors.primary : colors.surface,
//                       paddingVertical: 10,
//                       alignItems: 'center',
//                     }}
//                   >
//                     <Text
//                       style={{
//                         fontSize: TYPOGRAPHY.caption.size,
//                         fontWeight: '700',
//                         color:
//                           selectedCategory === item ? colors.primaryContrast : colors.textPrimary,
//                       }}
//                     >
//                       {item}
//                     </Text>
//                   </TouchableOpacity>
//                 ),
//               )}
//             </View>
//           </View>

//           <View style={{ marginTop: 14 }}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 marginBottom: 8,
//                 paddingHorizontal: 8,
//                 paddingVertical: 6,
//                 backgroundColor: colors.backgroundSecondary,
//                 borderRadius: 10,
//               }}
//             >
//               <Text
//                 style={{
//                   flex: 2,
//                   fontSize: TYPOGRAPHY.bodySmall.size,
//                   fontWeight: '600',
//                   color: colors.textSecondary,
//                 }}
//               >
//                 Value
//               </Text>
//               <Text
//                 style={{
//                   flex: 1,
//                   textAlign: 'center',
//                   fontSize: TYPOGRAPHY.bodySmall.size,
//                   fontWeight: '600',
//                   color: colors.textSecondary,
//                 }}
//               >
//                 Pcs
//               </Text>
//               <Text
//                 style={{
//                   flex: 1,
//                   textAlign: 'right',
//                   fontSize: TYPOGRAPHY.bodySmall.size,
//                   fontWeight: '600',
//                   color: colors.textSecondary,
//                 }}
//               >
//                 Cases
//               </Text>
//             </View>

//             {productWiseLoading ? (
//               renderProductWiseSkeleton()
//             ) : productData.categories.length === 0 ? (
//               <View style={{ paddingVertical: 18, alignItems: 'center' }}>
//                 <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.bodySmall.size }}>
//                   No product sales available
//                 </Text>
//               </View>
//             ) : (
//               productData.categories.map((item, index) => (
//                 <TouchableOpacity key={index} activeOpacity={0.8}>
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       paddingHorizontal: 8,
//                       paddingVertical: 12,
//                       borderBottomWidth: index < productData.categories.length - 1 ? 1 : 0,
//                       borderBottomColor: colors.border,
//                     }}
//                   >
//                     <View style={{ flex: 2 }}>
//                       <Text
//                         style={{
//                           fontSize: TYPOGRAPHY.bodySmall.size,
//                           fontWeight: '500',
//                           color: colors.textPrimary,
//                         }}
//                       >
//                         {index + 1}. {item.name}
//                       </Text>
//                       <Text
//                         style={{
//                           marginTop: 2,
//                           fontSize: TYPOGRAPHY.body.size,
//                           fontWeight: '500',
//                           color: colors.textPrimary,
//                         }}
//                       >
//                         ZMW {item.value}
//                       </Text>
//                       <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
//                         <Ionicons name="trending-up" size={8} color={colors.success} />
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.caption.size,
//                             color: colors.success,
//                             marginLeft: 2,
//                           }}
//                         >
//                           +{item.growth}%
//                         </Text>
//                       </View>
//                     </View>
//                     <Text
//                       style={{
//                         flex: 1,
//                         textAlign: 'center',
//                         fontSize: TYPOGRAPHY.body.size,
//                         fontWeight: '500',
//                         color: colors.textPrimary,
//                         marginTop: 12,
//                       }}
//                     >
//                       {item.pcs}
//                     </Text>
//                     <Text
//                       style={{
//                         flex: 1,
//                         textAlign: 'right',
//                         fontSize: TYPOGRAPHY.body.size,
//                         fontWeight: '500',
//                         color: colors.textPrimary,
//                         marginTop: 12,
//                       }}
//                     >
//                       {item.cases}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               ))
//             )}
//           </View>
//         </ScrollView>

//         <ManagerDatePickerModal
//           visible={showDateRangePicker}
//           value={customRange.startDate}
//           rangeValue={customRange}
//           mode="range"
//           title="Select custom date range"
//           onClose={() => setShowDateRangePicker(false)}
//           onApply={() => {}}
//           onApplyRange={(range) => setCustomRange(range)}
//         />
//       </>
//     </AppModal>
//   );

//   const renderDayWiseModal = () => (
//     <AppModal
//       visible={showDayWiseModal}
//       onClose={closeDayWiseModal}
//       size="full"
//       position="top"
//       animation="slide"
//       swipeDirection="up"
//       showHeader={false}
//       showBackdrop={false}
//       style={{ height: '100%', borderRadius: 0 }}
//       contentStyle={{ flex: 1, padding: 0, backgroundColor: colors.background }}
//       closeOnBackdropPress={false}
//     >
//       <>
//         <LinearGradient
//           colors={[colors.primary, colors.primaryDark]}
//           style={{
//             paddingHorizontal: 16,
//             paddingVertical: 14,
//             borderBottomLeftRadius: 20,
//             borderBottomRightRadius: 20,
//           }}
//         >
//           <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//             <TouchableOpacity onPress={closeDayWiseModal}>
//               <Ionicons name="arrow-back" size={22} color={colors.primaryContrast} />
//             </TouchableOpacity>
//             <Text
//               style={{
//                 fontSize: TYPOGRAPHY.h2.size,
//                 fontWeight: TYPOGRAPHY.h2.weight,
//                 marginLeft: 12,
//                 color: colors.primaryContrast,
//               }}
//             >
//               Day Wise Summary
//             </Text>
//           </View>
//         </LinearGradient>

//         <ScrollView
//           contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 30 }}
//         >
//           {dayWiseLoading ? (
//             renderDayWiseSkeleton()
//           ) : dayWiseSummary.length === 0 ? (
//             <View style={{ paddingVertical: 28, alignItems: 'center' }}>
//               <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.bodySmall.size }}>
//                 No day wise summary available
//               </Text>
//             </View>
//           ) : (
//             dayWiseSummary.map((item) => {
//               const statusDisplay = getDayStatusDisplay(item);

//               return (
//                 <TouchableOpacity key={item.date} activeOpacity={0.9}>
//                   <View
//                     style={{
//                       backgroundColor: colors.surface,
//                       borderRadius: 14,
//                       padding: 14,
//                       borderWidth: 1,
//                       borderColor: colors.border,
//                       marginBottom: 12,
//                     }}
//                   >
//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         marginBottom: 8,
//                       }}
//                     >
//                       <Text
//                         style={{
//                           fontSize: TYPOGRAPHY.bodySmall.size,
//                           color: colors.textSecondary,
//                           fontWeight: '400',
//                         }}
//                       >
//                         {item.label}
//                       </Text>
//                       <View
//                         style={{
//                           backgroundColor: colors.successLight,
//                           paddingHorizontal: 6,
//                           paddingVertical: 2,
//                           borderRadius: 8,
//                         }}
//                       >
//                         <Text
//                           style={{
//                             color: colors.success,
//                             fontSize: TYPOGRAPHY.caption.size,
//                             fontWeight: '600',
//                           }}
//                         >
//                           PC {formatNumber(item.pc)}
//                         </Text>
//                       </View>
//                     </View>

//                     <LinearGradient
//                       colors={statusDisplay.colors}
//                       style={{ borderRadius: 10, overflow: 'hidden', marginVertical: 8 }}
//                     >
//                       <View
//                         style={{
//                           flexDirection: 'row',
//                           justifyContent: 'space-between',
//                           alignItems: 'center',
//                           padding: 10,
//                         }}
//                       >
//                         <Text
//                           style={{
//                             color: colors.primaryContrast,
//                             fontWeight: '700',
//                             fontSize: TYPOGRAPHY.body.size,
//                           }}
//                         >
//                           {statusDisplay.label}
//                         </Text>
//                         <Text
//                           style={{
//                             color: colors.primaryContrast,
//                             fontSize: TYPOGRAPHY.statSmall.size,
//                             fontWeight: '800',
//                           }}
//                         >
//                           {statusDisplay.value}
//                         </Text>
//                       </View>
//                     </LinearGradient>

//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         marginTop: 6,
//                         padding: 6,
//                         backgroundColor: colors.backgroundSecondary,
//                         borderRadius: 8,
//                       }}
//                     >
//                       <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
//                       <Text
//                         style={{
//                           marginLeft: 4,
//                           fontSize: TYPOGRAPHY.caption.size,
//                           color: colors.textSecondary,
//                           flex: 1,
//                         }}
//                       >
//                         TC {formatNumber(item.tc)} | UPC {formatNumber(item.upc)} | Cases{' '}
//                         {formatNumber(item.cases, 2)} | ZMW {formatNumber(item.netValue, 2)}
//                       </Text>
//                     </View>

//                     <View
//                       style={{
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                         marginTop: 12,
//                         paddingTop: 10,
//                         borderTopWidth: 1,
//                         borderTopColor: colors.border,
//                       }}
//                     >
//                       {[
//                         { label: 'First Call', value: item.firstCallTime || '--' },
//                         { label: 'First PC', value: item.firstPcTime || '--' },
//                         { label: 'TC', value: formatNumber(item.tc) },
//                       ].map((stat, i) => (
//                         <View key={i} style={{ alignItems: 'center', flex: 1 }}>
//                           <View
//                             style={{
//                               width: 24,
//                               height: 24,
//                               borderRadius: 12,
//                               backgroundColor: colors.primaryLight + '20',
//                               justifyContent: 'center',
//                               alignItems: 'center',
//                               marginBottom: 2,
//                             }}
//                           >
//                             <Ionicons
//                               name={
//                                 i === 0
//                                   ? 'call-outline'
//                                   : i === 1
//                                     ? 'phone-portrait-outline'
//                                     : 'time-outline'
//                               }
//                               size={12}
//                               color={colors.primary}
//                             />
//                           </View>
//                           <Text
//                             style={{
//                               fontSize:
//                                 i === 2 ? TYPOGRAPHY.statSmall.size : TYPOGRAPHY.bodySmall.size,
//                               fontWeight: '500',
//                               color: colors.textPrimary,
//                             }}
//                           >
//                             {stat.value}
//                           </Text>
//                           <Text
//                             style={{
//                               marginTop: 2,
//                               fontSize: TYPOGRAPHY.caption.size,
//                               color: colors.textSecondary,
//                             }}
//                           >
//                             {stat.label}
//                           </Text>
//                         </View>
//                       ))}
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })
//           )}
//         </ScrollView>
//       </>
//     </AppModal>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
//       {/* <StatusBar
//         backgroundColor={colors.background}
//         barStyle={isDark ? 'light-content' : 'dark-content'}
//       /> */}

//       {renderProductWiseModal()}
//       {renderDayWiseModal()}
//       {!showProductWiseModal && (
//         <ManagerDatePickerModal
//           visible={showDateRangePicker}
//           value={customRange.startDate}
//           rangeValue={customRange}
//           mode="range"
//           title="Select custom date range"
//           onClose={() => setShowDateRangePicker(false)}
//           onApply={() => {}}
//           onApplyRange={(range) => setCustomRange(range)}
//         />
//       )}

//       {loading ? (
//         <ScrollView
//           contentContainerStyle={{ paddingBottom: 40 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {renderPocketSkeleton()}
//         </ScrollView>
//       ) : (
//         <Animated.ScrollView
//           contentContainerStyle={{ paddingBottom: 40 }}
//           showsVerticalScrollIndicator={false}
//           onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
//             useNativeDriver: false,
//           })}
//           scrollEventThrottle={16}
//         >
//           {/* HEADER */}
//           <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 }}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 alignItems: 'flex-start',
//               }}
//             >
//               <View>
//                 <Text
//                   style={{
//                     fontSize: TYPOGRAPHY.h1.size,
//                     fontWeight: TYPOGRAPHY.h1.weight,
//                     color: colors.textPrimary,
//                   }}
//                 >
//                   My Pocket MIS
//                 </Text>
//                 <Text
//                   style={{
//                     marginTop: 2,
//                     fontSize: TYPOGRAPHY.body.size,
//                     color: colors.textSecondary,
//                   }}
//                 >
//                   Performance Dashboard
//                 </Text>
//                 <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
//                   <View
//                     style={{
//                       width: 5,
//                       height: 5,
//                       borderRadius: 2.5,
//                       backgroundColor: colors.success,
//                       marginRight: 4,
//                     }}
//                   />
//                   <Text
//                     style={{
//                       fontSize: TYPOGRAPHY.caption.size,
//                       color: colors.success,
//                       fontWeight: '600',
//                     }}
//                   >
//                     Live Updates
//                   </Text>
//                 </View>
//               </View>

//               <TouchableOpacity
//                 onPress={openDateRangePicker}
//                 style={{
//                   backgroundColor: colors.surface,
//                   borderRadius: 12,
//                   paddingHorizontal: 10,
//                   paddingVertical: 6,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                 }}
//               >
//                 <Ionicons name="calendar-outline" size={14} color={colors.primary} />
//                 <Text
//                   style={{
//                     marginLeft: 4,
//                     fontSize: TYPOGRAPHY.time.size,
//                     fontWeight: '600',
//                     color: colors.textPrimary,
//                   }}
//                 >
//                   {formatRangeLabel(selectedRange)}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
//               {filterOptions.map((item) => {
//                 const active = selectedFilter === item.value;

//                 return (
//                   <TouchableOpacity
//                     key={item.value}
//                     activeOpacity={0.82}
//                     onPress={() => {
//                       setSelectedFilter(item.value);
//                       if (item.value === 'custom') setShowDateRangePicker(true);
//                     }}
//                     style={{
//                       borderWidth: 1,
//                       borderColor: active ? colors.primary : colors.border,
//                       backgroundColor: active ? colors.primary : colors.surface,
//                       borderRadius: 18,
//                       paddingVertical: 7,
//                       paddingHorizontal: 14,
//                       marginRight: 8,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         fontSize: TYPOGRAPHY.button.size,
//                         fontWeight: TYPOGRAPHY.button.weight,
//                         color: active ? colors.primaryContrast : colors.textPrimary,
//                       }}
//                     >
//                       {item.label}
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </ScrollView>
//           </View>

//           {/* QUICK ACTION BUTTONS */}
//           <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 18, gap: 10 }}>
//             <QuickActionButton
//               title="Day Wise Summary"
//               subtitle=""
//               icon="calendar-outline"
//               onPress={openDayWiseSummary}
//               gradient={colors.gradientPrimary}
//             />
//             <QuickActionButton
//               title="Product Sales"
//               subtitle=""
//               icon="cube-outline"
//               onPress={openProductWiseSummary}
//               gradient={colors.gradientSuccess}
//             />
//             <QuickActionButton
//               title="Dispatch Status"
//               subtitle=""
//               icon="car-outline"
//               onPress={() => {}}
//               gradient={[colors.warning, colors.warningDark] as const}
//             />
//           </View>

//           {/* SHARE CARD */}
//           <GradientCard
//             colors={[colors.secondary, colors.secondaryDark]}
//             style={{ marginHorizontal: 16, marginTop: 18 }}
//           >
//             <Text
//               style={{
//                 textAlign: 'center',
//                 fontSize: TYPOGRAPHY.h4.size,
//                 fontWeight: '800',
//                 color: colors.secondaryContrast,
//                 marginBottom: 4,
//               }}
//             >
//               Share Your Progress
//             </Text>
//             <Text
//               style={{
//                 textAlign: 'center',
//                 fontSize: TYPOGRAPHY.caption.size,
//                 color: colors.secondaryContrast + 'CC',
//                 marginBottom: 14,
//               }}
//             >
//               Keep your manager updated with daily achievements
//             </Text>
//             <View style={{ flexDirection: 'row', gap: 10 }}>
//               {['SHARE MSR', 'SHARE DSR'].map((item, index) => (
//                 <TouchableOpacity key={index} style={{ flex: 1 }}>
//                   <LinearGradient
//                     colors={
//                       index === 0
//                         ? [colors.surface, colors.backgroundSecondary]
//                         : ['#1E293B', '#0F172A']
//                     }
//                     style={{
//                       paddingVertical: 8,
//                       borderRadius: 12,
//                       alignItems: 'center',
//                       flexDirection: 'row',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     <Ionicons
//                       name="share-social-outline"
//                       size={14}
//                       color={index === 0 ? colors.primary : colors.primaryContrast}
//                     />
//                     <Text
//                       style={{
//                         marginLeft: 4,
//                         fontSize: TYPOGRAPHY.button.size,
//                         fontWeight: '600',
//                         color: index === 0 ? colors.primary : colors.primaryContrast,
//                       }}
//                     >
//                       {item}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </GradientCard>

//           {/* ACHIEVEMENT CARD */}
//           {/* <View style={{ marginHorizontal: 16, marginTop: 18 }}>
//           <LinearGradient
//             colors={[colors.info, colors.primary]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={{ borderRadius: 16, padding: 14 }}
//           >
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: 8,
//               }}
//             >
//               <Text
//                 style={{
//                   color: colors.primaryContrast,
//                   fontSize: TYPOGRAPHY.h4.size,
//                   fontWeight: '800',
//                 }}
//               >
//                 Monthly Target
//               </Text>
//               <FontAwesome5 name="medal" size={18} color={colors.primaryContrast} />
//             </View>
//             <View style={{ alignItems: 'center', marginBottom: 8 }}>
//               <Text style={{ color: colors.primaryContrast, fontSize: 28, fontWeight: '800' }}>
//                 {performanceData.achievement}%
//               </Text>
//               <Text
//                 style={{
//                   color: colors.primaryContrast + 'CC',
//                   fontSize: TYPOGRAPHY.caption.size,
//                   marginTop: 2,
//                 }}
//               >
//                 Achievement Rate
//               </Text>
//             </View>
//             <View
//               style={{
//                 width: '100%',
//                 height: 5,
//                 backgroundColor: 'rgba(255,255,255,0.2)',
//                 borderRadius: 2.5,
//                 overflow: 'hidden',
//               }}
//             >
//               <LinearGradient
//                 colors={colors.gradientSuccess}
//                 style={{
//                   width: `${performanceData.achievement}%`,
//                   height: '100%',
//                   borderRadius: 2.5,
//                 }}
//               />
//             </View>
//             <Text
//               style={{
//                 color: colors.primaryContrast + 'CC',
//                 fontSize: TYPOGRAPHY.caption.size,
//                 textAlign: 'center',
//                 marginTop: 6,
//               }}
//             >
//               Target: {performanceData.target} | Achieved: {performanceData.achievement}
//             </Text>
//           </LinearGradient>
//         </View> */}

//           {/* DAY WISE SUMMARY SECTION */}
//           <View style={{ marginTop: 22, marginHorizontal: 16 }}>
//             <SectionHeader
//               title="DAY WISE SUMMARY"
//               icon="calendar"
//               section="daywise"
//               onPress={() => setExpandedSection(expandedSection === 'daywise' ? null : 'daywise')}
//             />
//             {expandedSection === 'daywise' && (
//               <View
//                 style={{
//                   backgroundColor: colors.surface,
//                   borderRadius: 16,
//                   padding: 14,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                 }}
//               >
//                 <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//                   <SummaryItem
//                     value={summaryData.retailing}
//                     label="Retailing"
//                     color={colors.success}
//                     icon="storefront"
//                     trend={12}
//                   />
//                   <SummaryItem
//                     value={summaryData.leaveAbsent}
//                     label="Leave / Absent"
//                     color={colors.warning}
//                     icon="calendar"
//                   />
//                   <SummaryItem
//                     value={summaryData.avgRetailingTime}
//                     label="Avg. Retailing Time"
//                     icon="time"
//                     color={colors.info}
//                   />
//                   <SummaryItem
//                     value={summaryData.officialWork}
//                     label="Official Work"
//                     icon="briefcase"
//                     color={colors.success}
//                   />
//                   <SummaryItem
//                     value={summaryData.total}
//                     label="Total Activities"
//                     icon="checkmark-done"
//                     color={colors.primary}
//                   />
//                   <SummaryItem
//                     value={summaryData.avgTotalTime}
//                     label="Avg. Total Time"
//                     icon="hourglass"
//                     color={colors.textTertiary}
//                   />
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* PERFORMANCE SUMMARY SECTION */}
//           <View style={{ marginTop: 14, marginHorizontal: 16 }}>
//             <SectionHeader
//               title="PERFORMANCE SUMMARY"
//               icon="stats-chart"
//               section="performance"
//               onPress={() =>
//                 setExpandedSection(expandedSection === 'performance' ? null : 'performance')
//               }
//             />
//             {expandedSection === 'performance' && (
//               <View
//                 style={{
//                   backgroundColor: colors.surface,
//                   borderRadius: 16,
//                   padding: 14,
//                   borderWidth: 1,
//                   borderColor: colors.border,
//                 }}
//               >
//                 <View
//                   style={{
//                     backgroundColor: colors.primaryLight + '20',
//                     paddingHorizontal: 8,
//                     paddingVertical: 3,
//                     borderRadius: 8,
//                     alignSelf: 'flex-start',
//                     marginBottom: 12,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontWeight: '700',
//                       color: colors.primary,
//                       fontSize: TYPOGRAPHY.caption.size,
//                     }}
//                   >
//                     MTD
//                   </Text>
//                 </View>
//                 <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//                   <SummaryItem
//                     value={performanceData.tc}
//                     label="Total Calls"
//                     icon="call"
//                     color={colors.primary}
//                     trend={5}
//                   />
//                   <SummaryItem
//                     value={performanceData.pc}
//                     label="Productive Calls"
//                     icon="checkmark-circle"
//                     color={colors.success}
//                     trend={8}
//                   />
//                   <SummaryItem
//                     value={performanceData.upc}
//                     label="Unique PC"
//                     icon="person"
//                     color={colors.info}
//                   />
//                   <SummaryItem
//                     value={performanceData.utc}
//                     label="Unique TC"
//                     icon="people"
//                     color={colors.primary}
//                   />
//                   <SummaryItem
//                     value={performanceData.lpc}
//                     label="LPC"
//                     icon="location"
//                     color={colors.warning}
//                     trend={-2}
//                   />
//                 </View>

//                 <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />

//                 <View
//                   style={{
//                     backgroundColor: colors.infoLight + '20',
//                     paddingHorizontal: 8,
//                     paddingVertical: 3,
//                     borderRadius: 8,
//                     alignSelf: 'flex-start',
//                     marginBottom: 12,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontWeight: '700',
//                       color: colors.info,
//                       fontSize: TYPOGRAPHY.caption.size,
//                     }}
//                   >
//                     AVERAGE METRICS
//                   </Text>
//                 </View>
//                 <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//                   <SummaryItem
//                     value={performanceData.avgFirstCall}
//                     label="Avg First Call Time"
//                     icon="alarm"
//                     color={colors.info}
//                   />
//                   <SummaryItem
//                     value={performanceData.avgFirstPC}
//                     label="Avg First PC Time"
//                     icon="timer"
//                     color={colors.info}
//                   />
//                   <SummaryItem
//                     value={performanceData.avgTC}
//                     label="Avg TC/Day"
//                     icon="bar-chart"
//                     color={colors.primary}
//                   />
//                   <SummaryItem
//                     value={performanceData.avgPC}
//                     label="Avg PC/Day"
//                     icon="trending-up"
//                     color={colors.success}
//                   />
//                 </View>
//               </View>
//             )}
//           </View>

//           {/* RECENT ACTIVITIES */}
//           <View style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 24 }}>
//             <Text
//               style={{
//                 fontSize: TYPOGRAPHY.h3.size,
//                 fontWeight: TYPOGRAPHY.h3.weight,
//                 marginBottom: 12,
//                 color: colors.textPrimary,
//               }}
//             >
//               Recent Activities
//             </Text>
//             <View
//               style={{
//                 backgroundColor: colors.surface,
//                 borderRadius: 16,
//                 padding: 12,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//             >
//               {recentActivities.length === 0 ? (
//                 <View style={{ paddingVertical: 20, alignItems: 'center' }}>
//                   <Text
//                     style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.bodySmall.size }}
//                   >
//                     No recent activity available
//                   </Text>
//                 </View>
//               ) : (
//                 recentActivities.map((item, index) => (
//                   <View
//                     key={index}
//                     style={{
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       paddingVertical: 8,
//                       borderBottomWidth: index < recentActivities.length - 1 ? 1 : 0,
//                       borderBottomColor: colors.border,
//                     }}
//                   >
//                     <View
//                       style={{
//                         width: 32,
//                         height: 32,
//                         borderRadius: 16,
//                         backgroundColor: item.color + '20',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                       }}
//                     >
//                       <Ionicons name={item.icon as any} size={16} color={item.color} />
//                     </View>
//                     <View style={{ flex: 1, marginLeft: 8 }}>
//                       <Text
//                         style={{
//                           fontSize: TYPOGRAPHY.body.size,
//                           fontWeight: '500',
//                           color: colors.textPrimary,
//                         }}
//                       >
//                         {item.text}
//                       </Text>
//                       <Text
//                         style={{
//                           fontSize: TYPOGRAPHY.caption.size,
//                           color: colors.textSecondary,
//                           marginTop: 1,
//                         }}
//                       >
//                         {item.time}
//                       </Text>
//                     </View>
//                     <Feather name="more-horizontal" size={14} color={colors.textTertiary} />
//                   </View>
//                 ))
//               )}
//             </View>
//           </View>
//         </Animated.ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

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
type PocketFilter = 'today' | 'week' | 'month' | 'custom';
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
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
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
  if (filter === 'week') {
    const s = new Date(today);
    s.setDate(today.getDate() - today.getDay());
    return { startDate: s, endDate: today };
  }
  if (filter === 'month') {
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
  const [selectedFilter, setSelectedFilter] = useState<PocketFilter>('month');
  const [selectedCategory, setSelectedCategory] = useState<ProductSalesGroup>('PRIMARYCATEGORY');
  const [customRange, setCustomRange] = useState(() => {
    const today = startOfDay(new Date());
    return { startDate: today, endDate: today };
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('vanUtilization');
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
        setDispatchStatus(data.orders || data.items || data.records || []);
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
                      { label: 'Value', value: `ZMW ${formatNumber(Number(item.netValue || 0), 2)}` },
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
            expanded={expandedSection === 'daywise'}
            onToggle={() => setExpandedSection(expandedSection === 'daywise' ? null : 'daywise')}
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

          {/* ── Van Utilization section ─────────────────────────────────── */}
          <Section
            title="VAN UTILIZATION"
            icon="speedometer"
            sectionKey="vanUtilization"
            expanded={expandedSection === 'vanUtilization'}
            onToggle={() =>
              setExpandedSection(expandedSection === 'vanUtilization' ? null : 'vanUtilization')
            }
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
                <Text
                  style={{ color: colors.success, fontSize: T.label.size, fontWeight: '800' }}
                >
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

          {/* ── Performance Summary section ──────────────────────────────── */}
          <Section
            title="PERFORMANCE SUMMARY"
            icon="stats-chart"
            sectionKey="performance"
            expanded={expandedSection === 'performance'}
            onToggle={() =>
              setExpandedSection(expandedSection === 'performance' ? null : 'performance')
            }
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

          {/* Bottom spacing */}
          <View style={{ height: 16 }} />
        </Animated.ScrollView>
      )}
    </View>
  );
}
