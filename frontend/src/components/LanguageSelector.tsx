import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const languages = [
  { code: 'cs', name: 'Čeština' },
  { code: 'en', name: 'English' }
];

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    changeLanguage(event.target.value as string);
  };

  return (
    <FormControl variant="outlined" size="small">
      <InputLabel id="language-select-label">Jazyk</InputLabel>
      <Select
        labelId="language-select-label"
        value={currentLanguage}
        onChange={handleLanguageChange}
        label="Jazyk"
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