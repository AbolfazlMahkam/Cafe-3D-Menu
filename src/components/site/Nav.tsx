"use client";

import { useEffect, useState } from "react";
import { selectCount, useCartHydrated, useCartStore } from "@/store/cart";
import { useI18n } from "@/lib/i18n/provider";



export function Nav() {
  const { messages, toggleLocale, locale } = useI18n();
  const t = messages.nav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore(selectCount);
  const hydrated = useCartHydrated();

  const LINKS = [
    { href: "#origin", label: t.origin },
    { href: "#craft", label: t.craft },
    { href: "#signature", label: t.signature },
    { href: "#menu", label: t.menu },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? "border-b border-cream/10 bg-noir/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label={messages.a11y.primaryNav}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8"
      >
        <a
          href="#top"
          className="group flex items-baseline gap-1.5"
          aria-label={messages.a11y.home}
        >
          <span className="font-display text-2xl tracking-[0.32em] text-cream sm:text-[1.7rem]">
            NOIR
          </span>
          <span className="mb-1 h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-500 group-hover:scale-125" />
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-[0.72rem] font-medium uppercase tracking-[0.24em] text-cream/70 transition-colors hover:text-cream"
              >
                {l.label}
                <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="hidden h-10 items-center gap-2 rounded-full border border-cream/15 px-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:border-accent hover:bg-accent/10 md:flex"
            aria-label={messages.a11y.switchLanguage}
            title={messages.a11y.language}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" strokeLinecap="round" />
              <path d="M12 3c2.5 3 2.5 15 0 18c-2.5-3-2.5-15 0-18Z" />
            </svg>
            <span>{locale === "fa" ? "EN" : "FA"}</span>
          </button>

          <button
            type="button"
            onClick={openCart}
            className="relative flex h-10 items-center gap-2.5 rounded-full border border-cream/15 px-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-cream transition-colors hover:border-accent hover:bg-accent/10"
            aria-label={messages.a11y.openCart(hydrated ? count : 0)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 8h12l-1 11H7L6 8Z" strokeLinejoin="round" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">{t.cart}</span>
            <span
              className={`grid min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[0.66rem] font-bold text-noir ${
                hydrated && count > 0 ? "" : "hidden"
              }`}
              aria-hidden="true"
            >
              {hydrated ? count : 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream md:hidden"
            aria-label={open ? messages.a11y.closeMenu : messages.a11y.openMenu}
            aria-expanded={open}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute start-0 h-px w-full bg-current transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute start-0 top-1.5 h-px w-full bg-current transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute start-0 h-px w-full bg-current transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`overflow-hidden border-t border-cream/10 bg-noir/95 backdrop-blur-md transition-[max-height,opacity] duration-500 md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-4">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block border-b border-cream/5 py-4 font-display text-2xl text-cream/90"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export default Nav;
