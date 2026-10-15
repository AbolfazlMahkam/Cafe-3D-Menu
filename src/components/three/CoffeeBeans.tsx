"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { assetPath } from "@/lib/basePath";
import { computeTimeline, damp } from "./timeline";
import { getDeviceTier, prefersReducedMotion, rng } from "./env";
import { beanMaterial, useNoirTextures } from "./materials";
import { sceneLayout } from "./layout";
import { useInspectable } from "./inspect";
import { grinderRig, hopperWorld } from "./craftRig";

export const BEANS_GLB_URL = assetPath("/models/Coffee_Beans_NOIR.glb");

/**
 * Longest dimension a single imported kernel is normalised to, matching the
 * procedural bean it replaces so the field keeps its original density.
 */
const BEAN_LENGTH = 0.2;

interface Bean {
  position: THREE.Vector3;
  baseQuat: THREE.Quaternion;
  scale: number;
  phase: number;
  floatAmp: number;
  spin: number;
  axis: THREE.Vector3;
}

export function CoffeeBeans() {
  const tex = useNoirTextures();
  const { scene } = useGLTF(BEANS_GLB_URL);
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([]);
  const material = useMemo(() => {
    const m = beanMaterial(tex);
    m.side = THREE.DoubleSide;
    return m;
  }, [tex]);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const tier = useMemo(() => getDeviceTier(), []);
  const inspectOffset = useInspectable("beans", group);
  const { beanCount } = tier;
  const progress = useRef(0);
  const converge = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const spinQuat = useMemo(() => new THREE.Quaternion(), []);
  const hopperWorldPos = useMemo(() => new THREE.Vector3(), []);
  const hopperLocal = useMemo(() => new THREE.Vector3(), []);

  // The GLB holds four distinct bean meshes. Pull each geometry out, scale it
  // to a common length and centre it so it can stand in for the old kernel.
  const geometries = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry) return;
      const geo = mesh.geometry.clone();
      geo.computeBoundingBox();
      const size = geo.boundingBox!.getSize(new THREE.Vector3());
      const longest = Math.max(size.x, size.y, size.z);
      const s = longest > 0 ? BEAN_LENGTH / longest : 1;
      geo.scale(s, s, s);
      geo.center();
      out.push(geo);
    });
    return out;
  }, [scene]);

  const beans = useMemo<Bean[]>(() => {
    const rand = rng(20260518);
    const out: Bean[] = [];
    const portrait = sceneLayout.portrait;
    // Desktop: wide disc (horizontal spread). Mobile: compact vertical stack.
    for (let i = 0; i < beanCount; i += 1) {
      let x: number, y: number, z: number;
      if (portrait > 0.5) {
        // Vertical cylinder: x tight, y spread more, z shallow
        const ring = rand();
        const angle = ring * Math.PI * 2;
        const r = 0.5 + rand() * 1.0;
        const h = (rand() - 0.5) * 2.2;
        x = Math.cos(angle) * r * 0.45;
        y = h;
        z = Math.sin(angle) * r * 0.35;
      } else {
        const radius = 0.95 + rand() * 2.3;
        const theta = rand() * Math.PI * 2;
        const phi = Math.acos(2 * rand() - 1) * 0.62;
        x = Math.sin(phi) * Math.cos(theta) * radius + 0.35;
        y = Math.cos(phi) * radius * 0.8;
        z = Math.sin(phi) * Math.sin(theta) * radius;
      }
      const position = new THREE.Vector3(x, y, z);
      const baseQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
      );
      out.push({
        position,
        baseQuat,
        scale: 0.85 + rand() * 0.65,
        phase: rand() * Math.PI * 2,
        floatAmp: 0.02 + rand() * 0.05,
        spin: (rand() - 0.5) * 0.12,
        axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      });
    }
    return out;
  }, [beanCount]);

  // Round-robin the field across the four imported models.
  const assignments = useMemo(() => {
    const lists: Bean[][] = geometries.map(() => []);
    if (geometries.length === 0) return lists;
    beans.forEach((bean, i) => lists[i % geometries.length].push(bean));
    return lists;
  }, [beans, geometries]);

  // Subtle per-bean roast variation, written once per model. These multiply the
  // bean material's natural brown base, so the field always reads as coffee.
  useEffect(() => {
    const rand = rng(776311);
    const color = new THREE.Color();
    assignments.forEach((list, k) => {
      const m = meshes.current[k];
      if (!m) return;
      list.forEach((_, j) => {
        color.setScalar(0.8 + rand() * 0.36);
        m.setColorAt(j, color);
      });
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, [assignments]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;
    const off = inspectOffset(dt);
    const { beanField, converge: convergeTarget } = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );

    progress.current = damp(progress.current, beanField, 5, dt);
    converge.current = damp(converge.current, convergeTarget, 6, dt);
    const p = progress.current;
    const cv = converge.current;
    const motion = reduced ? 0 : 1;

    const portrait = sceneLayout.portrait;
    const parallax = 1 - portrait * 0.55;
    // The field is authored for a wide stage (~3 units across). A phone only
    // shows about one unit of width, so shrink it hard and lift it back to the
    // middle of the frame instead of letting it spill off every edge.
    const fit = 1 - 0.25 * portrait;
    g.visible = p > 0.02;
    g.scale.setScalar((0.55 + p * 0.45) * fit);
    g.position.set(
      0.15 - 0.15 * portrait,
      -0.9 + p * 0.05 + portrait * 1.15,
      -0.4 * (1 - p),
    );
    g.rotation.y =
      t * 0.04 * motion +
      scrollSmoothed.story * 1.1 +
      scrollSmoothed.pointerX * 0.25 * parallax +
      off.y;
    g.rotation.x =
      Math.sin(t * 0.2) * 0.05 * motion +
      scrollSmoothed.pointerY * -0.1 * parallax +
      off.x;
    g.rotation.z = Math.sin(t * 0.14) * 0.03 * motion;
    material.opacity = p;

    // During the grind the field funnels into the hopper mouth. Convert the
    // hopper's world position into the (already-updated) bean-group space so a
    // single lerp in local coordinates reads as a physical pour.
    let hasHopper = false;
    if (cv > 0.001) {
      g.updateMatrixWorld();
      hopperWorld(grinderRig(), hopperWorldPos);
      hopperLocal.copy(g.worldToLocal(hopperWorldPos));
      hasHopper = true;
    }

    // Per-instance drift: each bean floats and turns on its own phase so the
    // field never moves in lockstep. As `cv` rises every bean arcs into the
    // hopper and shrinks away, as if sucked through the burrs.
    for (let k = 0; k < assignments.length; k += 1) {
      const m = meshes.current[k];
      if (!m) continue;
      const list = assignments[k];
      for (let j = 0; j < list.length; j += 1) {
        const b = list[j];
        const stagger = THREE.MathUtils.clamp((cv - b.phase * 0.35) / 0.65, 0, 1);
        const fy = Math.sin(t * 0.8 + b.phase) * b.floatAmp * motion * p;
        const fx = Math.cos(t * 0.6 + b.phase * 1.3) * b.floatAmp * 0.5 * motion * p;
        if (hasHopper && stagger > 0.001) {
          const bx = b.position.x + fx;
          const by = b.position.y + fy;
          const bz = b.position.z;
          dummy.position.set(
            bx + (hopperLocal.x - bx) * stagger,
            by + (hopperLocal.y - by) * stagger,
            bz + (hopperLocal.z - bz) * stagger,
          );
          spinQuat.setFromAxisAngle(b.axis, (t * (b.spin + stagger * 3) + b.phase) * motion);
          dummy.quaternion.copy(b.baseQuat).multiply(spinQuat);
          dummy.scale.setScalar(b.scale * (1 - stagger * 0.92));
        } else {
          dummy.position.set(b.position.x + fx, b.position.y + fy, b.position.z);
          spinQuat.setFromAxisAngle(b.axis, (t * b.spin + b.phase) * motion);
          dummy.quaternion.copy(b.baseQuat).multiply(spinQuat);
          dummy.scale.setScalar(b.scale);
        }
        dummy.updateMatrix();
        m.setMatrixAt(j, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={[0.15, -0.9, 0]}>
      {geometries.map((geometry, k) => (
        <instancedMesh
          key={k}
          ref={(el) => {
            meshes.current[k] = el;
          }}
          args={[geometry, material, assignments[k].length]}
          frustumCulled={false}
          castShadow
        />
      ))}
    </group>
  );
}

useGLTF.preload(BEANS_GLB_URL);
