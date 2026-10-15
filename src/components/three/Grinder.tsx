"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { computeTimeline, damp } from "./timeline";
import { getDeviceTier, prefersReducedMotion, rng } from "./env";
import {
  machineBrassMaterial,
  machineShellMaterial,
  machineSteelMaterial,
  groundsMaterial,
  useNoirTextures,
} from "./materials";
import {
  basketOpenWorld,
  chuteWorld,
  grinderRig,
  portafilterPose,
  type PortafilterPose,
} from "./craftRig";
import { useInspectable } from "./inspect";

const _chute = new THREE.Vector3();
const _basket = new THREE.Vector3();
const _pose: PortafilterPose = {
  position: new THREE.Vector3(),
  rotationY: 0,
  scale: 1,
};
const _dummy = new THREE.Object3D();

interface Granule {
  phase: number;
  spread: number;
  size: number;
}

/**
 * The bench grinder. Procedural — a base, body, brass collar, conical hopper
 * and a spinning burr. Fresh grounds stream from the chute into the portafilter
 * basket (instanced granules) and the burr spins while the field grinds.
 */
export function Grinder() {
  const tex = useNoirTextures();
  const group = useRef<THREE.Group>(null);
  const burr = useRef<THREE.Mesh>(null);
  const granules = useRef<THREE.InstancedMesh>(null);
  const reveal = useRef(0);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const tier = useMemo(() => getDeviceTier(), []);
  const inspectOffset = useInspectable("grinder", group);
  const granuleCount = tier.mobile ? 34 : 70;

  const materials = useMemo(() => {
    const shell = machineShellMaterial("#26282c");
    const steel = machineSteelMaterial("#c6cbd1");
    const brass = machineBrassMaterial("#b08f57");
    const grounds = groundsMaterial(tex);
    return { shell, steel, brass, grounds, all: [shell, steel, brass, grounds] };
  }, [tex]);

  const granulesData = useMemo<Granule[]>(() => {
    const rand = rng(90210);
    const out: Granule[] = [];
    for (let i = 0; i < granuleCount; i += 1) {
      out.push({
        phase: rand(),
        spread: 0.5 + rand(),
        size: 0.6 + rand() * 0.8,
      });
    }
    return out;
  }, [granuleCount]);

  useEffect(() => {
    for (const m of materials.all) m.opacity = 0;
  }, [materials]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;
    const off = inspectOffset(dt);
    const tl = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );

    const rig = grinderRig();
    reveal.current = damp(reveal.current, tl.grinder, 6, dt);
    const op = reveal.current;
    const motion = reduced ? 0 : 1;

    g.visible = op > 0.004;
    g.position.copy(rig.position);
    g.rotation.y = rig.rotationY + off.y;
    g.rotation.x = off.x;
    g.scale.setScalar(rig.scale * (0.94 + 0.06 * op));

    // Fade the body with presence; the burr and granules track their beats.
    materials.shell.opacity = op;
    materials.steel.opacity = op;
    materials.brass.opacity = op;

    // Burr spins fastest mid-grind.
    if (burr.current) {
      burr.current.rotation.y += dt * (2 + tl.grind * 26) * (0.3 + motion);
    }

    // Grounds stream from the chute into the basket while `flow` is active.
    const mesh = granules.current;
    if (mesh) {
      const flow = tl.flow;
      mesh.visible = flow > 0.004 && op > 0.004;
      materials.grounds.opacity = op * flow;
      if (mesh.visible) {
        chuteWorld(rig, _chute);
        portafilterPose(0, tl.seat, scrollSmoothed.pointerX, _pose);
        basketOpenWorld(_pose, _basket);
        for (let i = 0; i < granulesData.length; i += 1) {
          const gd = granulesData[i];
          // Each granule wraps along the chute→basket arc on its own phase.
          const u = (t * 0.55 + gd.phase) % 1;
          const x = _chute.x + (_basket.x - _chute.x) * u + Math.sin(u * 9 + gd.phase * 6) * 0.012 * gd.spread;
          const y = _chute.y + (_basket.y - _chute.y) * u - Math.sin(u * Math.PI) * 0.03;
          const z = _chute.z + (_basket.z - _chute.z) * u + Math.cos(u * 7 + gd.phase * 5) * 0.012 * gd.spread;
          _dummy.position.set(x, y, z);
          _dummy.quaternion.identity();
          const s = gd.size * 0.02 * (0.4 + flow);
          _dummy.scale.setScalar(s);
          _dummy.updateMatrix();
          mesh.setMatrixAt(i, _dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Grinder body — transformed by the craft rig each frame. */}
      <group ref={group} position={[0.15, -0.5, -0.15]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow material={materials.shell}>
        <cylinderGeometry args={[0.32, 0.36, 0.1, 28]} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow material={materials.shell}>
        <cylinderGeometry args={[0.22, 0.25, 0.56, 28]} />
      </mesh>
      {/* Brass collar */}
      <mesh position={[0, 0.63, 0]} castShadow material={materials.brass}>
        <cylinderGeometry args={[0.27, 0.27, 0.05, 28]} />
      </mesh>
      {/* Hopper (open cone) */}
      <mesh position={[0, 0.9, 0]} castShadow material={materials.steel}>
        <cylinderGeometry args={[0.42, 0.17, 0.5, 32, 1, true]} />
      </mesh>
      {/* Spinning burr */}
      <mesh position={[0, 0.72, 0]} ref={burr} material={materials.steel}>
        <coneGeometry args={[0.15, 0.26, 24]} />
      </mesh>
      {/* Chute */}
      <mesh position={[0, 0.46, 0.28]} rotation={[0.5, 0, 0]} castShadow material={materials.shell}>
        <cylinderGeometry args={[0.07, 0.09, 0.24, 16]} />
      </mesh>
      {/* Side knob */}
      <mesh position={[0.27, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow material={materials.brass}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
      </mesh>
      </group>

      {/* Fresh grounds, positioned in world space so they fall from the chute
          straight into the basket regardless of the grinder transform. */}
      <instancedMesh
        ref={granules}
        args={[undefined, materials.grounds, granuleCount]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 0]} />
      </instancedMesh>
    </group>
  );
}

export default Grinder;
