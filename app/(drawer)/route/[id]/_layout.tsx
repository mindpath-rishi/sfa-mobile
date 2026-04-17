// app/(app)/van-inventory-topup/[id]/_layout.tsx

import { Stack } from 'expo-router';

export default function TopupIdLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}