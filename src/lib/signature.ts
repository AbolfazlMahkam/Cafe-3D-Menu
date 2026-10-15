import { getProduct, type Product, type ProductId } from "./products";

export type SignatureProductId = Extract<
  ProductId,
  "espresso" | "cappuccino" | "caffe-latte" | "cold-brew"
>;

export interface ResolvedSignature {
  productId: SignatureProductId;
  product: Product;
}

/**
 * The four drinks that define the bar. Structural only — the alias, tagline and
 * tasting notes live in the locale dictionaries so both the DOM tab list and the
 * 3D signature scene stay in sync in every language.
 */
export const SIGNATURE_IDS: SignatureProductId[] = [
  "espresso",
  "cappuccino",
  "caffe-latte",
  "cold-brew",
];

export const RESOLVED_SIGNATURES: ResolvedSignature[] = SIGNATURE_IDS.map(
  (productId) => ({ productId, product: getProduct(productId) as Product }),
).filter((s) => Boolean(s.product));

export function getSignature(index: number): ResolvedSignature {
  const len = RESOLVED_SIGNATURES.length;
  const clamped = ((index % len) + len) % len;
  return RESOLVED_SIGNATURES[clamped];
}
