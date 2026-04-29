import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SearchBarProps } from './SearchBar.types';
import { useTheme } from '@/shared/hooks/useTheme';
import { createSearchBarStyles } from './SearchBar.styles';

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  debounceDelay = 300,
  disabled = false,
  loading = false,
  clearable = true,
  leftIcon,
  rightIcon,
  onClear,
  fullWidth = true,
  style,
  inputStyle,
  testID = 'search-bar',
  animation = true,
}) => {
  const { colors } = useTheme();
  const styles = createSearchBarStyles(colors);

  const [localValue, setLocalValue] = useState(value);

  /* -------------------- Debounce -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [localValue, debounceDelay, value, onChangeText]);

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  /* -------------------- Handlers -------------------- */
  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  }, [onClear, onChangeText]);

  const renderLeftIcon = () => {
    if (leftIcon) return leftIcon;

    return <Ionicons name="search-outline" size={20} color={colors.textTertiary} />;
  };

  const renderRightIcon = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={colors.primary} />;
    }

    if (clearable && localValue.length > 0) {
      return (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      );
    }

    if (rightIcon) return rightIcon;

    return null;
  };

  /* -------------------- Styles -------------------- */
  const containerStyle = useMemo(() => {
    return [styles.container, fullWidth && styles.fullWidth, disabled && styles.disabled, style];
  }, [styles, fullWidth, disabled, style]);

  /* -------------------- Render -------------------- */
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      style={({ pressed }) => [containerStyle, pressed && animation && styles.pressed]}
    >
      <View style={styles.icon}>{renderLeftIcon()}</View>

      <TextInput
        value={localValue}
        onChangeText={setLocalValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        editable={!disabled}
        style={[styles.input, inputStyle]}
      />

      <View style={styles.icon}>{renderRightIcon()}</View>
    </Pressable>
  );
};

export default SearchBar;
