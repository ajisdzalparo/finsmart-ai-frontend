import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

interface SettingsState {
  currency: CurrencyCode;
  locale: string;
  aiModel: 'deepseek' | 'gemini';
  setCurrency: (currency: CurrencyCode) => void;
  setLocale: (locale: string) => void;
  setAIModel: (model: 'deepseek' | 'gemini') => void;
}

const DEFAULT_CURRENCY: CurrencyCode = 'IDR';
const DEFAULT_LOCALE = 'id-ID';

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [aiModel, setAIModel] = useState<'deepseek' | 'gemini'>(
    (localStorage.getItem('app.ai_model') as 'deepseek' | 'gemini') ||
      'deepseek',
  );

  useEffect(() => {
    const savedCurrency = localStorage.getItem(
      'app.currency',
    ) as CurrencyCode | null;
    const savedLocale = localStorage.getItem('app.locale');
    const savedModel = localStorage.getItem('app.ai_model') as
      | 'deepseek'
      | 'gemini'
      | null;
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    if (savedLocale) {
      setLocale(savedLocale);
    }
    if (savedModel) {
      setAIModel(savedModel);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app.currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('app.locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('app.ai_model', aiModel);
  }, [aiModel]);

  const value = useMemo(
    () => ({ currency, locale, aiModel, setCurrency, setLocale, setAIModel }),
    [currency, locale, aiModel],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
