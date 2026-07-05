import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import Constants from 'expo-constants';
import * as Network from 'expo-network';

import { errorHandler } from '@/core/errors/error.handler';
import { logger } from '@/core/logger/logger';
import { useAuthStore } from '@/core/store/auth.store';
import { isSalesman } from '@/core/navigation/role.utils';
import { isOfflineMode, useOfflineStore } from '@/core/offline/offline.store';
import { getCachedApiResponse, setCachedApiResponse } from '@/database';
import { getAccessToken } from '@/shared/services/tokenStorage';
import { isTokenExpired } from '@/shared/utils/auth-token.utils';

import type { ApiRequestConfig, ApiResponse, HttpMethod } from './api.types';
import { toast } from '../utils';

/* ======================================================
 * CUSTOM AXIOS CONFIG
 * ====================================================== */

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  showLoader?: boolean;
}

/* ======================================================
 * APP CONFIG
 * ====================================================== */

type AppExtraConfig = {
  api?: {
    baseURL: string;
    timeoutMs?: number;
    authHeaderKey?: string;
    tokenPrefix?: string;
  };
};

const extra = Constants.expoConfig?.extra as AppExtraConfig | undefined;

const BASE_URL = extra?.api?.baseURL ?? 'https://order.tradekings.app:4001/api/v1';
const TIMEOUT_MS = extra?.api?.timeoutMs ?? 15000;
const AUTH_HEADER_KEY = extra?.api?.authHeaderKey ?? 'Authorization';
const TOKEN_PREFIX = extra?.api?.tokenPrefix ?? 'Bearer';

/* ======================================================
 * AXIOS INSTANCE
 * ====================================================== */

export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
});

/* ======================================================
 * TOKEN HELPER
 * ====================================================== */

const getToken = async (): Promise<string | null> => {
  try {
    const storeToken = useAuthStore.getState().accessToken;

    if (storeToken) return storeToken;

    const storedToken = await getAccessToken();

    if (!storedToken) return null;

    if (isTokenExpired(storedToken)) {
      await useAuthStore.getState().logout();
      return null;
    }

    return storedToken;
  } catch (error) {
    logger.error('Token fetch error', { error });
    return null;
  }
};

/* ======================================================
 * REQUEST INTERCEPTOR
 * ====================================================== */

httpClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig): Promise<CustomAxiosRequestConfig> => {
    try {
      const token = await getToken();

      if (token) {
        if (isTokenExpired(token)) {
          await useAuthStore.getState().logout();
          return config;
        }

        const headers = AxiosHeaders.from(config.headers ?? {});
        headers.set(AUTH_HEADER_KEY, `${TOKEN_PREFIX} ${token}`);
        headers.set('x-client-platform', 'mobile');
        config.headers = headers;
      }

      return config;
    } catch (error) {
      logger.error('Request interceptor error', { error });
      return config;
    }
  },
  (error: AxiosError) => Promise.reject(error),
);

/* ======================================================
 * RESPONSE INTERCEPTOR
 * ====================================================== */

httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    return response;
  },
  (error: AxiosError) => {
    const appError = errorHandler(error);

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    logger.error('HTTP Error', {
      code: appError.code,
      status: appError.status,
      message: appError.message,
    });

    /* ======================================================
     * GLOBAL ERROR HANDLING
     * ====================================================== */

    toast.error('Error', appError.message || 'Something went wrong');

    /* ======================================================
     * RETURN SAFE RESPONSE (NO THROW)
     * ====================================================== */

    return Promise.resolve({
      data: {
        success: false,
        message: appError.message,
        data: null,
      },
    } as AxiosResponse<ApiResponse<unknown>>);
  },
);

/* ======================================================
 * GENERIC REQUEST
 * ====================================================== */

export const apiRequest = async <TResponse, TBody = unknown>(
  method: HttpMethod,
  url: string,
  body?: TBody,
  config?: ApiRequestConfig,
): Promise<ApiResponse<TResponse>> => {
  const user = useAuthStore.getState().user;
  let network = useOfflineStore.getState();

  // Android can deliver the connectivity listener after a focused screen has
  // already started loading. Verify connectivity at the final HTTP boundary
  // so a stale online value cannot leak a request while offline mode is enabled.
  if (isSalesman(user)) {
    try {
      const current = await Network.getNetworkStateAsync();
      const isConnected = current.isConnected === true;
      const isInternetReachable = isConnected && current.isInternetReachable !== false;
      network.setConnection(isConnected, isInternetReachable);
      network = useOfflineStore.getState();
    } catch (error) {
      logger.warn('Unable to verify connectivity before request', { url, error });
    }
  }

  const offlineDataReady = Boolean(network.lastSyncTime);
  const salesmanOffline = isSalesman(user) && isOfflineMode();

  if (salesmanOffline && offlineDataReady && method === 'GET' && config?.cache !== false) {
    const cached = await getCachedApiResponse<TResponse>(user?.userId ?? '', url, config?.params);
    if (cached) return cached;
  }

  if (salesmanOffline) {
    return {
      success: false,
      statusCode: 503,
      message: offlineDataReady
        ? 'This action is not available offline'
        : 'Offline data is not ready. Connect to the internet and enable Offline Mode once to prepare it.',
      data: null as TResponse,
      offline: true,
    };
  }

  const res = await httpClient.request<ApiResponse<TResponse>>({
    method,
    url,
    data: body,
    params: config?.params,
    headers: config?.headers,
    timeout: config?.timeoutMs,
    showLoader: config?.showLoader !== false,
  } as CustomAxiosRequestConfig);

  const response = res.data;
  if (
    method === 'GET' &&
    config?.cache !== false &&
    isSalesman(user) &&
    response?.success &&
    !url.startsWith('/sync/')
  ) {
    try {
      await setCachedApiResponse(user?.userId ?? '', url, config?.params, response);
    } catch (error) {
      logger.warn('API response cache write failed', { url, error });
    }
  }

  if (method !== 'GET' && isSalesman(user) && response?.success && !url.startsWith('/sync/')) {
    // Keep the offline database current after successful online mutations.
    // Dynamic import avoids a static cycle: syncApi uses this HTTP client.
    void import('@/sync/sync.service')
      .then(({ syncService }) => syncService.sync())
      .catch((error) => logger.warn('Post-mutation offline sync failed', { url, error }));
  }

  return response;
};

/* ======================================================
 * API METHODS
 * ====================================================== */

export const api = {
  get: <T>(url: string, config?: ApiRequestConfig) => apiRequest<T>('GET', url, undefined, config),

  post: <T, B = unknown>(url: string, body?: B, config?: ApiRequestConfig) =>
    apiRequest<T, B>('POST', url, body, config),

  put: <T, B = unknown>(url: string, body?: B, config?: ApiRequestConfig) =>
    apiRequest<T, B>('PUT', url, body, config),

  patch: <T, B = unknown>(url: string, body?: B, config?: ApiRequestConfig) =>
    apiRequest<T, B>('PATCH', url, body, config),

  delete: <T>(url: string, config?: ApiRequestConfig) =>
    apiRequest<T>('DELETE', url, undefined, config),
};
