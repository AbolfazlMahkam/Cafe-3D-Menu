import * as THREE from "three";
import { sceneLayout } from "./layout";
import { machineRig, groupHeadWorld, type MachineRig } from "./machineRig";

/**
 * Single source of truth for the grinding / dosing station (grinder + the
 * portafilter it fills) so the bean field, the grinder and the portafilter all
 * agree on where the coffee actually flows.
 *
 * World space is shared with `machineRig`; the grinder stands on the same
 * ground line as the machine (y ≈ -0.5) and the portafilter travels from its
 * prep cradle to the machine's group head during the lock beat.
 */

// Ground line the scene is authored against.
export const GROUND_Y = -0.5;

// Grinder placement.
const GRINDER_X = 0.15;
const GRINDER_Z = -0.15;
const GRINDER_SCALE = 0.92;

// Portafilter resting position during the prep beat (just in front of the
// chute so the fresh grounds fall straight into the basket).
const PREP_X = 0.15;
const PREP_Z = 0.42;
const PREP_Y = GROUND_Y + 0.28;
const PREP_SCALE = 0.9;

const _euler = new THREE.Euler();
const _groupHead = new THREE.Vector3();
const _prep = new THREE.Vector3();
const _pfRig: MachineRig = { position: new THREE.Vector3(), rotationY: 0, scale: 1 };

export interface GrinderRig {
  position: THREE.Vector3;
  scale: number;
  rotationY: number;
}

const _grinderRig: GrinderRig = { position: new THREE.Vector3(), scale: 1, rotationY: 0 };

/**
 * World placement of the grinder group (centre X on a narrow portrait stage).
 * Writes into `out` (or a shared scratch) to stay allocation-free.
 */
export function grinderRig(out: GrinderRig = _grinderRig): GrinderRig {
  const portrait = sceneLayout.portrait;
  out.position.set(
    GRINDER_X - GRINDER_X * portrait,
    GROUND_Y,
    GRINDER_Z + portrait * 0.1,
  );
  out.scale = GRINDER_SCALE * (1 + 0.06 * portrait);
  out.rotationY = -0.18 + portrait * 0.18;
  return out;
}

/** Grinder-local anchor: the open mouth of the hopper (bean field converges here). */
export const HOPPER_OPEN_LOCAL = new THREE.Vector3(0, 1.12, 0);
/** Grinder-local anchor: where the grounds leave the chute. */
export const CHUTE_LOCAL = new THREE.Vector3(0, 0.46, 0.3);
/** Portafilter-local anchor: the open top of the basket (grounds fall in here). */
export const BASKET_OPEN_LOCAL = new THREE.Vector3(0, 0.15, 0);

/** Grinder-local point → world, matching the group's T·R·S transform. */
export function grinderToWorld(
  local: THREE.Vector3,
  rig: GrinderRig,
  out: THREE.Vector3,
): THREE.Vector3 {
  return out
    .copy(local)
    .multiplyScalar(rig.scale)
    .applyEuler(_euler.set(0, rig.rotationY, 0, "XYZ"))
    .add(rig.position);
}

export function hopperWorld(rig: GrinderRig, out: THREE.Vector3): THREE.Vector3 {
  return grinderToWorld(HOPPER_OPEN_LOCAL, rig, out);
}

export function chuteWorld(rig: GrinderRig, out: THREE.Vector3): THREE.Vector3 {
  return grinderToWorld(CHUTE_LOCAL, rig, out);
}

/**
 * Portafilter world transform. `lock` (0→1) blends the portafilter from its
 * prep cradle to the machine's group head and swings it a quarter turn to lock.
 * `seat` must match the machine's seat weight so the anchor tracks the machine
 * as it rises.
 */
export interface PortafilterPose {
  position: THREE.Vector3;
  rotationY: number;
  scale: number;
}

export function portafilterPose(
  locked: number,
  seat: number,
  pointerX: number,
  out: PortafilterPose,
): PortafilterPose {
  const portrait = sceneLayout.portrait;
  // A fresh rig object (not the shared scratch) so the group-head anchor can't
  // be clobbered by another caller before it is read here.
  const rig: MachineRig = machineRig(seat, pointerX, _pfRig);
  groupHeadWorld(rig, _groupHead);

  _prep.set(PREP_X - PREP_X * portrait, PREP_Y, PREP_Z - portrait * 0.08);

  out.position.copy(_prep).lerp(_groupHead, locked);
  const prepYaw = -0.25 + portrait * 0.25;
  const lockYaw = rig.rotationY + Math.PI * 0.5;
  out.rotationY = prepYaw + (lockYaw - prepYaw) * locked;
  out.scale = PREP_SCALE + (1 - PREP_SCALE) * locked;
  return out;
}

/** World position of the basket opening for the current portafilter pose. */
export function basketOpenWorld(
  pose: PortafilterPose,
  out: THREE.Vector3,
): THREE.Vector3 {
  return out
    .copy(BASKET_OPEN_LOCAL)
    .multiplyScalar(pose.scale)
    .applyEuler(_euler.set(0, pose.rotationY, 0, "XYZ"))
    .add(pose.position);
}
