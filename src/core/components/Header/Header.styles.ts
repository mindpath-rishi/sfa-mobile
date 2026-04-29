// src/core/components/Header/Header.styles.ts

import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface HeaderStylesProps {
  elevated: boolean;
  centeredTitle: boolean;
  transparent: boolean;
  size: 'sm' | 'md' | 'lg';
  showBorder: boolean;
}

export const useHeaderStyles = (props: HeaderStylesProps) => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    filterBadge: {
      position: 'absolute',
      top: 0,
      right: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.surface || 'white', // Green instead of error red
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      zIndex: 10,
    } as ViewStyle,

    filterBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,

    // Filter dot for active state without count
    filterDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success || '#10B981', // Green instead of error red
      zIndex: 10,
    } as ViewStyle,

    // Active filter button style
    filterButtonActive: {
      backgroundColor: colors.success + '15' || '#10B98115', // Green tint
    } as ViewStyle,

    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: props.size === 'sm' ? 56 : props.size === 'lg' ? 80 : 50,
      borderBottomWidth: props.showBorder ? 1 : 0,
      borderBottomColor: colors.divider + '40',
      ...(props.elevated && {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }),
    } as ViewStyle,

    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 44,
    } as ViewStyle,

    centerSection: {
      flex: 1,
      alignItems: props.centeredTitle ? 'center' : 'flex-start',
      justifyContent: 'center',
    } as ViewStyle,

    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 44,
      gap: utils.spacing[2],
    } as ViewStyle,

    // Button base styles
    buttonBase: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // Title styles
    title: {
      fontSize: props.size === 'sm' ? 18 : props.size === 'lg' ? 28 : 22,
      fontWeight: props.size === 'lg' ? '700' : '600',
      letterSpacing: props.size === 'lg' ? 0.5 : -0.3,
      color: colors.backgroundSecondary,
    } as TextStyle,

    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      letterSpacing: -0.2,
    } as TextStyle,

    // Avatar styles (if needed)
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    avatarText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    } as TextStyle,

    // Search styles
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 50,
      borderWidth: 1,
      borderColor: colors.border || 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      color: colors.textPrimary,
      padding: 0,
    } as ViewStyle,

    // Badge styles
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.error || '#EF4444',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      zIndex: 10,
    } as ViewStyle,

    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
