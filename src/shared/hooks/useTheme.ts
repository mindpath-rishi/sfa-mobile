import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/core/store/theme.store';
import { lightColors, darkColors } from '@/shared/theme/colors';

export function useTheme() {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const finalMode = mode === 'system' ? (systemScheme ?? 'light') : mode;
  const colors = finalMode === 'dark' ? darkColors : lightColors;

  return { mode, finalMode, isDark: finalMode === 'dark', colors };
}
