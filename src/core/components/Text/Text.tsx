import React, { memo } from 'react';
import { Text as RNText } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { styleUtils } from '@/shared/theme/styles';
import { CoreTextProps, TextVariant, TextWeight } from './Text.types';

/**
 * Typography system
 */
const variantMap: Record<TextVariant, number> = {
  body: styleUtils.fontSize.base,
  caption: styleUtils.fontSize.sm,
  subtitle: styleUtils.fontSize.lg,
  title: styleUtils.fontSize.xl,
  heading: styleUtils.fontSize['2xl'],
};

/**
 * Font weight system
 */
const weightMap: Record<TextWeight, any> = {
  light: styleUtils.getFontWeight('300'),
  regular: styleUtils.getFontWeight('400'),
  medium: styleUtils.getFontWeight('500'),
  semibold: styleUtils.getFontWeight('600'),
  bold: styleUtils.getFontWeight('700'),
};

function AppText({
  variant = 'body',
  weight = 'regular',
  color,
  align = 'auto',
  numberOfLines,
  ellipsizeMode = 'tail',
  errorText,
  muted,
  center,
  children,
  style,
  ...props
}: CoreTextProps & {
  weight?: TextWeight;
  align?: 'left' | 'center' | 'right' | 'auto';
  errorText?: boolean;
  muted?: boolean;
  center?: boolean;
}) {
  const { colors } = useTheme();

  const isError = Boolean(errorText);

  const resolvedColor = isError
    ? colors.error
    : muted
      ? colors.textTertiary
      : (color ?? colors.textPrimary);

  return (
    <RNText
      {...props}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      accessibilityRole={isError ? 'alert' : undefined}
      style={[
        {
          fontSize: variantMap[variant],
          fontWeight: weightMap[weight],
          color: resolvedColor,
          textAlign: center ? 'center' : align,
          writingDirection: styleUtils.writingDirection(),
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

AppText.displayName = 'AppText';

export default memo(AppText);
