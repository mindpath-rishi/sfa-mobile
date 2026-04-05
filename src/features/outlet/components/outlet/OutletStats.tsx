import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { Outlet } from '../../types/outlet.types';
import { useOutletStatsStyles } from '../../styles/OutletStats.styles';
interface Props {
  outlet: Outlet;
}

export const OutletStats: React.FC<Props> = ({ outlet }) => {
  const { colors } = useTheme();
  const styles = useOutletStatsStyles();

  const outstandingValue = parseFloat(outlet.outstanding.replace(/[^0-9.-]+/g, ''));

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{outlet.totalOrders}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{outlet.totalValue}</Text>
        <Text style={styles.statLabel}>Value</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <View style={styles.statItem}>
        <Text
          style={[
            styles.statValue,
            { color: outstandingValue > 0 ? colors.error : colors.success },
          ]}
        >
          {outlet.outstanding}
        </Text>
        <Text style={styles.statLabel}>Outstanding</Text>
      </View>
    </View>
  );
};
