import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

import { errorHandler } from '@/core/errors/error.handler';
import { logger } from '@/core/logger/logger';
import type { ApiRequestConfig, ApiResponse, HttpMethod } from './api.types';

/**
 * Token getter is injected to avoid importing auth store here (prevents circular deps).
 */
let getToken: (() => string | null) | null = null;

export const injectTokenGetter = (fn: () => string | null) => {
  getToken = fn;
};

/**
 * Reads network config from app.config.ts -> extra.api.
 * Keeps baseURL/timeout centralized and environment-safe.
 */
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

/**
 * Shared Axios instance used across the app.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
});

/**
 * Attaches auth token automatically when available.
 */
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = getToken?.();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers[AUTH_HEADER_KEY] = `${TOKEN_PREFIX} ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * Normalizes API errors into AppError and logs them in dev.
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  (error: AxiosError) => {
    const appError = errorHandler(error);

    logger.error('HTTP Error', {
      code: appError.code,
      status: appError.status,
      message: appError.message,
    });

    return Promise.reject(appError);
  },
);

/**
 * Typed request wrapper used by services.
 * Always returns the backend ApiResponse<T>.
 */
export const apiRequest = async <TResponse, TBody = any>(
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
  });

  return res.data;
};

/**
 * Small helpers to keep service calls clean.
 */
export const api = {
  get: <T>(url: string, config?: ApiRequestConfig) => apiRequest<T>('GET', url, undefined, config),

  post: <T, B = any>(url: string, body?: B, config?: ApiRequestConfig) =>
    apiRequest<T, B>('POST', url, body, config),

  put: <T, B = any>(url: string, body?: B, config?: ApiRequestConfig) =>
    apiRequest<T, B>('PUT', url, body, config),

  patch: <T, B = any>(url: string, body?: B, config?: ApiRequestConfig) =>
    apiRequest<T, B>('PATCH', url, body, config),

  delete: <T>(url: string, config?: ApiRequestConfig) =>
    apiRequest<T>('DELETE', url, undefined, config),
};
