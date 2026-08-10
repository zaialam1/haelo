/**
 * Celestial reward catalog — permanent Universe decorations.
 * Stylistically consistent with Haelo; no cartoon loot.
 */

import type {
  CelestialRewardDefinition,
  CelestialRewardType,
} from "@/lib/gamification/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { OrbitRegionKey } from "@/lib/orbits/types";

const ORBIT_ARTIFACT_TYPES: readonly CelestialRewardType[] = [
  "moon",
  "comet",
  "satellite",
  "ring",
  "star_cluster",
  "nebula",
  "aurora",
  "orbiting_light",
  "constellation",
] as const;

/** Stable hash → catalog type for per-orbit artifacts. */
export function orbitArtifactType(orbitKey: string): CelestialRewardType {
  let h = 0;
  for (let i = 0; i < orbitKey.length; i++) {
    h = (h * 31 + orbitKey.charCodeAt(i)) >>> 0;
  }
  return ORBIT_ARTIFACT_TYPES[h % ORBIT_ARTIFACT_TYPES.length]!;
}

export function orbitRewardKey(orbitKey: string): string {
  return `orbit_artifact:${orbitKey}`;
}

export function orbitRewardDefinition(
  orbitKey: string,
  orbitTitle: string,
): CelestialRewardDefinition {
  const rewardType = orbitArtifactType(orbitKey);
  const titles: Record<CelestialRewardType, string> = {
    moon: "Silver Moon",
    ring: "Quiet Ring",
    comet: "Comet Trail",
    constellation: "Orbit Constellation",
    star_cluster: "Star Cluster",
    nebula: "Nebula Fragment",
    satellite: "Soft Satellite",
    aurora: "Faint Aurora",
    orbiting_light: "Orbiting Light",
  };
  return {
    rewardKey: orbitRewardKey(orbitKey),
    rewardType,
    title: titles[rewardType],
    description: `Discovered by completing ${orbitTitle}.`,
    placement:
      rewardType === "moon" || rewardType === "ring"
        ? "planet_moon"
        : rewardType === "comet"
          ? "outer_space"
          : rewardType === "nebula" || rewardType === "aurora"
            ? "universe_background"
            : "universe_background",
    revealPriority: "immediate",
  };
}

/** Deterministic milestone / discovery catalog. */
export const CELESTIAL_CATALOG: Record<string, CelestialRewardDefinition> = {
  first_orbit_moon: {
    rewardKey: "first_orbit_moon",
    rewardType: "moon",
    title: "First Orbit Moon",
    description: "A quiet moon for completing your first Orbit.",
    placement: "outer_space",
    revealPriority: "immediate",
  },
  weekly_triad: {
    rewardKey: "weekly_triad",
    rewardType: "constellation",
    title: "Weekly Triad",
    description: "Your constellation completed three weeks.",
    placement: "universe_background",
    revealPriority: "deferred",
  },
  four_winds: {
    rewardKey: "four_winds",
    rewardType: "star_cluster",
    title: "Four Winds",
    description: "A first reflection in every planet.",
    placement: "universe_background",
    revealPriority: "immediate",
  },
  stand_lantern: {
    rewardKey: "stand_lantern",
    rewardType: "orbiting_light",
    title: "Stand Lantern",
    description: "Ten Stand reflections.",
    placement: "planet_moon",
    planet: "stand",
    revealPriority: "deferred",
  },
  connect_thread: {
    rewardKey: "connect_thread",
    rewardType: "ring",
    title: "Connect Thread",
    description: "Ten Connect reflections.",
    placement: "planet_ring",
    planet: "connect",
    revealPriority: "deferred",
  },
  explore_compass: {
    rewardKey: "explore_compass",
    rewardType: "satellite",
    title: "Explore Compass",
    description: "Ten Explore reflections.",
    placement: "planet_moon",
    planet: "explore",
    revealPriority: "deferred",
  },
  express_flare: {
    rewardKey: "express_flare",
    rewardType: "aurora",
    title: "Express Flare",
    description: "Ten Express reflections.",
    placement: "planet_moon",
    planet: "express",
    revealPriority: "deferred",
  },
  experiment_spark: {
    rewardKey: "experiment_spark",
    rewardType: "orbiting_light",
    title: "Experiment Spark",
    description: "You tried a new way of saying it.",
    placement: "my_voice",
    revealPriority: "immediate",
  },
  first_evolution_bloom: {
    rewardKey: "first_evolution_bloom",
    rewardType: "nebula",
    title: "Evolution Bloom",
    description: "A planet evolved for the first time.",
    placement: "universe_background",
    revealPriority: "immediate",
  },
  voice_25: {
    rewardKey: "voice_25",
    rewardType: "constellation",
    title: "Twenty-Five Lights",
    description: "Twenty-five completed reflections.",
    placement: "universe_background",
    revealPriority: "deferred",
  },
  voice_50: {
    rewardKey: "voice_50",
    rewardType: "star_cluster",
    title: "Fifty Lights",
    description: "Fifty completed reflections.",
    placement: "universe_background",
    revealPriority: "deferred",
  },
  region_friendships_people: {
    rewardKey: "region_friendships_people",
    rewardType: "comet",
    title: "Belonging Comet",
    description: "First completed Orbit in Friendships & People.",
    placement: "outer_space",
    revealPriority: "deferred",
  },
  region_speaking_up: {
    rewardKey: "region_speaking_up",
    rewardType: "comet",
    title: "Boundary Comet",
    description: "First completed Orbit in Speaking Up.",
    placement: "outer_space",
    revealPriority: "deferred",
  },
  region_figuring_things_out: {
    rewardKey: "region_figuring_things_out",
    rewardType: "comet",
    title: "Clarity Comet",
    description: "First completed Orbit in Figuring Things Out.",
    placement: "outer_space",
    revealPriority: "deferred",
  },
  region_putting_yourself_out_there: {
    rewardKey: "region_putting_yourself_out_there",
    rewardType: "comet",
    title: "Courage Comet",
    description: "First completed Orbit in Putting Yourself Out There.",
    placement: "outer_space",
    revealPriority: "deferred",
  },
};

export function regionRewardKey(region: OrbitRegionKey): string {
  return `region_${region}`;
}

export function planetTenRewardKey(planet: VoicePlanetId): string {
  const map: Record<VoicePlanetId, string> = {
    stand: "stand_lantern",
    connect: "connect_thread",
    explore: "explore_compass",
    express: "express_flare",
  };
  return map[planet];
}

export function getCatalogReward(
  rewardKey: string,
): CelestialRewardDefinition | undefined {
  return CELESTIAL_CATALOG[rewardKey];
}
