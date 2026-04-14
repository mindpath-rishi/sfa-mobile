import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AppCard } from '@/core/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { MonthlyBudgetSectionProps } from '../../types/monthlyBudgetSection.types';
import { useMonthlyBudgetSectionStyles } from '../../styles/MonthlyBudgetSection.styles';
import { ProgressBar } from './ProgressBar';
import { AppText, SectionHeader } from '@/core/components';

export const MonthlyBudgetSection: React.FC<MonthlyBudgetSectionProps> = ({
  targetAchieved,
  completedOrders,
  onViewDetails,
}) => {
  const styles = useMonthlyBudgetSectionStyles();

  return (
    <View style={styles.container}>
      <SectionHeader title="MONTHLY TARGET" variant="small" />

      <AppCard variant="elevated" padding="lg" style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <AppText style={styles.progressLabel}>Progress</AppText>
          <TouchableOpacity onPress={onViewDetails} style={styles.viewDetailsButton}>
            <AppText style={styles.viewDetailsText}>VIEW DETAILS</AppText>
            <Ionicons name="arrow-forward" size={12} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressWrapper}>
          <ProgressBar
            progress={targetAchieved}
            label=""
            value={`${targetAchieved}%`}
            color="#10B981"
            showLabel
          />
        </View>

        <View style={styles.targetStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>COMPLETED ORDERS</Text>
            <Text style={styles.statValue}>{completedOrders}</Text>
          </View>
          <View style={styles.statItemRight}>
            <Text style={styles.statLabel}>REVENUE</Text>
            <Text style={styles.statValue}>K67,500</Text>
          </View>
        </View>
      </AppCard>
    </View>
  );
};
