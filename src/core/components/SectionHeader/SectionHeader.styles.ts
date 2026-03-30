// components/ui/SectionHeader/SectionHeader.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  SectionHeaderAlignment,
  SectionHeaderStyles,
  SectionHeaderVariant,
} from './SectionHeader.types';

export const useSectionHeaderStyles = (
  variant: SectionHeaderVariant = 'default',
  alignment: SectionHeaderAlignment = 'left',
): SectionHeaderStyles => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => {
    // Get variant-specific styles
    const getVariantTitleStyle = (): TextStyle => {
      switch (variant) {
        case 'large':
          return {
            fontSize: utils.fontSize.xl,
            fontWeight: utils.getFontWeight('bold'),
            color: colors.textPrimary,
          };
        case 'small':
          return {
            fontSize: utils.fontSize.sm,
            fontWeight: utils.getFontWeight('medium'),
            color: colors.textSecondary,
          };
        case 'compact':
          return {
            fontSize: utils.fontSize.xs,
            fontWeight: utils.getFontWeight('semibold'),
            color: colors.textTertiary,
            textTransform: 'uppercase' as const,
          };
        default:
          return {
            fontSize: utils.fontSize.md,
            fontWeight: utils.getFontWeight('semibold'),
            color: colors.textPrimary,
          };
      }
    };

    // Get alignment-specific styles
    const getAlignmentStyle = (): ViewStyle => {
      switch (alignment) {
        case 'center':
          return {
            justifyContent: 'center',
            alignItems: 'center',
          };
        case 'right':
          return {
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          };
        default:
          return {
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          };
      }
    };

    const variantTitleStyle = getVariantTitleStyle();

    return {
      container: {
        marginBottom: utils.spacing[3],
        marginTop: utils.spacing[2],
      } as ViewStyle,

      contentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...getAlignmentStyle(),
      } as ViewStyle,

      leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: utils.spacing[2],
      } as ViewStyle,

      titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: utils.spacing[2],
        flexWrap: 'wrap',
      } as ViewStyle,

      baseTitle: {
        fontWeight: utils.getFontWeight('semibold'),
      } as TextStyle,

      defaultTitle: {
        fontSize: utils.fontSize.md,
        color: colors.textPrimary,
      } as TextStyle,

      largeTitle: {
        fontSize: utils.fontSize.xl,
        color: colors.textPrimary,
        fontWeight: utils.getFontWeight('bold'),
      } as TextStyle,

      smallTitle: {
        fontSize: utils.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: utils.getFontWeight('medium'),
      } as TextStyle,

      compactTitle: {
        fontSize: utils.fontSize.xs,
        color: colors.textTertiary,
        fontWeight: utils.getFontWeight('semibold'),
        textTransform: 'uppercase' as const,
      } as TextStyle,

      subtitleText: {
        fontSize: utils.fontSize.xs,
        color: colors.textTertiary,
        marginTop: utils.spacing[1],
      } as TextStyle,

      rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: utils.spacing[2],
      } as ViewStyle,

      countBadge: {
        backgroundColor: colors.primary + '20',
        borderRadius: utils.borderRadius.full,
        paddingHorizontal: utils.spacing[2],
        paddingVertical: utils.spacing[1],
        minWidth: 24,
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,

      countText: {
        fontSize: utils.fontSize.xs,
        color: colors.primary,
        fontWeight: utils.getFontWeight('medium'),
      } as TextStyle,

      viewAllButton: {
        paddingHorizontal: utils.spacing[2],
        paddingVertical: utils.spacing[1],
      } as ViewStyle,

      viewAllText: {
        color: colors.primary,
        fontSize: utils.fontSize.xs,
        fontWeight: utils.getFontWeight('medium'),
      } as TextStyle,

      icon: {
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,

      leftIcon: {
        marginRight: utils.spacing[2],
      } as ViewStyle,

      rightIcon: {
        marginLeft: utils.spacing[2],
      } as ViewStyle,
    };
  });

  return styleGenerator(colors);
};
