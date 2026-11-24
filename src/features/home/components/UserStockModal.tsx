// Manager / TL view of a team user's van stock with prices.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/currenty.utils';
import { homeService, type ManagerUserStockResponse } from '../services/home.service';

type Props = {
  user: { employeeId: string; name?: string } | null;
  onClose: () => void;
};

export function UserStockModal({ user, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ManagerUserStockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    setData(null);
    homeService
      .getManagerUserStock(user.employeeId)
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) setData(response.data);
        else setError(response.message || 'Unable to load stock');
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.response?.data?.message || err?.message || 'Unable to load stock');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const text = { color: colors.textPrimary };
  const muted = { color: colors.textSecondary, fontSize: 12 };

  return (
    <Modal
      visible={Boolean(user)}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View
          style={{
            maxHeight: '85%',
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: insets.bottom + 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ flex: 1 }}>
              <AppText style={[text, { fontSize: 17, fontWeight: '700' }]}>
                {user?.name || user?.employeeId} · Stock
              </AppText>
              {data?.vanId ? (
                <AppText style={muted}>
                  Vehicle {data.vanId}
                  {data.source === 'DAILY_STOCK' ? ' · live (day started)' : ' · van inventory'}
                </AppText>
              ) : null}
            </View>
            <TouchableOpacity hitSlop={12} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {data?.totals ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 16,
                marginBottom: 8,
                padding: 12,
                borderRadius: 12,
                backgroundColor: `${colors.primary}10`,
              }}
            >
              <AppText style={text}>{data.totals.products} SKUs</AppText>
              <AppText style={text}>
                {data.totals.cases} cs / {data.totals.pieces} pc
              </AppText>
              <AppText style={[text, { fontWeight: '700' }]}>{formatCurrency(data.totals.value)}</AppText>
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator style={{ margin: 30 }} color={colors.primary} />
          ) : error ? (
            <AppText style={[muted, { textAlign: 'center', margin: 30 }]}>{error}</AppText>
          ) : (
            <FlatList
              data={data?.products ?? []}
              keyExtractor={(item) => item.productId}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
              ListEmptyComponent={
                <AppText style={[muted, { textAlign: 'center', margin: 30 }]}>
                  {data && !data.vanId ? 'No van assigned to this user' : 'No stock'}
                </AppText>
              }
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: colors.border }} />
              )}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <AppText style={[text, { flex: 1, fontWeight: '600' }]} numberOfLines={2}>
                      {item.name}
                    </AppText>
                    <AppText style={[text, { fontWeight: '700' }]}>{formatCurrency(item.value)}</AppText>
                  </View>
                  <AppText style={muted}>
                    {item.cases} cs {item.pieces} pc · Case {formatCurrency(item.casePrice)} · Pc{' '}
                    {formatCurrency(item.piecePrice)}
                  </AppText>
                  {item.openingQty !== undefined ? (
                    <AppText style={muted}>
                      Opening {item.openingQty} · In {item.inQty} · Out {item.outQty} pcs
                    </AppText>
                  ) : null}
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
