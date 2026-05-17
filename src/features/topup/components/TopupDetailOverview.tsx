import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from '@/core/components';
import { OverviewProps } from '../types/topupDetail.types';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { formatDateTime } from '@/shared/utils/date.utils';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { formatWeight } from '@/shared/utils/weight.utils';

export const TopupDetailOverview: React.FC<OverviewProps> = ({ detail, colors }) => {
  const styles = createTopupDetailStyles(colors);
  const isApproved = detail.status === 'APPROVED';
  const isRejected = detail.status === 'REJECTED';
  const isPending = detail.status === 'PENDING';

  // Requested totals
  const requestedCases = detail.totalRequestedCases || 0;
  const requestedPieces = detail.totalRequestedPieces || 0;
  const requestedValue = detail.totalRequestedValue || 0;
  const requestedWeight = detail.totalRequestedWeight || 0;

  // Approved totals (only if approved)
  const approvedCases = detail.totalApprovedCases || 0;
  const approvedPieces = detail.totalApprovedPieces || 0;
  const approvedValue = detail.totalApprovedValue || 0;
  const approvedWeight = detail.totalApprovedWeight || 0;

  // Calculate differences
  const casesDiff = approvedCases - requestedCases;
  const piecesDiff = approvedPieces - requestedPieces;
  const valueDiff = approvedValue - requestedValue;
  const weightDiff = approvedWeight - requestedWeight;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.overviewContent}>
      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="car-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Van</AppText>
              <AppText style={styles.infoValue}>{detail.vanName || 'N/A'}</AppText>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="business-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Warehouse</AppText>
              <AppText style={styles.infoValue}>{detail.warehouseId || 'N/A'}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <View>
              <AppText style={styles.infoLabel}>Employee</AppText>
              <AppText style={styles.infoValue}>
                {detail.employeeName || detail.employeeId || 'N/A'}
              </AppText>
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

      {/* Requested vs Approved Section */}
      <View style={styles.comparisonSection}>
        <View style={styles.comparisonHeader}>
          <MaterialCommunityIcons name="compare" size={20} color={colors.primary} />
          <AppText style={styles.comparisonTitle}>Requested vs Approved</AppText>
        </View>

        <View style={styles.comparisonGrid}>
          {/* Cases */}
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <View style={styles.requestedBox}>
                <MaterialCommunityIcons name="cube-outline" size={16} color={colors.warning} />
                <AppText style={styles.comparisonLabel}>Requested</AppText>
                <AppText style={styles.comparisonValue}>{requestedCases} Cases</AppText>
              </View>
              {isApproved && (
                <>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                  <View style={styles.approvedBox}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                    <AppText style={styles.comparisonLabel}>Approved</AppText>
                    <AppText style={styles.comparisonValue}>{approvedCases} Cases</AppText>
                    {casesDiff !== 0 && (
                      <AppText
                        style={[
                          styles.diffText,
                          casesDiff > 0 ? styles.positiveDiff : styles.negativeDiff,
                        ]}
                      >
                        {casesDiff > 0 ? `+${casesDiff}` : `${casesDiff}`}
                      </AppText>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Pieces */}
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <View style={styles.requestedBox}>
                <MaterialCommunityIcons name="layers-outline" size={16} color={colors.warning} />
                <AppText style={styles.comparisonLabel}>Requested</AppText>
                <AppText style={styles.comparisonValue}>{requestedPieces} Pieces</AppText>
              </View>
              {isApproved && (
                <>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                  <View style={styles.approvedBox}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                    <AppText style={styles.comparisonLabel}>Approved</AppText>
                    <AppText style={styles.comparisonValue}>{approvedPieces} Pieces</AppText>
                    {piecesDiff !== 0 && (
                      <AppText
                        style={[
                          styles.diffText,
                          piecesDiff > 0 ? styles.positiveDiff : styles.negativeDiff,
                        ]}
                      >
                        {piecesDiff > 0 ? `+${piecesDiff}` : `${piecesDiff}`}
                      </AppText>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Value */}
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <View style={styles.requestedBox}>
                <Ionicons name="cash-outline" size={16} color={colors.warning} />
                <AppText style={styles.comparisonLabel}>Requested</AppText>
                <AppText style={styles.comparisonValue}>{formatCurrency(requestedValue)}</AppText>
              </View>
              {isApproved && (
                <>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                  <View style={styles.approvedBox}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <AppText style={styles.comparisonLabel}>Approved</AppText>
                    <AppText style={styles.comparisonValue}>
                      {formatCurrency(approvedValue)}
                    </AppText>
                    {valueDiff !== 0 && (
                      <AppText
                        style={[
                          styles.diffText,
                          valueDiff > 0 ? styles.positiveDiff : styles.negativeDiff,
                        ]}
                      >
                        {valueDiff > 0
                          ? `+${formatCurrency(valueDiff)}`
                          : formatCurrency(valueDiff)}
                      </AppText>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Weight */}
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <View style={styles.requestedBox}>
                <Ionicons name="scale-outline" size={16} color={colors.warning} />
                <AppText style={styles.comparisonLabel}>Requested</AppText>
                <AppText style={styles.comparisonValue}>{formatWeight(requestedWeight)}</AppText>
              </View>
              {isApproved && (
                <>
                  <Ionicons name="arrow-forward" size={16} color={colors.textTertiary} />
                  <View style={styles.approvedBox}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <AppText style={styles.comparisonLabel}>Approved</AppText>
                    <AppText style={styles.comparisonValue}>{formatWeight(approvedWeight)}</AppText>
                    {weightDiff !== 0 && (
                      <AppText
                        style={[
                          styles.diffText,
                          weightDiff > 0 ? styles.positiveDiff : styles.negativeDiff,
                        ]}
                      >
                        {weightDiff > 0 ? `+${formatWeight(weightDiff)}` : formatWeight(weightDiff)}
                      </AppText>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Pending Indicator */}
      {isPending && (
        <View style={styles.pendingSection}>
          <LinearGradient
            colors={[colors.warning + '15', colors.warning + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pendingCard}
          >
            <Ionicons name="time-outline" size={24} color={colors.warning} />
            <View style={styles.pendingContent}>
              <AppText style={styles.pendingTitle}>Pending Approval</AppText>
              <AppText style={styles.pendingText}>
                This request is waiting for approval from the warehouse manager.
              </AppText>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Rejected Indicator */}
      {isRejected && (
        <View style={styles.rejectedSection}>
          <LinearGradient
            colors={[colors.error + '15', colors.error + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rejectedCard}
          >
            <Ionicons name="alert-circle" size={24} color={colors.error} />
            <View style={styles.rejectedContent}>
              <AppText style={styles.rejectedTitle}>Request Rejected</AppText>
              <AppText style={styles.rejectedText}>
                {detail.rejectedReason || 'No reason provided'}
              </AppText>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Approved By Section (for approved requests) */}
      {isApproved && detail.approvedByName && (
        <View style={styles.approvedSection}>
          <LinearGradient
            colors={[colors.success + '15', colors.success + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.approvedCard}
          >
            <View style={styles.approvedHeader}>
              <View style={[styles.approvedIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              </View>
              <View>
                <AppText style={styles.approvedTitle}>Approved By</AppText>
                <AppText style={styles.approvedName}>{detail.approvedByName}</AppText>
                <AppText style={styles.approvedDate}>
                  {detail.approvedAt
                    ? formatDateTime(detail.approvedAt)
                    : formatDateTime(detail.updatedAt)}
                </AppText>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

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
