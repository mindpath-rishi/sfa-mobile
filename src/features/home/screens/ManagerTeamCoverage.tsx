import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText, Skeleton } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { homeService } from '../services/home.service';
import type { ManagerTeamCoverageResponse } from '../services/home.service';
import { createManagerTeamCoverageStyles } from '../styles/ManagerTeamCoverage.styles';

const INITIAL_TEAM_COVERAGE: ManagerTeamCoverageResponse = {
  users: 0,
  vans: 0,
  warehouse: 0,
  routes: 0,
  outlets: 0,
  outletsPlanned: 0,
  upc: 0,
  uic: 0,
};

type MCIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

type CoverageCard = {
  label: string;
  value: string;
  icon: MCIconName;
  iconColor: string;
  iconBackground: string;
  detailType?: DetailType;
};

type DetailType = 'users' | 'vans' | 'outlets' | 'plannedOutlets';

type DetailListItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  icon: MCIconName;
};

const clampPercentage = (value: number) => Math.max(0, Math.min(value, 100));

const formatOptionalNumber = (value?: number) => (value ? formatNumber(value) : undefined);

function TeamCoverageDetailModal({
  visible,
  title,
  count,
  items,
  styles,
  colors,
  onClose,
}: {
  visible: boolean;
  title: string;
  count: number;
  items: DetailListItem[];
  styles: ReturnType<typeof createManagerTeamCoverageStyles>;
  colors: ReturnType<typeof useTheme>['colors'];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={`Close ${title} list`}
        />
        <View style={styles.detailModal}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleBlock}>
              <AppText style={styles.modalTitle}>{title}</AppText>
              <AppText style={styles.modalSubtitle}>{formatNumber(count)} records</AppText>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title} list`}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              items.length ? styles.modalListContent : styles.modalEmptyContent
            }
            ItemSeparatorComponent={() => <View style={styles.modalRowDivider} />}
            ListEmptyComponent={
              <View style={styles.modalEmptyState}>
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={26}
                  color={colors.textQuaternary}
                />
                <AppText style={styles.modalEmptyText}>No records found</AppText>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.modalRow}>
                <View style={styles.modalRowIcon}>
                  <MaterialCommunityIcons name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.modalRowTextBlock}>
                  <AppText style={styles.modalRowTitle} numberOfLines={1}>
                    {item.title}
                  </AppText>
                  {!!item.subtitle && (
                    <AppText style={styles.modalRowSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </AppText>
                  )}
                </View>
                {!!item.meta && (
                  <AppText style={styles.modalRowMeta} numberOfLines={1}>
                    {item.meta}
                  </AppText>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function TeamCoverageSkeleton({
  styles,
}: {
  styles: ReturnType<typeof createManagerTeamCoverageStyles>;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <View style={styles.skeletonOverviewText}>
            <Skeleton width="50%" height={12} borderRadius={6} />
            <Skeleton width="34%" height={30} borderRadius={10} style={styles.skeletonLineGap} />
          </View>
          <Skeleton width={54} height={54} borderRadius={14} />
        </View>
        <Skeleton width="100%" height={8} borderRadius={8} style={styles.skeletonLineGap} />
        <View style={styles.overviewMetaRow}>
          <Skeleton width="34%" height={12} borderRadius={6} />
          <Skeleton width="28%" height={12} borderRadius={6} />
        </View>
      </View>

      <View style={styles.resourceSummary}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.resourceItem}>
            <Skeleton width={34} height={34} borderRadius={8} style={styles.skeletonResourceIcon} />
            <View style={styles.resourceTextBlock}>
              <Skeleton width="46%" height={20} borderRadius={8} />
              <Skeleton width="54%" height={11} borderRadius={6} style={styles.skeletonLineGap} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.metricsPanel}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index}>
            <View style={styles.metricRow}>
              <Skeleton width={34} height={34} borderRadius={8} style={styles.skeletonMetricIcon} />
              <View style={styles.metricTextBlock}>
                <Skeleton width="46%" height={13} borderRadius={6} />
              </View>
              <Skeleton width="24%" height={22} borderRadius={8} />
            </View>
            {index < 4 && <View style={styles.metricDivider} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function ManagerTeamCoverageScreen() {
  const { colors } = useTheme();
  const styles = createManagerTeamCoverageStyles(colors);
  const { setHeader } = useHeader();
  const [teamCoverage, setTeamCoverage] =
    useState<ManagerTeamCoverageResponse>(INITIAL_TEAM_COVERAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeDetailType, setActiveDetailType] = useState<DetailType | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const isFetchingRef = useRef(false);

  const resourceCards = useMemo(
    () => [
      {
        label: 'Users',
        value: formatNumber(teamCoverage.users ?? 0),
        icon: 'account-outline' as MCIconName,
        detailType: 'users' as DetailType,
      },
      {
        label: 'Vans',
        value: formatNumber(teamCoverage.vans ?? 0),
        icon: 'van-passenger' as MCIconName,
        detailType: 'vans' as DetailType,
      },
      {
        label: 'Warehouse',
        value: formatNumber(teamCoverage.warehouse ?? 0),
        icon: 'warehouse' as MCIconName,
      },
    ],
    [teamCoverage.users, teamCoverage.vans, teamCoverage.warehouse],
  );

  const coverageCards = useMemo<CoverageCard[]>(
    () => [
      {
        label: 'Routes Covered',
        value: formatNumber(teamCoverage.routes),
        icon: 'map-marker-path' as MCIconName,
        iconColor: colors.primary,
        iconBackground: `${colors.primary}14`,
      },
      {
        label: 'Outlets',
        value: formatNumber(teamCoverage.outlets),
        icon: 'storefront-outline' as MCIconName,
        iconColor: colors.success,
        iconBackground: colors.successLight,
        detailType: 'outlets',
      },
      {
        label: 'Outlets Planned',
        value: formatNumber(teamCoverage.outletsPlanned),
        icon: 'calendar-check-outline' as MCIconName,
        iconColor: colors.warning,
        iconBackground: colors.warningLight,
        detailType: 'plannedOutlets',
      },
      {
        label: 'UPC',
        value: formatNumber(teamCoverage.upc),
        icon: 'chart-line' as MCIconName,
        iconColor: colors.secondary,
        iconBackground: `${colors.secondary}14`,
      },
      {
        label: 'UIC',
        value: formatNumber(teamCoverage.uic),
        icon: 'clipboard-list-outline' as MCIconName,
        iconColor: colors.info,
        iconBackground: colors.infoLight,
      },
    ],
    [
      colors.info,
      colors.infoLight,
      colors.primary,
      colors.secondary,
      colors.success,
      colors.successLight,
      colors.warning,
      colors.warningLight,
      teamCoverage.outlets,
      teamCoverage.outletsPlanned,
      teamCoverage.routes,
      teamCoverage.uic,
      teamCoverage.upc,
    ],
  );

  const plannedOutletCount = teamCoverage.outletsPlanned || 0;
  const coveredOutletCount = teamCoverage.outlets || 0;
  const coveragePercentage = plannedOutletCount
    ? clampPercentage((coveredOutletCount / plannedOutletCount) * 100)
    : 0;
  const coveragePercentageLabel = `${Math.round(coveragePercentage)}%`;

  const detailModalConfig = useMemo(() => {
    if (!activeDetailType) {
      return {
        title: '',
        count: 0,
        items: [] as DetailListItem[],
      };
    }

    if (activeDetailType === 'users') {
      return {
        title: 'Users',
        count: teamCoverage.users ?? 0,
        items: (teamCoverage.userList || []).map((user, index) => ({
          id: user.employeeId || `user-${index}`,
          title: user.name || user.employeeId || 'Unnamed user',
          subtitle: user.positionId || user.employeeId,
          meta: user.mobile,
          icon: 'account-outline' as MCIconName,
        })),
      };
    }

    if (activeDetailType === 'vans') {
      return {
        title: 'Vans',
        count: teamCoverage.vans ?? 0,
        items: (teamCoverage.vanList || []).map((van, index) => {
          const routeCount = formatOptionalNumber(van.routeCount);

          return {
            id: van.vanId || van.vanNumber || `van-${index}`,
            title: van.name || van.vanNumber || van.vanId || 'Unnamed van',
            subtitle: [van.vanNumber, van.driverName].filter(Boolean).join(' · '),
            meta: routeCount ? `${routeCount} routes` : undefined,
            icon: 'van-passenger' as MCIconName,
          };
        }),
      };
    }

    const outletSource =
      activeDetailType === 'plannedOutlets'
        ? teamCoverage.plannedOutletList || []
        : teamCoverage.outletList || [];

    return {
      title: activeDetailType === 'plannedOutlets' ? 'Outlets Planned' : 'Outlets',
      count:
        activeDetailType === 'plannedOutlets'
          ? (teamCoverage.outletsPlanned ?? 0)
          : (teamCoverage.outlets ?? 0),
      items: outletSource.map((outlet, index) => ({
        id: outlet.customerId || `outlet-${index}`,
        title: outlet.name || outlet.customerId || 'Unnamed outlet',
        subtitle: [outlet.ownerName, outlet.customerId].filter(Boolean).join(' · '),
        meta: outlet.phoneNumber || outlet.marketId || outlet.segmentation,
        icon: 'storefront-outline' as MCIconName,
      })),
    };
  }, [activeDetailType, teamCoverage]);

  const fetchTeamCoverage = useCallback(async ({ silent }: { silent?: boolean } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await homeService.getManagerTeamCoverage();

      if (response.success && response.data) {
        setTeamCoverage(response.data);
        setHasError(false);
      } else if (!silent) {
        setHasError(true);
      }
    } catch (error) {
      console.warn('Failed to load manager team coverage', error);
      setHasError(true);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
      hasLoadedOnceRef.current = true;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Team Coverage',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
      if (hasLoadedOnceRef.current) {
        setIsRefreshing(true);
      }
      fetchTeamCoverage();
    }, [colors.primary, fetchTeamCoverage, setHeader]),
  );

  const handleRefresh = useCallback(() => {
    if (isFetchingRef.current) {
      return;
    }

    setIsRefreshing(true);
    fetchTeamCoverage({ silent: true });
  }, [fetchTeamCoverage]);

  if (isLoading) {
    return <TeamCoverageSkeleton styles={styles} />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {hasError && (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => fetchTeamCoverage()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading team coverage"
          >
            <Ionicons name="alert-circle-outline" size={16} color={colors.error ?? '#C0392B'} />
            <AppText style={styles.errorBannerText}>
              Couldn't refresh all data. Tap to retry.
            </AppText>
          </TouchableOpacity>
        )}

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewTextBlock}>
              <AppText style={styles.overviewEyebrow}>Outlet coverage</AppText>
              <AppText style={styles.overviewValue}>{coveragePercentageLabel}</AppText>
              <AppText style={styles.overviewCaption} numberOfLines={1}>
                {formatNumber(coveredOutletCount)} of {formatNumber(plannedOutletCount)} planned
              </AppText>
            </View>
            <View style={styles.overviewIconWrap}>
              <MaterialCommunityIcons name="map-check-outline" size={28} color={colors.primary} />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${coveragePercentage}%` }]} />
          </View>
          <View style={styles.overviewMetaRow}>
            <AppText style={styles.overviewMetaText} numberOfLines={1}>
              {formatNumber(teamCoverage.routes)} routes covered
            </AppText>
            <AppText
              style={[styles.overviewMetaText, styles.overviewMetaTextRight]}
              numberOfLines={1}
            >
              {formatNumber(teamCoverage.upc)} productive calls
            </AppText>
          </View>
        </View>

        <View style={styles.resourceSummary}>
          {resourceCards.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.resourceItem}
              activeOpacity={item.detailType ? 0.82 : 1}
              disabled={!item.detailType}
              onPress={() => item.detailType && setActiveDetailType(item.detailType)}
              accessibilityRole={item.detailType ? 'button' : undefined}
              accessibilityLabel={item.detailType ? `Open ${item.label} list` : undefined}
            >
              <View style={styles.resourceIcon}>
                <MaterialCommunityIcons name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.resourceTextBlock}>
                <AppText style={styles.resourceValue} numberOfLines={1}>
                  {item.value}
                </AppText>
                <AppText style={styles.resourceLabel} numberOfLines={1}>
                  {item.label}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.metricsPanel}>
          {coverageCards.map((item, index) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.metricRow}
                activeOpacity={item.detailType ? 0.82 : 1}
                disabled={!item.detailType}
                onPress={() => item.detailType && setActiveDetailType(item.detailType)}
                accessibilityRole={item.detailType ? 'button' : undefined}
                accessibilityLabel={item.detailType ? `Open ${item.label} list` : undefined}
              >
                <View style={[styles.metricIcon, { backgroundColor: item.iconBackground }]}>
                  <MaterialCommunityIcons name={item.icon} size={16} color={item.iconColor} />
                </View>
                <View style={styles.metricTextBlock}>
                  <AppText style={styles.metricLabel} numberOfLines={1}>
                    {item.label}
                  </AppText>
                </View>
                <AppText style={styles.metricValue} numberOfLines={1}>
                  {item.value}
                </AppText>
                {!!item.detailType && (
                  <Ionicons name="chevron-forward" size={16} color={colors.textQuaternary} />
                )}
              </TouchableOpacity>
              {index < coverageCards.length - 1 && <View style={styles.metricDivider} />}
            </View>
          ))}
        </View>
      </ScrollView>

      <TeamCoverageDetailModal
        visible={!!activeDetailType}
        title={detailModalConfig.title}
        count={detailModalConfig.count}
        items={detailModalConfig.items}
        styles={styles}
        colors={colors}
        onClose={() => setActiveDetailType(null)}
      />
    </>
  );
}
