import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './locales/es.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'user-language';

// Detect default device language
const getDeviceLanguage = (): string => {
  const deviceLocales = getLocales();
  if (deviceLocales && deviceLocales.length > 0) {
    const code = deviceLocales[0].languageCode;
    if (code === 'es' || code === 'en') {
      return code;
    }
  }
  return 'es'; // fallback to Spanish (original default)
};

const defaultLanguage = getDeviceLanguage();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4', // Required for React Native support
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: defaultLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Asynchronously load persisted language preference
AsyncStorage.getItem(LANGUAGE_KEY)
  .then((savedLanguage) => {
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      i18n.changeLanguage(savedLanguage);
    }
  })
  .catch((err) => {
    console.log('[i18n] Error loading persisted language:', err);
  });

export default i18n;
