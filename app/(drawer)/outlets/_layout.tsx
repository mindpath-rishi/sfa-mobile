import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { Header, HeaderProps } from '@/core/components/Header';
import { useFilterContext } from '@/shared/contexts/FilterContext';

type ScreenOptions = {
  headerShown?: boolean;
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
};

export default function OutletsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        header: ({ options, navigation }) => {
          const customOptions = options as ScreenOptions;

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
          title: 'Outlets',
          headerShown: false,
        }}
      />

      {/* DETAIL */}
      <Stack.Screen
        name="[id]/index"
        options={{
          title: 'Detail',
          headerShown: false,
        }}
      />

      <Stack.Screen name="visit" options={{ title: 'Check In' }} />

      <Stack.Screen
        name="add"
        options={{
          title: 'Add Customer',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Customer',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
