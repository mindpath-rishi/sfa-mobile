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
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { ModalProps, ModalHeaderProps, ModalFooterProps, ModalContentProps } from './Modal.types';
import { useModalStyles } from './Modal.styles';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const SPRING = { tension: 55, friction: 9, useNativeDriver: true };
const timing = (duration: number) => ({ duration, useNativeDriver: true });

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
  animationDuration = 280,
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
  closeIcon,
  hideStatusBar = false,
  statusBarStyle,
  statusBarColor,
  statusBarTranslucent = false,
  transparent = true,
  swipeDirection = 'up',
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
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useModalStyles(size, position, backdropOpacity, zIndex, style, contentStyle);

  const [modalMounted, setModalMounted] = useState(visible);

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.88)).current;
  const modalTranslateY = useRef(new Animated.Value(initialTranslateY())).current;
  const modalTranslateX = useRef(new Animated.Value(initialTranslateX())).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  function initialTranslateY() {
    if (animation !== 'slide') return 0;
    if (swipeDirection === 'up') return SCREEN_HEIGHT;
    if (swipeDirection === 'down') return -SCREEN_HEIGHT;
    return 0;
  }

  function initialTranslateX() {
    if (animation !== 'slide') return 0;
    if (swipeDirection === 'left') return SCREEN_WIDTH;
    if (swipeDirection === 'right') return -SCREEN_WIDTH;
    return 0;
  }

  useEffect(() => {
    if (visible) {
      setModalMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && modalMounted) {
      animateIn();
      onOpen?.();
      onShow?.();
    } else if (!visible && modalMounted) {
      animateOut();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, modalMounted]);

  const animateIn = useCallback(() => {
    backdropAnim.setValue(0);
    modalOpacity.setValue(0);
    modalScale.setValue(0.88);
    modalTranslateY.setValue(initialTranslateY());
    modalTranslateX.setValue(initialTranslateX());

    const bd = backdropTransitionDuration ?? animationDuration;
    const md = modalTransitionDuration ?? animationDuration;

    if (animation === 'none') {
      backdropAnim.setValue(1);
      modalOpacity.setValue(1);
      modalScale.setValue(1);
      modalTranslateY.setValue(0);
      modalTranslateX.setValue(0);
      return;
    }

    const anims: Animated.CompositeAnimation[] = [
      Animated.timing(backdropAnim, { ...timing(bd), toValue: 1 }),
      Animated.timing(modalOpacity, { ...timing(Math.round(md * 0.4)), toValue: 1 }),
    ];

    if (animation === 'scale') {
      anims.push(Animated.spring(modalScale, { ...SPRING, toValue: 1 }));
    } else if (animation === 'slide') {
      if (swipeDirection === 'up' || swipeDirection === 'down') {
        anims.push(Animated.spring(modalTranslateY, { ...SPRING, toValue: 0 }));
      } else {
        anims.push(Animated.spring(modalTranslateX, { ...SPRING, toValue: 0 }));
      }
    }

    Animated.parallel(anims).start();
  }, [
    animation,
    animationDuration,
    backdropTransitionDuration,
    modalTransitionDuration,
    swipeDirection,
  ]);

  const animateOut = useCallback(() => {
    const bd = backdropTransitionDuration ?? animationDuration;
    const md = modalTransitionDuration ?? animationDuration;

    if (animation === 'none') {
      if (isMounted.current) {
        setModalMounted(false);
        onCloseComplete?.();
      }

      return;
    }

    const anims: Animated.CompositeAnimation[] = [
      Animated.timing(backdropAnim, { ...timing(bd), toValue: 0 }),
      Animated.timing(modalOpacity, { ...timing(Math.round(md * 0.4)), toValue: 0 }),
    ];

    if (animation === 'scale') {
      anims.push(Animated.timing(modalScale, { ...timing(md), toValue: 0.88 }));
    } else if (animation === 'slide') {
      const toY = swipeDirection === 'up' ? SCREEN_HEIGHT : -SCREEN_HEIGHT;
      const toX = swipeDirection === 'left' ? SCREEN_WIDTH : -SCREEN_WIDTH;

      if (swipeDirection === 'up' || swipeDirection === 'down') {
        anims.push(Animated.timing(modalTranslateY, { ...timing(md), toValue: toY }));
      } else {
        anims.push(Animated.timing(modalTranslateX, { ...timing(md), toValue: toX }));
      }
    }

    Animated.parallel(anims).start(() => {
      if (isMounted.current) {
        setModalMounted(false);
        onCloseComplete?.();
      }
    });
  }, [
    animation,
    animationDuration,
    backdropTransitionDuration,
    modalTransitionDuration,
    swipeDirection,
    onCloseComplete,
  ]);

  const modalTransform = useMemo((): Animated.WithAnimatedObject<ViewStyle> => {
    if (animation === 'scale') {
      return { transform: [{ scale: modalScale }] };
    }

    if (animation === 'slide') {
      if (swipeDirection === 'up' || swipeDirection === 'down') {
        return { transform: [{ translateY: modalTranslateY }] };
      }

      return { transform: [{ translateX: modalTranslateX }] };
    }

    return {};
  }, [animation, modalScale, modalTranslateY, modalTranslateX, swipeDirection]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible && dismissible) {
        onClose();
        return true;
      }

      return false;
    });

    return () => h.remove();
  }, [visible, dismissible, onClose]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !closeOnEscape) return;

    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && dismissible) {
        onClose();
      }
    };

    window.addEventListener('keydown', fn);

    return () => window.removeEventListener('keydown', fn);
  }, [visible, closeOnEscape, dismissible, onClose]);

  useEffect(() => {
    if (!onOrientationChange) return;

    const sub = Dimensions.addEventListener('change', ({ window: w }) => {
      onOrientationChange(w.width > w.height ? 'landscape' : 'portrait');
    });

    return () => sub?.remove();
  }, [onOrientationChange]);

  const safeInsetStyle = useMemo((): ViewStyle => {
    if (size === 'full') {
      return {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      };
    }

    switch (position) {
      case 'bottom':
        return { paddingBottom: insets.bottom };

      case 'top':
        return { paddingTop: insets.top };

      case 'left':
        return {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
        };

      case 'right':
        return {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
        };

      default:
        return {};
    }
  }, [size, position, insets]);

  const centerInsetStyle = useMemo(
    (): ViewStyle =>
      position === 'center' && size !== 'full'
        ? { marginTop: insets.top, marginBottom: insets.bottom }
        : {},
    [position, size, insets],
  );

  const outerStyle = useMemo((): ViewStyle => {
    switch (position) {
      case 'top':
        return { justifyContent: 'flex-start', alignItems: 'center' };

      case 'bottom':
        return { justifyContent: 'flex-end', alignItems: 'stretch' };

      case 'left':
        return { justifyContent: 'center', alignItems: 'flex-start' };

      case 'right':
        return { justifyContent: 'center', alignItems: 'flex-end' };

      default:
        return { justifyContent: 'center', alignItems: 'center' };
    }
  }, [position]);

  const resolvedStatusBarStyle = statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');

  const resolvedStatusBarColor = statusBarColor ?? colors.primary;

  const handleBackdropPress = useCallback(() => {
    if (dismissible && closeOnBackdropPress) {
      onClose();
    }
  }, [dismissible, closeOnBackdropPress, onClose]);

  const renderHeader = () => {
    const hasTitle = !!title;
    const hasClose = showCloseButton && !hideCloseButton;

    if (!showHeader || (!hasTitle && !hasClose)) return null;

    return (
      <ModalHeader
        title={title}
        showCloseButton={hasClose}
        onClose={onClose}
        titleStyle={titleStyle}
        closeButtonStyle={closeButtonStyle}
        headerStyle={headerStyle}
        closeIcon={closeIcon}
        closeButtonPosition={closeButtonPosition}
        showDragHandle={false}
      />
    );
  };

  const renderBody = () => {
    if (scrollable) {
      return (
        <ScrollView
          {...scrollViewProps}
          contentContainerStyle={[styles.scrollContent, scrollViewProps?.contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      );
    }

    return <>{children}</>;
  };

  const renderLoading = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingOverlay}>
        {loadingIndicator ?? <ActivityIndicator size="large" color={colors.primary} />}
        {loadingText && <Text style={styles.loadingText}>{loadingText}</Text>}
      </View>
    );
  };

  const keyboardBehavior =
    keyboardAvoiding && Platform.OS === 'ios'
      ? 'padding'
      : keyboardAvoiding && Platform.OS === 'android'
        ? 'height'
        : undefined;

  return (
    <RNModal
      visible={modalMounted}
      transparent={transparent}
      animationType="none"
      onRequestClose={dismissible ? onClose : () => undefined}
      testID={testID}
      hardwareAccelerated={hardwareAccelerated}
      presentationStyle={presentationStyle}
      supportedOrientations={supportedOrientations}
      statusBarTranslucent={statusBarTranslucent}
    >
      <StatusBar
        hidden={hideStatusBar}
        barStyle={resolvedStatusBarStyle}
        backgroundColor={resolvedStatusBarColor}
        translucent={statusBarTranslucent}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {showBackdrop && transparent && (
          <TouchableWithoutFeedback onPress={handleBackdropPress} accessible={false}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: backdropColor ?? '#000000',
                  opacity: Animated.multiply(backdropAnim, backdropOpacity),
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}

        <KeyboardAvoidingView
          style={StyleSheet.absoluteFill}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={keyboardOffset}
          pointerEvents="box-none"
        >
          <View style={[StyleSheet.absoluteFill, outerStyle]} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.modal,
                modalTransform,
                { opacity: modalOpacity },
                safeInsetStyle,
                centerInsetStyle,
              ]}
              accessibilityLabel={accessibilityLabel}
              accessibilityViewIsModal
            >
              {renderHeader()}

              <View style={styles.content}>{renderBody()}</View>

              {renderLoading()}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

