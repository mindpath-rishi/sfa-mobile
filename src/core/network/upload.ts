import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { useAuthStore } from '@/core/store/auth.store';
import { getAccessToken } from '@/shared/services/tokenStorage';
import { isTokenExpired } from '@/shared/utils/auth-token.utils';

import type { ApiRequestConfig, ApiResponse } from './api.types';

type AppExtraConfig = {
  api?: {
    baseURL: string;
    authHeaderKey?: string;
    tokenPrefix?: string;
  };
};

const extra = Constants.expoConfig?.extra as AppExtraConfig | undefined;
const BASE_URL = extra?.api?.baseURL ?? 'https://order.tradekings.app:4001/api/v1';
const AUTH_HEADER_KEY = extra?.api?.authHeaderKey ?? 'Authorization';
const TOKEN_PREFIX = extra?.api?.tokenPrefix ?? 'Bearer';

const normalizeUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) return url;
  const trimmedBase = BASE_URL.replace(/\/+$/, '');
  const trimmedUrl = url.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedUrl}`;
};

export const uploadFormData = async <TResponse>(
  url: string,
  formData: FormData,
  config?: ApiRequestConfig,
): Promise<ApiResponse<TResponse>> => {
  try {
    const storedToken = useAuthStore.getState().accessToken ?? (await getAccessToken());
    const token = storedToken && !isTokenExpired(storedToken) ? storedToken : null;

    const headers: Record<string, string> = {
      'x-client-platform': Platform.OS === 'web' ? 'web' : 'mobile',
    };

    if (token) {
      headers[AUTH_HEADER_KEY] = `${TOKEN_PREFIX} ${token}`;
    }

    const response = await fetch(normalizeUrl(url), {
      method: 'POST',
      headers,
      body: formData,
    });

    const text = await response.text();
    let parsed: any = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      const message =
        typeof parsed?.message === 'string'
          ? parsed.message
          : typeof parsed === 'string'
            ? parsed
            : `Upload failed with status ${response.status}`;

      return {
        success: false,
        statusCode: response.status,
        message,
        data: null,
      } as ApiResponse<TResponse>;
    }

    const data = parsed && typeof parsed === 'object' && 'data' in parsed ? parsed.data : parsed;

    return {
      success: true,
      statusCode: response.status,
      message: typeof parsed?.message === 'string' ? parsed.message : undefined,
      data,
    } as ApiResponse<TResponse>;
  } catch (error: any) {
    const message = error?.message || 'Upload failed';
    return {
      success: false,
      statusCode: 0,
      message,
      data: null,
    } as ApiResponse<TResponse>;
  }
};
