// src/core/components/Button/Button.styles.ts
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const createButtonStyles = (colors: any) => {
  const baseButton: ViewStyle = {
    borderRadius: 12,
    overflow: 'hidden',
  };

  const baseText: TextStyle = {
    fontWeight: '600',
    textAlign: 'center',
  };

  return StyleSheet.create({
    container: {
      ...baseButton,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressable: {
      // transition: 'all 0.2s ease-in-out', // Only works on web
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.6,
    },

    // Size variants
    smallButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      minHeight: 32,
    },
    mediumButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 44,
    },
    largeButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      minHeight: 56,
    },

    // Text sizes
    smallText: {
      fontSize: 12,
      ...baseText,
    },
    mediumText: {
      fontSize: 14,
      ...baseText,
    },
    largeText: {
      fontSize: 16,
      ...baseText,
    },

    // Text with icon
    textWithIcon: {
      marginHorizontal: 4,
    },

    // Layout
    fullWidth: {
      width: '100%',
    },
    autoWidth: {
      alignSelf: 'flex-start',
    },

    // Icons
    icon: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    leftIcon: {
      marginRight: 8,
    },
    rightIcon: {
      marginLeft: 8,
    },

    // Icon only button
    iconOnlyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },

    // Loading state
    loaderContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Text pressed state
    textPressed: {
      opacity: 0.8,
    },
  });
};
