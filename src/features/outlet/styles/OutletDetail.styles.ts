// // styles/CustomerDetail.styles.ts
// import { ViewStyle, TextStyle, Platform } from 'react-native';
// import { createStyles } from '@/shared/theme/styles';
// import { useTheme } from '@/shared/hooks/useTheme';

// export const useOutletDetailStyles = () => {
//   const { colors } = useTheme();

//   const styleGenerator = createStyles((utils) => ({
//     // ────────────────────────────────────────────────────────────────────────────
//     // Container & Layout
//     // ────────────────────────────────────────────────────────────────────────────
//     // Add these to your useOutletDetailStyles function
//     mainScrollView: {
//       flex: 1,
//     } as ViewStyle,

//     mainScrollContent: {
//       flexGrow: 1,
//       paddingBottom: 20,
//     } as ViewStyle,

//     // Update or add these styles
//     footerSafeArea: {
//       backgroundColor: colors.surface,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,

//     fullWidthButtonContainer: {
//       paddingHorizontal: 16,
//       paddingVertical: 12,
//     } as ViewStyle,

//     // Remove tabContentWrapper and tabContent styles as they're no longer needed
//     // Update tabContentContainer
//     tabContentContainer: {
//       paddingHorizontal: utils.spacing[4],
//       paddingTop: utils.spacing[3],
//       paddingBottom: utils.spacing[4],
//     } as ViewStyle,
//     container: {
//       flex: 1,
//       backgroundColor: colors.background,
//       flexDirection: 'column',
//     } as ViewStyle,

//     // Wrapper for tab content to take remaining space
//     tabContentWrapper: {
//       flex: 1,
//       backgroundColor: colors.background,
//     } as ViewStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Loading State
//     // ────────────────────────────────────────────────────────────────────────────
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: colors.background,
//       gap: utils.spacing[3],
//     } as ViewStyle,
//     loadingText: {
//       marginTop: 12,
//       fontSize: 14,
//       color: colors.textSecondary,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Empty State
//     // ────────────────────────────────────────────────────────────────────────────
//     emptyState: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingHorizontal: utils.spacing[6],
//     } as ViewStyle,
//     emptyStateTitle: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: colors.textPrimary,
//       marginBottom: utils.spacing[2],
//       textAlign: 'center',
//     } as TextStyle,
//     emptyStateText: {
//       fontSize: 14,
//       color: colors.textSecondary,
//       textAlign: 'center',
//       marginVertical: utils.spacing[2],
//     } as TextStyle,
//     emptyStateButton: {
//       paddingHorizontal: utils.spacing[5],
//       paddingVertical: utils.spacing[2.5],
//       backgroundColor: colors.primary,
//       borderRadius: utils.borderRadius.lg,
//     } as ViewStyle,
//     emptyStateButtonText: {
//       color: colors.primaryContrast,
//       fontSize: 12,
//       fontWeight: '500',
//     } as TextStyle,

