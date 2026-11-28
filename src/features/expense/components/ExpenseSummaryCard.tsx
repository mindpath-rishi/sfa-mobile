import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/core/components';
import { EXPENSE_OPTION_LABEL } from '../constants/expense.constants';
import { useExpenseStyles } from '../styles/expense.styles';
import type { ExpenseRequest } from '../types/expense.types';
import { formatAmount, formatExpenseDate } from '../utils/expense.utils';

interface Props {
  request: ExpenseRequest;
}

const Row = ({ label, value }: { label: string; value: string | number }) => {
  const styles = useExpenseStyles();
  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <AppText weight="semibold" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
};

export function ExpenseSummaryCard({ request }: Props) {
  const styles = useExpenseStyles();

  return (
    <View style={styles.card}>
      <AppText variant="subtitle" weight="bold" style={styles.cardTitle}>
        {EXPENSE_OPTION_LABEL[request.expenseOption]} · {request.expenseTag}
      </AppText>

      <Row label="From Date" value={formatExpenseDate(request.fromDate)} />
      <Row label="To Date" value={formatExpenseDate(request.toDate)} />
      <View style={styles.divider} />
      <Row label="No. of Days" value={request.noOfDays} />
      <Row label="To Be Adjusted Days" value={request.toBeAdjustedDays} />
      <Row label="Payable Days" value={request.payableDays} />
      <View style={styles.divider} />
      <Row label="Per Day Value" value={formatAmount(request.perDayValue)} />
      <Row
        label={
          request.withdrawalChargePercent
            ? `Withdrawal Charges (${request.withdrawalChargePercent}%)`
            : 'Withdrawal Charges'
        }
        value={formatAmount(request.withdrawalCharges)}
      />
      <View style={styles.row}>
        <AppText weight="bold" style={styles.value}>
          Total Amount
        </AppText>
        <AppText variant="title" weight="bold" style={styles.totalValue}>
          {formatAmount(request.totalAmount)}
        </AppText>
      </View>

      {!!request.remarks && (
        <AppText variant="caption" style={styles.muted}>
          Routes: {request.remarks}
        </AppText>
      )}

      {request.toBeAdjustedDays > 0 && (
        <AppText variant="caption" style={styles.muted}>
          Adjusted for absent days in previous cycle:{' '}
          {request.adjustedDates.map((d) => formatExpenseDate(d)).join(', ')}
        </AppText>
      )}
    </View>
  );
}
