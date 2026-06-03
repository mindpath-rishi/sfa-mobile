// styles/CustomerDetail.styles.ts
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // ────────────────────────────────────────────────────────────────────────────
    // Container & Layout
    // ────────────────────────────────────────────────────────────────────────────
    // Add these to your useOutletDetailStyles function
    mainScrollView: {
      flex: 1,
    } as ViewStyle,

    mainScrollContent: {
      flexGrow: 1,
      paddingBottom: 20,
    } as ViewStyle,

    // Update or add these styles
    footerSafeArea: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    fullWidthButtonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    } as ViewStyle,

    // Remove tabContentWrapper and tabContent styles as they're no longer needed
    // Update tabContentContainer
    tabContentContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[4],
    } as ViewStyle,
    container: {
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: 'column',
    } as ViewStyle,

    // Wrapper for tab content to take remaining space
    tabContentWrapper: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Loading State
    // ────────────────────────────────────────────────────────────────────────────
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      gap: utils.spacing[3],
    } as ViewStyle,
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#6C757D',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Empty State
    // ────────────────────────────────────────────────────────────────────────────
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[6],
    } as ViewStyle,
    emptyStateTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
      textAlign: 'center',
    } as TextStyle,
    emptyStateText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginVertical: utils.spacing[2],
    } as TextStyle,
    emptyStateButton: {
      paddingHorizontal: utils.spacing[5],
      paddingVertical: utils.spacing[2.5],
      backgroundColor: colors.primary,
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,
    emptyStateButtonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    emptyTabContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    } as ViewStyle,
    emptyTabTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
      marginTop: 8,
    } as TextStyle,
    emptyTabText: {
      fontSize: 14,
      color: '#6C757D',
      textAlign: 'center',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Header - Reduced height
    // ────────────────────────────────────────────────────────────────────────────
    detailHeader: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[2],
      paddingBottom: utils.spacing[1],
      backgroundColor: colors.background,
    } as ViewStyle,
    detailHeroCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.primary + '15',
    } as ViewStyle,
    detailHeroCardCompact: {
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[3],
    } as ViewStyle,
    detailHeroTop: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    detailAvatarWrap: {
      width: 50,
      height: 50,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
      flexShrink: 0,
    } as ViewStyle,
    detailHeaderInfo: {
      flex: 1,
      marginLeft: utils.spacing[2],
    } as ViewStyle,
    detailTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[1],
      gap: utils.spacing[2],
    } as ViewStyle,
    detailName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,
    detailOwner: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,
    detailMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[1],
    } as ViewStyle,
    detailMetaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[1.5],
      paddingVertical: utils.spacing[1],
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border + '40',
    } as ViewStyle,
    detailMetaChipText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
    detailLocationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: utils.spacing[2],
      padding: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.primary + '05',
    } as ViewStyle,
    detailLocation: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginLeft: utils.spacing[1],
      flex: 1,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Last Visit/Order Container
    // ────────────────────────────────────────────────────────────────────────────
    lastInfoContainer: {
      paddingHorizontal: 16,
      marginBottom: 8,
      marginTop: 0,
    } as ViewStyle,
    lastInfoCard: {
      flexDirection: 'row',
      backgroundColor: '#F8F9FA',
      borderRadius: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: '#E9ECEF',
    } as ViewStyle,
    lastInfoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    } as ViewStyle,
    lastInfoDivider: {
      width: 1,
      backgroundColor: '#E9ECEF',
      marginHorizontal: 8,
    } as ViewStyle,
    lastInfoLabel: {
      fontSize: 11,
      color: '#6C757D',
    } as TextStyle,
    lastInfoValue: {
      fontSize: 12,
      fontWeight: '600',
      color: '#212529',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Debug Geofence Container
    // ────────────────────────────────────────────────────────────────────────────
    debugGeofenceContainer: {
      backgroundColor: '#4CAF50',
      paddingVertical: 6,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 8,
    } as ViewStyle,
    debugGeofenceText: {
      color: '#FFF',
      fontSize: 11,
      fontWeight: '500',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Tab Bar
    // ────────────────────────────────────────────────────────────────────────────
    tabBar: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: utils.spacing[2.5],
      paddingHorizontal: utils.spacing[4],
      gap: utils.spacing[2],
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    } as ViewStyle,
    tabActive: {
      borderBottomColor: colors.primary,
    } as ViewStyle,
    tabText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
    tabTextActive: {
      color: colors.primary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Tab Content
    // ────────────────────────────────────────────────────────────────────────────
    tabContent: {
      flex: 1,
    } as ViewStyle,
    // tabContentContainer: {
    //   paddingHorizontal: utils.spacing[4],
    //   paddingTop: utils.spacing[3],
    //   paddingBottom: utils.spacing[20],
    // } as ViewStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Summary Tab Styles
    // ────────────────────────────────────────────────────────────────────────────
    summaryContainer: {
      padding: 0,
      gap: 16,
    } as ViewStyle,
    salesSectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: '#F0F0F0',
    } as ViewStyle,
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    } as ViewStyle,
    statCard: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1A1A1A',
      textAlign: 'center',
    } as TextStyle,
    statLabel: {
      fontSize: 12,
      color: '#6C757D',
      textAlign: 'center',
      fontWeight: '500',
    } as TextStyle,
    statSubLabel: {
      fontSize: 9,
      color: '#999',
      marginTop: 2,
    } as TextStyle,
    statsDivider: {
      height: 1,
      backgroundColor: '#F0F0F0',
      marginVertical: 16,
    } as ViewStyle,
    statsSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#6C757D',
      marginBottom: 12,
      letterSpacing: 0.5,
    } as TextStyle,
    statsGridSmall: {
      flexDirection: 'row',
      gap: 12,
    } as ViewStyle,
    statCardSmall: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,
    statValueSmall: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1A1A1A',
      textAlign: 'center',
    } as TextStyle,
    statLabelSmall: {
      fontSize: 11,
      color: '#6C757D',
      textAlign: 'center',
      fontWeight: '500',
    } as TextStyle,
    insightsCard: {
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E9ECEF',
    } as ViewStyle,
    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    } as ViewStyle,
    insightsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1A1A1A',
    } as TextStyle,
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 10,
      paddingVertical: 4,
    } as ViewStyle,
    insightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#4CAF50',
      marginTop: 6,
    } as ViewStyle,
    insightText: {
      flex: 1,
      fontSize: 12,
      color: '#495057',
      lineHeight: 18,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Sales Table Styles
    // ────────────────────────────────────────────────────────────────────────────
    salesTableContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      marginBottom: 16,
    } as ViewStyle,
    salesTableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F3F4F6',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    } as ViewStyle,
    salesTableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      backgroundColor: '#FFFFFF',
    } as ViewStyle,
    salesTableCell: {
      width: 70,
      paddingVertical: 12,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: '#F0F0F0',
    } as ViewStyle,
    salesTableCellCategory: {
      width: 110,
      alignItems: 'flex-start',
      backgroundColor: '#FAFAFA',
    } as ViewStyle,
    salesTableCellTotal: {
      width: 80,
      backgroundColor: '#F8FAFC',
      borderRightWidth: 0,
    } as ViewStyle,
    salesTableHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#374151',
      textAlign: 'center',
    } as TextStyle,
    salesTableCategoryText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#1F2937',
      marginBottom: 2,
    } as TextStyle,
    salesTableUnitText: {
      fontSize: 10,
      color: '#9CA3AF',
    } as TextStyle,
    salesTableCellValue: {
      fontSize: 12,
      color: '#6B7280',
      textAlign: 'center',
    } as TextStyle,
    salesTableCellValueHighlight: {
      color: '#10B981',
      fontWeight: '500',
    } as TextStyle,
    salesTableCellTotalValue: {
      fontSize: 13,
      fontWeight: '600',
      color: '#1F2937',
      textAlign: 'center',
    } as TextStyle,
    salesTableSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#F9FAFB',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    } as ViewStyle,
    salesTableSummaryText: {
      fontSize: 11,
      color: '#9CA3AF',
    } as TextStyle,
    salesTableSummaryTotal: {
      fontSize: 12,
      fontWeight: '500',
      color: '#6B7280',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Visit Card Styles
    // ────────────────────────────────────────────────────────────────────────────
    visitCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,
    visitCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,
    visitStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    } as ViewStyle,
    visitDate: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,
    visitDurationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    } as ViewStyle,
    visitDuration: {
      fontSize: 11,
      color: colors.primary,
    } as TextStyle,
    visitNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,
    visitNoteText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,
    listHeader: {
      marginBottom: 16,
    } as ViewStyle,
    listHeaderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,
    listHeaderSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Footer Button Styles
    // ────────────────────────────────────────────────────────────────────────────
    // fullWidthButtonContainer: {
    //   backgroundColor: colors.surface,
    //   borderTopWidth: 1,
    //   borderTopColor: colors.divider,
    //   paddingHorizontal: 16,
    //   paddingVertical: 12,
    //   paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    // } as ViewStyle,
    fullWidthButton: {
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,
    fullWidthButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,
    fullWidthButtonTextContainer: {
      flex: 1,
      marginLeft: 12,
    } as ViewStyle,
    fullWidthButtonTitle: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    } as TextStyle,
    fullWidthButtonSubtitle: {
      color: '#FFF',
      fontSize: 12,
      opacity: 0.9,
      marginTop: 2,
    } as TextStyle,
    fullWidthAutoStartIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 12,
    } as ViewStyle,
    autoStartText: {
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Utilities
    // ────────────────────────────────────────────────────────────────────────────
    divider: {
      height: 1,
      backgroundColor: colors.divider,
    } as ViewStyle,
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    // footerSafeArea: {
    //   backgroundColor: colors.surface,
    //   borderTopWidth: 1,
    //   borderTopColor: colors.divider,
    // } as ViewStyle,

    // fullWidthButtonContainer: {
    //   paddingHorizontal: 16,
    //   paddingVertical: 12,
    //   // paddingBottom removed - now handled by SafeAreaView
    // } as ViewStyle,
  }));

  return styleGenerator(colors);
};
