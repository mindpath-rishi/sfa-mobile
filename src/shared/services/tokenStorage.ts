import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/shared/constants/storage.constant';
import { storage } from '@/shared/utils/storage';

export async function setTokens(accessToken: string, refreshToken?: string) {
  console.log('Storing tokens:', { accessToken: accessToken, refreshToken });
  await storage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export async function getAccessToken() {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return storage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await Promise.all([forceRemove(ACCESS_TOKEN_KEY), forceRemove(REFRESH_TOKEN_KEY)]);
}

/**
 * SecureStore deletes occasionally fail on some Android devices. If the
 * delete throws, blank the value instead: an empty token reads as logged out,
 * so the session cannot come back on the next app start.
 */
async function forceRemove(key: string) {
  try {
    await storage.removeItem(key);
  } catch (error) {
    console.warn(`Token delete failed for ${key}, blanking it instead:`, error);
    await storage.setItem(key, '');
  }
}
