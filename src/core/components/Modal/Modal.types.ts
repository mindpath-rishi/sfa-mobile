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
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;

  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  animation?: 'none' | 'scale' | 'slide';

  showCloseButton?: boolean;
  showHeader?: boolean;
  showBackdrop?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnEscape?: boolean;
  dismissible?: boolean;

  backdropColor?: string;
  backdropOpacity?: number;
  animationDuration?: number;
  zIndex?: number;

  style?: any;
  contentStyle?: any;
  headerStyle?: any;
  titleStyle?: any;
  closeButtonStyle?: any;

  testID?: string;
  accessibilityLabel?: string;

  onOpen?: () => void;
  onCloseComplete?: () => void;
  onShow?: () => void;

  closeIcon?: React.ReactNode;
  hideStatusBar?: boolean;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';

  /**
   * New props
   */
  transparent?: boolean;
  statusBarColor?: string;
  statusBarTranslucent?: boolean;

  swipeDirection?: 'up' | 'down' | 'left' | 'right';

  keyboardAvoiding?: boolean;
  keyboardOffset?: number;

  scrollable?: boolean;
  scrollViewProps?: any;

  loading?: boolean;
  loadingText?: string;
  loadingIndicator?: React.ReactNode;

  hideCloseButton?: boolean;
  closeButtonPosition?: 'left' | 'right';

  backdropTransitionDuration?: number;
  modalTransitionDuration?: number;

  onSwipeComplete?: () => void;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;

  supportedOrientations?: Array<
    'portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right'
  >;

  hardwareAccelerated?: boolean;
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
