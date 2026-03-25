import { AppLanguage, i18n } from "@/shared/locales/engine/i18n";
import { storage } from "@/shared/utils/storage";
import { create } from "zustand";
import { I18nManager, Platform } from "react-native";
import * as Updates from "expo-updates";
import Constants from "expo-constants";

const KEY = "app_language";

// ✅ Read directly from app.config.ts -> extra
const localization = (Constants.expoConfig?.extra as any)?.localization;

const DEFAULT_LANG: AppLanguage = (localization?.defaultLanguage ||
  "en") as AppLanguage;

const SUPPORTED_LANGS: AppLanguage[] = (localization?.supportedLanguages || [
  "en",
  "hi",
  "ur",
  "ar",
]) as AppLanguage[];

const RTL_LANGS: AppLanguage[] = (localization?.rtlLanguages || [
  "ur",
  "ar",
]) as AppLanguage[];

const isSupportedLanguage = (lang: string): lang is AppLanguage =>
  SUPPORTED_LANGS.includes(lang as AppLanguage);

const isRTL = (lang: AppLanguage) => RTL_LANGS.includes(lang);

// ✅ Safe reload (Expo Go safe)
const safeReload = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") return false;
    await Updates.reloadAsync();
    return true;
  } catch {
    return false;
  }
};

type LanguageState = {
  language: AppLanguage;
  hydrated: boolean;
  needRestart: boolean;
  isRTL: boolean; // ✅ store RTL state

  hydrate: () => Promise<void>;
  setLanguage: (lang: AppLanguage) => Promise<void>;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: DEFAULT_LANG,
  hydrated: false,
  needRestart: false,
  isRTL: isRTL(DEFAULT_LANG),

  hydrate: async () => {
    try {
      const saved = await storage.getItem(KEY);

      const lang: AppLanguage =
        saved && isSupportedLanguage(saved) ? saved : get().language;

      const shouldBeRTL = isRTL(lang);

      // ✅ update locale + store value
      i18n.locale = lang;
      set({ language: lang, isRTL: shouldBeRTL });

      // ✅ Web direction
      if (Platform.OS === "web") {
        document.documentElement.dir = shouldBeRTL ? "rtl" : "ltr";
        document.documentElement.lang = lang;
        set({ hydrated: true, needRestart: false });
        return;
      }

      // ✅ Native direction
      I18nManager.allowRTL(true);

      const alreadyRTL = I18nManager.isRTL;

      if (alreadyRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);

        const reloaded = await safeReload();

        if (!reloaded) {
          set({ hydrated: true, needRestart: true });
          return;
        }

        return;
      }

      set({ hydrated: true, needRestart: false });
    } catch {
      set({ hydrated: true, needRestart: false });
    }
  },

  setLanguage: async (lang) => {
    try {
      const currentLang = get().language;
      if (lang === currentLang) return;
      if (!isSupportedLanguage(lang)) return;

      const shouldBeRTL = isRTL(lang);

      // ✅ update locale + storage + store
      i18n.locale = lang;
      await storage.setItem(KEY, lang);
      set({ language: lang, isRTL: shouldBeRTL });

      // ✅ Web direction
      if (Platform.OS === "web") {
        document.documentElement.dir = shouldBeRTL ? "rtl" : "ltr";
        document.documentElement.lang = lang;
        set({ needRestart: false });
        return;
      }

      // ✅ Native direction
      I18nManager.allowRTL(true);

      const alreadyRTL = I18nManager.isRTL;

      if (alreadyRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);

        const reloaded = await safeReload();

        if (!reloaded) {
          set({ needRestart: true });
          return;
        }

        return;
      }

      set({ needRestart: false });
    } catch {
      // never crash
    }
  },
}));
