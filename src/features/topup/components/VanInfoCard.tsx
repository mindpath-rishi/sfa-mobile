// VanInfoCard.tsx

import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { createCreateTopupStyles } from '../styles/createTopup.styles';

interface VanInfoCardProps {
  van: any;
}

export const VanInfoCard: React.FC<VanInfoCardProps> = ({ van }) => {
  const { colors } = useTheme();
  const styles = createCreateTopupStyles(colors);

  return (
    <View style={styles.vanInfoCard}>
      <View style={styles.vanInfoRow}>
        <MaterialCommunityIcons name="truck" size={20} color={colors.primary} />
        <View>
          <AppText style={[styles.vanName, { color: colors.textPrimary }]}>
            {van?.name || 'No van selected'}
          </AppText>
          <AppText style={[styles.vanId, { color: colors.textSecondary }]}>
            ID: {van?.vanId}
          </AppText>
        </View>
      </View>
    </View>
  );
};