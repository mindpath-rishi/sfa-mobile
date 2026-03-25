import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { SalesSummary } from '@/features/checkin';
import ReasonScreen from '@/features/checkin/screens/NonSaleScreen';
import FurtherReasonScreen from '@/features/checkin/components/non-sale/FinalStep';

export default function SaleConfirmationPage() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  // Parse products from params
  const products = params.products ? JSON.parse(params.products as string) : [];
  const orderId = params.orderId as string;
  const customerId = params.customerId as string;
  const customerName = params.customerName as string;
  const totalAmount = params.totalAmount ? parseFloat(params.totalAmount as string) : 0;
  const totalUnits = params.totalUnits ? parseInt(params.totalUnits as string) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FurtherReasonScreen
      // initialProducts={products}
      // orderId={orderId}
      // customerId={customerId}
      // customerName={customerName}
      // totalAmount={totalAmount}
      // totalUnits={totalUnits}
      />
    </View>
  );
}
