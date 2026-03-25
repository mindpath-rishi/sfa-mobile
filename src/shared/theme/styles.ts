import { TextStyle, ViewStyle, ImageStyle, Dimensions, I18nManager } from 'react-native';
import { AppColors } from './colors';
import { useLanguageStore } from '@/core/store/language.store'; // ✅ IMPORTANT

export type FontWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export const fontSize = {
  xs: 12,
  md: 16,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeight: Record<string, FontWeight> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const getFontWeight = (weight: keyof typeof fontWeight): FontWeight => {
  return fontWeight[weight] || '400';
};

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

export const getSpacing = (value: number): number => {
  if (value in spacing) return spacing[value as keyof typeof spacing];
  return value * 4;
};

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

const { width, height } = Dimensions.get('window');

export const device = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 428,
  isLarge: width >= 428,
};

// ✅ ALWAYS get RTL from store
const getRTL = () => {
  try {
    return useLanguageStore.getState().isRTL;
  } catch {
    return I18nManager.isRTL; // fallback
  }
};

export interface StyleUtils {
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  getFontWeight: typeof getFontWeight;
  spacing: typeof spacing;
  getSpacing: typeof getSpacing;
  borderRadius: typeof borderRadius;
  shadow: typeof shadow;
  device: typeof device;

  isRTL: boolean;
  dir: 'rtl' | 'ltr';

  rowDirection: () => 'row' | 'row-reverse';
  textAlign: () => 'left' | 'right';
  writingDirection: () => 'ltr' | 'rtl';

  start: <T>(ltr: T, rtl: T) => T;
}

export const styleUtils: StyleUtils = {
  fontSize,
  fontWeight,
  getFontWeight,
  spacing,
  getSpacing,
  borderRadius,
  shadow,
  device,

  get isRTL() {
    return getRTL();
  },

  get dir() {
    return getRTL() ? 'rtl' : 'ltr';
  },

  rowDirection: () => (getRTL() ? 'row-reverse' : 'row'),
  textAlign: () => (getRTL() ? 'right' : 'left'),
  writingDirection: () => (getRTL() ? 'rtl' : 'ltr'),

  start: (ltr, rtl) => (getRTL() ? rtl : ltr),
};

export const createStyles = <T extends { [key: string]: ViewStyle | TextStyle | ImageStyle }>(
  styles: (utils: StyleUtils, colors: AppColors) => T,
): ((colors: AppColors) => T) => {
  return (colors: AppColors) => {
    const result = styles(styleUtils, colors);

    Object.keys(result).forEach((key) => {
      const style = result[key] as any;
      if (style && typeof style === 'object' && style.fontWeight) {
        if (style.fontWeight in fontWeight) {
          style.fontWeight = fontWeight[style.fontWeight as keyof typeof fontWeight];
        }
      }
    });

    return result;
  };
};
