// components/customer/CustomerCreateModal.tsx
import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Keyboard,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useCustomerCreateStyles } from '@/shared/styles/CustomerCreateModal.styles';
import CameraModal from '@/core/components/Camera/CameraModal';
import { useRouteStore } from '@/core/store/route.store';

interface CustomerCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerData, photo?: string) => void;
  loading?: boolean;
}

export interface CustomerData {
  name: string;
  ownerName: string;
  phoneNumber: string;
  address: {
    line1: string;
    line2: string;
  };
  customerCategoryId: string;
  channelId: string;
  customerTypeId: string;
  marketId: string;
  provinceId: string;
  segmentation: string;
  creditLimit: number;
  creditDays: number;
  countryId: string;
}

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'phone' | 'dropdown' | 'address';
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  required: boolean;
}

interface FormSection {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  fields: FormField[];
}

// Dropdown Modal Component
const DropdownModal = ({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  options: { id: string; name: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title: string;
}) => {
  const { colors } = useTheme();
  const styles = useCustomerCreateStyles();

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      position="bottom"
      animation="slide"
      showCloseButton={true}
      closeOnBackdropPress={true}
    >
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dropdownOptionItem,
              selectedValue === item.id && styles.dropdownOptionSelected,
            ]}
            onPress={() => {
              onSelect(item.id);
              onClose();
            }}
          >
            <AppText
              style={[
                styles.dropdownOptionText,
                selectedValue === item.id && styles.dropdownOptionTextSelected,
              ]}
            >
              {item.name}
            </AppText>
            {selectedValue === item.id && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.dropdownSeparator, { backgroundColor: colors.border }]} />
        )}
      />
    </AppModal>
  );
};

const FORM_SECTIONS: FormSection[] = [
  {
    title: 'Basic Information',
    description: 'Enter essential customer details',
    icon: 'business',
    fields: [
      {
        key: 'name',
        label: 'Customer Name',
        type: 'text',
        icon: 'business-outline',
        placeholder: 'Business name or customer',
        required: true,
      },
      {
        key: 'ownerName',
        label: 'Owner Name',
        type: 'text',
        icon: 'person-outline',
        placeholder: 'Full name of owner',
        required: true,
      },
      {
        key: 'phoneNumber',
        label: 'Phone Number',
        type: 'phone',
        icon: 'call-outline',
        placeholder: '0XX XXX XXXX',
        required: true,
      },
      {
        key: 'addressLine1',
        label: 'Street Address',
        type: 'address',
        icon: 'location-outline',
        placeholder: 'Main address line',
        required: true,
      },
      {
        key: 'addressLine2',
        label: 'Additional Address',
        type: 'address',
        icon: 'location-outline',
        placeholder: 'Suite, building, etc.',
        required: false,
      },
    ],
  },
  {
    title: 'Classification',
    description: 'Define customer category and segmentation',
    icon: 'grid',
    fields: [
      {
        key: 'customerCategoryId',
        label: 'Category',
        type: 'dropdown',
        icon: 'grid-outline',
        placeholder: 'Select category',
        required: true,
      },
      {
        key: 'channelId',
        label: 'Channel',
        type: 'dropdown',
        icon: 'git-branch-outline',
        placeholder: 'Select channel',
        required: true,
      },
      {
        key: 'customerTypeId',
        label: 'Customer Type',
        type: 'dropdown',
        icon: 'people-outline',
        placeholder: 'Select type',
        required: true,
      },
    ],
  },
  {
    title: 'Location & Segment',
    description: 'Set market position and geographic details',
    icon: 'map',
    fields: [
      // {
      //   key: 'marketId',
      //   label: 'Market',
      //   type: 'dropdown',
      //   icon: 'stats-chart-outline',
      //   placeholder: 'Select market',
      //   required: true,
      // },
      // {
      //   key: 'provinceId',
      //   label: 'Province',
      //   type: 'dropdown',
      //   icon: 'map-outline',
      //   placeholder: 'Select province',
      //   required: true,
      // },
      {
        key: 'segmentation',
        label: 'Segment',
        type: 'dropdown',
        icon: 'pie-chart-outline',
        placeholder: 'Select segment',
        required: true,
      },
    ],
  },
  // {
  //   title: 'Credit Terms',
  //   description: 'Configure credit limit and payment terms',
  //   icon: 'card',
  //   fields: [
  //     {
  //       key: 'creditLimit',
  //       label: 'Credit Limit (ZMW)',
  //       type: 'number',
  //       icon: 'card-outline',
  //       placeholder: '0.00',
  //       required: false,
  //     },
  //     {
  //       key: 'creditDays',
  //       label: 'Credit Days',
  //       type: 'number',
  //       icon: 'calendar-outline',
  //       placeholder: '30',
  //       required: false,
  //     },
  //   ],
  // },
];

