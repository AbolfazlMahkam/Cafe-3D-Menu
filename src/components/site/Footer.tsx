"use client";

import { useI18n } from "@/lib/i18n/provider";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Behance", href: "https://behance.net" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export function Footer() {
  const { messages, formatters } = useI18n();
  const t = messages.footer;

  return (
    <footer className="relative z-10 border-t border-cream/10 bg-espresso">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl tracking-[0.3em] text-cream">
              NOIR
            </span>
            <span className="mb-1 h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <p className="mt-4 max-w-xs font-display text-lg italic text-accent-soft">
            {t.tagline}
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/50">
            {t.disclaimer}
          </p>
        </div>

        <div>
          <h3 className="label">{t.visit}</h3>
          <address className="mt-5 space-y-1.5 text-sm not-italic leading-relaxed text-cream/60">
            {t.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2 text-cream/35">{t.illustrative}</p>
          </address>
        </div>

        <div>
          <h3 className="label">{t.hours}</h3>
          <dl className="mt-5 space-y-2.5 text-sm">
            {t.hoursRows.map((h) => (
              <div
                key={h.day}
                className="flex items-center justify-between gap-4 border-b border-cream/8 pb-2.5"
              >
                <dt className="text-cream/55">{h.day}</dt>
                <dd className="tabular-nums text-cream/80">{h.time}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6 flex gap-3">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-cream/60 transition-colors hover:border-accent hover:text-cream"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-[0.7rem] uppercase tracking-[0.14em] text-cream/35 sm:flex-row sm:px-8">
          <p>{t.copyright(formatters.year())}</p>
          <p>{t.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
