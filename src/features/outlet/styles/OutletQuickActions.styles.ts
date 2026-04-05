import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';

export const useOutletQuickActionsStyles = () => {
  const { colors } = useTheme();
  const styleGenerator = createStyles((utils) => ({
    container: {
      flexDirection: 'row',
      marginTop: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    // For vertical layout variant
    verticalContainer: {
      flexDirection: 'column',
      marginTop: utils.spacing[3],
      gap: utils.spacing[2],
    } as ViewStyle,

    buttonContainer: {
      flex: 1,
    } as ViewStyle,

    verticalButtonContainer: {
      width: '100%',
      marginBottom: utils.spacing[2],
    } as ViewStyle,

    // Legacy styles (keep for backward compatibility if needed)
    checkInButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    orderButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: utils.spacing[2],
      borderRadius: utils.borderRadius.md,
    } as ViewStyle,

    callButton: {
      width: 40,
      height: 36,
      borderWidth: 1,
      borderRadius: utils.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    buttonText: {
      color: 'white',
      fontSize: utils.fontSize.sm,
      marginLeft: utils.spacing[1],
      fontWeight: utils.getFontWeight('medium'),
    } as TextStyle,

    // Additional styles for better flexibility
    smallButton: {
      paddingVertical: utils.spacing[1.5],
      paddingHorizontal: utils.spacing[2],
    } as ViewStyle,

    mediumButton: {
      paddingVertical: utils.spacing[2],
      paddingHorizontal: utils.spacing[3],
    } as ViewStyle,

    largeButton: {
      paddingVertical: utils.spacing[3],
      paddingHorizontal: utils.spacing[4],
    } as ViewStyle,

    iconSmall: {
      marginRight: utils.spacing[1],
    } as ViewStyle,

    iconMedium: {
      marginRight: utils.spacing[1.5],
    } as ViewStyle,

    iconLarge: {
      marginRight: utils.spacing[2],
    } as ViewStyle,

    labelOnly: {
      marginLeft: 0,
    } as TextStyle,

    iconOnly: {
      marginRight: 0,
    } as ViewStyle,
  }));

  return styleGenerator(colors);
};
