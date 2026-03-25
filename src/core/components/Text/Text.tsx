import React, { memo } from 'react';
import { Text as RNText } from 'react-native';
import { CoreTextProps } from './Text.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { styleUtils } from '@/shared/theme/styles';

/**
 * Outside component to avoid recreation on every render
 */
const variantMap = {
  body: styleUtils.fontSize.base,
  caption: styleUtils.fontSize.sm,
  subtitle: styleUtils.fontSize.lg,
  title: styleUtils.fontSize.xl,
  heading: styleUtils.fontSize['2xl'],
};

function Text({
  variant = 'body',
  style,
  color,
  errorText,
  children,
  ...props
}: CoreTextProps & { errorText?: boolean }) {
  const { colors } = useTheme();

  const isError = Boolean(errorText);

  return (
    <RNText
      {...props}
      accessibilityRole={isError ? 'alert' : undefined}
      style={[
        {
          fontSize: variantMap[variant],
          color: isError ? colors.error : (color ?? colors.textPrimary),
          textAlign: styleUtils.textAlign(),
          writingDirection: styleUtils.writingDirection(),
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

Text.displayName = 'Text';

export default memo(Text);
