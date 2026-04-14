// VanInventoryTopupDetailPage.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useVanInventoryTopupDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Container
    pageContainer: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // Header
    pageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[12],
      paddingBottom: utils.spacing[4],
      borderBottomWidth: 1,
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    pageTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
    } as TextStyle,

    placeholder: {
      width: 40,
    } as ViewStyle,

    // List Container
    listContainer: {
      paddingBottom: utils.spacing[4],
    } as ViewStyle,

    // Header Section
    headerSection: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[4],
    } as ViewStyle,

    idStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    idContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    topupId: {
      fontSize: utils.fontSize.lg,
      fontWeight: '700',
    } as TextStyle,

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: 12,
      gap: utils.spacing[0.5],
    } as ViewStyle,

    statusText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '600',
    } as TextStyle,

    // Info Card
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[4],
      gap: utils.spacing[3],
    } as ViewStyle,

    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as ViewStyle,

    infoItem: {
      flex: 1,
      flexDirection: 'row',
      gap: utils.spacing[2],
    } as ViewStyle,

    infoContent: {
      flex: 1,
    } as ViewStyle,

    infoLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    infoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    infoSub: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    // Summary Container
    summaryContainer: {
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    summaryTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      marginBottom: utils.spacing[2],
    } as TextStyle,

    summaryGrid: {
      flexDirection: 'row',
      gap: utils.spacing[3],
    } as ViewStyle,

    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: utils.spacing[3],
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,

    summaryValue: {
      fontSize: utils.fontSize.xl,
      fontWeight: '700',
    } as TextStyle,

    summaryLabel: {
      fontSize: utils.fontSize.xs,
      textAlign: 'center',
    } as TextStyle,

    // Remark
    remarkContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[4],
      gap: utils.spacing[2],
    } as ViewStyle,

    remarkText: {
      flex: 1,
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    // Timeline
    timelineContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: utils.spacing[3],
      marginBottom: utils.spacing[4],
      gap: utils.spacing[2],
    } as ViewStyle,

    timelineTitle: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
      marginBottom: utils.spacing[1],
    } as TextStyle,

    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    timelineContent: {
      flex: 1,
    } as ViewStyle,

    timelineLabel: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    timelineValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    } as TextStyle,

    // Tabs
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 2,
      gap: utils.spacing[1],
    } as ViewStyle,

    activeTab: {
      borderBottomWidth: 2,
    } as ViewStyle,

    tabText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    tabBadge: {
      paddingHorizontal: utils.spacing[1.5],
      paddingVertical: utils.spacing[0.5],
      borderRadius: 12,
      minWidth: 24,
      alignItems: 'center',
    } as ViewStyle,

    tabBadgeText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '600',
    } as TextStyle,

    // Line Item Card
    lineItemCard: {
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
    } as ViewStyle,

    lineItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: utils.spacing[2],
    } as ViewStyle,

    lineItemIndex: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    lineItemIndexText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '700',
    } as TextStyle,

    lineItemInfo: {
      flex: 1,
    } as ViewStyle,

    productName: {
      fontSize: utils.fontSize.md,
      fontWeight: '600',
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    productId: {
      fontSize: utils.fontSize.xs,
    } as TextStyle,

    lineItemDetails: {
      padding: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as ViewStyle,

    detailCell: {
      flex: 1,
    } as ViewStyle,

    detailLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    detailValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    detailSub: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    pricingCell: {
      flex: 1,
    } as ViewStyle,

    pricingLabel: {
      fontSize: utils.fontSize.xs,
      marginBottom: utils.spacing[0.5],
    } as TextStyle,

    pricingValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    } as TextStyle,

    itemRemarkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: utils.spacing[2],
      gap: utils.spacing[1],
    } as ViewStyle,

    itemRemarkText: {
      flex: 1,
      fontSize: utils.fontSize.xs,
      fontStyle: 'italic',
    } as TextStyle,

    // Action Buttons
    actionContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[4],
      gap: utils.spacing[3],
    } as ViewStyle,

    editButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderRadius: 10,
      borderWidth: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    editButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    submitButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderRadius: 10,
      gap: utils.spacing[2],
    } as ViewStyle,

    submitButtonText: {
      color: '#FFFFFF',
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    rejectButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderRadius: 10,
      borderWidth: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    rejectButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    approveButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderRadius: 10,
      gap: utils.spacing[2],
    } as ViewStyle,

    approveButtonText: {
      color: '#FFFFFF',
      fontSize: utils.fontSize.sm,
      fontWeight: '600',
    } as TextStyle,

    // Loading State
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    loadingText: {
      marginTop: utils.spacing[4],
      fontSize: utils.fontSize.sm,
    } as TextStyle,

    // Empty State
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[8],
      gap: utils.spacing[2],
    } as ViewStyle,

    emptyText: {
      fontSize: utils.fontSize.md,
    } as TextStyle,

    // Footer
    footerSpacer: {
      height: utils.spacing[4],
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
