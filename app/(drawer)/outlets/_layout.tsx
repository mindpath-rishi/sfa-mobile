import { Stack, router, useSegments } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { useOutletStore } from '@/core/store/outlet.store';
import { useEffect } from 'react';
import { toast } from '@/core/utils';

export default function OutletsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Outlets',
        }}
      />

      <Stack.Screen
        name="[id]/index"
        options={{
          title: 'detail',
          headerShown: false,
        }}
      />

      <Stack.Screen name="visit" options={{ title: 'Check In' }} />

      <Stack.Screen
        name="add"
        options={{
          title: 'Add Customer',
          presentation: 'modal',
          headerShown: true,
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Customer',
          presentation: 'modal',
          headerShown: true,
          headerLeft: () => null,
        }}
      />
    </Stack>
  );
}
