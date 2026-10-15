"use client";

import { Reveal } from "./Reveal";
import { RESOLVED_SIGNATURES as resolved } from "@/lib/signature";
import { useCartStore } from "@/store/cart";
import { useExperienceStore } from "@/store/experience";
import { useI18n } from "@/lib/i18n/provider";

export function Signature() {
  const { messages, formatters } = useI18n();
  const t = messages.signature;
  const active = useExperienceStore((s) => s.signature);
  const setSignature = useExperienceStore((s) => s.setSignature);
  const addItem = useCartStore((s) => s.addItem);

  const current = resolved[active] ?? resolved[0];
  const drink = t.drinks[current.productId];
  const copy = messages.products[current.productId];

  return (
    <section
      id="signature"
      className="relative flex min-h-[100svh] items-center py-24"
      aria-label={t.region}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Reveal y={20}>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm tracking-[0.3em] text-accent">
                  {t.index}
                </span>
                <span className="h-px w-8 bg-accent/50" />
                <span className="label">{t.label}</span>
              </div>
            </Reveal>
            <Reveal y={40} delay={0.06}>
              <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] text-cream">
                {t.title}
              </h2>
            </Reveal>
            <Reveal y={28} delay={0.12}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-cream/65">
                {t.lead}
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className="flex flex-col gap-1.5" role="tablist" aria-label={t.region}>
            {resolved.map((s, i) => {
              const selected = i === active;
              const d = t.drinks[s.productId];
              const p = messages.products[s.productId];
              return (
                <button
                  key={s.productId}
                  type="button"
                  role="tab"
                  id={`sig-tab-${i}`}
                  aria-selected={selected}
                  aria-controls="sig-panel"
                  onClick={() => setSignature(i)}
                  className={`group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-start transition-all duration-400 ${
                    selected
                      ? "border-accent/60 bg-accent/10"
                      : "border-cream/10 hover:border-cream/25 hover:bg-cream/[0.03]"
                  }`}
                >
                  <span>
                    <span className="block font-display text-xl text-cream">
                      {d.alias}
                    </span>
                    <span className="mt-0.5 block text-xs uppercase tracking-[0.16em] text-cream/40">
                      {p.name}
                    </span>
                  </span>
                  <span
                    className={`text-[0.7rem] tabular-nums transition-colors ${
                      selected ? "text-accent-soft" : "text-cream/35"
                    }`}
                  >
                    {formatters.price(s.product.price)}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="sig-panel"
            role="tabpanel"
            aria-labelledby={`sig-tab-${active}`}
            className="relative flex flex-col justify-between rounded-3xl border border-cream/10 bg-char/40 p-8 backdrop-blur-sm sm:p-10"
          >
            <div>
              <p className="label">{copy.origin}</p>
              <h3 className="mt-4 font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight text-cream">
                {drink.alias}
              </h3>
              <p className="mt-3 font-display text-xl italic text-accent-soft">
                {drink.line}
              </p>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-cream/60">
                {copy.description}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {drink.notes.map((n) => (
                  <li
                    key={n}
                    className="rounded-full border border-cream/12 px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-cream/60"
                  >
                    {n}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex items-center justify-between gap-6 border-t border-cream/10 pt-6">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-cream/40">
                  {t.from}
                </div>
                <div className="font-display text-3xl text-cream">
                  {formatters.price(current.product.price)}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => addItem(current.product.id)}
                aria-label={t.addToCartAria(drink.alias)}
              >
                {t.addToCart}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signature;
