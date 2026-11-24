import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

/*
 * Mirrors the native splash (app icon centred on white) so the native splash can
 * be hidden as soon as this is on screen without a visible jump; it then fades
 * out when the app is ready.
 */
SplashScreen.preventAutoHideAsync().catch(() => undefined);

const SPLASH_BACKGROUND = '#FFFFFF';
/** Matches `imageWidth` of the expo-splash-screen plugin in app.config.ts. */
const ICON_SIZE = 200;
const FADE_OUT_MS = 300;
/** Avoid a flash when startup is very fast. */
const MIN_VISIBLE_MS = 300;
/** Never hold the app behind the splash if the image fails to load. */
const IMAGE_LOAD_TIMEOUT_MS = 2000;

type AppSplashProps = {
  ready: boolean;
  onHidden: () => void;
};

export function AppSplash({ ready, onHidden }: AppSplashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [shownAt, setShownAt] = useState<number | null>(null);

  const markShown = () => {
    setShownAt((current) => {
      if (current != null) return current;
      SplashScreen.hideAsync().catch(() => undefined);
      return Date.now();
    });
  };

  useEffect(() => {
    const timer = setTimeout(markShown, IMAGE_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || shownAt == null) return;

    const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(() => onHidden());
    }, remaining);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, shownAt]);

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <Animated.Image
        source={require('../../../assets/images/sales-stream-logo.png')}
        style={styles.image}
        resizeMode="contain"
        fadeDuration={0}
        onLoadEnd={markShown}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  image: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
});
