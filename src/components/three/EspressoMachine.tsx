"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { assetPath } from "@/lib/basePath";
import { computeTimeline, damp } from "./timeline";
import { prefersReducedMotion } from "./env";
import { machineRig } from "./machineRig";
import { useInspectable } from "./inspect";
import {
  machineBrassMaterial,
  machineShellMaterial,
  machineSteelMaterial,
} from "./materials";
import { splitComponents } from "./machineParts";

export const MACHINE_GLB_URL = assetPath("/models/Coffee_Machine_NOIR.glb");

/**
 * Target world height for the imported machine. The GLB ships in arbitrary
 * Blender units, so we normalise it to the same stage scale the procedural
 * machine used and rebuild the rig anchors against that footprint.
 */
const TARGET_HEIGHT = 1.4;

type PartKind = "shell" | "dark" | "steel" | "brass";

export function EspressoMachine() {
  const { scene } = useGLTF(MACHINE_GLB_URL);
  const group = useRef<THREE.Group>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const reveal = useRef(0);
  const inspectOffset = useInspectable("machine", group);

  // Clone, split into physical components, classify each one and normalise the
  // whole rig so the base rests on Y = 0, centred on X/Z at TARGET_HEIGHT.
  const { model, materials } = useMemo(() => {
    const palette: Record<PartKind, THREE.MeshPhysicalMaterial> = {
      shell: machineShellMaterial("#2b2e33"),
      dark: machineShellMaterial("#161719"),
      steel: machineSteelMaterial("#c6cbd1"),
      brass: machineBrassMaterial("#b08f57"),
    };

    const root = scene.clone(true);
    root.updateMatrixWorld(true);

    // The scan is one mesh; pull out its disconnected shells so each physical
    // component can take a realistic material.
    let source: THREE.Mesh | undefined;
    root.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!source && mesh.isMesh) source = mesh;
    });

    const meshes: THREE.Mesh[] = [];
    if (source) {
      const src = source as THREE.Mesh;
      const original = new THREE.Group();
      original.position.copy(src.position);
      original.quaternion.copy(src.quaternion);
      original.scale.copy(src.scale);

      for (const geo of splitComponents(src.geometry)) {
        const part = new THREE.Mesh(geo);
        part.castShadow = true;
        part.receiveShadow = true;
        meshes.push(part);
        original.add(part);
      }

      src.parent?.add(original);
      src.parent?.remove(src);
    }

    const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    root.scale.setScalar(scale);
    root.updateMatrixWorld(true);

    const scaled = new THREE.Box3().setFromObject(root);
    const center = scaled.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.y -= scaled.min.y;
    root.position.z -= center.z;
    root.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(root);
    const total = bounds.getSize(new THREE.Vector3());
    const mid = bounds.getCenter(new THREE.Vector3());

    // Largest shell is the body; the rest are classified by where they sit.
    let body: THREE.Mesh | undefined;
    let most = -1;
    for (const mesh of meshes) {
      const verts = (mesh.geometry.getAttribute("position") as THREE.BufferAttribute).count;
      if (verts > most) {
        most = verts;
        body = mesh;
      }
    }

    const partBox = new THREE.Box3();
    const partCenter = new THREE.Vector3();
    const partSize = new THREE.Vector3();
    for (const mesh of meshes) {
      if (mesh === body) {
        mesh.material = palette.shell;
        continue;
      }
      partBox.setFromObject(mesh);
      partBox.getCenter(partCenter);
      partBox.getSize(partSize);

      const fracY = (partCenter.y - bounds.min.y) / total.y;
      const fracX = (partCenter.x - mid.x) / total.x;
      const widthFrac = partSize.x / total.x;
      const heightFrac = partSize.y / total.y;

      let kind: PartKind = "dark";
      if (widthFrac > 0.7 && heightFrac < 0.12) {
        kind = "steel"; // flat trays / plates
      } else if (fracY > 0.9) {
        kind = "steel"; // cup warmer plate
      } else if (Math.abs(fracX) < 0.18 && fracY > 0.42 && fracY < 0.68) {
        kind = "brass"; // group head
      } else if (Math.abs(fracX) < 0.18 && fracY > 0.7) {
        kind = "steel"; // top nozzle
      } else if (fracX > 0.25) {
        kind = "steel"; // steam wand, portafilter, knobs
      }
      mesh.material = palette[kind];
    }

    const pivot = new THREE.Group();
    pivot.add(root);
    return { model: pivot, materials: Object.values(palette) };
  }, [scene]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const off = inspectOffset(dt);
    const { machine, seat } = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );

    reveal.current = damp(reveal.current, machine, 6, dt);
    const op = reveal.current;
    const motion = reduced ? 0 : 1;

    // Placement comes from the shared rig (seat is stable), so the cup docked
    // by CoffeeCup tracks the machine exactly. Only opacity follows `machine`.
    const rig = machineRig(seat, scrollSmoothed.pointerX);
    g.visible = op > 0.004;
    g.position.copy(rig.position);
    // A whisper of scale-in as it materialises keeps the reveal from reading as
    // a plain opacity fade. At op = 1 the factor is 1, so docking stays exact.
    g.scale.setScalar(rig.scale * (0.955 + 0.045 * op));
    g.rotation.y = rig.rotationY + off.y;
    g.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.008 * motion + off.x;

    for (const material of materials) material.opacity = op;
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MACHINE_GLB_URL);
