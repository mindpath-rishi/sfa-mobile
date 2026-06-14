import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import InvoiceSharingScreen from '@/features/checkin/screens/InvoiceSharingScreen';

export default function SaleConfirmationPage() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <InvoiceSharingScreen />
    </View>
  );
}
