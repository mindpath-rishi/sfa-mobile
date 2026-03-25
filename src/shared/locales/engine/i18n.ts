import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import en from "../en.json";
import hi from "../hi.json";
import ur from "../ur.json";

export type AppLanguage = "en" | "hi" | "ur";

export const i18n = new I18n({
  en,
  hi,
  ur,
});

i18n.enableFallback = true;

// default language from phone settings
i18n.locale = Localization.getLocales()?.[0]?.languageCode || "en";
