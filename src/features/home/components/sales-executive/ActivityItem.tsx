import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppColors } from '@/shared/theme';
import { TodayActivity } from '../../types/activity.types';

interface ActivityItemComponentProps {
  item: TodayActivity;
  index: number;
  totalItems: number;
  onPress?: () => void;
}

const formatDuration = (startTime: string, endTime?: string) => {
  if (!startTime) return '';

  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const durationMs = end.getTime() - start.getTime();
  if (durationMs < 0) return '';

  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const getDisplayText = (type: string) => {
  const normalized = type?.trim() || 'Activity';
  const key = normalized.toLowerCase().replace(/\s+/g, '_');
  const textMap: Record<string, string> = {
    van_change: 'Van change',
    office_work: 'Office work',
    cash_collection: 'Cash collection',
    team_meeting: 'Team meeting',
    retailing: 'Retailing',
    break: 'Break',
    driving: 'Driving',
    leave: 'Leave',
  };

  return textMap[key] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getDotColor = (item: TodayActivity, colors: AppColors) => {
  const name = item.name?.toLowerCase() || '';
  if (name.includes('route')) return colors.infoLight;
  if (name.includes('retail')) return colors.warningLight;
  if (name.includes('leave')) return colors.errorLight;
  return colors.successLight;
};

export const ActivityItemComponent: React.FC<ActivityItemComponentProps> = ({
  item,
  index,
  totalItems,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const duration = useMemo(
    () => formatDuration(item.startTime, item.endTime),
    [item.startTime, item.endTime],
  );

  const startTimeStr = useMemo(() => {
    if (!item.startTime) return '';
    return new Date(item.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [item.startTime]);

  const endTimeStr = useMemo(() => {
    if (!item.endTime) return '';
    return new Date(item.endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [item.endTime]);

  const detail =
    item.routeName ||
    item.notes ||
    (duration ? `${item.endTime ? 'Duration' : 'Active'} · ${duration}` : '');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.container, { borderBottomWidth: index === totalItems - 1 ? 0 : 1 }]}
    >
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: getDotColor(item, colors) }]} />
        {index !== totalItems - 1 && <View style={styles.line} />}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppText style={styles.title}>{getDisplayText(item.name)}</AppText>
          <AppText style={styles.time}>
            {startTimeStr}
            {endTimeStr && ` - ${endTimeStr}`}
          </AppText>
        </View>
        {!!detail && <AppText style={styles.detail}>{detail}</AppText>}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: 12,
      borderBottomColor: colors.border,
    },
    timeline: {
      width: 16,
      alignItems: 'center',
      marginRight: 4,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 3,
    },
    line: {
      width: 1,
      flex: 1,
      backgroundColor: colors.border,
      marginTop: 5,
    },
    content: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    title: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    time: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    detail: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
      marginTop: 2,
    },
  });
