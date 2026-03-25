import { AppColors, darkColors, lightColors } from '@/shared/theme';
import { useThemeStore } from '@/core/store/theme.store';
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

type ThemeContextType = {
  colors: AppColors;
  mode: 'system' | 'light' | 'dark';
  finalMode: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const finalMode: 'light' | 'dark' = mode === 'system' ? (systemScheme ?? 'light') : mode;

  const colors = finalMode === 'dark' ? darkColors : lightColors;

  const value = useMemo(() => ({ colors, mode, finalMode }), [colors, mode, finalMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside ThemeProvider');
  return ctx;
}
