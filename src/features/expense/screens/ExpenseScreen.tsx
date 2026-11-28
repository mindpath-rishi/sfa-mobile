import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/core/components';
import { SkeletonList } from '@/core/components/Skeleton';
import { toast } from '@/core/utils';

import { ExpenseHistoryList } from '../components/ExpenseHistoryList';
import { ExpenseSummaryCard } from '../components/ExpenseSummaryCard';
import { EXPENSE_MESSAGES } from '../constants/expense.constants';
import { expenseService } from '../services/expense.service';
import { useExpenseStyles } from '../styles/expense.styles';
import type { Expense, ExpenseRequest } from '../types/expense.types';
import { getErrorMessage } from '../utils/expense.utils';

export default function ExpenseScreen() {
  const styles = useExpenseStyles();

  const [preview, setPreview] = useState<ExpenseRequest | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [history, setHistory] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    const [previewRes, historyRes] = await Promise.allSettled([
      expenseService.preview(),
      expenseService.getMine(),
    ]);

    if (previewRes.status === 'fulfilled') {
      setPreview(previewRes.value.data);
      setPreviewError(null);
    } else {
      setPreview(null);
      setPreviewError(getErrorMessage(previewRes.reason, EXPENSE_MESSAGES.LOAD_FAILED));
    }
    if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data ?? []);

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  /** A non-rejected request already exists for this week */
  const currentWeekRequest = useMemo(
    () =>
      preview
        ? history.find(
            (e) =>
              e.status !== 'REJECTED' &&
              new Date(e.weekStart).getTime() === new Date(preview.weekStart).getTime(),
          )
        : undefined,
    [history, preview],
  );

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      await expenseService.create();
      toast.success(EXPENSE_MESSAGES.SUBMITTED);
      await load(true);
    } catch (error) {
      toast.error(getErrorMessage(error, EXPENSE_MESSAGES.SUBMIT_FAILED));
    } finally {
      setSubmitting(false);
    }
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView edges={['bottom']} style={[styles.container, styles.content]}>
        <SkeletonList rows={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
        }
      >
        {previewError && (
          <View style={styles.notice}>
            <AppText style={styles.noticeText}>{previewError}</AppText>
          </View>
        )}

        {currentWeekRequest ? (
          <>
            <View style={styles.notice}>
              <AppText style={styles.noticeText}>{EXPENSE_MESSAGES.ALREADY_RAISED}</AppText>
            </View>
            <ExpenseSummaryCard request={currentWeekRequest} />
          </>
        ) : (
          preview && (
            <>
              <ExpenseSummaryCard request={preview} />
              <AppButton
                title="Submit Expense"
                variant="primary"
                loading={submitting}
                disabled={submitting}
                onPress={submit}
              />
            </>
          )
        )}

        <ExpenseHistoryList items={history} />
      </ScrollView>
    </SafeAreaView>
  );
}
