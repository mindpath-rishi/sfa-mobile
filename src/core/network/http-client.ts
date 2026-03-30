import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';
import Constants from 'expo-constants';

import { errorHandler } from '@/core/errors/error.handler';
import { logger } from '@/core/logger/logger';
import { useAuthStore } from '@/core/store/auth.store';
import { getAccessToken } from '@/shared/services/storage/tokenStorage';
import { useLoaderStore } from '../loader/loader.store';

import type { ApiRequestConfig, ApiResponse, HttpMethod } from './api.types';

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

const BASE_URL = extra?.api?.baseURL ?? 'http://localhost:3000';
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

    return await getAccessToken();
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
      // ✅ DEFAULT: loader ON
      if (config.showLoader !== false) {
        useLoaderStore.getState().show({ message: 'Loading...' });
      }

      const token = await getToken();

      if (token) {
        const headers = AxiosHeaders.from(config.headers ?? {});
        headers.set(AUTH_HEADER_KEY, `${TOKEN_PREFIX} ${token}`);
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
    const config = response.config as CustomAxiosRequestConfig;

    // ✅ DEFAULT: hide loader
    if (config.showLoader !== false) {
      useLoaderStore.getState().hide();
    }

    return response;
  },
  (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig;

    if (config?.showLoader !== false) {
      useLoaderStore.getState().hide();
    }

    const appError = errorHandler(error);

    logger.error('HTTP Error', {
      code: appError.code,
      status: appError.status,
      message: appError.message,
    });

    return Promise.reject(appError);
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
  const res = await httpClient.request<ApiResponse<TResponse>>({
    method,
    url,
    data: body,
    params: config?.params,
    headers: config?.headers,

    // ✅ DEFAULT TRUE (only false disables loader)
    showLoader: config?.showLoader !== false,
  } as CustomAxiosRequestConfig);

  return res.data;
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
