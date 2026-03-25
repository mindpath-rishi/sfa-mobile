import { Platform } from 'react-native';
import type { IStorage } from './storage.types';

// ✅ Use AsyncStorage fallback
import AsyncStorage from '@react-native-async-storage/async-storage';

let mmkv: any = null;

/**
 * ✅ MMKV is faster, but optional
 * npm i react-native-mmkv
 */
try {
  // Lazy require (will fail if not installed)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV();
} catch {
  mmkv = null;
}

export const storage: IStorage = {
  async getItem(key) {
    try {
      if (Platform.OS !== 'web' && mmkv) {
        const v = mmkv.getString(key);
        return v ?? null;
      }

      const v = await AsyncStorage.getItem(key);
      return v ?? null;
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      if (Platform.OS !== 'web' && mmkv) {
        mmkv.set(key, value);
        return;
      }

      await AsyncStorage.setItem(key, value);
    } catch {
      // silent
    }
  },

  async removeItem(key) {
    try {
      if (Platform.OS !== 'web' && mmkv) {
        mmkv.delete(key);
        return;
      }

      await AsyncStorage.removeItem(key);
    } catch {
      // silent
    }
  },

  async clear() {
    try {
      if (Platform.OS !== 'web' && mmkv) {
        mmkv.clearAll();
        return;
      }

      await AsyncStorage.clear();
    } catch {
      // silent
    }
  },
};
