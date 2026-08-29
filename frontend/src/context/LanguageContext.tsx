import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { TRANSLATIONS, type Lang } from '../i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('pashuraksha-lang');
    return (saved as Lang) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('pashuraksha-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  // t(key): returns the translation, falling back to English, then the key itself.
  const t = (key: string): string =>
    TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
