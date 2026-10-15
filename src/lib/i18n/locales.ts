import type { Locale } from "./types";

export type { Locale, Dir } from "./types";

export const LOCALES = ["fa", "en"] as const;

export const DEFAULT_LOCALE: Locale = "fa";

export const LOCALE_STORAGE_KEY = "noir-locale";

export function getDir(locale: Locale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}
