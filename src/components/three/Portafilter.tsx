"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { computeTimeline, damp } from "./timeline";
import {
  machineShellMaterial,
  machineSteelMaterial,
  groundsMaterial,
  useNoirTextures,
} from "./materials";
import { portafilterPose, type PortafilterPose } from "./craftRig";
import { useInspectable } from "./inspect";

const _pose: PortafilterPose = {
  position: new THREE.Vector3(),
  rotationY: 0,
  scale: 1,
};

/**
 * The portafilter: a steel basket on a dark handle. Grounds rise inside the
 * basket during the prep beat, a tamper presses them down, then the whole unit
 * travels to the machine's group head and locks with a quarter turn.
 */
export function Portafilter() {
  const tex = useNoirTextures();
  const group = useRef<THREE.Group>(null);
  const grounds = useRef<THREE.Mesh>(null);
  const tamper = useRef<THREE.Group>(null);
  const reveal = useRef(0);
  const tampSmooth = useRef(0);
  const inspectOffset = useInspectable("portafilter", group);

  const materials = useMemo(() => {
    const shell = machineShellMaterial("#1b1c1f");
    const steel = machineSteelMaterial("#c9ced4");
    const grounds = groundsMaterial(tex);
    return { shell, steel, grounds, all: [shell, steel, grounds] };
  }, [tex]);

  useEffect(() => {
    for (const m of materials.all) m.opacity = 0;
  }, [materials]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const off = inspectOffset(dt);
    const tl = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );

    reveal.current = damp(reveal.current, tl.portafilter, 6, dt);
    const op = reveal.current;

    portafilterPose(tl.locked, tl.seat, scrollSmoothed.pointerX, _pose);
    g.visible = op > 0.004;
    g.position.copy(_pose.position);
    g.scale.setScalar(_pose.scale * (0.94 + 0.06 * op));
    g.rotation.y = _pose.rotationY + off.y;
    g.rotation.x = off.x;

    materials.shell.opacity = op;
    materials.steel.opacity = op;
    materials.grounds.opacity = op;

    // Grounds rise as the basket fills, then settle slightly under the tamper.
    if (grounds.current) {
      const level = tl.grounds * (1 - tl.tamp * 0.22);
      grounds.current.visible = level > 0.01;
      grounds.current.scale.y = Math.max(level, 0.001);
      // Grow from the basket floor rather than the puck's centre.
      grounds.current.position.y = 0.012 + (level * 0.1) / 2;
    }

    // Tamper descends onto the basket during the tamp beat.
    tampSmooth.current = damp(tampSmooth.current, tl.tamp, 10, dt);
    if (tamper.current) {
      const p = tampSmooth.current;
      tamper.current.visible = p > 0.01;
      tamper.current.position.y = 0.34 - p * 0.18;
    }
  });

  return (
    <group ref={group}>
      {/* Basket (open cup, opening up) */}
      <mesh position={[0, 0.07, 0]} castShadow receiveShadow material={materials.steel}>
        <cylinderGeometry args={[0.11, 0.095, 0.14, 24, 1, true]} />
      </mesh>
      {/* Basket base */}
      <mesh position={[0, 0.006, 0]} material={materials.steel}>
        <cylinderGeometry args={[0.095, 0.095, 0.012, 24]} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.steel}>
        <torusGeometry args={[0.108, 0.012, 10, 28]} />
      </mesh>
      {/* Grounds puck inside the basket */}
      <mesh ref={grounds} position={[0, 0.012, 0]} material={materials.grounds}>
        <cylinderGeometry args={[0.092, 0.092, 0.1, 24]} />
      </mesh>
      {/* Spout */}
      <mesh position={[0, -0.02, 0]} material={materials.steel}>
        <coneGeometry args={[0.03, 0.05, 16]} />
      </mesh>

      {/* Handle assembly (dark) */}
      <mesh position={[0.16, 0.08, 0]} material={materials.shell}>
        <cylinderGeometry args={[0.028, 0.028, 0.06, 16]} />
      </mesh>
      <mesh
        position={[0.31, 0.08, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        material={materials.shell}
      >
        <cylinderGeometry args={[0.026, 0.022, 0.22, 16]} />
      </mesh>

      {/* Tamper */}
      <group ref={tamper} position={[0, 0.34, 0]}>
        <mesh castShadow material={materials.steel}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 24]} />
        </mesh>
        <mesh position={[0, 0.07, 0]} material={materials.shell}>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 16]} />
        </mesh>
      </group>
    </group>
  );
}

export default Portafilter;
