import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';
import { ManagerHomeScreen, SalesExecutiveHomeScreen } from '@/features/home';

export default function RoleAwareHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const HomeComponent = isSalesman(user) ? SalesExecutiveHomeScreen : ManagerHomeScreen;

  return <HomeComponent />;
}