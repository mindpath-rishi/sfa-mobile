// import React, { useCallback, useState } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useFocusEffect } from 'expo-router';
// import Svg, { Text as SvgText, Circle } from 'react-native-svg';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { useHeader } from '@/shared/contexts/HeaderContext';
// import {
//   homeService,
//   type SalesmanPocketTargetResponse,
//   type TargetMetric,
// } from '@/features/home/services/home.service';
// import { formatLocalApiDate } from '@/shared/utils/date.utils';
// import { Skeleton } from '@/core/components';
// import Animated from 'react-native-reanimated';

// // Matches the profile screen typography roles.
// const TYPOGRAPHY = {
//   h1: { size: 24, weight: '700' as const, lineHeight: 30 },
//   section: { size: 16, weight: '600' as const, lineHeight: 22 },
//   value: { size: 16, weight: '700' as const, lineHeight: 22 },
//   body: { size: 14, weight: '400' as const, lineHeight: 20 },
//   label: { size: 11, weight: '400' as const, lineHeight: 15 },
//   button: { size: 12, weight: '500' as const, lineHeight: 16 },
// };

// type TargetDashboardData = {
//   progress: number;
//   achieved: number;
//   target: number;
//   remaining: number;
//   rrr: number;
//   crr: number;
//   growth: number;
//   weeklyData: { week: string; progress: number; date: string }[];
//   lmtd: number;
//   mtd: number;
//   crrValue: number;
//   improvement: number;
//   asOfLabel: string;
// };

// const metricOptions: { value: TargetMetric; label: string }[] = [
//   { value: 'tonnage', label: 'Tonnage' },
//   { value: 'cases', label: 'Cases' },
//   { value: 'value', label: 'Value' },
// ];

// const metricLabels: Record<TargetMetric, string> = {
//   cases: 'Cases',
//   tonnage: 'Tonnage',
//   value: 'Value',
// };

// const emptyTargetData: TargetDashboardData = {
//   progress: 0,
//   achieved: 0,
//   target: 0,
//   remaining: 0,
//   rrr: 0,
//   crr: 0,
//   growth: 0,
//   weeklyData: [
//     { week: 'Week 1', progress: 0, date: '' },
//     { week: 'Week 2', progress: 0, date: '' },
//     { week: 'Week 3', progress: 0, date: '' },
//     { week: 'Week 4', progress: 0, date: '' },
//   ],
//   lmtd: 0,
//   mtd: 0,
//   crrValue: 0,
//   improvement: 0,
//   asOfLabel: '',
// };

// const buildWeeklyData = (progress: number) =>
//   [0.25, 0.5, 0.75, 1].map((factor, index) => ({
//     week: `Week ${index + 1}`,
//     progress: Number((progress * factor).toFixed(2)),
//     date: '',
//   }));

// const formatNumber = (value: number, metric: TargetMetric) => {
//   const safeValue = Number.isFinite(value) ? value : 0;

//   if (metric === 'value') {
//     return Math.round(safeValue).toLocaleString('en-IN');
//   }

//   return safeValue.toLocaleString('en-IN', {
//     maximumFractionDigits: metric === 'tonnage' ? 2 : 0,
//   });
// };

// const formatPercent = (value: number) =>
//   Number.isFinite(value) ? Number(value.toFixed(2)).toString() : '0';

// const formatDateLabel = (date?: string) => {
//   const parsedDate = date ? new Date(date) : new Date();

//   if (Number.isNaN(parsedDate.getTime())) {
//     return '';
//   }

//   return parsedDate.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// };

// const mapTargetResponse = (
//   data: SalesmanPocketTargetResponse | undefined,
//   metric: TargetMetric,
// ): TargetDashboardData => {
//   const target = data?.target;
//   const selected = target?.selected;
//   const achieved = Number(
//     selected?.achieved ??
//       (metric === 'tonnage'
//         ? target?.achievedTonnage
//         : metric === 'value'
//           ? target?.achievedValue
//           : target?.achievedCases) ??
//       0,
//   );
//   const targetValue = Number(
//     selected?.target ??
//       (metric === 'tonnage'
//         ? target?.targetTonnage
//         : metric === 'value'
//           ? target?.targetValue
//           : target?.targetCases) ??
//       0,
//   );
//   const progress = Number(selected?.achievementPercentage ?? target?.achievementPercentage ?? 0);
//   const remaining = Number(
//     selected?.remaining ??
//       (metric === 'tonnage'
//         ? target?.remainingTonnage
//         : metric === 'value'
//           ? target?.remainingValue
//           : target?.remainingCases) ??
//       Math.max(targetValue - achieved, 0),
//   );
//   const rrr = Number(selected?.rrr ?? target?.rrr ?? 0);
//   const crr = Number(selected?.crr ?? target?.crr ?? 0);

//   return {
//     progress,
//     achieved,
//     target: targetValue,
//     remaining,
//     rrr: Number(rrr.toFixed(2)),
//     crr: Number(crr.toFixed(2)),
//     growth: Number(selected?.improvement ?? progress),
//     weeklyData: buildWeeklyData(progress),
//     lmtd: Number(selected?.lmtd ?? 0),
//     mtd: Number(selected?.mtd ?? progress),
//     crrValue: Number(crr.toFixed(2)),
//     improvement: Number(selected?.improvement ?? 0),
//     asOfLabel: formatDateLabel(data?.endDate),
//   };
// };

// export default function TargetDashboard() {
//   const { colors } = useTheme();
//   const { setHeader } = useHeader();
//   const [selectedPeriod, setSelectedPeriod] = useState<'lastMonth' | 'currentMonth'>(
//     'currentMonth',
//   );
//   const [selectedMetric, setSelectedMetric] = useState<TargetMetric>('cases');
//   const [currentMonthData, setCurrentMonthData] = useState<TargetDashboardData>(emptyTargetData);
//   const [lastMonthData, setLastMonthData] = useState<TargetDashboardData>(emptyTargetData);
//   const [loading, setLoading] = useState(true);

//   const loadTarget = useCallback(async () => {
//     setLoading(true);

