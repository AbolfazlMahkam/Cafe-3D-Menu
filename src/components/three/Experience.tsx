"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollBus, scrollSmoothed } from "@/lib/scroll";
import { useExperienceStore } from "@/store/experience";
import { CoffeeBeans } from "./CoffeeBeans";
import { CoffeeCup } from "./CoffeeCup";
import { CameraRig } from "./CameraRig";
import { EspressoMachine } from "./EspressoMachine";
import { Extraction } from "./Extraction";
import { Grinder } from "./Grinder";
import { Portafilter } from "./Portafilter";
import { Inspector } from "./Inspector";
import { ScrollSmoothing } from "./ScrollSmoothing";
import { PALETTE, getDeviceTier, prefersReducedMotion } from "./env";

function Ready() {
  const setReady = useExperienceStore((s) => s.setReady);
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    setReady(true);
  });
  return null;
}

function ContextGuard() {
  const setWebglFailed = useExperienceStore((s) => s.setWebglFailed);
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost, false);
    return () => canvas.removeEventListener("webglcontextlost", onLost, false);
  }, [gl, setWebglFailed]);
  return null;
}

function Lighting({ shadows, shadowMap }: { shadows: boolean; shadowMap: number }) {
  return (
    <>
      {/* The HDRI supplies soft image-based ambience; these lights shape the
          hero and separate it from the dark set. */}
      <ambientLight intensity={0.12} color={PALETTE.cream} />
      <directionalLight
        castShadow={shadows}
        position={[-3.6, 6.4, 5.2]}
        intensity={2.4}
        color={PALETTE.keyLight}
        shadow-mapSize={[shadowMap, shadowMap]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={3}
      />
      {/* Warm rim from behind-right. */}
      <pointLight position={[4.4, 2.8, -3.4]} intensity={34} distance={20} color={PALETTE.rim} />
      {/* Cool fill keeps shadow detail alive. */}
      <pointLight position={[4.2, 0.2, 4.2]} intensity={8} distance={15} color={PALETTE.cool} />
      {/* Soft warm bounce from the front. */}
      <pointLight position={[-2.6, 0.6, 4.2]} intensity={7} distance={14} color={PALETTE.accentSoft} />
    </>
  );
}

/**
 * Drives manual rendering under `frameloop="demand"` so the GPU idles once the
 * scene has scrolled away behind the opaque menu. Reduced-motion renders a
 * single static frame.
 */
function FrameDriver({ reduced }: { reduced: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
    if (reduced) return;
    let raf = 0;
    const loop = () => {
      // Keep rendering for as long as the 3D layer is visible so the ambient
      // idle motion (float, drift, sway) never freezes; let the GPU idle only
      // once the opaque menu has fully covered the canvas.
      //
      // Gate on BOTH the raw and smoothed reveal. The smoothed value is only
      // advanced inside `useFrame`, so gating on it alone deadlocks: once the
      // loop idles at the bottom it freezes at ~1 and never resumes, leaving
      // the canvas at opacity 0 while scrolling back up. The raw `scrollBus`
      // is written by ScrollTrigger every frame, so it reliably drops below 1
      // and restarts the loop.
      if (scrollBus.menuReveal < 0.999 || scrollSmoothed.menuReveal < 0.999) invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, reduced]);
  return null;
}

export function Experience() {
  const tier = useMemo(() => getDeviceTier(), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const setWebglFailed = useExperienceStore((s) => s.setWebglFailed);

  return (
    <Canvas
      dpr={tier.dpr}
      shadows={tier.shadows ? "percentage" : false}
      frameloop="demand"
      gl={{
        antialias: tier.antialias,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0.18, 6.3], fov: 34, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        // The cup's rising coffee level is faked with a world-space clipping
        // plane on the coffee material.
        gl.localClippingEnabled = true;
        gl.domElement.style.pointerEvents = "none";
        gl.domElement.style.transition = "opacity 160ms linear";
      }}
      onError={() => setWebglFailed(true)}
      style={{ position: "absolute", inset: 0 }}
    >
      <fog attach="fog" args={[PALETTE.noir, 6.5, 15]} />

      <ScrollSmoothing />

      <Lighting shadows={tier.shadows} shadowMap={tier.mobile ? 1024 : 2048} />

      <Suspense fallback={null}>
        {/* A real (CC0) studio HDRI drives image-based reflections and soft
            ambience, so ceramic and brushed metal reflect a believable room. */}
        <Environment
          files="/hdri/studio_small_03_1k.hdr"
          background={false}
          environmentIntensity={0.7}
          environmentRotation={[0, Math.PI * 0.12, 0]}
        />
        <Grinder />
        <Portafilter />
        <EspressoMachine />
        <Extraction />
        <CoffeeBeans />
        <CoffeeCup />
        {/* Only signals "ready" once every suspended asset has resolved. */}
        <Ready />
      </Suspense>

      {tier.shadows && (
        <ContactShadows
          position={[0, -0.035, 0]}
          opacity={0.62}
          scale={14}
          blur={2.9}
          far={4.2}
          resolution={tier.contactResolution}
          color="#000000"
        />
      )}

      <CameraRig />
      <ContextGuard />
      <Inspector />
      <FrameDriver reduced={reduced} />
    </Canvas>
  );
}

export default Experience;
