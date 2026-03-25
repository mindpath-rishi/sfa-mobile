import { AppColors, createStyles } from '@/shared/theme';

export const useStyles = createStyles((utils, colors: AppColors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: utils.spacing[6],
  },

  icon: {
    fontSize: utils.fontSize['4xl'],
    marginBottom: utils.spacing[4],
  },

  title: {
    fontSize: utils.fontSize.xl,
    fontWeight: utils.getFontWeight('bold'),
    color: colors.textPrimary,
    textAlign: utils.textAlign(),
    marginBottom: utils.spacing[2],
  },

  message: {
    fontSize: utils.fontSize.base,
    color: colors.textSecondary,
    textAlign: utils.textAlign(),
    marginBottom: utils.spacing[6],
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: utils.spacing[3],
    paddingHorizontal: utils.spacing[6],
    borderRadius: utils.borderRadius.md,
    ...utils.shadow.base,
  },

  buttonText: {
    fontSize: utils.fontSize.base,
    fontWeight: utils.getFontWeight('semibold'),
    color: colors.textInverse,
    textAlign: 'center',
  },
}));
