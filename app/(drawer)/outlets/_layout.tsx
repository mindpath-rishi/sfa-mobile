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
         headerShown: false
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
          title: '',
          headerShown: false,
        }}
      />

      <Stack.Screen name="visit" options={{ title: 'Check In', headerShown: true}} />

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
