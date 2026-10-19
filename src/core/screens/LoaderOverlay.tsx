import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useLoaderStore } from '../loader/loader.store';
import { useTheme } from '@/shared/hooks/useTheme';
import HolographicLoader from './HolographicLoader';

/** Fast requests finish before this, so the blur/spinner never flashes. */
const SPINNER_DELAY_MS = 300;

const LoaderOverlay = () => {
  const { visible, message, type } = useLoaderStore(
    useShallow((state) => ({ visible: state.visible, message: state.message, type: state.type })),
  );
  const { colors, isDark } = useTheme();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowSpinner(false);
      return;
    }
    const timer = setTimeout(() => setShowSpinner(true), SPINNER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  // Touches are blocked from the first moment, exactly as before; only the
  // visible blur and spinner wait for the request to take noticeable time.
  // Success/error messages are meant to be read, so they show immediately.
  // collapsable={false} keeps Android from flattening away the blocking view.
  if (!showSpinner && type === 'spinner') {
    return <View collapsable={false} style={styles.container} />;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' },
      ]}
    >
      <BlurView
        intensity={isDark ? 30 : 50}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <HolographicLoader size={120} color={colors.primary} />

        {message && <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoaderOverlay;
