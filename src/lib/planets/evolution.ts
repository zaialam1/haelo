import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { planetLevelFromSessionCount } from "@/lib/prompts";
import type { DisplayLevel } from "@/lib/prompts";

/** Visual evolution stage for a planet (1 = base → 5 = fully evolved). */
export type PlanetEvolutionLevel = DisplayLevel;

export const PLANET_EVOLUTION_LEVELS = [1, 2, 3, 4, 5] as const satisfies readonly PlanetEvolutionLevel[];

export type PlanetEvolutionMotif =
  | "radiance"
  | "resonance"
  | "connection"
  | "discovery";

/**
 * Shared stage language across all planets.
 * Motif-specific detail lives in the surface components; these knobs drive
 * shared exterior treatment and make stage transitions animatable later.
 */
export type PlanetEvolutionStage = {
  level: PlanetEvolutionLevel;
  /** Short label for galleries / debug */
  label: string;
  /** Session threshold that unlocks this level */
  sessionThreshold: number;
  /** Soft exterior glow strength (0–1) */
  glow: number;
  /** Thin halo around the sphere (0–1) */
  halo: number;
  /** Soft bloom behind the planet (0–1); rises at L4+ */
  bloom: number;
  /** How far celestial activity extends past the sphere (0–1) */
  exteriorReach: number;
  /** Suggested particle count around the planet */
  particles: number;
  /** Internal motif density (0–1) — surfaces interpret per planet */
  motifIntensity: number;
  /** One-line design intent for this stage */
  intent: string;
};

export type PlanetEvolutionProfile = {
  id: VoicePlanetId;
  label: string;
  motif: PlanetEvolutionMotif;
  /** Brand color family for this planet */
  color: string;
  stages: Record<PlanetEvolutionLevel, PlanetEvolutionStage>;
};

/** Same thresholds as prompt unlock — keep visuals and curriculum aligned. */
export const EVOLUTION_SESSION_THRESHOLDS: Record<PlanetEvolutionLevel, number> = {
  1: 0,
  2: 3,
  3: 8,
  4: 15,
  5: 25,
};

function stage(
  level: PlanetEvolutionLevel,
  partial: Omit<PlanetEvolutionStage, "level" | "sessionThreshold" | "label"> & {
    label?: string;
  },
): PlanetEvolutionStage {
  return {
    level,
    label: partial.label ?? `Level ${level}`,
    sessionThreshold: EVOLUTION_SESSION_THRESHOLDS[level],
    glow: partial.glow,
    halo: partial.halo,
    bloom: partial.bloom,
    exteriorReach: partial.exteriorReach,
    particles: partial.particles,
    motifIntensity: partial.motifIntensity,
    intent: partial.intent,
  };
}

/**
 * Canonical evolution profiles.
 * Surfaces read `level` + these knobs; do not invent one-off visuals per call site.
 */
