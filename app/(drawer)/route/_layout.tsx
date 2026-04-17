// app/(app)/van-inventory-topup/_layout.tsx

import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useHeader } from '@/shared/contexts/HeaderContext';

export default function VisitLayout() {
  const { colors } = useTheme();
  const { setHeader } = useHeader();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* INDEX ONLY */}
      <Stack.Screen
        name="index"
      />

      {/* JUST REGISTER [id], NO HEADER HERE */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}