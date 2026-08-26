import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppModal, AppText } from '@/core/components';
import { notificationService } from '@/features/notification/services/notification.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { toast } from '@/core/utils';

type UnloadItem = {
  productId: string;
  productName?: string;
  quantity?: number;
  cases?: number;
  pieces?: number;
  value?: number;
};

type UnloadRequest = {
  unloadRequestId: string;
  employeeName?: string;
  employeeId: string;
  vanId: string;
  status: string;
  totalQuantity?: number;
  totalCases?: number;
  totalPieces?: number;
  totalValue?: number;
  items?: UnloadItem[];
  createdAt?: string;
};

export interface StockUnloadDetailModalProps {
  visible: boolean;
  unloadRequestId: string | null;
  onClose: () => void;
  /** Called after the request is approved or rejected from within the modal. */
  onResolved?: (status: 'APPROVED' | 'REJECTED') => void;
  /** Show Approve/Reject actions. Only the reporting manager can resolve a request. */
  canResolve?: boolean;
}

const STATUS_META: Record<string, { icon: keyof typeof Ionicons.glyphMap }> = {
  PENDING: { icon: 'time-outline' },
  APPROVED: { icon: 'checkmark-circle-outline' },
  REJECTED: { icon: 'close-circle-outline' },
};

export const StockUnloadDetailModal: React.FC<StockUnloadDetailModalProps> = ({
  visible,
  unloadRequestId,
  onClose,
  onResolved,
  canResolve = false,
}) => {
  const { colors } = useTheme();
  const [request, setRequest] = useState<UnloadRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<'approve' | 'reject' | null>(null);

  const loadDetail = useCallback(async () => {
    if (!unloadRequestId) return;
    setLoading(true);
    try {
      const response = await notificationService.getStockUnloadDetail(unloadRequestId);
      if (response?.data) setRequest(response.data);
      else toast.error(response?.message || 'Unable to load stock unload details');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to load stock unload details');
    } finally {
      setLoading(false);
    }
  }, [unloadRequestId]);

  useEffect(() => {
    if (visible) {
      setRequest(null);
      void loadDetail();
    }
  }, [visible, loadDetail]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!unloadRequestId || resolving) return;

    setResolving(action);
    try {
      const response =
        action === 'approve'
          ? await notificationService.approveStockUnload(unloadRequestId)
          : await notificationService.rejectStockUnload(unloadRequestId);
      if (response?.success === false || ![200, 201].includes(Number(response?.statusCode))) {
        toast.error(response?.message || `Failed to ${action} stock unload request`);
        return;
      }
      toast.success(
        action === 'approve'
          ? 'Stock unload approved and van stock reset'
          : 'Stock unload request rejected',
      );
      onResolved?.(action === 'approve' ? 'APPROVED' : 'REJECTED');
      await loadDetail();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${action} stock unload request`);
    } finally {
      setResolving(null);
    }
  };

  const statusColor =
    request?.status === 'APPROVED'
      ? colors.success
      : request?.status === 'REJECTED'
        ? colors.error
        : colors.warning;
  const statusIcon = STATUS_META[request?.status || 'PENDING']?.icon || 'time-outline';

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title="Stock Unload Details"
      size="full"
      position="bottom"
      animation="slide"
      scrollable
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !request ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="alert-circle-outline" size={28} color={colors.textTertiary} />
          <AppText style={{ color: colors.textSecondary, marginTop: 8 }}>
            Request details are unavailable.
          </AppText>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.headerCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.titleRow}>
              <View style={styles.titleTextGroup}>
                <AppText style={[styles.requestId, { color: colors.textPrimary }]}>
                  {request.unloadRequestId}
                </AppText>
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={13} color={colors.textTertiary} />
                  <AppText style={[styles.metaText, { color: colors.textSecondary }]}>
                    {request.employeeName || request.employeeId}
                  </AppText>
                  <View style={[styles.metaDot, { backgroundColor: colors.textTertiary }]} />
                  <Ionicons name="car-outline" size={13} color={colors.textTertiary} />
                  <AppText style={[styles.metaText, { color: colors.textSecondary }]}>
                    Van {request.vanId}
                  </AppText>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                <Ionicons name={statusIcon} size={13} color={statusColor} />
                <AppText style={[styles.statusText, { color: statusColor }]}>
                  {request.status}
                </AppText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.summaryRow}>
              <Summary
                icon="cube-outline"
                label="Cases"
                value={request.totalCases}
                colors={colors}
              />
              <View style={[styles.summarySeparator, { backgroundColor: colors.border }]} />
              <Summary
                icon="layers-outline"
                label="Pieces"
                value={request.totalPieces}
                colors={colors}
              />
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Item-wise stock
            </AppText>
            <View style={[styles.countPill, { backgroundColor: colors.primary + '15' }]}>
              <AppText style={[styles.countPillText, { color: colors.primary }]}>
                {request.items?.length || 0}
              </AppText>
            </View>
          </View>

          {!!request.items?.length && (
            <View>
              {request.items.map((item, index) => (
                <View
                  key={`${item.productId}-${index}`}
                  style={[
                    styles.itemRow,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.itemName}>
                    <AppText
                      style={[styles.productName, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {item.productName || item.productId}
                    </AppText>
                    <AppText
                      style={[styles.productId, { color: colors.textTertiary }]}
                      numberOfLines={1}
                    >
                      {item.productId}
                    </AppText>
                  </View>
                  <View style={styles.itemStatsRow}>
                    <View style={styles.itemStatInline}>
                      <AppText style={[styles.itemStatValue, { color: colors.textPrimary }]}>
                        {Number(item.cases || 0).toLocaleString()}
                      </AppText>
                      <AppText style={[styles.itemStatLabel, { color: colors.textTertiary }]}>
                        cases
                      </AppText>
                    </View>
                    <View style={styles.itemStatInline}>
                      <AppText style={[styles.itemStatValue, { color: colors.textPrimary }]}>
                        {Number(item.pieces || 0).toLocaleString()}
                      </AppText>
                      <AppText style={[styles.itemStatLabel, { color: colors.textTertiary }]}>
                        pieces
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
          {!request.items?.length && (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="file-tray-outline" size={28} color={colors.textTertiary} />
              <AppText style={{ color: colors.textSecondary, marginTop: 8 }}>
                No item snapshot is available for this request.
              </AppText>
            </View>
          )}

          {canResolve && request.status === 'PENDING' && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                disabled={!!resolving}
                onPress={() => handleAction('reject')}
                style={[
                  styles.actionButton,
                  { borderColor: colors.error, backgroundColor: colors.error + '10' },
                ]}
              >
                {resolving === 'reject' ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <AppText style={[styles.actionButtonText, { color: colors.error }]}>
                    Reject
                  </AppText>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!!resolving}
                onPress={() => handleAction('approve')}
                style={[
                  styles.actionButton,
                  { borderColor: colors.success, backgroundColor: colors.success + '10' },
                ]}
              >
                {resolving === 'approve' ? (
                  <ActivityIndicator size="small" color={colors.success} />
                ) : (
                  <AppText style={[styles.actionButtonText, { color: colors.success }]}>
                    Approve
                  </AppText>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </AppModal>
  );
};

function Summary({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: number;
  colors: any;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={16} color={colors.primary} style={styles.summaryIcon} />
      <View>
        <AppText style={[styles.summaryValue, { color: colors.textPrimary }]}>
          {Number(value || 0).toLocaleString()}
        </AppText>
        <AppText style={[styles.summaryLabel, { color: colors.textTertiary }]}>{label}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  emptyCard: { padding: 24, borderRadius: 16, alignItems: 'center' },

  headerCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  titleTextGroup: { flex: 1 },
  requestId: { fontSize: 17, fontWeight: '800', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 13 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, marginHorizontal: 2 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '800' },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },

  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIcon: { marginTop: 2 },
  summarySeparator: { width: StyleSheet.hairlineWidth, height: 36, marginHorizontal: 12 },
  summaryValue: { fontSize: 19, fontWeight: '800' },
  summaryLabel: { fontSize: 12, marginTop: 1 },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  countPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 22 },
  countPillText: { fontSize: 12, fontWeight: '800', textAlign: 'center' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  itemName: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '700' },
  productId: { fontSize: 11, marginTop: 1 },
  itemStatsRow: { flexDirection: 'row', gap: 14 },
  itemStatInline: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  itemStatValue: { fontSize: 14, fontWeight: '800' },
  itemStatLabel: { fontSize: 11 },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { fontSize: 14, fontWeight: '800' },
});

export default StockUnloadDetailModal;
