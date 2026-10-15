"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useSyncExternalStore } from "react";
import { useExperienceStore } from "@/store/experience";
import { updateSceneLayout } from "./layout";

const noop = () => () => {};

/** False during SSR/hydration, true once running on the client. */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

const Experience = dynamic(() => import("./Experience"), { ssr: false });

interface BoundaryProps {
  children: ReactNode;
  onError: () => void;
}

class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function webglAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

/**
 * The fixed WebGL layer that sits behind the DOM. It is created on the client
 * only, guarded against missing WebGL support and context loss, and fails
 * silently so the menu below stays fully usable without 3D.
 */
export function SceneCanvas() {
  const isClient = useIsClient();
  const webglFailed = useExperienceStore((s) => s.webglFailed);
  const setWebglFailed = useExperienceStore((s) => s.setWebglFailed);
  const setReady = useExperienceStore((s) => s.setReady);

  // Keep the 3D composition in step with the viewport so portrait re-framing
  // reacts to rotation and resize, not just first paint.
  useEffect(() => {
    updateSceneLayout();
    const onResize = () => updateSceneLayout();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    if (!webglAvailable()) setWebglFailed(true);
  }, [setWebglFailed]);

  useEffect(() => {
    if (webglFailed) setReady(true);
  }, [webglFailed, setReady]);

  // Safety net: never let the curtain hang if the scene fails to boot.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 9000);
    return () => window.clearTimeout(t);
  }, [setReady]);

  if (!isClient || webglFailed) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <SceneBoundary onError={() => setWebglFailed(true)}>
        <Experience />
      </SceneBoundary>
    </div>
  );
}

export default SceneCanvas;
