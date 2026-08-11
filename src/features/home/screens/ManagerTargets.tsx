import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText, Skeleton } from '@/core/components';
import { PageSkeleton } from '@/shared/components/PageSkeleton';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  homeService,
  TargetMetric,
  UserPrimaryCategoryTargetSummary,
  UserWiseTargetSummary,
} from '@/features/home/services/home.service';
import { formatLocalApiDate } from '@/shared/utils/date.utils';
import {
  createManagerTargetsBaseStyles,
  createManagerTargetsStyles,
} from '../styles/ManagerTargets.styles';

type SpecialUboTargetSummary = {
  employeeId: string;
  employeeName: string;
  target: number;
  achievement: number;
  remaining: number;
  percentage: number;
  crr: number;
  rrr: number;
  elapsedDays?: number;
  remainingDays?: number;
  hasTarget?: boolean;
};

type TargetUser = UserWiseTargetSummary &
  Partial<SpecialUboTargetSummary> & {
    children?: TargetUser[];
  };

type TargetView = 'user' | 'ubo' | 'focused-pack';

type BreakdownRow = {
  id: string;
  name: string;
  target: string;
  achievement: string;
  remaining?: string;
  crr?: string;
  rrr?: string;
};

const TARGET_USERS: TargetUser[] = [];

const findUser = (id?: string | string[], users: TargetUser[] = []) => {
  if (!id || Array.isArray(id)) return undefined;

  for (const user of users) {
    if (user.employeeId === id) return user;

    const child = user.children?.find((item) => item.employeeId === id);
    if (child) return child;
  }

  return undefined;
};

const METRIC_OPTIONS: { value: TargetMetric; label: string; unit: string }[] = [
  { value: 'cases', label: 'Cases', unit: 'Cases' },
  { value: 'value', label: 'Value', unit: 'Value' },
  { value: 'tonnage', label: 'KG', unit: 'KG' },
];

const TARGET_VIEWS: { value: TargetView; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'ubo', label: 'UBO' },
  { value: 'focused-pack', label: 'Focused Pack' },
];

