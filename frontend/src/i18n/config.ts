import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import cs from '../locales/cs/translation.json';
import en from '../locales/en/translation.json';

const resources = {
    cs: {
        translation: cs
    },
    en: {
        translation: en
    }
};

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'cs',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n; 