//     try {
//       const now = new Date();
//       const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
//       const lastMonthDate = formatLocalApiDate(lastMonthEnd);
//       const [targetResponse, lastTargetResponse] = await Promise.all([
//         homeService.getSalesmanPocketAndTarget({ metric: selectedMetric }),
//         homeService.getSalesmanPocketAndTarget({ date: lastMonthDate, metric: selectedMetric }),
//       ]);

//       setCurrentMonthData(mapTargetResponse(targetResponse.data, selectedMetric));
//       setLastMonthData(mapTargetResponse(lastTargetResponse.data, selectedMetric));
//     } catch (error) {
//       console.warn('Failed to load target dashboard:', error);
//       setCurrentMonthData(emptyTargetData);
//       setLastMonthData(emptyTargetData);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedMetric]);

//   useFocusEffect(
//     useCallback(() => {
//       setHeader({
//         title: 'My Target',
//         showBack: true,
//         showMenu: false,
//         showFilter: false,
//         backgroundColor: colors.primary,
//       });
//       loadTarget();
//     }, [colors.primary, loadTarget, setHeader]),
//   );

//   const currentData = selectedPeriod === 'currentMonth' ? currentMonthData : lastMonthData;
//   const selectedMetricLabel = metricLabels[selectedMetric];
//   const targetProgress =
//     currentData.target > 0 ? Math.min((currentData.achieved / currentData.target) * 100, 100) : 0;

//   const SkeletonCard = ({ children, style }: any) => (
//     <View
//       style={[
//         {
//           backgroundColor: colors.surface,
//           borderRadius: 16,
//           padding: 16,
//           borderWidth: 1,
//           borderColor: colors.border,
//         },
//         style,
//       ]}
//     >
//       {children}
//     </View>
//   );

//   const renderTargetSkeleton = () => (
//     <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 }}>
//       <SkeletonCard>
//         <Skeleton height={14} width={150} borderRadius={7} />
//         <Skeleton height={12} width={118} borderRadius={6} style={{ marginTop: 8 }} />
//         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 22 }}>
//           <Skeleton height={120} width={120} variant="circle" />
//           <View style={{ flex: 1, gap: 14 }}>
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
//               <View style={{ flex: 1, gap: 8 }}>
//                 <Skeleton height={10} width={64} borderRadius={5} />
//                 <Skeleton height={20} width="82%" borderRadius={8} />
//               </View>
//               <View style={{ flex: 1, gap: 8 }}>
//                 <Skeleton height={10} width={54} borderRadius={5} />
//                 <Skeleton height={20} width="82%" borderRadius={8} />
//               </View>
//             </View>
//             <Skeleton height={38} width="100%" borderRadius={12} />
//           </View>
//         </View>
//       </SkeletonCard>

//       <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
//         {[1, 2].map((item) => (
//           <SkeletonCard key={item} style={{ flex: 1, minHeight: 138 }}>
//             <Skeleton height={44} width={44} borderRadius={14} />
//             <Skeleton height={10} width={42} borderRadius={5} style={{ marginTop: 14 }} />
//             <Skeleton height={20} width="64%" borderRadius={8} style={{ marginTop: 8 }} />
//             <Skeleton height={10} width="86%" borderRadius={5} style={{ marginTop: 8 }} />
//           </SkeletonCard>
//         ))}
//       </View>

//       <SkeletonCard style={{ marginTop: 16 }}>
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
//           <Skeleton height={18} width={112} borderRadius={8} />
//           <Skeleton height={12} width={92} borderRadius={6} />
//         </View>
//         {[1, 2].map((item) => (
//           <View
//             key={item}
//             style={{
//               backgroundColor: colors.background,
//               borderRadius: 14,
//               paddingVertical: 12,
//               paddingHorizontal: 14,
//               marginBottom: item === 1 ? 12 : 0,
//             }}
//           >
//             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//               <Skeleton height={16} width={40} borderRadius={8} />
//               <View style={{ flex: 1, gap: 8 }}>
//                 <Skeleton height={18} width={64} borderRadius={8} />
//                 <Skeleton height={10} width={92} borderRadius={5} />
//               </View>
//               <View style={{ alignItems: 'center', gap: 6 }}>
//                 <Skeleton height={10} width={36} borderRadius={5} />
//                 <Skeleton height={14} width={48} borderRadius={7} />
//               </View>
//             </View>
//           </View>
//         ))}
//       </SkeletonCard>

//       <SkeletonCard style={{ marginTop: 16, alignItems: 'center' }}>
//         <Skeleton height={56} width={56} variant="circle" />
//         <Skeleton height={18} width={170} borderRadius={8} style={{ marginTop: 14 }} />
//         <Skeleton height={12} width="78%" borderRadius={6} style={{ marginTop: 10 }} />
//         <Skeleton height={6} width="100%" borderRadius={3} style={{ marginTop: 18 }} />
//       </SkeletonCard>
//     </View>
//   );

//   // Circular Progress Component
//   const CircularProgress = ({
//     percentage,
//     size = 120,
//     color,
//   }: {
//     percentage: number;
//     size?: number;
//     color: string;
//   }) => {
//     const radius = (size - 20) / 2;
//     const circumference = 2 * Math.PI * radius;
//     const strokeDashoffset = circumference - (percentage / 100) * circumference;

//     return (
//       <Svg width={size} height={size}>
//         <Circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           stroke={color + '20'}
//           strokeWidth={8}
//           fill="none"
//         />
//         <Circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           stroke={color}
//           strokeWidth={8}
//           strokeDasharray={circumference}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           fill="none"
//           transform={`rotate(-90, ${size / 2}, ${size / 2})`}
//         />
//         <SvgText
//           x={size / 2}
//           y={size / 2 - 5}
//           fontSize={TYPOGRAPHY.h1.size}
//           fontWeight={TYPOGRAPHY.h1.weight}
//           fill={colors.textPrimary}
//           textAnchor="middle"
//         >
//           {percentage}%
//         </SvgText>
//         <SvgText
//           x={size / 2}
//           y={size / 2 + 15}
//           fontSize={TYPOGRAPHY.label.size}
//           fill={colors.textSecondary}
//           textAnchor="middle"
//         >
//           Progress
//         </SvgText>
//       </Svg>
//     );
//   };

