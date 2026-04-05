import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { useSearchBarStyles } from '../../styles/SearchBar.styles';

interface Props {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  delay?: number; // Optional custom delay in milliseconds
}

export const SearchBar: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  delay = 500, // Default 500ms delay
}) => {
  const { colors } = useTheme();
  const styles = useSearchBarStyles();

  const [inputValue, setInputValue] = useState(searchQuery);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update input value when searchQuery prop changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced search handler
  const handleInputChange = useCallback(
    (text: string) => {
      setInputValue(text);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        setSearchQuery(text);
      }, delay);
    },
    [delay, setSearchQuery],
  );

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle clear button press
  const handleClear = useCallback(() => {
    setInputValue('');
    setSearchQuery('');

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [setSearchQuery]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor={colors.placeholder}
          value={inputValue}
          onChangeText={handleInputChange}
        />
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
