// StockHeader.tsx

import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { AppText, SearchBar } from '@/core/components';
import { StockHeaderProps } from '../types/stock.types';

export const StockHeader: React.FC<StockHeaderProps> = ({ 
  loadNumber, 
  colors, 
  styles,
  searchQuery,
  onSearch,
  totalItems,
}) => {
  return (
    <View
      style={styles.heroSection}
    >
      <View style={styles.heroContent}>
        {loadNumber && (
          <View style={styles.loadNumberChip}>
            <Ionicons name="cube-outline" size={16} color={colors.surface} />
            <AppText style={styles.loadNumberChipText}>Load #{loadNumber}</AppText>
          </View>
        )}
      </View>

      {/* Search Bar inside Header */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={onSearch}
          placeholder="Search products..."
          debounceDelay={500}
          clearable={true}
          fullWidth={true}
        />
        {searchQuery.length > 0 && (
          <AppText style={[styles.searchResultText, { color: '#FFFFFF', opacity: 0.9 }]}>
            {totalItems} product{totalItems !== 1 ? 's' : ''} found
          </AppText>
        )}
      </View>
    </View>
  );
};