const formatMetric = (value: number, metric: TargetMetric) => {
  const unit = METRIC_OPTIONS.find((option) => option.value === metric)?.unit || 'Cases';

  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)} ${unit}`;
};

const formatCount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);

const getTargetValue = (user: TargetUser, metric: TargetMetric) => {
  if (metric === 'value') return Number(user.targetValue || 0);
  if (metric === 'tonnage') return Number(user.targetTonnage || 0);
  return Number(user.targetCases || 0);
};

const getAchievementValue = (user: TargetUser, metric: TargetMetric) => {
  if (metric === 'value') return Number(user.achievementValue || 0);
  if (metric === 'tonnage') return Number(user.achievementTonnage || 0);
  return Number(user.achievementCases || 0);
};

const getUboTargetValue = (user: TargetUser) => Number(user.target || 0);

const getUboAchievementValue = (user: TargetUser) => Number(user.achievement || 0);

const getUboRemainingValue = (user: TargetUser) => Number(user.remaining || 0);

const getUboPercentage = (user: TargetUser) => {
  if (typeof user.percentage === 'number') return user.percentage;

  const target = getUboTargetValue(user);
  const achievement = getUboAchievementValue(user);

  return target > 0 ? Math.min((achievement / target) * 100, 100) : 0;
};

const getRemainingValue = (item: UserPrimaryCategoryTargetSummary, metric: TargetMetric) => {
  if (metric === 'value') return Number(item.remainingValue || 0);
  if (metric === 'tonnage') return Number(item.remainingTonnage || 0);
  return Number(item.remainingCases || 0);
};

const getCategoryTargetValue = (item: UserPrimaryCategoryTargetSummary, metric: TargetMetric) => {
  if (metric === 'value') return Number(item.targetValue || 0);
  if (metric === 'tonnage') return Number(item.targetTonnage || 0);
  return Number(item.targetCases || 0);
};

const getCategoryAchievementValue = (
  item: UserPrimaryCategoryTargetSummary,
  metric: TargetMetric,
) => {
  if (metric === 'value') return Number(item.achievementValue || 0);
  if (metric === 'tonnage') return Number(item.achievementTonnage || 0);
  return Number(item.achievementCases || 0);
};

function TargetMetricItem({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const stylesBase = createManagerTargetsBaseStyles(colors);

  return (
    <View style={stylesBase.metric}>
      <AppText style={stylesBase.metricValue} numberOfLines={1}>
        {value}
      </AppText>
      <AppText style={stylesBase.metricLabel}>{label}</AppText>
    </View>
  );
}

function TargetBreakdownModal({
  visible,
  userName,
  view,
  rows,
  loading,
  colors,
  isWide,
  onClose,
}: {
  visible: boolean;
  userName: string;
  view: TargetView;
  rows: BreakdownRow[];
  loading: boolean;
  colors: any;
  isWide: boolean;
  onClose: () => void;
}) {
  const styles = createManagerTargetsStyles(colors);

  const title =
    view === 'ubo'
      ? 'UBO Target'
      : view === 'focused-pack'
        ? 'Focused Pack by Product'
        : 'Primary Category Targets';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={onClose} />

        <View style={[styles.bottomSheet, isWide && styles.bottomSheetWide]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <AppText style={styles.sheetTitle}>{title}</AppText>
              <AppText style={styles.sheetSubtitle}>{userName}</AppText>
            </View>

            <TouchableOpacity
              style={styles.sheetCloseButton}
              activeOpacity={0.75}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close target details"
            >
              <Ionicons name="close" size={19} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.breakdownHeader}>
            <AppText style={[styles.breakdownHeaderText, styles.breakdownNameColumn]}>Name</AppText>
            <AppText style={styles.breakdownHeaderText}>Target</AppText>
            <AppText style={styles.breakdownHeaderText}>Ach.</AppText>
            {view === 'ubo' ? <AppText style={styles.breakdownHeaderText}>RRR</AppText> : null}
            {view === 'ubo' ? <AppText style={styles.breakdownHeaderText}>CRR</AppText> : null}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.breakdownScroll}>
            {loading ? (
              <View style={styles.breakdownLoading}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} height={54} width="100%" borderRadius={8} />
                ))}
              </View>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <View key={row.id} style={styles.breakdownRow}>
                  <AppText style={[styles.breakdownName, styles.breakdownNameColumn]}>
                    {row.name}
                  </AppText>

                  <AppText style={styles.breakdownValue}>{row.target}</AppText>
                  <AppText style={styles.breakdownValue}>{row.achievement}</AppText>

                  {view === 'ubo' ? (
                    <AppText style={styles.breakdownValue}>{row.rrr || '0'}</AppText>
                  ) : null}

                  {view === 'ubo' ? (
                    <AppText style={styles.breakdownValue}>{row.crr || '0'}</AppText>
                  ) : null}
                </View>
              ))
            ) : (
              <View style={styles.modalEmptyState}>
                <Ionicons name="analytics-outline" size={26} color={colors.textQuaternary} />
                <AppText style={styles.emptyText}>No target details found</AppText>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TargetUserCard({
  user,
  colors,
  metric,
  onPress,
  onCardPress,
  view = 'user',
}: {
  user: TargetUser;
  colors: any;
  metric: TargetMetric;
  onPress?: () => void;
  onCardPress: () => void;
  view?: TargetView;
}) {
  const styles = createManagerTargetsStyles(colors);
  const hasDrillDown = Boolean(onPress);
  const isUbo = view === 'ubo';

  const targetValue = isUbo ? getUboTargetValue(user) : getTargetValue(user, metric);

  const achievementValue = isUbo ? getUboAchievementValue(user) : getAchievementValue(user, metric);

  const remainingValue = isUbo
    ? getUboRemainingValue(user)
    : Math.max(targetValue - achievementValue, 0);

  const achievementPercentage = isUbo
    ? getUboPercentage(user)
    : targetValue > 0
      ? Math.min((achievementValue / targetValue) * 100, 100)
      : 0;

  return (
    <TouchableOpacity style={styles.userCard} activeOpacity={0.82} onPress={onCardPress}>
      <View style={styles.userCardHeader}>
        <View style={styles.cardIdentity}>
          <View style={styles.cardAccent} />

          <View style={styles.userTitleWrap}>
            <AppText style={styles.userName}>{user.employeeName}</AppText>

            <AppText style={styles.userPosition}>
              {isUbo
                ? 'Unique Billed Outlets'
                : view === 'focused-pack'
                  ? 'Focused Pack'
                  : user.position || 'User'}
            </AppText>
          </View>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.percentBadge}>
            <AppText style={styles.percentBadgeText}>{achievementPercentage.toFixed(1)}%</AppText>
          </View>

          {hasDrillDown && (
            <TouchableOpacity
              style={styles.drillButton}
              activeOpacity={0.82}
              onPress={(event) => {
                event.stopPropagation();
                onPress?.();
              }}
            >
              <Ionicons name="people-outline" size={14} color={colors.primary} />
              <AppText style={styles.drillText}>Team</AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.performanceBand}>
        <TargetMetricItem
          label={isUbo ? 'UBO Target' : 'Target'}
          value={isUbo ? formatCount(targetValue) : formatMetric(targetValue, metric)}
        />

        <View style={styles.metricDivider} />

        <TargetMetricItem
          label={isUbo ? 'Billed Outlets' : 'Achievement'}
          value={isUbo ? formatCount(achievementValue) : formatMetric(achievementValue, metric)}
        />
      </View>

      <View style={styles.progressMetaRow}>
        <AppText style={styles.progressMetaText}>
          Remaining{' '}
          {isUbo ? `${formatCount(remainingValue)} Outlets` : formatMetric(remainingValue, metric)}
        </AppText>
      </View>

      <View style={styles.cardFooter}>
        <AppText style={styles.rateLabel}>RRR {formatCount(Number(user.rrr || 0))}</AppText>

        <View style={styles.footerDot} />

        <AppText style={styles.rateLabel}>CRR {formatCount(Number(user.crr || 0))}</AppText>

        <Ionicons name="chevron-forward" size={14} color={colors.textQuaternary} />
      </View>
    </TouchableOpacity>
  );
}

function CategoryTargetPanel({
  user,
  data,
  metric,
  colors,
  loading,
}: {
  user: TargetUser;
  data: UserPrimaryCategoryTargetSummary[];
  metric: TargetMetric;
  colors: any;
  loading: boolean;
}) {
  const styles = createManagerTargetsStyles(colors);

  return (
    <View style={styles.categoryPanel}>
      <View style={styles.categoryPanelHeader}>
        <View>
          <AppText style={styles.categoryPanelTitle}>Primary Category Targets</AppText>
          <AppText style={styles.categoryPanelSubtitle}>{user.employeeName}</AppText>
        </View>

        <AppText style={styles.categoryPanelBadge}>
          {METRIC_OPTIONS.find((item) => item.value === metric)?.label}
        </AppText>
      </View>

      {loading ? (
        <View style={{ gap: 10 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={72} width="100%" borderRadius={12} />
          ))}
        </View>
      ) : data.length === 0 ? (
        <AppText style={styles.emptyText}>No category targets found</AppText>
      ) : (
        data.map((item) => {
          const target = getCategoryTargetValue(item, metric);
          const achievement = getCategoryAchievementValue(item, metric);
          const remaining = getRemainingValue(item, metric);
          const percentage = target > 0 ? Math.min((achievement / target) * 100, 100) : 0;

          return (
            <View key={item.categoryId} style={styles.categoryRow}>
              <View style={styles.categoryRowTop}>
                <AppText style={styles.categoryName} numberOfLines={1}>
                  {item.category}
                </AppText>
                <AppText style={styles.categoryPercent}>{percentage.toFixed(1)}%</AppText>
              </View>

              <View style={styles.categoryMetricsGrid}>
                <TargetMetricItem label="Target" value={formatMetric(target, metric)} />
                <TargetMetricItem label="Achieved" value={formatMetric(achievement, metric)} />
                <TargetMetricItem label="Remaining" value={formatMetric(remaining, metric)} />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function ManagerTargetsScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const styles = createManagerTargetsStyles(colors);
  const { setHeader } = useHeader();
  const params = useLocalSearchParams<{ userId?: string; date?: string }>();

  const [targetUsers, setTargetUsers] = useState<TargetUser[]>(TARGET_USERS);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<TargetMetric>('cases');
  const [activeView, setActiveView] = useState<TargetView>('user');

  const [specialTargets, setSpecialTargets] = useState<
    Record<Exclude<TargetView, 'user'>, TargetUser[]>
  >({
    ubo: [],
    'focused-pack': [],
  });

  const [specialTargetsLoaded, setSpecialTargetsLoaded] = useState<
    Record<Exclude<TargetView, 'user'>, boolean>
  >({
    ubo: false,
    'focused-pack': false,
  });

  const [loadingSpecialTargets, setLoadingSpecialTargets] = useState(false);
  const [breakdownUser, setBreakdownUser] = useState<TargetUser | null>(null);
  const [breakdownView, setBreakdownView] = useState<TargetView>('user');
  const [breakdownRows, setBreakdownRows] = useState<BreakdownRow[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const selectedUser = useMemo(
    () => findUser(params.userId, targetUsers),
    [params.userId, targetUsers],
  );

  const users = selectedUser
    ? selectedUser.children?.length
      ? selectedUser.children
      : [selectedUser]
    : targetUsers;

  const selectedRouteDate = formatLocalApiDate(new Date());

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Targets Vs Ach',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, setHeader]),
  );

  const fetchTargetSummary = async () => {
    setLoading(true);

    try {
      const response = await homeService.getUserWiseTargetSummary(selectedRouteDate);

      if (response.success && response.data) {
        setTargetUsers(response.data as TargetUser[]);
      }
    } catch (error) {
      console.warn('Failed to load user-wise target summary', error);
    } finally {
      setLoading(false);
    }
  };

  const openTargetBreakdown = async (user: TargetUser) => {
    const view = activeView;
    const metric = view === 'ubo' ? 'cases' : selectedMetric;

    setBreakdownUser(user);
    setBreakdownView(view);
    setBreakdownRows([]);
    setBreakdownLoading(true);

    try {
      const params = {
        employeeId: user.employeeId,
        date: selectedRouteDate,
      };

      if (view === 'ubo') {
        const response = await homeService.getUserUboTargets(params);

        setBreakdownRows(
          (response.data || []).map((item) => ({
            id: item.categoryId || item.employeeId || item.id || 'UBO',
            name: item.category || item.employeeName || item.name || 'Unique Billed Outlets',
            target: formatCount(Number(item.target || 0)),
            achievement: formatCount(Number(item.achievement || 0)),
            remaining: formatCount(Number(item.remaining || 0)),
            crr: formatCount(Number(item.crr || 0)),
            rrr: formatCount(Number(item.rrr || 0)),
          })),
        );
      } else if (view === 'focused-pack') {
        const response = await homeService.getUserFocusedPackTargets(params);

        setBreakdownRows(
          (response.data || []).map((item) => ({
            id: item.productId,
            name: item.productName,
            target: formatMetric(
              metric === 'value'
                ? item.targetValue
                : metric === 'tonnage'
                  ? item.targetTonnage
                  : item.targetCases,
              metric,
            ),
            achievement: formatMetric(
              metric === 'value'
                ? item.achievementValue
                : metric === 'tonnage'
                  ? item.achievementTonnage
                  : item.achievementCases,
              metric,
            ),
          })),
        );
      } else {
        const response = await homeService.getUserPrimaryCategoryTargets(params);

        setBreakdownRows(
          (response.data || []).map((item) => ({
            id: item.categoryId,
            name: item.category,
            target: formatMetric(getCategoryTargetValue(item, metric), metric),
            achievement: formatMetric(getCategoryAchievementValue(item, metric), metric),
          })),
        );
      }
    } catch (error) {
      console.warn('Failed to load target breakdown', error);
      setBreakdownRows([]);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const closeTargetBreakdown = () => {
    setBreakdownUser(null);
    setBreakdownRows([]);
  };

  useEffect(() => {
    fetchTargetSummary();
  }, []);

  useEffect(() => {
    if (activeView === 'user' || specialTargetsLoaded[activeView]) return;

    let active = true;

    setLoadingSpecialTargets(true);

    const request =
      activeView === 'ubo'
        ? homeService.getUboTargetSummary(selectedRouteDate)
        : homeService.getFocusedPackTargetSummary(selectedRouteDate);

    void request
      .then((response) => {
        if (!active) return;

        setSpecialTargets((current) => ({
          ...current,
          [activeView]: response.success && Array.isArray(response.data) ? response.data : [],
        }));

        setSpecialTargetsLoaded((current) => ({
          ...current,
          [activeView]: true,
        }));
      })
      .catch((error) => console.warn(`Failed to load ${activeView} targets`, error))
      .finally(() => {
        if (active) setLoadingSpecialTargets(false);
      });

    return () => {
      active = false;
    };
  }, [activeView, selectedRouteDate, specialTargetsLoaded]);

  if (loading && users.length === 0) {
    return <PageSkeleton variant="dashboard" rows={3} />;
  }

  return (
    <View style={styles.container}>
      <TargetBreakdownModal
        visible={Boolean(breakdownUser)}
        userName={breakdownUser?.employeeName || ''}
        view={breakdownView}
        rows={breakdownRows}
        loading={breakdownLoading}
        colors={colors}
        isWide={isWide}
        onClose={closeTargetBreakdown}
      />

      <ScrollView
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.targetTabs}>
          {TARGET_VIEWS.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              activeOpacity={0.82}
              onPress={() => {
                setActiveView(tab.value);
              }}
              style={[styles.targetTab, activeView === tab.value && styles.targetTabActive]}
            >
              <AppText
                style={[
                  styles.targetTabText,
                  activeView === tab.value && styles.targetTabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {activeView === 'user' && selectedUser && (
          <View style={styles.parentBanner}>
            <Ionicons name="git-branch-outline" size={16} color={colors.primary} />
            <View style={styles.parentTextWrap}>
              <AppText style={styles.parentTitle}>
                Viewing team under {selectedUser.employeeName}
              </AppText>
              <AppText style={styles.parentSubtitle}>Primary category target drill-down</AppText>
            </View>
          </View>
        )}

        {activeView !== 'ubo' && (
          <View style={styles.metricToolbar}>
            {METRIC_OPTIONS.map((option) => {
              const selected = selectedMetric === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.metricChip, selected && styles.metricChipActive]}
                  activeOpacity={0.78}
                  onPress={() => setSelectedMetric(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Show targets by ${option.label}`}
                >
                  <AppText style={[styles.metricChipText, selected && styles.metricChipTextActive]}>
                    {option.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.cardsGrid}>
          {activeView === 'user' ? (
            users.length > 0 ? (
              users.map((user) => (
                <View key={user.employeeId} style={styles.cardColumn}>
                  <TargetUserCard
                    user={user}
                    colors={colors}
                    metric={selectedMetric}
                    onCardPress={() => openTargetBreakdown(user)}
                    onPress={
                      user.children?.length
                        ? () =>
                            router.push({
                              pathname: '/(drawer)/manager-targets',
                              params: {
                                userId: user.employeeId,
                              },
                            })
                        : undefined
                    }
                  />
                </View>
              ))
            ) : (
              <View style={styles.fullWidthRow}>
                <AppText style={styles.emptyText}>No user targets found</AppText>
              </View>
            )
          ) : loadingSpecialTargets ? (
            Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.cardColumn}>
                <Skeleton height={176} width="100%" borderRadius={8} />
              </View>
            ))
          ) : specialTargets[activeView].length > 0 ? (
            specialTargets[activeView].map((user) => (
              <View key={user.employeeId} style={styles.cardColumn}>
                <TargetUserCard
                  user={user}
                  colors={colors}
                  metric={activeView === 'ubo' ? 'cases' : selectedMetric}
                  view={activeView}
                  onCardPress={() => (activeView === 'ubo' ? () => {} : openTargetBreakdown(user))}
                />
              </View>
            ))
          ) : (
            <View style={styles.fullWidthRow}>
              <View style={styles.tabEmptyState}>
                <Ionicons name="analytics-outline" size={26} color={colors.textQuaternary} />
                <AppText style={styles.tabEmptyTitle}>
                  No {activeView === 'ubo' ? 'UBO' : 'Focused Pack'} targets found
                </AppText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
