import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Customer } from '../../types/customer.types';
import { useCustomerQuickActionsStyles } from '../../styles/CustomerQuickActions.styles';

interface Props {
  customer: Customer;
  onCheckIn?: () => void;
  onOrderPress?: () => void;
  onCallPress?: () => void;
}

export const CustomerQuickActions: React.FC<Props> = ({
  customer,
  onCheckIn,
  onOrderPress,
  onCallPress,
}) => {
  const { colors } = useTheme();
  const styles = useCustomerQuickActionsStyles();

  const handleCheckIn = () => {
    if (onCheckIn) {
      onCheckIn();
    } else {
      // Default behavior
      router.push({
        pathname: '/checkin',
        params: { customerId: customer.id, customerName: customer.name },
      });
    }
  };

  const handleOrderPress = () => {
    if (onOrderPress) {
      onOrderPress();
    } else {
      // Default behavior
      router.push({
        pathname: '/products',
        params: { customerId: customer.id, customerName: customer.name },
      });
    }
  };

  const handleCallPress = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      // Default behavior - show phone number
      Alert.alert('Call Customer', `Call ${customer.owner} at ${customer.phone}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => console.log('Calling...', customer.phone),
          // In a real app, you would use Linking.openURL(`tel:${customer.phone}`)
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.checkInButton, { backgroundColor: colors.primary }]}
        onPress={handleCheckIn}
        activeOpacity={0.8}
      >
        <Ionicons name="location" size={16} color="white" />
        <Text style={styles.buttonText}>Check In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.orderButton, { backgroundColor: colors.success }]}
        onPress={handleOrderPress}
        activeOpacity={0.8}
      >
        <Ionicons name="cart" size={16} color="white" />
        <Text style={styles.buttonText}>New Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.callButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={handleCallPress}
        activeOpacity={0.8}
      >
        <Ionicons name="call" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};
