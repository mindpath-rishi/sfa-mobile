import { createStyles } from '@/shared/theme/styles';

export const createSearchBarStyles = (colors: any) =>
  createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: utils.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: utils.spacing[3],
      height: 48,
    },

    fullWidth: {
      width: '100%',
    },

    disabled: {
      opacity: 0.6,
    },

    input: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
      paddingVertical: 0,
      marginLeft: utils.spacing[2],
    },

    icon: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    leftIcon: {
      marginRight: utils.spacing[1],
    },

    rightIcon: {
      marginLeft: utils.spacing[1],
    },

    pressed: {
      opacity: 0.85,
    },
  }))(colors);
