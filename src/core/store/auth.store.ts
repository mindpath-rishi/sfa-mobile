// import { create } from 'zustand';
// import { jwtDecode } from 'jwt-decode';

// import { clearTokens, getAccessToken, setTokens } from '@/shared/services/tokenStorage';
// import { resetAllStores } from './reset.store';
// import { storage } from '../storage';

// /* ======================================================
//  * TYPES
//  * ====================================================== */

// type AuthUser = {
//   userId: string;
//   name?: string;
//   role?: string;
//   roleId?: string;
//   vanId?: string | null;
// };

// type JwtPayload = {
//   sub?: string;
//   userId?: string; // ✅ added
//   name?: string;
//   role?: string;
//   roleId?: string;
//   vanId?: string;
// };

// type workSessionId = string | null;

// /* ======================================================
//  * HELPERS
//  * ====================================================== */

// const decodeToken = (token: string): AuthUser | null => {
//   try {
//     const decoded = jwtDecode<JwtPayload>(token);

//     console.log('DECODED TOKEN:', decoded); // 🔍 debug (remove later)

//     // ✅ support both formats
//     const userId = decoded.sub || decoded.userId;

//     if (!userId) {
//       console.warn('No userId/sub in token');
//       return null;
//     }

//     return {
//       userId,
//       name: decoded.name,
//       role: decoded.role,
//       roleId: decoded.roleId || decoded.role,
//       vanId: decoded.vanId ?? null,
//     };
//   } catch (error) {
//     console.warn('JWT decode failed:', error);
//     return null;
//   }
// };

// /* ======================================================
//  * STORE
//  * ====================================================== */

// export const useAuthStore = create<{
//   isHydrated: boolean;
//   accessToken: string | null;
//   user: AuthUser | null;

//   hydrate: () => Promise<void>;
//   setAuth: (accessToken: string, refreshToken?: string, userFromApi?: AuthUser) => Promise<void>;

//   logout: () => Promise<void>;
//   workSessionId: workSessionId;
//   setWorkSessionId: (id: workSessionId) => void;
// }>((set) => ({
//   isHydrated: false,
//   accessToken: null,
//   user: null,
//   workSessionId: null,
//   setWorkSessionId: (id) => {
//     set({ workSessionId: id });
//   },
//   /**
//    * 🔄 Hydrate from storage
//    */
//   hydrate: async () => {
//     try {
//       const token = await getAccessToken();

//       console.log('STORED TOKEN:', token); // 🔍 debug

//       if (!token) {
//         set({
//           accessToken: null,
//           user: null,
//           isHydrated: true,
//         });
//         return;
//       }

//       const user = decodeToken(token);

//       set({
//         accessToken: token,
//         user,
//         isHydrated: true,
//       });
//     } catch (error) {
//       console.error('Hydration error:', error);

//       set({
//         accessToken: null,
//         user: null,
//         isHydrated: true,
//       });
//     }
//   },

//   /**
//    * 🔐 Set Auth after login
//    */
//   setAuth: async (accessToken, refreshToken, userFromApi) => {
//     await setTokens(accessToken, refreshToken);

//     // ✅ prefer API user, fallback to decode
//     const user = userFromApi ?? decodeToken(accessToken);

//     set({
//       accessToken,
//       user,
//     });
//   },

//   logout: async () => {
//     try {
//       await clearTokens();

//       resetAllStores();

//       await storage.clear();

//       set({
//         accessToken: null,
//         user: null,
//         workSessionId: null,
//       });
//     } catch (error) {
//       console.log('Logout error:', error);
//     }
//   },
// }));

import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

import { clearTokens, getAccessToken, setTokens } from '@/shared/services/tokenStorage';
import { isTokenExpired } from '@/shared/utils/auth-token.utils';
import { resetAllStores } from './reset.store';
import { storage } from '../storage';
import * as Network from 'expo-network';
import { isSalesman } from '../navigation/role.utils';

/* ======================================================
 * TYPES
 * ====================================================== */

type AuthUser = {
  userId: string;
  id?: string;
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  employeeId?: string;
  employeeName?: string;
  designation?: string;
  role?: string;
  roleId?: string;
  route?: string;
  routeName?: string;
  territory?: string;
  manager?: string;
  managerName?: string;
  reportingEmployeeId?: string;
  reportingEmployeeName?: string;
  vanId?: string | null;
  avatar?: string | null;
  profileImage?: string | null;
  profileImageUrl?: string | null;
  profileImageMediaId?: string | null;
  offlineAccessAllowed?: boolean;
  stats?: Record<string, unknown>;
  achievements?: unknown[];
  recentActivity?: unknown[];
};

type JwtPayload = {
  sub?: string;
  userId?: string;
  name?: string;
  role?: string;
  roleId?: string;
  vanId?: string;
  offlineAccessAllowed?: boolean;
  exp?: number;
};

type WorkSessionId = string | null;

const AUTH_USER_KEY = 'AUTH_USER';

/* ======================================================
 * HELPERS
 * ====================================================== */

const decodeToken = (token: string): AuthUser | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    const userId = decoded.sub || decoded.userId;

    if (!userId) {
      return null;
    }

    return {
      userId,
      name: decoded.name,
      role: decoded.role,
      roleId: decoded.roleId || decoded.role,
      vanId: decoded.vanId ?? null,
      offlineAccessAllowed: decoded.offlineAccessAllowed === true,
    };
  } catch (error) {
    console.warn('JWT decode failed:', error);
    return null;
  }
};

/* ======================================================
 * STORE
 * ====================================================== */

type AuthStore = {
  isHydrated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  workSessionId: WorkSessionId;

  hydrate: () => Promise<void>;
  setAuth: (accessToken: string, refreshToken?: string, userFromApi?: AuthUser) => Promise<void>;

  logout: () => Promise<void>;
  setWorkSessionId: (id: WorkSessionId) => void;
  updateUser: (changes: Partial<AuthUser>) => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  isHydrated: false,
  accessToken: null,
  user: null,
  workSessionId: null,

  setWorkSessionId: (id) => {
    set({ workSessionId: id });
  },

  updateUser: async (changes) => {
    const current = useAuthStore.getState().user;
    if (!current) return;
    const user = { ...current, ...changes };
    await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    set({ user });
  },

  /**
   * Restore auth state after refresh/app restart
   */
  hydrate: async () => {
    try {
      const token = await getAccessToken();

      if (!token) {
        set({
          accessToken: null,
          user: null,
          isHydrated: true,
        });
        return;
      }

      let storedUser: AuthUser | null = null;
      try {
        const value = await storage.getItem(AUTH_USER_KEY);
        storedUser = value ? (JSON.parse(value) as AuthUser) : null;
      } catch {
        storedUser = null;
      }

      // A salesman must still be able to use previously downloaded data when a
      // token expires in the field. It is invalidated as usual as soon as the
      // device is online; no other role receives this exception.
      const network = isTokenExpired(token) ? await Network.getNetworkStateAsync() : null;
      const allowExpiredOfflineSalesman =
        isTokenExpired(token) &&
        isSalesman(storedUser) &&
        storedUser?.offlineAccessAllowed === true &&
        (network?.isConnected === false || network?.isInternetReachable === false);

      if (isTokenExpired(token) && !allowExpiredOfflineSalesman) {
        await clearTokens();
        await storage.removeItem(AUTH_USER_KEY);
        resetAllStores();

        set({
          accessToken: null,
          user: null,
          workSessionId: null,
          isHydrated: true,
        });
        return;
      }

      let user: AuthUser | null = storedUser;

      if (!user) {
        user = decodeToken(token);
      }

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
   * Login
   */
  setAuth: async (accessToken, refreshToken, userFromApi) => {
    if (isTokenExpired(accessToken)) {
      await clearTokens();
      await storage.removeItem(AUTH_USER_KEY);
      resetAllStores();

      set({
        accessToken: null,
        user: null,
        workSessionId: null,
      });
      return;
    }

    await setTokens(accessToken, refreshToken);

    const user = userFromApi ?? decodeToken(accessToken);

    if (user) {
      await storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    set({
      accessToken,
      user,
    });
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await clearTokens();

      await storage.removeItem(AUTH_USER_KEY);

      resetAllStores();

      set({
        accessToken: null,
        user: null,
        workSessionId: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));
