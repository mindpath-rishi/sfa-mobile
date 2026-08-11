import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface HeaderStylesProps {
  elevated: boolean;
  centeredTitle: boolean;
  transparent: boolean;
  size: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';
  showBorder: boolean;
  showSearchBar?: boolean;
}

export const useHeaderStyles = (props: HeaderStylesProps) => {
  const { colors } = useTheme();
  const isSmall = props.size === 'small' || props.size === 'sm';
  const isLarge = props.size === 'large' || props.size === 'lg';

  const styleGenerator = createStyles((utils) => ({
    filterBadge: {
      position: 'absolute',
      top: -2,
      right: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.success || '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 2,
      // borderColor: colors.background,
      zIndex: 10,
    } as ViewStyle,

    filterBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,

    filterDot: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.success || '#10B981',
      zIndex: 10,
    } as ViewStyle,

    filterButtonActive: {
      backgroundColor: colors.success + '15' || '#10B98115',
    } as ViewStyle,

    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // minHeight: props.size === 'sm' ? 56 : props.size === 'lg' ? 80 : 50,
      minHeight: isSmall ? 48 : isLarge ? 64 : 56,
      paddingVertical: isSmall ? 4 : 8,
      paddingHorizontal: 8,
      borderBottomWidth: props.showBorder ? 1 : 0,
      borderBottomColor: colors.divider + '40',
      ...(props.elevated && {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }),
    } as ViewStyle,

    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minWidth: 44,
    } as ViewStyle,

    centerSection: {
      flex: 1,
      alignItems: props.centeredTitle ? 'center' : 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: 8,
    } as ViewStyle,

    centerSectionWithSearch: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    } as ViewStyle,

    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 44,
      gap: utils.spacing[1],
    } as ViewStyle,

    buttonBase: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    title: {
      fontSize: isSmall ? 16 : isLarge ? 28 : 22,
      fontWeight: isLarge ? '700' : '600',
      letterSpacing: isLarge ? 0.5 : -0.3,
      color: colors.backgroundSecondary,
    } as TextStyle,

    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      letterSpacing: -0.2,
    } as TextStyle,

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

    // Inline search styles (within header)
    searchContainerInline: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 40,
      borderWidth: 1,
      borderColor: colors.border || 'rgba(0,0,0,0.1)',
    } as ViewStyle,

    searchInputInline: {
      flex: 1,
      marginLeft: 8,
      fontSize: 15,
      color: colors.textPrimary,
      padding: 0,
      height: 40,
    } as ViewStyle,

    clearButtonInline: {
      padding: 4,
      marginLeft: 4,
    } as ViewStyle,

    // Legacy search styles (for when search is below header)
    searchBarWrapper: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 16,
    } as ViewStyle,

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      borderWidth: 1,
      borderColor: colors.border || 'rgba(0,0,0,0.1)',
      ...(props.elevated && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }),
    } as ViewStyle,

    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 15,
      color: colors.textPrimary,
      padding: 0,
      height: 44,
    } as ViewStyle,

    clearButton: {
      padding: 4,
      marginLeft: 4,
    } as ViewStyle,

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
