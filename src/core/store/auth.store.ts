import { create } from 'zustand';
import jwtDecode from 'jwt-decode';

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

type Route = {
  routeId: string;
  name?: string;
  routeSessionId: string;
  workSessionId: string;
  vanId: string;
};

type JwtPayload = {
  sub?: string;
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

    return {
      userId: decoded.sub || '',
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
  selectedRoute: Route | null;

  hydrate: () => Promise<void>;
  setAuth: (
    accessToken: string,
    refreshToken?: string,
    userFromApi?: AuthUser,
    routeFromApi?: Route,
  ) => Promise<void>;

  setSelectedRoute: (route: Route | null) => void;

  logout: () => Promise<void>;
}>((set) => ({
  isHydrated: false,
  accessToken: null,
  user: null,
  selectedRoute: null,

  /**
   * 🔄 Hydrate from storage
   */
  hydrate: async () => {
    try {
      const token = await getAccessToken();

      if (!token) {
        set({
          accessToken: null,
          user: null,
          selectedRoute: null,
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
        selectedRoute: null,
        isHydrated: true,
      });
    }
  },

  /**
   * 🔐 Set Auth after login
   */
  setAuth: async (accessToken, refreshToken, userFromApi, routeFromApi) => {
    await setTokens(accessToken, refreshToken);

    const user = userFromApi || decodeToken(accessToken);

    set({
      accessToken,
      user,
      selectedRoute: routeFromApi || null,
    });
  },

  /**
   * 📍 Set Selected Route (User Context)
   */
  setSelectedRoute: (route) => {
    set({ selectedRoute: route });
  },

  /**
   * 🚪 Logout
   */
  logout: async () => {
    await clearTokens();

    set({
      accessToken: null,
      user: null,
      selectedRoute: null,
    });
  },
}));
