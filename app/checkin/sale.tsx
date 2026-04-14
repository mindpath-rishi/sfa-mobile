import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { SalesSummary } from '@/features/checkin';

export default function SaleConfirmationPage() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SalesSummary />
    </View>
  );
}
