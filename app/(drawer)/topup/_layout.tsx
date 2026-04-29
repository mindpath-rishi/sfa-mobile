import { Stack } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

export default function TopupLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="create" />
    </Stack>
  );
}