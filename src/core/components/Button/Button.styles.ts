// src/core/components/Button/Button.styles.ts
import { StyleSheet } from 'react-native';
import { AppColors } from '@/shared/theme/colors';

export const createButtonStyles = (colors: AppColors) => {
  return StyleSheet.create({
    container: {
      marginVertical: 4,
    },
    fullWidth: {
      width: '100%',
    },
    autoWidth: {
      alignSelf: 'flex-start',
    },
    buttonWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      overflow: 'hidden',
    },
    iconWrapper: {
      position: 'absolute',
      zIndex: 1,
    },
    leftIconWrapper: {
      left: 12,
    },
    rightIconWrapper: {
      right: 12,
    },
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.border + '20',
      flexDirection: 'row',
      gap: 8,
    },
    disabled: {
      opacity: 0.5,
    },
    // Size styles
    smallButton: {
      height: 36,
    },
    mediumButton: {
      height: 44,
    },
    largeButton: {
      height: 52,
    },
    // Text styles for button (RN Button doesn't accept textStyle, so these are for loader/fallback)
    textSmall: {
      fontSize: 12,
    },
    textMedium: {
      fontSize: 14,
    },
    textLarge: {
      fontSize: 16,
    },
  });
};
