import { router } from 'expo-router';
import { useOutletStore } from '@/core/store/outlet.store';
import { toast } from '@/core/utils';

export const useVisitGuard = () => {
  const activeVisit = useOutletStore((s) => s.activeVisit);

  const guard = (action?: () => void, targetOutletId?: string) => {
    // ✅ No active visit → allow action
    if (!activeVisit) {
      action?.();
      return true;
    }

    // ✅ Allow if same outlet (optional)
    if (targetOutletId && activeVisit.outlet.customerId === targetOutletId) {
      action?.();
      return true;
    }

    console.log('=================21==================', activeVisit);
    router.replace(`/outlets/${activeVisit.outlet.customerId}`);

    return false;
  };

  return { guard, activeVisit };
};