//   return (
//     <>
//       {/* <StatusBar barStyle="light-content" backgroundColor={colors.primary} /> */}
//       <SafeAreaView
//         style={{
//           flex: 1,
//           backgroundColor: colors.background,
//         }}
//       >
//         <Animated.ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{
//             paddingBottom: 32,
//             paddingTop: Platform.OS === 'ios' ? 0 : 8,
//           }}
//         >
//           {/* Gradient Header with Content */}
//           <LinearGradient
//             colors={[colors.primary, colors.primaryDark]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={{
//               paddingTop: Platform.OS === 'ios' ? 12 : 16,
//               paddingBottom: 40,
//               paddingHorizontal: 20,
//               borderBottomLeftRadius: 32,
//               borderBottomRightRadius: 32,
//             }}
//           >
//             {/* Period Selector - Working Tabs */}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 backgroundColor: colors.surface + '15',
//                 borderRadius: 16,
//                 padding: 4,
//                 borderWidth: 1,
//                 borderColor: colors.surface + '10',
//               }}
//             >
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   paddingVertical: 12,
//                   alignItems: 'center',
//                   borderRadius: 12,
//                   backgroundColor: selectedPeriod === 'lastMonth' ? colors.surface : 'transparent',
//                   shadowColor: selectedPeriod === 'lastMonth' ? colors.primary : 'transparent',
//                   shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.1,
//                   shadowRadius: 4,
//                   elevation: selectedPeriod === 'lastMonth' ? 2 : 0,
//                 }}
//                 onPress={() => setSelectedPeriod('lastMonth')}
//               >
//                 <Text
//                   style={{
//                     color: selectedPeriod === 'lastMonth' ? colors.primary : colors.surface,
//                     fontWeight:
//                       selectedPeriod === 'lastMonth'
//                         ? TYPOGRAPHY.section.weight
//                         : TYPOGRAPHY.button.weight,
//                     fontSize: TYPOGRAPHY.button.size,
//                   }}
//                 >
//                   Last Month
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   paddingVertical: 12,
//                   alignItems: 'center',
//                   borderRadius: 12,
//                   backgroundColor:
//                     selectedPeriod === 'currentMonth' ? colors.surface : 'transparent',
//                   shadowColor: selectedPeriod === 'currentMonth' ? colors.primary : 'transparent',
//                   shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.1,
//                   shadowRadius: 4,
//                   elevation: selectedPeriod === 'currentMonth' ? 2 : 0,
//                 }}
//                 onPress={() => setSelectedPeriod('currentMonth')}
//               >
//                 <Text
//                   style={{
//                     color: selectedPeriod === 'currentMonth' ? colors.primary : colors.surface,
//                     fontWeight:
//                       selectedPeriod === 'currentMonth'
//                         ? TYPOGRAPHY.section.weight
//                         : TYPOGRAPHY.button.weight,
//                     fontSize: TYPOGRAPHY.button.size,
//                   }}
//                 >
//                   Current Month
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>

//           {/* Metric Selector - Reduced negative margin for better spacing */}
//           <View
//             style={{
//               flexDirection: 'row',
//               marginHorizontal: 16,
//               marginTop: Platform.OS === 'ios' ? -20 : -24,
//               marginBottom: 12,
//               borderRadius: 8,
//               borderWidth: 1,
//               borderColor: colors.borderLight,
//               backgroundColor: colors.surface,
//               overflow: 'hidden',
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 4 },
//               shadowOpacity: 0.06,
//               shadowRadius: 10,
//               elevation: 4,
//             }}
//           >
//             {metricOptions.map((option) => {
//               const isSelected = option.value === selectedMetric;

//               return (
//                 <TouchableOpacity
//                   key={option.value}
//                   activeOpacity={0.82}
//                   onPress={() => setSelectedMetric(option.value)}
//                   style={{
//                     flex: 1,
//                     minHeight: 34,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     paddingHorizontal: 8,
//                     paddingVertical: 10,
//                     backgroundColor: isSelected ? colors.primary : 'transparent',
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: TYPOGRAPHY.button.size,
//                       fontWeight: TYPOGRAPHY.button.weight,
//                       color: isSelected ? colors.primaryContrast : colors.textSecondary,
//                     }}
//                   >
//                     {option.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>

//           {loading ? (
//             renderTargetSkeleton()
//           ) : (
//             <>
//               {/* Progress Card */}
//               <View
//                 style={{
//                   marginHorizontal: 16,
//                   marginTop: 4,
//                   backgroundColor: colors.surface,
//                   borderRadius: 24,
//                   padding: 20,
//                   shadowColor: '#000',
//                   shadowOffset: { width: 0, height: 8 },
//                   shadowOpacity: 0.08,
//                   shadowRadius: 16,
//                   elevation: 8,
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: colors.textSecondary,
//                     fontSize: TYPOGRAPHY.label.size,
//                     fontWeight: TYPOGRAPHY.label.weight,
//                   }}
//                 >
//                   {selectedPeriod === 'currentMonth' ? 'CURRENT' : 'LAST'} MONTH'S PROGRESS
//                 </Text>
//                 <Text
//                   style={{
//                     color: colors.textSecondary,
//                     fontSize: TYPOGRAPHY.label.size,
//                     fontWeight: TYPOGRAPHY.label.weight,
//                     marginTop: 4,
//                   }}
//                 >
//                   Showing target by {selectedMetricLabel}
//                 </Text>

//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     alignItems: 'center',
//                     marginVertical: 20,
//                     gap: 24,
//                   }}
//                 >
//                   <CircularProgress
//                     percentage={currentData.progress}
//                     color={
//                       selectedPeriod === 'currentMonth' ? colors.primary : colors.textSecondary
//                     }
//                   />

