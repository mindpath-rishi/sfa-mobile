import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useFilterModalStyles = () => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils) => ({
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.background,
    } as ViewStyle,

    // Header
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[4],
      paddingVertical: utils.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    modalHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    modalTitle: {
      fontSize: utils.fontSize.xl,
      fontWeight: utils.getFontWeight('600'),
      color: colors.textPrimary,
    } as TextStyle,

    headerBadge: {
      paddingHorizontal: utils.spacing[1.5],
      paddingVertical: 2,
      borderRadius: 16,
      minWidth: 24,
      alignItems: 'center',
      justifyContent: 'center',
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
      borderBottomColor: colors.border + '20',
    } as ViewStyle,

    globalSearchInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: utils.spacing[3],
      paddingVertical: utils.spacing[2],
      borderWidth: 1,
      borderRadius: utils.borderRadius.lg,
      gap: utils.spacing[2],
      backgroundColor: colors.surface,
    } as ViewStyle,

    globalSearchText: {
      flex: 1,
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
      padding: 0,
    } as TextStyle,

    // Scroll Content
    scrollContent: {
      paddingBottom: utils.spacing[2],
    } as ViewStyle,

    // Sections
    section: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border + '15',
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
      flex: 1,
    } as ViewStyle,

    sectionTitle: {
      fontSize: utils.fontSize.md,
      fontWeight: utils.getFontWeight('500'),
      color: colors.textPrimary,
      flex: 1,
    } as TextStyle,

    sectionHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: utils.spacing[2],
    } as ViewStyle,

    activeBadge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    activeBadgeText: {
      color: 'white',
      fontSize: utils.fontSize.xs,
      fontWeight: utils.getFontWeight('600'),
    } as TextStyle,

    // Options Container
    optionsContainer: {
      paddingHorizontal: utils.spacing[4],
      paddingBottom: utils.spacing[3],
      gap: utils.spacing[1],
    } as ViewStyle,

    optionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[1],
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

    // Radio Button
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
      borderRadius: 6,
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
      paddingHorizontal: utils.spacing[1],
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

    // Range Inputs
    rangeContainer: {
      paddingHorizontal: utils.spacing[1],
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

    dateInput: {
      minHeight: 42,
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      paddingHorizontal: utils.spacing[2],
      paddingVertical: utils.spacing[1.5],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: utils.spacing[1],
      backgroundColor: colors.surface,
    } as ViewStyle,

    dateInputText: {
      flex: 1,
      fontSize: utils.fontSize.md,
      color: colors.textPrimary,
    } as TextStyle,

    rangeSeparator: {
      paddingHorizontal: utils.spacing[1],
    } as ViewStyle,

    rangeSeparatorText: {
      fontSize: utils.fontSize.sm,
      color: colors.textSecondary,
    } as TextStyle,

    // Search Input
    searchContainer: {
      paddingHorizontal: utils.spacing[1],
    } as ViewStyle,

    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: utils.borderRadius.lg,
      paddingHorizontal: utils.spacing[2.5],
      gap: utils.spacing[2],
      backgroundColor: colors.surface,
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
      borderTopColor: colors.border + '20',
    } as ViewStyle,

    footerResetButton: {
      flex: 1,
      height: 44,
      borderRadius: 22,
    } as ViewStyle,

    footerApplyButton: {
      flex: 1,
      height: 44,
      borderRadius: 22,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
