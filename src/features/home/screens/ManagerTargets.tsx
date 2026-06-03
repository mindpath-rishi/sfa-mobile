import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { ManagerDatePickerModal } from '../components/models/ManagerDatePickerModal';

type TargetUser = {
  id: string;
  name: string;
  position: string;
  target: string;
  achievement: string;
  rrr: string;
  crr: string;
  children?: TargetUser[];
};

const TARGET_USERS: TargetUser[] = [
  {
    id: 'anuj-joshi',
    name: 'Anup Joshi',
    position: 'LSPosition',
    target: '208795.04 Cases',
    achievement: '71464.09 Cases',
    rrr: '9876.66',
    crr: '2646.82',
    children: [
      {
        id: 'anwar-quazi',
        name: 'Anwar Quazi',
        position: 'L6Position',
        target: '329337.70 Cases',
        achievement: '111954.13 Cases',
        rrr: '11244.39',
        crr: '4146.45',
      },
    ],
  },
  {
    id: 'l5-position',
    name: 'L5Position',
    position: 'LSPosition',
    target: '89331.54 Cases',
    achievement: '29179.70 Cases',
    rrr: '4672.55',
    crr: '1080.73',
  },
  {
    id: 'mayank-shah',
    name: 'Mayank Shah',
    position: 'LSPosition',
    target: '31211.12 Cases',
    achievement: '11310.34 Cases',
    rrr: '1421.5',
    crr: '418.9',
  },
];

const findUser = (id?: string | string[]) => {
  if (!id || Array.isArray(id)) return undefined;

  for (const user of TARGET_USERS) {
    if (user.id === id) return user;
    const child = user.children?.find((item) => item.id === id);
    if (child) return child;
  }

  return undefined;
};

const getParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

const parseRouteDate = (value?: string) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

const formatRouteDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatSelectedDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

function TargetMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={stylesBase.metric}>
      <AppText style={stylesBase.metricValue} numberOfLines={1}>
        {value}
      </AppText>
      <AppText style={stylesBase.metricLabel}>{label}</AppText>
    </View>
  );
}

function TargetUserCard({
  user,
  colors,
  onPress,
}: {
  user: TargetUser;
  colors: any;
  onPress?: () => void;
}) {
  const styles = createStyles(colors);
  const hasDrillDown = Boolean(onPress);

  return (
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={hasDrillDown ? 0.82 : 1}
      onPress={onPress}
      disabled={!hasDrillDown}
    >
      <View style={styles.userCardHeader}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>
            {user.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </AppText>
        </View>
        <View style={styles.userTitleWrap}>
          <AppText style={styles.userName}>{user.name}</AppText>
          <AppText style={styles.userPosition}>{user.position}</AppText>
        </View>
        {hasDrillDown && <AppText style={styles.drillText}>User drilldown</AppText>}
      </View>

      <View style={styles.metricsRow}>
        <TargetMetric label="Target" value={user.target} />
        <TargetMetric label="Achievement" value={user.achievement} />
      </View>

      <View style={styles.rateRow}>
        <View style={styles.rateBadge}>
          <AppText style={styles.rateLabel}>RRR: {user.rrr}</AppText>
        </View>
        <View style={styles.rateBadge}>
          <AppText style={styles.rateLabel}>CRR: {user.crr}</AppText>
        </View>
      </View>

      <View style={styles.categoryButton}>
        <AppText style={styles.categoryButtonText}>View Primary Category</AppText>
        <Ionicons name="chevron-down" size={14} color={colors.info} />
      </View>
    </TouchableOpacity>
  );
}

export default function ManagerTargetsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();
  const params = useLocalSearchParams<{ userId?: string; date?: string }>();
  const [selectedDate, setSelectedDate] = useState(() => parseRouteDate(getParam(params.date)));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedUser = useMemo(() => findUser(params.userId), [params.userId]);
  const users = selectedUser ? selectedUser.children || [] : TARGET_USERS;
  const selectedRouteDate = formatRouteDate(selectedDate);

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: 'Primary Targets (Cases)',
        showBack: true,
        showMenu: false,
        showFilter: false,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, setHeader]),
  );

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <ManagerDatePickerModal
        visible={showDatePicker}
        value={selectedDate}
        title="Select target date"
        onClose={() => setShowDatePicker(false)}
        onApply={setSelectedDate}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dateCard}>
          <TouchableOpacity style={styles.dateHeader} activeOpacity={0.82} onPress={openDatePicker}>
            <View style={styles.dateTitleRow}>
              <Ionicons name="calendar-clear-outline" size={16} color={colors.primary} />
              <AppText style={styles.dateLabel}>{formatSelectedDate(selectedDate)}</AppText>
            </View>
            <View style={styles.dateAction}>
              <AppText style={styles.changeDateText}>Change date</AppText>
              <Ionicons name="chevron-down" size={14} color={colors.textQuaternary} />
            </View>
          </TouchableOpacity>
        </View>

        {selectedUser && (
          <View style={styles.parentBanner}>
            <Ionicons name="git-branch-outline" size={16} color={colors.primary} />
            <View style={styles.parentTextWrap}>
              <AppText style={styles.parentTitle}>Viewing team under {selectedUser.name}</AppText>
              <AppText style={styles.parentSubtitle}>Primary category target drill-down</AppText>
            </View>
          </View>
        )}

        {users.length === 0 && <AppText style={styles.emptyText}>No Data available</AppText>}

        {users.map((user) => (
          <React.Fragment key={user.id}>
            <TargetUserCard
              user={user}
              colors={colors}
              onPress={
                user.children?.length
                  ? () =>
                      router.push({
                        pathname: '/(drawer)/manager-targets',
                        params: { userId: user.id, date: selectedRouteDate },
                      })
                  : undefined
              }
            />
            {!selectedUser && !user.children?.length && (
              <AppText style={styles.emptyText}>No Data available</AppText>
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const stylesBase = StyleSheet.create({
  metric: {
    flex: 1,
    minWidth: 0,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  metricLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    content: {
      padding: 12,
      gap: 10,
      paddingBottom: 28,
    },
    dateCard: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    dateTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    },
    dateLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    dateAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    changeDateText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textQuaternary,
    },
    parentBanner: {
      minHeight: 52,
      borderRadius: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.infoLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    parentTextWrap: {
      flex: 1,
    },
    parentTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    parentSubtitle: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: '700',
      color: colors.textTertiary,
    },
    userCard: {
      borderRadius: 10,
      padding: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 3,
      elevation: 2,
    },
    userCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 12,
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '18',
    },
    avatarText: {
      fontSize: 11,
      fontWeight: '900',
      color: colors.primary,
    },
    userTitleWrap: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    userPosition: {
      marginTop: 2,
      fontSize: 9,
      fontWeight: '700',
      color: colors.textTertiary,
    },
    drillText: {
      fontSize: 9,
      fontWeight: '800',
      color: colors.textQuaternary,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 14,
    },
    rateRow: {
      marginTop: 8,
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'flex-end',
    },
    rateBadge: {
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 3,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    rateLabel: {
      fontSize: 8,
      fontWeight: '800',
      color: colors.textTertiary,
    },
    categoryButton: {
      marginTop: 14,
      minHeight: 26,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    categoryButtonText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.info,
    },
    emptyText: {
      paddingVertical: 6,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '800',
      color: colors.textSecondary,
    },
  });
