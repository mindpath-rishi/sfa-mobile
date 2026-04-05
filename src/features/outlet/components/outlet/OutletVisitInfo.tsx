import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { Outlet } from '../../types/outlet.types';
import { useOutletVisitInfoStyles } from '../../styles/OutletVisitInfo.styles';

interface Props {
  outlet: Outlet;
}

export const OutletVisitInfo: React.FC<Props> = ({ outlet }) => {
  const { colors } = useTheme();
  const styles = useOutletVisitInfoStyles();

  return (
    <View style={styles.container}>
      <View style={styles.visitItem}>
        <Ionicons name="calendar" size={14} color={colors.textTertiary} />
        <Text style={styles.lastVisitText}>Last: {outlet.lastVisit}</Text>
      </View>
      <View style={styles.visitItem}>
        <Ionicons name="calendar" size={14} color={colors.primary} />
        <Text style={styles.nextVisitText}>Next: {outlet.nextVisit}</Text>
      </View>
    </View>
  );
};
