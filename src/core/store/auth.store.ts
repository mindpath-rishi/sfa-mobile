import { create } from "zustand";
import {
  clearTokens,
  getAccessToken,
  setTokens,
} from "@/shared/services/storage/tokenStorage";

type AuthState = {
  isHydrated: boolean;
  accessToken: string | null;
  hydrate: () => Promise<void>;
  setAuth: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isHydrated: false,
  accessToken: null,

  hydrate: async () => {
    const token = await getAccessToken();
    set({ accessToken: token ?? null, isHydrated: true });
  },

  setAuth: async (accessToken: string, refreshToken?: string) => {
    await setTokens(accessToken, refreshToken);
    set({ accessToken });
  },

  logout: async () => {
    await clearTokens();
    set({ accessToken: null });
  },
}));
