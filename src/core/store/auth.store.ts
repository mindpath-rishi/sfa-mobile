import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

import { clearTokens, getAccessToken, setTokens } from '@/shared/services/tokenStorage';

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
  userId?: string; // ✅ added
  name?: string;
  role?: string;
  vanId?: string;
};

/* ======================================================
 * HELPERS
 * ====================================================== */

const decodeToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    console.log('DECODED TOKEN:', decoded); // 🔍 debug (remove later)

    // ✅ support both formats
    const userId = decoded.sub || decoded.userId;

    if (!userId) {
      console.warn('No userId/sub in token');
      return null;
    }

    return {
      userId,
      name: decoded.name,
      role: decoded.role,
      vanId: decoded.vanId ?? null,
    };
  } catch (error) {
    console.warn('JWT decode failed:', error);
    return null;
  }
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
   * 🔄 Hydrate from storage
   */
  hydrate: async () => {
    try {
      const token = await getAccessToken();

      console.log('STORED TOKEN:', token); // 🔍 debug

      if (!token) {
        set({
          accessToken: null,
          user: null,
          isHydrated: true,
        });
        return;
      }

      const user = decodeToken(token);

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

    // ✅ prefer API user, fallback to decode
    const user = userFromApi ?? decodeToken(accessToken);

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
