// styles/CustomerDetail.styles.ts
import { ViewStyle, TextStyle, Platform } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Updated styles for Summary Tab - Add/replace these in your styles object

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

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
      flex: 1,
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

    statTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },

    statTrendText: {
      fontSize: 10,
      fontWeight: '500',
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

    // Insights Card
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

    // Update existing tabContent to have proper spacing
    tabContent: {
      flex: 1,
    },

    tabContentContainer: {
      paddingBottom: 20,
    },

    // Loading text style
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: '#6C757D',
    },

    // Empty state styles
    emptyTabContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    },

    emptyTabTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
      marginTop: 8,
    },

    emptyTabText: {
      fontSize: 14,
      color: '#6C757D',
      textAlign: 'center',
    },

    // Last Visit/Order Container
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

    // Full Width Button Styles
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
    proceedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 10,
      backgroundColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    proceedButtonContent: {
      flex: 1,
      marginLeft: 12,
    },
    proceedButtonTitle: {
      color: '#FFF',
      fontSize: 15,
      fontWeight: '600',
    },
    proceedButtonSubtitle: {
      color: '#FFF',
      fontSize: 11,
      opacity: 0.9,
      marginTop: 1,
    },
    autoStartIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      gap: 12,
    },
    autoStartText: {
      fontSize: 14,
      fontWeight: '500',
    },
    saleCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    visitCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    invoiceCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    salesSectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    summaryContainer: {
      padding: 16,
      paddingBottom: 24,
    },
    salesSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
    statSubLabel: {
      fontSize: 9,
      color: colors.textTertiary,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 50,
      backgroundColor: colors.divider,
    },
    statsRowSmall: {
      flexDirection: 'row',
      gap: 12,
    },
    statBoxSmall: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
    },
    statValueSmall: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    statLabelSmall: {
      fontSize: 9,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    statSubLabelSmall: {
      fontSize: 8,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 2,
    },
    vanSalesFooter: {
      marginTop: 8,
      paddingVertical: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    vanSalesText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      letterSpacing: 1,
    },
    welcomeCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary + '12',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: colors.primary + '20',
    },
    welcomeTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    welcomeSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    welcomeIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    sectionIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary + '30',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statPeriodSmall: {
      fontSize: 9,
      color: colors.textTertiary,
      marginTop: 2,
    },
    quickStatsFooter: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginTop: 8,
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: colors.primary + '15',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    quickStatItem: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    quickStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    quickStatValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    quickStatDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.divider,
    },
    detailDatesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 6,
      marginBottom: 4,
    },
    detailDateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(0,0,0,0.05)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    detailDateLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    detailDateValue: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    shareButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    // Sales Tab Styles
    saleCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    saleId: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    saleDate: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    saleAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    saleCardBody: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    saleStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    saleStatText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    saleStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 'auto',
    },
    saleStatusText: {
      fontSize: 11,
      fontWeight: '500',
    },
    // Visits Tab Styles
    visitCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    visitStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    visitDate: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      flex: 1,
    },
    visitDurationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    visitDuration: {
      fontSize: 11,
      color: colors.primary,
    },
    visitNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    visitNoteText: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
    },
    listHeader: {
      marginBottom: 16,
    },
    listHeaderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    listHeaderSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
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
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Header
    // ────────────────────────────────────────────────────────────────────────────
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[3],
    } as ViewStyle,
    headerTopRowCompact: {
      marginBottom: utils.spacing[2],
    } as ViewStyle,
    backButton: {
      width: 40,
      height: 40,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,
    headerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '12',
      borderWidth: 1,
      borderColor: colors.primary + '18',
    } as ViewStyle,
    headerPillText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,
    headerButton: {
      padding: utils.spacing[2],
    } as ViewStyle,

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
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        android: {
          elevation: 4,
        },
      }),
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
    detailHeroActions: {
      flexDirection: 'row',
      gap: utils.spacing[2],
      marginTop: utils.spacing[3],
    } as ViewStyle,
    headerActionButton: {
      flex: 1.3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[1.5],
      paddingVertical: utils.spacing[2.5],
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,
    headerActionButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: '#FFF',
    } as TextStyle,
    headerActionButtonOutline: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[1],
      paddingVertical: utils.spacing[2.5],
      borderRadius: utils.borderRadius.full,
      borderWidth: 1,
      backgroundColor: colors.background,
    } as ViewStyle,
    headerActionButtonOutlineText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
    detailDistanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    detailDistance: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginLeft: utils.spacing[1],
    } as TextStyle,

    // Update the detailStatsRow style to handle 4 items
    detailStatsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    detailStatCard: {
      flex: 1,
      minWidth: '23%',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    detailStatIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    detailStatValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    detailStatLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────

    // ────────────────────────────────────────────────────────────────────────────
    // Visit Banner
    // ────────────────────────────────────────────────────────────────────────────
    visitBanner: {
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderRadius: utils.borderRadius.xl,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,

    visitBannerActive: {
      borderWidth: 1,
      borderColor: colors.warning + '30',
      backgroundColor: colors.warning + '05',
    } as ViewStyle,

    visitBannerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[3],
      gap: utils.spacing[3],
    } as ViewStyle,

    visitBannerIcon: {
      width: 44,
      height: 44,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.warning + '15',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    visitBannerInfo: {
      flex: 1,
    } as ViewStyle,

    visitBannerTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    visitBannerSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    visitBannerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.warning,
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.full,
      gap: utils.spacing[1],
    } as ViewStyle,

    visitBannerButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: '#FFF',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Visit Modal
    // ────────────────────────────────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    } as ViewStyle,

    visitModalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: utils.borderRadius.xl,
      borderTopRightRadius: utils.borderRadius.xl,
      maxHeight: '80%',
    } as ViewStyle,

    visitModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    visitModalTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    visitModalBody: {
      padding: utils.spacing[4],
      gap: utils.spacing[4],
    } as ViewStyle,

    visitCustomerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
      padding: utils.spacing[3],
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    visitCustomerName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    visitCustomerAddress: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    visitNoteContainer: {
      gap: utils.spacing[2],
    } as ViewStyle,

    visitNoteLabel: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,

    visitNoteInput: {
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      minHeight: 100,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: colors.border,
    } as TextStyle,

    visitModalFooter: {
      flexDirection: 'row',
      padding: utils.spacing[4],
      gap: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    visitModalButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    visitModalCancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    visitModalCancelText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textSecondary,
    } as TextStyle,

    visitModalStartButton: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    visitModalStartText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: '#FFF',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Overview Tab
    // ────────────────────────────────────────────────────────────────────────────
    overviewStatsRow: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    overviewStatCard: {
      flex: 1,
      alignItems: 'center',
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[1],
      backgroundColor: colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    } as ViewStyle,

    overviewStatValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    overviewStatLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Sections
    // ────────────────────────────────────────────────────────────────────────────
    section: {
      marginBottom: utils.spacing[4],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,
    sectionCard: {
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[4],
      padding: utils.spacing[4],
      borderRadius: utils.borderRadius.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border + '24',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,
    sectionHeaderIcon: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '12',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,
    sectionHeaderText: {
      flex: 1,
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,
    sectionSubtitle: {
      marginTop: utils.spacing[0.5],
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    detailSection: {
      backgroundColor: colors.surface,
      marginTop: utils.spacing[2],
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,
    detailSectionTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Info Rows
    // ────────────────────────────────────────────────────────────────────────────
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    infoLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    infoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
      flexShrink: 1,
      textAlign: 'right',
    } as TextStyle,

    detailInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,
    detailInfoLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,
    detailInfoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
      flex: 1,
      textAlign: 'right',
    } as TextStyle,
    optionalValue: {
      color: colors.textTertiary,
      fontStyle: 'italic',
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Contact Rows
    // ────────────────────────────────────────────────────────────────────────────
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    contactRowText: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
    } as TextStyle,

    detailContactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,
    detailContactIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary + '10',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,
    detailContactText: {
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Action Buttons
    // ────────────────────────────────────────────────────────────────────────────
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: utils.spacing[1.5],
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[1.5],
      paddingVertical: utils.spacing[2.5],
      borderRadius: utils.borderRadius.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,
    actionButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: '#FFF',
    } as TextStyle,

    actionButtonOutline: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[1.5],
      paddingVertical: utils.spacing[2.5],
      borderRadius: utils.borderRadius.lg,
      borderWidth: 1,
      backgroundColor: colors.surface,
    } as ViewStyle,

    actionButtonOutlineText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    detailActions: {
      flexDirection: 'row',
      padding: utils.spacing[4],
      gap: utils.spacing[2],
      backgroundColor: colors.surface,
      marginTop: utils.spacing[2],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,
    detailEditButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
    } as ViewStyle,
    detailEditButtonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
    detailShareButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,
    detailShareButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.primary,
    } as TextStyle,
    detailDeleteButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
      borderWidth: 1,
      borderColor: colors.error + '30',
    } as ViewStyle,
    detailDeleteButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.error,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Tags
    // ────────────────────────────────────────────────────────────────────────────
    detailTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
    } as ViewStyle,
    detailTag: {
      backgroundColor: colors.primary + '10',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary + '20',
    } as ViewStyle,
    detailTagText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

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

    // ────────────────────────────────────────────────────────────────────────────
    // Tab Content Container
    // ────────────────────────────────────────────────────────────────────────────
    tabContentContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[20],
    } as ViewStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Order Card Styles
    // ────────────────────────────────────────────────────────────────────────────
    orderCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,

    orderCardWithPending: {
      borderLeftWidth: 3,
      borderLeftColor: colors.warning,
    } as ViewStyle,

    orderCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    orderCardBody: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
    } as ViewStyle,
    saleTagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[3],
    } as ViewStyle,
    saleTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1.5],
      borderRadius: utils.borderRadius.full,
      borderWidth: 1,
    } as ViewStyle,
    saleTagText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    orderCardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: utils.spacing[1],
    } as ViewStyle,

    orderNumber: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    orderDate: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    orderStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    orderStatText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    orderAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    orderPendingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      marginBottom: utils.spacing[3],
      padding: utils.spacing[2],
      backgroundColor: colors.warning + '10',
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    orderPendingText: {
      fontSize: utils.fontSize.xs,
      color: colors.warning,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    orderViewDetails: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    orderStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.full,
      gap: utils.spacing[1],
    } as ViewStyle,

    orderStatusText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
    saleModalContent: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[4],
    } as ViewStyle,
    saleModalHero: {
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[4],
      borderWidth: 1,
      borderColor: colors.border + '24',
    } as ViewStyle,
    saleModalHeroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: utils.spacing[3],
      marginBottom: utils.spacing[3],
    } as ViewStyle,
    saleModalSaleId: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,
    saleModalDate: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[1],
    } as TextStyle,
    saleModalAmount: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.primary,
    } as TextStyle,
    saleModalSection: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.border + '20',
    } as ViewStyle,
    saleModalSectionTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[3],
    } as TextStyle,
    saleDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,
    saleDetailLabel: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,
    saleDetailValue: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: utils.getFontWeight('medium'),
      textAlign: 'right',
    } as TextStyle,
    saleMetricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[3],
    } as ViewStyle,
    saleMetricCard: {
      width: '47%',
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.border + '20',
    } as ViewStyle,
    saleMetricLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,
    saleMetricValue: {
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Empty States
    // ────────────────────────────────────────────────────────────────────────────
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[6],
    } as ViewStyle,
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
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    } as ViewStyle,
    emptyStateButtonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[12],
    } as ViewStyle,

    emptyStateIconContainer: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.border + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    emptyStateTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
      textAlign: 'center',
    } as TextStyle,

    emptyStateMessage: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    } as TextStyle,

    emptyStateButtonNew: {
      marginTop: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2.5],
      backgroundColor: colors.primary + '10',
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    emptyStateButtonTextNew: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    emptyTabContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: utils.spacing[8],
      paddingHorizontal: utils.spacing[6],
    } as ViewStyle,
    emptyTabTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      marginTop: utils.spacing[4],
    } as TextStyle,
    emptyTabText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: utils.spacing[2],
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Transaction Card
    // ────────────────────────────────────────────────────────────────────────────
    transactionCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,
    transactionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    transactionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,
    transactionInfo: { flex: 1 } as ViewStyle,
    transactionDescription: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,
    transactionDate: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    transactionReference: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    transactionAmountContainer: {
      alignItems: 'flex-end',
    } as ViewStyle,
    transactionAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,
    transactionAmountPositive: { color: colors.success } as TextStyle,
    transactionAmountNegative: { color: colors.error } as TextStyle,
    transactionStatusBadge: {
      paddingHorizontal: utils.spacing[1],
      paddingVertical: utils.spacing[0.5],
      borderRadius: utils.borderRadius.sm,
      marginTop: utils.spacing[0.5],
    } as ViewStyle,
    transactionStatusCompleted: { backgroundColor: colors.success + '20' } as ViewStyle,
    transactionStatusPending: { backgroundColor: colors.warning + '20' } as ViewStyle,
    transactionStatusFailed: { backgroundColor: colors.error + '20' } as ViewStyle,
    transactionStatusText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Contact Card
    // ────────────────────────────────────────────────────────────────────────────
    contactCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.border + '24',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
    } as ViewStyle,
    contactAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,
    contactInitials: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.primary,
    } as TextStyle,
    contactInfo: { flex: 1 } as ViewStyle,
    contactNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,
    contactName: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,
    contactRoleBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '10',
    } as ViewStyle,
    contactRoleBadgeText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
    contactRole: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    contactActions: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      marginTop: utils.spacing[2],
    } as ViewStyle,
    contactActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,
    contactActionText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Activity Item
    // ────────────────────────────────────────────────────────────────────────────
    activityItem: {
      flexDirection: 'row',
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,
    activityIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,
    activityContent: { flex: 1 } as ViewStyle,
    activityTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,
    activityDescription: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    activityDate: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    activityDuration: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    activityStatus: {
      marginTop: utils.spacing[1],
    } as ViewStyle,
    activityStatusText: {
      fontSize: utils.fontSize.xs,
      color: colors.success,
    } as TextStyle,
    activityAmount: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.primary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Loading Footer
    // ────────────────────────────────────────────────────────────────────────────
    footerLoader: {
      paddingVertical: utils.spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    loadingMoreFooter: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[4],
      gap: utils.spacing[2],
    } as ViewStyle,

    loadingMoreText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // End of List
    // ────────────────────────────────────────────────────────────────────────────
    endOfListContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[4],
      gap: utils.spacing[3],
    } as ViewStyle,

    endOfListLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.divider,
    } as ViewStyle,

    endOfListBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    endOfListText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // List Header
    // ────────────────────────────────────────────────────────────────────────────

    curatedSection: {
      marginBottom: 20,
    },
    curatedTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
      letterSpacing: 1,
    },
    curatedTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    curatedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary + '10',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    curatedTagText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },

    invoiceCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    invoiceNumber: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    invoiceDate: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    invoiceAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    invoiceCardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    invoiceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    invoiceStatusText: {
      fontSize: 11,
      color: colors.success,
    },
    orderCountTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    orderCountSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    orderStatsSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      backgroundColor: colors.primary + '10',
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    orderStatsText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    // ────────────────────────────────────────────────────────────────────────────
    // Order Header & Details (Legacy compatibility)
    // ────────────────────────────────────────────────────────────────────────────
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    orderInfo: {
      flex: 1,
    } as ViewStyle,

    orderNumberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    orderDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    orderDateDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.textTertiary,
    } as ViewStyle,

    orderRelativeTime: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    orderTypeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[1],
    } as ViewStyle,

    creditBadge: {
      backgroundColor: colors.warning + '10',
    } as ViewStyle,

    cashBadge: {
      backgroundColor: colors.success + '10',
    } as ViewStyle,

    orderTypeText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    orderStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: utils.spacing[3],
      marginBottom: utils.spacing[3],
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    statItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    statIconContainer: {
      width: 32,
      height: 32,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '10',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    // statDivider: {
    //   width: 1,
    //   height: 30,
    //   backgroundColor: colors.divider,
    // } as ViewStyle,

    // statLabel: {
    //   fontSize: utils.fontSize.xs,
    //   color: colors.textSecondary,
    //   marginBottom: utils.spacing[0.5],
    // } as TextStyle,

    // statValue: {
    //   fontSize: utils.fontSize.sm,
    //   fontWeight: utils.getFontWeight('semibold'),
    //   color: colors.textPrimary,
    // } as TextStyle,

    amountValue: {
      color: colors.primary,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    // Payment Info
    paymentInfo: {
      marginBottom: utils.spacing[3],
      padding: utils.spacing[2],
      backgroundColor: colors.warning + '05',
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,

    paymentInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    paymentInfoLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    paymentInfoRight: {
      alignItems: 'flex-end',
    } as ViewStyle,

    paymentIconCircle: {
      width: 28,
      height: 28,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    paymentInfoLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    paymentInfoAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    paymentInfoPaidLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    paymentInfoPaidAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.success,
    } as TextStyle,

    paymentProgressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    paymentProgress: {
      flex: 1,
      height: 4,
      backgroundColor: colors.divider,
      borderRadius: utils.borderRadius.full,
      overflow: 'hidden',
    } as ViewStyle,

    paymentProgressBar: {
      height: '100%',
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    paymentProgressText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // View Order Button
    viewOrderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: utils.spacing[1],
    } as ViewStyle,

    viewOrderText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // Status Badge
    statusBadge: {
      position: 'absolute',
      top: utils.spacing[3],
      right: utils.spacing[3],
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.full,
      gap: utils.spacing[1],
      zIndex: 1,
    } as ViewStyle,

    statusText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
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
    mt2: { marginTop: utils.spacing[2] } as ViewStyle,
    mb2: { marginBottom: utils.spacing[2] } as ViewStyle,
    mt4: { marginTop: utils.spacing[4] } as ViewStyle,
    mb4: { marginBottom: utils.spacing[4] } as ViewStyle,
    p4: { padding: utils.spacing[4] } as ViewStyle,
    px4: { paddingHorizontal: utils.spacing[4] } as ViewStyle,
    py4: { paddingVertical: utils.spacing[4] } as ViewStyle,
    // Add these to your useOutletDetailStyles return object

    transactionListHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
      paddingHorizontal: utils.spacing[1],
    } as ViewStyle,

    transactionListTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    transactionListSubtitle: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    transactionStatsBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      backgroundColor: colors.primary + '10',
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    transactionStatsText: {
      fontSize: utils.fontSize.xs,
      color: colors.primary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    transactionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    transactionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    transactionId: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    transactionSalesSection: {
      marginTop: utils.spacing[3],
      paddingTop: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    transactionSalesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    transactionSalesTitle: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,

    transactionSaleItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[1.5],
      paddingHorizontal: utils.spacing[2],
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    transactionSaleId: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
    } as TextStyle,

    transactionSaleAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    transactionRemarkSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: utils.spacing[2],
      marginTop: utils.spacing[3],
      paddingTop: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    transactionRemark: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: 20,
    } as TextStyle,

    transactionFooter: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
      marginTop: utils.spacing[3],
      paddingTop: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    } as ViewStyle,

    transactionMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    transactionMetaText: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
    } as TextStyle,

    loadMoreButton: {
      alignItems: 'center',
      paddingVertical: utils.spacing[3],
      marginVertical: utils.spacing[2],
    } as ViewStyle,

    loadMoreButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,
    // Add these to your useOutletDetailStyles return object (before the closing }))

    // Financial Grid
    financialGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
    } as ViewStyle,

    financialCard: {
      flex: 1,
      minWidth: '48%',
      backgroundColor: colors.background,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[3],
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    } as ViewStyle,

    financialLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: utils.spacing[1],
    } as TextStyle,

    financialValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    // Credit Utilization
    creditUtilization: {
      marginTop: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    creditUtilizationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as ViewStyle,

    creditUtilizationLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    creditUtilizationPercent: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,

    creditUtilizationBar: {
      height: 6,
      backgroundColor: colors.divider,
      borderRadius: 3,
      overflow: 'hidden',
    } as ViewStyle,

    creditUtilizationFill: {
      height: '100%',
      borderRadius: 3,
    } as ViewStyle,

    // Info Grid
    infoGrid: {
      gap: utils.spacing[2],
    } as ViewStyle,

    // Segmentation Badge
    segmentationBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    segmentationText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // Overview Container
    overviewContainer: {
      paddingBottom: utils.spacing[4],
      gap: utils.spacing[4],
    } as ViewStyle,
    // Add to your styles in useOutletDetailStyles.ts

    // Footer Buttons
    footerButtons: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderTopWidth: 1.5,
      borderTopColor: colors.divider,
    } as ViewStyle,
    footerButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    } as ViewStyle,
    footerButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFF',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
