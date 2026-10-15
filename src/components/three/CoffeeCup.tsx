"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollSmoothed } from "@/lib/scroll";
import { getSignature } from "@/lib/signature";
import { assetPath } from "@/lib/basePath";
import { useExperienceStore } from "@/store/experience";
import { computeTimeline, damp } from "./timeline";
import { prefersReducedMotion } from "./env";
import { sceneLayout } from "./layout";
import { useInspectable, inspect } from "./inspect";
import {
  glassMaterial,
  liquidMaterial,
  porcelainMaterial,
  foamMaterial,
  useNoirTextures,
} from "./materials";
import {
  machineRig,
  outletWorld,
  dripTopWorldY,
  CRAFT_CUP_SCALE,
} from "./machineRig";

const _outlet = new THREE.Vector3();

/**
 * Cup scale at the detached hero pose (dollied toward the camera). Kept
 * deliberately restrained so the hero shot reads as a premium still-life with
 * generous negative space rather than a dramatic zoom.
 */
const HERO_CUP_SCALE = 1.2;

const DRINK_LOOK: Record<string, { liquid: string; crema: string; cremaAmount: number }> = {
  espresso: { liquid: "#2a1408", crema: "#b07a3f", cremaAmount: 0.85 },
  cappuccino: { liquid: "#a9764a", crema: "#e9d6b8", cremaAmount: 1 },
  latte: { liquid: "#c39c6d", crema: "#f0e2ca", cremaAmount: 0.9 },
  mocha: { liquid: "#5e3620", crema: "#d8bd97", cremaAmount: 0.7 },
  americano: { liquid: "#241409", crema: "#a9713c", cremaAmount: 0.5 },
  coldbrew: { liquid: "#180d06", crema: "#3a2416", cremaAmount: 0.15 },
  icedlatte: { liquid: "#cdb083", crema: "#ecdcc0", cremaAmount: 0.2 },
};

