// app/topup/styles/topupScreen.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTopupStyles = () => {
  const { colors } = useTheme();
  const styles = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    fixedSearchContainer: {
      paddingHorizontal: utils.spacing[3],
      paddingTop: utils.spacing[2.5],
      paddingBottom: utils.spacing[2],
      backgroundColor: colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 30,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    } as ViewStyle,

    // Cases and Pieces Section
    casesContainer: {
      flexDirection: utils.rowDirection(),
      justifyContent: 'space-between',
      marginBottom: utils.spacing[2],
      gap: utils.spacing[3],
    } as ViewStyle,

    casesColumn: {
      flex: 1,
    } as ViewStyle,

    casesLabel: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.textTertiary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    casesPiecesRow: {
      flexDirection: utils.rowDirection(),
      gap: utils.spacing[2],
      flexWrap: 'wrap',
    } as ViewStyle,

    casesValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    } as TextStyle,

    piecesValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    // Footer
    footerDivider: {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: utils.spacing[1],
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    dateContainer: {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[1.5],
    } as ViewStyle,

    approvedByContainer: {
      flexDirection: utils.rowDirection(),
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    dateText: {
      fontSize: utils.fontSize.xs - 1,
      color: colors.textTertiary,
    } as TextStyle,

    approvedByText: {
      fontSize: utils.fontSize.xs - 2,
      color: colors.textTertiary,
    } as TextStyle,
  }));

  return styles(colors);
};
