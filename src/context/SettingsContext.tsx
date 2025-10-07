/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// Standardized to IDR only, but keeping other options commented for future use
// To restore multi-currency support, uncomment the line below and update related components
type CurrencyCode = 'IDR';
// type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

interface SettingsState {
  currency: CurrencyCode;
  locale: string;
  aiModel: 'deepseek' | 'gemini';
  timeZone: string;
  notificationEmail: boolean;
  notificationPush: boolean;
  notificationGoalReminders: boolean;
  notificationBudgetAlerts: boolean;
  setCurrency: (currency: CurrencyCode) => void;
  setLocale: (locale: string) => void;
  setAIModel: (model: 'deepseek' | 'gemini') => void;
  setTimeZone: (tz: string) => void;
  setNotificationEmail: (v: boolean) => void;
  setNotificationPush: (v: boolean) => void;
  setNotificationGoalReminders: (v: boolean) => void;
  setNotificationBudgetAlerts: (v: boolean) => void;
}

const DEFAULT_CURRENCY: CurrencyCode = 'IDR';
const DEFAULT_LOCALE = 'id-ID'; // Standardized to Indonesian locale
const DEFAULT_TIMEZONE = 'Asia/Jakarta'; // Standardized to Indonesia timezone

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [aiModel, setAIModel] = useState<'deepseek' | 'gemini'>(
    (localStorage.getItem('app.ai_model') as 'deepseek' | 'gemini') ||
      'deepseek',
  );
  const [timeZone, setTimeZone] = useState<string>(
    localStorage.getItem('app.time_zone') || DEFAULT_TIMEZONE,
  );
  const [notificationEmail, setNotificationEmail] = useState<boolean>(
    localStorage.getItem('app.notif_email') === null
      ? true
      : localStorage.getItem('app.notif_email') === 'true',
  );
  const [notificationPush, setNotificationPush] = useState<boolean>(
    localStorage.getItem('app.notif_push') === null
      ? true
      : localStorage.getItem('app.notif_push') === 'true',
  );
  const [notificationGoalReminders, setNotificationGoalReminders] =
    useState<boolean>(
      localStorage.getItem('app.notif_goal') === null
        ? true
        : localStorage.getItem('app.notif_goal') === 'true',
    );
  const [notificationBudgetAlerts, setNotificationBudgetAlerts] =
    useState<boolean>(
      localStorage.getItem('app.notif_budget') === null
        ? true
        : localStorage.getItem('app.notif_budget') === 'true',
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

  useEffect(() => {
    localStorage.setItem('app.time_zone', timeZone);
  }, [timeZone]);

  useEffect(() => {
    localStorage.setItem('app.notif_email', String(notificationEmail));
  }, [notificationEmail]);

  useEffect(() => {
    localStorage.setItem('app.notif_push', String(notificationPush));
  }, [notificationPush]);

  useEffect(() => {
    localStorage.setItem('app.notif_goal', String(notificationGoalReminders));
  }, [notificationGoalReminders]);

  useEffect(() => {
    localStorage.setItem('app.notif_budget', String(notificationBudgetAlerts));
  }, [notificationBudgetAlerts]);

  const value = useMemo(
    () => ({
      currency,
      locale,
      aiModel,
      timeZone,
      notificationEmail,
      notificationPush,
      notificationGoalReminders,
      notificationBudgetAlerts,
      setCurrency,
      setLocale,
      setAIModel,
      setTimeZone,
      setNotificationEmail,
      setNotificationPush,
      setNotificationGoalReminders,
      setNotificationBudgetAlerts,
    }),
    [
      currency,
      locale,
      aiModel,
      timeZone,
      notificationEmail,
      notificationPush,
      notificationGoalReminders,
      notificationBudgetAlerts,
    ],
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
