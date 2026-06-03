import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';

type TableColumn = {
  key: string;
  label: string;
  width: number;
  highlight?: boolean;
};

type TableRow = Record<string, string>;

const COLUMNS = {
  user: { key: 'user', label: 'Level 3\nPosition\nUser', width: 92 },
  orderQty: { key: 'orderQty', label: 'Order Qty\n(Cases)', width: 88 },
  productive: { key: 'productive', label: 'Productive\nVisits', width: 88 },
  totalOutlets: { key: 'totalOutlets', label: 'Total\nOutlets', width: 84 },
  utc: { key: 'utc', label: 'UTC', width: 76 },
  upc: { key: 'upc', label: 'UPC', width: 76 },
  contribution: { key: 'contribution', label: '%\nContribution', width: 88 },
  sc: { key: 'sc', label: 'SC.', width: 74 },
  tc: { key: 'tc', label: 'TC', width: 74 },
  pc: { key: 'pc', label: 'PC', width: 74 },
  compliance: { key: 'compliance', label: 'Call\nCompliance', width: 92 },
  coverage: { key: 'coverage', label: 'Bill\nCoverage', width: 84 },
  netValue: { key: 'netValue', label: 'NetValue', width: 86 },
  newOutlets: { key: 'newOutlets', label: 'New Outlets\nCount(With\nout\nApproach)', width: 112 },
  zone: { key: 'zone', label: 'Zone', width: 86 },
  drop: { key: 'drop', label: 'Drop size\nCase', width: 88 },
};

const dropSizeRows: TableRow[] = [
  { user: 'Kunal Nigolkar', orderQty: '24,342.1', productive: '4,445' },
  { user: 'empty', orderQty: '3,149.1', productive: '453' },
  { user: 'MAHOMAD\nSOHEB', orderQty: '47,477.9', productive: '2,320' },
];

const coveragePerRows: TableRow[] = [
  { user: 'Parmar\nAbusufyan', utc: '1,288', totalOutlets: '1,508' },
  { user: 'Bijawar\nChhalawala', utc: '327', totalOutlets: '492' },
  { user: 'Shahab Kamal', utc: '1,671', totalOutlets: '2,090' },
];

const outletRows: TableRow[] = [
  { zone: 'Zambia', utc: '11,681', upc: '11,126', orderQty: '112,456.3', drop: '4.8' },
  { zone: 'Total', utc: '11,681', upc: '11,126', orderQty: '112,456.3', drop: '4.8' },
];

const brandRows: TableRow[] = [
  { user: 'Laundry', orderQty: '60,603.8', upc: '6,063', contribution: '48' },
  { user: 'Personal Care', orderQty: '16,721.5', upc: '4,082', contribution: '16.8' },
  { user: 'Household', orderQty: '6,699.0', upc: '2,769', contribution: '6.4' },
];

const callRows: TableRow[] = [
  { user: 'Faizan Wadia', sc: '2,811', tc: '875', pc: '875', compliance: '31' },
  { user: 'MAHOMAD\nSOHEB', sc: '32,210', tc: '3,685', pc: '2,339', compliance: '10' },
  { user: 'Sartaar\nAbusufyan', sc: '15,018', tc: '1,892', pc: '1,863', compliance: '12' },
];

const coverageRows: TableRow[] = [
  { user: 'Kunal Nigolkar', totalOutlets: '2,730', utc: '1,555', upc: '1,450', coverage: '9' },
  { user: 'Mohammed\nPatel', totalOutlets: '641', utc: '294', upc: '292', coverage: '9' },
  { user: 'empty', totalOutlets: '0', utc: '323', upc: '323', coverage: '1' },
];

const kpiRows: TableRow[] = [
  { user: 'empty', tc: '467', pc: '464', sc: '3,055', orderQty: '3,149' },
  { user: 'Mohammed\nPatel', tc: '316', pc: '314', sc: '5,841', orderQty: '3,054' },
  { user: 'Kunal Nigolkar', tc: '5,199', pc: '5,084', sc: '26,561', orderQty: '24,342' },
];

const mbrRows: TableRow[] = [
  { user: 'Kunal Nigolkar', totalOutlets: '2,730', netValue: '7 M', newOutlets: '0', orderQty: '24,342' },
  { user: 'Mohammed\nPatel', totalOutlets: '641', netValue: '1.1 M', newOutlets: '0', orderQty: '3,054' },
  { user: 'empty', totalOutlets: '0', netValue: '1.1 M', newOutlets: '0', orderQty: '3,149' },
];

const ttRows: TableRow[] = [
  { user: 'Parmar\nAbusufyan', totalOutlets: '1,508', newOutlets: '0', netValue: '2.6 M', orderQty: '7,517' },
  { user: 'Bijawar\nChhalawala', totalOutlets: '492', newOutlets: '0', netValue: '2 M', orderQty: '5,252' },
  { user: 'Shahab Kamal', totalOutlets: '2,090', newOutlets: '1', netValue: '5.4 M', orderQty: '18,286' },
];

