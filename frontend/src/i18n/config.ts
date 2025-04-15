import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import cs from './locales/cs';
import en from './locales/en';

const resources = {
    cs: {
        translation: cs
    },
    en: {
        translation: en
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'cs', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n; 