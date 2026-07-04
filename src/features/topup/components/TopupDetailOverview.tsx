import React from 'react';
import { ScrollView, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from '@/core/components';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { formatDateTime } from '@/shared/utils/date.utils';
import { formatWeight } from '@/shared/utils/weight.utils';

import { OverviewProps } from '../types/topupDetail.types';
import { createTopupDetailStyles } from '../styles/topupDetail.styles';
import { getStatusColor, getStatusIcon, getStatusLabel } from '../utils/topup.utils';
import { TopupStatusType } from '../constants/topup.constants';

type MetricProps = {
  label: string;
  requested: string;
  approved: string;
  approvedVisible: boolean;
};

export const TopupDetailOverview: React.FC<OverviewProps> = ({ detail, colors }) => {
  const styles = createTopupDetailStyles(colors);
  const hasApprovedTotals = ['APPROVED', 'ACCEPTED', 'DECLINED', 'REJECTED'].includes(
    detail.status,
  );
  const status = detail.status as TopupStatusType;
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const statusIcon = getStatusIcon(status) as React.ComponentProps<typeof Ionicons>['name'];

  const statusCopy: Record<string, string> = {
    DRAFT: 'This request is still being prepared.',
    SUBMITTED: 'Waiting for approval from the warehouse manager.',
    APPROVED: 'Stock is approved and ready for your confirmation.',
    ACCEPTED: 'Approved stock has been added to the van inventory.',
    DECLINED: detail.declinedReason || 'This top-up was declined by the salesman.',
    REJECTED: detail.rejectedReason || 'This request was rejected by the warehouse.',
  };

  const metrics: MetricProps[] = [
    {
      label: 'Value',
      requested: formatCurrency(detail.totalRequestedValue || 0),
      approved: formatCurrency(detail.totalApprovedValue || 0),
      approvedVisible: hasApprovedTotals,
    },
    {
      label: 'Cases',
      requested: String(detail.totalRequestedCases || 0),
      approved: String(detail.totalApprovedCases || 0),
      approvedVisible: hasApprovedTotals,
    },
    {
      label: 'Pieces',
      requested: String(detail.totalRequestedPieces || 0),
      approved: String(detail.totalApprovedPieces || 0),
      approvedVisible: hasApprovedTotals,
    },
    {
      label: 'Weight',
      requested: formatWeight(detail.totalRequestedWeight || 0),
      approved: formatWeight(detail.totalApprovedWeight || 0),
      approvedVisible: hasApprovedTotals,
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.overviewContent}>
      <View style={[styles.statusCallout, { borderColor: statusColor + '35' }]}>
        <View style={[styles.statusCalloutIcon, { backgroundColor: statusColor + '14' }]}>
          <Ionicons name={statusIcon} size={22} color={statusColor} />
        </View>
        <View style={styles.statusCalloutCopy}>
          <AppText style={[styles.statusCalloutTitle, { color: statusColor }]}>
            {statusLabel}
          </AppText>
          <AppText style={styles.statusCalloutText}>{statusCopy[detail.status]}</AppText>
        </View>
      </View>

      <View style={styles.detailSection}>
        <AppText style={styles.detailSectionTitle}>Request information</AppText>
        <View style={styles.detailInfoCard}>
          <InfoRow
            icon="business-outline"
            label="Warehouse"
            value={detail.warehouseId || 'Not assigned'}
            colors={colors}
            styles={styles}
          />
          <View style={styles.detailInfoDivider} />
          <InfoRow
            icon="person-outline"
            label="Requested by"
            value={detail.employeeName || detail.employeeId || 'Unknown'}
            colors={colors}
            styles={styles}
          />
          <View style={styles.detailInfoDivider} />
          <InfoRow
            icon="calendar-clear-outline"
            label="Requested on"
            value={formatDateTime(detail.date)}
            colors={colors}
            styles={styles}
          />
        </View>
      </View>

      <View style={styles.detailSection}>
        <View style={styles.sectionTitleRow}>
          <AppText style={styles.detailSectionTitle}>Quantity summary</AppText>
          {hasApprovedTotals && (
            <View style={styles.comparisonLegend}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <AppText style={styles.legendText}>Requested</AppText>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <AppText style={styles.legendText}>Approved</AppText>
            </View>
          )}
        </View>
        <View style={styles.metricTable}>
          {metrics.map((metric, index) => (
            <View key={metric.label}>
              <View style={styles.metricRow}>
                <AppText style={styles.metricLabel}>{metric.label}</AppText>
                <View style={styles.metricValues}>
                  <AppText style={styles.metricRequested}>{metric.requested}</AppText>
                  {metric.approvedVisible && (
                    <>
                      <Ionicons name="arrow-forward" size={13} color={colors.textQuaternary} />
                      <AppText style={styles.metricApproved}>{metric.approved}</AppText>
                    </>
                  )}
                </View>
              </View>
              {index < metrics.length - 1 && <View style={styles.metricDivider} />}
            </View>
          ))}
        </View>
      </View>

      {(detail.approvedByName || detail.acceptedAt) && (
        <View style={styles.detailSection}>
          <AppText style={styles.detailSectionTitle}>Activity</AppText>
          <View style={styles.timelineCard}>
            {detail.approvedByName && (
              <TimelineRow
                icon="shield-checkmark-outline"
                title={`Approved by ${detail.approvedByName}`}
                date={formatDateTime(detail.approvedAt || detail.updatedAt)}
                color={colors.info}
                styles={styles}
              />
            )}
            {detail.acceptedAt && (
              <TimelineRow
                icon="checkmark-done-outline"
                title="Stock accepted"
                date={formatDateTime(detail.acceptedAt)}
                color={colors.success}
                styles={styles}
              />
            )}
          </View>
        </View>
      )}

      {detail.remark && (
        <View style={styles.detailSection}>
          <AppText style={styles.detailSectionTitle}>Remark</AppText>
          <View style={styles.modernRemarkCard}>
            <MaterialCommunityIcons name="message-text-outline" size={19} color={colors.primary} />
            <AppText style={styles.modernRemarkText}>{detail.remark}</AppText>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value, colors, styles }: any) => (
  <View style={styles.detailInfoRow}>
    <View style={styles.detailInfoIcon}>
      <Ionicons name={icon} size={17} color={colors.primary} />
    </View>
    <View style={styles.detailInfoCopy}>
      <AppText style={styles.detailInfoLabel}>{label}</AppText>
      <AppText style={styles.detailInfoValue} numberOfLines={2}>
        {value}
      </AppText>
    </View>
  </View>
);

const TimelineRow = ({ icon, title, date, color, styles }: any) => (
  <View style={styles.timelineRow}>
    <View style={[styles.timelineIcon, { backgroundColor: color + '14' }]}>
      <Ionicons name={icon} size={17} color={color} />
    </View>
    <View style={styles.timelineCopy}>
      <AppText style={styles.timelineTitle}>{title}</AppText>
      <AppText style={styles.timelineDate}>{date}</AppText>
    </View>
  </View>
);
