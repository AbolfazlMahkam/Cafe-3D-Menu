import type { Category, ProductId, SizeKey } from "@/lib/products";
import type { SignatureProductId } from "@/lib/signature";

export type Locale = "fa" | "en";

export type Dir = "rtl" | "ltr";

export interface ProductCopy {
  name: string;
  description: string;
  notes: string[];
  origin?: string;
}

export interface SignatureCopy {
  alias: string;
  line: string;
  notes: string[];
}

export interface BeatCopy {
  index: string;
  label: string;
  /** Heading, one entry per visual line. */
  title: string[];
  body: string;
  items?: string[];
}

export interface HoursRow {
  day: string;
  time: string;
}

export interface Messages {
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    keywords: string[];
  };

  a11y: {
    skipToMenu: string;
    primaryNav: string;
    home: string;
    openCart: (count: number) => string;
    cart: string;
    openMenu: string;
    closeMenu: string;
    productIllustration: (title: string) => string;
    language: string;
    switchLanguage: string;
  };

  nav: {
    origin: string;
    craft: string;
    signature: string;
    menu: string;
    cart: string;
  };

  story: {
    hero: {
      brandLine: string;
      title: string[];
      lead: string;
      exploreMenu: string;
      theStory: string;
      scroll: string;
      introLabel: string;
    };
    beats: {
      origin: BeatCopy;
      prep: BeatCopy;
      lock: BeatCopy;
      extract: BeatCopy;
      cup: BeatCopy;
    };
  };

  signature: {
    index: string;
    label: string;
    title: string;
    lead: string;
    from: string;
    addToCart: string;
    addToCartAria: (name: string) => string;
    region: string;
    drinks: Record<SignatureProductId, SignatureCopy>;
  };

  menu: {
    index: string;
    label: string;
    title: string;
    lead: string;
    count: (n: number) => string;
    add: string;
    details: string;
    viewDetails: (name: string) => string;
    price: string;
    chooseSize: string;
    addToCart: string;
    closeDetails: string;
    region: string;
    filters: Record<Category | "all", string>;
    categoryLabel: Record<Category, string>;
  };

  cart: {
    heading: string;
    yourOrder: string;
    empty: string;
    browseMenu: string;
    dialogLabel: string;
    close: string;
    decrease: (name: string) => string;
    increase: (name: string) => string;
    quantity: string;
    remove: string;
    subtotal: string;
    demoNote: string;
    checkout: string;
    clear: string;
  };

  footer: {
    tagline: string;
    disclaimer: string;
    visit: string;
    address: string[];
    illustrative: string;
    hours: string;
    hoursRows: HoursRow[];
    copyright: (year: string) => string;
    builtWith: string;
  };

  loading: {
    preparing: string;
    servingWithout3d: string;
  };

  products: Record<ProductId, ProductCopy>;
  sizeLabels: Record<SizeKey, string>;
}
