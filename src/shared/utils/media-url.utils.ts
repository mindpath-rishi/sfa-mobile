import { BASE_URL } from '@/core/network/http-client';

const API_ORIGIN = BASE_URL.match(/^https?:\/\/[^/]+/i)?.[0] ?? '';

/**
 * Media saved by the server's LOCAL storage driver is stored as a server-relative
 * path ("/uploads/..."), which <Image> and Linking can't load on a phone. Prefix
 * the API server origin; absolute and on-device URIs are returned unchanged.
 */
export const resolveMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (/^(https?:|file:|content:|data:|blob:|ph:|asset:)/i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};
