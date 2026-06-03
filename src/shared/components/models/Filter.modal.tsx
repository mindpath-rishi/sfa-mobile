import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { useTheme } from '@/shared/hooks/useTheme';
import { useFilterModalStyles } from '@/shared/styles/FilterModal.styles';
import { FilterModalProps, FilterSection } from '@/shared/types/filter.types';
import { AppButton, AppText, AppModal } from '@/core/components';

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  sections: initialSections,
  onApply,
  onReset,
  title = 'Filters',
  applyButtonText = 'Apply',
  resetButtonText = 'Reset',
  cancelButtonText = 'Cancel',
  showCount = true,
  maxHeight = 600,
}) => {
  const { colors } = useTheme();
  const styles = useFilterModalStyles();

  const [sections, setSections] = useState<FilterSection[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [iosDatePicker, setIosDatePicker] = useState<{
    sectionId: string;
    type: 'min' | 'max';
    value: Date;
  } | null>(null);

  const formatDateValue = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const parseDateValue = useCallback((value?: number | string) => {
    if (!value || typeof value !== 'string') return new Date();
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return new Date();
    return new Date(year, month - 1, day);
  }, []);

  // Initialize sections and expanded state
  useEffect(() => {
    const expanded: Record<string, boolean> = {};
    initialSections.forEach((s) => {
      expanded[s.id] = s.expanded || false;
    });
    setExpandedSections(expanded);
    setSections(initialSections);
  }, [initialSections]);

  // Handlers
  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSingleSelect = useCallback((sectionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, selectedId: optionId } : s)),
    );
  }, []);

  const handleMultipleSelect = useCallback((sectionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const selected = s.selectedIds || [];
        return {
          ...s,
          selectedIds: selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId],
        };
      }),
    );
  }, []);

  const handleToggle = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, toggleValue: !s.toggleValue } : s)),
    );
  }, []);

  const handleRangeChange = useCallback((sectionId: string, type: 'min' | 'max', value: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const currentRange = s.rangeValue || { min: '', max: '' };
        return {
          ...s,
          rangeValue: { ...currentRange, [type]: value },
        };
      }),
    );
  }, []);

  const openDatePicker = useCallback(
    (section: FilterSection, type: 'min' | 'max') => {
      const value = parseDateValue(section.rangeValue?.[type]);

      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value,
          mode: 'date',
          onChange: (_event, date) => {
            if (date) handleRangeChange(section.id, type, formatDateValue(date));
          },
        });
        return;
      }

      setIosDatePicker({ sectionId: section.id, type, value });
    },
    [formatDateValue, handleRangeChange, parseDateValue],
  );

  const handleSearchChange = useCallback((sectionId: string, value: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, searchValue: value } : s)));
  }, []);

  const handleApply = useCallback(() => {
    onApply(sections);
    onClose();
  }, [sections, onApply, onClose]);

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
    } else {
      setSections(
        initialSections.map((s) => ({
          ...s,
          selectedIds: [],
          selectedId: undefined,
          toggleValue: false,
          rangeValue: { min: '', max: '' },
          searchValue: '',
        })),
      );
    }
  }, [onReset, initialSections]);

  // Calculate active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    sections.forEach((s) => {
      if (s.type === 'multiple' && s.selectedIds?.length) {
        count += s.selectedIds.length;
      } else if (s.type === 'single' && s.selectedId) {
        count++;
      } else if (s.type === 'toggle' && s.toggleValue) {
        count++;
      } else if (s.type === 'range' && (s.rangeValue?.min || s.rangeValue?.max)) {
        count++;
      } else if (s.type === 'date' && (s.rangeValue?.min || s.rangeValue?.max)) {
        count++;
      } else if (s.type === 'search' && s.searchValue) {
        count++;
      }
    });
    return count;
  }, [sections]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchText) return sections;
    return sections.filter((s) => s.title.toLowerCase().includes(searchText.toLowerCase()));
  }, [sections, searchText]);

  // Render section content based on type
  const renderSectionContent = useCallback(
    (section: FilterSection) => {
      switch (section.type) {
        case 'single':
          return section.options?.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionRow}
              onPress={() => handleSingleSelect(section.id, opt.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.radio, section.selectedId === opt.id && styles.radioSelected]}>
                  {section.selectedId === opt.id && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                {opt.icon && (
                  <Ionicons name={opt.icon} size={18} color={opt.color || colors.textSecondary} />
                )}
                <AppText style={styles.optionLabel}>{opt.label}</AppText>
              </View>
              {showCount && opt.count !== undefined && (
                <AppText variant="caption" style={styles.optionCount}>
                  {opt.count}
                </AppText>
              )}
            </TouchableOpacity>
          ));

        case 'multiple':
          return section.options?.map((opt) => {
            const isSelected = section.selectedIds?.includes(opt.id) || false;
            return (
              <TouchableOpacity
                key={opt.id}
                style={styles.optionRow}
                onPress={() => handleMultipleSelect(section.id, opt.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  {opt.icon && (
                    <Ionicons name={opt.icon} size={18} color={opt.color || colors.textSecondary} />
                  )}
                  <AppText style={styles.optionLabel}>{opt.label}</AppText>
                </View>
                {showCount && opt.count !== undefined && (
                  <AppText variant="caption" style={styles.optionCount}>
                    {opt.count}
                  </AppText>
                )}
              </TouchableOpacity>
            );
          });

        case 'toggle':
          return (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => handleToggle(section.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.toggle, section.toggleValue && styles.toggleActive]}>
                  <View
                    style={[styles.toggleCircle, section.toggleValue && styles.toggleCircleActive]}
                  />
                </View>
                <AppText style={styles.optionLabel}>
                  {section.toggleValue ? 'Enabled' : 'Disabled'}
                </AppText>
              </View>
            </TouchableOpacity>
          );

        case 'range':
          return (
            <View style={styles.rangeContainer}>
              <View style={styles.rangeInputs}>
                <View style={styles.rangeInputWrapper}>
                  <AppText variant="caption" style={styles.rangeLabel}>
                    Min
                  </AppText>
                  <TextInput
                    style={[styles.rangeInput, { borderColor: colors.border }]}
                    value={section.rangeValue?.min?.toString() || ''}
                    onChangeText={(value) => handleRangeChange(section.id, 'min', value)}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
                <View style={styles.rangeSeparator}>
                  <AppText style={styles.rangeSeparatorText}>to</AppText>
                </View>
                <View style={styles.rangeInputWrapper}>
                  <AppText variant="caption" style={styles.rangeLabel}>
                    Max
                  </AppText>
                  <TextInput
                    style={[styles.rangeInput, { borderColor: colors.border }]}
                    value={section.rangeValue?.max?.toString() || ''}
                    onChangeText={(value) => handleRangeChange(section.id, 'max', value)}
                    placeholder="Any"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          );

        case 'date':
          return (
            <View style={styles.rangeContainer}>
              <View style={styles.rangeInputs}>
                <View style={styles.rangeInputWrapper}>
                  <AppText variant="caption" style={styles.rangeLabel}>
                    Start
                  </AppText>
                  <TouchableOpacity
                    style={[styles.dateInput, { borderColor: colors.border }]}
                    onPress={() => openDatePicker(section, 'min')}
                    activeOpacity={0.75}
                  >
                    <AppText
                      style={[
                        styles.dateInputText,
                        !section.rangeValue?.min && { color: colors.textTertiary },
                      ]}
                    >
                      {section.rangeValue?.min?.toString() || 'Select date'}
                    </AppText>
                    <Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.rangeSeparator}>
                  <AppText style={styles.rangeSeparatorText}>to</AppText>
                </View>
                <View style={styles.rangeInputWrapper}>
                  <AppText variant="caption" style={styles.rangeLabel}>
                    End
                  </AppText>
                  <TouchableOpacity
                    style={[styles.dateInput, { borderColor: colors.border }]}
                    onPress={() => openDatePicker(section, 'max')}
                    activeOpacity={0.75}
                  >
                    <AppText
                      style={[
                        styles.dateInputText,
                        !section.rangeValue?.max && { color: colors.textTertiary },
                      ]}
                    >
                      {section.rangeValue?.max?.toString() || 'Select date'}
                    </AppText>
                    <Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );

        case 'search':
          return (
            <View style={styles.searchContainer}>
              <View style={[styles.searchInputWrapper, { borderColor: colors.border }]}>
                <Ionicons name="search" size={18} color={colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  value={section.searchValue}
                  onChangeText={(value) => handleSearchChange(section.id, value)}
                  placeholder={section.searchPlaceholder || 'Search...'}
                  placeholderTextColor={colors.textTertiary}
                  autoFocus={false}
                />
                {section.searchValue && (
                  <TouchableOpacity onPress={() => handleSearchChange(section.id, '')}>
                    <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );

        default:
          return null;
      }
    },
    [
      colors,
      showCount,
      styles,
      handleSingleSelect,
      handleMultipleSelect,
      handleToggle,
      handleRangeChange,
      openDatePicker,
      handleSearchChange,
    ],
  );

  // Render section header
  const renderSection = useCallback(
    (section: FilterSection) => {
      const expanded = expandedSections[section.id];
      const hasActiveValue =
        (section.type === 'multiple' && (section.selectedIds?.length ?? 0) > 0) ||
        (section.type === 'single' && section.selectedId) ||
        (section.type === 'toggle' && section.toggleValue) ||
        ((section.type === 'range' || section.type === 'date') &&
          (section.rangeValue?.min || section.rangeValue?.max)) ||
        (section.type === 'search' && section.searchValue);

      return (
        <View key={section.id} style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(section.id)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              {section.icon && <Ionicons name={section.icon} size={20} color={colors.primary} />}
              <AppText style={styles.sectionTitle}>{section.title}</AppText>
            </View>

            <View style={styles.sectionHeaderRight}>
              {hasActiveValue && (
                <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                  {section.type === 'multiple' && (section.selectedIds?.length ?? 0) > 0 ? (
                    <AppText variant="caption" style={styles.activeBadgeText}>
                      {section.selectedIds?.length ?? 0}
                    </AppText>
                  ) : (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
              )}
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {expanded && <View style={styles.optionsContainer}>{renderSectionContent(section)}</View>}
        </View>
      );
    },
    [expandedSections, colors, styles, toggleSection, renderSectionContent],
  );

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      position="bottom"
      animation="slide"
      closeOnBackdropPress={true}
      dismissible={true}
      showHeader={false}
      hideCloseButton={true}
    >
      <View style={[styles.modalContent, { maxHeight, backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <AppText style={styles.modalTitle}>{title}</AppText>
            {activeCount > 0 && (
              <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
                <AppText variant="caption" style={styles.headerBadgeText}>
                  {activeCount}
                </AppText>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Global Search */}
        {sections.length > 5 && (
          <View style={styles.globalSearchContainer}>
            <View style={[styles.globalSearchInput, { borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textTertiary} />
              <TextInput
                style={styles.globalSearchText}
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search filters..."
                placeholderTextColor={colors.textTertiary}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        {/* Sections */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredSections.map(renderSection)}
        </ScrollView>

        {Platform.OS !== 'android' && iosDatePicker && (
          <DateTimePicker
            value={iosDatePicker.value}
            mode="date"
            display="spinner"
            onChange={(_event, date) => {
              if (date) {
                handleRangeChange(
                  iosDatePicker.sectionId,
                  iosDatePicker.type,
                  formatDateValue(date),
                );
              }
              setIosDatePicker(null);
            }}
          />
        )}

        {/* Footer */}
        <View style={styles.modalFooter}>
          <AppButton
            title={resetButtonText}
            variant="outline"
            onPress={handleReset}
            style={styles.footerResetButton}
          />
          <AppButton
            title={`${applyButtonText}${activeCount > 0 ? ` (${activeCount})` : ''}`}
            onPress={handleApply}
            style={styles.footerApplyButton}
          />
        </View>
      </View>
    </AppModal>
  );
};
