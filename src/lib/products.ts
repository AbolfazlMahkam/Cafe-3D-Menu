export type Category = "hot" | "cold" | "bakery";

export type Vessel = "cup" | "glass" | "mug" | "plate";

export type ArtTone =
  | "espresso"
  | "americano"
  | "cappuccino"
  | "latte"
  | "mocha"
  | "coldbrew"
  | "icedlatte"
  | "croissant"
  | "almondcroissant"
  | "tiramisu"
  | "brownie"
  | "cheesecake";

export type ProductId =
  | "espresso"
  | "americano"
  | "cappuccino"
  | "caffe-latte"
  | "mocha"
  | "cold-brew"
  | "iced-latte"
  | "butter-croissant"
  | "almond-croissant"
  | "tiramisu"
  | "brownie"
  | "basque-cheesecake";

/** Stable key for a size so its label can be localized without touching prices. */
export type SizeKey = "small" | "medium" | "regular" | "large";

export interface SizeVariant {
  id: string;
  /** Key into the active locale's `sizeLabels` dictionary. */
  labelKey: SizeKey;
  /** Price difference in USD relative to the base price. */
  priceDelta: number;
}

export interface Product {
  id: ProductId;
  category: Category;
  /** Base price in USD for the default size. Demo data only. */
  price: number;
  art: ArtTone;
  vessel: Vessel;
  sizes?: SizeVariant[];
  decaf?: boolean;
}

/** Filter ids for the menu, in presentation order. Labels come from i18n. */
export const CATEGORY_FILTERS: (Category | "all")[] = [
  "all",
  "hot",
  "cold",
  "bakery",
];

const DRINK_SIZES: SizeVariant[] = [
  { id: "s", labelKey: "small", priceDelta: -0.5 },
  { id: "m", labelKey: "medium", priceDelta: 0 },
  { id: "l", labelKey: "large", priceDelta: 0.75 },
];

const COLD_SIZES: SizeVariant[] = [
  { id: "m", labelKey: "regular", priceDelta: 0 },
  { id: "l", labelKey: "large", priceDelta: 0.75 },
];

export const PRODUCTS: Product[] = [
  { id: "espresso", category: "hot", price: 3.5, art: "espresso", vessel: "cup", sizes: DRINK_SIZES, decaf: true },
  { id: "americano", category: "hot", price: 4.0, art: "americano", vessel: "cup", sizes: DRINK_SIZES, decaf: true },
  { id: "cappuccino", category: "hot", price: 4.75, art: "cappuccino", vessel: "cup", sizes: DRINK_SIZES, decaf: true },
  { id: "caffe-latte", category: "hot", price: 5.0, art: "latte", vessel: "mug", sizes: DRINK_SIZES, decaf: true },
  { id: "mocha", category: "hot", price: 5.5, art: "mocha", vessel: "mug", sizes: DRINK_SIZES },
  { id: "cold-brew", category: "cold", price: 5.25, art: "coldbrew", vessel: "glass", sizes: COLD_SIZES },
  { id: "iced-latte", category: "cold", price: 5.25, art: "icedlatte", vessel: "glass", sizes: COLD_SIZES, decaf: true },
  { id: "butter-croissant", category: "bakery", price: 3.75, art: "croissant", vessel: "plate" },
  { id: "almond-croissant", category: "bakery", price: 4.5, art: "almondcroissant", vessel: "plate" },
  { id: "tiramisu", category: "bakery", price: 6.5, art: "tiramisu", vessel: "plate" },
  { id: "brownie", category: "bakery", price: 4.75, art: "brownie", vessel: "plate" },
  { id: "basque-cheesecake", category: "bakery", price: 7.0, art: "cheesecake", vessel: "plate" },
];

export function getProduct(id: ProductId): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
