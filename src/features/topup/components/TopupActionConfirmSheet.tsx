import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppModal, AppText } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';

type TopupAction = 'accept' | 'reject';

type TopupActionConfirmSheetProps = {
  visible: boolean;
  action: TopupAction | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const TopupActionConfirmSheet: React.FC<TopupActionConfirmSheetProps> = ({
  visible,
  action,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const isAccept = action === 'accept';
  const accent = isAccept ? colors.success : colors.error;

  return (
    <AppModal
      visible={visible}
      onClose={loading ? () => {} : onClose}
      size="sm"
      position="bottom"
      animation="slide"
      swipeDirection="up"
      showHeader={false}
      hideCloseButton
      closeOnBackdropPress={!loading}
      backdropOpacity={0.45}
      contentStyle={{ padding: 0, backgroundColor: colors.surface }}
    >
      <View style={{ padding: 18, gap: 16 }}>
        <View
          style={{
            width: 44,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: 'center',
            marginBottom: 2,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: accent + '16',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isAccept ? 'cube-outline' : 'close-circle-outline'}
              size={24}
              color={accent}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '900' }}>
              {isAccept ? 'Accept Stock' : 'Decline Top-up'}
            </AppText>
            <AppText
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                lineHeight: 19,
                marginTop: 3,
              }}
            >
              {isAccept
                ? 'Approved quantities will be added to your van stock immediately.'
                : 'The warehouse will be notified and this stock will not be added to your van.'}
            </AppText>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={loading}
            onPress={onClose}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <AppText style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '800' }}>
              Cancel
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.82}
            disabled={loading || !action}
            onPress={onConfirm}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primaryContrast} />
            ) : (
              <Ionicons
                name={isAccept ? 'checkmark-circle-outline' : 'close-circle-outline'}
                size={17}
                color={colors.primaryContrast}
              />
            )}
            <AppText style={{ color: colors.primaryContrast, fontSize: 14, fontWeight: '900' }}>
              {isAccept ? 'Accept Stock' : 'Decline'}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
};

export default TopupActionConfirmSheet;
