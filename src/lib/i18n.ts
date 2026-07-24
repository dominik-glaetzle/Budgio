import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

import en from "@/locales/en.json";
import de from "@/locales/de.json";

export const i18n = new I18n({
  en,
  de,
});

i18n.enableFallback = true;

const supportedLocales = ["de", "en"];

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";

i18n.locale = supportedLocales.includes(deviceLanguage) ? deviceLanguage : "en";
