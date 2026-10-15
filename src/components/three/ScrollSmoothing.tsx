"use client";

import { useFrame } from "@react-three/fiber";
import { updateScrollSmoothing } from "@/lib/scroll";

/**
 * Runs first in the frame so every other 3D component reads a scroll bus that
 * has already been filtered for this frame. Mounted before the suspended scene
 * children so its `useFrame` callback is subscribed (and therefore executed)
 * ahead of theirs.
 */
export function ScrollSmoothing() {
  useFrame((_, delta) => {
    updateScrollSmoothing(Math.min(delta, 1 / 30));
  });
  return null;
}

export default ScrollSmoothing;
