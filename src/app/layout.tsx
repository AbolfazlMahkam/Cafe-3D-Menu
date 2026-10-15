import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Inter,
  IBM_Plex_Sans_Arabic,
  Noto_Kufi_Arabic,
} from "next/font/google";
import "./globals.css";

import LocaleProvider from "@/lib/i18n/provider";
import { DEFAULT_LOCALE, getDir } from "@/lib/i18n/locales";
import SkipLink from "@/components/site/SkipLink";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  // The metric-fallback face has no unicode-range, so it greedily supplies
  // Arabic glyphs and shadows Noto Kufi. Keep it off for correct fa/RTL text.
  adjustFontFallback: false,
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  // Same reason as above: prevents `Inter Fallback` (local Arial) from
  // winning the Persian glyph instead of IBM Plex Sans Arabic.
  adjustFontFallback: false,
});

/** Persian body / UI text. */
const faBody = IBM_Plex_Sans_Arabic({
  variable: "--font-fa",
  subsets: ["arabic"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

/** Persian display headings (paired with Fraunces for Latin). */
const faDisplay = Noto_Kufi_Arabic({
  variable: "--font-fa-display",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://abolfazlmahkam.github.io/Cafe-3D-Menu"),
  title: {
    default: "نوآر — قهوه، فراتر از معمول",
    template: "%s · NOIR",
  },
  description:
    "نوآر یک آتلیهی قهوهی لوکس است؛ دانههای تکخاستگاه، صنعتِ آرام و تجربهای سینمایی از چشیدن. منوی نمایشی — هیچ سفارش واقعی پردازش نمیشود.",
  keywords: [
    "قهوه",
    "قهوه تخصصی",
    "اسپرسو",
    "کلد برو",
    "آتلیه قهوه",
    "نوآر",
  ],
  openGraph: {
    title: "NOIR — Coffee, Beyond Ordinary",
    description:
      "A cinematic, scroll-driven coffee atelier experience. Demo menu and cart.",
    type: "website",
    siteName: "NOIR",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const lang = DEFAULT_LOCALE;
  const dir = getDir(lang);
  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${faBody.variable} ${faDisplay.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-noir text-cream antialiased">
        <LocaleProvider>
          <SkipLink />
          {children}
        </LocaleProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
