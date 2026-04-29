// import { ViewStyle, TextStyle } from 'react-native';
// import { createStyles } from '@/shared/theme/styles';
// import { useTheme } from '@/shared/hooks/useTheme';

// export const usePaymentsListStyles = () => {
//   const { colors } = useTheme();
//   const styles = createStyles((utils) => ({
//     title: {
//       fontSize: utils.fontSize.sm,
//       fontWeight: 'semibold',
//       color: colors.textPrimary,
//     } as TextStyle,

//     subtitle: {
//       fontSize: utils.fontSize.xs,
//       color: colors.textSecondary,
//     } as TextStyle,

//     amount: {
//       fontSize: utils.fontSize.md,
//       fontWeight: 'bold',
//       color: colors.success,
//     } as TextStyle,

//     metaContainer: {
//       flexDirection: utils.rowDirection(), // ✅ RTL safe
//       alignItems: 'center',
//       flexWrap: 'wrap',
//       gap: utils.spacing[3], // 12
//       marginTop: utils.spacing[2], // 8
//       paddingTop: utils.spacing[2], // 8
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,

//     metaItem: {
//       flexDirection: utils.rowDirection(), // ✅ RTL safe
//       alignItems: 'center',
//       gap: utils.spacing[1], // 4
//     } as ViewStyle,

//     metaText: {
//       fontSize: utils.fontSize.xs - 1, // 11 equivalent
//       color: colors.textTertiary,
//       textAlign: utils.textAlign(), // ✅ RTL safe
//     } as TextStyle,
//   }));

//   return styles(colors);
// };


import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * PaymentsList Styles Hook
 * 
 * Organized with semantic groupings:
 * 1. Card Content Sections (title, subtitle, amount)
 * 2. Meta Information (metadata container & individual items)
 * 3. Helper Utilities (spacing, borders, dividers)
 */
export const usePaymentsListStyles = () => {
  const { colors } = useTheme();

  const styles = createStyles((utils) => {
    // ─────────────────────────────────────────────
    // CARD HEADER SECTION
    // ─────────────────────────────────────────────
    const cardTitle: TextStyle = {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.textPrimary,
      letterSpacing: -0.3, // Subtle tightening for readability
    };

    const cardSubtitle: TextStyle = {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[1], // 4px gap below title
    };

    const cardAmount: TextStyle = {
      fontSize: utils.fontSize.lg,
      fontWeight: '700',
      color: colors.success,
      letterSpacing: -0.5, // Tighter numeric display
    };

    // ─────────────────────────────────────────────
    // META INFORMATION SECTION
    // ─────────────────────────────────────────────
    const metaContainer: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: utils.spacing[3], // 12px
      marginTop: utils.spacing[2], // 8px
      paddingTop: utils.spacing[2], // 8px
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    };

    const metaItem: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[1], // 4px
    };

    const metaText: TextStyle = {
      fontSize: utils.fontSize.xs - 1, // 11px
      color: colors.textTertiary,
      textAlign: utils.textAlign(),
      fontWeight: '500', // Slightly heavier for clarity
    };

    const metaIcon = {
      size: 11,
      color: colors.textTertiary,
    } as const;

    // ─────────────────────────────────────────────
    // RETURNED STYLES OBJECT
    // ─────────────────────────────────────────────
    return {
      // Card sections
      title: cardTitle,
      subtitle: cardSubtitle,
      amount: cardAmount,

      // Meta information
      metaContainer,
      metaItem,
      metaText,
      metaIcon,
    };
  });

  return styles(colors);
};