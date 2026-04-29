// createTopup.styles.ts

import { StyleSheet } from 'react-native';

export const createCreateTopupStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    vanInfoCard: {
      margin: 16,
      marginBottom: 0,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    vanInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    vanName: {
      fontSize: 16,
      fontWeight: '600',
    },

    vanId: {
      fontSize: 12,
      marginTop: 2,
    },

    productsContainer: {
      flex: 1,
    },
  });