//                   <View style={{ flex: 1, gap: 16 }}>
//                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//                       <View>
//                         <Text
//                           style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}
//                         >
//                           ACHIEVED
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.value.size,
//                             fontWeight: TYPOGRAPHY.value.weight,
//                             color: colors.success,
//                           }}
//                         >
//                           {formatNumber(currentData.achieved, selectedMetric)}
//                         </Text>
//                       </View>
//                       <View>
//                         <Text
//                           style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}
//                         >
//                           TARGET
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.value.size,
//                             fontWeight: TYPOGRAPHY.value.weight,
//                             color: colors.primary,
//                           }}
//                         >
//                           {formatNumber(currentData.target, selectedMetric)}
//                         </Text>
//                       </View>
//                     </View>

//                     <View
//                       style={{
//                         backgroundColor: colors.warning + '08',
//                         paddingHorizontal: 12,
//                         paddingVertical: 8,
//                         borderRadius: 12,
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         gap: 8,
//                       }}
//                     >
//                       <Ionicons name="flag-outline" size={16} color={colors.warning} />
//                       <Text
//                         style={{
//                           color: colors.warning,
//                           fontSize: TYPOGRAPHY.label.size,
//                           fontWeight: TYPOGRAPHY.label.weight,
//                           flex: 1,
//                         }}
//                       >
//                         {formatNumber(currentData.remaining, selectedMetric)} {selectedMetricLabel}{' '}
//                         remaining to achieve target
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               {/* KPI Cards */}
//               <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 16 }}>
//                 <LinearGradient
//                   colors={[colors.primary + '08', colors.primary + '02']}
//                   style={{
//                     flex: 1,
//                     borderRadius: 20,
//                     padding: 16,
//                     borderWidth: 1,
//                     borderColor: colors.primary + '10',
//                   }}
//                 >
//                   <View
//                     style={{
//                       width: 44,
//                       height: 44,
//                       borderRadius: 14,
//                       backgroundColor: colors.primary + '15',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       marginBottom: 12,
//                     }}
//                   >
//                     <FontAwesome5 name="chart-line" size={22} color={colors.primary} />
//                   </View>
//                   <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}>
//                     RRR
//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: TYPOGRAPHY.value.size,
//                       fontWeight: TYPOGRAPHY.value.weight,
//                       color: colors.primary,
//                       marginTop: 4,
//                     }}
//                   >
//                     {formatNumber(currentData.rrr, selectedMetric)}
//                   </Text>
//                   <Text
//                     style={{
//                       color: colors.textSecondary,
//                       fontSize: TYPOGRAPHY.label.size,
//                       marginTop: 4,
//                     }}
//                   >
//                     Required Run Rate
//                   </Text>
//                 </LinearGradient>

//                 <LinearGradient
//                   colors={[colors.success + '08', colors.success + '02']}
//                   style={{
//                     flex: 1,
//                     borderRadius: 20,
//                     padding: 16,
//                     borderWidth: 1,
//                     borderColor: colors.success + '10',
//                   }}
//                 >
//                   <View
//                     style={{
//                       width: 44,
//                       height: 44,
//                       borderRadius: 14,
//                       backgroundColor: colors.success + '15',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       marginBottom: 12,
//                     }}
//                   >
//                     <MaterialIcons name="trending-up" size={22} color={colors.success} />
//                   </View>
//                   <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}>
//                     CRR
//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: TYPOGRAPHY.value.size,
//                       fontWeight: TYPOGRAPHY.value.weight,
//                       color: colors.success,
//                       marginTop: 4,
//                     }}
//                   >
//                     {formatNumber(currentData.crr, selectedMetric)}
//                   </Text>
//                   <Text
//                     style={{
//                       color: colors.textSecondary,
//                       fontSize: TYPOGRAPHY.label.size,
//                       marginTop: 4,
//                     }}
//                   >
//                     Current Run Rate
//                   </Text>
//                 </LinearGradient>
//               </View>

//               {/* Comparison Table */}
//               <View
//                 style={{
//                   marginHorizontal: 16,
//                   marginTop: 16,
//                   backgroundColor: colors.surface,
//                   borderRadius: 24,
//                   padding: 20,
//                   shadowColor: '#000',
//                   shadowOffset: { width: 0, height: 4 },
//                   shadowOpacity: 0.05,
//                   shadowRadius: 12,
//                   elevation: 4,
//                 }}
//               >
//                 <View
//                   style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: 16,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: TYPOGRAPHY.section.size,
//                       fontWeight: TYPOGRAPHY.section.weight,
//                       color: colors.textPrimary,
//                     }}
//                   >
//                     LMTD vs MTD
//                   </Text>
//                   <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}>
//                     {currentData.asOfLabel ? `as of ${currentData.asOfLabel}` : ''}
//                   </Text>
//                 </View>

