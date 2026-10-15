"use client";

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { assetPath } from "@/lib/basePath";

/**
 * All surface detail for the 3D layer comes from locally-stored, CC0 texture
 * maps (ambientCG). They are loaded exactly once via drei's suspense cache and
 * shared between every material instance.
 */
export interface NoirTextures {
  steelColor: THREE.Texture;
  steelNormal: THREE.Texture;
  steelRough: THREE.Texture;
  darkColor: THREE.Texture;
  darkNormal: THREE.Texture;
  darkRough: THREE.Texture;
  porcelainNormal: THREE.Texture;
  porcelainRough: THREE.Texture;
  imperfectionColor: THREE.Texture;
  imperfectionNormal: THREE.Texture;
}

const SRC = {
  steelColor: assetPath("/textures/steel/color.jpg"),
  steelNormal: assetPath("/textures/steel/normal.jpg"),
  steelRough: assetPath("/textures/steel/roughness.jpg"),
  darkColor: assetPath("/textures/darkmetal/color.jpg"),
  darkNormal: assetPath("/textures/darkmetal/normal.jpg"),
  darkRough: assetPath("/textures/darkmetal/roughness.jpg"),
  porcelainNormal: assetPath("/textures/porcelain/normal.jpg"),
  porcelainRough: assetPath("/textures/porcelain/roughness.jpg"),
  imperfectionColor: assetPath("/textures/imperfections/color.jpg"),
  imperfectionNormal: assetPath("/textures/imperfections/normal.jpg"),
} as const;

function configure(t: THREE.Texture, { srgb = false, repeat = 1 }: { srgb?: boolean; repeat?: number }) {
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

export function useNoirTextures(): NoirTextures {
  const maps = useTexture(SRC) as unknown as Record<keyof typeof SRC, THREE.Texture>;
  return useMemo(() => {
    configure(maps.steelColor, { srgb: true, repeat: 1 });
    configure(maps.steelNormal, { repeat: 1 });
    configure(maps.steelRough, { repeat: 1 });
    configure(maps.darkColor, { srgb: true, repeat: 1.5 });
    configure(maps.darkNormal, { repeat: 1.5 });
    configure(maps.darkRough, { repeat: 1.5 });
    configure(maps.porcelainNormal, { repeat: 2 });
    configure(maps.porcelainRough, { repeat: 2 });
    configure(maps.imperfectionColor, { srgb: true, repeat: 1.6 });
    configure(maps.imperfectionNormal, { repeat: 2.4 });
    return maps as unknown as NoirTextures;
  }, [maps]);
}

/** Clones a map with an independent repeat so parts can scale their detail. */
export function repeat(src: THREE.Texture, x: number, y = x): THREE.Texture {
  const t = src.clone();
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(x, y);
  t.needsUpdate = true;
  return t;
}

/** Brushed stainless steel — genuinely metallic with directional microdetail. */
export function steelMaterial(t: NoirTextures): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map: t.steelColor,
    normalMap: t.steelNormal,
    normalScale: new THREE.Vector2(0.55, 0.55),
    roughnessMap: t.steelRough,
    roughness: 1,
    metalness: 1,
    clearcoatRoughnessMap: t.imperfectionColor,
    clearcoat: 0.15,
    clearcoatRoughness: 0.4,
    anisotropy: 0.55,
    anisotropyRotation: 0,
    envMapIntensity: 1.35,
    transparent: true,
    opacity: 1,
  });
}

/** Dark, powder/coated metal body panels. */
export function darkMetalMaterial(t: NoirTextures): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    map: t.darkColor,
    normalMap: t.darkNormal,
    normalScale: new THREE.Vector2(0.45, 0.45),
    roughnessMap: t.darkRough,
    roughness: 1,
    metalness: 0.85,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    clearcoatRoughnessMap: t.imperfectionColor,
    envMapIntensity: 0.9,
    transparent: true,
    opacity: 1,
  });
}

/** Warm brushed brass / copper for accents and the brand plate. */
export function brassMaterial(color = "#b77a45"): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.3,
    anisotropy: 0.4,
    envMapIntensity: 1.3,
    transparent: true,
    opacity: 1,
  });
}

/**
 * Espresso-machine materials. Deliberately free of micro-normal maps: the
 * machine geometry is a scan whose surface already carries small dents, and
 * layering a chasing normal map over it produced the "numerous indentations"
 * look. Smooth shading with clean PBR values keeps the panels flat.
 */
export function machineShellMaterial(color = "#2b2e33"): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.6,
    roughness: 0.4,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.9,
    transparent: true,
    opacity: 1,
  });
}

export function machineSteelMaterial(color = "#c6cbd1"): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.2,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.15,
    transparent: true,
    opacity: 1,
  });
}

export function machineBrassMaterial(color = "#b08f57"): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 1.25,
    transparent: true,
    opacity: 1,
  });
}

/** Food-grade ceramic / porcelain with subtle imperfections. */
export function porcelainMaterial(t: NoirTextures, color = "#efe6d7"): THREE.MeshPhysicalMaterial {
  const imperfections = repeat(t.imperfectionNormal, 3, 3);
  return new THREE.MeshPhysicalMaterial({
    color,
    normalMap: t.porcelainNormal,
    normalScale: new THREE.Vector2(0.12, 0.12),
    roughnessMap: t.porcelainRough,
    roughness: 0.92,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.28,
    clearcoatRoughnessMap: t.imperfectionColor,
    clearcoatNormalMap: imperfections,
    clearcoatNormalScale: new THREE.Vector2(0.06, 0.06),
    sheen: 0.35,
    sheenColor: new THREE.Color("#fff4e2"),
    sheenRoughness: 0.6,
    envMapIntensity: 1.05,
    transparent: true,
    opacity: 1,
  });
}

/** Clear / tinted glass for the water tank and tumbler. */
export function glassMaterial(color = "#dfe9ec", tint = 1): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.14,
    metalness: 0,
    transmission: tint,
    thickness: 0.35,
    ior: 1.5,
    specularIntensity: 0.4,
    envMapIntensity: 0.55,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });
}

/** Dark-roasted bean skin: a satin finish — between glossy and matte. */
export function beanMaterial(t: NoirTextures): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: "#3e2618",
    roughness: 0.55,
    metalness: 0,
    normalMap: repeat(t.imperfectionNormal, 5, 5),
    normalScale: new THREE.Vector2(0.2, 0.2),
    clearcoat: 0.22,
    clearcoatRoughness: 0.45,
    sheen: 0,
    envMapIntensity: 0.5,
    transparent: true,
    opacity: 0,
  });
}

/** Coffee surface (espresso crema / milk). */
export function liquidMaterial(color: string): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.16,
    metalness: 0,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    ior: 1.33,
    envMapIntensity: 1.1,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
}

/** Freshly ground coffee: matte, dark, with a fine grain normal. */
export function groundsMaterial(t: NoirTextures): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: "#3a2416",
    roughness: 0.94,
    metalness: 0,
    normalMap: repeat(t.imperfectionNormal, 8, 8),
    normalScale: new THREE.Vector2(0.5, 0.5),
    sheen: 0.1,
    envMapIntensity: 0.45,
    transparent: true,
    opacity: 1,
  });
}

/** Falling espresso: dark, glossy, slightly translucent. */
export function streamMaterial(color = "#2a1408"): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    ior: 1.35,
    envMapIntensity: 1.2,
    transparent: true,
    opacity: 1,
  });
}

/** Microfoam / crema top. */
export function foamMaterial(color = "#f0e2ca"): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    opacity: 0,
  });
}
