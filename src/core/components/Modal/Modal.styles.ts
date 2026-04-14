// // src/core/components/Modal/Modal.styles.ts
// import { ViewStyle, TextStyle, Dimensions, Platform, StyleSheet } from 'react-native';
// import { createStyles, StyleUtils } from '@/shared/theme/styles';
// import { useTheme } from '@/shared/hooks/useTheme';
// import { ModalSize, ModalPosition } from './Modal.types';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// export const useModalStyles = (
//   size: ModalSize = 'md',
//   position: ModalPosition = 'center',
//   backdropOpacity?: number,
//   zIndex?: number,
//   containerStyle?: ViewStyle,
//   contentStyle?: ViewStyle,
// ) => {
//   const { colors } = useTheme();

//   const styleGenerator = createStyles((utils: StyleUtils) => {
//     // ── Width ──────────────────────────────────────────────────────────────

//     const getModalWidth = (): number | string => {
//       if (position === 'bottom' || position === 'top') return '100%';

//       if (position === 'left' || position === 'right') {
//         const drawerMap: Record<ModalSize, number> = {
//           xs: SCREEN_WIDTH * 0.55,
//           sm: SCREEN_WIDTH * 0.65,
//           md: SCREEN_WIDTH * 0.75,
//           lg: SCREEN_WIDTH * 0.85,
//           xl: SCREEN_WIDTH * 0.92,
//           full: SCREEN_WIDTH,
//         };
//         return drawerMap[size] ?? drawerMap.md;
//       }

//       // Center
//       const sizeMap: Record<ModalSize, number> = {
//         xs: Math.min(300, SCREEN_WIDTH - 32),
//         sm: Math.min(380, SCREEN_WIDTH - 32),
//         md: Math.min(480, SCREEN_WIDTH - 32),
//         lg: Math.min(580, SCREEN_WIDTH - 32),
//         xl: Math.min(720, SCREEN_WIDTH - 32),
//         full: SCREEN_WIDTH,
//       };
//       return sizeMap[size] ?? sizeMap.md;
//     };

//     // ── Max height ─────────────────────────────────────────────────────────

//     const getModalMaxHeight = (): number | string => {
//       if (size === 'full') return SCREEN_HEIGHT;
//       if (position === 'left' || position === 'right') return SCREEN_HEIGHT;
//       const heightMap: Record<ModalPosition, number> = {
//         top: SCREEN_HEIGHT * 0.6,
//         bottom: SCREEN_HEIGHT * 0.92,
//         center: SCREEN_HEIGHT * 0.85,
//         left: SCREEN_HEIGHT,
//         right: SCREEN_HEIGHT,
//       };
//       return heightMap[position] ?? SCREEN_HEIGHT * 0.85;
//     };

//     // ── Border radius per position ─────────────────────────────────────────

//     const getBorderRadius = (): ViewStyle => {
//       if (size === 'full') return { borderRadius: 0 };
//       const r = 20;
//       switch (position) {
//         case 'bottom':
//           return {
//             borderTopLeftRadius: r,
//             borderTopRightRadius: r,
//             borderBottomLeftRadius: 0,
//             borderBottomRightRadius: 0,
//           };
//         case 'top':
//           return {
//             borderBottomLeftRadius: r,
//             borderBottomRightRadius: r,
//             borderTopLeftRadius: 0,
//             borderTopRightRadius: 0,
//           };
//         case 'left':
//           return {
//             borderTopRightRadius: r,
//             borderBottomRightRadius: r,
//             borderTopLeftRadius: 0,
//             borderBottomLeftRadius: 0,
//           };
//         case 'right':
//           return {
//             borderTopLeftRadius: r,
//             borderBottomLeftRadius: r,
//             borderTopRightRadius: 0,
//             borderBottomRightRadius: 0,
//           };
//         default:
//           return { borderRadius: r };
//       }
//     };

//     // ── Shadow ─────────────────────────────────────────────────────────────

//     const getShadow = (): ViewStyle =>
//       Platform.select({
//         ios: {
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: position === 'bottom' ? -4 : 4 },
//           shadowOpacity: 0.18,
//           shadowRadius: 16,
//         },
//         android: { elevation: 16 },
//       }) ?? {};

//     // ── Content padding ────────────────────────────────────────────────────

//     const contentPadding = size === 'full' ? 0 : (utils.spacing[4] ?? 16);

