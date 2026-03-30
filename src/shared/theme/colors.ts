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
  // Primary
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  primaryContrast: '#FFFFFF',

  // Secondary
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',
  secondaryContrast: '#FFFFFF',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  textQuaternary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textLink: '#3B82F6',

  // UI Elements
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F3F4F6',
  placeholder: '#9CA3AF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Interactive States
  hover: 'rgba(0, 0, 0, 0.05)',
  active: 'rgba(0, 0, 0, 0.1)',
  focus: 'rgba(59, 130, 246, 0.2)',
  disabled: 'rgba(0, 0, 0, 0.3)',

  // Gradients
  gradientPrimary: ['#3B82F6', '#2563EB'] as const,
  gradientSuccess: ['#10B981', '#059669'] as const,
  gradientError: ['#EF4444', '#DC2626'] as const,
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
