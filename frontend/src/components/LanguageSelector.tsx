import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useTranslation } from '../hooks/useTranslation';

const languages = [
  { code: 'cs', name: 'Čeština' },
  { code: 'en', name: 'English' }
];

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useTranslation();
  const { t } = useI18nTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    changeLanguage(event.target.value as string);
  };

  return (
    <FormControl variant="outlined" size="small">
      <InputLabel id="language-select-label">{t('settings.language')}</InputLabel>
      <Select
        labelId="language-select-label"
        value={currentLanguage}
        onChange={handleLanguageChange}
        label={t('settings.language')}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 