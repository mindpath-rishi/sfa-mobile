import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface StartDayModalStyleProps {
  showOtherOptions?: boolean;
}

export const useStartDayModalStyles = (props: StartDayModalStyleProps = {}) => {
  const { colors } = useTheme();
  const { showOtherOptions } = props;

  const styleGenerator = createStyles((utils) => ({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: utils.spacing[4],
      maxHeight: '80%',
    } as ViewStyle,

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    titleSmall: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      letterSpacing: 0.4,
    } as TextStyle,

    closeIcon: {
      color: colors.textSecondary,
    } as TextStyle,

    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[4],
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      marginBottom: utils.spacing[2],
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    modalItemIcon: {
      width: 42,
      height: 42,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[4],
    } as ViewStyle,

    itemContent: {
      flex: 1,
    } as ViewStyle,

    textSmallBold: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      letterSpacing: 0.4,
    } as TextStyle,

    textXSmall: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[1],
    } as TextStyle,

    chevronIcon: {
      color: colors.textTertiary,
    } as TextStyle,

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: utils.spacing[4],
      padding: utils.spacing[3],
    } as ViewStyle,

    backButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
      letterSpacing: 0.4,
      marginLeft: utils.spacing[2],
    } as TextStyle,

    backIcon: {
      color: colors.primary,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