const dropdownOptions = {
  customerCategoryId: [
    { id: 'CAT001', name: 'Retail' },
    { id: 'CAT002', name: 'Wholesale' },
    { id: 'CAT003', name: 'Distributor' },
  ],
  channelId: [
    { id: 'CH001', name: 'Van Sale' },
    { id: 'CH002', name: 'Retail' },
  ],
  customerTypeId: [
    { id: 'TYPE001', name: 'Regular' },
    { id: 'TYPE002', name: 'Premium' },
    { id: 'TYPE003', name: 'VIP' },
  ],
  // marketId: [
  //   { id: 'MKT001', name: 'Urban' },
  //   { id: 'MKT002', name: 'Rural' },
  //   { id: 'MKT003', name: 'Semi-Urban' },
  // ],
  // provinceId: [
  //   { id: 'PROV001', name: 'Lusaka' },
  //   { id: 'PROV002', name: 'Copperbelt' },
  //   { id: 'PROV003', name: 'Southern' },
  // ],
  segmentation: [
    { id: 'A', name: 'A' },
    { id: 'A-', name: 'A-' },
    { id: 'A+', name: 'A+' },

    { id: 'B', name: 'B' },
    { id: 'B-', name: 'B-' },
    { id: 'B+', name: 'B+' },

    { id: 'C', name: 'C' },
    { id: 'C-', name: 'C-' },
    { id: 'C+', name: 'C+' },
  ],
};

