"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { computeTimeline } from "./timeline";
import { prefersReducedMotion } from "./env";
import { sceneLayout } from "./layout";

interface Key {
  p: THREE.Vector3;
  l: THREE.Vector3;
}

type KeyName = "beans" | "grind" | "prep" | "lock" | "extract" | "cupHero" | "signature";

// The copy column always sits on the left, so each beat's look target is
// offset to the left of its subject — the subject then reads in the right half
// of the frame, clear of the text.
const KEY_DESKTOP: Record<KeyName, Key> = {
  beans: { p: new THREE.Vector3(0.4, 0.9, 5.0), l: new THREE.Vector3(-0.35, 0.1, -0.1) },
  grind: { p: new THREE.Vector3(0.15, 0.8, 4.4), l: new THREE.Vector3(-0.4, 0.18, 0.0) },
  prep: { p: new THREE.Vector3(0.1, 0.55, 4.0), l: new THREE.Vector3(-0.4, -0.05, 0.32) },
  lock: { p: new THREE.Vector3(0.6, 0.95, 4.1), l: new THREE.Vector3(-0.95, 0.46, 0.22) },
  extract: { p: new THREE.Vector3(0.5, 0.75, 4.2), l: new THREE.Vector3(-0.9, 0.28, 0.28) },
  cupHero: { p: new THREE.Vector3(0.15, 0.3, 5.15), l: new THREE.Vector3(-0.22, 0.08, 0.8) },
  signature: { p: new THREE.Vector3(0.28, 0.5, 5.5), l: new THREE.Vector3(0.42, 0.05, 0.2) },
};

// Portrait re-framing: pull back, centre the beat on the narrow axis and aim
// the look-at above each subject so it settles into the lower half of the
// screen, clear of the overlaid story copy.
const KEY_MOBILE: Record<KeyName, Key> = {
  beans: { p: new THREE.Vector3(0, 1.4, 7.6), l: new THREE.Vector3(0, 0.5, -0.1) },
  grind: { p: new THREE.Vector3(0, 1.1, 6.8), l: new THREE.Vector3(0, 0.38, 0.0) },
  prep: { p: new THREE.Vector3(0, 0.72, 6.0), l: new THREE.Vector3(0, 0.08, 0.25) },
  lock: { p: new THREE.Vector3(0, 1.2, 6.4), l: new THREE.Vector3(0, 0.5, 0.15) },
  extract: { p: new THREE.Vector3(0, 0.92, 6.2), l: new THREE.Vector3(0, 0.32, 0.2) },
  cupHero: { p: new THREE.Vector3(0, 0.52, 6.2), l: new THREE.Vector3(0, 0.58, 0.9) },
  signature: { p: new THREE.Vector3(0, 0.5, 6.6), l: new THREE.Vector3(0, 0.45, 0.1) },
};

const NAMES: KeyName[] = ["beans", "grind", "prep", "lock", "extract", "cupHero", "signature"];

const blended: Record<KeyName, Key> = {
  beans: { p: new THREE.Vector3(), l: new THREE.Vector3() },
  grind: { p: new THREE.Vector3(), l: new THREE.Vector3() },
  prep: { p: new THREE.Vector3(), l: new THREE.Vector3() },
  lock: { p: new THREE.Vector3(), l: new THREE.Vector3() },
  extract: { p: new THREE.Vector3(), l: new THREE.Vector3() },
  cupHero: { p: new THREE.Vector3(), l: new THREE.Vector3() },
  signature: { p: new THREE.Vector3(), l: new THREE.Vector3() },
};

export function CameraRig() {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const desiredP = useRef(new THREE.Vector3(0, 0.18, 6.3));
  const desiredL = useRef(new THREE.Vector3(0, 0, 0));
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const { beans, grind, prep, lock, extract, cupHero, stage, global } = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );

    // The cup hero hands its framing to the signature stage as that section
    // approaches, so the final shot flows straight into the featured drinks.
    const w: Record<KeyName, number> = {
      beans,
      grind,
      prep,
      lock,
      extract,
      cupHero: cupHero * (1 - stage),
      signature: stage,
    };

    const portrait = sceneLayout.portrait;
    for (const name of NAMES) {
      const d = blended[name];
      const a = KEY_DESKTOP[name];
      const b = KEY_MOBILE[name];
      d.p.copy(a.p).lerp(b.p, portrait);
      d.l.copy(a.l).lerp(b.l, portrait);
    }

    let sum = 0;
    for (const name of NAMES) sum += w[name];
    const norm = sum > 0.001 ? sum : 1;

    const p = desiredP.current.set(0, 0, 0);
    const l = desiredL.current.set(0, 0, 0);
    for (const name of NAMES) {
      p.addScaledVector(blended[name].p, w[name] / norm);
      l.addScaledVector(blended[name].l, w[name] / norm);
    }

    const parallax = 1 - portrait * 0.55;
    p.x += scrollSmoothed.pointerX * 0.26 * parallax;
    p.y += scrollSmoothed.pointerY * -0.16 * parallax;
    p.z += scrollSmoothed.menuReveal * 1.6;

    const ease = reduced ? 1 : 1 - Math.exp(-8 * dt);
    camera.position.lerp(p, ease);
    target.current.lerp(l, ease);
    camera.lookAt(target.current);

    gl.domElement.style.opacity = String(global);
  });

  return null;
}
