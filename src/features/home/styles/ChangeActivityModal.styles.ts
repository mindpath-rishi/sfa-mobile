import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface ChangeActivityModalStyleProps {
  showChangeOtherOptions?: boolean;
}

export const useChangeActivityModalStyles = (props: ChangeActivityModalStyleProps = {}) => {
  const { colors } = useTheme();
  const { showChangeOtherOptions } = props;

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

    currentActivityInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    infoIcon: {
      marginRight: utils.spacing[2],
    } as ViewStyle,

    infoText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      flex: 1,
      marginLeft: utils.spacing[2],
    } as TextStyle,

    infoHighlight: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
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
      width: 48,
      height: 48,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[4],
    } as ViewStyle,

    itemContent: {
      flex: 1,
    } as ViewStyle,

    itemTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,

    itemSubtitle: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginTop: utils.spacing[1],
    } as TextStyle,

    chevronIcon: {
      color: colors.textTertiary,
    } as TextStyle,

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
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

    closeIcon: {
      color: colors.textSecondary,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