export const CustomerCreateModal: React.FC<CustomerCreateModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { colors } = useTheme();
  const styles = useCustomerCreateStyles();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  const [currentStep, setCurrentStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const selectedRoute = useRouteStore((state) => state.selectedRoute);

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<{
    visible: boolean;
    field: string | null;
    options: DropdownOption[];
    title: string;
  }>({
    visible: false,
    field: null,
    options: [],
    title: '',
  });

  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    ownerName: '',
    phoneNumber: '',
    address: { line1: '', line2: '' },
    customerCategoryId: 'CAT001',
    channelId: 'CH001',
    customerTypeId: 'TYPE001',
    marketId: selectedRoute?.marketId || 'TJJJJJJ',
    provinceId: selectedRoute?.provinceId || 'TESTPRO',
    segmentation: '',
    creditLimit: 0,
    creditDays: 0,
    countryId: 'ZAMBIA',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentSection = useMemo(() => FORM_SECTIONS[currentStep], [currentStep]);
  const totalSteps = FORM_SECTIONS.length;
  const isLastStep = currentStep === totalSteps - 1;

  const validateField = useCallback((field: FormField, value: any): string => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }
    if (field.key === 'phoneNumber' && value) {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Invalid phone number (10-15 digits)';
      }
    }
    return '';
  }, []);

  const validateCurrentSection = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of currentSection.fields) {
      let value: any;
      if (field.key === 'addressLine1') {
        value = formData.address.line1;
      } else if (field.key === 'addressLine2') {
        value = formData.address.line2;
      } else {
        value = formData[field.key as keyof CustomerData];
      }

      const error = validateField(field, value);
      if (error) {
        newErrors[field.key] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentSection, formData, validateField]);

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 100);
  };

  const handleSubmit = () => {
    // if (validateCurrentSection()) {
    Keyboard.dismiss();
    onSubmit(formData, capturedPhoto || undefined);
    // }
  };

  const updateField = (key: string, value: any) => {
    if (key === 'addressLine1') {
      setFormData((prev) => ({ ...prev, address: { ...prev.address, line1: value } }));
    } else if (key === 'addressLine2') {
      setFormData((prev) => ({ ...prev, address: { ...prev.address, line2: value } }));
    } else if (key === 'creditLimit' || key === 'creditDays') {
      setFormData((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleFieldFocus = (fieldKey: string) => {
    setFocusedField(fieldKey);
  };

  const handleFieldSubmit = (nextFieldKey?: string) => {
    if (nextFieldKey && inputRefs.current[nextFieldKey]) {
      inputRefs.current[nextFieldKey]?.focus();
    }
  };

  const openDropdown = (fieldKey: string, options: any[], title: string) => {
    Keyboard.dismiss();
    setActiveDropdown({
      visible: true,
      field: fieldKey,
      options,
      title,
    });
  };

  const closeDropdown = () => {
    setActiveDropdown((prev) => ({ ...prev, visible: false }));
  };

  const handleDropdownSelect = (value: string) => {
    if (activeDropdown.field) {
      updateField(activeDropdown.field, value);
      setTouchedFields((prev) => new Set(prev).add(activeDropdown.field!));
    }
    closeDropdown();
  };

  const handlePhotoCapture = (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setShowCamera(false);
  };

  const handleRemovePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setCapturedPhoto(null) },
    ]);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setCapturedPhoto(null);
    setFormData({
      name: '',
      ownerName: '',
      phoneNumber: '',
      address: { line1: '', line2: '' },
      customerCategoryId: '',
      channelId: 'CH002',
      customerTypeId: '',
      marketId: '',
      provinceId: 'PROV001',
      segmentation: '',
      creditLimit: 0,
      creditDays: 0,
      countryId: selectedRoute?.countryId || 'ZAMBIA',
    });
    setErrors({});
    setTouchedFields(new Set());
    setFocusedField(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderFormField = (field: FormField, index: number, fields: FormField[]) => {
    let value: any;
    if (field.key === 'addressLine1') {
      value = formData.address.line1;
    } else if (field.key === 'addressLine2') {
      value = formData.address.line2;
    } else {
      value = formData[field.key as keyof CustomerData];
    }

    const error = errors[field.key];
    const isTouched = touchedFields.has(field.key);
    const isFocused = focusedField === field.key;

    const nextField = fields[index + 1];
    const nextFieldKey = nextField?.key;

    if (field.type === 'dropdown') {
      const options = dropdownOptions[field.key as keyof typeof dropdownOptions];
      const selectedOption = options?.find((opt) => opt.id === value);

      return (
        <View key={field.key} style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <AppText style={styles.fieldLabel}>
              {field.label}
              {field.required && <AppText style={styles.requiredBadge}>*</AppText>}
            </AppText>
          </View>
          <TouchableOpacity
            style={[
              styles.dropdownField,
              isFocused && styles.fieldFocused,
              error && isTouched && styles.fieldError,
            ]}
            onPress={() => openDropdown(field.key, options, `Select ${field.label}`)}
          >
            <Ionicons name={field.icon} size={18} color={colors.textSecondary} />
            <AppText style={[styles.dropdownFieldText, !value && styles.placeholderText]}>
              {selectedOption?.name || field.placeholder}
            </AppText>
            <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          {error && isTouched && <AppText style={styles.errorMessage}>{error}</AppText>}
        </View>
      );
    }

    return (
      <View key={field.key} style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <AppText style={styles.fieldLabel}>
            {field.label}
            {field.required && <AppText style={styles.requiredBadge}>*</AppText>}
          </AppText>
          {isTouched && !error && value && (
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          )}
        </View>
        <View
          style={[
            styles.inputField,
            isFocused && styles.fieldFocused,
            error && isTouched && styles.fieldError,
          ]}
        >
          <Ionicons name={field.icon} size={18} color={colors.textSecondary} />
          <TextInput
            ref={(ref) => {
              inputRefs.current[field.key] = ref;
            }}
            style={styles.textInput}
            placeholder={field.placeholder}
            placeholderTextColor={colors.textTertiary}
            value={value?.toString() || ''}
            onChangeText={(text) => updateField(field.key, text)}
            // onFocus={() => handleFieldFocus(field.key)}
            onBlur={() => {
              setFocusedField(null);
              setTouchedFields((prev) => new Set(prev).add(field.key));
            }}
            onSubmitEditing={() => handleFieldSubmit(nextFieldKey)}
            returnKeyType={nextFieldKey ? 'next' : 'done'}
            blurOnSubmit={!nextFieldKey}
            keyboardType={
              field.type === 'phone'
                ? 'phone-pad'
                : field.type === 'number'
                  ? 'decimal-pad'
                  : 'default'
            }
            editable={!loading}
          />
        </View>
        {error && isTouched && <AppText style={styles.errorMessage}>{error}</AppText>}
      </View>
    );
  };

  const renderPhotoSection = () => (
    <View style={styles.photoSectionContainer}>
      <View style={styles.photoSectionHeader}>
        <Ionicons name="camera" size={20} color={colors.primary} />
        <View style={styles.photoSectionTitleContainer}>
          <AppText style={styles.photoSectionTitle}>Customer Photo</AppText>
          <AppText style={styles.photoSectionDescription}>Optional profile picture</AppText>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.photoCard, capturedPhoto && styles.photoCardFilled]}
        onPress={() => setShowCamera(true)}
        activeOpacity={0.9}
      >
        {capturedPhoto ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: capturedPhoto }} style={styles.photoPreview} />
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={[styles.photoActionButton, styles.photoRetakeButton]}
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="camera-reverse-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoActionButton, styles.photoRemoveButton]}
                onPress={handleRemovePhoto}
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <View style={styles.photoPlaceholderIcon}>
              <Ionicons name="camera-outline" size={32} color={colors.primary} />
            </View>
            <AppText style={styles.photoPlaceholderTitle}>Take Photo</AppText>
            <AppText style={styles.photoPlaceholderText}>Tap to add customer photo</AppText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <AppText style={styles.summaryTitle}>Summary</AppText>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>Business Name</AppText>
          <AppText style={styles.summaryValue} numberOfLines={1}>
            {formData.name || '—'}
          </AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>Owner</AppText>
          <AppText style={styles.summaryValue} numberOfLines={1}>
            {formData.ownerName || '—'}
          </AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>Phone</AppText>
          <AppText style={styles.summaryValue} numberOfLines={1}>
            {formData.phoneNumber || '—'}
          </AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText style={styles.summaryLabel}>Category</AppText>
          <AppText style={styles.summaryValue} numberOfLines={1}>
            {dropdownOptions.customerCategoryId.find((c) => c.id === formData.customerCategoryId)
              ?.name || '—'}
          </AppText>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <AppModal
        visible={visible}
        onClose={handleClose}
        title={`Create Customer - ${currentSection.title}`}
        size="full"
        position="bottom"
        animation="slide"
        showCloseButton={true}
        closeOnBackdropPress={!loading}
        contentStyle={{ padding: 0, flex: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / totalSteps) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.progressText}>
              <AppText style={styles.progressLabel}>
                Step {currentStep + 1} of {totalSteps}
              </AppText>
            </View>
          </View>

          {/* Form Content */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          >
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Ionicons name={currentSection.icon} size={28} color={colors.primary} />
              <View style={styles.sectionTitleContainer}>
                <AppText style={styles.sectionTitle}>{currentSection.title}</AppText>
                <AppText style={styles.sectionDescription}>{currentSection.description}</AppText>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.fieldsContainer}>
              {currentSection.fields.map((field, index, fields) =>
                renderFormField(field, index, fields),
              )}
            </View>

            {/* Photo Section on Last Step */}
            {isLastStep && renderPhotoSection()}

            {/* Summary on Last Step */}
            {isLastStep && renderSummary()}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerContainer}>
            <View style={styles.footerActions}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleBack}
                  disabled={loading}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.primary} />
                  <AppText style={styles.secondaryButtonText}>Back</AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  currentStep === 0 && styles.fullWidthButton,
                  loading && styles.buttonLoading,
                ]}
                onPress={isLastStep ? handleSubmit : handleNext}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <AppText style={styles.primaryButtonText}>
                      {isLastStep ? 'Create Customer' : 'Next'}
                    </AppText>
                    {!isLastStep && <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />}
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AppModal>

      {/* Dropdown Modal */}
      <DropdownModal
        visible={activeDropdown.visible}
        onClose={closeDropdown}
        options={activeDropdown.options}
        selectedValue={
          activeDropdown.field
            ? (formData[activeDropdown.field as keyof CustomerData] as string)
            : ''
        }
        onSelect={handleDropdownSelect}
        title={activeDropdown.title}
      />

      {/* Camera Modal */}
      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(photo) => handlePhotoCapture(photo.uri)}
        title="CAPTURE CUSTOMER PHOTO"
      />
    </>
  );
};
