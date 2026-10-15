import { clamp, smoothstep } from "@/lib/scroll";

/**
 * Scene weights derived from the shared scroll bus. Every 3D component reads
 * the same curves so the scene reads as one continuous, reversible timeline.
 *
 * Story beats across `story` (0→1):
 *   1. beans    0.00–0.22  floating bean field
 *   2. grind    0.10–0.42  beans converge into the grinder, grounds stream out
 *   3. prep     0.30–0.56  grounds collect in the portafilter, tamper presses
 *   4. lock     0.54–0.72  machine arrives, portafilter rotates into the group
 *                          head
 *   5. extract  0.68–0.92  espresso streams, the cup fills, crema forms
 *   6. cupHero  0.86–0.98  cup detaches and dollies toward the camera
 *
 * Bands overlap so adjacent camera weights crossfade; pulses are products of
 * rising and falling smoothsteps so every beat is fully reversible.
 */
export interface Timeline {
  /** Beat 1 camera weight: floating beans. */
  beans: number;
  /** Beat 2 camera weight: grinding. */
  grind: number;
  /** Beat 3 camera weight: portafilter prep / tamping. */
  prep: number;
  /** Beat 4 camera weight: locking into the group head. */
  lock: number;
  /** Beat 5 camera weight: extraction. */
  extract: number;
  /** Monotonic hold: rises through beat 6 and stays at 1. */
  cupHero: number;

  /** Floating bean field presence (opacity), 1→0 as the grind completes. */
  beanField: number;
  /** Grinder presence (opacity), 0→1→0 across beats 1–3. */
  grinder: number;
  /** Portafilter presence, from late grind until the cup hero completes. */
  portafilter: number;
  /** Portafilter docking blend, 0→1 during the lock beat and holds at 1. */
  locked: number;
  /** Machine presence (opacity). Fades as the cup detaches. */
  machine: number;
  /** Stable seat for machine placement; monotonic, holds at 1. */
  seat: number;

  /** Beans lerp into the hopper. Monotonic within the grind beat. */
  converge: number;
  /** Granule stream from the chute into the basket. */
  flow: number;
  /** Grounds level rising inside the basket. Monotonic. */
  grounds: number;
  /** Tamper press, 0→1→0 (presses, then retracts). */
  tamp: number;
  /** Cup rising onto the drip tray under the group head. Monotonic. */
  arrive: number;
  /** Liquid level inside the cup. Monotonic, completes before detach. */
  fill: number;
  /** Crema forming on top of the shot. Monotonic. */
  crema: number;

  /** Signature section approach weight (own ScrollTrigger bus). */
  stage: number;
  /** Weight of the cup's on-the-tray pose. */
  dock: number;
  /** Weight of the featured signature cup pose. */
  sigPose: number;
  /** Weight of the detached hero-shot pose (pre-signature). */
  heroPose: number;
  /** Cup presence, spans extraction → signature. */
  vessel: number;
  /** Signature section ambience weight. */
  signature: number;
  /** Global canvas presence (fades as the menu rises). */
  global: number;
}

export function computeTimeline(
  story: number,
  signature: number,
  menuReveal: number,
): Timeline {
  // Camera beat pulses: rising × falling smoothsteps, overlapping so the
  // weighted camera blend always has a neighbouring pair to crossfade.
  const beans = 1 - smoothstep(0.1, 0.22, story);
  const grind = smoothstep(0.1, 0.22, story) * (1 - smoothstep(0.32, 0.44, story));
  const prep = smoothstep(0.32, 0.44, story) * (1 - smoothstep(0.5, 0.6, story));
  const lock = smoothstep(0.5, 0.6, story) * (1 - smoothstep(0.66, 0.76, story));
  const extract =
    smoothstep(0.66, 0.76, story) * (1 - smoothstep(0.84, 0.92, story));
  const cupHero = smoothstep(0.86, 0.96, story);

  // Presence pulses.
  const beanField = 1 - smoothstep(0.3, 0.42, story);
  const grinder =
    smoothstep(0.02, 0.1, story) * (1 - smoothstep(0.42, 0.52, story));
  const portafilter =
    smoothstep(0.32, 0.4, story) * (1 - smoothstep(0.86, 0.94, story));
  const machine =
    smoothstep(0.48, 0.62, story) * (1 - smoothstep(0.86, 0.94, story));
  const seat = smoothstep(0.46, 0.62, story);
  const locked = smoothstep(0.54, 0.66, story);

  // Effect sub-progresses.
  const converge = smoothstep(0.12, 0.3, story);
  const flow =
    smoothstep(0.34, 0.44, story) * (1 - smoothstep(0.5, 0.58, story));
  const grounds = smoothstep(0.34, 0.48, story);
  const tamp =
    smoothstep(0.46, 0.54, story) * (1 - smoothstep(0.56, 0.62, story));
  const arrive = smoothstep(0.6, 0.7, story);
  const fill = smoothstep(0.68, 0.86, story);
  const crema = smoothstep(0.78, 0.9, story);

  // Signature section approach.
  const stage = smoothstep(0.02, 0.28, signature);

  // Cup hand-off: docked on the tray through extraction, detaches into the
  // hero shot across beat 6, then glides to the signature stage as that
  // section approaches. Sequential blend — at most two poses ever share the
  // frame — and the weight sum never approaches 0, so the cup can't jump.
  const dock = arrive * (1 - cupHero);
  const heroPose = cupHero * (1 - stage);
  const sigPose = stage;
  const vessel = clamp(dock + heroPose + sigPose);

  const sig = smoothstep(0.04, 0.3, signature) * (1 - smoothstep(0.78, 1, signature));
  const global = 1 - menuReveal;

  return {
    beans,
    grind,
    prep,
    lock,
    extract,
    cupHero,
    beanField,
    grinder,
    portafilter,
    locked,
    machine,
    seat,
    converge,
    flow,
    grounds,
    tamp,
    arrive,
    fill,
    crema,
    stage,
    dock,
    sigPose,
    heroPose,
    vessel,
    signature: sig,
    global,
  };
}

/** Eases a value toward a target with frame-rate independent damping. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
