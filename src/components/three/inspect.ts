"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { damp } from "./timeline";

/** Radians of rotation applied per pixel of pointer travel while dragging. */
export const INSPECT_SPEED = 0.008;

/** Maximum pitch (rotation around X) so the object can never flip over. */
export const INSPECT_MAX_PITCH = 0.85;

export interface InspectEntry {
  id: string;
  /** The group whose rotation receives the drag offset. */
  object: THREE.Group;
  /** Accumulated drag target, radians, written by the pointer handler. */
  target: { x: number; y: number };
  /** Smoothed offset actually applied, eased back to zero on release. */
  current: { x: number; y: number };
}

/**
 * Shared state for the click-drag object inspection interaction. A single
 * pointer handler (see `Inspector`) owns `activeId` and writes each entry's
 * `target`; every inspectable object samples its own `current` inside
 * `useFrame`, so the drag composes cleanly with the scroll-driven rotation.
 */
export const inspect = {
  /** Id of the object currently being dragged, or null. */
  activeId: null as string | null,
  entries: new Map<string, InspectEntry>(),
};

/**
 * Registers a scene object as inspectable and returns a per-frame sampler.
 * Call the sampler from the object's own `useFrame` (before writing rotation)
 * and add the returned offset to its rotation.
 */
export function useInspectable(id: string, groupRef: RefObject<THREE.Group | null>) {
  useEffect(() => {
    const object = groupRef.current;
    if (!object) return;
    const entry: InspectEntry = {
      id,
      object,
      target: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
    };
    inspect.entries.set(id, entry);
    return () => {
      inspect.entries.delete(id);
      if (inspect.activeId === id) inspect.activeId = null;
    };
  }, [id, groupRef]);

  return (dt: number): { x: number; y: number } => {
    const entry = inspect.entries.get(id);
    if (!entry) return { x: 0, y: 0 };
    const active = inspect.activeId === id;
    const tx = active ? entry.target.x : 0;
    const ty = active ? entry.target.y : 0;
    // Snappy while the user is dragging, a touch slower on the way home.
    const lambda = active ? 16 : 9;
    entry.current.x = damp(entry.current.x, tx, lambda, dt);
    entry.current.y = damp(entry.current.y, ty, lambda, dt);
    return entry.current;
  };
}
