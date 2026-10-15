"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct, type ProductId } from "@/lib/products";

export interface CartLine {
  /** Stable line id: product id + size id (or "std"). */
  lineId: string;
  productId: ProductId;
  /** Size variant id (e.g. "s" | "m" | "l") or null for single-size items. */
  sizeId: string | null;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: ProductId, sizeId?: string | null) => void;
  increment: (lineId: string) => void;
  decrement: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
}

function lineKey(productId: string, sizeId?: string | null) {
  return `${productId}::${sizeId ?? "std"}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (productId, sizeId = null) =>
        set((state) => {
          const product = getProduct(productId);
          if (!product) return state;
          const size = product.sizes?.find((s) => s.id === sizeId) ?? null;
          const key = lineKey(productId, sizeId);
          const unitPrice =
            Math.round((product.price + (size?.priceDelta ?? 0)) * 100) / 100;
          const existing = state.lines.find((l) => l.lineId === key);
          const lines = existing
            ? state.lines.map((l) =>
                l.lineId === key
                  ? { ...l, quantity: Math.min(l.quantity + 1, 99) }
                  : l,
              )
            : [
                ...state.lines,
                {
                  lineId: key,
                  productId,
                  sizeId,
                  unitPrice,
                  quantity: 1,
                } satisfies CartLine,
              ];
          return { lines, isOpen: true };
        }),

      increment: (lineId) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.lineId === lineId
              ? { ...l, quantity: Math.min(l.quantity + 1, 99) }
              : l,
          ),
        })),

      decrement: (lineId) =>
        set((state) => ({
          lines: state.lines.flatMap((l) => {
            if (l.lineId !== lineId) return [l];
            if (l.quantity <= 1) return [];
            return [{ ...l, quantity: l.quantity - 1 }];
          }),
        })),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.lineId !== lineId)
              : state.lines.map((l) =>
                  l.lineId === lineId
                    ? { ...l, quantity: Math.min(Math.max(1, quantity), 99) }
                    : l,
                ),
        })),

      removeItem: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "noir-cart-v2",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

/** True once the persisted cart has been rehydrated on the client. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}

export const selectCount = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  Math.round(s.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) * 100) /
  100;
