import React, { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

type ManagerDatePickerModalProps = {
  visible: boolean;
  value: Date;
  rangeValue?: {
    startDate: Date;
    endDate: Date;
  };
  mode?: 'single' | 'range';
  title?: string;
  onClose: () => void;
  onApply: (date: Date) => void;
  onApplyRange?: (range: { startDate: Date; endDate: Date }) => void;
};

const formatPreviewDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const formatMonthTitle = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const isSameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getCalendarDates = (monthDate: Date) => {
  const monthStart = startOfMonth(monthDate);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
};

export function ManagerDatePickerModal({
  visible,
  value,
  rangeValue,
  mode = 'single',
  title = 'Select date',
  onClose,
  onApply,
  onApplyRange,
}: ManagerDatePickerModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [draftDate, setDraftDate] = useState(value);
  const [draftRange, setDraftRange] = useState({
    startDate: rangeValue?.startDate || value,
    endDate: rangeValue?.endDate || value,
  });
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(value));
  const calendarDates = useMemo(() => getCalendarDates(visibleMonth), [visibleMonth]);
  const today = useMemo(() => new Date(), []);
  const isRangeMode = mode === 'range';

  useEffect(() => {
    if (visible) {
      setDraftDate(value);
      setDraftRange({
        startDate: rangeValue?.startDate || value,
        endDate: rangeValue?.endDate || value,
      });
      setVisibleMonth(startOfMonth(rangeValue?.startDate || value));
    }
  }, [rangeValue?.endDate, rangeValue?.startDate, value, visible]);

  const handleApply = () => {
    if (isRangeMode) {
      const startDate =
        draftRange.startDate <= draftRange.endDate ? draftRange.startDate : draftRange.endDate;
      const endDate =
        draftRange.startDate <= draftRange.endDate ? draftRange.endDate : draftRange.startDate;

      onApplyRange?.({ startDate, endDate });
      onClose();
      return;
    }

    onApply(draftDate);
    onClose();
  };

  const handleSelectDate = (date: Date) => {
    if (!isRangeMode) {
      setDraftDate(date);
      return;
    }

    const sameRangeSelected = isSameDate(draftRange.startDate, draftRange.endDate);

    if (!sameRangeSelected || date < draftRange.startDate) {
      setDraftRange({ startDate: date, endDate: date });
      return;
    }

    setDraftRange((current) => ({ ...current, endDate: date }));
  };

  const isInDraftRange = (date: Date) => {
    const startDate =
      draftRange.startDate <= draftRange.endDate ? draftRange.startDate : draftRange.endDate;
    const endDate =
      draftRange.startDate <= draftRange.endDate ? draftRange.endDate : draftRange.startDate;

    return date >= startDate && date <= endDate;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="calendar-clear-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <AppText style={styles.title}>{title}</AppText>
                <AppText style={styles.selectedText}>
                  {isRangeMode
                    ? `${formatPreviewDate(draftRange.startDate)} - ${formatPreviewDate(
                        draftRange.endDate,
                      )}`
                    : formatPreviewDate(draftDate)}
                </AppText>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} activeOpacity={0.78} onPress={onClose}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWrap}>
            <View style={styles.monthHeader}>
              <TouchableOpacity
                style={styles.monthButton}
                activeOpacity={0.78}
                onPress={() => setVisibleMonth((current) => addMonths(current, -1))}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <AppText style={styles.monthTitle}>{formatMonthTitle(visibleMonth)}</AppText>
              <TouchableOpacity
                style={styles.monthButton}
                activeOpacity={0.78}
                onPress={() => setVisibleMonth((current) => addMonths(current, 1))}
              >
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((day) => (
                <AppText key={day} style={styles.weekDay}>
                  {day}
                </AppText>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {calendarDates.map((date) => {
                const selected = isRangeMode
                  ? isSameDate(date, draftRange.startDate) || isSameDate(date, draftRange.endDate)
                  : isSameDate(date, draftDate);
                const inRange = isRangeMode && isInDraftRange(date);
                const currentMonth = date.getMonth() === visibleMonth.getMonth();
                const currentDay = isSameDate(date, today);

                return (
                  <TouchableOpacity
                    key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                    style={[
                      styles.dayButton,
                      inRange && styles.dayButtonInRange,
                      currentDay && styles.dayButtonToday,
                      selected && styles.dayButtonSelected,
                    ]}
                    activeOpacity={0.78}
                    onPress={() => {
                      handleSelectDate(date);
                      if (!currentMonth) setVisibleMonth(startOfMonth(date));
                    }}
                  >
                    <AppText
                      style={[
                        styles.dayText,
                        !currentMonth && styles.dayTextMuted,
                        selected && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.78} onPress={onClose}>
              <AppText style={styles.secondaryButtonText}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.82} onPress={handleApply}>
              <AppText style={styles.primaryButtonText}>Apply</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      backgroundColor: colors.overlay,
    },
    sheet: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: 0,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryLight,
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    selectedText: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '700',
      color: colors.textTertiary,
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    calendarWrap: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    monthHeader: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    monthButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    monthTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '900',
      color: colors.textPrimary,
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    weekDay: {
      flex: 1,
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '800',
      color: colors.textTertiary,
    },
    dayGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayButton: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    dayButtonToday: {
      borderWidth: 1,
      borderColor: colors.primary,
    },
    dayButtonInRange: {
      backgroundColor: colors.primaryLight,
    },
    dayButtonSelected: {
      backgroundColor: colors.primary,
    },
    dayText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    dayTextMuted: {
      color: colors.textQuaternary,
    },
    dayTextSelected: {
      color: colors.primaryContrast,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      padding: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    secondaryButton: {
      minWidth: 96,
      minHeight: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    primaryButton: {
      minWidth: 96,
      minHeight: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.primaryContrast,
    },
  });
