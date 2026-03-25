import { AppText } from '@/core/components';
import App from 'app';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    fontSize: 10,
    color: '#64748B',
  },
});