const ModalHeader: React.FC<
  ModalHeaderProps & {
    closeIcon?: React.ReactNode;
    closeButtonPosition?: 'left' | 'right';
    showDragHandle?: boolean;
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
    showDragHandle = false,
  }) => {
    const styles = useModalStyles();

    const CloseBtn = () =>
      showCloseButton ? (
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, closeButtonStyle]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          {closeIcon ?? <Text style={styles.closeButtonText}>✕</Text>}
        </TouchableOpacity>
      ) : null;

    return (
      <View style={[styles.header, headerStyle]}>
        {showDragHandle && <View style={styles.dragHandle} />}

        {closeButtonPosition === 'left' && <CloseBtn />}

        {title ? (
          <Text
            style={[styles.title, titleStyle, closeButtonPosition === 'left' && { marginLeft: 8 }]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {closeButtonPosition === 'right' && <CloseBtn />}
      </View>
    );
  },
);

ModalHeader.displayName = 'ModalHeader';

const ModalContent: React.FC<ModalContentProps & { scrollable?: boolean; scrollViewProps?: any }> =
  React.memo(({ children, style, scrollable, scrollViewProps }) => {
    if (scrollable) {
      return (
        <ScrollView
          {...scrollViewProps}
          style={style}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      );
    }

    return <View style={style}>{children}</View>;
  });

ModalContent.displayName = 'ModalContent';

const ModalFooter: React.FC<ModalFooterProps> = React.memo(({ children, style }) => {
  const styles = useModalStyles();

  return <View style={[styles.footer, style]}>{children}</View>;
});

ModalFooter.displayName = 'ModalFooter';

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;

export default Modal;
export * from './Modal.types';