//     emptyTabContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingVertical: 48,
//       gap: 12,
//     } as ViewStyle,
//     emptyTabTitle: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: colors.textPrimary,
//       marginTop: 8,
//     } as TextStyle,
//     emptyTabText: {
//       fontSize: 14,
//       color: colors.textSecondary,
//       textAlign: 'center',
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Header - Reduced height
//     // ────────────────────────────────────────────────────────────────────────────
//     detailHeader: {
//       paddingHorizontal: utils.spacing[4],
//       paddingTop: utils.spacing[2],
//       paddingBottom: utils.spacing[1],
//       backgroundColor: colors.background,
//     } as ViewStyle,
//     detailHeroCard: {
//       backgroundColor: colors.surface,
//       borderRadius: utils.borderRadius.lg,
//       padding: utils.spacing[3],
//       borderWidth: 1,
//       borderColor: colors.primary + '15',
//     } as ViewStyle,
//     detailHeroCardCompact: {
//       paddingVertical: utils.spacing[2],
//       paddingHorizontal: utils.spacing[3],
//     } as ViewStyle,
//     detailHeroTop: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     } as ViewStyle,
//     detailAvatarWrap: {
//       width: 50,
//       height: 50,
//       borderRadius: utils.borderRadius.full,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: colors.primary + '10',
//       flexShrink: 0,
//     } as ViewStyle,
//     detailHeaderInfo: {
//       flex: 1,
//       marginLeft: utils.spacing[2],
//     } as ViewStyle,
//     detailTitleRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginBottom: utils.spacing[1],
//       gap: utils.spacing[2],
//     } as ViewStyle,
//     detailName: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: colors.textPrimary,
//       flex: 1,
//     } as TextStyle,
//     detailOwner: {
//       fontSize: 14,
//       color: colors.textSecondary,
//       marginBottom: utils.spacing[1],
//     } as TextStyle,
//     detailMetaRow: {
//       flexDirection: 'row',
//       flexWrap: 'wrap',
//       gap: utils.spacing[1],
//     } as ViewStyle,
//     detailMetaChip: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: utils.spacing[1],
//       paddingHorizontal: utils.spacing[1.5],
//       paddingVertical: utils.spacing[1],
//       backgroundColor: colors.background,
//       borderRadius: utils.borderRadius.full,
//       borderWidth: 1,
//       borderColor: colors.border + '40',
//     } as ViewStyle,
//     detailMetaChipText: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       fontWeight: '400',
//     } as TextStyle,
//     detailLocationCard: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: utils.spacing[2],
//       padding: utils.spacing[2],
//       borderRadius: utils.borderRadius.md,
//       backgroundColor: colors.primary + '05',
//     } as ViewStyle,
//     detailLocation: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       marginLeft: utils.spacing[1],
//       flex: 1,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Last Visit/Order Container
//     // ────────────────────────────────────────────────────────────────────────────
//     lastInfoContainer: {
//       paddingHorizontal: 16,
//       marginBottom: 8,
//       marginTop: 0,
//     } as ViewStyle,
//     lastInfoCard: {
//       flexDirection: 'row',
//       backgroundColor: colors.surface,
//       borderRadius: 10,
//       padding: 10,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,
//     lastInfoItem: {
//       flex: 1,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: 4,
//     } as ViewStyle,
//     lastInfoDivider: {
//       width: 1,
//       backgroundColor: colors.divider,
//       marginHorizontal: 8,
//     } as ViewStyle,
//     lastInfoLabel: {
//       fontSize: 11,
//       color: colors.textSecondary,
//     } as TextStyle,
//     lastInfoValue: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: colors.textPrimary,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Debug Geofence Container
//     // ────────────────────────────────────────────────────────────────────────────
//     debugGeofenceContainer: {
//       backgroundColor: colors.success,
//       paddingVertical: 6,
//       paddingHorizontal: 16,
//       alignItems: 'center',
//       marginHorizontal: 16,
//       marginBottom: 8,
//       borderRadius: 8,
//     } as ViewStyle,
//     debugGeofenceText: {
//       color: colors.primaryContrast,
//       fontSize: 11,
//       fontWeight: '500',
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Tab Bar
//     // ────────────────────────────────────────────────────────────────────────────
//     tabBar: {
//       backgroundColor: colors.surface,
//       borderBottomWidth: 1,
//       borderBottomColor: colors.divider,
//     } as ViewStyle,
//     tab: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingVertical: utils.spacing[2.5],
//       paddingHorizontal: utils.spacing[4],
//       gap: utils.spacing[2],
//       borderBottomWidth: 2,
//       borderBottomColor: 'transparent',
//     } as ViewStyle,
//     tabActive: {
//       borderBottomColor: colors.primary,
//     } as ViewStyle,
//     tabText: {
//       fontSize: 12,
//       color: colors.textSecondary,
//       fontWeight: '500',
//     } as TextStyle,
//     tabTextActive: {
//       color: colors.primary,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Tab Content
//     // ────────────────────────────────────────────────────────────────────────────
//     tabContent: {
//       flex: 1,
//     } as ViewStyle,
//     // tabContentContainer: {
//     //   paddingHorizontal: utils.spacing[4],
//     //   paddingTop: utils.spacing[3],
//     //   paddingBottom: utils.spacing[20],
//     // } as ViewStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Summary Tab Styles
//     // ────────────────────────────────────────────────────────────────────────────
//     summaryContainer: {
//       padding: 0,
//       gap: 16,
//     } as ViewStyle,
//     salesSectionCard: {
//       backgroundColor: colors.surface,
//       borderRadius: 16,
//       padding: 16,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.05,
//       shadowRadius: 8,
//       elevation: 2,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,
//     statsGrid: {
//       flexDirection: 'row',
//       gap: 12,
//       marginBottom: 16,
//     } as ViewStyle,
//     statCard: {
//       flex: 1,
//       backgroundColor: colors.background,
//       borderRadius: 12,
//       padding: 12,
//       alignItems: 'center',
//       gap: 8,
//     } as ViewStyle,
//     statValue: {
//       fontSize: 16,
//       fontWeight: '700',
//       color: colors.textPrimary,
//       textAlign: 'center',
//     } as TextStyle,
//     statLabel: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       textAlign: 'center',
//       fontWeight: '400',
//     } as TextStyle,
//     statSubLabel: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       marginTop: 2,
//     } as TextStyle,
//     statsDivider: {
//       height: 1,
//       backgroundColor: colors.divider,
//       marginVertical: 16,
//     } as ViewStyle,
//     statsSubtitle: {
//       fontSize: 11,
//       fontWeight: '600',
//       color: colors.textSecondary,
//       marginBottom: 12,
//     } as TextStyle,
//     statsGridSmall: {
//       flexDirection: 'row',
//       gap: 12,
//     } as ViewStyle,
//     statCardSmall: {
//       flex: 1,
//       backgroundColor: colors.background,
//       borderRadius: 12,
//       padding: 12,
//       alignItems: 'center',
//       gap: 6,
//     } as ViewStyle,
//     statValueSmall: {
//       fontSize: 16,
//       fontWeight: '700',
//       color: colors.textPrimary,
//       textAlign: 'center',
//     } as TextStyle,
//     statLabelSmall: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       textAlign: 'center',
//       fontWeight: '400',
//     } as TextStyle,
//     insightsCard: {
//       backgroundColor: colors.surface,
//       borderRadius: 16,
//       padding: 16,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,
//     insightsHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//       marginBottom: 12,
//     } as ViewStyle,
//     insightsTitle: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: colors.textPrimary,
//     } as TextStyle,
//     insightItem: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       gap: 10,
//       marginBottom: 10,
//       paddingVertical: 4,
//     } as ViewStyle,
//     insightDot: {
//       width: 6,
//       height: 6,
//       borderRadius: 3,
//       backgroundColor: colors.success,
//       marginTop: 6,
//     } as ViewStyle,
//     insightText: {
//       flex: 1,
//       fontSize: 14,
//       color: colors.textSecondary,
//       lineHeight: 18,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Sales Table Styles
//     // ────────────────────────────────────────────────────────────────────────────
//     salesTableContainer: {
//       backgroundColor: colors.surface,
//       borderRadius: 12,
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderColor: colors.divider,
//       marginBottom: 16,
//     } as ViewStyle,
//     salesTableHeader: {
//       flexDirection: 'row',
//       backgroundColor: colors.background,
//       borderBottomWidth: 1,
//       borderBottomColor: colors.divider,
//     } as ViewStyle,
//     salesTableRow: {
//       flexDirection: 'row',
//       borderBottomWidth: 1,
//       borderBottomColor: colors.divider,
//       backgroundColor: colors.surface,
//     } as ViewStyle,
//     salesTableCell: {
//       width: 70,
//       paddingVertical: 12,
//       paddingHorizontal: 8,
//       justifyContent: 'center',
//       alignItems: 'center',
//       borderRightWidth: 1,
//       borderRightColor: colors.divider,
//     } as ViewStyle,
//     salesTableCellCategory: {
//       width: 110,
//       alignItems: 'flex-start',
//       backgroundColor: colors.background,
//     } as ViewStyle,
//     salesTableCellTotal: {
//       width: 80,
//       backgroundColor: colors.background,
//       borderRightWidth: 0,
//     } as ViewStyle,
//     salesTableHeaderText: {
//       fontSize: 11,
//       fontWeight: '600',
//       color: colors.textSecondary,
//       textAlign: 'center',
//     } as TextStyle,
//     salesTableCategoryText: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: colors.textPrimary,
//       marginBottom: 2,
//     } as TextStyle,
//     salesTableUnitText: {
//       fontSize: 11,
//       color: colors.textSecondary,
//     } as TextStyle,
//     salesTableCellValue: {
//       fontSize: 14,
//       color: colors.textPrimary,
//       textAlign: 'center',
//     } as TextStyle,
//     salesTableCellValueHighlight: {
//       color: colors.success,
//       fontWeight: '700',
//     } as TextStyle,
//     salesTableCellTotalValue: {
//       fontSize: 16,
//       fontWeight: '700',
//       color: colors.textPrimary,
//       textAlign: 'center',
//     } as TextStyle,
//     salesTableSummary: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       padding: 12,
//       backgroundColor: colors.background,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,
//     salesTableSummaryText: {
//       fontSize: 11,
//       color: colors.textSecondary,
//     } as TextStyle,
//     salesTableSummaryTotal: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: colors.textPrimary,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Invoice Card Styles
//     // ────────────────────────────────────────────────────────────────────────────
//     invoiceCard: {
//       backgroundColor: colors.surface,
//       borderRadius: 10,
//       padding: 10,
//       marginBottom: 8,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,
//     invoiceTopRow: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       justifyContent: 'space-between',
//       gap: 12,
//     } as ViewStyle,
//     invoiceMeta: {
//       flex: 1,
//       minWidth: 0,
//     } as ViewStyle,
//     invoiceDate: {
//       fontSize: 10,
//       color: colors.textSecondary,
//       marginBottom: 2,
//     } as TextStyle,
//     invoiceNumber: {
//       fontSize: 13,
//       fontWeight: '500',
//       color: colors.textPrimary,
//     } as TextStyle,
//     invoiceAmountCol: {
//       alignItems: 'flex-end',
//       flexShrink: 0,
//     } as ViewStyle,
//     invoiceAmount: {
//       fontSize: 14,
//       fontWeight: '700',
//     } as TextStyle,
//     invoiceAmountLabel: {
//       fontSize: 10,
//       color: colors.textSecondary,
//       marginTop: 1,
//     } as TextStyle,
//     invoiceDetailGrid: {
//       flexDirection: 'row',
//       gap: 5,
//       marginTop: 8,
//       paddingTop: 8,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,
//     invoiceDetailItem: {
//       flex: 1,
//       backgroundColor: colors.background,
//       borderRadius: 8,
//       paddingVertical: 5,
//       paddingHorizontal: 6,
//     } as ViewStyle,
//     invoiceDetailLabel: {
//       fontSize: 10,
//       color: colors.textSecondary,
//       marginBottom: 1,
//     } as TextStyle,
//     invoiceDetailValue: {
//       fontSize: 12,
//       fontWeight: '500',
//       color: colors.textPrimary,
//     } as TextStyle,
//     invoiceDetailStatus: {
//       fontSize: 11,
//       fontWeight: '700',
//     } as TextStyle,
//     invoiceFooter: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       gap: 8,
//       marginTop: 8,
//     } as ViewStyle,
//     invoiceStatusBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 6,
//       paddingHorizontal: 8,
//       paddingVertical: 4,
//       borderRadius: 10,
//     } as ViewStyle,
//     invoiceStatusDot: {
//       width: 6,
//       height: 6,
//       borderRadius: 3,
//     } as ViewStyle,
//     invoiceStatusText: {
//       fontSize: 11,
//       fontWeight: '600',
//     } as TextStyle,
//     invoicePendingText: {
//       flex: 1,
//       textAlign: 'right',
//       fontSize: 11,
//       color: colors.textSecondary,
//       fontWeight: '400',
//     } as TextStyle,
//     invoiceModalOverlay: {
//       flex: 1,
//       justifyContent: 'center',
//       paddingHorizontal: 18,
//       backgroundColor: 'rgba(0,0,0,0.42)',
//     } as ViewStyle,
//     invoiceModalBackdrop: {
//       position: 'absolute',
//       top: 0,
//       right: 0,
//       bottom: 0,
//       left: 0,
//     } as ViewStyle,
//     invoiceModalContent: {
//       maxHeight: '78%',
//       backgroundColor: colors.surface,
//       borderRadius: 14,
//       padding: 14,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,
//     invoiceModalHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       gap: 12,
//       marginBottom: 12,
//     } as ViewStyle,
//     invoiceModalTitleBlock: {
//       flex: 1,
//       minWidth: 0,
//     } as ViewStyle,
//     invoiceModalTitle: {
//       fontSize: 17,
//       fontWeight: '700',
//       color: colors.textPrimary,
//     } as TextStyle,
//     invoiceModalSubtitle: {
//       marginTop: 2,
//       fontSize: 12,
//       color: colors.textSecondary,
//     } as TextStyle,
//     invoiceModalCloseButton: {
//       width: 34,
//       height: 34,
//       borderRadius: 17,
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: colors.background,
//     } as ViewStyle,
//     invoiceModalSummaryRow: {
//       flexDirection: 'row',
//       gap: 8,
//       marginBottom: 12,
//     } as ViewStyle,
//     invoiceModalSummaryItem: {
//       flex: 1,
//       backgroundColor: colors.background,
//       borderRadius: 9,
//       paddingHorizontal: 8,
//       paddingVertical: 8,
//     } as ViewStyle,
//     invoiceModalSummaryLabel: {
//       fontSize: 10,
//       color: colors.textSecondary,
//       marginBottom: 3,
//     } as TextStyle,
//     invoiceModalSummaryValue: {
//       fontSize: 13,
//       fontWeight: '700',
//       color: colors.textPrimary,
//     } as TextStyle,
//     invoiceProductsList: {
//       maxHeight: 360,
//     } as ViewStyle,
//     invoiceProductRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       gap: 10,
//       paddingVertical: 10,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,
//     invoiceProductInfo: {
//       flex: 1,
//       minWidth: 0,
//     } as ViewStyle,
//     invoiceProductName: {
//       fontSize: 13,
//       fontWeight: '600',
//       color: colors.textPrimary,
//       lineHeight: 18,
//     } as TextStyle,
//     invoiceProductCategory: {
//       marginTop: 2,
//       fontSize: 11,
//       color: colors.textSecondary,
//     } as TextStyle,
//     invoiceProductQtyBlock: {
//       alignItems: 'flex-end',
//       flexShrink: 0,
//       maxWidth: 110,
//     } as ViewStyle,
//     invoiceProductQty: {
//       fontSize: 12,
//       fontWeight: '700',
//       color: colors.textPrimary,
//     } as TextStyle,
//     invoiceProductAmount: {
//       marginTop: 2,
//       fontSize: 11,
//       color: colors.textSecondary,
//     } as TextStyle,
//     invoiceNoProducts: {
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingVertical: 28,
//       paddingHorizontal: 12,
//     } as ViewStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Visit Card Styles
//     // ────────────────────────────────────────────────────────────────────────────
//     visitCard: {
//       backgroundColor: colors.surface,
//       borderRadius: 14,
//       padding: 16,
//       marginBottom: 12,
//       borderWidth: 1,
//       borderColor: colors.divider,
//     } as ViewStyle,
//     visitCardHeader: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 8,
//     } as ViewStyle,
//     visitStatusDot: {
//       width: 8,
//       height: 8,
//       borderRadius: 4,
//     } as ViewStyle,
//     visitDate: {
//       fontSize: 14,
//       fontWeight: '500',
//       color: colors.textPrimary,
//       flex: 1,
//     } as TextStyle,
//     visitDurationBadge: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 4,
//       paddingHorizontal: 8,
//       paddingVertical: 4,
//       borderRadius: 12,
//     } as ViewStyle,
//     visitDuration: {
//       fontSize: 11,
//       color: colors.primary,
//     } as TextStyle,
//     visitDetailGrid: {
//       flexDirection: 'row',
//       gap: 6,
//       marginTop: 10,
//       paddingTop: 10,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,
//     visitDetailItem: {
//       flex: 1,
//       backgroundColor: colors.background,
//       borderRadius: 8,
//       paddingVertical: 6,
//       paddingHorizontal: 8,
//     } as ViewStyle,
//     visitDetailLabel: {
//       fontSize: 10,
//       color: colors.textSecondary,
//       marginBottom: 2,
//     } as TextStyle,
//     visitDetailValue: {
//       fontSize: 12,
//       fontWeight: '600',
//       color: colors.textPrimary,
//     } as TextStyle,
//     visitDetailStatus: {
//       fontSize: 11,
//       fontWeight: '700',
//     } as TextStyle,
//     visitNote: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 6,
//       marginTop: 8,
//       paddingTop: 8,
//       borderTopWidth: 1,
//       borderTopColor: colors.divider,
//     } as ViewStyle,
//     visitNoteText: {
//       fontSize: 11,
//       color: colors.textSecondary,
//       flex: 1,
//     } as TextStyle,
//     visitTimelineList: {
//       paddingTop: 2,
//     } as ViewStyle,
//     visitTimelineItem: {
//       flexDirection: 'row',
//       alignItems: 'flex-start',
//       gap: 10,
//     } as ViewStyle,
//     visitTimelineMarkerWrap: {
//       alignItems: 'center',
//       width: 34,
//     } as ViewStyle,
//     visitTimelineMarker: {
//       width: 30,
//       height: 30,
//       borderRadius: 15,
//       alignItems: 'center',
//       justifyContent: 'center',
//     } as ViewStyle,
//     visitTimelineLine: {
//       width: 1,
//       minHeight: 34,
//       flex: 1,
//       backgroundColor: colors.divider,
//     } as ViewStyle,
//     visitTimelineContent: {
//       flex: 1,
//       minWidth: 0,
//       paddingBottom: 16,
//     } as ViewStyle,
//     visitTimelineTitleRow: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       gap: 8,
//     } as ViewStyle,
//     visitTimelineTitle: {
//       flex: 1,
//       fontSize: 14,
//       fontWeight: '700',
//       color: colors.textPrimary,
//     } as TextStyle,
//     visitTimelineTime: {
//       fontSize: 11,
//       fontWeight: '600',
//       color: colors.textSecondary,
//     } as TextStyle,
//     visitTimelineSubtitle: {
//       marginTop: 3,
//       fontSize: 12,
//       lineHeight: 17,
//       color: colors.textSecondary,
//     } as TextStyle,
//     listHeader: {
//       marginBottom: 16,
//     } as ViewStyle,
//     listHeaderTitle: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: colors.textPrimary,
//     } as TextStyle,
//     listHeaderSubtitle: {
//       fontSize: 12,
//       color: colors.textSecondary,
//       marginTop: 2,
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Footer Button Styles
//     // ────────────────────────────────────────────────────────────────────────────
//     // fullWidthButtonContainer: {
//     //   backgroundColor: colors.surface,
//     //   borderTopWidth: 1,
//     //   borderTopColor: colors.divider,
//     //   paddingHorizontal: 16,
//     //   paddingVertical: 12,
//     //   paddingBottom: Platform.OS === 'ios' ? 20 : 12,
//     // } as ViewStyle,
//     fullWidthButton: {
//       borderRadius: 12,
//       paddingVertical: 14,
//       paddingHorizontal: 20,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 3,
//     } as ViewStyle,
//     fullWidthButtonContent: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     } as ViewStyle,
//     fullWidthButtonTextContainer: {
//       flex: 1,
//       marginLeft: 12,
//     } as ViewStyle,
//     fullWidthButtonTitle: {
//       color: colors.primaryContrast,
//       fontSize: 16,
//       fontWeight: '600',
//     } as TextStyle,
//     fullWidthButtonSubtitle: {
//       color: colors.primaryContrast,
//       fontSize: 12,
//       opacity: 0.9,
//       marginTop: 2,
//     } as TextStyle,
//     fullWidthAutoStartIndicator: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       paddingVertical: 14,
//       borderRadius: 12,
//       gap: 12,
//     } as ViewStyle,
//     autoStartText: {
//       fontSize: 14,
//       fontWeight: '500',
//     } as TextStyle,

