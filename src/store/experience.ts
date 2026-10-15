"use client";

import { create } from "zustand";

interface ExperienceState {
  /** Index into the signature drink list. */
  signature: number;
  setSignature: (index: number) => void;
  /** True while the first WebGL frame has rendered. */
  ready: boolean;
  setReady: (ready: boolean) => void;
  /** True when WebGL is unavailable or crashed. */
  webglFailed: boolean;
  setWebglFailed: (failed: boolean) => void;
  /** True once the user has dismissed the loading curtain. */
  introDone: boolean;
  setIntroDone: (done: boolean) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  signature: 0,
  setSignature: (signature) => set({ signature }),
  ready: false,
  setReady: (ready) => set({ ready }),
  webglFailed: false,
  setWebglFailed: (webglFailed) => set({ webglFailed }),
  introDone: false,
  setIntroDone: (introDone) => set({ introDone }),
}));
