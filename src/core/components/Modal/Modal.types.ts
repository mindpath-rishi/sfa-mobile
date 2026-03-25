// src/core/components/Modal/Modal.types.ts
import { ViewStyle, TextStyle } from 'react-native';
import { Animated } from 'react-native';
import { ScrollViewProps } from 'react-native';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type ModalAnimation = 'fade' | 'scale' | 'slide' | 'none';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export type CloseButtonPosition = 'left' | 'right';
export type StatusBarStyle = 'light-content' | 'dark-content' | 'default';
export type Orientation = 'portrait' | 'landscape';

export interface ModalProps {
  /** Controls modal visibility */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Modal content */
  children: any;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: ModalSize;
  /** Modal position on screen */
  position?: ModalPosition;
  /** Animation type */
  animation?: ModalAnimation;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Show modal header */
  showHeader?: boolean;
  /** Show backdrop */
  showBackdrop?: boolean;
  /** Close modal when backdrop is pressed */
  closeOnBackdropPress?: boolean;
  /** Close on escape key (web only) */
  closeOnEscape?: boolean;
  /** Allow modal to be dismissed */
  dismissible?: boolean;
  /** Custom backdrop color */
  backdropColor?: string;
  /** Backdrop opacity (0-1) */
  backdropOpacity?: number;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom z-index */
  zIndex?: number;
  /** Container style */
  style?: ViewStyle;
  /** Content style */
  contentStyle?: ViewStyle;
  /** Header style */
  headerStyle?: ViewStyle;
  /** Title style */
  titleStyle?: TextStyle;
  /** Close button style */
  closeButtonStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Callback when modal is opened */
  onOpen?: () => void;
  /** Callback when modal is closed */
  onCloseComplete?: () => void;

  // New props from the component
  /** Custom close icon */
  closeIcon?: any;
  /** Hide status bar when modal is open */
  hideStatusBar?: boolean;
  /** Status bar style */
  statusBarStyle?: StatusBarStyle;
  /** Enable swipe to close */
  swipeToClose?: boolean;
  /** Swipe threshold for closing */
  swipeThreshold?: number;
  /** Swipe direction */
  swipeDirection?: SwipeDirection;
  /** Enable keyboard avoiding */
  keyboardAvoiding?: boolean;
  /** Keyboard offset */
  keyboardOffset?: number;
  /** Make content scrollable */
  scrollable?: boolean;
  /** ScrollView props */
  scrollViewProps?: ScrollViewProps;
  /** Show loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Custom loading indicator */
  loadingIndicator?: any;
  /** Hide close button */
  hideCloseButton?: boolean;
  /** Close button position */
  closeButtonPosition?: CloseButtonPosition;
  /** Backdrop transition duration */
  backdropTransitionDuration?: number;
  /** Modal transition duration */
  modalTransitionDuration?: number;
  /** Callback when swipe is complete */
  onSwipeComplete?: () => void;
  /** Callback on orientation change */
  onOrientationChange?: (orientation: Orientation) => void;
  /** Supported orientations */
  supportedOrientations?: Orientation[];
  /** Callback when modal is shown */
  onShow?: () => void;
  /** Hardware acceleration for Android */
  hardwareAccelerated?: boolean;
  /** Presentation style for iOS */
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
}

export interface ModalHeaderProps {
  /** Header title */
  title?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Title style */
  titleStyle?: TextStyle;
  /** Close button style */
  closeButtonStyle?: ViewStyle;
  /** Header style */
  headerStyle?: ViewStyle;
  /** Custom close icon */
  closeIcon?: any;
  /** Close button position */
  closeButtonPosition?: CloseButtonPosition;
}

export interface ModalContentProps {
  /** Content children */
  children: any;
  /** Content style */
  style?: ViewStyle;
  /** Make content scrollable */
  scrollable?: boolean;
  /** ScrollView props */
  scrollViewProps?: ScrollViewProps;
}

export interface ModalFooterProps {
  /** Footer children */
  children: any;
  /** Footer style */
  style?: ViewStyle;
}

export interface ModalStyles {
  backdrop: ViewStyle;
  container: ViewStyle;
  modalWrapper: ViewStyle;
  modal: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: ViewStyle;
  closeButtonText: TextStyle;
  content: ViewStyle;
  footer: ViewStyle;
  keyboardAvoidingView: ViewStyle;
  scrollContent: ViewStyle;
  divider: ViewStyle;
  loadingOverlay: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  successContainer: ViewStyle;
  successText: TextStyle;
  warningContainer: ViewStyle;
  warningText: TextStyle;
  infoContainer: ViewStyle;
  infoText: TextStyle;
  actionButton: ViewStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  dangerButton: ViewStyle;
  actionButtonText: TextStyle;
  primaryButtonText: TextStyle;
  secondaryButtonText: TextStyle;
  dangerButtonText: TextStyle;
  imageContainer: ViewStyle;
  image: ViewStyle;
  iconContainer: ViewStyle;
  formContainer: ViewStyle;
  formRow: ViewStyle;
  listItem: ViewStyle;
  listItemText: TextStyle;
  listItemIcon: ViewStyle;
  badge: ViewStyle;
  badgeText: TextStyle;
  progressContainer: ViewStyle;
  progressBar: ViewStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  grid: ViewStyle;
  gridItem: ViewStyle;
  card: ViewStyle;
  input: TextStyle;
  label: TextStyle;
  helperText: TextStyle;
  errorHelperText: TextStyle;
  successHelperText: TextStyle;
}
