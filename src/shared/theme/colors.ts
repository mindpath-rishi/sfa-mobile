// src/theme/colors.ts
export type AppColors = {
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContrast: string;

  // Secondary (optional, for accent colors)
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryContrast: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceElevated: string;
  card: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textQuaternary: string;
  textInverse: string;
  textLink: string;

  // UI Elements
  border: string;
  borderLight: string;
  divider: string;
  placeholder: string;
  overlay: string;
  overlayLight: string;
  shadow: string;

  // Status
  success: string;
  successLight: string;
  successDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  info: string;
  infoLight: string;
  infoDark: string;

  // Interactive States
  hover: string;
  active: string;
  focus: string;
  disabled: string;

  // Gradients (optional)
  gradientPrimary: readonly [string, string];
  gradientSuccess: readonly [string, string];
  gradientError: readonly [string, string];
};


export const lightColors: AppColors = {
  // Primary (more premium blue)
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryContrast: '#FFFFFF',

  // Secondary (modern violet accent)
  secondary: '#7C3AED',
  secondaryLight: '#8B5CF6',
  secondaryDark: '#6D28D9',
  secondaryContrast: '#FFFFFF',

  // Backgrounds (clean + neutral)
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',
  backgroundTertiary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',

  // Text (better readability)
  textPrimary: '#0F172A',
  textSecondary: '#1E293B',
  textTertiary: '#475569',
  textQuaternary: '#94A3B8',
  textInverse: '#FFFFFF',
  textLink: '#2563EB',

  // UI Elements
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  placeholder: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.5)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
  shadow: 'rgba(15, 23, 42, 0.08)',

  // Status (more balanced tones)
  success: '#16A34A',
  successLight: '#DCFCE7',
  successDark: '#15803D',

  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorDark: '#B91C1C',

  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningDark: '#B45309',

  info: '#2563EB',
  infoLight: '#DBEAFE',
  infoDark: '#1D4ED8',

  // Interactive
  hover: 'rgba(15, 23, 42, 0.04)',
  active: 'rgba(15, 23, 42, 0.08)',
  focus: 'rgba(37, 99, 235, 0.25)',
  disabled: 'rgba(15, 23, 42, 0.3)',

  // Gradients (subtle, premium)
  gradientPrimary: ['#3B82F6', '#1D4ED8'] as const,
  gradientSuccess: ['#22C55E', '#15803D'] as const,
  gradientError: ['#EF4444', '#B91C1C'] as const,
};


export const darkColors: AppColors = {
  // Primary
  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  primaryDark: '#3B82F6',
  primaryContrast: '#0F172A',

  // Secondary
  secondary: '#A78BFA',
  secondaryLight: '#C4B5FD',
  secondaryDark: '#8B5CF6',
  secondaryContrast: '#0F172A',

  // Backgrounds
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  surface: '#1E293B',
  surfaceElevated: '#2D3A4E',
  card: '#1E293B',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textQuaternary: '#64748B',
  textInverse: '#0F172A',
  textLink: '#60A5FA',

  // UI Elements
  border: '#334155',
  borderLight: '#475569',
  divider: '#334155',
  placeholder: '#64748B',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.3)',

  // Status
  success: '#34D399',
  successLight: '#064E3B',
  successDark: '#10B981',
  error: '#F87171',
  errorLight: '#7F1D1D',
  errorDark: '#EF4444',
  warning: '#FBBF24',
  warningLight: '#78350F',
  warningDark: '#F59E0B',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  infoDark: '#3B82F6',

  // Interactive States
  hover: 'rgba(255, 255, 255, 0.05)',
  active: 'rgba(255, 255, 255, 0.1)',
  focus: 'rgba(96, 165, 250, 0.2)',
  disabled: 'rgba(255, 255, 255, 0.3)',

  // Gradients
  gradientPrimary: ['#60A5FA', '#3B82F6'] as const,
  gradientSuccess: ['#34D399', '#10B981'] as const,
  gradientError: ['#F87171', '#EF4444'] as const,
};
