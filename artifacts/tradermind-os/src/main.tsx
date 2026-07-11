import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import { seedDatabase } from './db/seed';
import { ThemeProvider } from './components/ThemeProvider';
import { useUiStore } from './stores/uiStore';
import { useTranslation } from 'react-i18next';

function Root() {
  const [isSeeded, setIsSeeded] = useState(false);
  const language = useUiStore((state) => state.language);
  const { i18n } = useTranslation();

  useEffect(() => {
    seedDatabase().then(() => setIsSeeded(true));
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  if (!isSeeded) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);