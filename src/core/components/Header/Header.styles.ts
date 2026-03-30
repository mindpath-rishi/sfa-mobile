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
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: props.size === 'sm' ? 56 : props.size === 'lg' ? 80 : 50,
      backgroundColor: props.transparent ? 'transparent' : colors.background,
      // borderBottomWidth: props.showBorder ? 1 : 0,
      // borderBottomColor: colors.border + '30',
    } as ViewStyle,

    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 40,
    } as ViewStyle,

    centerSection: {
      flex: 1,
      alignItems: props.centeredTitle ? 'center' : 'flex-start',
      justifyContent: 'center',
    } as ViewStyle,

    centerContent: {
      alignItems: props.centeredTitle ? 'center' : 'flex-start',
    } as ViewStyle,

    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 40,
      gap: utils.spacing[2],
    } as ViewStyle,

    iconButton: {
      padding: utils.spacing[1.5],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    iconButtonPressed: {
      backgroundColor: colors.border + '20',
    } as ViewStyle,

    icon: {
      color: colors.textPrimary,
    } as TextStyle,

    title: {
      fontSize: props.size === 'sm' ? 16 : props.size === 'lg' ? 22 : 18,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    subtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
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
      fontWeight: utils.getFontWeight('600'),
      color: 'white',
    } as TextStyle,

    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      paddingHorizontal: utils.spacing[2.5],
      paddingVertical: utils.spacing[1.5],
      borderWidth: 1,
      borderColor: colors.border + '30',
    } as ViewStyle,

    searchInput: {
      flex: 1,
      marginLeft: utils.spacing[1.5],
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      padding: 0,
    } as ViewStyle,

    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    } as ViewStyle,

    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Filter button styles
    filterButtonActive: {
      backgroundColor: colors.primary + '15',
    } as ViewStyle,

    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    } as ViewStyle,

    filterBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
