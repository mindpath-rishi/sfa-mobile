// app/(drawer)/(tabs)/customers/_layout.tsx
import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

export default function CustomersLayout() {
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
      {/* List Screen - Hide header, drawer layout provides it */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Customers',
        }}
      />

      {/* Detail Screen - Shows header with back button */}
      <Stack.Screen
        name="[id]"
        options={{
          title: 'detail',
          headerShown: false,
          headerBackTitle: 'Back',
          headerBackVisible: true,
          presentation: 'card',
        }}
      />

      {/* Add Customer Screen - Modal */}
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Customer',
          presentation: 'modal',
          headerShown: true,
          headerLeft: () => null, // Remove back button from modal
        }}
      />

      {/* Edit Customer Screen - Modal */}
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Customer',
          presentation: 'modal',
          headerShown: true,
          headerLeft: () => null, // Remove back button from modal
        }}
      />
    </Stack>
  );
}