//                 <View style={{ gap: 12 }}>
//                   {/* LMTD Row */}
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       justifyContent: 'space-between',
//                       alignItems: 'center',
//                       paddingVertical: 12,
//                       paddingHorizontal: 16,
//                       backgroundColor: colors.background,
//                       borderRadius: 16,
//                     }}
//                   >
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//                       <View style={{ width: 40, alignItems: 'center' }}>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.label.size,
//                             fontWeight: TYPOGRAPHY.label.weight,
//                             color: colors.primary,
//                           }}
//                         >
//                           LMTD
//                         </Text>
//                       </View>
//                       <View>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.value.size,
//                             fontWeight: TYPOGRAPHY.value.weight,
//                             color: colors.primary,
//                           }}
//                         >
//                           {formatPercent(currentData.lmtd)}%
//                         </Text>
//                         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
//                           <Ionicons name="remove-outline" size={12} color={colors.textSecondary} />
//                           <Text
//                             style={{
//                               color: colors.textSecondary,
//                               fontSize: TYPOGRAPHY.label.size,
//                               marginLeft: 2,
//                             }}
//                           >
//                             Baseline
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                     <View style={{ flexDirection: 'row', gap: 24 }}>
//                       <View style={{ alignItems: 'center' }}>
//                         <Text
//                           style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}
//                         >
//                           ACH %
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.value.size,
//                             fontWeight: TYPOGRAPHY.value.weight,
//                             color: colors.success,
//                           }}
//                         >
//                           {formatPercent(currentData.lmtd)}%
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   {/* MTD Row */}
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       justifyContent: 'space-between',
//                       alignItems: 'center',
//                       paddingVertical: 12,
//                       paddingHorizontal: 16,
//                       backgroundColor: colors.primary + '05',
//                       borderRadius: 16,
//                       borderWidth: 1,
//                       borderColor: colors.primary + '10',
//                     }}
//                   >
//                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//                       <View style={{ width: 40, alignItems: 'center' }}>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.label.size,
//                             fontWeight: TYPOGRAPHY.label.weight,
//                             color: colors.primary,
//                           }}
//                         >
//                           MTD
//                         </Text>
//                       </View>
//                       <View>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.value.size,
//                             fontWeight: TYPOGRAPHY.value.weight,
//                             color: colors.primary,
//                           }}
//                         >
//                           {formatPercent(currentData.mtd)}%
//                         </Text>
//                         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
//                           <Ionicons
//                             name={currentData.growth >= 0 ? 'arrow-up' : 'arrow-down'}
//                             size={12}
//                             color={currentData.growth >= 0 ? colors.success : colors.error}
//                           />
//                           <Text
//                             style={{
//                               color: currentData.growth >= 0 ? colors.success : colors.error,
//                               fontSize: TYPOGRAPHY.label.size,
//                               marginLeft: 2,
//                             }}
//                           >
//                             {currentData.growth >= 0 ? '+' : ''}
//                             {formatPercent(currentData.growth)}% growth
//                           </Text>
//                         </View>
//                       </View>
//                     </View>
//                     <View style={{ flexDirection: 'row', gap: 24 }}>
//                       <View style={{ alignItems: 'center' }}>
//                         <Text
//                           style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}
//                         >
//                           CRR
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: TYPOGRAPHY.value.size,
//                             fontWeight: TYPOGRAPHY.value.weight,
//                             color: colors.success,
//                           }}
//                         >
//                           {formatNumber(currentData.crrValue, selectedMetric)}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>
//                 </View>

//                 {/* Improvement Badge */}
//                 {currentData.improvement > 0 && (
//                   <View
//                     style={{
//                       marginTop: 16,
//                       paddingTop: 16,
//                       borderTopWidth: 1,
//                       borderTopColor: colors.divider,
//                       flexDirection: 'row',
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       gap: 8,
//                     }}
//                   >
//                     <View
//                       style={{
//                         backgroundColor: colors.success + '15',
//                         paddingHorizontal: 12,
//                         paddingVertical: 6,
//                         borderRadius: 20,
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         gap: 6,
//                       }}
//                     >
//                       <Ionicons name="trending-up" size={14} color={colors.success} />
//                       <Text
//                         style={{
//                           color: colors.success,
//                           fontSize: TYPOGRAPHY.label.size,
//                           fontWeight: TYPOGRAPHY.button.weight,
//                         }}
//                       >
//                         +{formatPercent(currentData.improvement)}% improvement
//                       </Text>
//                     </View>
//                     <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}>
//                       in Conversion Rate
//                     </Text>
//                   </View>
//                 )}
//               </View>

//               {/* Motivational Card */}
//               <LinearGradient
//                 colors={[colors.primary + '12', colors.primary + '06']}
//                 style={{
//                   marginHorizontal: 16,
//                   marginTop: 16,
//                   marginBottom: 16,
//                   padding: 20,
//                   borderRadius: 24,
//                   alignItems: 'center',
//                   borderWidth: 1,
//                   borderColor: colors.primary + '15',
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 56,
//                     height: 56,
//                     borderRadius: 28,
//                     backgroundColor: colors.primary + '20',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     marginBottom: 12,
//                   }}
//                 >
//                   <Ionicons name="rocket" size={28} color={colors.primary} />
//                 </View>
//                 <Text
//                   style={{
//                     color: colors.textPrimary,
//                     fontSize: TYPOGRAPHY.section.size,
//                     fontWeight: TYPOGRAPHY.section.weight,
//                     textAlign: 'center',
//                   }}
//                 >
//                   {currentData.remaining === 0 ? 'Target Achieved! 🎉' : "You're almost there! 🎯"}
//                 </Text>
//                 <Text
//                   style={{
//                     color: colors.textSecondary,
//                     fontSize: TYPOGRAPHY.body.size,
//                     fontWeight: TYPOGRAPHY.body.weight,
//                     textAlign: 'center',
//                     marginTop: 8,
//                   }}
//                 >
//                   {currentData.remaining > 0 ? (
//                     <>
//                       Only{' '}
//                       <Text
//                         style={{ color: colors.textPrimary, fontWeight: TYPOGRAPHY.value.weight }}
//                       >
//                         {formatNumber(currentData.remaining, selectedMetric)} {selectedMetricLabel}
//                       </Text>{' '}
//                       more to reach your target
//                     </>
//                   ) : (
//                     'Congratulations on achieving your target!'
//                   )}
//                 </Text>
//                 {currentData.remaining > 0 && (
//                   <View
//                     style={{
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       marginTop: 16,
//                       gap: 8,
//                       width: '100%',
//                     }}
//                   >
//                     <View
//                       style={{
//                         flex: 1,
//                         height: 6,
//                         backgroundColor: colors.primary + '15',
//                         borderRadius: 3,
//                         overflow: 'hidden',
//                       }}
//                     >
//                       <View
//                         style={{
//                           width: `${targetProgress}%`,
//                           height: '100%',
//                           backgroundColor: colors.primary,
//                           borderRadius: 3,
//                         }}
//                       />
//                     </View>
//                     <Text
//                       style={{
//                         color: colors.textPrimary,
//                         fontSize: TYPOGRAPHY.label.size,
//                         fontWeight: TYPOGRAPHY.value.weight,
//                       }}
//                     >
//                       {Math.round(targetProgress)}%
//                     </Text>
//                   </View>
//                 )}
//               </LinearGradient>
//             </>
//           )}
//         </Animated.ScrollView>
//       </SafeAreaView>
//     </>
//   );
// }

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Svg, {
  Text as SvgText,
  Circle,
  G,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';
import {
  homeService,
  type SalesmanPocketTargetResponse,
  type TargetMetric,
} from '@/features/home/services/home.service';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
import { Skeleton } from '@/core/components';
import Animated from 'react-native-reanimated';

const TYPOGRAPHY = {
  h1: { size: 26, weight: '800' as const, lineHeight: 32 },
  section: { size: 15, weight: '700' as const, lineHeight: 22 },
  value: { size: 16, weight: '700' as const, lineHeight: 22 },
  body: { size: 13, weight: '400' as const, lineHeight: 19 },
  label: { size: 11, weight: '500' as const, lineHeight: 15 },
  micro: { size: 10, weight: '600' as const, lineHeight: 14 },
  button: { size: 12, weight: '600' as const, lineHeight: 16 },
};

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

const metricOptions: { value: TargetMetric; label: string; icon: string }[] = [
  { value: 'tonnage', label: 'Tonnage', icon: 'weight' },
  { value: 'cases', label: 'Cases', icon: 'cube-outline' },
  { value: 'value', label: 'Value', icon: 'cash-outline' },
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
  if (metric === 'value') return Math.round(safeValue).toLocaleString('en-IN');
  return safeValue.toLocaleString('en-IN', {
    maximumFractionDigits: metric === 'tonnage' ? 2 : 0,
  });
};

const formatPercent = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(2)).toString() : '0';

