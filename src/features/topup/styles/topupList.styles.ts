import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

/**
 * TopupList Styles Hook
 *
 * Organized with semantic groupings:
 * 1. Card Content Sections (title, subtitle, amount)
 * 2. Cases & Pieces Display (Requested and Approved columns)
 * 3. Icon Configurations
 *
 * Maintains consistency with PaymentsList styling patterns
 */
export const useTopupListStyles = () => {
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
      color: colors.primary,
      letterSpacing: -0.5, // Tighter numeric display
    };

    // ─────────────────────────────────────────────
    // CASES & PIECES SECTION
    // ─────────────────────────────────────────────
    const casesContainer: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[4], // 16px between Requested and Approved
      marginTop: utils.spacing[2], // 8px
      paddingBottom: utils.spacing[2], // 8px
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    };

    const casesColumn: ViewStyle = {
      flex: 1,
      flexDirection: 'column',
    };

    const casesLabel: TextStyle = {
      fontSize: utils.fontSize.xs - 1, // 11px
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: utils.spacing[1], // 4px
    };

    const casesPiecesRow: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[2], // 8px between Cases and Pieces
    };

    const casesValue: TextStyle = {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
      color: colors.textPrimary,
    };

    const piecesValue: TextStyle = {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
      color: colors.textPrimary,
    };

    // ─────────────────────────────────────────────
    // FOOTER SECTION (Date & Approval Info)
    // ─────────────────────────────────────────────
    const footerDivider: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[3], // 12px
      marginTop: utils.spacing[2], // 8px
      paddingTop: utils.spacing[2], // 8px
      justifyContent: 'space-between',
    };

    const dateContainer: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[1], // 4px
    };

    const dateText: TextStyle = {
      fontSize: utils.fontSize.xs - 1, // 11px
      color: colors.textTertiary,
      fontWeight: '500',
    };

    const approvedByContainer: ViewStyle = {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[1], // 4px
    };

    const approvedByText: TextStyle = {
      fontSize: utils.fontSize.xs - 1, // 11px
      color: colors.success,
      fontWeight: '500',
    };

    // ─────────────────────────────────────────────
    // ICON CONFIGURATION
    // ─────────────────────────────────────────────
    const iconConfig = {
      size: 11,
      color: colors.textTertiary,
      successColor: colors.success,
    } as const;

    // ─────────────────────────────────────────────
    // RETURNED STYLES OBJECT
    // ─────────────────────────────────────────────
    return {
      // Card sections
      title: cardTitle,
      subtitle: cardSubtitle,
      amount: cardAmount,

      // Cases & pieces
      casesContainer,
      casesColumn,
      casesLabel,
      casesPiecesRow,
      casesValue,
      piecesValue,

      // Footer
      footerDivider,
      dateContainer,
      dateText,
      approvedByContainer,
      approvedByText,

      // Icon configuration
      iconConfig,
    };
  });

  return styles(colors);
};