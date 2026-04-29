import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { CommonListing } from '@/shared/components/CommonListing';
import { AppText } from '@/core/components';
import { IconTile } from '@/shared/components/IconTile';
import { StatusChip } from '@/shared/components/StatusChip';
import { formatCurrency, formatDateSafe } from '@/shared/utils/currenty.utils';
import { useTheme } from '@/shared/hooks/useTheme';

import { Topup, TopupListProps } from '../types/topup.types';
import { EMPTY_STATE, SEARCH } from '../constants/topup.constants';
import { useTopupListStyles } from '../styles/topupList.styles';
import { getStatusConfig, getStatusIcon } from '../utils/topup.utils';



/**
 * TopupList Component
 *
 * Displays a searchable, filterable list of topup requests with:
 * - Status icons and badges with color coding
 * - Requested vs Approved cases/pieces breakdown
 * - Approval metadata (approver name, approval date)
 * - Pull-to-refresh and infinite scroll
 * - Navigation to detail view on selection
 */
export const TopupList: React.FC<TopupListProps> = ({
  data,
  loading,
  refreshing,
  onRefresh,
  onEndReached,
  searchQuery,
  setSearchQuery,
  filterChips,
  clearAllFilters,
  activeFilterCount,
}) => {
  const { colors } = useTheme();
  const styles = useTopupListStyles();

  /**
   * Determine empty state based on search/filters
   */
  const hasActiveFilters = searchQuery || activeFilterCount > 0;
  const emptyStateConfig = {
    title: hasActiveFilters ? EMPTY_STATE.SEARCH_TITLE : EMPTY_STATE.TITLE,
    description: hasActiveFilters ? EMPTY_STATE.SEARCH_DESCRIPTION : EMPTY_STATE.DESCRIPTION,
    icon: hasActiveFilters ? EMPTY_STATE.SEARCH_ICON : EMPTY_STATE.ICON,
    actionLabel: hasActiveFilters ? 'Clear All Filters' : undefined,
    onAction: hasActiveFilters ? clearAllFilters : undefined,
  };

  /**
   * Navigate to topup detail page
   */
  const handleItemPress = (item: Topup) => {
    router.push(`/topup/detail?id=${item.vanInventoryTopupId}`);
  };

  /**
   * Render topup item card
   */
  const renderTopupCard = (item: Topup) => {
    const statusConfig = getStatusConfig(item.status);
    const showApprovalInfo = item.status === 'APPROVED' && item.approvedByName;

    return {
      title: <AppText style={styles.title}>{item.vanName || item.vanId}</AppText>,

      leading: <IconTile icon={getStatusIcon(item.status) as any} color={statusConfig.color} />,

      headerRight: (
        <StatusChip
          label={statusConfig.label}
          color={statusConfig.color}
          backgroundColor={statusConfig.bg}
        />
      ),

      subtitle: <AppText style={styles.subtitle}>{item.employeeName || item.employeeId}</AppText>,

      subtitleRight: (
        <AppText style={styles.amount}>{formatCurrency(item.totalRequestedValue)}</AppText>
      ),

      children: (
        <View>
          {/* Cases and Pieces Section */}
          <View style={styles.casesContainer}>
            {/* Requested Column */}
            <View style={styles.casesColumn}>
              <AppText style={styles.casesLabel}>Requested</AppText>
              <View style={styles.casesPiecesRow}>
                <AppText style={styles.casesValue}>{item.totalRequestedCases || 0} Cases</AppText>
                <AppText style={styles.piecesValue}>
                  {item.totalRequestedPieces || 0} Pieces
                </AppText>
              </View>
            </View>

            {/* Approved Column */}
            <View style={styles.casesColumn}>
              <AppText style={styles.casesLabel}>Approved</AppText>
              <View style={styles.casesPiecesRow}>
                <AppText style={styles.casesValue}>{item.totalApprovedCases || 0} Cases</AppText>
                <AppText style={styles.piecesValue}>{item.totalApprovedPieces || 0} Pieces</AppText>
              </View>
            </View>
          </View>

          {/* Footer Section with Date and Approval Info */}
          <View style={styles.footerDivider}>
            {/* Date */}
            <View style={styles.dateContainer}>
              <Ionicons
                name="calendar-outline"
                size={styles.iconConfig.size}
                color={styles.iconConfig.color}
              />
              <AppText style={styles.dateText}>{formatDateSafe(item.date)}</AppText>
            </View>

            {/* Approval Info (conditional) */}
            {showApprovalInfo && (
              <View style={styles.approvedByContainer}>
                <Ionicons
                  name="shield-checkmark"
                  size={styles.iconConfig.size}
                  color={styles.iconConfig.successColor}
                />
                <AppText style={styles.approvedByText}>Approved by {item.approvedByName}</AppText>
              </View>
            )}
          </View>
        </View>
      ),

      showChevron: true,
    };
  };

  return (
    <CommonListing<Topup>
      data={data}
      keyExtractor={(item) => item.vanInventoryTopupId}
      /* Search */
      enableSearch
      searchValue={searchQuery}
      onSearch={setSearchQuery}
      searchPlaceholder={SEARCH.PLACEHOLDER}
      /* Filters */
      filterChips={filterChips}
      onClearAllFilters={clearAllFilters}
      /* Card UI */
      useDefaultCard
      cardProps={{
        title: (item) => renderTopupCard(item).title,
        leading: (item) => renderTopupCard(item).leading,
        headerRight: (item) => renderTopupCard(item).headerRight,
        subtitle: (item) => renderTopupCard(item).subtitle,
        subtitleRight: (item) => renderTopupCard(item).subtitleRight,
        children: (item) => renderTopupCard(item).children,
        showChevron: true,
        onPress: handleItemPress,
      }}
      /* Behavior */
      refreshing={refreshing}
      onRefresh={onRefresh}
      loading={loading}
      onEndReached={onEndReached}
      emptyState={emptyStateConfig}
    />
  );
};
