import React from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { APP_VERSION } from './app-info';
import { useAppUpdateStore } from './app-update.store';

const PACKAGE_ID = 'com.salesstream.app';

const openStore = (storeUrl?: string | null) => {
  const fallback =
    Platform.OS === 'android'
      ? `market://details?id=${PACKAGE_ID}`
      : `https://apps.apple.com/search?term=${encodeURIComponent('Sales Stream')}`;
  void Linking.openURL(storeUrl || fallback).catch(() =>
    Linking.openURL(`https://play.google.com/store/apps/details?id=${PACKAGE_ID}`),
  );
};

/**
 * Minimum version set in MIS: a required update blocks the app (offline
 * uploads keep working in the background); an available update shows a
 * dismissible banner.
 */
export function UpdateGate() {
  const { colors } = useTheme();
  const { updateRequired, updateAvailable, minAppVersion, latestAppVersion, message, storeUrl, dismissAvailable } =
    useAppUpdateStore();

  if (updateRequired) {
    return (
      <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => undefined}>
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Update required</Text>
          <Text style={[styles.body, { color: colors.textTertiary }]}>
            {message || 'This version of the app is no longer supported. Please update to continue.'}
          </Text>
          <Text style={[styles.version, { color: colors.textQuaternary }]}>
            Installed {APP_VERSION}
            {minAppVersion ? ` · required ${minAppVersion}` : ''}
          </Text>
          <Text style={[styles.note, { color: colors.textTertiary }]}>
            Work you saved offline is still uploaded; nothing is lost.
          </Text>
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => openStore(storeUrl)}>
            <Text style={[styles.buttonText, { color: colors.primaryContrast }]}>Update now</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  if (updateAvailable) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.primary }]} pointerEvents="box-none">
        <Text style={[styles.bannerText, { color: colors.primaryContrast }]} numberOfLines={2}>
          {message || `Version ${latestAppVersion ?? 'new'} is available.`}
        </Text>
        <Pressable onPress={() => openStore(storeUrl)} hitSlop={8}>
          <Text style={[styles.bannerAction, { color: colors.primaryContrast }]}>Update</Text>
        </Pressable>
        <Pressable onPress={dismissAvailable} hitSlop={8}>
          <Text style={[styles.bannerAction, { color: colors.primaryContrast }]}>Later</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  version: { fontSize: 13 },
  note: { fontSize: 13, textAlign: 'center' },
  button: { marginTop: 16, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 6,
  },
  bannerText: { flex: 1, fontSize: 13 },
  bannerAction: { fontSize: 13, fontWeight: '700' },
});
