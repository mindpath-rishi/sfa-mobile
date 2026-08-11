import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FooterProps {
  lastUpdated: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.footer}>
      <AppText style={[styles.label, { color: colors.textTertiary }]}>LAST UPDATED:</AppText>
      <AppText style={[styles.value, { color: colors.textSecondary }]}>{lastUpdated}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
});
