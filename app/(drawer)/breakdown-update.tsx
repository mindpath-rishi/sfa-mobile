import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppButton, AppModal, AppText, SearchBar } from '@/core/components';
import { useOfflineStore } from '@/core/offline/offline.store';
import { vanService } from '@/shared/services/van.service';
import { useTheme } from '@/shared/hooks/useTheme';
import { toast } from '@/shared/utils/toast';

type BreakdownReason =
  | 'ENGINE_ISSUE'
  | 'TYRE_PUNCTURE'
  | 'ACCIDENT_DAMAGE'
  | 'ELECTRICAL_ISSUE'
  | 'MAINTENANCE_SERVICE'
  | 'OTHER';

type VanOption = {
  vanId: string;
  name?: string;
  vanNumber?: string;
  driverName?: string;
  status?: string;
  breakdownReason?: BreakdownReason;
};

const BREAKDOWN_REASONS: Array<{
  value: BreakdownReason;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { value: 'ENGINE_ISSUE', label: 'Engine issue', icon: 'engine-outline' },
  { value: 'TYRE_PUNCTURE', label: 'Tyre / puncture', icon: 'tire' },
  { value: 'ACCIDENT_DAMAGE', label: 'Accident / vehicle damage', icon: 'car-emergency' },
  { value: 'ELECTRICAL_ISSUE', label: 'Electrical issue', icon: 'car-battery' },
  {
    value: 'MAINTENANCE_SERVICE',
    label: 'Maintenance / service required',
    icon: 'wrench-outline',
  },
  { value: 'OTHER', label: 'Other breakdown reason', icon: 'dots-horizontal-circle-outline' },
];

const getApiMessage = (error: unknown) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } }).response
    ?.data?.message;
  if (Array.isArray(message)) return message[0];
  return message || (error instanceof Error ? error.message : 'Unable to update breakdown');
};

