import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/hooks/useTheme';
import { FilterModalProps, FilterSection } from '@/shared/types/filter.types';
import { useFilterModalStyles } from '@/shared/styles/FilterModal.styles';

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  sections: initialSections,
  onApply,
  onReset,
  title = 'Filters',
  showCount = true,
  applyButtonText = 'Apply',
  resetButtonText = 'Reset',
  cancelButtonText = 'Cancel',
  maxHeight = 600,
}) => {
  const { colors } = useTheme();
  const styles = useFilterModalStyles();

  const [sections, setSections] = useState<FilterSection[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');

  // Initialize expanded sections
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    sections.forEach((section) => {
      initialExpanded[section.id] = section.expanded || false;
    });
    setExpandedSections(initialExpanded);
  }, [sections]);

  // Update sections when initialSections change
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSingleSelect = (sectionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, selectedId: optionId } : section,
      ),
    );
  };

  const handleMultipleSelect = (sectionId: string, optionId: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          const selectedIds = section.selectedIds || [];
          return {
            ...section,
            selectedIds: selectedIds.includes(optionId)
              ? selectedIds.filter((id) => id !== optionId)
              : [...selectedIds, optionId],
          };
        }
        return section;
      }),
    );
  };

  const handleToggle = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, toggleValue: !section.toggleValue } : section,
      ),
    );
  };

  const handleRangeChange = (sectionId: string, type: 'min' | 'max', value: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          const currentRange = section.rangeValue || { min: '', max: '' };
          return {
            ...section,
            rangeValue: {
              ...currentRange,
              [type]: value,
            },
          };
        }
        return section;
      }),
    );
  };

  const handleSearchChange = (sectionId: string, value: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, searchValue: value } : section,
      ),
    );
  };

  const handleApply = () => {
    onApply(sections);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setSections(
        initialSections.map((section) => ({
          ...section,
          selectedIds: [],
          selectedId: undefined,
          toggleValue: false,
          rangeValue: { min: '', max: '' },
          searchValue: '',
        })),
      );
    }
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    sections.forEach((section) => {
      if (section.type === 'multiple' && section.selectedIds?.length) {
        count += section.selectedIds.length;
      } else if (section.type === 'single' && section.selectedId) {
        count += 1;
      } else if (section.type === 'toggle' && section.toggleValue) {
        count += 1;
      } else if (section.type === 'range' && (section.rangeValue?.min || section.rangeValue?.max)) {
        count += 1;
      } else if (section.type === 'search' && section.searchValue) {
        count += 1;
      }
    });
    return count;
  };

  const renderSection = (section: FilterSection) => {
    switch (section.type) {
      case 'single':
        return (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionHeaderLeft}>
                {section.icon && <Ionicons name={section.icon} size={20} color={colors.primary} />}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {section.selectedId && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.activeBadgeText}>1</Text>
                  </View>
                )}
                <Ionicons
                  name={expandedSections[section.id] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {expandedSections[section.id] && (
              <View style={styles.optionsContainer}>
                {section.options?.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.optionRow}
                    onPress={() => handleSingleSelect(section.id, option.id)}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.radio,
                          section.selectedId === option.id && styles.radioSelected,
                        ]}
                      >
                        {section.selectedId === option.id && (
                          <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      {option.icon && (
                        <Ionicons
                          name={option.icon}
                          size={18}
                          color={option.color || colors.textSecondary}
                        />
                      )}
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </View>
                    {showCount && option.count !== undefined && (
                      <Text style={styles.optionCount}>{option.count}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'multiple':
        return (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionHeaderLeft}>
                {section.icon && <Ionicons name={section.icon} size={20} color={colors.primary} />}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {section.selectedIds && section.selectedIds.length > 0 && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.activeBadgeText}>{section.selectedIds.length}</Text>
                  </View>
                )}
                <Ionicons
                  name={expandedSections[section.id] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {expandedSections[section.id] && (
              <View style={styles.optionsContainer}>
                {section.options?.map((option) => {
                  const isSelected = section.selectedIds?.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionRow}
                      onPress={() => handleMultipleSelect(section.id, option.id)}
                    >
                      <View style={styles.optionLeft}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        {option.icon && (
                          <Ionicons
                            name={option.icon}
                            size={18}
                            color={option.color || colors.textSecondary}
                          />
                        )}
                        <Text style={styles.optionLabel}>{option.label}</Text>
                      </View>
                      {showCount && option.count !== undefined && (
                        <Text style={styles.optionCount}>{option.count}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );

      case 'toggle':
        return (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionHeaderLeft}>
                {section.icon && <Ionicons name={section.icon} size={20} color={colors.primary} />}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {section.toggleValue && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
                <Ionicons
                  name={expandedSections[section.id] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {expandedSections[section.id] && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity style={styles.toggleRow} onPress={() => handleToggle(section.id)}>
                  <View style={styles.optionLeft}>
                    <View style={[styles.toggle, section.toggleValue && styles.toggleActive]}>
                      <View
                        style={[
                          styles.toggleCircle,
                          section.toggleValue && styles.toggleCircleActive,
                        ]}
                      />
                    </View>
                    <Text style={styles.optionLabel}>
                      {section.toggleValue ? 'Enabled' : 'Disabled'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case 'range':
        return (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionHeaderLeft}>
                {section.icon && <Ionicons name={section.icon} size={20} color={colors.primary} />}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {(section.rangeValue?.min || section.rangeValue?.max) && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="funnel" size={12} color="white" />
                  </View>
                )}
                <Ionicons
                  name={expandedSections[section.id] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {expandedSections[section.id] && (
              <View style={styles.rangeContainer}>
                <View style={styles.rangeInputs}>
                  <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeLabel}>Min</Text>
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
                    <Text style={styles.rangeSeparatorText}>to</Text>
                  </View>
                  <View style={styles.rangeInputWrapper}>
                    <Text style={styles.rangeLabel}>Max</Text>
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
            )}
          </View>
        );

      case 'search':
        return (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionHeaderLeft}>
                {section.icon && <Ionicons name={section.icon} size={20} color={colors.primary} />}
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <View style={styles.sectionHeaderRight}>
                {section.searchValue && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Ionicons name="search" size={12} color="white" />
                  </View>
                )}
                <Ionicons
                  name={expandedSections[section.id] ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {expandedSections[section.id] && (
              <View style={styles.searchContainer}>
                <View style={[styles.searchInputWrapper, { borderColor: colors.border }]}>
                  <Ionicons name="search" size={18} color={colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    value={section.searchValue}
                    onChangeText={(value) => handleSearchChange(section.id, value)}
                    placeholder={section.searchPlaceholder || 'Search...'}
                    placeholderTextColor={colors.textTertiary}
                  />
                  {section.searchValue ? (
                    <TouchableOpacity onPress={() => handleSearchChange(section.id, '')}>
                      <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const activeCount = getActiveFilterCount();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, maxHeight }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalTitle}>{title}</Text>
              {activeCount > 0 && (
                <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.headerBadgeText}>{activeCount}</Text>
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

          {/* Search All Filters (optional) */}
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
              </View>
            </View>
          )}

          {/* Filter Sections */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {sections
              .filter(
                (section) =>
                  !searchText || section.title.toLowerCase().includes(searchText.toLowerCase()),
              )
              .map((section) => (
                <View key={section.id}>{renderSection(section)}</View>
              ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>
                {resetButtonText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                {applyButtonText} {activeCount > 0 ? `(${activeCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
