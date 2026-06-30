import { api } from '@/core/network';
import { useAuthStore } from '@/core/store/auth.store';
import { formatLocalApiDate } from '@/shared/utils/date.utils';

let lastPrefetchAt = 0;
const PREFETCH_INTERVAL_MS = 60 * 60_000;

export const prefetchOfflineSnapshots = async (force = false) => {
  const { user, workSessionId } = useAuthStore.getState();
  if (!user?.userId || (!force && Date.now() - lastPrefetchAt < PREFETCH_INTERVAL_MS)) return;
  lastPrefetchAt = Date.now();

  const today = new Date();
  const monthRange = {
    startDate: formatLocalApiDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    endDate: formatLocalApiDate(today),
  };
  const vanId = user.vanId ?? undefined;
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthDate = formatLocalApiDate(lastMonthEnd);

  await Promise.allSettled([
    api.get('/van/mapped-routes', { showLoader: false }),
    api.get('/route', { showLoader: false }),
    api.get(`/employee/${user.userId}/stats`, { showLoader: false }),
    api.get('/employee/salesman/my-pocket-target', {
      params: monthRange,
      showLoader: false,
    }),
    api.get('/employee/salesman/day-wise-summary', {
      params: monthRange,
      showLoader: false,
    }),
    api.get('/employee/salesman/dispatch-order', {
      params: monthRange,
      showLoader: false,
    }),
    ...(['PRIMARYCATEGORY', 'CATEGORY', 'SKU'] as const).map((groupBy) =>
      api.get('/employee/salesman/product-sales', {
        params: { ...monthRange, groupBy },
        showLoader: false,
      }),
    ),
    ...(['cases', 'tonnage', 'value'] as const).map((metric) =>
      api.get('/employee/salesman/my-pocket-target', {
        params: { metric },
        showLoader: false,
      }),
    ),
    ...(['cases', 'tonnage', 'value'] as const).map((metric) =>
      api.get('/employee/salesman/my-pocket-target', {
        params: { date: lastMonthDate, metric },
        showLoader: false,
      }),
    ),
    ...(vanId
      ? [
          api.get(`/van-inventory/van/${vanId}`, {
            params: { page: 1, limit: 10 },
            showLoader: false,
          }),
          api.get('/van-inventory-topup', {
            params: { page: 1, limit: 10, vanId },
            showLoader: false,
          }),
          api.get('/van-daily-stock/summary', {
            params: { vanId, workSessionId },
            showLoader: false,
          }),
        ]
      : []),
  ]);
};
