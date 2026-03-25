import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/shared/constants/env";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/shared/services/storage/tokenStorage";

type RefreshResponse = { accessToken: string; refreshToken?: string };

export const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

function flush(token: string | null) {
  pending.forEach((cb) => cb(token));
  pending = [];
}

async function refresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await axios.post<RefreshResponse>(`${ENV.API_URL}/auth/refresh`, { refreshToken });
  await setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data.accessToken;
}

api.interceptors.response.use(
  (r) => r,
  async (err: AxiosError) => {
    const original: any = err.config;

    if (err.response?.status !== 401) return Promise.reject(err);
    if (original?._retry) return Promise.reject(err);
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pending.push((token) => {
          if (!token) return reject(err);
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const token = await refresh();
      if (!token) {
        await clearTokens();
        flush(null);
        return Promise.reject(err);
      }
      flush(token);
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (e) {
      await clearTokens();
      flush(null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
