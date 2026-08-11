import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { vanService } from '@/shared/services/van.service';
import type { StockItem } from '../types/stock.types';

type InventoryTransaction = {
  transactionId?: string;
  transactionType?: string;
  direction?: 'IN' | 'OUT';
  quantity?: number;
  cases?: number;
  pieces?: number;
  referenceNo?: string;
  remark?: string;
  transactionDate?: string;
  createdAt?: string;
};

export function InventoryHistorySheet({
  visible,
  item,
  vanId,
  onClose,
}: {
  visible: boolean;
  item: StockItem | null;
  vanId?: string;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const [records, setRecords] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!visible || !item?.productId) return;
    let active = true;
    setLoading(true);
    setError(undefined);
    void vanService
      .fetchInventoryTransactions({ productId: item.productId, vanId, page: 1, limit: 100 })
      .then((response) => {
        if (!active) return;
        if (!response.success)
          throw new Error(response.message || 'Unable to load inventory history');
        const value = response.data as any;
        setRecords(Array.isArray(value) ? value : (value?.data ?? []));
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'Unable to load inventory history');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [item?.productId, vanId, visible]);

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      position="bottom"
      size="lg"
      animation="slide"
      title="Inventory history"
    >
      <View style={{ minHeight: 300, maxHeight: 560 }}>
        <View style={{ paddingHorizontal: 4, paddingBottom: 14 }}>
          <AppText style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '800' }}>
            {item?.name || 'Product'}
          </AppText>
          <AppText style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>
            {item?.productId}
          </AppText>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ActivityIndicator color={colors.primary} />
            <AppText style={{ color: colors.textSecondary }}>Loading movements…</AppText>
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Ionicons name="alert-circle-outline" size={34} color={colors.error} />
            <AppText style={{ color: colors.error, textAlign: 'center', marginTop: 8 }}>
              {error}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(record, index) => record.transactionId || String(index)}
            contentContainerStyle={{ gap: 9, paddingBottom: 12 }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', padding: 32 }}>
                <Ionicons name="time-outline" size={36} color={colors.textQuaternary} />
                <AppText style={{ color: colors.textSecondary, marginTop: 8 }}>
                  No inventory movements found
                </AppText>
              </View>
            }
            renderItem={({ item: record }) => {
              const incoming = record.direction === 'IN';
              const accent = incoming ? colors.success : colors.error;
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 11,
                    padding: 12,
                    borderRadius: 13,
                    borderWidth: 1,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: accent + '12',
                    }}
                  >
                    <Ionicons
                      name={incoming ? 'arrow-down-outline' : 'arrow-up-outline'}
                      size={20}
                      color={accent}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                      {record.transactionType || 'Movement'}
                    </AppText>
                    <AppText style={{ color: colors.textTertiary, fontSize: 10, marginTop: 2 }}>
                      {new Date(
                        record.transactionDate || record.createdAt || Date.now(),
                      ).toLocaleString()}
                      {record.referenceNo ? ` · ${record.referenceNo}` : ''}
                    </AppText>
                    {record.remark ? (
                      <AppText style={{ color: colors.textSecondary, fontSize: 10, marginTop: 3 }}>
                        {record.remark}
                      </AppText>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText style={{ color: accent, fontSize: 15, fontWeight: '900' }}>
                      {incoming ? '+' : '-'}
                      {Number(record.quantity || 0)}
                    </AppText>
                    <AppText style={{ color: colors.textTertiary, fontSize: 9 }}>
                      {Number(record.cases || 0)}C · {Number(record.pieces || 0)}P
                    </AppText>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </AppModal>
  );
}
