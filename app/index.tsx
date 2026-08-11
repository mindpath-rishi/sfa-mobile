import { useAuthStore } from '@/core/store/auth.store';
import { Redirect } from 'expo-router';

export default function Index() {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <Redirect href="/(drawer)/(tabs)/home" /> : <Redirect href="/(auth)" />;
}
