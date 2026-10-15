"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { computeTimeline } from "./timeline";
import { streamMaterial } from "./materials";
import {
  CRAFT_CUP_SCALE,
  dripTopWorldY,
  machineRig,
  spoutWorld,
} from "./machineRig";

const _spout = new THREE.Vector3();
const _target = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();

/** Orient a unit cylinder (height 1, centred) to span `a`→`b`. */
function span(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  _dir.subVectors(b, a);
  const len = _dir.length() || 0.0001;
  _mid.addVectors(a, b).multiplyScalar(0.5);
  mesh.position.copy(_mid);
  _quat.setFromUnitVectors(_up, _dir.normalize());
  mesh.quaternion.copy(_quat);
  mesh.scale.set(radius, len, radius);
}

/**
 * Twin espresso streams falling from the group head's spouts into the cup
 * while the extraction beat is active. The streams fade in/out with the beat
 * and thin out near the end as the shot finishes.
 */
export function Extraction() {
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const material = useMemo(() => streamMaterial("#2a1408"), []);

  useFrame((state) => {
    const tl = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );
    const meshL = left.current;
    const meshR = right.current;
    if (!meshL || !meshR) return;

    const active = tl.extract;
    material.opacity = active;
    meshL.visible = active > 0.01;
    meshR.visible = active > 0.01;
    if (!meshL.visible) return;

    const rig = machineRig(tl.seat, scrollSmoothed.pointerX);

    // Target: the cup's liquid surface while docked on the drip tray.
    const cupY = dripTopWorldY(rig) + 0.02 * CRAFT_CUP_SCALE + 0.11;
    spoutWorld(rig, -1, _spout);
    _target.set(_spout.x, cupY, _spout.z);
    // A live stream pulses very slightly as the pressure settles.
    const wobble = Math.sin(state.clock.elapsedTime * 14) * 0.004 * active;
    _target.x += wobble;
    span(meshL, _spout, _target, 0.008 + 0.006 * active);

    spoutWorld(rig, 1, _spout);
    _target.set(_spout.x, cupY, _spout.z);
    _target.x -= wobble;
    span(meshR, _spout, _target, 0.008 + 0.006 * active);
  });

  return (
    <>
      <mesh ref={left} material={material} frustumCulled={false}>
        <cylinderGeometry args={[0.6, 1, 1, 10]} />
      </mesh>
      <mesh ref={right} material={material} frustumCulled={false}>
        <cylinderGeometry args={[0.6, 1, 1, 10]} />
      </mesh>
    </>
  );
}

export default Extraction;
