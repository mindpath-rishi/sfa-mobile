// src/core/components/Modal/Modal.tsx
import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import {
  Modal as RNModal,
  View,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  ViewStyle,
  BackHandler,
  StatusBar,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { ModalProps, ModalHeaderProps, ModalFooterProps, ModalContentProps } from './Modal.types';
import { useModalStyles } from './Modal.styles';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Animation constants - FIXED: Removed duration from timing config
const ANIMATION_CONFIG = {
  spring: {
    tension: 50,
    friction: 8,
    useNativeDriver: true,
  },
  timing: {
    useNativeDriver: true, // Duration removed from here to avoid duplication
  },
};

/**
 * Modal component for displaying content in an overlay
 *
 * @example
 * ```tsx
 * // Basic modal
 * <Modal visible={isVisible} onClose={() => setIsVisible(false)}>
 *   <Text>Modal Content</Text>
 * </Modal>
 *
 * // Modal with title and footer
 * <Modal
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   title="Confirm Action"
 *   size="sm"
 * >
 *   <Modal.Content>
 *     <Text>Are you sure you want to delete this item?</Text>
 *   </Modal.Content>
 *   <Modal.Footer>
 *     <Button title="Cancel" variant="outline" onPress={() => {}} />
 *     <Button title="Delete" variant="danger" onPress={() => {}} />
 *   </Modal.Footer>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Content: React.FC<ModalContentProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  visible,
  onClose,
  children,
  title,
  size = 'md',
  position = 'center',
  animation = 'scale',
  showCloseButton = true,
  showHeader = true,
  showBackdrop = true,
  closeOnBackdropPress = true,
  closeOnEscape = true,
  dismissible = true,
  backdropColor,
  backdropOpacity = 0.5,
  animationDuration = 300,
  zIndex,
  style,
  contentStyle,
  headerStyle,
  titleStyle,
  closeButtonStyle,
  testID = 'modal',
  accessibilityLabel,
  onOpen,
  onCloseComplete,

  // New props
  closeIcon,
  hideStatusBar = false,
  statusBarStyle,
  swipeToClose = false,
  swipeThreshold = 100,
  swipeDirection = 'down',
  keyboardAvoiding = true,
  keyboardOffset = 0,
  scrollable = false,
  scrollViewProps,
  loading = false,
  loadingText,
  loadingIndicator,
  hideCloseButton = false,
  closeButtonPosition = 'right',
  backdropTransitionDuration,
  modalTransitionDuration,
  onSwipeComplete,
  onOrientationChange,
  supportedOrientations = ['portrait', 'landscape'],
  onShow,
  hardwareAccelerated = false,
  presentationStyle,
}) => {
  const { colors } = useTheme();
  const styles = useModalStyles(size, position, backdropOpacity, zIndex, style, contentStyle);
  const [modalVisible, setModalVisible] = useState(visible);

  // Animation values
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const modalTranslateX = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe to close
  const pan = useRef(new Animated.ValueXY()).current;

  // Track if modal is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setModalVisible(visible);

    if (visible) {
      showModal();
      onOpen?.();
      onShow?.();
    } else {
      hideModal();
    }

    return () => {
      isMounted.current = false;
    };
  }, [visible]);

  // Handle hardware back button on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (visible && dismissible) {
          onClose();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [visible, dismissible, onClose]);

  // Handle escape key on web
  useEffect(() => {
    if (Platform.OS === 'web' && closeOnEscape) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && visible && dismissible) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [visible, closeOnEscape, dismissible, onClose]);

  // Handle orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      onOrientationChange?.(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, [onOrientationChange]);

  const showModal = useCallback(() => {
    const animations = [];

    // Reset animations first
    backdropOpacityAnim.setValue(0);
    modalScale.setValue(0.8);
    modalTranslateY.setValue(SCREEN_HEIGHT);
    modalTranslateX.setValue(0);
    modalOpacity.setValue(0);

    // Backdrop animation - FIXED: duration passed separately
    animations.push(
      Animated.timing(backdropOpacityAnim, {
        ...ANIMATION_CONFIG.timing,
        toValue: 1,
        duration: backdropTransitionDuration || animationDuration,
      }),
    );

    // Modal animation based on type
    switch (animation) {
      case 'slide':
        if (swipeDirection === 'down' || swipeDirection === 'up') {
          animations.push(
            Animated.spring(modalTranslateY, {
              ...ANIMATION_CONFIG.spring,
              toValue: 0,
            }),
          );
        } else if (swipeDirection === 'left' || swipeDirection === 'right') {
          animations.push(
            Animated.spring(modalTranslateX, {
              ...ANIMATION_CONFIG.spring,
              toValue: 0,
            }),
          );
        }
        break;
      case 'scale':
        animations.push(
          Animated.spring(modalScale, {
            ...ANIMATION_CONFIG.spring,
            toValue: 1,
          }),
        );
        break;
      case 'fade':
        animations.push(
          Animated.timing(modalOpacity, {
            ...ANIMATION_CONFIG.timing,
            toValue: 1,
            duration: modalTransitionDuration || animationDuration,
          }),
        );
        break;
      case 'none':
        // No animation
        break;
    }

    Animated.parallel(animations).start();
  }, [
    animation,
    animationDuration,
    backdropOpacityAnim,
    modalScale,
    modalTranslateY,
    modalTranslateX,
    modalOpacity,
    swipeDirection,
    backdropTransitionDuration,
    modalTransitionDuration,
  ]);

  const hideModal = useCallback(() => {
    const animations = [];

    // Backdrop animation - FIXED: duration passed separately
    animations.push(
      Animated.timing(backdropOpacityAnim, {
        ...ANIMATION_CONFIG.timing,
        toValue: 0,
        duration: backdropTransitionDuration || animationDuration,
      }),
    );

    // Modal animation based on type
    switch (animation) {
      case 'slide':
        if (swipeDirection === 'down' || swipeDirection === 'up') {
          animations.push(
            Animated.timing(modalTranslateY, {
              ...ANIMATION_CONFIG.timing,
              toValue: swipeDirection === 'down' ? SCREEN_HEIGHT : -SCREEN_HEIGHT,
              duration: modalTransitionDuration || animationDuration,
            }),
          );
        } else if (swipeDirection === 'left' || swipeDirection === 'right') {
          animations.push(
            Animated.timing(modalTranslateX, {
              ...ANIMATION_CONFIG.timing,
              toValue: swipeDirection === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
              duration: modalTransitionDuration || animationDuration,
            }),
          );
        }
        break;
      case 'scale':
        animations.push(
          Animated.timing(modalScale, {
            ...ANIMATION_CONFIG.timing,
            toValue: 0.8,
            duration: modalTransitionDuration || animationDuration,
          }),
        );
        break;
      case 'fade':
        animations.push(
          Animated.timing(modalOpacity, {
            ...ANIMATION_CONFIG.timing,
            toValue: 0,
            duration: modalTransitionDuration || animationDuration,
          }),
        );
        break;
      case 'none':
        // No animation
        break;
    }

    Animated.parallel(animations).start(() => {
      if (isMounted.current) {
        setModalVisible(false);
        onCloseComplete?.();
      }
    });
  }, [
    animation,
    animationDuration,
    backdropOpacityAnim,
    modalScale,
    modalTranslateY,
    modalTranslateX,
    modalOpacity,
    swipeDirection,
    onCloseComplete,
    backdropTransitionDuration,
    modalTransitionDuration,
  ]);

  // Get modal transform based on animation
  const getModalTransform = useCallback((): Animated.WithAnimatedObject<ViewStyle> => {
    switch (animation) {
      case 'slide':
        if (swipeDirection === 'down' || swipeDirection === 'up') {
          return {
            transform: [{ translateY: modalTranslateY }],
          };
        } else if (swipeDirection === 'left' || swipeDirection === 'right') {
          return {
            transform: [{ translateX: modalTranslateX }],
          };
        }
        return {};
      case 'scale':
        return {
          transform: [{ scale: modalScale }],
        };
      default:
        return {};
    }
  }, [animation, modalScale, modalTranslateY, modalTranslateX, swipeDirection]);

  const handleBackdropPress = useCallback(() => {
    if (dismissible && closeOnBackdropPress) {
      onClose();
    }
  }, [dismissible, closeOnBackdropPress, onClose]);

  // Handle swipe to close
  const handleSwipeComplete = useCallback(() => {
    onSwipeComplete?.();
    onClose();
  }, [onSwipeComplete, onClose]);

  // Memoized modal style
  const modalAnimatedStyle = useMemo(
    () => [styles.modal, getModalTransform()],
    [styles.modal, getModalTransform],
  );

  // Render header if enabled and has content
  const renderHeader = useCallback(() => {
    if (!showHeader || (!title && hideCloseButton)) return null;

    return (
      <ModalHeader
        title={title}
        showCloseButton={showCloseButton && !hideCloseButton}
        onClose={onClose}
        titleStyle={titleStyle}
        closeButtonStyle={closeButtonStyle}
        headerStyle={headerStyle}
        closeIcon={closeIcon}
        closeButtonPosition={closeButtonPosition}
      />
    );
  }, [
    showHeader,
    title,
    showCloseButton,
    hideCloseButton,
    onClose,
    titleStyle,
    closeButtonStyle,
    headerStyle,
    closeIcon,
    closeButtonPosition,
  ]);

  // Render loading overlay
  const renderLoading = useCallback(() => {
    if (!loading) return null;

    return (
      <View style={styles.loadingOverlay}>
        {loadingIndicator || <ActivityIndicator size="large" color={colors.primary} />}
        {loadingText && <Text style={styles.loadingText}>{loadingText}</Text>}
      </View>
    );
  }, [loading, loadingText, loadingIndicator, colors.primary, styles]);

  // Render content with scroll support
  const renderContent = useCallback(() => {
    if (scrollable) {
      return (
        <ScrollView
          {...scrollViewProps}
          contentContainerStyle={[styles.scrollContent, scrollViewProps?.contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }
    return children;
  }, [scrollable, scrollViewProps, children, styles.scrollContent]);

  return (
    <RNModal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
      testID={testID}
      hardwareAccelerated={hardwareAccelerated}
      presentationStyle={presentationStyle}
      supportedOrientations={supportedOrientations}
      onShow={onShow}
    >
      {hideStatusBar && <StatusBar hidden={hideStatusBar} />}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={keyboardAvoiding ? (Platform.OS === 'ios' ? 'padding' : undefined) : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        {showBackdrop && (
          <TouchableWithoutFeedback
            onPress={handleBackdropPress}
            testID={`${testID}-backdrop`}
            accessible={false}
          >
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacityAnim,
                  backgroundColor: backdropColor || styles.backdrop.backgroundColor,
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}

        <Animated.View
          style={[
            styles.container,
            animation === 'fade' && { opacity: modalOpacity },
            { pointerEvents: visible ? 'auto' : 'none' },
          ]}
          pointerEvents="box-none"
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="none"
        >
          <SafeAreaView style={styles.modalWrapper}>
            <Animated.View style={modalAnimatedStyle}>
              {renderHeader()}
              <View style={styles.content}>{renderContent()}</View>
              {renderLoading()}
            </Animated.View>
          </SafeAreaView>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

// Header subcomponent with improved features
const ModalHeader: React.FC<
  ModalHeaderProps & {
    closeIcon?: React.ReactNode;
    closeButtonPosition?: 'left' | 'right';
  }
> = React.memo(
  ({
    title,
    showCloseButton,
    onClose,
    titleStyle,
    closeButtonStyle,
    headerStyle,
    closeIcon,
    closeButtonPosition = 'right',
  }) => {
    const { colors } = useTheme();
    const styles = useModalStyles('md', 'center');

    const renderCloseButton = () => {
      if (!showCloseButton) return null;

      return (
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, closeButtonStyle]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Close modal"
          accessibilityRole="button"
        >
          {closeIcon || (
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>×</Text>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <View style={[styles.header, headerStyle]}>
        {closeButtonPosition === 'left' && renderCloseButton()}

        {title && (
          <Text
            style={[styles.title, titleStyle, closeButtonPosition === 'left' && { marginLeft: 8 }]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
        )}

        {closeButtonPosition === 'right' && renderCloseButton()}
      </View>
    );
  },
);

ModalHeader.displayName = 'ModalHeader';

// Content subcomponent with scroll support
const ModalContent: React.FC<
  ModalContentProps & {
    scrollable?: boolean;
    scrollViewProps?: any;
  }
> = React.memo(({ children, style, scrollable, scrollViewProps }) => {
  if (scrollable) {
    return (
      <ScrollView
        {...scrollViewProps}
        style={style}
        contentContainerStyle={scrollViewProps?.contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={style}>{children}</View>;
});

ModalContent.displayName = 'ModalContent';

// Footer subcomponent
const ModalFooter: React.FC<ModalFooterProps> = React.memo(({ children, style }) => {
  const styles = useModalStyles('md', 'center');
  return <View style={[styles.footer, style]}>{children}</View>;
});

ModalFooter.displayName = 'ModalFooter';

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
export * from './Modal.types';
