import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText, Skeleton } from '@/core/components';
import { formatCurrency, formatDateSafe } from '@/shared/utils/currenty.utils';
import { useTheme } from '@/shared/hooks/useTheme';

import { Topup, TopupListProps } from '../types/topup.types';
import { EMPTY_STATE } from '../constants/topup.constants';
import { useTopupListStyles } from '../styles/topupList.styles';
import { getStatusConfig } from '../utils/topup.utils';

export const TopupList: React.FC<TopupListProps> = ({
  data,
  loading,
  refreshing,
  onRefresh,
  onEndReached,
  filterChips,
  clearAllFilters,
  activeFilterCount,
}) => {
  const { colors } = useTheme();
  const styles = useTopupListStyles();

  const hasActiveFilters = activeFilterCount > 0;
  const emptyStateConfig = {
    title: hasActiveFilters ? EMPTY_STATE.SEARCH_TITLE : EMPTY_STATE.TITLE,
    description: hasActiveFilters ? EMPTY_STATE.SEARCH_DESCRIPTION : EMPTY_STATE.DESCRIPTION,
    icon: hasActiveFilters ? EMPTY_STATE.SEARCH_ICON : EMPTY_STATE.ICON,
    actionLabel: hasActiveFilters ? 'Clear All Filters' : undefined,
    onAction: hasActiveFilters ? clearAllFilters : undefined,
  };

  const handleItemPress = (item: Topup) => {
    router.push(`/topup/detail?id=${item.vanInventoryTopupId}`);
  };

  const renderFilterChips = () => {
    if (filterChips.length === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        {filterChips.map((chip) => (
          <TouchableOpacity key={chip.id} style={styles.filterChip} onPress={chip.onRemove}>
            <AppText style={styles.filterChipText}>{chip.label}</AppText>
          </TouchableOpacity>
        ))}
        {activeFilterCount > 0 && (
          <TouchableOpacity style={styles.clearAllChip} onPress={clearAllFilters}>
            <AppText style={styles.clearAllText}>Clear all</AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.skeletonHeader}>
            <Skeleton height={16} width={120} borderRadius={4} />
            <Skeleton height={22} width={60} borderRadius={11} />
          </View>
          <Skeleton height={12} width={80} borderRadius={4} />
          <View style={styles.skeletonRow}>
            <Skeleton height={32} width={100} borderRadius={8} />
            <Skeleton height={32} width={100} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: { item: Topup }) => {
    const statusConfig = getStatusConfig(item.status);
    const isAwaitingAcceptance = item.status === 'APPROVED';
    const isAccepted = item.status === 'ACCEPTED';
    const isRejected = item.status === 'REJECTED';
    const isDeclined = item.status === 'DECLINED';

    const requestedValue = item.totalRequestedValue || 0;
    const approvedValue = item.totalApprovedValue || 0;

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item)}>
        <View style={[styles.cardAccent, { backgroundColor: statusConfig.color }]} />
        <View style={styles.itemHeader}>
          <View style={styles.titleGroup}>
            <View style={styles.vanIcon}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.titleCopy}>
              <AppText style={styles.title}>{item.vanName || item.vanId}</AppText>
              <AppText style={styles.reference}>
                #{item.reference || item.vanInventoryTopupId?.slice(-8)}
              </AppText>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <AppText style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </AppText>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-clear-outline" size={13} color={colors.textTertiary} />
            <AppText style={styles.metaText}>{formatDateSafe(item.date)}</AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={13} color={colors.textTertiary} />
            <AppText style={styles.metaText} numberOfLines={1}>
              {item.employeeName || item.employeeId}
            </AppText>
          </View>
        </View>

        <View style={styles.amountSection}>
          <View style={[styles.amountBlock, styles.requestedBlock]}>
            <AppText style={styles.amountLabel}>Requested</AppText>
            <AppText style={styles.amountValue}>{formatCurrency(requestedValue)}</AppText>
            <View style={styles.quantityRow}>
              <AppText style={styles.quantityText}>{item.totalRequestedCases || 0} cases</AppText>
              <View style={styles.quantityDot} />
              <AppText style={styles.quantityText}>{item.totalRequestedPieces || 0} pieces</AppText>
            </View>
          </View>

          {(isAwaitingAcceptance || isAccepted || isRejected || isDeclined) &&
            approvedValue > 0 && (
              <View style={[styles.amountBlock, styles.approvedBlock]}>
                <AppText style={styles.amountLabel}>Approved</AppText>
                <AppText style={[styles.amountValue, { color: colors.success }]}>
                  {formatCurrency(approvedValue)}
                </AppText>
                <AppText style={[styles.quantityText, { color: colors.success }]}>
                  {item.totalApprovedCases || 0} cases / {item.totalApprovedPieces || 0} pieces
                </AppText>
              </View>
            )}
        </View>

        {isAwaitingAcceptance && (
          <View style={[styles.infoRow, styles.pendingRow]}>
            <Ionicons name="time-outline" size={16} color={colors.warning} />
            <AppText style={styles.pendingInfoText}>Ready for your acceptance</AppText>
          </View>
        )}

        {isAccepted && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <AppText style={styles.infoText}>Accepted and added to stock</AppText>
          </View>
        )}

        {(isRejected || isDeclined) && (item.rejectedReason || item.declinedReason) && (
          <View style={[styles.infoRow, styles.errorRow]}>
            <AppText style={styles.errorText}>
              ⚠ {item.rejectedReason || item.declinedReason}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && data.length === 0) return renderSkeleton();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.vanInventoryTopupId}
      renderItem={renderItem}
      ListHeaderComponent={renderFilterChips()}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <AppText style={styles.emptyTitle}>{emptyStateConfig.title}</AppText>
          <AppText style={styles.emptyDescription}>{emptyStateConfig.description}</AppText>
          {emptyStateConfig.actionLabel && (
            <TouchableOpacity onPress={emptyStateConfig.onAction}>
              <AppText style={styles.emptyAction}>{emptyStateConfig.actionLabel}</AppText>
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
};
