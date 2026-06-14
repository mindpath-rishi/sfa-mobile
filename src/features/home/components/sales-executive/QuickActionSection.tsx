import React from 'react';
import { View, ScrollView } from 'react-native';
import { QuickAction as QuickActionComponent } from './QuickAction';
import { useQuickActionsSectionStyles } from '../../styles/QuickActionSection.styles';
import { QuickActionsSectionProps } from '../../types/quickaction.types';
import { SectionHeader } from '@/core/components';

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  actions,
  onPressAction,
}) => {
  const styles = useQuickActionsSectionStyles();

  return (
    <View style={styles.container}>
      <SectionHeader title="QUICK ACTIONS" variant="small" titleStyle={styles.sectionTitle} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
      </ScrollView>
    </View>
  );
};
