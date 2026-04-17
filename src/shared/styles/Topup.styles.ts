// shared/styles/Topup.styles.ts
import { StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export const useTopupStyles = () => {
  const { colors } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    searchWrapper: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    listContent: {
      paddingBottom: 100,
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });
};
