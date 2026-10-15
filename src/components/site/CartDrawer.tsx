"use client";

import { useEffect, useRef } from "react";
import { ProductArt } from "@/components/ProductArt";
import { getProduct } from "@/lib/products";
import {
  selectCount,
  selectSubtotal,
  useCartHydrated,
  useCartStore,
} from "@/store/cart";
import { useI18n } from "@/lib/i18n/provider";

function QtyButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function CartDrawer() {
  const { messages, formatters } = useI18n();
  const t = messages.cart;
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useCartHydrated();

  const subtotal = useCartStore(selectSubtotal);
  const count = useCartStore(selectCount);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const shownLines = hydrated ? lines : [];
  const shownSubtotal = hydrated ? subtotal : 0;
  const shownCount = hydrated ? count : 0;

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-noir/70 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogLabel}
        className={`absolute end-0 top-0 flex h-full w-full max-w-md flex-col border-s border-cream/12 bg-espresso shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-cream/10 px-6 py-5">
          <div>
            <p className="label">{t.yourOrder}</p>
            <h2 className="mt-1 font-display text-2xl text-cream">
              {t.heading}{" "}
              <span className="text-cream/40">({formatters.number(shownCount)})</span>
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label={t.close}
            className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream transition-colors hover:border-accent"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {shownLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-cream/12">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-cream/40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M6 8h12l-1 11H7L6 8Z" strokeLinejoin="round" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="max-w-xs text-sm text-cream/55">{t.empty}</p>
            <button type="button" onClick={closeCart} className="btn-ghost">
              {t.browseMenu}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-cream/8 overflow-y-auto px-4">
              {shownLines.map((line) => {
                const product = getProduct(line.productId);
                if (!product) return null;
                const copy = messages.products[line.productId];
                const sizeVariant =
                  product.sizes?.find((s) => s.id === line.sizeId) ?? null;
                const sizeLabel = sizeVariant
                  ? messages.sizeLabels[sizeVariant.labelKey]
                  : null;
                return (
                  <li key={line.lineId} className="flex gap-4 py-5">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-cream/10">
                      <ProductArt
                        art={product.art}
                        title={copy.name}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-display text-lg text-cream">
                            {copy.name}
                          </p>
                          {sizeLabel && (
                            <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.14em] text-cream/40">
                              {sizeLabel}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm text-cream/70 tabular-nums">
                          {formatters.price(line.unitPrice * line.quantity)}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-2">
                          <QtyButton
                            label={t.decrease(copy.name)}
                            onClick={() => decrement(line.lineId)}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M5 12h14" strokeLinecap="round" />
                            </svg>
                          </QtyButton>
                          <span
                            className="w-8 text-center text-sm tabular-nums text-cream"
                            aria-live="polite"
                          >
                            {formatters.number(line.quantity)}
                          </span>
                          <QtyButton
                            label={t.increase(copy.name)}
                            onClick={() => increment(line.lineId)}
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                            </svg>
                          </QtyButton>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.lineId)}
                          className="text-[0.68rem] uppercase tracking-[0.14em] text-cream/40 transition-colors hover:text-accent-soft"
                        >
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-cream/10 px-6 py-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cream/55">{t.subtotal}</span>
                <span className="font-display text-2xl text-cream tabular-nums">
                  {formatters.price(shownSubtotal)}
                </span>
              </div>
              <p className="mt-1.5 text-[0.68rem] leading-relaxed text-cream/35">
                {t.demoNote}
              </p>
              <button
                type="button"
                disabled
                className="mt-5 w-full rounded-full bg-cream/10 px-5 py-3.5 text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-cream/40"
                aria-disabled="true"
              >
                {t.checkout}
              </button>
              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-center text-[0.68rem] uppercase tracking-[0.14em] text-cream/40 transition-colors hover:text-accent-soft"
              >
                {t.clear}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
