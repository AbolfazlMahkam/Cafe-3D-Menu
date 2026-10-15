"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { INSPECT_MAX_PITCH, INSPECT_SPEED, inspect } from "./inspect";

/** Elements that should keep their own click / drag behaviour untouched. */
const INTERACTIVE =
  "a, button, input, textarea, select, label, [role='tab'], [role='dialog'], [data-inspect-ignore]";

const _ndc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _objects: THREE.Object3D[] = [];

/**
 * Turns pointer presses into a drag-to-inspect gesture on the registered 3D
 * objects. It listens on `window` rather than the canvas because the DOM
 * content sits above the fixed WebGL layer and would otherwise swallow the
 * events; presses that land on interactive chrome are ignored.
 */
export function Inspector() {
  const { camera, gl, invalidate } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let cursor = "";

    const setCursor = (value: string) => {
      if (cursor === value) return;
      cursor = value;
      document.body.style.cursor = value;
    };

    const hitTest = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      _ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      _raycaster.setFromCamera(_ndc, camera);

      // Only test objects the scene currently shows, so the menu sections
      // (where every object has faded out) never start a drag.
      _objects.length = 0;
      for (const entry of inspect.entries.values()) {
        if (entry.object.visible) _objects.push(entry.object);
      }
      if (_objects.length === 0) return null;

      const hits = _raycaster.intersectObjects(_objects, true);
      if (hits.length === 0) return null;

      // Walk up from the hit mesh to the registered root it belongs to.
      for (const entry of inspect.entries.values()) {
        let node: THREE.Object3D | null = hits[0].object;
        while (node) {
          if (node === entry.object) return entry;
          node = node.parent;
        }
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE)) return;

      const entry = hitTest(e.clientX, e.clientY);
      if (!entry) return;

      // Start from wherever the object currently sits, so grabbing mid-return
      // (or re-grabbing) never snaps it to a stale orientation.
      entry.target.x = entry.current.x;
      entry.target.y = entry.current.y;

      inspect.activeId = entry.id;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      setCursor("grabbing");
      e.preventDefault();
      invalidate();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || !inspect.activeId) {
        const target = e.target as Element | null;
        if (target?.closest(INTERACTIVE)) {
          setCursor("");
          return;
        }
        setCursor(hitTest(e.clientX, e.clientY) ? "grab" : "");
        return;
      }

      const entry = inspect.entries.get(inspect.activeId);
      if (!entry) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      entry.target.y += dx * INSPECT_SPEED;
      entry.target.x = THREE.MathUtils.clamp(
        entry.target.x + dy * INSPECT_SPEED,
        -INSPECT_MAX_PITCH,
        INSPECT_MAX_PITCH,
      );
      invalidate();
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      inspect.activeId = null;
      setCursor("");
      // Keep the demand loop awake while the object eases back to rest.
      invalidate();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      setCursor("");
    };
  }, [camera, gl, invalidate]);

  return null;
}

export default Inspector;
