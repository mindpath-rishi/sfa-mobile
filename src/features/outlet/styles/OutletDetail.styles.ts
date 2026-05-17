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
    container: {
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
    // Header
    // ────────────────────────────────────────────────────────────────────────────
    detailHeader: {
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      backgroundColor: colors.background,
    } as ViewStyle,
    detailHeroCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[4],
      borderWidth: 1.5,
      borderColor: colors.primary + '20',
    } as ViewStyle,
    detailHeroCardCompact: {
      paddingVertical: utils.spacing[3],
    } as ViewStyle,
    detailHeroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    } as ViewStyle,
    detailAvatarWrap: {
      width: 64,
      height: 64,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary + '10',
    } as ViewStyle,
    detailHeaderInfo: {
      flex: 1,
      marginLeft: utils.spacing[3],
    } as ViewStyle,
    detailTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[1],
      gap: utils.spacing[2],
    } as ViewStyle,
    detailName: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,
    detailOwner: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: utils.spacing[2],
    } as TextStyle,
    detailMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
    } as ViewStyle,
    detailMetaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1.5],
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
      marginTop: utils.spacing[3],
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      backgroundColor: colors.primary + '08',
      borderWidth: 1,
      borderColor: colors.primary + '12',
    } as ViewStyle,
    detailLocation: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      marginLeft: utils.spacing[2],
      flex: 1,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Visit Type Badge (NEW)
    // ────────────────────────────────────────────────────────────────────────────
    visitTypeContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
    } as ViewStyle,
    visitTypeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 6,
    } as ViewStyle,
    visitTypeText: {
      fontSize: 12,
      fontWeight: '600',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Last Visit/Order Container
    // ────────────────────────────────────────────────────────────────────────────
    lastInfoContainer: {
      paddingHorizontal: 16,
      marginTop: -8,
      marginBottom: 12,
    },
    lastInfoCard: {
      flexDirection: 'row',
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: '#E9ECEF',
    },
    lastInfoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    lastInfoDivider: {
      width: 1,
      backgroundColor: '#E9ECEF',
      marginHorizontal: 12,
    },
    lastInfoLabel: {
      fontSize: 12,
      color: '#6C757D',
    },
    lastInfoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: '#212529',
    },

    // ────────────────────────────────────────────────────────────────────────────
    // Tab Bar
    // ────────────────────────────────────────────────────────────────────────────
    tabBar: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: utils.spacing[3],
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
    tabContent: {
      flex: 1,
    } as ViewStyle,
    tabContentContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[20],
    } as ViewStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Summary Tab Styles
    // ────────────────────────────────────────────────────────────────────────────
    summaryContainer: {
      padding: 16,
      gap: 16,
    },
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
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1A1A1A',
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 12,
      color: '#6C757D',
      textAlign: 'center',
      fontWeight: '500',
    },
    statSubLabel: {
      fontSize: 9,
      color: colors.textTertiary,
      marginTop: 2,
    },
    statsDivider: {
      height: 1,
      backgroundColor: '#F0F0F0',
      marginVertical: 16,
    },
    statsSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: '#6C757D',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    statsGridSmall: {
      flexDirection: 'row',
      gap: 12,
    },
    statCardSmall: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 6,
    },
    statValueSmall: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1A1A1A',
      textAlign: 'center',
    },
    statLabelSmall: {
      fontSize: 11,
      color: '#6C757D',
      textAlign: 'center',
      fontWeight: '500',
    },
    insightsCard: {
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E9ECEF',
    },
    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    insightsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1A1A1A',
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 10,
      paddingVertical: 4,
    },
    insightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#4CAF50',
      marginTop: 6,
    },
    insightText: {
      flex: 1,
      fontSize: 12,
      color: '#495057',
      lineHeight: 18,
    },

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
    fullWidthButtonContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
    },
    fullWidthButton: {
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    fullWidthButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fullWidthButtonTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    fullWidthButtonTitle: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    fullWidthButtonSubtitle: {
      color: '#FFF',
      fontSize: 12,
      opacity: 0.9,
      marginTop: 2,
    },
    fullWidthAutoStartIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 12,
    },
    autoStartText: {
      fontSize: 14,
      fontWeight: '500',
    },

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
  }));

  return styleGenerator(colors);
};
