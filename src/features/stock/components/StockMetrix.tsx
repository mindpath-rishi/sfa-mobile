// StockMetrix.tsx

import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/core/components';
import { StockMetricsProps } from '../types/stock.types';

export const StockMetrics: React.FC<StockMetricsProps> = ({
  summary,
  formatCurrency,
  colors,
  styles,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.metricsScrollContainer}
      style={styles.metricsWrapper}
    >
      {/* Total Items */}
      {/* <View style={styles.metricItem}>
        <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
          Total Items
        </AppText>
        <AppText style={[styles.metricValue, { color: colors.primary }]}>
          {summary.totalItems}
        </AppText>
      </View> */}

      <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

      {/* Total Cases */}
      <View style={styles.metricItem}>
        <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Cases</AppText>
        <AppText style={[styles.metricValue, { color: colors.primary }]}>
          {summary.totalCases}
        </AppText>
      </View>

      <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

      {/* Total Pieces */}
      <View style={styles.metricItem}>
        <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
          Total Pieces
        </AppText>
        <AppText style={[styles.metricValue, { color: colors.success }]}>
          {summary.totalPiece}
        </AppText>
      </View>

      <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

      {/* Net Weight */}
      <View style={styles.metricItem}>
        <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>Net Weight</AppText>
        <AppText style={[styles.metricValue, { color: colors.info }]}>
          {summary.totalNetWeight.toFixed(2)} kg
        </AppText>
      </View>

      <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />

      {/* Net Weight */}
      <View style={styles.metricItem}>
        <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Value</AppText>
        <AppText style={[styles.metricValue, { color: colors.info }]}>
          {formatCurrency(summary.totalValue)}
        </AppText>
      </View>
    </ScrollView>
  );
};
