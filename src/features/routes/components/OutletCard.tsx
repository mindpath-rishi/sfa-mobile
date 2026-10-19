/**
 * One outlet on the route list.
 */
import React, { useCallback, useState } from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { ConfirmationModal } from '@/features/routes/components/ConfirmationModal';
import type { Outlet } from '@/features/routes/types/route.types';
import {
  formatOutletDistanceKm,
  getOutletDisplayName,
} from '@/features/routes/utils/route-outlet.utils';

type OutletCardProps = {
  outlet: any;
  index: number;
  onPress: (outlet: Outlet) => void;
  onNavigate: (outlet: Outlet) => void;
  onComplete: (outletId: string) => Promise<void>;
  colors: any;
  styles: any;
};

/**
 * The route recomputes every outlet's distance on each location update.
 * Re-render a card only when something it shows changes: any outlet field,
 * or the distance as displayed (0.1 km).
 */
const areOutletCardPropsEqual = (prev: OutletCardProps, next: OutletCardProps) => {
  if (
    prev.index !== next.index ||
    prev.onPress !== next.onPress ||
    prev.onNavigate !== next.onNavigate ||
    prev.onComplete !== next.onComplete ||
    prev.colors !== next.colors ||
    prev.styles !== next.styles
  ) {
    return false;
  }
  if (prev.outlet === next.outlet) return true;

  const keys = new Set([...Object.keys(prev.outlet), ...Object.keys(next.outlet)]);
  for (const key of keys) {
    if (key === 'distance') {
      if (
        formatOutletDistanceKm(prev.outlet.distance) !==
        formatOutletDistanceKm(next.outlet.distance)
      ) {
        return false;
      }
    } else if (!Object.is(prev.outlet[key], next.outlet[key])) {
      return false;
    }
  }
  return true;
};

export const OutletCardComponent = React.memo(
  ({
    outlet,
    index,
    onPress,
    onNavigate,
    onComplete,
    colors,
    styles,
  }: {
    outlet: any;
    index: number;
    onPress: (outlet: Outlet) => void;
    onNavigate: (outlet: Outlet) => void;
    onComplete: (outletId: string) => Promise<void>;
    colors: any;
    styles: any;
  }) => {
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const visitStatus = outlet.visitStatus;
    const isActive = visitStatus === 'ACTIVE';
    const isCompleted = visitStatus === 'COMPLETED';
    const isInside = outlet.isInsideGeofence;
    const isVerificationPending = outlet.status === 'VERIFICATION_PENDING';
    const isRejected = outlet.status === 'REJECTED';

    const statusColors = isRejected
      ? { bg: colors.error + '15', text: colors.error }
      : isVerificationPending
        ? { bg: colors.warning + '15', text: colors.warning }
        : isCompleted
          ? { bg: colors.success + '15', text: colors.success }
          : isActive
            ? { bg: colors.primary + '15', text: colors.primary }
            : { bg: colors.warning + '15', text: colors.warning };

    const statusLabel = isRejected
      ? 'Rejected'
      : isVerificationPending
        ? 'Verification Pending'
        : isCompleted
          ? 'Done'
          : isActive
            ? 'Active'
            : 'Pending';

    const handleComplete = useCallback(() => {
      setShowCompleteConfirm(false);
      void onComplete(outlet._id).catch((error) => {
        console.error('Failed to complete outlet visit:', error);
      });
    }, [outlet._id, onComplete]);

    return (
      <View
        style={[
          styles.expandableCard,
          isActive && styles.expandableCardCurrent,
          isCompleted && styles.expandableCardCompleted,
          isInside && !isCompleted && !isActive && styles.expandableCardNearby,
        ]}
      >
        <ConfirmationModal
          visible={showCompleteConfirm}
          title="Complete Visit"
          message={`Mark "${getOutletDisplayName(outlet)}" as completed?`}
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteConfirm(false)}
          confirmText="Yes, Complete"
          cancelText="Cancel"
          confirmVariant="success"
        />

        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => onPress(outlet)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: statusColors.bg }]}>
              {isCompleted ? (
                <Ionicons name="checkmark-circle" size={24} color={statusColors.text} />
              ) : (
                <Text style={[styles.statusNumber, { color: statusColors.text }]}>{index + 1}</Text>
              )}
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.outletName} numberOfLines={2}>
                  {getOutletDisplayName(outlet)}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <Text style={styles.stopAddress} numberOfLines={1}>
                  {outlet.address?.line1}
                </Text>
                <View style={styles.distanceBadge}>
                  <Feather name="map-pin" size={12} color={colors.textSecondary} />
                  <Text style={styles.distanceText}>
                    {formatOutletDistanceKm(outlet.distance)} km
                  </Text>
                </View>
              </View>
              <View style={styles.cardMetaRow}>
                <View style={styles.cardBadgesRow}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                      {statusLabel}
                    </Text>
                  </View>
                  {isInside && !isCompleted && !isActive && (
                    <View style={styles.nearbyBadge}>
                      <Ionicons name="location" size={12} color={colors.success} />
                      <Text style={styles.nearbyBadgeText}>Nearby</Text>
                    </View>
                  )}
                </View>
                <View style={styles.headerIconsRow}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (outlet.phoneNumber) {
                        Linking.openURL(`tel:${outlet.phoneNumber}`);
                      } else {
                        Alert.alert('Error', 'Phone number not available');
                      }
                    }}
                    style={styles.headerIconButton}
                  >
                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onNavigate(outlet);
                    }}
                    style={styles.headerIconButton}
                  >
                    <Ionicons name="navigate-outline" size={20} color={colors.info} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  areOutletCardPropsEqual,
);