//     // ────────────────────────────────────────────────────────────────────────────
//     // Utilities
//     // ────────────────────────────────────────────────────────────────────────────
//     divider: {
//       height: 1,
//       backgroundColor: colors.divider,
//     } as ViewStyle,
//     row: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     } as ViewStyle,

//     // footerSafeArea: {
//     //   backgroundColor: colors.surface,
//     //   borderTopWidth: 1,
//     //   borderTopColor: colors.divider,
//     // } as ViewStyle,

//     // fullWidthButtonContainer: {
//     //   paddingHorizontal: 16,
//     //   paddingVertical: 12,
//     //   // paddingBottom removed - now handled by SafeAreaView
//     // } as ViewStyle,
//   }));

//   return styleGenerator(colors);
// };


// styles/OutletDetail.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // ── Container ────────────────────────────────────────────────────────────
    container: {
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: 'column',
    } as ViewStyle,

    mainScrollView: {
      flex: 1,
    } as ViewStyle,

    mainScrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    } as ViewStyle,

    // ── Empty / loading shared ────────────────────────────────────────────────
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[8],
    } as ViewStyle,

    emptyTabContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 10,
    } as ViewStyle,

    emptyTabTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    emptyTabText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    emptyStateTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: utils.spacing[2],
    } as TextStyle,

    emptyStateText: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: utils.spacing[3],
    } as TextStyle,

    emptyStateButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: utils.spacing[6],
      paddingVertical: utils.spacing[2.5],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    emptyStateButtonText: {
      color: colors.primaryContrast,
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    // ── Tab bar ───────────────────────────────────────────────────────────────
    // (used by LoadingState skeleton only — live tab bar is inline)
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      gap: 5,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    } as ViewStyle,

    tabActive: {
      borderBottomColor: colors.primary,
    } as ViewStyle,

    tabText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    tabTextActive: {
      fontWeight: '700',
      color: colors.primary,
    } as TextStyle,

    // ── Tab content ───────────────────────────────────────────────────────────
    tabContentContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingTop: utils.spacing[3],
      paddingBottom: utils.spacing[6],
    } as ViewStyle,

    // ── Summary: stat cards ───────────────────────────────────────────────────
    summaryContainer: {
      gap: 12,
    } as ViewStyle,

    salesSectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    // Unified stat card (replaces statCard + statCardSmall)
    statCard: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 7,
    } as ViewStyle,

    statValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    statLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '400',
    } as TextStyle,

    statSubLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    statsGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    } as ViewStyle,

    statsGridSmall: {
      flexDirection: 'row',
      gap: 10,
    } as ViewStyle,

    statsDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 14,
    } as ViewStyle,

    statsSubtitle: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 10,
    } as TextStyle,

    // ── Insights card ─────────────────────────────────────────────────────────
    insightsCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    insightsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    } as ViewStyle,

    insightsTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 5,
    } as ViewStyle,

    insightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 6,
    } as ViewStyle,

    insightText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    } as TextStyle,

    // ── Sales table ───────────────────────────────────────────────────────────
    salesTableContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    salesTableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    salesTableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    salesTableCell: {
      width: 70,
      paddingVertical: 12,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.border,
    } as ViewStyle,

    salesTableCellCategory: {
      width: 120,
      alignItems: 'flex-start',
      backgroundColor: colors.background,
    } as ViewStyle,

    salesTableCellTotal: {
      width: 80,
      backgroundColor: colors.background,
      borderRightWidth: 0,
    } as ViewStyle,

    salesTableHeaderText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      letterSpacing: 0.4,
      textAlign: 'center',
    } as TextStyle,

    salesTableCategoryText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    salesTableUnitText: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    salesTableCellValue: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    salesTableCellValueHighlight: {
      color: colors.success,
      fontWeight: '700',
    } as TextStyle,

    salesTableCellTotalValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
    } as TextStyle,

    // ── Invoice cards ─────────────────────────────────────────────────────────
    invoiceCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    } as ViewStyle,

    invoiceTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    } as ViewStyle,

    invoiceMeta: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    invoiceDate: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceNumber: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      marginTop: 3,
    } as TextStyle,

    invoiceAmountCol: {
      alignItems: 'flex-end',
      flexShrink: 0,
    } as ViewStyle,

    invoiceAmount: {
      fontSize: 16,
      fontWeight: '700',
    } as TextStyle,

    invoiceAmountLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    invoiceDetailGrid: {
      flexDirection: 'row',
      gap: 7,
      marginTop: 12,
    } as ViewStyle,

    invoiceDetailItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
    } as ViewStyle,

    invoiceDetailLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 3,
    } as TextStyle,

    invoiceDetailValue: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 10,
    } as ViewStyle,

    invoiceStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    } as ViewStyle,

    invoiceStatusText: {
      fontSize: 10,
      fontWeight: '700',
    } as TextStyle,

    invoicePendingText: {
      fontSize: 11,
      color: colors.warning,
    } as TextStyle,

    // ── Visit cards ───────────────────────────────────────────────────────────
    visitCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      borderLeftWidth: 3,
    } as ViewStyle,

    visitCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
      fontWeight: '500',
    } as TextStyle,

    visitNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    visitNoteText: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 17,
    } as TextStyle,

    // ── Visit timeline (bottom sheet) ─────────────────────────────────────────
    visitTimelineList: {
      paddingTop: 4,
    } as ViewStyle,

    visitTimelineItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    } as ViewStyle,

    visitTimelineMarkerWrap: {
      alignItems: 'center',
      width: 32,
    } as ViewStyle,

    visitTimelineMarker: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    visitTimelineLine: {
      width: 1,
      flex: 1,
      minHeight: 24,
      backgroundColor: colors.border,
      marginTop: 4,
    } as ViewStyle,

    visitTimelineContent: {
      flex: 1,
      minWidth: 0,
      paddingBottom: 16,
    } as ViewStyle,

    visitTimelineTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    } as ViewStyle,

    visitTimelineTitle: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    visitTimelineTime: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    } as TextStyle,

    visitTimelineSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSecondary,
    } as TextStyle,

    // ── List header ───────────────────────────────────────────────────────────
    listHeader: {
      marginBottom: 14,
    } as ViewStyle,

    listHeaderTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    listHeaderSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    } as TextStyle,

    // ── Footer button ─────────────────────────────────────────────────────────
    footerSafeArea: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    fullWidthButtonContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    } as ViewStyle,

    fullWidthButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 7,
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
      color: colors.primaryContrast,
      fontSize: 15,
      fontWeight: '700',
    } as TextStyle,

    fullWidthButtonSubtitle: {
      color: colors.primaryContrast,
      fontSize: 11,
      opacity: 0.75,
      marginTop: 1,
    } as TextStyle,

    fullWidthAutoStartIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 10,
    } as ViewStyle,

    autoStartText: {
      fontSize: 13,
      fontWeight: '500',
    } as TextStyle,

    // ── Utilities ─────────────────────────────────────────────────────────────
    divider: {
      height: 1,
      backgroundColor: colors.border,
    } as ViewStyle,

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    // ── Last visit / order strip ──────────────────────────────────────────────
    lastInfoContainer: {
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 8,
    } as ViewStyle,

    lastInfoCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    lastInfoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    lastInfoDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    } as ViewStyle,

    lastInfoLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textSecondary,
    } as TextStyle,

    lastInfoValue: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textPrimary,
      marginTop: 1,
    } as TextStyle,

    // ── Dev geofence pill ─────────────────────────────────────────────────────
    debugGeofenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    } as ViewStyle,

    debugGeofenceText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.primaryContrast,
    } as TextStyle,

    // ── Header hero ───────────────────────────────────────────────────────────
    detailHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
    } as ViewStyle,

    detailHeroCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    } as ViewStyle,

    detailHeroCardCompact: {
      paddingVertical: 12,
    } as ViewStyle,

    detailHeroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    } as ViewStyle,

    detailAvatarWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary + '12',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    } as ViewStyle,

    detailHeaderInfo: {
      flex: 1,
    } as ViewStyle,

    detailTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: 3,
    } as ViewStyle,

    detailName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    detailOwner: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
    } as TextStyle,

    detailMetaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    } as ViewStyle,

    detailMetaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.primary + '0D',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary + '1E',
    } as ViewStyle,

    detailMetaChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.primary,
    } as TextStyle,

    detailLocationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    detailLocation: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    } as TextStyle,

    // ── Modal shared (kept for any legacy usage) ──────────────────────────────
    invoiceModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    } as ViewStyle,

    invoiceModalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    invoiceModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    } as ViewStyle,

    invoiceModalTitleBlock: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    invoiceModalTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceModalSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceModalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    } as ViewStyle,

    invoiceModalSummaryRow: {
      flexDirection: 'row',
      gap: 8,
      padding: 16,
    } as ViewStyle,

    invoiceModalSummaryItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 10,
    } as ViewStyle,

    invoiceModalSummaryLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 4,
    } as TextStyle,

    invoiceModalSummaryValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceProductsList: {
      maxHeight: 340,
    } as ViewStyle,

    invoiceProductRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    } as ViewStyle,

    invoiceProductInfo: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,

    invoiceProductName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 18,
    } as TextStyle,

    invoiceProductCategory: {
      marginTop: 2,
      fontSize: 10,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceProductQtyBlock: {
      alignItems: 'flex-end',
      flexShrink: 0,
      maxWidth: 110,
    } as ViewStyle,

    invoiceProductQty: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textPrimary,
    } as TextStyle,

    invoiceProductAmount: {
      marginTop: 2,
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    invoiceNoProducts: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 28,
    } as ViewStyle,

    invoiceBackdrop: {
      position: 'absolute',
      top: 0, right: 0, bottom: 0, left: 0,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};