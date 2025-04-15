import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { LanguageSelector } from './components/LanguageSelector';
import { Layout } from './components/Layout';
import i18n from './i18n/config';
import { Chat } from './pages/Chat';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Profile } from './pages/Profile';
import { theme } from './theme';

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ position: 'fixed', top: 20, right: 20 }}>
          <LanguageSelector />
        </div>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App; 