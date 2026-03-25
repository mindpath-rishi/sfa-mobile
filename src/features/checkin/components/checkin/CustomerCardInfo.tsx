// components/CustomerInfoCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Customer } from '../../types/checkin.types';
import { useCustomerInfoCardStyles } from '../../styles/CustomerCard.styles';

interface CustomerInfoCardProps {
  customer: Customer;
  showDivider?: boolean;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  customer,
  showDivider = false,
}) => {
  const styles = useCustomerInfoCardStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.customerId}>
        {customer.id} - {customer.name}
      </Text>
      {customer.address && <Text style={styles.customerAddress}>{customer.address}</Text>}
      {customer.phone && <Text style={styles.customerPhone}>{customer.phone}</Text>}
      {customer.route && <Text style={styles.customerRoute}>Route: {customer.route}</Text>}
      {showDivider && <View style={styles.divider} />}
    </View>
  );
};