//     return {
//       // ── Backdrop ──────────────────────────────────────────────────────────
//       // backgroundColor only — opacity driven by Animated.multiply externally
//       backdrop: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: '#000000',
//       } as ViewStyle,

//       // ── Outer container ───────────────────────────────────────────────────
//       container: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         zIndex: zIndex ?? 1000,
//         overflow: 'scroll',
//       } as ViewStyle,

//       // ── Modal card ────────────────────────────────────────────────────────
//       modal: {
//         width: getModalWidth() as any,
//         // maxHeight: getModalMaxHeight() as any,
//         backgroundColor: colors.surface,
//         ...getBorderRadius(),
//         ...getShadow(),
//         overflow: 'hidden',
//         ...containerStyle,
//       } as ViewStyle,

//       // ── Header ────────────────────────────────────────────────────────────
//       header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: utils.spacing[5] ?? 20,
//         paddingTop: utils.spacing[4] ?? 16,
//         paddingBottom: utils.spacing[4] ?? 16,
//         borderBottomWidth: StyleSheet.hairlineWidth,
//         borderBottomColor: colors.border,
//         backgroundColor: colors.surface,
//       } as ViewStyle,

//       // ── Drag handle (bottom sheets) ───────────────────────────────────────
//       dragHandle: {
//         width: 36,
//         height: 4,
//         borderRadius: 2,
//         backgroundColor: colors.border,
//         alignSelf: 'center',
//         marginBottom: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       // ── Title ─────────────────────────────────────────────────────────────
//       title: {
//         flex: 1,
//         fontSize: utils.fontSize.lg ?? 17,
//         fontWeight: utils.getFontWeight('700'),
//         color: colors.textPrimary,
//         letterSpacing: -0.3,
//       } as TextStyle,

//       // ── Close button ──────────────────────────────────────────────────────
//       closeButton: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: colors.border + '70',
//         marginLeft: utils.spacing[2] ?? 8,
//       } as ViewStyle,

//       closeButtonText: {
//         fontSize: 14,
//         lineHeight: 14,
//         color: colors.textSecondary,
//         fontWeight: utils.getFontWeight('600'),
//       } as TextStyle,

//       // ── Content ───────────────────────────────────────────────────────────
//       content: {
//         padding: contentPadding,
//         ...contentStyle,
//       } as ViewStyle,

//       // ── Footer ────────────────────────────────────────────────────────────
//       footer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'flex-end',
//         gap: utils.spacing[2] ?? 8,
//         paddingHorizontal: utils.spacing[4] ?? 16,
//         paddingVertical: utils.spacing[3] ?? 12,
//         borderTopWidth: StyleSheet.hairlineWidth,
//         borderTopColor: colors.border,
//         backgroundColor: colors.surface,
//       } as ViewStyle,

//       // ── Keyboard avoiding ─────────────────────────────────────────────────
//       keyboardAvoidingView: {
//         flex: 1,
//       } as ViewStyle,

//       // ── Scroll content ────────────────────────────────────────────────────
//       scrollContent: {
//         flexGrow: 1,
//         paddingBottom: utils.spacing[4] ?? 16,
//       } as ViewStyle,

//       // ── Divider ───────────────────────────────────────────────────────────
//       divider: {
//         height: StyleSheet.hairlineWidth,
//         backgroundColor: colors.border,
//         marginVertical: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       // ── Loading overlay ───────────────────────────────────────────────────
//       loadingOverlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: colors.surface + 'CC',
//         justifyContent: 'center',
//         alignItems: 'center',
//         zIndex: 2000,
//       } as ViewStyle,

//       loadingText: {
//         marginTop: utils.spacing[3] ?? 12,
//         fontSize: utils.fontSize.sm ?? 14,
//         color: colors.textSecondary,
//         fontWeight: utils.getFontWeight('500'),
//       } as TextStyle,

//       // ── Status banners ────────────────────────────────────────────────────
//       errorContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: utils.spacing[2] ?? 8,
//         padding: utils.spacing[3] ?? 12,
//         backgroundColor: colors.error + '12',
//         borderRadius: utils.borderRadius.md ?? 10,
//         borderLeftWidth: 3,
//         borderLeftColor: colors.error,
//         marginBottom: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       errorText: {
//         flex: 1,
//         color: colors.error,
//         fontSize: utils.fontSize.sm ?? 13,
//         lineHeight: 18,
//       } as TextStyle,

