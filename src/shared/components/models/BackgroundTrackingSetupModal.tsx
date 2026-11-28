import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppModal } from '@/core/components';
import { Text } from '@/core/components/Text/ScaledText';
import { useTheme } from '@/shared/hooks/useTheme';
import {
  closeBackgroundTrackingSetup,
  registerBackgroundTrackingSetupListener,
} from '@/shared/services/backgroundTrackingSetup.bridge';
import {
  confirmAutostart,
  getBackgroundTrackingStatus,
  isBackgroundTrackingReady,
  openAutostartSettings,
  requestAlwaysLocation,
  requestUnrestrictedBattery,
  type BackgroundTrackingStatus,
} from '@/shared/services/backgroundTrackingSetup';

type Step = {
  key: string;
  title: string;
  description: string;
  done: boolean;
  actionLabel: string;
  onPress: () => void;
  /** Autostart cannot be checked; the user confirms it. */
  confirm?: () => void;
};

/**
 * Checklist shown when the work day starts and a phone setting would stop
 * background tracking: "Allow all the time", battery Unrestricted, Autostart.
 * Each step opens the right settings screen; statuses refresh when the user
 * comes back to the app.
 */
export const BackgroundTrackingSetupModal: React.FC = () => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<BackgroundTrackingStatus | null>(null);
  const [autostartOpened, setAutostartOpened] = useState(false);

  const refresh = useCallback(() => {
    getBackgroundTrackingStatus()
      .then(setStatus)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    registerBackgroundTrackingSetupListener(setVisible);
    return () => registerBackgroundTrackingSetupListener(null);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [visible, refresh]);

  const steps: Step[] = [];
  if (status) {
    steps.push({
      key: 'location',
      title: 'Location: Allow all the time',
      description: 'In the settings page that opens, tap Location and choose "Allow all the time".',
      done: status.backgroundLocation,
      actionLabel: 'Allow',
      onPress: () => void requestAlwaysLocation().finally(refresh),
    });
    if (status.batteryUnrestricted !== null) {
      steps.push({
        key: 'battery',
        title: 'Battery: Unrestricted',
        description: 'Tap Allow so the phone does not stop tracking to save battery.',
        done: status.batteryUnrestricted,
        actionLabel: 'Allow',
        onPress: () => void requestUnrestrictedBattery().finally(refresh),
      });
    }
    if (status.autostartNeeded) {
      steps.push({
        key: 'autostart',
        title: 'Autostart',
        description: 'Turn on Autostart (or "Allow background start") for Sales Stream.',
        done: status.autostartConfirmed,
        actionLabel: 'Open',
        onPress: () => {
          setAutostartOpened(true);
          void openAutostartSettings();
        },
        confirm: autostartOpened ? () => void confirmAutostart(true).finally(refresh) : undefined,
      });
    }
  }

  const ready = status ? isBackgroundTrackingReady(status) : false;

  return (
    <AppModal
      visible={visible}
      onClose={closeBackgroundTrackingSetup}
      position="center"
      animation="scale"
      closeOnBackdropPress={false}
      dismissible={false}
      showHeader={false}
      hideCloseButton
    >
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <MaterialIcons name="settings-suggest" size={40} color={colors.primaryContrast} />
          <Text style={[styles.title, { color: colors.primaryContrast }]}>
            Keep tracking on in the background
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            Without these phone settings, your route stops recording a few minutes after you leave
            the app.
          </Text>

          {steps.map((step) => (
            <View key={step.key} style={[styles.step, { borderColor: colors.border }]}>
              <Ionicons
                name={step.done ? 'checkmark-circle' : 'alert-circle-outline'}
                size={22}
                color={
                  step.done
                    ? (colors.success ?? colors.primary)
                    : (colors.warning ?? colors.textSecondary)
                }
              />
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{step.title}</Text>
                {!step.done && (
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {step.description}
                  </Text>
                )}
                {!step.done && step.confirm && (
                  <TouchableOpacity onPress={step.confirm} style={styles.confirm}>
                    <Text style={[styles.confirmText, { color: colors.primary }]}>
                      I have turned it on
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {!step.done && (
                <TouchableOpacity
                  onPress={step.onPress}
                  style={[styles.stepButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.stepButtonText, { color: colors.primaryContrast }]}>
                    {step.actionLabel}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              ready
                ? { backgroundColor: colors.primary }
                : [styles.outlineButton, { borderColor: colors.border }],
            ]}
            onPress={closeBackgroundTrackingSetup}
          >
            <Text
              style={[
                styles.buttonText,
                { color: ready ? colors.primaryContrast : colors.textSecondary },
              ]}
            >
              {ready ? 'Done' : 'Continue anyway'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden' },
  header: { paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center', gap: 10 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  content: { padding: 16, gap: 10 },
  intro: { fontSize: 13, lineHeight: 18 },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  stepText: { flex: 1, gap: 4 },
  stepTitle: { fontSize: 14, fontWeight: '600' },
  stepDescription: { fontSize: 12, lineHeight: 17 },
  confirm: { paddingTop: 4 },
  confirmText: { fontSize: 13, fontWeight: '600' },
  stepButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  stepButtonText: { fontSize: 13, fontWeight: '600' },
  footer: { padding: 16, paddingTop: 4 },
  button: { paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  outlineButton: { borderWidth: 1 },
  buttonText: { fontSize: 15, fontWeight: '600' },
});
