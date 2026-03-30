import { create } from 'zustand';
import jwtDecode from 'jwt-decode';

import { clearTokens, getAccessToken, setTokens } from '@/shared/services/storage/tokenStorage';

/* ======================================================
 * TYPES
 * ====================================================== */

type AuthUser = {
  userId: string;
  name?: string;
  role?: string;
  vanId?: string | null;
};

type JwtPayload = {
  sub?: string;
  name?: string;
  role?: string;
  vanId?: string;
};

/* ======================================================
 * STORE
 * ====================================================== */

export const useAuthStore = create<{
  isHydrated: boolean;
  accessToken: string | null;
  user: AuthUser | null;

  hydrate: () => Promise<void>;
  setAuth: (accessToken: string, refreshToken?: string, userFromApi?: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}>((set) => ({
  isHydrated: false,
  accessToken: null,
  user: null,

  /**
   * 🔄 Hydrate from storage (SAFE VERSION)
   */
  hydrate: async () => {
    try {
      const token = await getAccessToken();

      console.log('Hydrated token:', token);

      if (!token) {
        set({
          accessToken: null,
          user: null,
          isHydrated: true,
        });
        return;
      }

      let user: AuthUser | null = null;

      try {
        const decoded = jwtDecode<JwtPayload>(token);

        user = {
          userId: decoded.sub || '',
          name: decoded.name,
          role: decoded.role,
          vanId: decoded.vanId ?? null,
        };
      } catch (decodeError) {
        console.warn('JWT decode failed, but token exists:', decodeError);

        // ✅ IMPORTANT: DO NOT REMOVE TOKEN
        user = null;
      }

      // ✅ ALWAYS KEEP TOKEN
      set({
        accessToken: token,
        user,
        isHydrated: true,
      });
    } catch (error) {
      console.error('Hydration error:', error);

      set({
        accessToken: null,
        user: null,
        isHydrated: true,
      });
    }
  },

  /**
   * 🔐 Set Auth after login
   */
  setAuth: async (accessToken, refreshToken, userFromApi) => {
    await setTokens(accessToken, refreshToken);

    let user: AuthUser | null = null;

    try {
      if (userFromApi) {
        user = userFromApi;
      } else {
        const decoded = jwtDecode<JwtPayload>(accessToken);

        user = {
          userId: decoded.sub || '',
          name: decoded.name,
          role: decoded.role,
          vanId: decoded.vanId ?? null,
        };
      }
    } catch (error) {
      console.warn('Token decode failed:', error);
    }

    set({
      accessToken,
      user,
    });
  },

  /**
   * 🚪 Logout
   */
  logout: async () => {
    await clearTokens();

    set({
      accessToken: null,
      user: null,
    });
  },
}));
