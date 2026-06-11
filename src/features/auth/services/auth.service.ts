import { api } from '@/core/network';
import type { ApiResponse } from '@/core/network/api.types';
import type { LoginFormData, LoginRequest, LoginResponse } from '../types/login.types';

/**
 * Auth API contract used by the app.
 * Keeps login/logout strongly-typed and easy to mock in tests.
 */
export interface AuthService {
  /** Authenticates user and returns token/user payload from backend */
  login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>>;

  /** Updates the active device push token after Firebase rotates it */
  updatePushToken(payload: {
    deviceId: string;
    fcmToken?: string | null;
  }): Promise<ApiResponse<{ updated: boolean }>>;

  /** Changes the current user's password */
  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ updated: boolean }>>;

  /** Clears server session/token (if backend supports it) */
  logout(): Promise<ApiResponse<{ loggedOut: boolean }>>;
}

/**
 * Thin service layer on top of the shared HTTP client.
 * No UI logic here — only network calls + typing.
 */
export const authService: AuthService = {
  login: (payload) =>
    api.post<LoginResponse, LoginRequest>('/user/login', payload) as Promise<
      ApiResponse<LoginResponse>
    >,
  updatePushToken: (payload) =>
    api.patch<{ updated: boolean }, typeof payload>('/user/device/push-token', payload) as Promise<
      ApiResponse<{ updated: boolean }>
    >,
  changePassword: (payload) =>
    api.patch<{ updated: boolean }, typeof payload>('/user/password', payload) as Promise<
      ApiResponse<{ updated: boolean }>
    >,
  logout: () =>
    api.post<{ loggedOut: boolean }>('/user/logout') as Promise<
      ApiResponse<{ loggedOut: boolean }>
    >,
};
