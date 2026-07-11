import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import faTranslations from './locales/fa.json';

const resources = {
  en: { translation: enTranslations },
  fa: { translation: faTranslations }
};

const savedLang = localStorage.getItem('tradermind_lang') || 'fa';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;