"use client";

import {
  ContactShadows,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { assetPath } from "@/lib/basePath";
import { PALETTE } from "./env";

/**
 * Development-only lab for the imported Blender asset.
 *
 * This component is intentionally isolated from the production scene:
 *  - it lives on its own route (/dev/cup-glb),
 *  - it never mutates the procedural cup / beans / machine,
 *  - it preserves the GLB's own materials (including KHR_materials_transmission
 *    and KHR_materials_ior) instead of substituting generic materials.
 *
 * Loader cache safety: `scene` is deeply cloned and each mesh material is cloned
 * before use, so nothing here can leak state into the shared `useGLTF` cache.
 */

export const CUP_GLB_URL = assetPath("/models/Cup_NOIR.glb");

export interface MaterialReport {
  name: string;
  type: string;
  color: string;
  metalness: number;
  roughness: number;
  transparent: boolean;
  opacity: number;
  transmission: number;
  ior: number | null;
  side: string;
  depthWrite: boolean;
}

export interface MeshReport {
  name: string;
  vertices: number;
  material: string;
}

export interface GlbReport {
  url: string;
  size: [number, number, number];
  center: [number, number, number];
  min: [number, number, number];
  max: [number, number, number];
  materials: MaterialReport[];
  meshes: MeshReport[];
}

const SIDE_NAME: Record<number, string> = {
  [THREE.FrontSide]: "FrontSide",
  [THREE.BackSide]: "BackSide",
  [THREE.DoubleSide]: "DoubleSide",
};

const sideName = (side: THREE.Side): string => SIDE_NAME[side] ?? String(side);
const round = (v: number): number => Math.round(v * 10000) / 10000;
const triple = (v: THREE.Vector3): [number, number, number] => [
  round(v.x),
  round(v.y),
  round(v.z),
];

class GlbErrorBoundary extends Component<
  { children: ReactNode; onError: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function CupModel({ onReport }: { onReport: (report: GlbReport) => void }) {
  const { scene } = useGLTF(CUP_GLB_URL);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        const source = mesh.material as THREE.Material;
        // Clone keeps every property (color, transmission, ior, alphaMode...)
        // while isolating us from the loader cache. No material is replaced.
        mesh.material = source.clone();
      }
    });
    return root;
  }, [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const materials: MaterialReport[] = [];
    const meshes: MeshReport[] = [];
    const seen = new Set<string>();

    model.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      console.log(
        "[CupGlbLab geometry]",
        mesh.name,
        mesh.geometry.boundingBox,
        mesh.geometry.getAttribute("position").count,
      );

      const material = mesh.material as THREE.Material | undefined;
      const vertices = mesh.geometry?.getAttribute("position")?.count ?? 0;
      meshes.push({
        name: mesh.name || "(unnamed)",
        vertices,
        material: material?.name || "(none)",
      });

      if (material && !seen.has(material.uuid)) {
        seen.add(material.uuid);
        const physical = material as THREE.MeshPhysicalMaterial;
        materials.push({
          name: material.name || "(unnamed)",
          type: material.type,
          color: `#${(physical.color ?? new THREE.Color(0xffffff)).getHexString()}`,
          metalness: physical.metalness ?? 0,
          roughness: physical.roughness ?? 1,
          transparent: material.transparent,
          opacity: material.opacity,
          transmission: physical.transmission ?? 0,
          ior: typeof physical.ior === "number" ? round(physical.ior) : null,
          side: sideName(material.side),
          depthWrite: material.depthWrite,
        });
      }
    });

    const report: GlbReport = {
      url: CUP_GLB_URL,
      size: triple(size),
      center: triple(center),
      min: triple(box.min),
      max: triple(box.max),
      materials,
      meshes,
    };

    // Full, unmangled detail for console inspection.
    console.info("[CupGlbLab] measured GLB", report);
    onReport(report);
  }, [model, onReport]);

  return <primitive object={model} />;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 16,
  left: 16,
  zIndex: 50,
  maxWidth: 420,
  maxHeight: "calc(100vh - 32px)",
  overflow: "auto",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid rgba(232,217,198,0.18)",
  background: "rgba(11,11,11,0.82)",
  color: "#e8d9c6",
  font: "12px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  backdropFilter: "blur(6px)",
  pointerEvents: "auto",
};

