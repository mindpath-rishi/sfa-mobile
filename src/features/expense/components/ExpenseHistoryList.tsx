import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { EXPENSE_MESSAGES, EXPENSE_STATUS_LABEL } from '../constants/expense.constants';
import { useExpenseStyles } from '../styles/expense.styles';
import type { Expense } from '../types/expense.types';
import { formatAmount, formatExpenseDate, getStatusColor } from '../utils/expense.utils';

interface Props {
  items: Expense[];
}

export function ExpenseHistoryList({ items }: Props) {
  const styles = useExpenseStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" weight="bold" style={styles.cardTitle}>
        My Requests
      </AppText>

      {items.length === 0 ? (
        <AppText variant="caption" style={styles.muted}>
          {EXPENSE_MESSAGES.NO_HISTORY}
        </AppText>
      ) : (
        items.map((item) => {
          const statusColor = getStatusColor(item.status, colors);
          return (
            <View key={item.expenseId} style={styles.historyItem}>
              <View style={styles.row}>
                <AppText weight="semibold" style={styles.value}>
                  {formatExpenseDate(item.fromDate)} – {formatExpenseDate(item.toDate)}
                </AppText>
                <View style={[styles.chip, { backgroundColor: statusColor + '20' }]}>
                  <AppText weight="semibold" style={[styles.chipText, { color: statusColor }]}>
                    {EXPENSE_STATUS_LABEL[item.status]}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" style={styles.label}>
                {item.payableDays} payable days · Total {formatAmount(item.totalAmount)}
              </AppText>
              {!!item.actionRemarks && (
                <AppText variant="caption" style={styles.muted}>
                  {item.actionRemarks}
                </AppText>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}
