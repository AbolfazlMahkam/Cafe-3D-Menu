"use client";

/** Brand palette mirrored from globals.css so the 3D layer stays on-brand. */
export const PALETTE = {
  noir: "#0b0b0b",
  char: "#211a16",
  espresso: "#16110e",
  accent: "#b77a45",
  accentSoft: "#d5a273",
  cream: "#e8d9c6",
  creamDim: "#b9a892",
  keyLight: "#ffd9a8",
  rim: "#b77a45",
  cool: "#6f86a6",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface DeviceTier {
  mobile: boolean;
  dpr: [number, number];
  beanCount: number;
  shadows: boolean;
  contactResolution: number;
  envResolution: number;
  antialias: boolean;
}

/** A coarse device tier used to scale scene density and render quality. */
export function getDeviceTier(): DeviceTier {
  if (typeof window === "undefined") {
    return {
      mobile: false,
      dpr: [1, 2],
      beanCount: 46,
      shadows: true,
      contactResolution: 512,
      envResolution: 256,
      antialias: true,
    };
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mobile = coarse || narrow || cores <= 4;

  return mobile
    ? {
        mobile: true,
        dpr: [1, 1.5],
        beanCount: 24,
        shadows: false,
        contactResolution: 256,
        envResolution: 128,
        antialias: false,
      }
    : {
        mobile: false,
        dpr: [1, 2],
        beanCount: 46,
        shadows: true,
        contactResolution: 512,
        envResolution: 256,
        antialias: true,
      };
}

/** Cheap deterministic pseudo-random generator (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
