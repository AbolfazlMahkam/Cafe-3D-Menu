import * as THREE from "three";
import { sceneLayout } from "./layout";

/**
 * Single source of truth for the espresso machine's scroll-driven placement and
 * for the machine-local anchors the cup docks to.
 *
 * The machine and the cup both read from here, so the cup can never drift away
 * from the actual coffee outlet regardless of how the machine moves or scales.
 */

// World placement of the machine group as a function of the craft "seat" weight.
const BASE = new THREE.Vector3(-0.6, -0.5, -0.3);
const SEAT_RISE = 0.68;
const SCALE_BASE = 0.78;
const SCALE_RANGE = 0.12;
const YAW_BASE = 0.34;
const YAW_ENTER = 0.36;

// Machine-local anchors, in the normalised space of the imported machine
// (uniformly scaled to 1.4 units tall, centred on X/Z, base resting on Y=0).
// Measured from the scan: the drip grating tops out just under 0.2, its centre
// sits at x=-0.03 / z=0.23, and the group head hangs above it.
/** Spout tip — where the shot actually falls (above the drip grating). */
export const OUTLET_LOCAL = new THREE.Vector3(-0.03, 0.5, 0.35);
/** Group head — where the portafilter basket locks into the machine. */
export const GROUP_HEAD_LOCAL = new THREE.Vector3(-0.03, 0.58, 0.32);
/** Yaw the portafilter adopts once locked (handle swung to the machine's side). */
export const LOCKED_YAW = Math.PI * 0.5;
/** Twin spouts, just below the outlet, where the two streams originate. */
export const SPOUT_LOCAL_OFFSET_X = 0.028;
/** Top surface of the drip-tray grating (the cup rests on this). */
export const DRIP_TOP_LOCAL_Y = 0.18;
/** Cup scale used while it sits on the drip tray under the outlet. */
export const CRAFT_CUP_SCALE = 0.34;

const _euler = new THREE.Euler();
const _dripLocal = new THREE.Vector3();
const _dripWorld = new THREE.Vector3();
const _spoutLocal = new THREE.Vector3();

export interface MachineRig {
  position: THREE.Vector3;
  rotationY: number;
  scale: number;
}

const _rig: MachineRig = { position: new THREE.Vector3(), rotationY: 0, scale: 1 };

/**
 * Writes the machine's scroll-driven placement into `out` (or a shared scratch
 * when omitted) so the per-frame callers never allocate.
 */
export function machineRig(seat: number, pointerX: number, out: MachineRig = _rig): MachineRig {
  // On a narrow portrait stage the machine's left-hand lane is off-screen, so
  // slide it to the centre and damp the pointer drift accordingly.
  const portrait = sceneLayout.portrait;
  const parallax = 1 - portrait * 0.55;
  // Mirror the static lane for RTL; leave the pointer drift unmirrored so the
  // parallax matches the camera in both directions.
  const x = (BASE.x + 0.6 * portrait) * sceneLayout.mirror;
  out.position.set(x + pointerX * 0.045 * parallax, BASE.y + seat * SEAT_RISE, BASE.z);
  out.rotationY = YAW_BASE + (1 - seat) * YAW_ENTER + pointerX * 0.05 * parallax;
  out.scale = SCALE_BASE + seat * SCALE_RANGE;
  return out;
}

/**
 * Machine-local point → world, matching the group's T·R·S transform. The
 * optional `rotationX` (pitch) mirrors the inspect drag applied to the machine
 * group, so anchors stay attached to the machine while it is being viewed.
 */
export function rigToWorld(
  local: THREE.Vector3,
  rig: MachineRig,
  out: THREE.Vector3,
  rotationX = 0,
): THREE.Vector3 {
  return out
    .copy(local)
    .multiplyScalar(rig.scale)
    .applyEuler(_euler.set(rotationX, rig.rotationY, 0, "XYZ"))
    .add(rig.position);
}

export function outletWorld(
  rig: MachineRig,
  out: THREE.Vector3,
  rotationX = 0,
): THREE.Vector3 {
  return rigToWorld(OUTLET_LOCAL, rig, out, rotationX);
}

/** Where the portafilter basket locks into the group head. */
export function groupHeadWorld(
  rig: MachineRig,
  out: THREE.Vector3,
  rotationX = 0,
): THREE.Vector3 {
  return rigToWorld(GROUP_HEAD_LOCAL, rig, out, rotationX);
}

/**
 * World position of one of the twin spouts. `side` is -1 (left) or +1 (right).
 * The offset is applied in machine-local X before the rig transform.
 */
export function spoutWorld(
  rig: MachineRig,
  side: number,
  out: THREE.Vector3,
  rotationX = 0,
): THREE.Vector3 {
  _spoutLocal.copy(OUTLET_LOCAL);
  _spoutLocal.x += side * SPOUT_LOCAL_OFFSET_X;
  return rigToWorld(_spoutLocal, rig, out, rotationX);
}

/** World Y of the drip-tray surface at the machine's current pose. */
export function dripTopWorldY(rig: MachineRig, rotationX = 0): number {
  _dripLocal.set(0, DRIP_TOP_LOCAL_Y, 0);
  return rigToWorld(_dripLocal, rig, _dripWorld, rotationX).y;
}
