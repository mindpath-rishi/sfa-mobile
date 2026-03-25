// src/core/components/Modal/Modal.styles.ts
import { ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import { createStyles, StyleUtils } from '@/shared/theme/styles';
import { useTheme } from '@/shared/hooks/useTheme';
import { ModalSize, ModalPosition } from './Modal.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const useModalStyles = (
  size: ModalSize = 'md',
  position: ModalPosition = 'center',
  backdropOpacity?: number,
  zIndex?: number,
  containerStyle?: ViewStyle,
  contentStyle?: ViewStyle,
) => {
  const { colors } = useTheme();

  const styleGenerator = createStyles((utils: StyleUtils) => {
    // Get modal width based on size
    const getModalWidth = (): number => {
      // const padding = utils.spacing[4] * 2;
      const screenWidth = SCREEN_WIDTH;

      const sizeMap: Record<ModalSize, number> = {
        xs: 320,
        sm: 400,
        md: 500,
        lg: 600,
        xl: 800,
        full: SCREEN_WIDTH,
      };

      const desiredWidth = sizeMap[size] || sizeMap.md;
      return Math.min(desiredWidth, screenWidth);
    };

    // Get modal max height based on position
    const getModalMaxHeight = (): number => {
      if (size === 'full') return SCREEN_HEIGHT;

      switch (position) {
        case 'top':
          return SCREEN_HEIGHT * 0.9;
        case 'bottom':
          return SCREEN_HEIGHT * 0.9;
        default:
          return SCREEN_HEIGHT * 0.85;
      }
    };

    // Get modal position styles
    const getPositionStyles = (): ViewStyle => {
      const basePosition: ViewStyle = {
        justifyContent: 'center',
        alignItems: 'center',
      };

      switch (position) {
        case 'top':
          return {
            ...basePosition,
            justifyContent: 'flex-start',
            paddingTop: utils.spacing[8],
          };
        case 'bottom':
          return {
            ...basePosition,
            justifyContent: 'flex-end',
            paddingBottom: utils.spacing[8],
          };
        case 'left':
          return {
            ...basePosition,
            alignItems: 'flex-start',
            paddingLeft: utils.spacing[4],
          };
        case 'right':
          return {
            ...basePosition,
            alignItems: 'flex-end',
            paddingRight: utils.spacing[4],
          };
        default:
          return basePosition;
      }
    };

    return {
      // Backdrop styles
      backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        opacity: backdropOpacity ?? 0.5,
      } as ViewStyle,

      // Container styles
      container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: zIndex ?? 1000,
        ...getPositionStyles(),
      } as ViewStyle,

      // Modal wrapper styles
      modalWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,

      // Modal container styles
      modal: {
        width: getModalWidth(),
        maxHeight: getModalMaxHeight(),
        backgroundColor: colors.surface,
        borderRadius: size === 'full' ? 0 : utils.borderRadius.lg,
        overflow: 'hidden',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          },
          android: {
            elevation: 5,
          },
        }),
        ...containerStyle,
      } as ViewStyle,

      // Header styles
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: utils.spacing[4],
        paddingVertical: utils.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      } as ViewStyle,

      // Title styles
      title: {
        flex: 1,
        fontSize: utils.fontSize.lg,
        fontWeight: utils.getFontWeight('600'),
        color: colors.textPrimary,
      } as TextStyle,

      // Close button styles
      closeButton: {
        padding: utils.spacing[2],
        marginLeft: utils.spacing[2],
        borderRadius: utils.borderRadius.full,
        minWidth: 40,
        minHeight: 40,
        justifyContent: 'center',
        alignItems: 'center',
      } as ViewStyle,

      // Close button text styles
      closeButtonText: {
        fontSize: 24,
        color: colors.textSecondary,
        lineHeight: 24,
      } as TextStyle,

      // Content styles
      content: {
        padding: size === 'full' ? 0 : utils.spacing[4],
        ...contentStyle,
      } as ViewStyle,

      // Footer styles
      footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: utils.spacing[2],
        padding: utils.spacing[4],
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
      } as ViewStyle,

      // Keyboard avoiding view styles
      keyboardAvoidingView: {
        flex: 1,
      } as ViewStyle,

      // Scroll content styles (for scrollable modals)
      scrollContent: {
        flexGrow: 1,
        paddingBottom: utils.spacing[2],
      } as ViewStyle,

      // Divider styles
      divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: utils.spacing[2],
      } as ViewStyle,

      // Loading overlay styles
      loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      } as ViewStyle,

      // Loading text styles
      loadingText: {
        marginTop: utils.spacing[2],
        fontSize: utils.fontSize.sm,
        color: colors.textPrimary,
      } as TextStyle,

      // Error styles
      errorContainer: {
        padding: utils.spacing[4],
        backgroundColor: colors.error + '10',
        borderRadius: utils.borderRadius.md,
        marginBottom: utils.spacing[3],
      } as ViewStyle,

      errorText: {
        color: colors.error,
        fontSize: utils.fontSize.sm,
        textAlign: 'center',
      } as TextStyle,

      // Success styles
      successContainer: {
        padding: utils.spacing[4],
        backgroundColor: colors.success + '10',
        borderRadius: utils.borderRadius.md,
        marginBottom: utils.spacing[3],
      } as ViewStyle,

      successText: {
        color: colors.success,
        fontSize: utils.fontSize.sm,
        textAlign: 'center',
      } as TextStyle,

      // Warning styles
      warningContainer: {
        padding: utils.spacing[4],
        backgroundColor: colors.warning + '10',
        borderRadius: utils.borderRadius.md,
        marginBottom: utils.spacing[3],
      } as ViewStyle,

      warningText: {
        color: colors.warning,
        fontSize: utils.fontSize.sm,
        textAlign: 'center',
      } as TextStyle,

      // Info styles
      infoContainer: {
        padding: utils.spacing[4],
        backgroundColor: colors.info + '10',
        borderRadius: utils.borderRadius.md,
        marginBottom: utils.spacing[3],
      } as ViewStyle,

      infoText: {
        color: colors.info,
        fontSize: utils.fontSize.sm,
        textAlign: 'center',
      } as TextStyle,

      // Action button styles
      actionButton: {
        paddingHorizontal: utils.spacing[4],
        paddingVertical: utils.spacing[2],
        borderRadius: utils.borderRadius.md,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,

      primaryButton: {
        backgroundColor: colors.primary,
      } as ViewStyle,

      secondaryButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      } as ViewStyle,

      dangerButton: {
        backgroundColor: colors.error,
      } as ViewStyle,

      actionButtonText: {
        fontSize: utils.fontSize.sm,
        fontWeight: utils.getFontWeight('500'),
      } as TextStyle,

      primaryButtonText: {
        color: 'white',
      } as TextStyle,

      secondaryButtonText: {
        color: colors.textPrimary,
      } as TextStyle,

      dangerButtonText: {
        color: 'white',
      } as TextStyle,

      // Image styles
      imageContainer: {
        alignItems: 'center',
        marginBottom: utils.spacing[4],
      } as ViewStyle,

      image: {
        width: 80,
        height: 80,
        borderRadius: 40,
      } as ViewStyle,

      // Icon styles
      iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: utils.spacing[3],
      } as ViewStyle,

      // Form styles
      formContainer: {
        gap: utils.spacing[3],
      } as ViewStyle,

      formRow: {
        flexDirection: 'row',
        gap: utils.spacing[2],
        alignItems: 'center',
      } as ViewStyle,

      // List styles
      listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: utils.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      } as ViewStyle,

      listItemText: {
        flex: 1,
        fontSize: utils.fontSize.md,
        color: colors.textPrimary,
      } as TextStyle,

      listItemIcon: {
        marginRight: utils.spacing[3],
      } as ViewStyle,

      // Badge styles
      badge: {
        paddingHorizontal: utils.spacing[2],
        paddingVertical: utils.spacing[1],
        borderRadius: utils.borderRadius.sm,
        backgroundColor: colors.primary + '20',
        alignSelf: 'flex-start',
      } as ViewStyle,

      badgeText: {
        fontSize: utils.fontSize.xs,
        color: colors.primary,
        fontWeight: utils.getFontWeight('600'),
      } as TextStyle,

      // Progress styles
      progressContainer: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginVertical: utils.spacing[2],
      } as ViewStyle,

      progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
      } as ViewStyle,

      // Empty state styles
      emptyState: {
        padding: utils.spacing[8],
        alignItems: 'center',
        justifyContent: 'center',
      } as ViewStyle,

      emptyStateText: {
        fontSize: utils.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: utils.spacing[2],
      } as TextStyle,

      // Grid styles
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -utils.spacing[1],
      } as ViewStyle,

      gridItem: {
        width: '50%',
        paddingHorizontal: utils.spacing[1],
        marginBottom: utils.spacing[2],
      } as ViewStyle,

      // Card styles (for nested cards in modal)
      card: {
        backgroundColor: colors.surface,
        borderRadius: utils.borderRadius.md,
        padding: utils.spacing[3],
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          android: {
            elevation: 2,
          },
        }),
      } as ViewStyle,

      // Input styles (for forms in modal)
      input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: utils.borderRadius.md,
        paddingHorizontal: utils.spacing[3],
        paddingVertical: utils.spacing[2],
        fontSize: utils.fontSize.md,
        color: colors.textPrimary,
        backgroundColor: colors.background,
      } as TextStyle,

      // Label styles
      label: {
        fontSize: utils.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: utils.spacing[1],
        fontWeight: utils.getFontWeight('500'),
      } as TextStyle,

      // Helper text styles
      helperText: {
        fontSize: utils.fontSize.xs,
        color: colors.textTertiary,
        marginTop: utils.spacing[1],
      } as TextStyle,

      // Error helper text
      errorHelperText: {
        color: colors.error,
      } as TextStyle,

      // Success helper text
      successHelperText: {
        color: colors.success,
      } as TextStyle,
    };
  });

  return styleGenerator(colors);
};
