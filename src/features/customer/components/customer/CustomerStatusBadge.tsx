import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { CustomerStatus } from '../../types/customer.types';
import { useCustomerStatusBadgeStyles } from '../../styles/CustomerStatusBadge.styles';

interface Props {
  status: CustomerStatus;
}

export const CustomerStatusBadge: React.FC<Props> = ({ status }) => {
  const { colors } = useTheme();
  const styles = useCustomerStatusBadgeStyles();

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'inactive':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor(status) + '20' }]}>
      <Text style={[styles.text, { color: getStatusColor(status) }]}>{status}</Text>
    </View>
  );
};
