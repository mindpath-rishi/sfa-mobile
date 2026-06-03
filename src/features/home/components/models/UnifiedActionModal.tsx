import React from 'react';
import { View, TouchableOpacity, Modal, FlatList, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import { useUnifiedActionModalStyles } from '../../styles/UnifiedActionModal.styles';

export type ModalType =
  | 'van-change'
  | 'van-selection'
  | 'route-selection'
  | 'activity-change'
  | 'other-work'
  | 'leave-type';

export interface UnifiedActionModalProps {
  visible: boolean;
  modalType: ModalType;
  
  // Van Change Modal Props
  vanChangeReason?: string;
  onSelectVanChangeReason?: (reason: string) => void;
  onVanChangeSubmit?: () => void;

  // Van Selection Modal Props
  vans?: any[];
  selectedVan?: any;
  onSelectVan?: (van: any) => void;
  vanChangeNote?: string;
  onChangeVanChangeNote?: (note: string) => void;
  onVanSelectionSubmit?: () => void;
  onVanSelectionBack?: () => void;
  
  // Route Selection Modal Props
  routes?: any[];
  assignedVan?: any;
  onSelectRoute?: (route: any) => void;
  
  // Activity Change Modal Props
  showChangeOtherOptions?: boolean;
  selectedActivity?: string;
  activityTypes?: any[];
  otherWorkOptions?: any[];
  onActivitySelect?: (activity: any) => void;
  onOtherWorkSelect?: (work: any) => void;
  onBackToOptions?: () => void;

  // Leave Type Modal Props
  leaveTypes?: any[];
  selectedLeaveType?: string;
  onLeaveTypeSelect?: (leaveType: any) => void;
  onLeaveBack?: () => void;
  
  // Mode Selection
  isDayStart?: boolean; // true for day start, false for activity change
  
  // Common Props
  onClose: () => void;
}

export const UnifiedActionModal: React.FC<UnifiedActionModalProps> = ({
  visible,
  modalType,
  vanChangeReason,
  onSelectVanChangeReason,
  onVanChangeSubmit,
  vans,
  selectedVan,
  onSelectVan,
  vanChangeNote,
  onChangeVanChangeNote,
  onVanSelectionSubmit,
  onVanSelectionBack,
  routes,
  assignedVan,
  onSelectRoute,
  showChangeOtherOptions,
  selectedActivity,
  activityTypes,
  otherWorkOptions,
  onActivitySelect,
  onOtherWorkSelect,
  onBackToOptions,
  leaveTypes,
  selectedLeaveType,
  onLeaveTypeSelect,
  onLeaveBack,
  isDayStart = false,
  onClose,
}) => {
  const styles = useUnifiedActionModalStyles();
  const { colors } = useTheme();

  const isVanSelectionValid = Boolean(selectedVan) && Boolean(vanChangeNote?.trim());

  const getModalTitle = () => {
    if (modalType === 'leave-type') {
      return 'SELECT LEAVE TYPE';
    }
    if (isDayStart) {
      return 'START YOUR DAY';
    }
    return showChangeOtherOptions ? 'SELECT WORK TYPE' : 'CHANGE ACTIVITY';
  };

  const getCurrentActivityText = () => {
    if (isDayStart) {
      return 'Starting your day with:';
    }
    return `Currently working on:`;
  };

  const renderVanChangeModal = () => (
    <>
      {/* Drag Indicator */}
      <View style={styles.dragIndicator}>
        <View style={[styles.dragIndicatorBar, { backgroundColor: colors.border }]} />
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
        <MaterialCommunityIcons name="truck" size={32} color={colors.primary} />
      </View>

      {/* Title */}
      <AppText style={[styles.title, { color: colors.textPrimary }]}>
        Same Van?
      </AppText>

      {/* Question */}
      <AppText style={[styles.questionText, { color: colors.textSecondary }]}>
        Do you want to continue with the mapped van?
      </AppText>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          onPress={() => onSelectVanChangeReason?.('Yes, Same Van')}
          style={[
            styles.optionItem,
            vanChangeReason === 'Yes, Same Van' && styles.optionItemSelected,
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <View style={[styles.optionIcon, { backgroundColor: colors.success + '10' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
            </View>
            <View style={styles.optionTextContainer}>
              <AppText style={[
                styles.optionTitle,
                vanChangeReason === 'Yes, Same Van' && styles.optionTextSelected
              ]}>
                Yes, Same Van
              </AppText>
              <AppText style={[styles.optionDescription, { color: colors.textTertiary }]}>
                Continue with currently mapped van
              </AppText>
            </View>
            {vanChangeReason === 'Yes, Same Van' && (
              <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectVanChangeReason?.('No, Change Van')}
          style={[
            styles.optionItem,
            vanChangeReason === 'No, Change Van' && styles.optionItemSelected,
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.optionContent}>
            <View style={[styles.optionIcon, { backgroundColor: colors.warning + '10' }]}>
              <MaterialCommunityIcons name="truck-fast" size={20} color={colors.warning} />
            </View>
            <View style={styles.optionTextContainer}>
              <AppText style={[
                styles.optionTitle,
                vanChangeReason === 'No, Change Van' && styles.optionTextSelected
              ]}>
                No, Change Van
              </AppText>
              <AppText style={[styles.optionDescription, { color: colors.textTertiary }]}>
                Select a different van for this route
              </AppText>
            </View>
            {vanChangeReason === 'No, Change Van' && (
              <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.cancelButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <AppText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
            Cancel
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onVanChangeSubmit}
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            !vanChangeReason && styles.submitButtonDisabled
          ]}
          activeOpacity={0.85}
          disabled={!vanChangeReason}
        >
          <AppText style={styles.submitButtonText}>Continue</AppText>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderVanSelectionModal = () => (
    <>
      <View style={styles.modalHeader}>
        <View>
          <AppText style={[styles.titleSmall, { color: colors.textPrimary }]}>Select Van</AppText>
          <AppText style={[styles.routeHeaderSubtitle, { color: colors.textSecondary }]}>
            Provide a reason and choose a different van
          </AppText>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.routeCloseButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.reasonContainer}>
        <AppText style={[styles.reasonLabel, { color: colors.textSecondary }]}>
          Reason for van change
        </AppText>
        <TextInput
          value={vanChangeNote || ''}
          onChangeText={(t) => onChangeVanChangeNote?.(t)}
          placeholder="Type reason..."
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.reasonInput,
            { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface },
          ]}
          multiline
        />
      </View>

      <View style={styles.routeListHeader}>
        <AppText style={[styles.routeListTitle, { color: colors.textPrimary }]}>Available Vans</AppText>
        <AppText style={[styles.routeListCount, { color: colors.textTertiary }]}>
          {vans?.length || 0} vans
        </AppText>
      </View>

      <FlatList
        data={vans}
        keyExtractor={(item: any) => item.vanId || item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.vanListContainer}
        renderItem={({ item }: { item: any }) => {
          const isSelected = selectedVan?.vanId && item?.vanId && selectedVan.vanId === item.vanId;
          return (
            <TouchableOpacity
              onPress={() => onSelectVan?.(item)}
              style={[styles.vanItem, { borderColor: isSelected ? colors.primary : colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.vanItemLeft}>
                <View style={[styles.vanAvatar, { backgroundColor: colors.primary + '10' }]}>
                  <MaterialCommunityIcons name="truck" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.vanName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item?.name || item?.vanName || 'Van'}
                  </AppText>
                  <AppText style={[styles.vanNumber, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item?.vanNumber || item?.registrationNumber || ''}
                  </AppText>
                </View>
              </View>
              {isSelected ? (
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
              ) : (
                <MaterialCommunityIcons name="circle-outline" size={20} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyRoutesContainer}>
            <MaterialCommunityIcons name="truck-alert" size={48} color={colors.textTertiary} />
            <AppText style={[styles.emptyRoutesText, { color: colors.textSecondary }]}>
              No vans available
            </AppText>
            <AppText style={[styles.emptyRoutesSubtext, { color: colors.textTertiary }]}>
              Please contact your administrator
            </AppText>
          </View>
        )}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onVanSelectionBack || onClose}
          style={[styles.cancelButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <AppText style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Back</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onVanSelectionSubmit}
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary },
            !isVanSelectionValid && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!isVanSelectionValid}
        >
          <AppText style={styles.submitButtonText}>Start Day</AppText>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </>
  );

const renderRouteSelectionModal = () => (
  <>
    {/* Header */}
    <View style={styles.routeHeader}>
      <View>
        <AppText style={[styles.routeHeaderTitle, { color: colors.textPrimary }]}>
          Select Route
        </AppText>
        <AppText style={[styles.routeHeaderSubtitle, { color: colors.textSecondary }]}>
          Choose a route to start your retailing activity
        </AppText>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.routeCloseButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>

    {/* Van Info Card - Improved */}
    {assignedVan && (
      <View style={[styles.vanInfoCardImproved, { backgroundColor: colors.primary + '08', borderLeftColor: colors.primary }]}>
        <View style={styles.vanInfoIcon}>
          <MaterialCommunityIcons name="truck-check" size={20} color={colors.primary} />
        </View>
        <View style={styles.vanInfoContent}>
          <AppText style={[styles.vanInfoLabel, { color: colors.textSecondary }]}>
            Assigned Van
          </AppText>
          <AppText style={[styles.vanInfoValue, { color: colors.textPrimary }]}>
            {assignedVan.name} • {assignedVan.vanNumber}
          </AppText>
          {vanChangeReason && vanChangeReason !== 'Yes, Same Van' && (
            <View style={styles.vanChangeBadge}>
              <MaterialCommunityIcons name="refresh" size={12} color={colors.warning} />
              <AppText style={[styles.vanChangeText, { color: colors.warning }]}>
                Van changed
              </AppText>
            </View>
          )}
        </View>
      </View>
    )}

    {/* Route List Header */}
    <View style={styles.routeListHeader}>
      <AppText style={[styles.routeListTitle, { color: colors.textPrimary }]}>
        Available Routes
      </AppText>
      <AppText style={[styles.routeListCount, { color: colors.textTertiary }]}>
        {routes?.length || 0} routes
      </AppText>
    </View>

    {/* Routes List */}
    <FlatList
      data={routes}
      keyExtractor={(item: any) => item.routeId || item.vanId || item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.routeListContainer}
      renderItem={({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity 
          onPress={() => onSelectRoute?.(item)} 
          style={styles.routeItemImproved}
          activeOpacity={0.7}
        >
          {/* Route Number Badge */}
          <View style={styles.routeNumberBadge}>
            <AppText style={styles.routeNumberText}>{index + 1}</AppText>
          </View>

          {/* Route Icon */}
          <LinearGradient 
            colors={[item.color || '#4158D0', item.color ? item.color + 'CC' : '#C850C0']} 
            style={styles.routeIconImproved}
          >
            <Ionicons name="map-outline" size={22} color="white" />
          </LinearGradient>

          {/* Route Details */}
          <View style={styles.routeContentImproved}>
            <AppText style={[styles.routeNameImproved, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.name}
            </AppText>
            <View style={styles.routeMetaRow}>
              <View style={styles.routeMetaItem}>
                <Ionicons name="location-outline" size={12} color={colors.textTertiary} />
                <AppText style={[styles.routeMetaText, { color: colors.textSecondary }]}>
                  {item.stops || item.totalShops || 0} stops
                </AppText>
              </View>
              <View style={styles.routeMetaDot} />
              <View style={styles.routeMetaItem}>
                <Ionicons name="resize-outline" size={12} color={colors.textTertiary} />
                <AppText style={[styles.routeMetaText, { color: colors.textSecondary }]}>
                  {item.distance || 'N/A'}
                </AppText>
              </View>
            </View>
          </View>

          {/* Select Indicator */}
          <View style={styles.routeSelectIndicator}>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={() => (
        <View style={styles.emptyRoutesContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={48} color={colors.textTertiary} />
          <AppText style={[styles.emptyRoutesText, { color: colors.textSecondary }]}>
            No routes available
          </AppText>
          <AppText style={[styles.emptyRoutesSubtext, { color: colors.textTertiary }]}>
            Please contact your administrator
          </AppText>
        </View>
      )}
    />
  </>
);

  // Handle Other Work selection - this will show the other work options
  const handleOtherWorkPress = () => {
    if (onActivitySelect) {
      // Find the Other Work activity
      const otherWorkActivity = activityTypes?.find((a: any) => a.name === 'Other Work');
      if (otherWorkActivity) {
        onActivitySelect(otherWorkActivity);
      }
    }
  };

  const renderMainActivityList = () => {
    // Filter activities based on mode
    let filteredActivities = activityTypes || [];
    if (!isDayStart && selectedActivity) {
      filteredActivities = filteredActivities.filter((a: any) => a.name !== selectedActivity);
    }

    // Separate Other Work from other activities
    const otherWorkActivity = filteredActivities.find((a: any) => a.name === 'Other Work');
    const regularActivities = filteredActivities.filter(
      (a: any) => a.name !== 'Other Work'
    );

    return (
      <>
        {/* Regular Activities (Retailing, Training, Meeting, etc.) */}
        {regularActivities.map((item: any) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => {
              if (item.name === 'Other Work') {
                handleOtherWorkPress();
              } else {
                onActivitySelect?.(item);
              }
            }} 
            style={styles.modalItem}
          >
            <LinearGradient
              colors={[item.color, item.color + 'CC']}
              style={styles.modalItemIcon}
            >
              <Ionicons name={item.icon as any} size={24} color="white" />
            </LinearGradient>
            <View style={styles.itemContent}>
              <AppText style={[styles.itemTitle, { color: colors.textPrimary }]}>
                {item.name}
              </AppText>
              <AppText style={[styles.itemSubtitle, { color: colors.textTertiary }]}>
                {isDayStart 
                  ? `Start your day with ${item.name.toLowerCase()}` 
                  : item.name === 'Retailing' 
                    ? 'Switch to retailing mode - Select a route to start selling'
                    : `Switch to ${item.name.toLowerCase()} mode`}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Other Work Option - Always show at the bottom */}
        {otherWorkActivity && (
          <TouchableOpacity 
            onPress={handleOtherWorkPress}
            style={styles.modalItem}
          >
            <LinearGradient
              colors={[otherWorkActivity.color, otherWorkActivity.color + 'CC']}
              style={styles.modalItemIcon}
            >
              <Ionicons name={otherWorkActivity.icon as any} size={24} color="white" />
            </LinearGradient>
            <View style={styles.itemContent}>
              <AppText style={[styles.itemTitle, { color: colors.textPrimary }]}>
                {otherWorkActivity.name}
              </AppText>
              <AppText style={[styles.itemSubtitle, { color: colors.textTertiary }]}>
                Non-selling activities like training, meeting, vehicle maintenance, etc.
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </>
    );
  };

  const renderOtherWorkOptionsList = () => {
    // Filter other work options based on mode
    let filteredOptions = otherWorkOptions || [];
    if (!isDayStart && selectedActivity) {
      filteredOptions = filteredOptions.filter((o: any) => o.name !== selectedActivity);
    }

    return (
      <>
        <View style={styles.otherWorkHeader}>
          <AppText style={[styles.otherWorkHeaderText, { color: colors.textSecondary }]}>
            Select type of other work
          </AppText>
        </View>
        
        {filteredOptions.map((item: any) => (
          <TouchableOpacity 
            key={item.id}
            onPress={() => onOtherWorkSelect?.(item)} 
            style={styles.modalItem}
          >
            <LinearGradient
              colors={[item.color, item.color + 'CC']}
              style={styles.modalItemIcon}
            >
              <Ionicons name={item.icon as any} size={24} color="white" />
            </LinearGradient>
            <View style={styles.itemContent}>
              <AppText style={[styles.itemTitle, { color: colors.textPrimary }]}>
                {item.name}
              </AppText>
              <AppText style={[styles.itemSubtitle, { color: colors.textTertiary }]}>
                {isDayStart 
                  ? `Start your day with ${item.name.toLowerCase()}` 
                  : `Switch to ${item.name.toLowerCase()}`}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderLeaveTypeModal = () => (
    <>
      <View style={styles.modalHeader}>
        <View>
          <AppText style={[styles.titleSmall, { color: colors.textPrimary }]}>
            {getModalTitle()}
          </AppText>
          <AppText style={[styles.routeHeaderSubtitle, { color: colors.textSecondary }]}>
            Choose leave category to continue
          </AppText>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.routeCloseButton}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {(leaveTypes || []).map((item: any) => {
        const isSelected = selectedLeaveType && item?.name === selectedLeaveType;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onLeaveTypeSelect?.(item)}
            style={[styles.modalItem, isSelected && { borderColor: colors.primary, borderWidth: 1 }]}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[item.color, item.color + 'CC']} style={styles.modalItemIcon}>
              <Ionicons name={item.icon as any} size={24} color="white" />
            </LinearGradient>
            <View style={styles.itemContent}>
              <AppText style={[styles.itemTitle, { color: colors.textPrimary }]}>
                {item.name}
              </AppText>
              <AppText style={[styles.itemSubtitle, { color: colors.textTertiary }]}>
                Mark your day start as {item.name.toLowerCase()}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity onPress={onLeaveBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <AppText style={[styles.backButtonText, { color: colors.primary }]}>
          BACK TO ACTIVITIES
        </AppText>
      </TouchableOpacity>
    </>
  );

  const renderActivityChangeModal = () => (
    <>
      <View style={styles.modalHeader}>
        <AppText style={[styles.titleSmall, { color: colors.textPrimary }]}>
          {getModalTitle()}
        </AppText>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {!isDayStart && selectedActivity && (
        <View style={[styles.currentActivityInfo, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <AppText style={[styles.infoText, { color: colors.textSecondary }]}>
            {getCurrentActivityText()} <AppText style={[styles.infoHighlight, { color: colors.primary }]}>{selectedActivity}</AppText>
          </AppText>
        </View>
      )}

      {isDayStart && !showChangeOtherOptions && (
        <View style={styles.dayStartSubtitle}>
          <AppText style={[styles.dayStartSubtitleText, { color: colors.textSecondary }]}>
            Choose how you want to start your day
          </AppText>
        </View>
      )}

      {!showChangeOtherOptions ? (
        renderMainActivityList()
      ) : (
        renderOtherWorkOptionsList()
      )}

      {showChangeOtherOptions && modalType == 'activity-change' && (
        <TouchableOpacity onPress={onBackToOptions} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <AppText style={[styles.backButtonText, { color: colors.primary }]}>
            BACK TO ACTIVITIES
          </AppText>
        </TouchableOpacity>
      )}
    </>
  );

  const renderContent = () => {
    switch (modalType) {
      case 'van-change':
        return renderVanChangeModal();
      case 'van-selection':
        return renderVanSelectionModal();
      case 'route-selection':
        return renderRouteSelectionModal();
      case 'leave-type':
        return renderLeaveTypeModal();
      case 'activity-change':
      case 'other-work':
        return renderActivityChangeModal();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={[styles.bottomModalContent, { backgroundColor: colors.surface }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
