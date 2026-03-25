import { Platform } from "react-native";
import { createStyles } from "@/shared/theme/styles";
import { AppColors } from "@/shared/theme/colors";

// Extended AppColors with additional properties
type ExtendedColors = AppColors & {
  secondary?: string;
  backgroundDisabled?: string;
  textDisabled?: string;
};

export const useFormButtonStyles = createStyles((utils, colors: ExtendedColors) => ({
  // Base button
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: utils.borderRadius.lg,

    ...(Platform.OS === "web"
      ? { boxShadow: "0px 4px 10px rgba(0,0,0,0.12)" }
      : utils.shadow.sm),
  },

  // Sizes
  sizeSmall: {
    height: 36,
    paddingHorizontal: utils.spacing[3],
  },
  sizeMedium: {
    height: 52,
    paddingHorizontal: utils.spacing[6],
  },
  sizeLarge: {
    height: 60,
    paddingHorizontal: utils.spacing[8],
  },

  // Full width
  fullWidth: {
    width: "100%",
  },

  // Rounded
  rounded: {
    borderRadius: 100,
  },

  // Variants
  variantPrimary: {
    backgroundColor: colors.primary,
  },
  variantSecondary: {
    backgroundColor: colors.secondary || colors.info,
  },
  variantOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,

    ...(Platform.OS === "web"
      ? { boxShadow: "0px 2px 6px rgba(0,0,0,0.10)" }
      : utils.shadow.sm),
  },
  variantGhost: {
    backgroundColor: "transparent",
  },
  variantDanger: {
    backgroundColor: colors.error,
  },

  // Disabled states
  disabled: {
    opacity: 0.5,
  },
  disabledOutline: {
    borderColor: colors.border,
  },
  disabledGhost: {
    backgroundColor: colors.backgroundDisabled || colors.surface,
  },

  // Success state
  success: {
    backgroundColor: colors.success,
  },

  // Text styles
  buttonText: {
    fontSize: utils.fontSize.base,
    fontWeight: utils.getFontWeight("semibold"),
    textAlign: "center",
  },
  textSmall: {
    fontSize: utils.fontSize.sm,
  },
  textLarge: {
    fontSize: utils.fontSize.lg,
  },

  // Text colors per variant
  textPrimary: {
    color: colors.textInverse,
  },
  textSecondary: {
    color: colors.textInverse,
  },
  textOutline: {
    color: colors.primary,
  },
  textGhost: {
    color: colors.textPrimary,
  },
  textDanger: {
    color: colors.textInverse,
  },
  textDisabled: {
    color: colors.textDisabled || colors.textTertiary,
  },
  textSuccess: {
    color: colors.textInverse,
  },

  // Loading
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: utils.spacing[2],
  },

  // Icon
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconLeft: {
    marginRight: utils.spacing[2],
  },
  iconRight: {
    marginLeft: utils.spacing[2],
  },
}));

export type FormButtonStyles = ReturnType<typeof useFormButtonStyles>;
