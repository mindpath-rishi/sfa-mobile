import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { LoaderStyleProps } from './Loader.types';
import { useLoaderStyles } from './Loader.styles';
import { useTheme } from '@/shared/hooks/useTheme';

type Props = LoaderStyleProps & {
  color?: string;
  label?: string;
};

const Loader: React.FC<Props> = ({
  size = 'medium',
  fullScreen = false,
  overlay = false,
  disabled = false,
  color,
  label,
}) => {
  const { colors } = useTheme();

  const styles = useLoaderStyles({
    size,
    fullScreen,
    overlay,
    disabled,
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={color || colors.primary}
        style={styles.indicator}
      />
      {label ? <Text style={styles.text}>{label}</Text> : null}
    </View>
  );
};

export default Loader;