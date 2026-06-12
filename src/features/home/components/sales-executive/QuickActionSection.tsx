import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuickAction as QuickActionComponent } from './QuickAction';
import { useQuickActionsSectionStyles } from '../../styles/QuickActionSection.styles';
import { QuickActionsSectionProps } from '../../types/quickaction.types';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  actions,
  onPressAction,
}) => {
  const { colors } = useTheme();
  const styles = useQuickActionsSectionStyles();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleIcon}>
          <Ionicons name="flash-outline" size={14} color={colors.primary} />
        </View>
        <AppText style={styles.title}>Quick Actions</AppText>
      </View>
      <View style={styles.actionsRow}>
        {actions.map((action: any, index) => (
          <QuickActionComponent
            key={index}
            icon={action.icon}
            label={action.label}
            color={action.color}
            badge={action.badge}
            onPress={() => onPressAction(action.route)}
          />
        ))}
      </View>
    </View>
  );
};