const contribution = [
  { label: 'Laundr..', value: '60,603.8', percent: '54%', color: '#0F766E' },
  { label: 'Confec..', value: '28,431.3', percent: '25%', color: '#6D28D9' },
  { label: 'Person..', value: '16,721.5', percent: '15%', color: '#A855F7' },
  { label: 'Househ..', value: '6,699.8', percent: '6%', color: '#38BDF8' },
];

const productivity = [
  { name: 'Abishai & Philip', upc: 171, utc: 226, drop: 3.3 },
  { name: 'Abraham Banda', upc: 147, utc: 188, drop: 3.5 },
];

function DataTable({
  columns,
  rows,
  colors,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  colors: any;
}) {
  const styles = createStyles(colors);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableRow}>
          {columns.map((column) => (
            <View key={column.key} style={[styles.tableCell, styles.tableHeadCell, { width: column.width }]}>
              <AppText style={styles.tableHeadText}>{column.label}</AppText>
            </View>
          ))}
        </View>
        {rows.map((row, index) => (
          <View key={`${row.user || row.zone}-${index}`} style={styles.tableRow}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.tableCell,
                  { width: column.width },
                  column.highlight && styles.highlightCell,
                ]}
              >
                <AppText style={[styles.tableText, index === rows.length - 1 && row.zone === 'Total' && styles.boldText]}>
                  {row[column.key] || '-'}
                </AppText>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SectionCard({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: any;
}) {
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <AppText style={styles.cardTitle}>{title}</AppText>
      {children}
    </View>
  );
}

function BrandContribution({ colors }: { colors: any }) {
  const styles = createStyles(colors);
  const size = 112;
  const strokeWidth = 17;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.contributionWrap}>
      <View style={styles.donutWrap}>
        <Svg width={size} height={size}>
          {contribution.map((item) => {
            const percent = Number(item.percent.replace('%', ''));
            const dash = (percent / 100) * circumference;
            const currentOffset = -offset;
            offset += dash;
            return (
              <Circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={currentOffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </Svg>
        <View style={styles.donutCenter}>
          <AppText style={styles.donutLabel}>Total</AppText>
          <AppText style={styles.donutValue}>112.45 K</AppText>
        </View>
      </View>
      <View style={styles.legend}>
        {contribution.map((item) => (
          <View key={item.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <AppText style={styles.legendLabel}>{item.label}</AppText>
            <AppText style={styles.legendValue}>
              {item.value}  {item.percent}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function ProductivityChart({ colors }: { colors: any }) {
  const styles = createStyles(colors);
  const max = 240;

  return (
    <View style={styles.productivityWrap}>
      <View style={styles.chartLegend}>
        <View style={styles.chartLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#EF5DA8' }]} />
          <AppText style={styles.chartLegendText}>UPC</AppText>
        </View>
        <View style={styles.chartLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#22A7D8' }]} />
          <AppText style={styles.chartLegendText}>UTC</AppText>
        </View>
        <View style={styles.chartLegendItem}>
          <View style={[styles.legendSquare, { backgroundColor: '#42A72D' }]} />
          <AppText style={styles.chartLegendText}>Drop size Case</AppText>
        </View>
      </View>
      {productivity.map((item) => (
        <View key={item.name} style={styles.barRow}>
          <AppText style={styles.barLabel}>{item.name}</AppText>
          <View style={styles.barTrackWrap}>
            <View style={[styles.bar, styles.upcBar, { width: `${(item.upc / max) * 100}%` }]} />
            <View style={[styles.bar, styles.utcBar, { width: `${(item.utc / max) * 100}%` }]} />
          </View>
          <View style={styles.barValues}>
            <AppText style={styles.barValue}>{item.upc}</AppText>
            <AppText style={styles.barValue}>{item.utc}</AppText>
            <AppText style={styles.barValue}>{item.drop}</AppText>
          </View>
        </View>
      ))}
      <Ionicons name="caret-down" size={14} color={colors.textTertiary} style={styles.chartCaret} />
    </View>
  );
}

export default function QuickVizUserPerformanceScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setHeader({ hidden: true, showBack: false, showMenu: false, showFilter: false });
    }, [setHeader]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.78} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.info} />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <AppText style={styles.title}>User Performance</AppText>
          <AppText style={styles.subtitle}>Custom Date</AppText>
        </View>
        <View style={styles.dateChip}>
          <AppText style={styles.dateChipText}>01 Nov 2025-16 Nov 2025</AppText>
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.78}>
          <Ionicons name="filter" size={18} color={colors.info} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard title="Drop size Case" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.orderQty, COLUMNS.productive]} rows={dropSizeRows} colors={colors} />
        </SectionCard>

        <SectionCard title="Coverage Per" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.utc, COLUMNS.totalOutlets]} rows={coveragePerRows} colors={colors} />
        </SectionCard>

        <SectionCard title="Outlet Performance" colors={colors}>
          <DataTable columns={[COLUMNS.zone, COLUMNS.utc, COLUMNS.upc, COLUMNS.orderQty, COLUMNS.drop]} rows={outletRows} colors={colors} />
        </SectionCard>

        <SectionCard title="Brand Wise Performance" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.orderQty, COLUMNS.upc, COLUMNS.contribution]} rows={brandRows} colors={colors} />
        </SectionCard>

        <SectionCard title="Call Compliance and Sales KPIs" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.sc, COLUMNS.tc, COLUMNS.pc, COLUMNS.compliance]} rows={callRows} colors={colors} />
        </SectionCard>

        <SectionCard title="Coverage" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.totalOutlets, COLUMNS.utc, COLUMNS.upc, COLUMNS.coverage]} rows={coverageRows} colors={colors} />
        </SectionCard>

        <SectionCard title="KPI Performance" colors={colors}>
          <DataTable
            columns={[COLUMNS.user, { ...COLUMNS.tc, highlight: true }, { ...COLUMNS.pc, highlight: true }, COLUMNS.sc, COLUMNS.orderQty]}
            rows={kpiRows}
            colors={colors}
          />
        </SectionCard>

        <SectionCard title="User Productivity Report" colors={colors}>
          <ProductivityChart colors={colors} />
        </SectionCard>

        <SectionCard title="MBR data Test" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.totalOutlets, COLUMNS.netValue, COLUMNS.newOutlets, COLUMNS.orderQty]} rows={mbrRows} colors={colors} />
        </SectionCard>

        <SectionCard title="TT" colors={colors}>
          <DataTable columns={[COLUMNS.user, COLUMNS.totalOutlets, COLUMNS.newOutlets, COLUMNS.netValue, COLUMNS.orderQty]} rows={ttRows} colors={colors} />
        </SectionCard>

        <SectionCard title="Brand wise contribution%" colors={colors}>
          <BrandContribution colors={colors} />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topBar: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      gap: 6,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleWrap: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.info,
    },
    subtitle: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.info,
    },
    dateChip: {
      minHeight: 28,
      maxWidth: 116,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      backgroundColor: colors.infoLight,
    },
    dateChipText: {
      fontSize: 8,
      fontWeight: '800',
      color: colors.info,
    },
    filterButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.infoLight,
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: 6,
      paddingBottom: 18,
      gap: 6,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderLight,
      paddingVertical: 8,
      overflow: 'hidden',
    },
    cardTitle: {
      marginBottom: 9,
      paddingHorizontal: 8,
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    tableRow: {
      flexDirection: 'row',
      paddingHorizontal: 6,
    },
    tableCell: {
      minHeight: 37,
      justifyContent: 'center',
      paddingHorizontal: 4,
      borderRightWidth: 1,
      borderRightColor: colors.borderLight,
    },
    tableHeadCell: {
      minHeight: 50,
      justifyContent: 'flex-start',
      paddingTop: 4,
    },
    tableHeadText: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    tableText: {
      fontSize: 9,
      lineHeight: 12,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    highlightCell: {
      marginHorizontal: 3,
      marginVertical: 3,
      borderRadius: 4,
      borderRightWidth: 0,
      backgroundColor: '#DDF0D7',
    },
    boldText: {
      fontWeight: '900',
    },
    contributionWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 8,
      gap: 12,
    },
    donutWrap: {
      width: 118,
      height: 118,
      alignItems: 'center',
      justifyContent: 'center',
    },
    donutCenter: {
      position: 'absolute',
      alignItems: 'center',
    },
    donutLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    donutValue: {
      marginTop: 12,
      fontSize: 10,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    legend: {
      flex: 1,
      gap: 9,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendLabel: {
      width: 50,
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    legendValue: {
      flex: 1,
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    productivityWrap: {
      paddingHorizontal: 8,
      paddingBottom: 6,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 22,
      marginBottom: 14,
    },
    chartLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendSquare: {
      width: 13,
      height: 13,
    },
    chartLegendText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
    },
    barLabel: {
      width: 112,
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    barTrackWrap: {
      flex: 1,
      gap: 3,
    },
    bar: {
      height: 14,
    },
    upcBar: {
      backgroundColor: '#EF8AC0',
    },
    utcBar: {
      backgroundColor: '#76C7DF',
    },
    barValues: {
      width: 34,
      alignItems: 'flex-end',
    },
    barValue: {
      fontSize: 9,
      lineHeight: 12,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    chartCaret: {
      alignSelf: 'center',
      marginTop: 2,
    },
  });
