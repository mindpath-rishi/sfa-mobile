import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import NonSaleReasonScreen from '@/features/checkin/screens/NoSalesReasonScreen';

export default function SaleConfirmationPage() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NonSaleReasonScreen />
    </View>
  );
}
