import { createStyles } from "@/shared/theme/styles";
import { AppColors } from "@/shared/theme/colors";

// Extended AppColors with additional properties used in components
type ExtendedColors = AppColors & {
  surfaceVariant?: string;
  borderLight?: string;
  backgroundDisabled?: string;
  textDisabled?: string;
};

export const useFormFieldStyles = createStyles(
  (utils, colors: ExtendedColors) => {
    return {
      // Container
      container: {
        width: "100%",
        marginBottom: utils.spacing[4],
      },
      containerFullWidth: {
        width: "100%",
      },

      // Scroll Container (for forms with many fields)
      scrollContainer: {
        width: "100%",
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: utils.borderRadius.lg,
        backgroundColor: colors.surface,
        overflow: "hidden",
      },

      // ✅ KEEP SAME BORDER ON FOCUS (NO highlight)
      scrollContainerFocused: {
        borderWidth: 1.5,
        borderColor: colors.border,
      },

      scrollContainerError: {
        borderColor: colors.error,
      },

      scrollContentContainer: {
        paddingHorizontal: utils.spacing[4],
        paddingVertical: utils.spacing[2],
      },

      // Label
      labelContainer: {
        flexDirection: utils.rowDirection(),
        justifyContent: "space-between",
        marginBottom: utils.spacing[2],
      },

      label: {
        fontSize: utils.fontSize.sm,
        fontWeight: utils.getFontWeight("medium"),
        color: colors.textSecondary,
        textAlign: utils.textAlign(),
      },

      labelError: {
        color: colors.error,
      },

      requiredIndicator: {
        color: colors.error,

        // ✅ RTL safe spacing using utils.start()
        marginLeft: utils.start(utils.spacing[1], 0),
        marginRight: utils.start(0, utils.spacing[1]),
      },

      // Input wrapper
      inputWrapper: {
        flexDirection: utils.rowDirection(),
        alignItems: "center",
        borderRadius: utils.borderRadius.lg,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: "hidden",
      },

      // ✅ KEEP SAME BORDER ON FOCUS (NO highlight)
      inputWrapperFocused: {
        borderWidth: 1.5,
        borderColor: colors.border,
      },

      inputWrapperError: {
        borderColor: colors.error,
      },

      inputWrapperSuccess: {
        borderColor: colors.success,
      },

      inputWrapperWarning: {
        borderColor: colors.warning,
      },

      inputWrapperDisabled: {
        opacity: 0.6,
        backgroundColor: colors.backgroundDisabled || colors.surface,
      },

      // Variants
      variantFilled: {
        backgroundColor: colors.surfaceVariant || colors.card,
        borderColor: colors.borderLight || colors.divider,
      },

      variantOutlined: {
        backgroundColor: "transparent",
        borderWidth: 2,
      },

      // Scrollable variant
      variantScrollable: {
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        maxHeight: 120,
        minHeight: 40,
      },

      // Sizes
      sizeSmall: {
        height: 40,
        paddingHorizontal: utils.spacing[3],
      },
      sizeMedium: {
        height: 52,
        paddingHorizontal: utils.spacing[4],
      },
      sizeLarge: {
        height: 60,
        paddingHorizontal: utils.spacing[5],
      },

      // Icon
      iconContainer: {
        justifyContent: "center",
        alignItems: "center",
      },

      // ✅ RTL safe spacing
      iconLeft: {
        marginRight: utils.start(utils.spacing[3], 0),
        marginLeft: utils.start(0, utils.spacing[3]),
      },
      iconRight: {
        marginLeft: utils.start(utils.spacing[3], 0),
        marginRight: utils.start(0, utils.spacing[3]),
      },

      inputField: {
        flex: 1,
        fontSize: utils.fontSize.base,
        color: colors.textPrimary,
        paddingVertical: 0,
        textAlign: utils.textAlign(),
        writingDirection: utils.start("ltr", "rtl"),
      },

      inputSmall: {
        fontSize: utils.fontSize.sm,
      },

      inputLarge: {
        fontSize: utils.fontSize.lg,
      },

      // Scrollable input
      scrollableInput: {
        flex: 1,
        fontSize: utils.fontSize.base,
        color: colors.textPrimary,
        textAlignVertical: "top",
        minHeight: 40,
        textAlign: utils.textAlign(),
      },

      // Action button (eye icon)
      actionButton: {
        padding: utils.spacing[1],

        // ✅ RTL safe spacing
        marginLeft: utils.start(utils.spacing[2], 0),
        marginRight: utils.start(0, utils.spacing[2]),
      },

      // Helper text
      helperContainer: {
        marginTop: utils.spacing[1],
      },

      helperText: {
        fontSize: utils.fontSize.xs,
        color: colors.textTertiary,
        textAlign: utils.textAlign(),
      },

      errorText: {
        color: colors.error,
        textAlign: utils.textAlign(),
      },

      warningText: {
        color: colors.warning,
        textAlign: utils.textAlign(),
      },

      successText: {
        color: colors.success,
        textAlign: utils.textAlign(),
      },

      // Character counter
      characterCounter: {
        fontSize: utils.fontSize.xs,
        color: colors.textTertiary,

        // ✅ counter should stay opposite side
        textAlign: utils.start("right", "left"),
        marginTop: utils.spacing[1],
      },

      characterCounterError: {
        color: colors.error,
      },
    };
  },
);

export type FormFieldStyles = ReturnType<typeof useFormFieldStyles>;
