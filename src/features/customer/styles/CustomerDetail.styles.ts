// styles/CustomerDetail.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useCustomerDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Container
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // Loading
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

    // Header
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,
    headerButton: {
      padding: utils.spacing[2],
    } as ViewStyle,

    detailHeader: {
      flexDirection: 'row',
      padding: utils.spacing[4],
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
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
      marginBottom: utils.spacing[1],
    } as TextStyle,
    detailLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: utils.spacing[1],
    } as ViewStyle,
    detailLocation: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginLeft: utils.spacing[1],
      flex: 1,
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

    // Stats Cards
    detailStatsRow: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,
    detailStatCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[2],
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border + '20',
    } as ViewStyle,
    detailStatValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginTop: utils.spacing[1],
    } as TextStyle,
    detailStatLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      textAlign: 'center',
    } as TextStyle,

    // Sections
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

    // Tags
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

    // Contact Rows
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

    // Info Rows
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

    // Action Buttons
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

    // Empty State
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
      marginTop: utils.spacing[4],
    } as TextStyle,
    emptyStateText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      textAlign: 'center',
      marginVertical: utils.spacing[2],
    } as TextStyle,
    emptyStateButton: {
      paddingHorizontal: utils.spacing[6],
      paddingVertical: utils.spacing[3],
      backgroundColor: colors.primary,
      borderRadius: utils.borderRadius.lg,
    } as ViewStyle,
    emptyStateButtonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // Tab Bar
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
      padding: utils.spacing[4],
    } as ViewStyle,

    // Empty Tab
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

    // Order Card
    orderCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: utils.spacing[2],
    } as ViewStyle,
    orderNumber: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,
    orderDate: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,
    orderStatusBadge: {
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
    } as ViewStyle,
    orderStatusCompleted: { backgroundColor: colors.success + '20' } as ViewStyle,
    orderStatusPending: { backgroundColor: colors.warning + '20' } as ViewStyle,
    orderStatusCancelled: { backgroundColor: colors.error + '20' } as ViewStyle,
    orderStatusText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,
    orderDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: utils.spacing[2],
    } as ViewStyle,
    orderDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
    } as ViewStyle,
    orderDetailText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,
    orderAmount: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,
    viewOrderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      gap: utils.spacing[1],
    } as ViewStyle,
    viewOrderText: {
      fontSize: utils.fontSize.sm,
      color: colors.primary,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    // Transaction Card
    transactionCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
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
    transactionStatusText: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    // Contact Card
    contactCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      padding: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
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
    primaryBadge: {
      backgroundColor: colors.success + '20',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[0.5],
      borderRadius: utils.borderRadius.sm,
    } as ViewStyle,
    primaryBadgeText: {
      fontSize: utils.fontSize.xs,
      color: colors.success,
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

    // Activity Item
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
    activityAmount: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.primary,
      marginTop: utils.spacing[0.5],
    } as TextStyle,

    // Add these styles to your styles file
    actionButtonsContainer: {
      padding: utils.spacing[4],
      gap: utils.spacing[3],
      backgroundColor: colors.surface,
      marginTop: utils.spacing[2],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3.5],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
    } as ViewStyle,

    actionButtonPrimary: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,

    actionButtonPrimaryText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    actionButtonsRow: {
      flexDirection: 'row',
      gap: utils.spacing[3],
    } as ViewStyle,

    actionButtonSecondary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
      backgroundColor: colors.background,
      borderWidth: 1,
    } as ViewStyle,

    actionButtonShare: {
      borderColor: colors.primary + '30',
      backgroundColor: colors.primary + '05',
    } as ViewStyle,

    actionButtonDelete: {
      borderColor: colors.error + '30',
      backgroundColor: colors.error + '05',
    } as ViewStyle,

    actionButtonText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    // Utilities
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
  }));

  return styleGenerator(colors);
};
