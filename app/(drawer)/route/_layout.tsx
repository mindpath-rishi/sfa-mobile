// app/(app)/van-inventory-topup/_layout.tsx
import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header } from '@/core/components/Header';

type ScreenOptions = {
  headerShown?: boolean;
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
};

export default function VanInventoryTopupLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation }) => {
          const customOptions = options as ScreenOptions;

          // ✅ Same behavior as OutletsLayout
          if (customOptions.headerShown === false) {
            return null;
          }

          return (
            <Header
              title={customOptions.title}
              showBack={
                customOptions.showBack !== undefined
                  ? customOptions.showBack
                  : navigation.canGoBack()
              }
              showMenu={customOptions.showMenu || false}
              showFilter={customOptions.showFilter || false}
              onFilterPress={customOptions.onFilterPress}
              centeredTitle={false}
            />
          );
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* INDEX */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Inventory Top-ups',
          headerShown: false, // ✅ same as outlets
        }}
      />

      {/* DETAIL */}
      <Stack.Screen
        name="detail"
        options={{
          title: 'Top-up Details',
          headerShown: false, // ✅ same pattern
        }}
      />

      {/* CREATE */}
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Create Top-up',
          headerShown: true,
        }}
      />

      {/* EDIT */}
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Top-up',
        }}
      />

      {/* APPROVE */}
      <Stack.Screen
        name="approve/[id]"
        options={{
          title: 'Approve Top-up',
        }}
      />
    </Stack>
  );
}
