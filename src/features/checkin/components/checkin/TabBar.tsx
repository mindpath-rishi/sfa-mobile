// components/TabBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { TabType } from '../../types/checkin.types';
import { useTabBarStyles } from '../../styles/TabBar.styles';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const styles = useTabBarStyles();
  const tabs: TabType[] = ['sale', 'non-sale', 'collection'];

  const getTabLabel = (tab: TabType): string => {
    switch (tab) {
      case 'sale':
        return 'Sale';
      case 'non-sale':
        return 'Non Sale';
      case 'collection':
        return 'Collection';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {getTabLabel(tab)}
          </Text>
          {activeTab === tab && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};
