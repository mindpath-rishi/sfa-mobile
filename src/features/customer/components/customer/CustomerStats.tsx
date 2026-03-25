import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCustomerStatsStyles } from '../../styles/CustomerStats.styles';
import { Customer } from '../../types/customer.types';

interface Props {
  customer: Customer;
}

export const CustomerStats: React.FC<Props> = ({ customer }) => {
  const { colors } = useTheme();
  const styles = useCustomerStatsStyles();

  const outstandingValue = parseFloat(customer.outstanding.replace(/[^0-9.-]+/g, ''));

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{customer.totalOrders}</Text>
        <Text style={styles.statLabel}>Orders</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{customer.totalValue}</Text>
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
          {customer.outstanding}
        </Text>
        <Text style={styles.statLabel}>Outstanding</Text>
      </View>
    </View>
  );
};
