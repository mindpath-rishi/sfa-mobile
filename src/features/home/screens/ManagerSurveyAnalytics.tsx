import React, { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { AppText } from '@/core/components';
import { useHeader } from '@/shared/contexts/HeaderContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { createManagerSurveyAnalyticsStyles } from '../styles/ManagerSurveyAnalytics.styles';

type SurveyView = 'list' | 'detail';
type SurveyTab = 'ALL' | 'ONGOING' | 'COMPLETED';

export default function ManagerSurveyAnalyticsScreen() {
  const { colors } = useTheme();
  const styles = createManagerSurveyAnalyticsStyles(colors);
  const { setHeader } = useHeader();
  const [view, setView] = useState<SurveyView>('list');
  const [tab, setTab] = useState<SurveyTab>('ALL');

  useFocusEffect(
    useCallback(() => {
      setHeader({
        title: view === 'detail' ? 'Van Details' : 'Survey Analytics',
        showBack: true,
        showMenu: false,
        showFilter: false,
        rightIcon: view === 'list' ? 'refresh-cw' : undefined,
        backgroundColor: colors.primary,
      });
    }, [colors.primary, setHeader, view]),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {view === 'list' ? (
        <>
          <View style={styles.tabs}>
            {(['ALL', 'ONGOING', 'COMPLETED'] as SurveyTab[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.tab, tab === item && styles.tabActive]}
                activeOpacity={0.82}
                onPress={() => setTab(item)}
              >
                <AppText style={[styles.tabText, tab === item && styles.tabTextActive]}>
                  {item}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.surveyCard}
            activeOpacity={0.84}
            onPress={() => setView('detail')}
          >
            <View style={styles.surveyHeader}>
              <AppText style={styles.title}>Van Details</AppText>
              <View style={styles.statusPill}>
                <AppText style={styles.statusText}>Ongoing</AppText>
              </View>
            </View>
            <View style={styles.dateRow}>
              <View>
                <AppText style={styles.dateText}>Tuesday, 22-Apr-2025</AppText>
                <AppText style={styles.dateLabel}>Survey Start Date</AppText>
              </View>
              <View>
                <AppText style={styles.dateText}>Sunday, 16-Nov-2025</AppText>
                <AppText style={styles.dateLabel}>Last Response Date</AppText>
              </View>
            </View>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.detailCard}>
          <View style={styles.questionHeader}>
            <AppText style={styles.questionText}>1. Take a picture of the number plate</AppText>
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.8}
              onPress={() => setView('list')}
            >
              <Ionicons name="close" size={17} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <View style={styles.mediaRow}>
            <View style={styles.thumbnail}>
              <Ionicons name="car-outline" size={20} color={colors.textTertiary} />
            </View>
            <View style={styles.thumbnail}>
              <Ionicons name="camera-outline" size={20} color={colors.textTertiary} />
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <AppText style={styles.viewAllText}>View all</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
