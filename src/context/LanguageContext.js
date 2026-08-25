"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  localizedValue,
  normalizeLocale,
  translate,
} from "@/lib/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale =
      typeof window !== "undefined"
        ? window.localStorage.getItem(LOCALE_STORAGE_KEY)
        : null;

    setLocaleState(normalizeLocale(savedLocale));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof document === "undefined") return;

    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [locale, mounted]);

  const setLocale = useCallback((nextLocale) => {
    setLocaleState(normalizeLocale(nextLocale));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === "km" ? "en" : "km"));
  }, []);

  const t = useCallback(
    (key, fallback) => translate(locale, key, fallback),
    [locale],
  );

  const label = useCallback(
    (value, fallback) => localizedValue(value, locale, fallback),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
      label,
      isEnglish: locale === "en",
      isKhmer: locale === "km",
    }),
    [label, locale, setLocale, t, toggleLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    const fallbackLocale =
      typeof window !== "undefined"
        ? normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
        : DEFAULT_LOCALE;

    return {
      locale: fallbackLocale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (key, fallback) => translate(fallbackLocale, key, fallback),
      label: (value, fallback) => localizedValue(value, fallbackLocale, fallback),
      isEnglish: fallbackLocale === "en",
      isKhmer: fallbackLocale === "km",
    };
  }

  return context;
}
