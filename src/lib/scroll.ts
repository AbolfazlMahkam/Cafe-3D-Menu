/**
 * A tiny mutable scroll bus.
 *
 * GSAP ScrollTrigger writes into this object on the main thread; the R3F render
 * loop reads from it inside `useFrame`. Using a plain object (not React state)
 * keeps scroll at 60fps without re-rendering the component tree.
 */
export interface ScrollBus {
  /** 0 → 1 across the 3D story (hero → origin → craft). */
  story: number;
  /** 0 → 1 across the signature drinks section. */
  signature: number;
  /** 0 → 1 as the practical menu rises into view (3D recedes). */
  menuReveal: number;
  /** 0 → 1 overall document scroll, used for ambient effects. */
  page: number;
  /** Normalised pointer, -1 → 1. */
  pointerX: number;
  pointerY: number;
  /** Whether the WebGL layer should be visible at all. */
  canvasVisible: boolean;
}

export const scrollBus: ScrollBus = {
  story: 0,
  signature: 0,
  menuReveal: 0,
  page: 0,
  pointerX: 0,
  pointerY: 0,
  canvasVisible: true,
};

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

/** Maps a global story value to a local 0→1 band. */
export function band(value: number, start: number, end: number): number {
  if (end === start) return value >= end ? 1 : 0;
  return clamp((value - start) / (end - start));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * A damped mirror of `scrollBus`. ScrollTrigger writes raw progress (wheel and
 * trackpad input arrive in discrete, uneven steps), so every 3D component reads
 * from this instead — a single exponential filter turns the stair-stepped input
 * into continuous motion and keeps the whole scene perfectly in step.
 */
export interface SmoothScrollBus {
  story: number;
  signature: number;
  menuReveal: number;
  page: number;
  pointerX: number;
  pointerY: number;
}

export const scrollSmoothed: SmoothScrollBus = {
  story: 0,
  signature: 0,
  menuReveal: 0,
  page: 0,
  pointerX: 0,
  pointerY: 0,
};

/** Per-frame exponential smoothing of the raw bus. Higher lambda → snappier. */
export function updateScrollSmoothing(dt: number): void {
  const scroll = 1 - Math.exp(-7.5 * dt);
  const pointer = 1 - Math.exp(-12 * dt);
  scrollSmoothed.story += (scrollBus.story - scrollSmoothed.story) * scroll;
  scrollSmoothed.signature += (scrollBus.signature - scrollSmoothed.signature) * scroll;
  scrollSmoothed.menuReveal += (scrollBus.menuReveal - scrollSmoothed.menuReveal) * scroll;
  scrollSmoothed.page += (scrollBus.page - scrollSmoothed.page) * scroll;
  scrollSmoothed.pointerX += (scrollBus.pointerX - scrollSmoothed.pointerX) * pointer;
  scrollSmoothed.pointerY += (scrollBus.pointerY - scrollSmoothed.pointerY) * pointer;
}
