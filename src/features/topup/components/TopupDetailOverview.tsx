import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/core/components';
import { OverviewProps } from '../types/topupDetail.types';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { formatDateTime } from '@/shared/utils/date.utils';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { formatWeight } from '@/shared/utils/weight.utils';

export const TopupDetailOverview: React.FC<OverviewProps> = ({ detail, colors }) => {
  const styles = createTopupDetailStyles(colors);

  const totalCases = detail.totalRequestedCases;
  const totalPieces = detail.totalRequestedPieces;
  const totalQty = detail.totalRequestedQty;
  const totalWeight = detail.totalRequestedWeight;
  const totalValue = detail.totalRequestedValue;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.overviewContent}>
      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="car-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Van</AppText>
              <AppText style={styles.infoValue}>{detail.vanName}</AppText>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="business-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Warehouse</AppText>
              <AppText style={styles.infoValue}>{detail.warehouseId}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Employee</AppText>
              <AppText style={styles.infoValue}>{detail.employeeName || detail.employeeId}</AppText>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Request Date</AppText>
              <AppText style={styles.infoValue}>{formatDateTime(detail.date)}</AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Approved By Section */}
      {detail.status === 'APPROVED' && (
        <View style={styles.approvedSection}>
          <LinearGradient
            colors={['#10B98115', '#10B98105']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.approvedCard}
          >
            <View style={styles.approvedHeader}>
              <View style={[styles.approvedIcon, { backgroundColor: '#10B98115' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              </View>
              <AppText style={[styles.approvedTitle, { color: colors.textPrimary }]}>
                Approval Details
              </AppText>
            </View>
            <View style={styles.approvedRow}>
              <View style={styles.approvedItem}>
                <Ionicons name="person-circle-outline" size={16} color="#10B981" />
                <View>
                  <AppText style={[styles.approvedLabel, { color: colors.textSecondary }]}>
                    Approved By
                  </AppText>
                  <AppText style={[styles.approvedValue, { color: '#10B981' }]}>
                    {detail.approvedByName || 'Rahul Sharma'}
                  </AppText>
                </View>
              </View>
              <View style={styles.approvedItem}>
                <Ionicons name="calendar-outline" size={16} color="#10B981" />
                <View>
                  <AppText style={[styles.approvedLabel, { color: colors.textSecondary }]}>
                    Approved Date
                  </AppText>
                  <AppText style={[styles.approvedValue, { color: '#10B981' }]}>
                    {detail.approvedAt
                      ? formatDateTime(detail.approvedAt)
                      : formatDateTime(detail.updatedAt)}
                  </AppText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <AppText style={styles.statsTitle}>Summary</AppText>
        <View style={styles.statsGrid}>
          {/* <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: colors.primary }]}>{totalQty}</AppText>
            <AppText style={styles.statLabel}>Total Items</AppText>
          </View> */}
          <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: colors.info }]}>{totalCases}</AppText>
            <AppText style={styles.statLabel}>Cases</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: colors.success }]}>{totalPieces}</AppText>
            <AppText style={styles.statLabel}>Pieces</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: colors.warning }]}>
              {formatCurrency(totalValue)}
            </AppText>
            <AppText style={styles.statLabel}>Value</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: colors.info }]}>
              {formatWeight(totalWeight)}
            </AppText>
            <AppText style={styles.statLabel}>Weight</AppText>
          </View>
        </View>
      </View>

      {/* Remark */}
      {detail.remark && (
        <View style={styles.remarkCard}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
          <AppText style={[styles.remarkText, { color: colors.textSecondary }]}>
            {detail.remark}
          </AppText>
        </View>
      )}
    </ScrollView>
  );
};
