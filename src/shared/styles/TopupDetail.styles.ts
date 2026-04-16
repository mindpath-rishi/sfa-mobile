// VanInventoryTopupDetailPage.styles.ts
import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '../hooks/useTheme';

export const useVanInventoryTopupDetailStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    // Add/Update these styles in your TopupDetail.styles.ts

    // Overview Content
    // Add to TopupDetail.styles.ts

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
      width: 32,
    } as ViewStyle,

    timelineDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    } as ViewStyle,

    timelineLine: {
      width: 2,
      flex: 1,
      marginTop: 4,
      minHeight: 40,
    } as ViewStyle,

    timelineContent: {
      flex: 1,
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    } as ViewStyle,

    timelineTitle: {
      fontSize: 15,
      fontWeight: '600',
    } as TextStyle,

    timelineTime: {
      fontSize: 11,
    } as TextStyle,

    timelineDescription: {
      fontSize: 13,
      marginBottom: 4,
      lineHeight: 18,
    } as TextStyle,

    timelineDate: {
      fontSize: 11,
    } as TextStyle,

    contentContainer: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    productsList: {
      paddingBottom: utils.spacing[5],
    } as ViewStyle,
    overviewContent: {
      paddingBottom: 24,
    } as ViewStyle,

    // Product Row Styles
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
    } as ViewStyle,

    productLeft: {
      marginRight: 12,
    } as ViewStyle,

    productIndex: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    productIndexText: {
      fontSize: 14,
      fontWeight: '700',
    } as TextStyle,

    productCenter: {
      flex: 1,
    } as ViewStyle,

    productName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    } as TextStyle,

    productDetails: {
      flexDirection: 'row',
      gap: 12,
    } as ViewStyle,

    productDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    productDetailText: {
      fontSize: 12,
    } as TextStyle,

    productRight: {
      alignItems: 'flex-end',
    } as ViewStyle,

    productValue: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    } as TextStyle,

    productWeight: {
      fontSize: 11,
    } as TextStyle,

    // Tab Styles
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      backgroundColor: colors.surface,
    } as ViewStyle,

    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
    } as ViewStyle,

    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    } as ViewStyle,

    tabText: {
      fontSize: 14,
      fontWeight: '500',
    } as TextStyle,
    approvedSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    } as ViewStyle,

    approvedCard: {
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: '#10B98120',
    } as ViewStyle,

    approvedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    } as ViewStyle,

    approvedIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,

    approvedTitle: {
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,

    approvedRow: {
      flexDirection: 'row',
      gap: 16,
    } as ViewStyle,

    approvedItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,

    approvedLabel: {
      fontSize: 10,
      marginBottom: 2,
    } as TextStyle,

    approvedValue: {
      fontSize: 13,
      fontWeight: '600',
    } as TextStyle,

    // Update infoCard to accommodate more items
    infoRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    } as ViewStyle,

    infoCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,
    heroHeader: {
      paddingTop: utils.spacing[4],
      paddingBottom: utils.spacing[5],
      paddingHorizontal: utils.spacing[5],
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    } as ViewStyle,

    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
    } as ViewStyle,

    heroPlaceholder: {
      width: 40,
    } as ViewStyle,

    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    } as ViewStyle,

    heroLeft: {
      flex: 1,
    } as ViewStyle,

    heroLabel: {
      fontSize: 13,
      color: '#FFF',
      opacity: 0.8,
      marginBottom: 6,
      letterSpacing: 0.5,
    } as TextStyle,

    heroSubtitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFF',
      letterSpacing: 0.3,
    } as TextStyle,

    heroStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 24,
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    } as ViewStyle,

    heroStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    } as ViewStyle,

    heroStatusText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFF',
      letterSpacing: 0.5,
    } as TextStyle,

    heroIdContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,

    container: {
      flex: 1,
      backgroundColor: colors.background,
    } as ViewStyle,

    heroTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFF',
    } as TextStyle,
    // Info Section
    infoSection: {
      padding: utils.spacing[4],
      gap: 12,
    } as ViewStyle,

    infoLabel: {
      fontSize: 11,
      color: colors.textSecondary,
    } as TextStyle,

    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    } as TextStyle,

    // Stats Section
    statsSection: {
      paddingHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[4],
    } as ViewStyle,

    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 12,
    } as TextStyle,

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    } as ViewStyle,

    statCard: {
      flex: 1,
      minWidth: '18%',
      backgroundColor: colors.surface,
      padding: utils.spacing[3],
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    statValue: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 6,
    } as TextStyle,

    statLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
    } as TextStyle,

    // Remark Card
    remarkCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: utils.spacing[4],
      marginBottom: utils.spacing[4],
      padding: utils.spacing[3],
      backgroundColor: colors.surface,
      borderRadius: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.divider,
    } as ViewStyle,

    remarkText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    } as TextStyle,

    tabBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    } as ViewStyle,

    tabBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    } as TextStyle,

    // Original Item Styles (Simple & Compact)
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
    } as ViewStyle,

    itemLeft: {
      width: 30,
    } as ViewStyle,

    itemIndex: {
      fontSize: 12,
    } as TextStyle,

    itemCenter: {
      flex: 1,
    } as ViewStyle,

    itemName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    } as TextStyle,

    itemDetails: {
      flexDirection: 'row',
      gap: 12,
    } as ViewStyle,

    itemDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    } as ViewStyle,

    itemDetailText: {
      fontSize: 11,
    } as TextStyle,

    itemRight: {
      alignItems: 'flex-end',
    } as ViewStyle,

    itemValue: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
    } as TextStyle,

    itemWeight: {
      fontSize: 10,
    } as TextStyle,

    // Loading & Empty States
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    } as ViewStyle,

    loadingText: {
      fontSize: 14,
    } as TextStyle,

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    } as ViewStyle,

    emptyText: {
      fontSize: 15,
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
