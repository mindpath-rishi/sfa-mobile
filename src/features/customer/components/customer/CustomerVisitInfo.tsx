import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { Customer } from '../../types/customer.types';
import { useCustomerVisitInfoStyles } from '../../styles/CustomerVisitInfo.styles';

interface Props {
  customer: Customer;
}

export const CustomerVisitInfo: React.FC<Props> = ({ customer }) => {
  const { colors } = useTheme();
  const styles = useCustomerVisitInfoStyles();

  return (
    <View style={styles.container}>
      <View style={styles.visitItem}>
        <Ionicons name="calendar" size={14} color={colors.textTertiary} />
        <Text style={styles.lastVisitText}>Last: {customer.lastVisit}</Text>
      </View>
      <View style={styles.visitItem}>
        <Ionicons name="calendar" size={14} color={colors.primary} />
        <Text style={styles.nextVisitText}>Next: {customer.nextVisit}</Text>
      </View>
    </View>
  );
};