export function CupGlbLab() {
  const [report, setReport] = useState<GlbReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleReport = useCallback((next: GlbReport) => setReport(next), []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.9, 0.85, 2.6], fov: 32, near: 0.05, far: 30 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
        }}
        onError={() => setError("WebGL context failed to initialise.")}>
        <color attach="background" args={[PALETTE.noir]} />

        {/* Mirrors the production lighting so the asset is judged under the
            same HDRI and key/rim/fill shapes as the real scene. */}
        <ambientLight intensity={0.16} color={PALETTE.cream} />
        <directionalLight
          castShadow
          position={[-3.6, 6.4, 5.2]}
          intensity={2.4}
          color={PALETTE.keyLight}
        />
        <pointLight
          position={[4.4, 2.8, -3.4]}
          intensity={34}
          distance={20}
          color={PALETTE.rim}
        />
        <pointLight
          position={[4.2, 0.2, 4.2]}
          intensity={8}
          distance={15}
          color={PALETTE.cool}
        />
        <pointLight
          position={[-2.6, 0.6, 4.2]}
          intensity={7}
          distance={14}
          color={PALETTE.accentSoft}
        />

        <Suspense fallback={null}>
          <Environment
            files={assetPath("/hdri/studio_small_03_1k.hdr")}
            background={false}
            environmentIntensity={0.7}
          />
          <GlbErrorBoundary onError={setError}>
            <CupModel onReport={handleReport} />
          </GlbErrorBoundary>
        </Suspense>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.6}
          scale={4}
          blur={2.6}
          far={2}
          resolution={512}
          color="#000000"
        />

        <OrbitControls
          target={[0, 0.224, 0]}
          enablePan={false}
          minDistance={0.8}
          maxDistance={8}
          makeDefault
        />
      </Canvas>

      <div style={overlayStyle}>
        <strong style={{ color: "#d5a273" }}>Cup Glb Lab — /dev/cup-glb</strong>
        <div style={{ marginTop: 6, opacity: 0.8 }}>
          Drag to orbit · scroll to zoom. Production scene untouched.
        </div>

        {error ? (
          <p style={{ marginTop: 10, color: "#ff9f8a" }}>Error: {error}</p>
        ) : report ? (
          <>
            <p style={{ marginTop: 10 }}>
              bbox size (W×H×D): <b>{report.size.join(" × ")}</b>
              <br />
              center: {report.center.join(", ")}
              <br />
              min: {report.min.join(", ")} · max: {report.max.join(", ")}
            </p>
            <p style={{ marginTop: 8, color: "#d5a273" }}>Meshes</p>
            {report.meshes.map((m) => (
              <div key={m.name}>
                {m.name} — {m.vertices} verts — {m.material}
              </div>
            ))}
            <p style={{ marginTop: 8, color: "#d5a273" }}>
              Materials (as exported)
            </p>
            {report.materials.map((m, index) => (
              <div key={`${m.name}-${index}`} style={{ marginBottom: 4 }}>
                <b>{m.name}</b> [{m.type}]
                <br />
                color {m.color} · metal {m.metalness} · rough {m.roughness}
                <br />
                transmission {m.transmission} · ior {String(m.ior)} · side{" "}
                {m.side}
                <br />
                transparent {String(m.transparent)} · opacity {m.opacity} ·
                depthWrite {String(m.depthWrite)}
              </div>
            ))}
          </>
        ) : (
          <p style={{ marginTop: 10 }}>Loading {CUP_GLB_URL}…</p>
        )}
      </div>
    </div>
  );
}

export default CupGlbLab;
