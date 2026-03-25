import { ViewStyle, TextStyle } from 'react-native';
import { createStyles } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { ActivityStatus } from '../types/activity.types';

interface ActivityItemStyleProps {
  status: ActivityStatus;
  showBorder?: boolean;
}

export const useActivityItemStyles = (props: ActivityItemStyleProps) => {
  const { colors } = useTheme();
  const { status, showBorder = true } = props;

  // Get status color
  const getStatusColor = (): string => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'scheduled':
        return colors.info;
      case 'cancelled':
        return colors.error;
      case 'in_progress':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  // Get status badge variant
  const getStatusVariant = (): 'success' | 'warning' | 'info' | 'error' | 'primary' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'in_progress':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const statusColor = getStatusColor();

  // Create the style generator function
  const styleGenerator = createStyles((utils: any) => ({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: utils.spacing[3],
      borderBottomWidth: showBorder ? 1 : 0,
      borderBottomColor: colors.divider,
    } as ViewStyle,

    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: statusColor + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: utils.spacing[3],
    } as ViewStyle,

    contentContainer: {
      flex: 1,
    } as ViewStyle,

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: utils.spacing[1],
    } as ViewStyle,

    customerName: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '500',
      flex: 1,
    } as TextStyle,

    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: utils.spacing[2],
    } as ViewStyle,

    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    detailText: {
      color: colors.textSecondary,
      fontSize: 12,
      marginLeft: 2,
    } as TextStyle,

    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: colors.textTertiary,
    } as ViewStyle,

    amountText: {
      color: colors.success,
      fontSize: 12,
      fontWeight: '500',
    } as TextStyle,

    typeText: {
      color: colors.textSecondary,
      fontSize: 12,
      textTransform: 'capitalize',
    } as TextStyle,

    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: utils.spacing[1],
    } as ViewStyle,

    locationText: {
      color: colors.textTertiary,
      fontSize: 11,
      marginLeft: 2,
    } as TextStyle,

    notesText: {
      color: colors.textTertiary,
      fontSize: 11,
      marginTop: 2,
      fontStyle: 'italic',
    } as TextStyle,

    chevron: {
      marginLeft: utils.spacing[2],
    } as ViewStyle,
  }));

  // Call the generator with colors
  return styleGenerator(colors);
};
