import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { OutletStatus } from '../../types/outlet.types';
import { useOutletStatusBadgeStyles } from '../../styles/OutletStatusBadge.styles';

interface Props {
  status: OutletStatus;
}

export const OutletStatusBadge: React.FC<Props> = ({ status }) => {
  const { colors } = useTheme();
  const styles = useOutletStatusBadgeStyles();

  const getStatusColor = (status: OutletStatus) => {
    switch (status) {
      case 'ACTIVE':
        return colors.success;
      case 'INACTIVE':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor(status) + '20' }]}>
      <Text style={[styles.text, { color: getStatusColor(status) }]}>{status}</Text>
    </View>
  );
};