//       successContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: utils.spacing[2] ?? 8,
//         padding: utils.spacing[3] ?? 12,
//         backgroundColor: colors.success + '12',
//         borderRadius: utils.borderRadius.md ?? 10,
//         borderLeftWidth: 3,
//         borderLeftColor: colors.success,
//         marginBottom: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       successText: {
//         flex: 1,
//         color: colors.success,
//         fontSize: utils.fontSize.sm ?? 13,
//         lineHeight: 18,
//       } as TextStyle,

//       warningContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: utils.spacing[2] ?? 8,
//         padding: utils.spacing[3] ?? 12,
//         backgroundColor: colors.warning + '12',
//         borderRadius: utils.borderRadius.md ?? 10,
//         borderLeftWidth: 3,
//         borderLeftColor: colors.warning,
//         marginBottom: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       warningText: {
//         flex: 1,
//         color: colors.warning,
//         fontSize: utils.fontSize.sm ?? 13,
//         lineHeight: 18,
//       } as TextStyle,

//       infoContainer: {
//         flexDirection: 'row',
//         alignItems: 'flex-start',
//         gap: utils.spacing[2] ?? 8,
//         padding: utils.spacing[3] ?? 12,
//         backgroundColor: colors.info + '12',
//         borderRadius: utils.borderRadius.md ?? 10,
//         borderLeftWidth: 3,
//         borderLeftColor: colors.info,
//         marginBottom: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       infoText: {
//         flex: 1,
//         color: colors.info,
//         fontSize: utils.fontSize.sm ?? 13,
//         lineHeight: 18,
//       } as TextStyle,

//       // ── Action buttons ────────────────────────────────────────────────────
//       actionButton: {
//         paddingHorizontal: utils.spacing[5] ?? 20,
//         paddingVertical: utils.spacing[3] ?? 12,
//         borderRadius: utils.borderRadius.md ?? 10,
//         minWidth: 90,
//         alignItems: 'center',
//         justifyContent: 'center',
//         flexDirection: 'row',
//         gap: utils.spacing[2] ?? 8,
//       } as ViewStyle,

//       primaryButton: {
//         backgroundColor: colors.primary,
//         ...Platform.select({
//           ios: {
//             shadowColor: colors.primary,
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.3,
//             shadowRadius: 8,
//           },
//           android: { elevation: 4 },
//         }),
//       } as ViewStyle,

//       secondaryButton: {
//         backgroundColor: 'transparent',
//         borderWidth: 1.5,
//         borderColor: colors.border,
//       } as ViewStyle,

//       dangerButton: {
//         backgroundColor: colors.error,
//         ...Platform.select({
//           ios: {
//             shadowColor: colors.error,
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.3,
//             shadowRadius: 8,
//           },
//           android: { elevation: 4 },
//         }),
//       } as ViewStyle,

//       actionButtonText: {
//         fontSize: utils.fontSize.sm ?? 14,
//         fontWeight: utils.getFontWeight('600'),
//         letterSpacing: 0.1,
//       } as TextStyle,

//       primaryButtonText: { color: '#ffffff' } as TextStyle,
//       secondaryButtonText: { color: colors.textPrimary } as TextStyle,
//       dangerButtonText: { color: '#ffffff' } as TextStyle,

//       // ── Image / icon ──────────────────────────────────────────────────────
//       imageContainer: {
//         alignItems: 'center',
//         marginBottom: utils.spacing[4] ?? 16,
//       } as ViewStyle,

//       image: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//       } as ViewStyle,

//       iconContainer: {
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         backgroundColor: colors.primary + '18',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: utils.spacing[3] ?? 12,
//         alignSelf: 'center',
//       } as ViewStyle,

//       // ── Form ──────────────────────────────────────────────────────────────
//       formContainer: { gap: utils.spacing[4] ?? 16 } as ViewStyle,

//       formRow: {
//         flexDirection: 'row',
//         gap: utils.spacing[3] ?? 12,
//         alignItems: 'center',
//       } as ViewStyle,

//       // ── List ──────────────────────────────────────────────────────────────
//       listItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: utils.spacing[3] ?? 12,
//         borderBottomWidth: StyleSheet.hairlineWidth,
//         borderBottomColor: colors.border,
//       } as ViewStyle,

//       listItemText: {
//         flex: 1,
//         fontSize: utils.fontSize.md ?? 15,
//         color: colors.textPrimary,
//       } as TextStyle,