export default function BreakdownUpdateScreen() {
  const { colors } = useTheme();
  const offline = useOfflineStore((state) => !state.isConnected || !state.isInternetReachable);
  const [vans, setVans] = useState<VanOption[]>([]);
  const [selectedVanIds, setSelectedVanIds] = useState<string[]>([]);
  const [reasonsByVanId, setReasonsByVanId] = useState<Record<string, BreakdownReason>>({});
  const [search, setSearch] = useState('');
  const [reasonVanId, setReasonVanId] = useState<string>();
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadVans = useCallback(
    async (isRefresh = false) => {
      if (offline) {
        setVans([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const records: VanOption[] = [];
        const limit = 100;

        for (let page = 1; ; page += 1) {
          const response: any = await vanService.fetchAllVans({ page, limit });
          const responseData = response?.data?.data ?? response?.data ?? [];
          const batch = Array.isArray(responseData) ? responseData : [];
          const total = Number(response?.meta?.total ?? response?.data?.meta?.total ?? 0);
          records.push(...batch);

          if (batch.length < limit || (total > 0 && records.length >= total)) break;
        }

        setVans(records);
      } catch (error) {
        toast.error('Unable to load vehicles', getApiMessage(error));
        setVans([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [offline],
  );

  useFocusEffect(
    useCallback(() => {
      void loadVans();
    }, [loadVans]),
  );

  const filteredVans = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vans;
    return vans.filter((van) =>
      [van.name, van.vanNumber, van.vanId, van.driverName].some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [search, vans]);

  const toggleVan = (vanId: string, existingReason?: BreakdownReason) => {
    setSelectedVanIds((current) => {
      if (!current.includes(vanId)) {
        if (existingReason) {
          setReasonsByVanId((reasons) => ({
            ...reasons,
            [vanId]: existingReason,
          }));
        }
        setReasonVanId(vanId);
        setReasonModalOpen(true);
        return [...current, vanId];
      }

      setReasonsByVanId((reasons) => {
        const next = { ...reasons };
        delete next[vanId];
        return next;
      });
      return current.filter((selectedVanId) => selectedVanId !== vanId);
    });
  };

  const submit = async () => {
    if (!selectedVanIds.length) {
      toast.error('Select at least one vehicle');
      return;
    }
    const vansWithoutReason = selectedVanIds.filter((vanId) => !reasonsByVanId[vanId]);
    if (vansWithoutReason.length) {
      toast.error(
        'Select a reason for every vehicle',
        `${vansWithoutReason.length} selected vehicle${vansWithoutReason.length === 1 ? ' is' : 's are'} missing a reason.`,
      );
      return;
    }
    if (offline) {
      toast.error('Breakdown Update is unavailable offline');
      return;
    }

    setSubmitting(true);
    try {
      const vansByReason = selectedVanIds.reduce<Record<string, string[]>>((groups, vanId) => {
        const vanReason = reasonsByVanId[vanId];
        if (!vanReason) return groups;
        groups[vanReason] = [...(groups[vanReason] || []), vanId];
        return groups;
      }, {});

      const responses = await Promise.all(
        Object.entries(vansByReason).map(([vanReason, vanIds]) =>
          vanService.updateBreakdown({ vanIds, reason: vanReason }),
        ),
      );
      toast.success(
        'Breakdown updated',
        `${selectedVanIds.length} vehicle${selectedVanIds.length === 1 ? '' : 's'} marked as breakdown.`,
      );
      setSelectedVanIds([]);
      setReasonsByVanId({});
      await loadVans();
      return responses;
    } catch (error) {
      toast.error('Breakdown update failed', getApiMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.screen}>
      <View style={styles.fixedSearchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search van name, number, ID, or driver"
          clearable
          debounceDelay={0}
        />
      </View>
      <View style={styles.vehicleHeader}>
        <AppText style={styles.vehicleCount}>
          {filteredVans.length} vehicle{filteredVans.length === 1 ? '' : 's'}
        </AppText>
        <AppText style={styles.selectedCount}>{selectedVanIds.length} selected</AppText>
      </View>

      {offline ? (
        <View style={styles.messageCard}>
          <MaterialCommunityIcons name="wifi-off" size={28} color={colors.warning} />
          <AppText style={styles.messageTitle}>Internet connection required</AppText>
          <AppText style={styles.messageText}>
            Reconnect to load vehicles and submit a breakdown update.
          </AppText>
        </View>
      ) : loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.messageText}>Loading vehicles...</AppText>
        </View>
      ) : (
        <FlatList
          data={filteredVans}
          keyExtractor={(item) => item.vanId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadVans(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.messageCard}>
              <MaterialCommunityIcons
                name="truck-alert-outline"
                size={34}
                color={colors.textSecondary}
              />
              <AppText style={styles.messageTitle}>No vehicles found</AppText>
              <AppText style={styles.messageText}>
                Try another search or refresh the vehicle list.
              </AppText>
            </View>
          }
          renderItem={({ item }) => {
            const selected = selectedVanIds.includes(item.vanId);
            const selectedReason = BREAKDOWN_REASONS.find(
              (reasonOption) => reasonOption.value === reasonsByVanId[item.vanId],
            );
            const currentBreakdownReason = BREAKDOWN_REASONS.find(
              (reasonOption) => reasonOption.value === item.breakdownReason,
            );
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.vanCard, selected && styles.vanCardSelected]}
                onPress={() => toggleVan(item.vanId, item.breakdownReason)}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? <MaterialCommunityIcons name="check" size={16} color="#fff" /> : null}
                </View>
                <View style={styles.vanCopy}>
                  <AppText style={styles.vanName}>
                    {item.name || item.vanNumber || item.vanId}
                  </AppText>
                  <AppText style={styles.vanMeta}>
                    {[item.vanNumber, item.vanId, item.driverName].filter(Boolean).join(' · ')}
                  </AppText>
                  {item.status ? <AppText style={styles.vanStatus}>{item.status}</AppText> : null}
                  {item.status === 'BREAKDOWN' ? (
                    <View style={styles.breakdownBadge}>
                      <MaterialCommunityIcons name="alert-outline" size={13} color={colors.error} />
                      <AppText style={styles.breakdownBadgeText}>
                        Currently marked breakdown
                        {currentBreakdownReason ? ` · ${currentBreakdownReason.label}` : ''}
                      </AppText>
                    </View>
                  ) : null}
                  {selected ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.vanReasonButton}
                      onPress={(event) => {
                        event.stopPropagation();
                        setReasonVanId(item.vanId);
                        setReasonModalOpen(true);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={selectedReason?.icon || 'alert-circle-outline'}
                        size={18}
                        color={selectedReason ? colors.primary : colors.warning}
                      />
                      <AppText
                        style={selectedReason ? styles.vanReasonValue : styles.vanReasonPlaceholder}
                      >
                        {selectedReason?.label || 'Select reason for this vehicle'}
                      </AppText>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <AppButton
          title={
            selectedVanIds.length
              ? `Update ${selectedVanIds.length} Vehicle${selectedVanIds.length === 1 ? '' : 's'}`
              : 'Update Vehicles'
          }
          fullWidth
          loading={submitting}
          disabled={
            offline ||
            submitting ||
            !selectedVanIds.length ||
            selectedVanIds.some((vanId) => !reasonsByVanId[vanId])
          }
          leftIcon={
            <MaterialCommunityIcons name="content-save-alert-outline" size={20} color="#fff" />
          }
          onPress={() => void submit()}
        />
      </View>

      <AppModal
        visible={reasonModalOpen}
        onClose={() => {
          setReasonModalOpen(false);
          setReasonVanId(undefined);
        }}
        title={
          reasonVanId
            ? `Reason for ${vans.find((van) => van.vanId === reasonVanId)?.name || reasonVanId}`
            : 'Select Breakdown Reason'
        }
        position="bottom"
        animation="slide"
        size="md"
        showCloseButton
      >
        <View style={styles.reasonList}>
          {BREAKDOWN_REASONS.map((item) => {
            const selected = reasonVanId ? item.value === reasonsByVanId[reasonVanId] : false;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.8}
                style={[styles.reasonItem, selected && styles.reasonItemSelected]}
                onPress={() => {
                  if (reasonVanId) {
                    setSelectedVanIds((current) =>
                      current.includes(reasonVanId) ? current : [...current, reasonVanId],
                    );
                    setReasonsByVanId((current) => ({
                      ...current,
                      [reasonVanId]: item.value,
                    }));
                  }
                  setReasonModalOpen(false);
                  setReasonVanId(undefined);
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={selected ? colors.primary : colors.textSecondary}
                />
                <AppText style={styles.reasonLabel}>{item.label}</AppText>
                <MaterialCommunityIcons
                  name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                  size={21}
                  color={selected ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </AppModal>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    fixedSearchContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
    },
    formCard: {
      backgroundColor: colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
    titleIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}12`,
    },
    titleCopy: { flex: 1 },
    title: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
    subtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
    label: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginBottom: 7 },
    dropdown: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      backgroundColor: colors.background,
    },
    dropdownContent: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
    dropdownValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
    dropdownPlaceholder: { color: colors.textSecondary, fontSize: 14 },
    vehicleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    vehicleCount: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
    selectedCount: { color: colors.primary, fontSize: 12, fontWeight: '700' },
    searchInput: { minHeight: 44, fontSize: 13 },
    listContent: { padding: 14, paddingBottom: 110, gap: 10, flexGrow: 1 },
    vanCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
      padding: 14,
    },
    vanCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}08`,
    },
    checkbox: {
      width: 23,
      height: 23,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    vanCopy: { flex: 1 },
    vanName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
    vanMeta: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 3 },
    vanStatus: {
      alignSelf: 'flex-start',
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      marginTop: 5,
    },
    breakdownBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 7,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: `${colors.error}12`,
    },
    breakdownBadgeText: { color: colors.error, fontSize: 10, fontWeight: '700' },
    vanReasonButton: {
      minHeight: 42,
      marginTop: 10,
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    vanReasonValue: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    vanReasonPlaceholder: {
      flex: 1,
      color: colors.warning,
      fontSize: 12,
      fontWeight: '600',
    },
    loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    messageCard: {
      margin: 20,
      padding: 28,
      borderRadius: 16,
      backgroundColor: colors.surface,
      alignItems: 'center',
      gap: 8,
    },
    messageTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
    messageText: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    reasonList: { gap: 8, paddingBottom: 10 },
    reasonItem: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 13,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reasonItemSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}08`,
    },
    reasonLabel: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  });