const formatDateLabel = (date?: string) => {
  const parsedDate = date ? new Date(date) : new Date();
  if (Number.isNaN(parsedDate.getTime())) return '';
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

// ── Circular Progress ─────────────────────────────────────────────────────────
const CircularProgress = ({
  percentage,
  size = 130,
  color,
  colors: themeColors,
}: {
  percentage: number;
  size?: number;
  color: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <SvgGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity="1" />
          <Stop offset="100%" stopColor={color + 'AA'} stopOpacity="1" />
        </SvgGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={color + '18'}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress arc */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke="url(#progressGrad)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90, ${cx}, ${cy})`}
      />
      {/* Center text */}
      <SvgText
        x={cx}
        y={cy - 8}
        fontSize={TYPOGRAPHY.h1.size}
        fontWeight={TYPOGRAPHY.h1.weight}
        fill={themeColors.textPrimary}
        textAnchor="middle"
      >
        {clampedPct}%
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 12}
        fontSize={TYPOGRAPHY.label.size}
        fontWeight={TYPOGRAPHY.label.weight}
        fill={themeColors.textSecondary}
        textAnchor="middle"
      >
        of target
      </SvgText>
    </Svg>
  );
};

// ── Mini Stat ─────────────────────────────────────────────────────────────────
const MiniStat = ({
  label,
  value,
  color,
  colors: themeColors,
}: {
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View>
    <Text
      style={{
        color: themeColors.textSecondary,
        fontSize: TYPOGRAPHY.label.size,
        fontWeight: TYPOGRAPHY.label.weight,
        letterSpacing: 0.4,
        marginBottom: 3,
      }}
    >
      {label}
    </Text>
    <Text style={{ fontSize: TYPOGRAPHY.value.size, fontWeight: TYPOGRAPHY.value.weight, color }}>
      {value}
    </Text>
  </View>
);

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({
  icon,
  iconLibrary,
  title,
  subtitle,
  value,
  accentColor,
  colors: themeColors,
}: {
  icon: string;
  iconLibrary: 'FA5' | 'MI';
  title: string;
  subtitle: string;
  value: string;
  accentColor: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: themeColors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: themeColors.border,
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
        width: 4,
        backgroundColor: accentColor,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
      }}
    />
    <View style={{ marginLeft: 4 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: accentColor + '18',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        {iconLibrary === 'FA5' ? (
          <FontAwesome5 name={icon as any} size={18} color={accentColor} />
        ) : (
          <MaterialIcons name={icon as any} size={20} color={accentColor} />
        )}
      </View>
      <Text
        style={{
          color: themeColors.textSecondary,
          fontSize: TYPOGRAPHY.label.size,
          fontWeight: TYPOGRAPHY.label.weight,
          letterSpacing: 0.4,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: TYPOGRAPHY.value.size,
          fontWeight: TYPOGRAPHY.value.weight,
          color: accentColor,
          marginTop: 2,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: themeColors.textSecondary, fontSize: TYPOGRAPHY.label.size }}>
        {subtitle}
      </Text>
    </View>
  </View>
);

// ── Comparison Row ────────────────────────────────────────────────────────────
const ComparisonRow = ({
  tag,
  tagColor,
  achieveLabel,
  achieveValue,
  secondaryLabel,
  secondaryValue,
  isHighlighted,
  deltaLabel,
  deltaColor,
  colors: themeColors,
}: {
  tag: string;
  tagColor: string;
  achieveLabel: string;
  achieveValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  isHighlighted: boolean;
  deltaLabel?: string;
  deltaColor?: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: isHighlighted ? tagColor + '08' : themeColors.background,
      borderRadius: 14,
      borderLeftWidth: 3,
      borderLeftColor: isHighlighted ? tagColor : themeColors.border,
    }}
  >
    {/* Tag pill */}
    <View
      style={{
        backgroundColor: tagColor + '18',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 12,
        minWidth: 46,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: TYPOGRAPHY.micro.size,
          fontWeight: TYPOGRAPHY.micro.weight,
          color: tagColor,
        }}
      >
        {tag}
      </Text>
    </View>

    {/* Main value */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: TYPOGRAPHY.value.size,
          fontWeight: TYPOGRAPHY.value.weight,
          color: tagColor,
        }}
      >
        {achieveValue}
      </Text>
      {deltaLabel ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 }}>
          <Ionicons
            name={deltaColor === themeColors.success ? 'arrow-up' : 'remove-outline'}
            size={11}
            color={deltaColor ?? themeColors.textSecondary}
          />
          <Text
            style={{
              fontSize: TYPOGRAPHY.label.size,
              color: deltaColor ?? themeColors.textSecondary,
            }}
          >
            {deltaLabel}
          </Text>
        </View>
      ) : null}
    </View>

    {/* Right stat */}
    <View style={{ alignItems: 'flex-end' }}>
      <Text
        style={{
          fontSize: TYPOGRAPHY.label.size,
          fontWeight: TYPOGRAPHY.label.weight,
          color: themeColors.textSecondary,
          letterSpacing: 0.3,
        }}
      >
        {secondaryLabel}
      </Text>
      <Text
        style={{
          fontSize: TYPOGRAPHY.value.size,
          fontWeight: TYPOGRAPHY.value.weight,
          color: themeColors.success,
          marginTop: 2,
        }}
      >
        {secondaryValue}
      </Text>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function TargetDashboard() {
  const { colors } = useTheme();
  const { setHeader } = useHeader();
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
      setHeader({
        title: 'My Target',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
      loadTarget();
    }, [colors.primary, loadTarget, setHeader]),
  );

  const currentData = selectedPeriod === 'currentMonth' ? currentMonthData : lastMonthData;
  const selectedMetricLabel = metricLabels[selectedMetric];
  const targetProgress =
    currentData.target > 0 ? Math.min((currentData.achieved / currentData.target) * 100, 100) : 0;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  const SkeletonCard = ({ children, style }: any) => (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  const renderTargetSkeleton = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 16 }}>
      <SkeletonCard>
        <Skeleton height={14} width={150} borderRadius={7} />
        <Skeleton height={12} width={118} borderRadius={6} style={{ marginTop: 8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 22 }}>
          <Skeleton height={130} width={130} variant="circle" />
          <View style={{ flex: 1, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton height={10} width={64} borderRadius={5} />
                <Skeleton height={20} width="82%" borderRadius={8} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton height={10} width={54} borderRadius={5} />
                <Skeleton height={20} width="82%" borderRadius={8} />
              </View>
            </View>
            <Skeleton height={38} width="100%" borderRadius={12} />
          </View>
        </View>
      </SkeletonCard>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[1, 2].map((item) => (
          <SkeletonCard key={item} style={{ flex: 1, minHeight: 130 }}>
            <Skeleton height={40} width={40} borderRadius={12} />
            <Skeleton height={10} width={42} borderRadius={5} style={{ marginTop: 12 }} />
            <Skeleton height={20} width="64%" borderRadius={8} style={{ marginTop: 6 }} />
            <Skeleton height={10} width="86%" borderRadius={5} style={{ marginTop: 6 }} />
          </SkeletonCard>
        ))}
      </View>
      <SkeletonCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
          <Skeleton height={16} width={112} borderRadius={8} />
          <Skeleton height={11} width={92} borderRadius={6} />
        </View>
        {[1, 2].map((item) => (
          <View
            key={item}
            style={{
              backgroundColor: colors.background,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 14,
              marginBottom: item === 1 ? 10 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Skeleton height={28} width={46} borderRadius={8} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton height={18} width={64} borderRadius={8} />
                <Skeleton height={10} width={92} borderRadius={5} />
              </View>
              <View style={{ alignItems: 'center', gap: 6 }}>
                <Skeleton height={10} width={36} borderRadius={5} />
                <Skeleton height={14} width={48} borderRadius={7} />
              </View>
            </View>
          </View>
        ))}
      </SkeletonCard>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        {/* ── Header gradient ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: Platform.OS === 'ios' ? 12 : 16,
            paddingBottom: 44,
            paddingHorizontal: 16,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          {/* Period toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: 3,
            }}
          >
            {(['lastMonth', 'currentMonth'] as const).map((period) => {
              const isActive = selectedPeriod === period;
              return (
                <TouchableOpacity
                  key={period}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPeriod(period)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    alignItems: 'center',
                    borderRadius: 11,
                    backgroundColor: isActive ? colors.surface : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      color: isActive ? colors.primary : 'rgba(255,255,255,0.82)',
                      fontWeight: isActive ? TYPOGRAPHY.section.weight : TYPOGRAPHY.button.weight,
                      fontSize: TYPOGRAPHY.button.size,
                    }}
                  >
                    {period === 'lastMonth' ? 'Last Month' : 'This Month'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* ── Metric selector (floating, overlaps header) ──────────────────── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: -20,
            marginBottom: 14,
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.07,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {metricOptions.map((opt, idx) => {
            const isSelected = opt.value === selectedMetric;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.8}
                onPress={() => setSelectedMetric(opt.value)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  paddingVertical: 11,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                  borderRightWidth: idx < metricOptions.length - 1 ? 1 : 0,
                  borderRightColor: colors.border,
                }}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={13}
                  color={isSelected ? colors.primaryContrast : colors.textSecondary}
                />
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.button.size,
                    fontWeight: TYPOGRAPHY.button.weight,
                    color: isSelected ? colors.primaryContrast : colors.textSecondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          renderTargetSkeleton()
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 14 }}>
            {/* ── Progress card ──────────────────────────────────────────────── */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 22,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              {/* Card header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 18,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.section.size,
                      fontWeight: TYPOGRAPHY.section.weight,
                      color: colors.textPrimary,
                    }}
                  >
                    {selectedPeriod === 'currentMonth' ? 'This Month' : 'Last Month'}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.label.size,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    by {selectedMetricLabel}
                    {currentData.asOfLabel ? ` · as of ${currentData.asOfLabel}` : ''}
                  </Text>
                </View>
                {/* Achievement badge */}
                <View
                  style={{
                    backgroundColor:
                      currentData.progress >= 100 ? colors.success + '18' : colors.primary + '12',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.micro.size,
                      fontWeight: TYPOGRAPHY.micro.weight,
                      color: currentData.progress >= 100 ? colors.success : colors.primary,
                      letterSpacing: 0.3,
                    }}
                  >
                    {currentData.progress >= 100 ? '✓ ACHIEVED' : 'IN PROGRESS'}
                  </Text>
                </View>
              </View>

              {/* Circular + stats side by side */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <CircularProgress
                  percentage={currentData.progress}
                  color={selectedPeriod === 'currentMonth' ? colors.primary : colors.textSecondary}
                  colors={colors}
                />
                <View style={{ flex: 1, gap: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <MiniStat
                      label="ACHIEVED"
                      value={formatNumber(currentData.achieved, selectedMetric)}
                      color={colors.success}
                      colors={colors}
                    />
                    <MiniStat
                      label="TARGET"
                      value={formatNumber(currentData.target, selectedMetric)}
                      color={colors.primary}
                      colors={colors}
                    />
                  </View>

                  {/* Remaining pill */}
                  {currentData.remaining > 0 ? (
                    <View
                      style={{
                        backgroundColor: colors.warning + '0D',
                        borderWidth: 1,
                        borderColor: colors.warning + '25',
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                      }}
                    >
                      <Ionicons name="flag-outline" size={14} color={colors.warning} />
                      <Text
                        style={{
                          color: colors.warning,
                          fontSize: TYPOGRAPHY.label.size,
                          fontWeight: TYPOGRAPHY.label.weight,
                          flex: 1,
                          lineHeight: 16,
                        }}
                      >
                        <Text style={{ fontWeight: '700' }}>
                          {formatNumber(currentData.remaining, selectedMetric)}
                        </Text>{' '}
                        {selectedMetricLabel} left to target
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: colors.success + '12',
                        borderWidth: 1,
                        borderColor: colors.success + '25',
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 7,
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                      <Text
                        style={{
                          color: colors.success,
                          fontSize: TYPOGRAPHY.label.size,
                          fontWeight: TYPOGRAPHY.label.weight,
                        }}
                      >
                        Target fully achieved!
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── KPI row ────────────────────────────────────────────────────── */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <KpiCard
                icon="chart-line"
                iconLibrary="FA5"
                title="RRR"
                subtitle="Required Run Rate"
                value={formatNumber(currentData.rrr, selectedMetric)}
                accentColor={colors.primary}
                colors={colors}
              />
              <KpiCard
                icon="trending-up"
                iconLibrary="MI"
                title="CRR"
                subtitle="Current Run Rate"
                value={formatNumber(currentData.crr, selectedMetric)}
                accentColor={colors.success}
                colors={colors}
              />
            </View>

            {/* ── LMTD vs MTD comparison ──────────────────────────────────── */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 22,
                padding: 18,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              {/* Section header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 4,
                      height: 18,
                      borderRadius: 2,
                      backgroundColor: colors.primary,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.section.size,
                      fontWeight: TYPOGRAPHY.section.weight,
                      color: colors.textPrimary,
                    }}
                  >
                    LMTD vs MTD
                  </Text>
                </View>
                {currentData.asOfLabel ? (
                  <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.label.size }}>
                    as of {currentData.asOfLabel}
                  </Text>
                ) : null}
              </View>

              {/* Column headers */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 62,
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.micro.size,
                    fontWeight: TYPOGRAPHY.micro.weight,
                    color: colors.textSecondary,
                    letterSpacing: 0.4,
                  }}
                >
                  ACH %
                </Text>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.micro.size,
                    fontWeight: TYPOGRAPHY.micro.weight,
                    color: colors.textSecondary,
                    letterSpacing: 0.4,
                  }}
                >
                  RUN RATE
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <ComparisonRow
                  tag="LMTD"
                  tagColor={colors.textSecondary}
                  achieveLabel="ACH %"
                  achieveValue={`${formatPercent(currentData.lmtd)}%`}
                  secondaryLabel="ACH %"
                  secondaryValue={`${formatPercent(currentData.lmtd)}%`}
                  isHighlighted={false}
                  deltaLabel="Baseline"
                  deltaColor={colors.textSecondary}
                  colors={colors}
                />
                <ComparisonRow
                  tag="MTD"
                  tagColor={colors.primary}
                  achieveLabel="ACH %"
                  achieveValue={`${formatPercent(currentData.mtd)}%`}
                  secondaryLabel="CRR"
                  secondaryValue={formatNumber(currentData.crrValue, selectedMetric)}
                  isHighlighted
                  deltaLabel={`${currentData.growth >= 0 ? '+' : ''}${formatPercent(currentData.growth)}% growth`}
                  deltaColor={currentData.growth >= 0 ? colors.success : colors.error}
                  colors={colors}
                />
              </View>

              {/* Improvement badge */}
              {currentData.improvement > 0 && (
                <View
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: colors.divider,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      backgroundColor: colors.success + '12',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Ionicons name="trending-up" size={13} color={colors.success} />
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.label.size,
                        fontWeight: TYPOGRAPHY.button.weight,
                        color: colors.success,
                      }}
                    >
                      +{formatPercent(currentData.improvement)}% improvement in conversion
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* ── Milestone progress card ─────────────────────────────────── */}
            <View
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.primary + '20',
              }}
            >
              <LinearGradient
                colors={[colors.primary + '10', colors.primary + '04']}
                style={{ padding: 20 }}
              >
                {/* Top row */}
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: colors.primary + '18',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={currentData.remaining === 0 ? 'trophy' : 'pulse'}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.section.size,
                        fontWeight: TYPOGRAPHY.section.weight,
                        color: colors.textPrimary,
                      }}
                    >
                      {currentData.remaining === 0 ? 'Target Achieved!' : 'Keep pushing'}
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.body.size,
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {currentData.remaining > 0
                        ? `${formatNumber(currentData.remaining, selectedMetric)} ${selectedMetricLabel} to go`
                        : 'You hit your monthly goal 🎉'}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: TYPOGRAPHY.h1.weight,
                      color: colors.primary,
                    }}
                  >
                    {Math.round(targetProgress)}%
                  </Text>
                </View>

                {/* Progress rail with milestones */}
                {currentData.remaining > 0 && (
                  <View>
                    {/* Rail */}
                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.primary + '18',
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <View
                        style={{
                          width: `${targetProgress}%`,
                          height: '100%',
                          backgroundColor: colors.primary,
                          borderRadius: 4,
                        }}
                      />
                    </View>

                    {/* Milestone markers */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 6,
                      }}
                    >
                      {[25, 50, 75, 100].map((milestone) => (
                        <View key={milestone} style={{ alignItems: 'center' }}>
                          <View
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor:
                                targetProgress >= milestone ? colors.primary : colors.border,
                              marginBottom: 3,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 9,
                              fontWeight: '600',
                              color:
                                targetProgress >= milestone ? colors.primary : colors.textSecondary,
                            }}
                          >
                            {milestone}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}
