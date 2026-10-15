import type { Locale } from "./locales";

const FA_LOCALE = "fa-IR";
const EN_LOCALE = "en-US";

function toFaDigits(n: number): string {
  return n.toLocaleString(FA_LOCALE);
}

export interface Formatters {
  price(amount: number, currency?: string): string;
  number(n: number): string;
  year(): string;
}

export function createFormatters(locale: Locale): Formatters {
  const numberFormat = new Intl.NumberFormat(locale === "fa" ? FA_LOCALE : EN_LOCALE);
  return {
    price(amount, currency = "USD") {
      const parts = new Intl.NumberFormat(locale === "fa" ? FA_LOCALE : EN_LOCALE, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

      if (locale === "fa") {
        return parts.replace(/\d/g, (d) => toFaDigits(Number(d)));
      }
      return parts;
    },
    number(n) {
      return numberFormat.format(n);
    },
    year() {
      if (typeof window === "undefined") {
        return "۲۰۲۶";
      }
      return locale === "fa"
        ? toFaDigits(new Date().getFullYear())
        : String(new Date().getFullYear());
    },
  };
}
