import { AppText } from '@/core/components';
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface FooterProps {
  lastUpdated: string;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated }) => {
  return (
    <View style={styles.footer}>
      <AppText style={styles.textXSmall}>LAST UPDATED: {lastUpdated}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  textXSmall: {
    fontSize: 12,
    color: '#64748B',
  },
});