export function CoffeeCup() {
  const tex = useNoirTextures();
  const { scene: cupScene } = useGLTF(assetPath("/models/Cup_NOIR.glb"));

  // World-space plane that clips the coffee body to the current fill level.
  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), -10),
    [],
  );

  const { model, coffee, coffeeMesh, vesselMaterials, coffeeTopY, coffeeRadius } =
    useMemo(() => {
      const model = cupScene.clone(true);
      model.updateMatrixWorld(true);

      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());

      const targetHeight = 0.5;
      const scale = size.y > 0 ? targetHeight / size.y : 1;
      model.scale.setScalar(scale);

      model.updateMatrixWorld(true);
      const scaledBounds = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());

      model.position.x -= scaledCenter.x;
      model.position.y -= scaledBounds.min.y;
      model.position.z -= scaledCenter.z;
      model.updateMatrixWorld(true);

      const found: {
        coffee: THREE.MeshPhysicalMaterial | null;
        coffeeMesh: THREE.Mesh | null;
      } = { coffee: null, coffeeMesh: null };
      const materials: THREE.MeshPhysicalMaterial[] = [];

      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;

        const source = object.material as THREE.MeshPhysicalMaterial | undefined;
        const isCoffee = !!source && (source.transmission ?? 0) > 0.5;
        const isSaucer = /\.002$/.test(object.name);

        if (isCoffee) {
          const mat = liquidMaterial(DRINK_LOOK.espresso.liquid);
          // The outer shell is transmissive, and three.js builds the buffer it
          // samples through the glass from *opaque* geometry only. Keep the
          // coffee opaque so it stays in the transmission pass; the rising level
          // is faked by clipping the material against a world-space plane.
          mat.transparent = false;
          mat.opacity = 1;
          mat.clippingPlanes = [clipPlane];
          object.material = mat;
          found.coffee = mat;
          found.coffeeMesh = object;
        } else if (isSaucer) {
          const mat = porcelainMaterial(tex, "#e7ddcc");
          object.material = mat;
          materials.push(mat);
        } else {
          const mat = glassMaterial("#eaf2f4", 1);
          object.material = mat;
          materials.push(mat);
        }
      });

      // Interior extent of the coffee body (in the cup's local space) so the
      // crema disc can be sized and floated to the surface.
      let coffeeTopY = 0.46;
      let coffeeRadius = 0.11;
      if (found.coffeeMesh) {
        const cb = new THREE.Box3().setFromObject(found.coffeeMesh);
        coffeeTopY = cb.max.y;
        coffeeRadius = Math.max(cb.getSize(new THREE.Vector3()).x, 0.02) * 0.46;
      }

      return {
        model,
        coffee: found.coffee,
        coffeeMesh: found.coffeeMesh,
        vesselMaterials: materials,
        coffeeTopY,
        coffeeRadius,
      };
    }, [cupScene, tex, clipPlane]);

  const cremaMaterial = useMemo(() => {
    const m = foamMaterial("#c08a4a");
    m.transparent = true;
    m.opacity = 0;
    return m;
  }, []);

  const group = useRef<THREE.Group>(null);
  const crema = useRef<THREE.Mesh>(null);
  const presence = useRef(0);
  const fillSmooth = useRef(0);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const inspectOffset = useInspectable("cup", group);

  const blended = useMemo(() => ({ x: 0.95, y: -0.05, z: 0.35, s: 1 }), []);
  const SIG_POSE = useMemo(() => new THREE.Vector3(0.62, -0.02, 0.5), []);
  const HERO_POSE = useMemo(() => new THREE.Vector3(0.1, -0.02, 1.45), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const cremaTint = useMemo(() => new THREE.Color(), []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(rawDelta, 1 / 30);
    const off = inspectOffset(dt);
    const tl = computeTimeline(
      scrollSmoothed.story,
      scrollSmoothed.signature,
      scrollSmoothed.menuReveal,
    );
    const { dock, heroPose, sigPose, vessel, seat } = tl;

    presence.current = damp(presence.current, vessel, 6, dt);
    const presenceValue = presence.current;
    for (const material of vesselMaterials) material.opacity = presenceValue;

    // On a narrow portrait stage the hero / signature cup is pulled in from the
    // right-hand lane to sit centred (and clear of the copy column).
    const portrait = sceneLayout.portrait;
    const parallax = 1 - portrait * 0.55;
    HERO_POSE.x = 0.1 - 0.1 * portrait;
    HERO_POSE.y = -0.02 + portrait * 0.04;
    HERO_POSE.z = 1.45 - portrait * 0.1;
    SIG_POSE.x = 0.62 - 0.56 * portrait;

    // While the machine is being inspected, the docked cup rides along with it.
    const machineOffset = inspect.entries.get("machine")?.current;
    const machineYaw = machineOffset?.y ?? 0;
    const machinePitch = machineOffset?.x ?? 0;

    const rig = machineRig(seat, scrollSmoothed.pointerX);
    rig.rotationY += machineYaw;
    outletWorld(rig, _outlet, machinePitch);
    const dockX = _outlet.x;
    const dockY = dripTopWorldY(rig, machinePitch) + 0.02 * CRAFT_CUP_SCALE;
    const dockZ = _outlet.z;

    const sum = dock + heroPose + sigPose;
    const dockShare = sum > 0.001 ? dock / sum : 0;
    if (sum > 0.001) {
      blended.x = (dock * dockX + heroPose * HERO_POSE.x + sigPose * SIG_POSE.x) / sum;
      blended.y = (dock * dockY + heroPose * HERO_POSE.y + sigPose * SIG_POSE.y) / sum;
      blended.z = (dock * dockZ + heroPose * HERO_POSE.z + sigPose * SIG_POSE.z) / sum;
      blended.s =
        (dock * CRAFT_CUP_SCALE + heroPose * HERO_CUP_SCALE + sigPose * 1.04) / sum;
    }

    const motion = reduced ? 0 : 1;
    const free = heroPose + sigPose;
    const float = Math.sin(t * 0.9) * 0.02 * motion * heroPose;
    const spin = reduced ? 0 : t * 0.03 * free;
    const tilt = (heroPose * -0.08 + sigPose * -0.06) / (sum > 0.001 ? sum : 1);

    g.position.set(
      blended.x + scrollSmoothed.pointerX * 0.08 * free * parallax,
      blended.y + float + scrollSmoothed.pointerY * -0.04 * free * parallax,
      blended.z,
    );
    g.scale.setScalar(blended.s);
    g.rotation.y =
      spin +
      scrollSmoothed.pointerX * 0.1 * free * parallax +
      off.y +
      machineYaw * dockShare;
    g.rotation.x =
      tilt +
      Math.sin(t * 0.7) * 0.006 * motion +
      scrollSmoothed.pointerY * 0.025 * free * parallax +
      off.x +
      machinePitch * dockShare;

    g.visible = presenceValue > 0.004;

    // The shot only appears as extraction begins; before that the cup is empty.
    const extracting = tl.fill > 0.001 || tl.extract > 0.001;
    if (coffeeMesh) coffeeMesh.visible = extracting && presenceValue > 0.2;

    // Rise the clip plane so the coffee body fills from the bottom.
    fillSmooth.current = damp(fillSmooth.current, tl.fill, 8, dt);
    const surfaceY =
      g.position.y + 0.02 * blended.s + fillSmooth.current * (coffeeTopY - 0.02) * blended.s;
    clipPlane.constant = surfaceY;

    const active = getSignature(useExperienceStore.getState().signature);
    const look = DRINK_LOOK[active.product.art];

    if (look && coffee) {
      tint.set(look.liquid);
      coffee.color.lerp(tint, 1 - Math.exp(-4 * dt));
    }

    // Crema disc rides the liquid surface inside the cup (local space).
    if (crema.current) {
      const amount = look ? look.cremaAmount : 0.4;
      const op = presenceValue * tl.crema * amount;
      cremaMaterial.opacity = op;
      crema.current.visible = op > 0.01;
      // Float a hair above the clip cut so the disc never z-fights the liquid.
      crema.current.position.y =
        0.0215 + fillSmooth.current * (coffeeTopY - 0.02);
      if (look) {
        cremaTint.set(look.crema);
        cremaMaterial.color.lerp(cremaTint, 1 - Math.exp(-4 * dt));
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={model} />
      <mesh ref={crema} rotation={[-Math.PI / 2, 0, 0]} material={cremaMaterial}>
        <circleGeometry args={[coffeeRadius, 32]} />
      </mesh>
    </group>
  );
}
