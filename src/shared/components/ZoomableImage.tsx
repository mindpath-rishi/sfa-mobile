import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const STEP_SCALE = 1.5;

export type ZoomableImageHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  reset: () => void;
};

type ZoomableImageProps = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  onLoadEnd?: () => void;
  onError?: () => void;
};

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

/**
 * Image with pinch-to-zoom, pan, two-finger rotate and double-tap zoom.
 * The parent drives the toolbar buttons through the ref.
 */
export const ZoomableImage = forwardRef<ZoomableImageHandle, ZoomableImageProps>(
  ({ uri, style, onLoadEnd, onError }, ref) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const savedRotation = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const animateTo = (next: { scale?: number; rotation?: number; centre?: boolean }) => {
      if (next.scale != null) {
        scale.value = withTiming(next.scale);
        savedScale.value = next.scale;
      }
      if (next.rotation != null) {
        rotation.value = withTiming(next.rotation);
        savedRotation.value = next.rotation;
      }
      if (next.centre) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    };

    // Buttons rotate in 90° steps from the nearest right angle, so a free
    // two-finger rotation followed by a button press lands upright again.
    const snapRotation = (delta: number) =>
      Math.round(savedRotation.value / (Math.PI / 2)) * (Math.PI / 2) + delta;

    useImperativeHandle(ref, () => ({
      zoomIn: () => animateTo({ scale: Math.min(savedScale.value * STEP_SCALE, MAX_SCALE) }),
      zoomOut: () => {
        const nextScale = Math.max(savedScale.value / STEP_SCALE, MIN_SCALE);
        animateTo({ scale: nextScale, centre: nextScale === MIN_SCALE });
      },
      rotateLeft: () => animateTo({ rotation: snapRotation(-Math.PI / 2) }),
      rotateRight: () => animateTo({ rotation: snapRotation(Math.PI / 2) }),
      reset: () => animateTo({ scale: 1, rotation: 0, centre: true }),
    }));

    const pinch = Gesture.Pinch()
      .onUpdate((event) => {
        scale.value = clamp(savedScale.value * event.scale, MIN_SCALE * 0.8, MAX_SCALE);
      })
      .onEnd(() => {
        const settled = clamp(scale.value, MIN_SCALE, MAX_SCALE);
        scale.value = withTiming(settled);
        savedScale.value = settled;
        if (settled === MIN_SCALE) {
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        }
      });

    const rotate = Gesture.Rotation()
      .onUpdate((event) => {
        rotation.value = savedRotation.value + event.rotation;
      })
      .onEnd(() => {
        savedRotation.value = rotation.value;
      });

    const pan = Gesture.Pan()
      .averageTouches(true)
      .onUpdate((event) => {
        if (savedScale.value <= MIN_SCALE && scale.value <= MIN_SCALE) return;
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        const nextScale = savedScale.value > MIN_SCALE ? MIN_SCALE : DOUBLE_TAP_SCALE;
        scale.value = withTiming(nextScale);
        savedScale.value = nextScale;
        if (nextScale === MIN_SCALE) {
          translateX.value = withTiming(0);
          translateY.value = withTiming(0);
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        }
      });

    const gesture = Gesture.Simultaneous(pinch, rotate, pan, doubleTap);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}rad` },
      ],
    }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.Image
          source={{ uri }}
          resizeMode="contain"
          style={[styles.image, style, animatedStyle]}
          onLoadEnd={onLoadEnd}
          onError={onError}
        />
      </GestureDetector>
    );
  },
);

ZoomableImage.displayName = 'ZoomableImage';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
