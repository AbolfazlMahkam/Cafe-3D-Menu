"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductArt } from "@/components/ProductArt";
import { Reveal } from "./Reveal";
import {
  CATEGORY_FILTERS,
  PRODUCTS,
  type Category,
  type Product,
  type SizeVariant,
} from "@/lib/products";
import { useCartStore } from "@/store/cart";
import { useI18n } from "@/lib/i18n/provider";

function defaultSize(product: Product): SizeVariant | undefined {
  if (!product.sizes?.length) return undefined;
  return product.sizes.find((s) => s.priceDelta === 0) ?? product.sizes[0];
}

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  const { messages, formatters } = useI18n();
  const addItem = useCartStore((s) => s.addItem);
  const copy = messages.products[product.id];
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-b from-char/60 to-noir transition-colors duration-500 hover:border-accent/40">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="relative block aspect-square w-full overflow-hidden"
        aria-label={messages.menu.viewDetails(copy.name)}
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
          <ProductArt art={product.art} title={copy.name} className="h-full w-full" />
        </div>
        <span className="absolute start-4 top-4 rounded-full border border-cream/15 bg-noir/50 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-cream/70 backdrop-blur-sm">
          {messages.menu.categoryLabel[product.category]}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl leading-snug text-cream">
            {copy.name}
          </h3>
          <span className="mt-0.5 shrink-0 font-display text-lg text-accent-soft tabular-nums">
            {formatters.price(product.price)}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream/55">
          {copy.description}
        </p>
        <div className="mt-5 flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => addItem(product.id, defaultSize(product)?.id ?? null)}
            className="flex-1 rounded-full bg-cream/10 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-accent hover:text-noir"
          >
            {messages.menu.add}
          </button>
          <button
            type="button"
            onClick={() => onOpen(product)}
            className="rounded-full border border-cream/15 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-cream/70 transition-colors hover:border-accent hover:text-cream"
          >
            {messages.menu.details}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { messages, formatters } = useI18n();
  const addItem = useCartStore((s) => s.addItem);
  const [sizeId, setSizeId] = useState<string | null>(() =>
    product ? (defaultSize(product)?.id ?? null) : null,
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;
  const copy = messages.products[product.id];
  const size = product.sizes?.find((s) => s.id === sizeId) ?? defaultSize(product);
  const price = product.price + (size?.priceDelta ?? 0);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-noir/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-t-3xl border border-cream/12 bg-espresso shadow-2xl sm:rounded-3xl md:grid-cols-2"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={messages.menu.closeDetails}
          className="absolute end-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-cream/15 bg-noir/60 text-cream backdrop-blur-sm transition-colors hover:border-accent"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative aspect-square w-full overflow-hidden bg-noir">
          <ProductArt art={product.art} title={copy.name} className="h-full w-full" />
        </div>

        <div className="flex max-h-[70svh] flex-col overflow-y-auto p-7 sm:p-9 md:max-h-none">
          <p className="label">{messages.menu.categoryLabel[product.category]}</p>
          <h3
            id="product-dialog-title"
            className="mt-3 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight text-cream"
          >
            {copy.name}
          </h3>
          {copy.origin && (
            <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-accent-soft/80">
              {copy.origin}
            </p>
          )}
          <p className="mt-5 text-sm leading-relaxed text-cream/65">
            {copy.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {copy.notes.map((n) => (
              <li
                key={n}
                className="rounded-full border border-cream/12 px-3 py-1 text-[0.66rem] uppercase tracking-[0.14em] text-cream/55"
              >
                {n}
              </li>
            ))}
          </ul>

          {product.sizes && product.sizes.length > 0 && (
            <fieldset className="mt-7">
              <legend className="label">{messages.menu.chooseSize}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const selected = s.id === sizeId;
                  return (
                    <label
                      key={s.id}
                      className={`cursor-pointer rounded-2xl border px-4 py-2.5 text-center text-xs transition-colors ${
                        selected
                          ? "border-accent bg-accent/12 text-cream"
                          : "border-cream/15 text-cream/60 hover:border-cream/35"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={s.id}
                        checked={selected}
                        onChange={() => setSizeId(s.id)}
                        className="sr-only"
                      />
                      <span className="block font-medium">
                        {messages.sizeLabels[s.labelKey]}
                      </span>
                      <span className="mt-0.5 block text-[0.66rem] tabular-nums text-cream/45">
                        {formatters.price(product.price + s.priceDelta)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-cream/10 pt-6">
            <div>
              <div className="text-[0.66rem] uppercase tracking-[0.16em] text-cream/40">
                {messages.menu.price}
              </div>
              <div className="font-display text-3xl text-cream tabular-nums">
                {formatters.price(price)}
              </div>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                addItem(product.id, size?.id ?? null);
                onClose();
              }}
            >
              {messages.menu.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Menu() {
  const { messages } = useI18n();
  const t = messages.menu;
  const [category, setCategory] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Product | null>(null);

  const products = useMemo(
    () =>
      category === "all"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === category),
    [category],
  );

  return (
    <section
      id="menu"
      className="relative z-10 border-t border-cream/10 bg-noir py-24 sm:py-32"
      aria-label={t.region}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Reveal y={30}>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm tracking-[0.3em] text-accent">
                  {t.index}
                </span>
                <span className="h-px w-8 bg-accent/50" />
                <span className="label">{t.label}</span>
              </div>
              <h2 className="mt-6 max-w-xl font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.0] text-cream">
                {t.title}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/55">
                {t.lead}
              </p>
            </div>
          </Reveal>

          <Reveal y={20} className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((c) => {
              const active = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "border-accent bg-accent text-noir"
                      : "border-cream/15 text-cream/60 hover:border-cream/35 hover:text-cream"
                  }`}
                >
                  {t.filters[c]}
                </button>
              );
            })}
          </Reveal>
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.18em] text-cream/35">
          {t.count(products.length)}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={setSelected} />
          ))}
        </div>
      </div>

      <ProductDialog
        key={selected?.id ?? "empty"}
        product={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

export default Menu;
