import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: {
        translation: arTranslations
      },
      en: {
        translation: enTranslations
      }
    },
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    },
    // Language direction configuration
    languages: {
      ar: { dir: 'rtl', name: 'العربية' },
      en: { dir: 'ltr', name: 'English' }
    },
    // Detect language from HTML tag
    detection: {
      order: ['htmlTag', 'localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Set initial direction
document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n; 