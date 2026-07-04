import { Dimensions, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { createStyles } from '@/shared/theme/styles';

const { width, height } = Dimensions.get('window');

export const useRouteScreenStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Add these styles to your existing styles
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    } as ViewStyle,

    loadingText: {
      marginTop: 16,
      fontSize: 14,
      textAlign: 'center',
    } as TextStyle,

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 48,
      minHeight: 400,
    } as ViewStyle,

    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    } as TextStyle,

    emptyStateText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 16,
      paddingHorizontal: 32,
    } as TextStyle,

    emptyStateButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    } as ViewStyle,

    emptyStateButtonText: {
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,

    // ============= CONTAINER =============
    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    // ============= HEADER SECTION =============
    header: {
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[6],
      borderBottomLeftRadius: utils.borderRadius.xl,
      borderBottomRightRadius: utils.borderRadius.xl,
    } as ViewStyle,

    progressContainer: {
      paddingHorizontal: utils.spacing[5],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressTitle: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'CC',
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    progressPercent: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
    } as TextStyle,

    progressBar: {
      height: 8,
      backgroundColor: colors.surface + '33',
      borderRadius: utils.borderRadius.full,
      overflow: 'hidden',
      marginBottom: utils.spacing[3],
    } as ViewStyle,

    progressFill: {
      height: '100%',
      backgroundColor: colors.warning,
      borderRadius: utils.borderRadius.full,
    } as ViewStyle,

    progressStats: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'B3',
    } as TextStyle,

    // ============= NEW: HEADER METRICS GRID =============
    headerMetricsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,

    headerMetricItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    headerMetricValue: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginTop: utils.spacing[1],
    } as TextStyle,

    headerMetricLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.surface + 'CC',
      marginTop: utils.spacing[1],
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    headerMetricDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.surface + '30',
      marginHorizontal: utils.spacing[2],
    } as ViewStyle,

    // ============= SEARCH & FILTER =============
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      borderWidth: 1,
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    searchInput: {
      flex: 1,
      fontSize: utils.fontSize.sm,
      color: colors.textPrimary,
      padding: 0,
    } as TextStyle,

    filterButton: {
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    filterGradient: {
      width: 44,
      height: 44,
      borderRadius: utils.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    } as ViewStyle,

    filterBadge: {
      position: 'absolute',
      top: 0,
      right: 2,
      backgroundColor: colors.error,
      borderRadius: utils.borderRadius.full,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    } as ViewStyle,

    filterBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: colors.surface,
    } as TextStyle,

    // ============= QUICK FILTER TABS =============
    quickFilterContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      backgroundColor: colors.background,
    } as ViewStyle,

    quickFilterTab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.lg,
      marginRight: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    quickFilterTabActive: {
      borderWidth: 0,
    } as ViewStyle,

    quickFilterLabel: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    quickFilterBadge: {
      paddingHorizontal: utils.spacing[1],
      paddingVertical: 2,
      borderRadius: 6,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    quickFilterCount: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    // ============= OUTLET LIST & CARDS =============
    outletList: {
      marginTop: utils.spacing[2],
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    expandableCard: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.lg,
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      overflow: 'hidden',
      borderWidth: 1,
      borderLeftWidth: 4,
      borderColor: colors.divider,
      borderLeftColor: colors.warning,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    } as ViewStyle,

    expandableCardCurrent: {
      borderLeftColor: colors.primary,
      borderWidth: 2,
      borderLeftWidth: 4,
      backgroundColor: colors.primary + '08',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    } as ViewStyle,

    expandableCardCompleted: {
      borderLeftColor: colors.success,
      opacity: 0.85,
    } as ViewStyle,

    expandableCardNearby: {
      borderLeftColor: colors.success,
      backgroundColor: colors.success + '05',
    } as ViewStyle,

    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: utils.spacing[3],
    } as ViewStyle,

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: utils.spacing[2],
    } as ViewStyle,

    statusIndicator: {
      width: 44,
      height: 44,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    statusNumber: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
    } as TextStyle,

    headerInfo: {
      flex: 1,
    } as ViewStyle,

    nameRow: {
      width: '100%',
      marginBottom: 6,
    } as ViewStyle,

    outletName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      flex: 1,
      flexShrink: 1,
      lineHeight: 20,
    } as TextStyle,

    nearbyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[1],
      paddingHorizontal: utils.spacing[2],
      paddingVertical: 2,
      backgroundColor: colors.success + '15',
      borderRadius: utils.borderRadius.sm,
    } as ViewStyle,

    nearbyBadgeText: {
      fontSize: utils.fontSize.xs,
      color: colors.success,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    headerIconsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    } as ViewStyle,

    headerIconButton: {
      padding: 4,
    } as ViewStyle,

    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      gap: 8,
    } as ViewStyle,

    cardBadgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      flex: 1,
    } as ViewStyle,

    stopAddress: {
      fontSize: 12,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    distanceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    } as ViewStyle,

    distanceText: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    headerRight: {
      alignItems: 'flex-end',
      gap: 4,
    } as ViewStyle,

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: utils.borderRadius.sm,
    } as ViewStyle,

    statusBadgeText: {
      fontSize: 11,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // ============= EXPANDED CONTENT =============
    expandedContent: {
      padding: utils.spacing[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.card,
      gap: utils.spacing[3],
    } as ViewStyle,

    orderCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    orderCardLeft: {
      flex: 1,
    } as ViewStyle,

    orderLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    } as TextStyle,

    orderValue: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
    } as TextStyle,

    orderCardRight: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    contactSection: {
      gap: 8,
    } as ViewStyle,

    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    contactLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 70,
    } as TextStyle,

    contactValue: {
      fontSize: 12,
      fontWeight: utils.getFontWeight('medium'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    actionButtonsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    } as ViewStyle,

    actionButton: {
      flex: 1,
    } as ViewStyle,

    clearFiltersText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.primary,
    } as TextStyle,

    // ============= MODALS =============
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.textPrimary + '80',
    } as ViewStyle,

    // Confirmation Modal
    confirmModal: {
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      padding: utils.spacing[6],
      width: width * 0.85,
      alignItems: 'center',
    } as ViewStyle,

    confirmIcon: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    confirmTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginBottom: utils.spacing[2],
    } as TextStyle,

    confirmText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[6],
      lineHeight: 20,
    } as TextStyle,

    confirmButtons: {
      flexDirection: 'row',
      gap: utils.spacing[3],
      width: '100%',
    } as ViewStyle,

    confirmCancel: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.divider,
      alignItems: 'center',
    } as ViewStyle,

    confirmCancelText: {
      fontSize: utils.fontSize.md,
      color: colors.textSecondary,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    confirmEnd: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: utils.borderRadius.md,
      backgroundColor: colors.error,
      alignItems: 'center',
    } as ViewStyle,

    confirmEndText: {
      fontSize: utils.fontSize.md,
      color: colors.surface,
      fontWeight: utils.getFontWeight('semibold'),
    } as TextStyle,

    // Detail Modal
    detailModal: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: colors.surface,
      borderRadius: utils.borderRadius.xl,
      overflow: 'hidden',
    } as ViewStyle,

    detailHeader: {
      padding: utils.spacing[8],
      alignItems: 'center',
      position: 'relative',
    } as ViewStyle,

    detailClose: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    detailAvatar: {
      width: 80,
      height: 80,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    detailName: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.surface,
      marginBottom: 4,
      textAlign: 'center',
    } as TextStyle,

    detailAddress: {
      fontSize: utils.fontSize.sm,
      color: colors.surface + 'E6',
      textAlign: 'center',
    } as TextStyle,

    detailBody: {
      padding: utils.spacing[6],
      gap: utils.spacing[4],
    } as ViewStyle,

    detailInfoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: utils.spacing[6],
      gap: utils.spacing[3],
    } as ViewStyle,

    detailInfoItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      padding: utils.spacing[4],
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
    } as ViewStyle,

    detailInfoLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
    } as TextStyle,

    detailInfoValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    modalButtonsRow: {
      flexDirection: 'row',
      gap: 12,
    } as ViewStyle,

    modalIconButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.background,
    } as ViewStyle,

    modalIconButtonText: {
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    // ============= MAPS =============
    fullScreenContainer: {
      flex: 1,
      backgroundColor: 'black',
      position: 'relative',
    } as ViewStyle,

    fullScreenMap: {
      flex: 1,
    } as ViewStyle,

    fullScreenMapPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenMapText: {
      marginTop: utils.spacing[4],
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.surface,
    } as TextStyle,

    fullScreenCurrentMarker: {
      width: 24,
      height: 24,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    fullScreenCurrentDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
    } as ViewStyle,

    fullScreenMarker: {
      width: 36,
      height: 36,
      borderRadius: utils.borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    } as ViewStyle,

    fullScreenMarkerCurrent: {
      backgroundColor: colors.primary,
      borderColor: colors.surface,
      width: 44,
      height: 44,
    } as ViewStyle,

    fullScreenMarkerCompleted: {
      borderColor: colors.success,
      opacity: 0.7,
    } as ViewStyle,

    fullScreenMarkerText: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.primary,
    } as TextStyle,

    // ============= FILTER CHIPS (Optional) =============
    filterChipsContainer: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      gap: utils.spacing[2],
    } as ViewStyle,

    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.full,
      gap: utils.spacing[1],
    } as ViewStyle,

    filterChipText: {
      fontSize: utils.fontSize.xs,
      fontWeight: '500',
    } as TextStyle,

    clearAllText: {
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('semibold'),
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
    } as TextStyle,

    // ============= PRIORITY BADGE =============
    priorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1],
      borderRadius: utils.borderRadius.sm,
      gap: utils.spacing[1],
    } as ViewStyle,

    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    } as ViewStyle,

    priorityText: {
      fontSize: 10,
      fontWeight: 'bold',
    } as TextStyle,

    // ============= NEXT OUTLET CARD =============
    nextOutletCard: {
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[3],
      marginTop: -utils.spacing[2],
      borderRadius: utils.borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,

    nextOutletGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: utils.spacing[3],
      gap: utils.spacing[3],
      borderWidth: 1,
      borderColor: colors.success + '30',
    } as ViewStyle,

    nextOutletContent: {
      flex: 1,
    } as ViewStyle,

    nextOutletLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.success,
      fontWeight: utils.getFontWeight('semibold'),
      textTransform: 'uppercase',
    } as TextStyle,

    nextOutletName: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginTop: 2,
    } as TextStyle,

    nextOutletDistance: {
      fontSize: utils.fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    // ============= INFO CARDS =============
    infoContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[6],
      paddingBottom: utils.spacing[8],
    } as ViewStyle,

    infoCard: {
      padding: utils.spacing[6],
      borderRadius: utils.borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    summaryHeader: {
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    infoCardTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('bold'),
      color: colors.textPrimary,
      marginTop: utils.spacing[2],
    } as TextStyle,

    summaryDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: utils.spacing[4],
    } as ViewStyle,

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    summaryLeft: {
      flex: 1,
    } as ViewStyle,

    summaryLabel: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    summaryValue: {
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('semibold'),
      color: colors.textPrimary,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
