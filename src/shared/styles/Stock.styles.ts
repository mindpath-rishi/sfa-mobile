// StockPage.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useStockPageStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    listContainer: {
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    headerContainer: {
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    // Hero Section
    heroSection: {
      paddingTop: utils.spacing[6],
      paddingBottom: utils.spacing[6],
      paddingHorizontal: utils.spacing[5],
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    } as ViewStyle,

    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    heroTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFF',
    } as TextStyle,

    heroSubtitle: {
      fontSize: utils.fontSize.sm,
      color: '#FFF',
      opacity: 0.9,
      marginTop: 4,
    } as TextStyle,

    loadNumberChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: 20,
      gap: 6,
    } as ViewStyle,

    loadNumberChipText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: '#FFF',
    } as TextStyle,

    // Search Section
    searchSection: {
      paddingHorizontal: utils.spacing[4],
      marginTop: -utils.spacing[3],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderRadius: 14,
      borderWidth: 1,
      gap: 10,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    } as ViewStyle,

    searchInput: {
      flex: 1,
      fontSize: utils.fontSize.md,
      paddingVertical: 0,
    } as TextStyle,

    searchResultText: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[2],
      marginLeft: utils.spacing[1],
    } as TextStyle,

    // Metrics Horizontal Scroll - NO CARDS
    metricsWrapper: {
      marginBottom: utils.spacing[4],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
    } as ViewStyle,

    metricsScrollContainer: {
      paddingHorizontal: utils.spacing[4],
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    metricItem: {
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[2],
      minWidth: 100,
      alignItems: 'center',
    } as ViewStyle,

    metricLabel: {
      fontSize: 11,
      marginBottom: 6,
      textAlign: 'center',
    } as TextStyle,

    metricValue: {
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    } as TextStyle,

    metricDivider: {
      width: 1,
      height: 40,
    } as ViewStyle,

    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,

    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
    } as TextStyle,

    sectionCount: {
      fontSize: 12,
    } as TextStyle,

    // Product Row - NO CARDS
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    } as ViewStyle,

    productLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: 50,
    } as ViewStyle,

    productIndex: {
      fontSize: 13,
      width: 24,
    } as TextStyle,

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    } as ViewStyle,

    productCenter: {
      flex: 1,
      marginRight: 12,
    } as ViewStyle,

    productName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    } as TextStyle,

    productCode: {
      fontSize: 11,
    } as TextStyle,

    productRight: {
      alignItems: 'flex-end',
    } as ViewStyle,

    productStock: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    } as TextStyle,

    productPrice: {
      fontSize: 11,
    } as TextStyle,

    outOfStockText: {
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    // Loading States
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background + 'CC',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    loadingText: {
      marginTop: 12,
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    loadingFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[4],
      gap: 8,
    } as ViewStyle,

    loadingFooterText: {
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    // Empty State
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[12],
      gap: 12,
    } as ViewStyle,

    emptyStateText: {
      fontSize: 15,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
