import React, { useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';

export default function QuickVizScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { setHeader } = useHeader();

  useFocusEffect(
    useCallback(() => {
      setHeader({ hidden: true, showBack: false, showMenu: false, showFilter: false });
    }, [setHeader]),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity
        style={styles.menuItem}
        activeOpacity={0.78}
        onPress={() => router.push('/(drawer)/(tabs)/quick-viz/user-performance')}
      >
        <View style={styles.menuTextWrap}>
          <AppText style={styles.menuTitle}>User Performance</AppText>
          <AppText style={styles.menuSubtitle}>Custom Date</AppText>
        </View>
        <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    menuItem: {
      minHeight: 58,
      marginHorizontal: 12,
      marginTop: 4,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundSecondary,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    menuTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    menuTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    menuSubtitle: {
      marginTop: 1,
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });
