import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import de from './locales/de.json';

const LANGUAGE_KEY = 'user-language';

const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'it', 'de'];

// Detect default device language
const getDeviceLanguage = (): string => {
  const deviceLocales = getLocales();
  if (deviceLocales && deviceLocales.length > 0) {
    const code = deviceLocales[0].languageCode;
    if (code && SUPPORTED_LANGUAGES.includes(code)) {
      return code;
    }
  }
  return 'es'; // fallback to Spanish (original default) ya que es el main idioma
};

const defaultLanguage = getDeviceLanguage();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr },
      it: { translation: it },
      de: { translation: de },
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
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }
  })
  .catch((err) => {
    console.log('[i18n] Error loading persisted language:', err);
  });

export default i18n;
