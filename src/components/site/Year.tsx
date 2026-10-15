"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Renders the current year on the client only. The server cannot safely read
 * the wall clock during prerender under Cache Components, so it emits the
 * fallback during SSR and hydration, then swaps to the live year on the client.
 */
export function Year({ fallback = "" }: { fallback?: string }) {
  const year = useSyncExternalStore(
    noop,
    () => String(new Date().getFullYear()),
    () => fallback,
  );

  return <>{year}</>;
}

export default Year;
