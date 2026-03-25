import React from 'react';
import { View, Image } from 'react-native';
import { Customer } from '../../types/customer.types';
import { useCustomerAvatarStyles } from '../../styles/CustomerAvatar.styles';
import { AppText } from '@/core/components';

interface Props {
  customer: Customer;
}

export const CustomerAvatar: React.FC<Props> = ({ customer }) => {
  const styles = useCustomerAvatarStyles();

  return (
    <View style={styles.container}>
      {customer.avatar ? (
        <Image source={{ uri: customer.avatar }} style={styles.avatar} />
      ) : (
        <AppText style={styles.initials}>{customer.name.charAt(0)}</AppText>
      )}
    </View>
  );
};
