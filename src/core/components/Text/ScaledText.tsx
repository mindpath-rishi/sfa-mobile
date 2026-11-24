import React, { forwardRef } from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
} from 'react-native';

/**
 * Largest system font scale honoured. Large accessibility font settings still
 * enlarge text, but are capped so fixed layouts (badges, tabs, cards) don't break.
 */
export const MAX_FONT_SCALE = 1.3;

/** Drop-in for react-native's Text with the app's font-scale cap. */
export const Text = forwardRef<RNText, TextProps>((props, ref) => (
  <RNText maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} ref={ref} />
));
Text.displayName = 'Text';
export type Text = RNText;

/** Drop-in for react-native's TextInput with the app's font-scale cap. */
export const TextInput = forwardRef<RNTextInput, TextInputProps>((props, ref) => (
  <RNTextInput maxFontSizeMultiplier={MAX_FONT_SCALE} {...props} ref={ref} />
));
TextInput.displayName = 'TextInput';
export type TextInput = RNTextInput;
