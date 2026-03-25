import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useNoSalesReasonStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
    } as ViewStyle,

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    headerTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    headerRight: {
      width: 40,
    } as ViewStyle,

    // Scroll Content
    scrollContent: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[24],
    } as ViewStyle,

    // Customer Info
    customerInfo: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    customerId: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('700'),
      color: colors.textPrimary,
    } as TextStyle,

    // Category Header (for second screen)
    categoryHeader: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    categoryTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
      color: colors.primary,
      textTransform: 'uppercase',
    } as TextStyle,

    // Reasons Grid (for first screen)
    reasonsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: utils.spacing[3],
    } as ViewStyle,

    reasonCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      alignItems: 'center',
      borderWidth: 2,
      position: 'relative',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    reasonCardSelected: {
      borderWidth: 2,
    } as ViewStyle,

    reasonIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    reasonTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textPrimary,
      textAlign: 'center',
      textTransform: 'uppercase',
    } as TextStyle,

    selectedIndicator: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // Reasons List (for second screen)
    reasonsList: {
      gap: utils.spacing[2],
    } as ViewStyle,

    reasonListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.md,
      padding: utils.spacing[3],
      borderWidth: 1,
    } as ViewStyle,

    reasonListItemSelected: {
      borderWidth: 2,
    } as ViewStyle,

    reasonListItemText: {
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    reasonListItemTextSelected: {
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Bottom Bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    proceedButton: {
      paddingVertical: utils.spacing[3.5],
      borderRadius: utils.borderRadius.lg,
      alignItems: 'center',
    } as ViewStyle,

    proceedButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
