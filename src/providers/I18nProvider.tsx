'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '@/types';

// ─── Locale Context ───────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

// ─── Message Loader ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messageCache: Record<string, any> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadMessages(locale: Locale): Promise<any> {
  if (messageCache[locale]) return messageCache[locale];
  const mod = await import(`../../messages/${locale}.json`);
  messageCache[locale] = mod.default;
  return mod.default;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any>(null);

  // Detect locale on mount
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    const detected: Locale = saved
      ? saved
      : typeof navigator !== 'undefined' && navigator.language.startsWith('pl')
        ? 'pl'
        : 'en';
    const timer = setTimeout(() => {
      setLocaleState(detected);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Load messages whenever locale changes
  useEffect(() => {
    loadMessages(locale).then(setMessages);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('locale', newLocale);
    setLocaleState(newLocale);
  }, []);

  if (!messages) {
    // Prevent flash — render nothing until messages are ready
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
