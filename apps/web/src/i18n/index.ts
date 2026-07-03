import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en';
import zh from './locales/zh';
import vi from './locales/vi';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const STORAGE_KEY = 'xiangqi-locale';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    lng: localStorage.getItem(STORAGE_KEY) || undefined,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key: string) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key: "${key}"`);
      }
      return key;
    },
  });

/** Persist language choice and switch */
export function setLocale(locale: SupportedLocale): void {
  localStorage.setItem(STORAGE_KEY, locale);
  i18next.changeLanguage(locale);
}

/** Get the current active locale */
export function getCurrentLocale(): SupportedLocale {
  return (i18next.language?.split('-')[0] as SupportedLocale) || 'en';
}

export default i18next;
