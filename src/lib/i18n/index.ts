import { DEFAULT_LOCALE, type Locale } from "./locales";
import { en } from "./en";
import { fa } from "./fa";
import type { Messages } from "./types";

export const MESSAGES: Record<Locale, Messages> = {
  en,
  fa,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
