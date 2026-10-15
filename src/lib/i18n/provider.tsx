"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { DEFAULT_LOCALE, getDir, LOCALE_STORAGE_KEY } from "./locales";
import { getMessages } from "./index";
import { createFormatters, type Formatters } from "./format";
import type { Locale, Messages } from "./types";

interface LocaleContextValue {
  locale: Locale;
  dir: "rtl" | "ltr";
  messages: Messages;
  setLocale: (locale: Locale) => void;
  formatters: Formatters;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useIsomorphicLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored && (stored === "fa" || stored === "en")) {
        setLocaleState(stored);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    const dir = getDir(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;

    const messages = getMessages(locale);
    if (messages.meta.title) {
      document.title = messages.meta.title;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", messages.meta.description);
    }
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle) {
      metaOgTitle.setAttribute("content", messages.meta.ogTitle);
    }
    const metaOgDesc = document.querySelector('meta[property="og:description"]');
    if (metaOgDesc) {
      metaOgDesc.setAttribute("content", messages.meta.ogDescription);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", messages.meta.keywords.join(", "));
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    const dir = getDir(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.lang = next;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = next;
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "fa" ? "en" : "fa");
  }, [locale, setLocale]);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const formatters = useMemo(() => createFormatters(locale), [locale]);
  const dir = useMemo(() => getDir(locale), [locale]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      messages,
      setLocale,
      formatters,
      toggleLocale,
    }),
    [locale, dir, messages, setLocale, formatters, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}

export function useLocale() {
  return useI18n().locale;
}

export default LocaleProvider;
