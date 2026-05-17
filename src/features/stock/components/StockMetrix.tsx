// StockMetrix.tsx

import React from 'react';
import { ScrollView, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/core/components';
import { StockMetricsProps } from '../types/stock.types';

const { width } = Dimensions.get('window');

export const StockMetrics: React.FC<StockMetricsProps> = ({
  summary,
  formatCurrency,
  colors,
  styles,
}) => {
  const metrics = [
    {
      id: 'cases',
      label: 'Cases',
      value: summary.totalCases,
      icon: 'cube-outline',
      iconColor: colors.primary,
      bgColor: colors.primary + '10',
      format: (val: number) => val.toString(),
    },
    {
      id: 'pieces',
      label: 'Pieces',
      value: summary.totalPiece,
      icon: 'layers-outline',
      iconColor: colors.success,
      bgColor: colors.success + '10',
      format: (val: number) => val.toString(),
    },
    {
      id: 'weight',
      label: 'Weight',
      value: summary.totalNetWeight,
      icon: 'scale-outline',
      iconColor: colors.info,
      bgColor: colors.info + '10',
      format: (val: number) => `${val.toFixed(1)}kg`,
    },
    {
      id: 'value',
      label: 'Value',
      value: summary.totalValue,
      icon: 'cash-outline',
      iconColor: colors.warning,
      bgColor: colors.warning + '10',
      format: (val: number) => formatCurrency(val),
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.metricsScrollContainer}
      style={styles.metricsWrapper}
      decelerationRate="fast"
      snapToInterval={width * 0.35}
      snapToAlignment="start"
    >
      {metrics.map((metric, index) => (
        <View key={metric.id} style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: metric.bgColor }]}>
            <Ionicons name={metric.icon as any} size={16} color={metric.iconColor} />
          </View>
          <View style={styles.metricContent}>
            <AppText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {metric.label}
            </AppText>
            <AppText style={[styles.metricValue, { color: metric.iconColor }]}>
              {metric.format(metric.value)}
            </AppText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
