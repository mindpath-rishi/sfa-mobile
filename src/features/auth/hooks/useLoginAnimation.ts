import { useEffect } from 'react';
import { useSharedValue, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated';

export const useLoginAnimation = () => {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Entrance animations
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 0.5,
    });

    logoOpacity.value = withTiming(1, {
      duration: 800,
    });

    formOpacity.value = withTiming(1, {
      duration: 1000,
    });
  }, []);

  const animatedLogo = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedForm = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return {
    animatedLogo,
    animatedForm,
    animatedButton,
    buttonScale,
  };
};
