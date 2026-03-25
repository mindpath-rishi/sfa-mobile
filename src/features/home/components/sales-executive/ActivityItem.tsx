import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { TodayActivity } from '../../types/activity.types';
import { AppText } from '@/core/components';

interface ActivityItemComponentProps {
  item: TodayActivity;
  index: number;
  totalItems: number;
}

export const ActivityItemComponent: React.FC<ActivityItemComponentProps> = ({
  item,
  index,
  totalItems,
}) => {
  const { colors } = useTheme();

  const getIconName = (type: string) => {
    if (type === 'van_change') return 'swap-horizontal';
    if (type.includes('office')) return 'business';
    if (type.includes('collection')) return 'cash';
    if (type.includes('meeting')) return 'people';
    if (type.includes('retailing')) return 'storefront';
    return 'time';
  };

  const getDisplayText = (type: string) => {
    if (type === 'van_change') return 'VAN CHANGE';
    return type.replace('_', ' ').toUpperCase();
  };

  return (
    <View>
      <View style={styles.activityItem}>
        <View
          style={[
            styles.activityIconSmall,
            {
              backgroundColor:
                item.status === 'completed' ? colors.success + '20' : colors.primary + '20',
            },
          ]}
        >
          <Ionicons
            name={getIconName(item.type) as any}
            size={14}
            color={item.status === 'completed' ? colors.success : colors.primary}
          />
        </View>
        <View style={styles.activityContent}>
          <AppText style={styles.textSmallBold}>{getDisplayText(item.type)}</AppText>
          <AppText style={styles.textXSmall}>
            {item.time} • {item.notes}
          </AppText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'completed' ? colors.success + '20' : colors.primary + '20',
            },
          ]}
        >
          <AppText
            style={[
              styles.textXSmallBold,
              { color: item.status === 'completed' ? colors.success : colors.primary },
            ]}
          >
            {item.status === 'van_change' ? 'DONE' : item.status.toUpperCase()}
          </AppText>
        </View>
      </View>
      {index < totalItems - 1 && <View style={styles.divider} />}
    </View>
  );
};

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 3,
  },
  textSmallBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.4,
  },
  textXSmall: {
    fontSize: 10,
    color: '#64748B',
  },
  textXSmallBold: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.4,
  },
});
