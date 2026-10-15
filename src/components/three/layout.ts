import { clamp } from "@/lib/scroll";

/**
 * Running, viewport-derived composition state for the 3D layer.
 *
 * The scene is authored for a wide landscape stage: the hero cup lives in a
 * right-hand lane and the machine in a left-hand lane. On a phone the viewport
 * is tall and narrow, so that same composition is cropped on both sides. Rather
 * than re-render React on every resize, components read this mutable singleton
 * inside `useFrame` — exactly like the scroll bus — and blend their placement
 * and the camera framing toward a centred portrait composition.
 */
export interface SceneLayout {
  /** True for coarse-pointer / narrow viewports. */
  mobile: boolean;
  /** 0 at a wide viewport, ramping to 1 as it becomes tall and narrow. */
  portrait: number;
  /**
   * +1 for LTR, −1 for RTL. The scene's static X composition is multiplied by
   * this so the subject always settles on the side opposite the copy column:
   * right when the copy is on the left (LTR), left when the copy is on the
   * right (RTL). Rotations are deliberately left untouched — the models are
   * repositioned, never mirrored.
   */
  mirror: number;
}

export const sceneLayout: SceneLayout = { mobile: false, portrait: 0, mirror: 1 };

/**
 * Handle to the R3F invalidator, bridged out from inside the canvas. A change
 * that happens outside the render loop (a locale switch flipping the mirror)
 * calls this to repaint a single frame under `frameloop="demand"`.
 */
export const sceneControl = { invalidate: () => {} };

/** Mirror the 3D composition for the given text direction. */
export function setSceneMirror(dir: "rtl" | "ltr"): void {
  const next = dir === "rtl" ? -1 : 1;
  if (next === sceneLayout.mirror) return;
  sceneLayout.mirror = next;
  sceneControl.invalidate();
}

/** Refresh from the current window size. Safe during SSR (no-op). */
export function updateSceneLayout(): void {
  if (typeof window === "undefined") return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = h > 0 ? w / h : 1;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  sceneLayout.mobile = coarse || w < 900;
  // 0 for aspect >= 1.2 (landscape / desktop), 1 for aspect <= 0.62 (tall phone).
  sceneLayout.portrait = 1 - clamp((aspect - 0.62) / (1.2 - 0.62));
  sceneLayout.mirror = document.documentElement.dir === "rtl" ? -1 : 1;
}

if (typeof window !== "undefined") updateSceneLayout();
