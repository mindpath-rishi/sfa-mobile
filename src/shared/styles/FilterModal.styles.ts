import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useFilterModalStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    } as ViewStyle,

    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: '100%',
    } as ViewStyle,

    // Header
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    } as ViewStyle,

    modalHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    modalTitle: {
      fontSize: utils.fontSize.lg,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    headerBadge: {
      paddingHorizontal: utils.spacing[1.5],
      paddingVertical: 2,
      borderRadius: 12,
      minWidth: 24,
      alignItems: 'center',
    } as ViewStyle,

    headerBadgeText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Global Search
    globalSearchContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '30',
    } as ViewStyle,

    globalSearchInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      gap: utils.spacing[2],
    } as ViewStyle,

    globalSearchText: {
      flex: 1,
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      padding: 0,
    } as TextStyle,

    // Sections
    scrollContent: {
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    section: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
    } as ViewStyle,

    sectionHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textPrimary,
    } as TextStyle,

    sectionHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    activeBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    activeBadgeText: {
      color: 'white',
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Options
    optionsContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2.5],
      flex: 1,
    } as ViewStyle,

    optionLabel: {
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    optionCount: {
      fontSize: utils.fontSize.sm,
      color: colors.textTertiary,
    } as TextStyle,

    // Radio
    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    radioSelected: {
      borderColor: colors.primary,
    } as ViewStyle,

    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
    } as ViewStyle,

    // Checkbox
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    } as ViewStyle,

    // Toggle
    toggleRow: {
      paddingVertical: utils.spacing[2],
    } as ViewStyle,

    toggle: {
      width: 44,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.border,
      justifyContent: 'center',
      padding: 2,
    } as ViewStyle,

    toggleActive: {
      backgroundColor: colors.primary,
    } as ViewStyle,

    toggleCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'white',
    } as ViewStyle,

    toggleCircleActive: {
      transform: [{ translateX: 20 }],
    } as ViewStyle,

    // Range
    rangeContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    rangeInputs: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    rangeInputWrapper: {
      flex: 1,
    } as ViewStyle,

    rangeLabel: {
      fontSize: utils.fontSize.xs,
      color: colors.textTertiary,
      marginBottom: 4,
    } as TextStyle,

    rangeInput: {
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1.5],
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
    } as ViewStyle,

    rangeSeparator: {
      paddingHorizontal: utils.spacing[1],
    } as ViewStyle,

    rangeSeparatorText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    // Search
    searchContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
    } as ViewStyle,

    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      paddingHorizontal: utils.spacing[2.5],
      gap: utils.spacing[2],
    } as ViewStyle,

    searchInput: {
      flex: 1,
      paddingVertical: utils.spacing[2],
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
    } as TextStyle,

    // Footer
    modalFooter: {
      flexDirection: 'row',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      gap: utils.spacing[2],
      borderTopWidth: 1,
      borderTopColor: colors.border + '30',
    } as ViewStyle,

    footerButton: {
      flex: 1,
      paddingVertical: utils.spacing[3],
      borderRadius: 25,
      alignItems: 'center',
    } as ViewStyle,

    resetButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border + '30',
    } as ViewStyle,

    resetButtonText: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('500'),
    } as TextStyle,

    applyButton: {
      flex: 2,
    } as ViewStyle,

    applyButtonText: {
      color: 'white',
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,
  }));

  return styleGenerator(colors);
};
