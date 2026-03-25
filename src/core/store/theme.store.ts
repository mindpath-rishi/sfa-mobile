import { create } from 'zustand';
import { storage } from '../../shared/utils/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY = 'theme_mode';

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  hydrated: false,

  hydrate: async () => {
    const saved = await storage.getItem(KEY);

    set({
      mode: (saved as ThemeMode) || 'system',
      hydrated: true,
    });
  },

  setMode: async (mode) => {
    await storage.setItem(KEY, mode);
    set({ mode });
  },
}));