export const PLANET_EVOLUTION: Record<VoicePlanetId, PlanetEvolutionProfile> = {
  express: {
    id: "express",
    label: "Express",
    motif: "radiance",
    color: "#E8A0BF",
    stages: {
      1: stage(1, {
        glow: 0.38,
        halo: 0.08,
        bloom: 0,
        exteriorReach: 0,
        particles: 0,
        motifIntensity: 0.15,
        intent:
          "L1 base — single soft highlight, quiet pink body, almost no halo.",
      }),
      2: stage(2, {
        glow: 0.62,
        halo: 0.55,
        bloom: 0.14,
        exteriorReach: 0.15,
        particles: 0,
        motifIntensity: 0.5,
        intent:
          "L2 awakening — clear second highlight, visible pearlescent band, thin pink-white halo ring.",
      }),
      3: stage(3, {
        glow: 0.78,
        halo: 0.72,
        bloom: 0.28,
        exteriorReach: 0.28,
        particles: 3,
        motifIntensity: 0.75,
        intent:
          "L3 radiance — bright inner core, 3 curved light streaks, stronger rim glow.",
      }),
      4: stage(4, {
        glow: 0.78,
        halo: 0.65,
        bloom: 0.4,
        exteriorReach: 0.55,
        particles: 5,
        motifIntensity: 0.75,
        intent: "Light ribbons and particles expand expression outward.",
      }),
      5: stage(5, {
        glow: 0.9,
        halo: 0.85,
        bloom: 0.65,
        exteriorReach: 0.9,
        particles: 8,
        motifIntensity: 1,
        intent: "Fully radiant — aura, glints, soft rays, orbiting motes.",
      }),
    },
  },
  stand: {
    id: "stand",
    label: "Stand",
    motif: "resonance",
    color: "#5B4B8A",
    stages: {
      1: stage(1, {
        glow: 0.35,
        halo: 0.08,
        bloom: 0,
        exteriorReach: 0,
        particles: 0,
        motifIntensity: 0.15,
        intent: "L1 base — exactly two soft waveforms, quiet gold accent.",
      }),
      2: stage(2, {
        glow: 0.58,
        halo: 0.42,
        bloom: 0.1,
        exteriorReach: 0.12,
        particles: 2,
        motifIntensity: 0.55,
        intent:
          "L2 signal — clear third waveform, brighter gold wave, luminous peak dots.",
      }),
      3: stage(3, {
        glow: 0.72,
        halo: 0.65,
        bloom: 0.22,
        exteriorReach: 0.25,
        particles: 3,
        motifIntensity: 0.8,
        intent:
          "L3 resonance — four strong strands with depth, gold accent strand, purple halo.",
      }),
      4: stage(4, {
        glow: 0.74,
        halo: 0.6,
        bloom: 0.32,
        exteriorReach: 0.5,
        particles: 4,
        motifIntensity: 0.8,
        intent: "A faint resonance ripple escapes the sphere.",
      }),
      5: stage(5, {
        glow: 0.88,
        halo: 0.8,
        bloom: 0.55,
        exteriorReach: 0.85,
        particles: 6,
        motifIntensity: 1,
        intent: "Exterior frequency lines and a soft resonance ring.",
      }),
    },
  },
  connect: {
    id: "connect",
    label: "Connect",
    motif: "connection",
    color: "#6B9BC7",
    stages: {
      1: stage(1, {
        glow: 0.36,
        halo: 0.08,
        bloom: 0,
        exteriorReach: 0,
        particles: 0,
        motifIntensity: 0.15,
        intent: "L1 base — three soft translucent circles only.",
      }),
      2: stage(2, {
        glow: 0.58,
        halo: 0.45,
        bloom: 0.1,
        exteriorReach: 0.12,
        particles: 1,
        motifIntensity: 0.55,
        intent:
          "L2 growth — two new circles of varied size, deeper edge, bright overlap node.",
      }),
      3: stage(3, {
        glow: 0.74,
        halo: 0.62,
        bloom: 0.24,
        exteriorReach: 0.28,
        particles: 3,
        motifIntensity: 0.8,
        intent:
          "L3 constellation — 6 circles, glowing paths, multiple intersection sparks.",
      }),
      4: stage(4, {
        glow: 0.76,
        halo: 0.62,
        bloom: 0.35,
        exteriorReach: 0.55,
        particles: 4,
        motifIntensity: 0.8,
        intent: "Circles extend past the edge — connection beyond self.",
      }),
      5: stage(5, {
        glow: 0.88,
        halo: 0.82,
        bloom: 0.58,
        exteriorReach: 0.9,
        particles: 7,
        motifIntensity: 1,
        intent: "Living network — floating nodes, aura, delicate paths.",
      }),
    },
  },
  explore: {
    id: "explore",
    label: "Explore",
    motif: "discovery",
    color: "#E9A98A",
    stages: {
      1: stage(1, {
        glow: 0.48,
        halo: 0.2,
        bloom: 0.05,
        exteriorReach: 0.35,
        particles: 0,
        motifIntensity: 0.25,
        intent: "Ring + tiny constellation — first wonder.",
      }),
      2: stage(2, {
        glow: 0.58,
        halo: 0.35,
        bloom: 0.12,
        exteriorReach: 0.45,
        particles: 2,
        motifIntensity: 0.45,
        intent: "Extra orbit line, more stars, a tiny celestial body.",
      }),
      3: stage(3, {
        glow: 0.7,
        halo: 0.5,
        bloom: 0.22,
        exteriorReach: 0.6,
        particles: 4,
        motifIntensity: 0.65,
        intent: "Multiple orbits and a richer constellation.",
      }),
      4: stage(4, {
        glow: 0.8,
        halo: 0.65,
        bloom: 0.4,
        exteriorReach: 0.78,
        particles: 6,
        motifIntensity: 0.85,
        intent: "A small moon and expanding starfield.",
      }),
      5: stage(5, {
        glow: 0.92,
        halo: 0.88,
        bloom: 0.62,
        exteriorReach: 1,
        particles: 9,
        motifIntensity: 1,
        intent: "Layered rings, moons, aura — a celestial explorer.",
      }),
    },
  },
};

export function getPlanetEvolutionProfile(
  planetId: VoicePlanetId,
): PlanetEvolutionProfile {
  return PLANET_EVOLUTION[planetId];
}

export function getPlanetEvolutionStage(
  planetId: VoicePlanetId,
  level: PlanetEvolutionLevel,
): PlanetEvolutionStage {
  return PLANET_EVOLUTION[planetId].stages[level];
}

/** Map completed sessions on a planet → evolution level. */
export function evolutionLevelFromSessionCount(
  completedSessions: number,
): PlanetEvolutionLevel {
  return planetLevelFromSessionCount(completedSessions);
}

/**
 * Opacity for a layer that unlocks at `unlockAt`.
 * Returns 0 before unlock; softens in as levels continue — friendly for CSS transitions.
 */
export function evolutionLayerOpacity(
  level: PlanetEvolutionLevel,
  unlockAt: PlanetEvolutionLevel,
  options: { peak?: number; step?: number } = {},
): number {
  if (level < unlockAt) return 0;
  const peak = options.peak ?? 1;
  const step = options.step ?? 0.1;
  // Unlock fully enough to read at first appearance (gallery + live).
  return Math.min(peak, 0.82 + (level - unlockAt) * step);
}

export function isPlanetEvolutionLevel(
  value: number,
): value is PlanetEvolutionLevel {
  return (
    value === 1 || value === 2 || value === 3 || value === 4 || value === 5
  );
}

/** All 20 planet×level pairs — useful for galleries and QA. */
export function allPlanetEvolutionPairs(): Array<{
  planetId: VoicePlanetId;
  level: PlanetEvolutionLevel;
  stage: PlanetEvolutionStage;
  profile: PlanetEvolutionProfile;
}> {
  const planets = Object.keys(PLANET_EVOLUTION) as VoicePlanetId[];
  return planets.flatMap((planetId) =>
    PLANET_EVOLUTION_LEVELS.map((level) => ({
      planetId,
      level,
      stage: getPlanetEvolutionStage(planetId, level),
      profile: getPlanetEvolutionProfile(planetId),
    })),
  );
}
