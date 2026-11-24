import { QueryClient, type QueryKey } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

/*
 * Stale-while-revalidate for screens that load data imperatively: show the last
 * result instantly when the screen is revisited, then refresh in the background.
 * Keys must include the user id; the whole cache is cleared on logout.
 */
const SCREEN_CACHE_PREFIX = 'screen';

queryClient.setQueryDefaults([SCREEN_CACHE_PREFIX], { gcTime: 30 * 60_000 });

export const getCachedScreenData = <T>(key: QueryKey) =>
  queryClient.getQueryData<T>([SCREEN_CACHE_PREFIX, ...key]);

export const setCachedScreenData = <T>(key: QueryKey, data: T) =>
  queryClient.setQueryData<T>([SCREEN_CACHE_PREFIX, ...key], data);
