import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

interface QuickActionStyleProps {
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  color: string;
}

export const useQuickActionStyles = (props: QuickActionStyleProps) => {
  const { colors } = useTheme();
  const { size = 'medium', disabled = false, color } = props;

  // Get size values
  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          container: 44,
          icon: 20,
          borderRadius: 22,
          fontSize: 10,
        };
      case 'large':
        return {
          container: 68,
          icon: 28,
          borderRadius: 34,
          fontSize: 12,
        };
      default: // medium
        return {
          container: 56,
          icon: 24,
          borderRadius: 28,
          fontSize: 11,
        };
    }
  };

  const sizeValues = getSize();

  const styleGenerator = createStyles((utils) => ({
    container: {
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
    } as ViewStyle,

    gradientContainer: {
      width: sizeValues.container,
      height: sizeValues.container,
      borderRadius: sizeValues.borderRadius,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    label: {
      color: disabled ? colors.textTertiary : colors.textSecondary,
      fontSize: sizeValues.fontSize,
      textAlign: 'center',
    } as TextStyle,

    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5,
      borderColor: 'white',
    } as ViewStyle,

    badgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    } as TextStyle,

    pressedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: sizeValues.borderRadius,
      backgroundColor: 'rgba(255,255,255,0.2)',
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
