import { createStyles } from '@/shared/theme/styles';

export const createLoadSummaryModalStyles = (colors: any) =>
  createStyles((utils) => ({
    // Container
    container: {
      flex: 1,
    },

    // Stats Bar
    statsBar: {
      paddingVertical: utils.spacing[4],
      paddingHorizontal: utils.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: utils.spacing[3],
    },
    statCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[3],
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      borderWidth: 1,
    },
    statIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statValue: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
    },
    statLabel: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[0.5],
    },

    // Content Container
    contentContainer: {
      flex: 1,
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
    },

    // Section Header
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[3],
      paddingBottom: utils.spacing[2],
      borderBottomWidth: 1,
    },
    sectionTitle: {
      fontSize: utils.fontSize.base,
      fontWeight: '600',
    },
    totalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[1],
    },
    totalBadgeText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    },

    // List Container
    listContainer: {
      paddingBottom: utils.spacing[20],
    },

    // SKU Row
    skuRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
    },
    skuRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: utils.spacing[3],
    },
    skuIndex: {
      width: 28,
      marginRight: utils.spacing[2],
    },
    skuIndexText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
    },
    skuInfo: {
      flex: 1,
    },
    skuName: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
      marginBottom: utils.spacing[0.5],
    },
    skuCode: {
      fontSize: utils.fontSize.xs,
    },
    skuRowRight: {
      alignItems: 'flex-end',
    },
    stockInfo: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
    },
    stockText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    },
    outOfStockChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
    },
    outOfStockChipText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
    },

    // Footer
    footer: {
      borderTopWidth: 1,
    },
    footerSummary: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      gap: utils.spacing[4],
    },
    footerSummaryItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    },
    footerSummaryIcon: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerSummaryLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    },
    footerSummaryValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    },
    footerSummaryDivider: {
      width: 1,
    },
    footerActions: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      paddingBottom: utils.spacing[4],
      gap: utils.spacing[3],
    },
    cancelButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    },
    proceedButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    proceedButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      color: '#FFFFFF',
    },

    // Loading & Empty States
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: utils.spacing[20],
      gap: utils.spacing[4],
    },
    loadingText: {
      fontSize: utils.fontSize.sm,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: utils.spacing[20],
      gap: utils.spacing[3],
    },
    emptyStateText: {
      fontSize: utils.fontSize.base,
      fontWeight: '500',
      marginTop: utils.spacing[2],
    },
    emptyStateSubtext: {
      fontSize: utils.fontSize.sm,
      textAlign: 'center',
    },

    // Modal
    modalContainer: {
      flex: 1,
    },
    modalContent: {
      flex: 1,
      padding: 0,
    },

    // Utility
    disabled: {
      opacity: 0.6,
    },
    pressed: {
      opacity: 0.85,
    },
  }))(colors);