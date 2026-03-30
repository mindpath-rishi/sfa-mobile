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
  await storage.removeItem(ACCESS_TOKEN_KEY);
  await storage.removeItem(REFRESH_TOKEN_KEY);
}
