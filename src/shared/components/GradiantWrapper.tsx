import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/hooks/useTheme';

interface GradientWrapperProps {
  children: React.ReactNode;
}

export const GradientWrapper: React.FC<GradientWrapperProps> = ({ children }) => {
  const { colors } = useTheme();

  return (
    <>
      <LinearGradient
        colors={[colors.primary + '30', colors.primary + '10', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        pointerEvents="none"
      />
      {children}
    </>
  );
};
