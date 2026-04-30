import { useEffect } from 'react';
import { useHeader } from '@/shared/contexts/HeaderContext';
import CustomerDetailScreen from '@/features/outlet/screens/OutletDetailScreen';
import { useOutletStore } from '@/core/store/outlet.store';
import { useTheme } from '@/shared/hooks/useTheme';

export default function CustomerDetailRoute() {
  const { setHeader } = useHeader();
  const activeOutlet = useOutletStore.getState().selectedOutlet;
  const { colors } = useTheme();

  // useEffect(() => {
  //   setHeader({
  //     title: activeOutlet?.name,
  //     showBack: true,
  //     showMenu: false,
  //     backgroundColor: colors.primary
  //   });
  // }, [setHeader]);

  return <CustomerDetailScreen />;
}
