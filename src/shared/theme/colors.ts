export type AppColors = {
  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Backgrounds
  background: string;
  surface: string;
  card: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // UI
  border: string;
  divider: string;
  placeholder: string;
  overlay: string;

  // Status
  success: string;
  error: string;
  warning: string;
  info: string;

  // Semantic background
  successLight: string;
  errorLight: string;
  warningLight: string;
  infoLight: string;
};

export const lightColors: AppColors = {
  // Primary
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Backgrounds
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: '#FFFFFF',

  // Text
  textPrimary: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  textInverse: '#FFFFFF',

  // UI
  border: '#E5E7EB',
  divider: '#F3F4F6',
  placeholder: '#9CA3AF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Semantic background
  successLight: '#ECFDF5',
  errorLight: '#FEF2F2',
  warningLight: '#FFFBEB',
  infoLight: '#EFF6FF',
};

export const darkColors: AppColors = {
  // Primary
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',

  // Backgrounds
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',

  // UI
  border: '#334155',
  divider: '#1E293B',
  placeholder: '#64748B',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Status
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',

  // Semantic background
  successLight: '#064E3B',
  errorLight: '#7F1D1D',
  warningLight: '#78350F',
  infoLight: '#1E3A8A',
};
