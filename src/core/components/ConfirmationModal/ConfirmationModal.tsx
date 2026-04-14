// ConfirmationModal.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import Button from '@/core/components/Button/Button';
import { ConfirmationModalProps } from './ConfirmationModal.types';
import { AppModal } from '..';
import { createConfirmationModalStyles } from './ConfirmationModal.style';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  variant = 'default',
  icon,
  type = 'warning', // 'success', 'error', 'warning', 'info'
}) => {
  const { colors } = useTheme();
  const styles = createConfirmationModalStyles(colors);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Rotate animation for warning/error icons
      if (type === 'warning' || type === 'error') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return {
          name: 'checkmark-circle',
          color: colors.success,
          bgColor: colors.success + '15',
        };
      case 'error':
        return {
          name: 'close-circle',
          color: colors.error,
          bgColor: colors.error + '15',
        };
      case 'info':
        return {
          name: 'information-circle',
          color: colors.info,
          bgColor: colors.info + '15',
        };
      case 'warning':
      default:
        return {
          name: 'warning',
          color: colors.warning,
          bgColor: colors.warning + '15',
        };
    }
  };

  const getConfirmVariant = () => {
    if (danger) return 'danger';
    if (variant === 'destructive') return 'danger';
    if (type === 'success') return 'success';
    if (type === 'error') return 'danger';
    return 'primary';
  };

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const iconConfig = getIconConfig();
  const finalIcon = icon || (
    <Ionicons name={iconConfig.name as any} size={56} color={iconConfig.color} />
  );

  return (
    <AppModal
      visible={visible}
      animation="fade"
      onClose={onCancel}
      hideCloseButton={true}
      showHeader={false}
      closeOnBackdropPress={false}
      backdropOpacity={0.6}
    >
      {/* <Animated.View
        style={[
          styles.overlay,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      > */}
      {/* Animated Icon with pulse effect */}
      <Animated.View
        style={[
          styles.iconContainer,
          { backgroundColor: iconConfig.bgColor },
          type === 'warning' && { transform: [{ rotate: spin }] },
        ]}
      >
        {finalIcon}
      </Animated.View>

      {/* Title with gradient-like effect */}
      <Text
        style={[
          styles.title,
          danger && styles.dangerTitle,
          type === 'success' && styles.successTitle,
        ]}
      >
        {title}
      </Text>

      {/* Message with improved typography */}
      <Text style={styles.message}>{message}</Text>

      {/* Divider for visual separation */}
      <View style={styles.divider} />

      {/* Actions with better button styling */}
      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel}
          style={[styles.cancelButton, loading && styles.disabledButton]}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>{cancelText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onConfirm}
          style={[
            styles.confirmButton,
            danger && styles.dangerButton,
            type === 'success' && styles.successButton,
            type === 'info' && styles.infoButton,
            loading && styles.disabledButton,
          ]}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="reload" size={18} color="#fff" />
              <Text style={styles.confirmButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.confirmButtonText}>{confirmText}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Optional footer note */}
      <Text style={styles.footerNote}>This action cannot be undone</Text>
      {/* </Animated.View> */}
    </AppModal>
  );
};

export default ConfirmationModal;
