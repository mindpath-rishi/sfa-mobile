// Topup.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useVanInventoryTopupStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    fullscreenContainer: {
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
      paddingTop: utils.spacing[8],
      paddingBottom: utils.spacing[6],
      paddingHorizontal: utils.spacing[5],
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      position: 'relative',
      overflow: 'hidden',
    } as ViewStyle,

    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
    } as ViewStyle,

    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    } as ViewStyle,

    heroTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: '#FFF',
      letterSpacing: -0.5,
    } as TextStyle,

    heroSubtitle: {
      fontSize: utils.fontSize.md,
      color: '#FFF',
      opacity: 0.85,
      marginTop: 6,
    } as TextStyle,

    createButton: {
      borderRadius: 30,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    } as ViewStyle,

    createButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2.5],
      gap: 6,
      borderRadius: 30,
    } as ViewStyle,

    createButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFF',
    } as TextStyle,

    // Search Section
    searchSection: {
      paddingHorizontal: utils.spacing[4],
      marginTop: -utils.spacing[5],
      marginBottom: utils.spacing[4],
      zIndex: 10,
    } as ViewStyle,

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3.5],
      borderRadius: 20,
      borderWidth: 1,
      gap: 12,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,

    searchInput: {
      flex: 1,
      fontSize: utils.fontSize.md,
      paddingVertical: 0,
      fontWeight: '400',
    } as TextStyle,

    searchResultText: {
      fontSize: utils.fontSize.xs,
      marginTop: utils.spacing[2],
      marginLeft: utils.spacing[1.5],
      fontWeight: '500',
    } as TextStyle,

    // Top-up Card - Enhanced
    topupCard: {
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      borderRadius: 20,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    } as ViewStyle,

    topupCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      backgroundColor: colors.surface,
    } as ViewStyle,

    topupCardLeft: {
      flex: 1,
    } as ViewStyle,

    topupCardId: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    } as TextStyle,

    topupCardDate: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    } as ViewStyle,

    topupCardDateText: {
      fontSize: 11,
    } as TextStyle,

    topupCardStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1.5],
      borderRadius: 20,
      gap: 6,
    } as ViewStyle,

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    } as ViewStyle,

    topupCardStatusText: {
      fontSize: 12,
      fontWeight: '600',
    } as TextStyle,

    // Info Grid - 2 Column Layout
    topupInfoGrid: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      gap: 12,
      backgroundColor: colors.surface,
    } as ViewStyle,

    topupInfoCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: utils.spacing[2.5],
      backgroundColor: colors.background,
      borderRadius: 12,
    } as ViewStyle,

    topupInfoIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    topupInfoContent: {
      flex: 1,
    } as ViewStyle,

    topupInfoLabel: {
      fontSize: 10,
      fontWeight: '500',
      marginBottom: 2,
    } as TextStyle,

    topupInfoValue: {
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    // Stats Row
    topupStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    topupStat: {
      alignItems: 'center',
      flex: 1,
    } as ViewStyle,

    topupStatValue: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
    } as TextStyle,

    topupStatLabel: {
      fontSize: 10,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,

    topupStatDivider: {
      width: 1,
      height: 30,
    } as ViewStyle,

    // Approved Row
    topupApprovedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2.5],
      gap: 6,
      backgroundColor: '#10B98108',
    } as ViewStyle,

    topupApprovedLabel: {
      fontSize: 11,
    } as TextStyle,

    topupApprovedValue: {
      fontSize: 11,
      fontWeight: '600',
    } as TextStyle,

    topupApprovedDate: {
      fontSize: 10,
    } as TextStyle,

    // Card Footer
    topupCardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2.5],
      gap: 6,
      borderTopWidth: 1,
    } as ViewStyle,

    topupCardFooterText: {
      fontSize: 10,
    } as TextStyle,

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: utils.spacing[5],
      maxHeight: '80%',
    } as ViewStyle,

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
    } as TextStyle,

    filterSection: {
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    statusFilterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    } as ViewStyle,

    statusFilterChip: {
      paddingHorizontal: utils.spacing[3.5],
      paddingVertical: utils.spacing[2],
      borderRadius: 20,
      borderWidth: 1,
    } as ViewStyle,

    statusFilterText: {
      fontSize: 13,
      fontWeight: '500',
    } as TextStyle,

    filterActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: utils.spacing[6],
    } as ViewStyle,

    clearFilterButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
    } as ViewStyle,

    clearFilterText: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    applyFilterButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 12,
      alignItems: 'center',
    } as ViewStyle,

    applyFilterText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFF',
    } as TextStyle,

    // Create Modal
    createModalContent: {
      margin: utils.spacing[5],
      borderRadius: 28,
      padding: utils.spacing[6],
      alignItems: 'center',
    } as ViewStyle,

    createModalHeader: {
      width: '100%',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
      position: 'relative',
    } as ViewStyle,

    createModalIcon: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    createModalClose: {
      position: 'absolute',
      right: 0,
      top: 0,
      padding: 4,
    } as ViewStyle,

    createModalTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: utils.spacing[2],
    } as TextStyle,

    createModalSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: utils.spacing[6],
    } as TextStyle,

    createModalButtons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    } as ViewStyle,

    createModalButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 14,
      alignItems: 'center',
    } as ViewStyle,

    createModalCancelButton: {
      borderWidth: 1,
    } as ViewStyle,

    createModalCancelText: {
      fontSize: 15,
      fontWeight: '600',
    } as TextStyle,

    createModalConfirmButton: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    createModalConfirmText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFF',
    } as TextStyle,

    // Loading States
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background + 'F2',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    } as ViewStyle,

    loadingCard: {
      backgroundColor: colors.surface,
      padding: utils.spacing[6],
      borderRadius: 24,
      alignItems: 'center',
      gap: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    } as ViewStyle,

    loadingText: {
      marginTop: 8,
      fontSize: utils.fontSize.md,
      fontWeight: '500',
    } as TextStyle,

    loadingFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[5],
      gap: 12,
    } as ViewStyle,

    loadingFooterText: {
      fontSize: utils.fontSize.sm,
      fontWeight: '500',
    } as TextStyle,

    // Empty State
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[16],
      gap: 12,
    } as ViewStyle,

    emptyIconContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    } as ViewStyle,

    emptyStateText: {
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,

    emptyStateSubtext: {
      fontSize: 13,
      textAlign: 'center',
      paddingHorizontal: 40,
    } as TextStyle,

    // Timeline Styles (for detail page)
    timelineContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[5],
    } as ViewStyle,

    timelineItem: {
      flexDirection: 'row',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    timelineLeft: {
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,

    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      backgroundColor: colors.surface,
    } as ViewStyle,

    timelineLine: {
      width: 2,
      flex: 1,
      marginTop: 4,
    } as ViewStyle,

    timelineContent: {
      flex: 1,
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    timelineTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    } as TextStyle,

    timelineDescription: {
      fontSize: 13,
      marginBottom: 4,
    } as TextStyle,

    timelineDate: {
      fontSize: 11,
    } as TextStyle,

    timelineStatus: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    } as TextStyle,

    // Detail Card
    detailCard: {
      margin: utils.spacing[4],
      padding: utils.spacing[5],
      borderRadius: 20,
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    } as ViewStyle,

    detailSection: {
      marginBottom: utils.spacing[5],
    } as ViewStyle,

    detailSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    detailLabel: {
      fontSize: 13,
    } as TextStyle,

    detailValue: {
      fontSize: 13,
      fontWeight: '500',
    } as TextStyle,

    productTable: {
      marginTop: utils.spacing[3],
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    productHeader: {
      flexDirection: 'row',
      padding: utils.spacing[3],
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    productHeaderText: {
      fontSize: 12,
      fontWeight: '600',
    } as TextStyle,

    productRow: {
      flexDirection: 'row',
      padding: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    productName: {
      flex: 2,
      fontSize: 13,
    } as TextStyle,

    productQty: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