//       listItemIcon: { marginRight: utils.spacing[3] ?? 12 } as ViewStyle,

//       // ── Badge ─────────────────────────────────────────────────────────────
//       badge: {
//         paddingHorizontal: utils.spacing[2] ?? 8,
//         paddingVertical: 3,
//         borderRadius: 999,
//         backgroundColor: colors.primary + '18',
//         alignSelf: 'flex-start',
//       } as ViewStyle,

//       badgeText: {
//         fontSize: utils.fontSize.xs ?? 11,
//         color: colors.primary,
//         fontWeight: utils.getFontWeight('600'),
//         letterSpacing: 0.2,
//       } as TextStyle,

//       // ── Progress ──────────────────────────────────────────────────────────
//       progressContainer: {
//         height: 6,
//         backgroundColor: colors.border,
//         borderRadius: 3,
//         overflow: 'hidden',
//         marginVertical: utils.spacing[2] ?? 8,
//       } as ViewStyle,

//       progressBar: {
//         height: '100%',
//         backgroundColor: colors.primary,
//         borderRadius: 3,
//       } as ViewStyle,

//       // ── Empty state ───────────────────────────────────────────────────────
//       emptyState: {
//         padding: utils.spacing[8] ?? 32,
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: utils.spacing[2] ?? 8,
//       } as ViewStyle,

//       emptyStateText: {
//         fontSize: utils.fontSize.md ?? 15,
//         color: colors.textSecondary,
//         textAlign: 'center',
//         lineHeight: 22,
//       } as TextStyle,

//       // ── Grid ──────────────────────────────────────────────────────────────
//       grid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         marginHorizontal: -(utils.spacing[1] ?? 4),
//       } as ViewStyle,

//       gridItem: {
//         width: '50%',
//         paddingHorizontal: utils.spacing[1] ?? 4,
//         marginBottom: utils.spacing[3] ?? 12,
//       } as ViewStyle,

//       // ── Nested card ───────────────────────────────────────────────────────
//       card: {
//         backgroundColor: colors.background,
//         borderRadius: utils.borderRadius.md ?? 10,
//         padding: utils.spacing[4] ?? 16,
//         borderWidth: StyleSheet.hairlineWidth,
//         borderColor: colors.border,
//         ...Platform.select({
//           ios: {
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: 1 },
//             shadowOpacity: 0.06,
//             shadowRadius: 4,
//           },
//           android: { elevation: 2 },
//         }),
//       } as ViewStyle,

//       // ── Input ─────────────────────────────────────────────────────────────
//       input: {
//         borderWidth: 1.5,
//         borderColor: colors.border,
//         borderRadius: utils.borderRadius.md ?? 10,
//         paddingHorizontal: utils.spacing[3] ?? 12,
//         paddingVertical: utils.spacing[3] ?? 12,
//         fontSize: utils.fontSize.md ?? 15,
//         color: colors.textPrimary,
//         backgroundColor: colors.background,
//       } as TextStyle,

//       // ── Labels & helpers ──────────────────────────────────────────────────
//       label: {
//         fontSize: utils.fontSize.sm ?? 13,
//         color: colors.textSecondary,
//         marginBottom: utils.spacing[1] ?? 4,
//         fontWeight: utils.getFontWeight('600'),
//         letterSpacing: 0.1,
//       } as TextStyle,

//       helperText: {
//         fontSize: utils.fontSize.xs ?? 12,
//         color: colors.textTertiary,
//         marginTop: utils.spacing[1] ?? 4,
//         lineHeight: 16,
//       } as TextStyle,

//       errorHelperText: { color: colors.error } as TextStyle,
//       successHelperText: { color: colors.success } as TextStyle,

//       // ── Modal wrapper ─────────────────────────────────────────────────────
//       modalWrapper: {
//         flex: 1,
//         width: '100%',
//         justifyContent: position === 'bottom' ? 'flex-end' : 'center',
//         alignItems: position === 'bottom' || position === 'top' ? 'stretch' : 'center',
//       } as ViewStyle,
//     };
//   });

//   return styleGenerator(colors);
// };

// src/core/components/Modal/Modal.styles.ts
import { ViewStyle, TextStyle, Dimensions, Platform, StyleSheet } from 'react-native';
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
    // ── Width ──────────────────────────────────────────────────────────────

    const getModalWidth = (): number | string => {
      if (position === 'bottom' || position === 'top') return '100%';

      if (position === 'left' || position === 'right') {
        const drawerMap: Record<ModalSize, number> = {
          xs: SCREEN_WIDTH * 0.55,
          sm: SCREEN_WIDTH * 0.65,
          md: SCREEN_WIDTH * 0.75,
          lg: SCREEN_WIDTH * 0.85,
          xl: SCREEN_WIDTH * 0.92,
          full: SCREEN_WIDTH,
        };
        return drawerMap[size] ?? drawerMap.md;
      }

      // Center
      const sizeMap: Record<ModalSize, number> = {
        xs: Math.min(300, SCREEN_WIDTH - 32),
        sm: Math.min(380, SCREEN_WIDTH - 32),
        md: Math.min(480, SCREEN_WIDTH - 32),
        lg: Math.min(580, SCREEN_WIDTH - 32),
        xl: Math.min(720, SCREEN_WIDTH - 32),
        full: SCREEN_WIDTH,
      };
      return sizeMap[size] ?? sizeMap.md;
    };

    // ── Max height ─────────────────────────────────────────────────────────

    const getModalMaxHeight = (): number | string => {
      if (size === 'full') return SCREEN_HEIGHT;
      if (position === 'left' || position === 'right') return SCREEN_HEIGHT;
      const heightMap: Record<ModalPosition, number> = {
        top: SCREEN_HEIGHT * 0.6,
        bottom: SCREEN_HEIGHT * 0.9,
        center: SCREEN_HEIGHT * 0.85,
        left: SCREEN_HEIGHT,
        right: SCREEN_HEIGHT,
      };
      return heightMap[position] ?? SCREEN_HEIGHT * 0.85;
    };

    // ── Border radius per position ─────────────────────────────────────────

    const getBorderRadius = (): ViewStyle => {
      if (size === 'full') return { borderRadius: 0 };
      const r = 20;
      switch (position) {
        case 'bottom':
          return {
            borderTopLeftRadius: r,
            borderTopRightRadius: r,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          };
        case 'top':
          return {
            borderBottomLeftRadius: r,
            borderBottomRightRadius: r,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          };
        case 'left':
          return {
            borderTopRightRadius: r,
            borderBottomRightRadius: r,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          };
        case 'right':
          return {
            borderTopLeftRadius: r,
            borderBottomLeftRadius: r,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          };
        default:
          return { borderRadius: r };
      }
    };

    // ── Shadow ─────────────────────────────────────────────────────────────

    const getShadow = (): ViewStyle =>
      Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: position === 'bottom' ? -4 : 4 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
        },
        android: { elevation: 16 },
      }) ?? {};

    // ── Content padding ────────────────────────────────────────────────────

    const contentPadding = size === 'full' ? 0 : (utils.spacing[4] ?? 16);

    return {
      // ── Backdrop ──────────────────────────────────────────────────────────
      backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
      } as ViewStyle,

      // ── Outer container ───────────────────────────────────────────────────
      container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: zIndex ?? 1000,
        // REMOVED overflow: 'scroll' - this was causing issues
      } as ViewStyle,

      // ── Modal card ────────────────────────────────────────────────────────
      modal: {
        width: getModalWidth() as any,
        maxHeight: getModalMaxHeight() as any, // ADDED maxHeight back
        backgroundColor: colors.surface,
        ...getBorderRadius(),
        ...getShadow(),
        overflow: 'hidden',
        ...containerStyle,
      } as ViewStyle,

      // ── Header ────────────────────────────────────────────────────────────
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: utils.spacing[5] ?? 20,
        paddingTop: utils.spacing[4] ?? 16,
        paddingBottom: utils.spacing[4] ?? 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
      } as ViewStyle,

      // ── Drag handle (bottom sheets) ───────────────────────────────────────
      dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginBottom: utils.spacing[3] ?? 12,
      } as ViewStyle,

      // ── Title ─────────────────────────────────────────────────────────────
      title: {
        flex: 1,
        fontSize: utils.fontSize.lg ?? 17,
        fontWeight: utils.getFontWeight('700'),
        color: colors.textPrimary,
        letterSpacing: -0.3,
      } as TextStyle,

      // ── Close button ──────────────────────────────────────────────────────
      closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.border + '70',
        marginLeft: utils.spacing[2] ?? 8,
      } as ViewStyle,

      closeButtonText: {
        fontSize: 14,
        lineHeight: 14,
        color: colors.textSecondary,
        fontWeight: utils.getFontWeight('600'),
      } as TextStyle,

      // ── Content ───────────────────────────────────────────────────────────
      content: {
        padding: contentPadding,
        ...contentStyle,
      } as ViewStyle,

      // ── Footer ────────────────────────────────────────────────────────────
      footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: utils.spacing[2] ?? 8,
        paddingHorizontal: utils.spacing[4] ?? 16,
        paddingVertical: utils.spacing[3] ?? 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
      } as ViewStyle,

      // ── Keyboard avoiding ─────────────────────────────────────────────────
      keyboardAvoidingView: {
        flex: 1,
      } as ViewStyle,

      // ── Scroll content ────────────────────────────────────────────────────
      scrollContent: {
        flexGrow: 1,
        paddingBottom: utils.spacing[4] ?? 16,
      } as ViewStyle,

      // ── Divider ───────────────────────────────────────────────────────────
      divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginVertical: utils.spacing[3] ?? 12,
      } as ViewStyle,

      // ── Loading overlay ───────────────────────────────────────────────────
      loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.surface + 'CC',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      } as ViewStyle,

      loadingText: {
        marginTop: utils.spacing[3] ?? 12,
        fontSize: utils.fontSize.sm ?? 14,
        color: colors.textSecondary,
        fontWeight: utils.getFontWeight('500'),
      } as TextStyle,

      // ── Status banners ────────────────────────────────────────────────────
      errorContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: utils.spacing[2] ?? 8,
        padding: utils.spacing[3] ?? 12,
        backgroundColor: colors.error + '12',
        borderRadius: utils.borderRadius.md ?? 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
        marginBottom: utils.spacing[3] ?? 12,
      } as ViewStyle,

      errorText: {
        flex: 1,
        color: colors.error,
        fontSize: utils.fontSize.sm ?? 13,
        lineHeight: 18,
      } as TextStyle,

      successContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: utils.spacing[2] ?? 8,
        padding: utils.spacing[3] ?? 12,
        backgroundColor: colors.success + '12',
        borderRadius: utils.borderRadius.md ?? 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.success,
        marginBottom: utils.spacing[3] ?? 12,
      } as ViewStyle,

      successText: {
        flex: 1,
        color: colors.success,
        fontSize: utils.fontSize.sm ?? 13,
        lineHeight: 18,
      } as TextStyle,

      warningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: utils.spacing[2] ?? 8,
        padding: utils.spacing[3] ?? 12,
        backgroundColor: colors.warning + '12',
        borderRadius: utils.borderRadius.md ?? 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.warning,
        marginBottom: utils.spacing[3] ?? 12,
      } as ViewStyle,

      warningText: {
        flex: 1,
        color: colors.warning,
        fontSize: utils.fontSize.sm ?? 13,
        lineHeight: 18,
      } as TextStyle,

      infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: utils.spacing[2] ?? 8,
        padding: utils.spacing[3] ?? 12,
        backgroundColor: colors.info + '12',
        borderRadius: utils.borderRadius.md ?? 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.info,
        marginBottom: utils.spacing[3] ?? 12,
      } as ViewStyle,

      infoText: {
        flex: 1,
        color: colors.info,
        fontSize: utils.fontSize.sm ?? 13,
        lineHeight: 18,
      } as TextStyle,

      // ── Action buttons ────────────────────────────────────────────────────
      actionButton: {
        paddingHorizontal: utils.spacing[5] ?? 20,
        paddingVertical: utils.spacing[3] ?? 12,
        borderRadius: utils.borderRadius.md ?? 10,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: utils.spacing[2] ?? 8,
      } as ViewStyle,

      primaryButton: {
        backgroundColor: colors.primary,
        ...Platform.select({
          ios: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          android: { elevation: 4 },
        }),
      } as ViewStyle,

      secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.border,
      } as ViewStyle,

      dangerButton: {
        backgroundColor: colors.error,
        ...Platform.select({
          ios: {
            shadowColor: colors.error,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          android: { elevation: 4 },
        }),
      } as ViewStyle,

      actionButtonText: {
        fontSize: utils.fontSize.sm ?? 14,
        fontWeight: utils.getFontWeight('600'),
        letterSpacing: 0.1,
      } as TextStyle,

      primaryButtonText: { color: '#ffffff' } as TextStyle,
      secondaryButtonText: { color: colors.textPrimary } as TextStyle,
      dangerButtonText: { color: '#ffffff' } as TextStyle,

      // ── Image / icon ──────────────────────────────────────────────────────
      imageContainer: {
        alignItems: 'center',
        marginBottom: utils.spacing[4] ?? 16,
      } as ViewStyle,

      image: {
        width: 80,
        height: 80,
        borderRadius: 40,
      } as ViewStyle,

      iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary + '18',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: utils.spacing[3] ?? 12,
        alignSelf: 'center',
      } as ViewStyle,

      // ── Form ──────────────────────────────────────────────────────────────
      formContainer: { gap: utils.spacing[4] ?? 16 } as ViewStyle,

      formRow: {
        flexDirection: 'row',
        gap: utils.spacing[3] ?? 12,
        alignItems: 'center',
      } as ViewStyle,

      // ── List ──────────────────────────────────────────────────────────────
      listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: utils.spacing[3] ?? 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      } as ViewStyle,

      listItemText: {
        flex: 1,
        fontSize: utils.fontSize.md ?? 15,
        color: colors.textPrimary,
      } as TextStyle,

      listItemIcon: { marginRight: utils.spacing[3] ?? 12 } as ViewStyle,

      // ── Badge ─────────────────────────────────────────────────────────────
      badge: {
        paddingHorizontal: utils.spacing[2] ?? 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: colors.primary + '18',
        alignSelf: 'flex-start',
      } as ViewStyle,

      badgeText: {
        fontSize: utils.fontSize.xs ?? 11,
        color: colors.primary,
        fontWeight: utils.getFontWeight('600'),
        letterSpacing: 0.2,
      } as TextStyle,

      // ── Progress ──────────────────────────────────────────────────────────
      progressContainer: {
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginVertical: utils.spacing[2] ?? 8,
      } as ViewStyle,

      progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
      } as ViewStyle,

      // ── Empty state ───────────────────────────────────────────────────────
      emptyState: {
        padding: utils.spacing[8] ?? 32,
        alignItems: 'center',
        justifyContent: 'center',
        gap: utils.spacing[2] ?? 8,
      } as ViewStyle,

      emptyStateText: {
        fontSize: utils.fontSize.md ?? 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
      } as TextStyle,

      // ── Grid ──────────────────────────────────────────────────────────────
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -(utils.spacing[1] ?? 4),
      } as ViewStyle,

      gridItem: {
        width: '50%',
        paddingHorizontal: utils.spacing[1] ?? 4,
        marginBottom: utils.spacing[3] ?? 12,
      } as ViewStyle,

      // ── Nested card ───────────────────────────────────────────────────────
      card: {
        backgroundColor: colors.background,
        borderRadius: utils.borderRadius.md ?? 10,
        padding: utils.spacing[4] ?? 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.border,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
          },
          android: { elevation: 2 },
        }),
      } as ViewStyle,

      // ── Input ─────────────────────────────────────────────────────────────
      input: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: utils.borderRadius.md ?? 10,
        paddingHorizontal: utils.spacing[3] ?? 12,
        paddingVertical: utils.spacing[3] ?? 12,
        fontSize: utils.fontSize.md ?? 15,
        color: colors.textPrimary,
        backgroundColor: colors.background,
      } as TextStyle,

      // ── Labels & helpers ──────────────────────────────────────────────────
      label: {
        fontSize: utils.fontSize.sm ?? 13,
        color: colors.textSecondary,
        marginBottom: utils.spacing[1] ?? 4,
        fontWeight: utils.getFontWeight('600'),
        letterSpacing: 0.1,
      } as TextStyle,

      helperText: {
        fontSize: utils.fontSize.xs ?? 12,
        color: colors.textTertiary,
        marginTop: utils.spacing[1] ?? 4,
        lineHeight: 16,
      } as TextStyle,

      errorHelperText: { color: colors.error } as TextStyle,
      successHelperText: { color: colors.success } as TextStyle,

      // ── Modal wrapper ─────────────────────────────────────────────────────
      modalWrapper: {
        flex: 1,
        width: '100%',
        justifyContent: position === 'bottom' ? 'flex-end' : 'center',
        alignItems: position === 'bottom' || position === 'top' ? 'stretch' : 'center',
      } as ViewStyle,
    };
  });

  return styleGenerator(colors);
};
