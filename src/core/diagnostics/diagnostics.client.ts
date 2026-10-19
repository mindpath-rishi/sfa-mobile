import axios from 'axios';
import { BASE_URL } from '@/core/network/http-client';
import { useAuthStore } from '@/core/store/auth.store';
import { getAccessToken } from '@/shared/services/tokenStorage';
import { APP_BUILD, APP_VERSION } from './app-info';

/**
 * Separate, interceptor-free client for diagnostics. The main client logs
 * failures through the logger, which feeds the error reporter; using it here
 * could turn one network error into an endless report loop.
 */
const client = axios.create({ baseURL: BASE_URL, timeout: 20_000 });

export const diagnosticsPost = async <T = unknown>(url: string, body: unknown) => {
  const token = useAuthStore.getState().accessToken ?? (await getAccessToken());
  if (!token) return null;
  const response = await client.post<{ data: T }>(url, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-app-version': APP_VERSION,
      'x-app-build': APP_BUILD,
      'x-client-platform': 'mobile',
    },
  });
  return response.data?.data ?? null;
};
