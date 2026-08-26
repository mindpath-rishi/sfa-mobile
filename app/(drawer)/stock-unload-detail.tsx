import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components';
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

export default function StockUnloadDetailScreen() {
  const { colors } = useTheme();
  const { unloadRequestId } = useLocalSearchParams<{ unloadRequestId: string }>();
  const [request, setRequest] = useState<UnloadRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDetail = useCallback(
    async (refresh = false) => {
      if (!unloadRequestId) return;
      refresh ? setRefreshing(true) : setLoading(true);
      try {
        const response = await notificationService.getStockUnloadDetail(unloadRequestId);
        if (response?.data) setRequest(response.data);
        else toast.error(response?.message || 'Unable to load stock unload details');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Unable to load stock unload details');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [unloadRequestId],
  );

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Stock Unload Details</AppText>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadDetail(true)} />
        }
      >
        {!request ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <AppText style={{ color: colors.textSecondary }}>
              Request details are unavailable.
            </AppText>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.titleRow}>
                <View>
                  <AppText style={[styles.requestId, { color: colors.textPrimary }]}>
                    {request.unloadRequestId}
                  </AppText>
                  <AppText style={{ color: colors.textSecondary }}>
                    {request.employeeName || request.employeeId} · Van {request.vanId}
                  </AppText>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
                  <AppText style={[styles.statusText, { color: colors.warning }]}>
                    {request.status}
                  </AppText>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Summary label="Quantity" value={request.totalQuantity} colors={colors} />
                <Summary label="Cases" value={request.totalCases} colors={colors} />
                <Summary label="Pieces" value={request.totalPieces} colors={colors} />
              </View>
            </View>

            <AppText style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Item-wise stock ({request.items?.length || 0})
            </AppText>
            {(request.items || []).map((item, index) => (
              <View
                key={`${item.productId}-${index}`}
                style={[styles.itemCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.itemName}>
                    <AppText style={[styles.productName, { color: colors.textPrimary }]}>
                      {item.productName || item.productId}
                    </AppText>
                    <AppText style={{ color: colors.textTertiary }}>{item.productId}</AppText>
                  </View>
                  <AppText style={[styles.quantity, { color: colors.primary }]}>
                    {Number(item.quantity || 0).toLocaleString()}
                  </AppText>
                </View>
                <AppText style={{ color: colors.textSecondary }}>
                  {Number(item.cases || 0).toLocaleString()} cases ·{' '}
                  {Number(item.pieces || 0).toLocaleString()} pieces
                </AppText>
              </View>
            ))}
            {!request.items?.length && (
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <AppText style={{ color: colors.textSecondary }}>
                  No item snapshot is available for this request.
                </AppText>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ label, value, colors }: { label: string; value?: number; colors: any }) {
  return (
    <View style={styles.summaryItem}>
      <AppText style={[styles.summaryValue, { color: colors.textPrimary }]}>
        {Number(value || 0).toLocaleString()}
      </AppText>
      <AppText style={{ color: colors.textTertiary }}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { padding: 16, borderRadius: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  requestId: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', marginTop: 18 },
  summaryItem: { flex: 1 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  itemCard: { padding: 14, borderRadius: 14 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  itemName: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '700' },
  quantity: { fontSize: 18, fontWeight: '900' },
});
