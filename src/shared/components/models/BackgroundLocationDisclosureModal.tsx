import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppModal } from '@/core/components';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  registerBackgroundLocationDisclosureListener,
  resolveBackgroundLocationDisclosure,
} from '@/shared/services/backgroundLocationDisclosure.bridge';

export const BackgroundLocationDisclosureModal: React.FC = () => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    registerBackgroundLocationDisclosureListener(setVisible);
    return () => registerBackgroundLocationDisclosureListener(null);
  }, []);

  const handleDecline = () => resolveBackgroundLocationDisclosure(false);
  const handleAccept = () => resolveBackgroundLocationDisclosure(true);

  return (
    <AppModal
      visible={visible}
      onClose={handleDecline}
      position="center"
      animation="scale"
      closeOnBackdropPress={false}
      dismissible={false}
      showHeader={false}
      hideCloseButton
    >
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerIcon}>
            <MaterialIcons name="my-location" size={44} color={colors.primaryContrast} />
          </View>
          <Text style={[styles.title, { color: colors.primaryContrast }]}>
            Background Location Access
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
            Sales Stream collects your device's location{' '}
            <Text style={styles.bold}>in the background, including while the app is closed
            or not in use</Text>, whenever you start your work day as{' '}
            <Text style={styles.bold}>Retailing</Text> or{' '}
            <Text style={styles.bold}>Other Work</Text>.
          </Text>

          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            This is used only to record your route and store visits for attendance, van
            tracking, and delivery verification. Location is not collected on Leave days,
            and background tracking stops automatically when you end your work day.
          </Text>

          <View style={[styles.infoRow, { borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              You will be asked to confirm this again with your device's location
              permission prompt.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton, { borderColor: colors.border }]}
            onPress={handleDecline}
          >
            <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Not now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
          >
            <Text style={[styles.buttonText, { color: colors.primaryContrast }]}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    borderWidth: 1,
  },
  acceptButton: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
