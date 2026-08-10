import {
  CELESTIAL_CATALOG,
  getCatalogReward,
  orbitRewardDefinition,
  planetTenRewardKey,
  regionRewardKey,
} from "@/lib/gamification/catalog";
import type {
  CelestialRewardDefinition,
  EligibleSessionLite,
  GamificationEvent,
  UserCelestialReward,
} from "@/lib/gamification/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import type { OrbitRegionKey } from "@/lib/orbits/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type DiscoveryContext = {
  supabase: SupabaseClient;
  userId: string;
  event: GamificationEvent;
  eligibleSessions: EligibleSessionLite[];
  experienceByPlanet: Record<VoicePlanetId, number>;
  completedOrbitProgressIds: string[];
  completedOrbitKeys: string[];
  completedRegions: OrbitRegionKey[];
  weeklyGoalsCompletedAllTime: number;
  experimentCount: number;
  existingRewardKeys: Set<string>;
};

function planetCounts(
  sessions: EligibleSessionLite[],
): Record<VoicePlanetId, number> {
  const counts: Record<VoicePlanetId, number> = {
    express: 0,
    stand: 0,
    connect: 0,
    explore: 0,
  };
  for (const s of sessions) {
    if (s.planet in counts) counts[s.planet] += 1;
  }
  return counts;
}

/**
 * Deterministic discovery rules. No random loot.
 * Returns catalog definitions newly eligible for unlock.
 */
export function evaluateCelestialDiscoveries(
  ctx: DiscoveryContext,
): CelestialRewardDefinition[] {
  const unlocked: CelestialRewardDefinition[] = [];
  const have = ctx.existingRewardKeys;
  const counts = ctx.experienceByPlanet;
  const total = ctx.eligibleSessions.length;

  const tryAdd = (key: string) => {
    if (have.has(key)) return;
    const def = getCatalogReward(key) ?? CELESTIAL_CATALOG[key];
    if (def) {
      unlocked.push(def);
      have.add(key);
    }
  };

  // First Orbit
  if (ctx.completedOrbitProgressIds.length >= 1) {
    tryAdd("first_orbit_moon");
  }

  // Weekly goal completed 3 times (all-time)
  if (ctx.weeklyGoalsCompletedAllTime >= 3) {
    tryAdd("weekly_triad");
  }

  // First reflection in all four planets
  if (
    counts.connect >= 1 &&
    counts.stand >= 1 &&
    counts.explore >= 1 &&
    counts.express >= 1
  ) {
    tryAdd("four_winds");
  }

  // 10 per planet
  for (const planet of ["stand", "connect", "explore", "express"] as const) {
    if (counts[planet] >= 10) {
      tryAdd(planetTenRewardKey(planet));
    }
  }

  // First experiment
  if (ctx.experimentCount >= 1) {
    tryAdd("experiment_spark");
  }

  // First planet evolution (any planet stage >= 2)
  if (
    counts.connect >= 3 ||
    counts.stand >= 3 ||
    counts.explore >= 3 ||
    counts.express >= 3
  ) {
    tryAdd("first_evolution_bloom");
  }

  if (total >= 25) tryAdd("voice_25");
  if (total >= 50) tryAdd("voice_50");

  // First Orbit per region
  for (const region of ctx.completedRegions) {
    tryAdd(regionRewardKey(region));
  }

  // Per-orbit artifact on orbit_completed
  if (ctx.event.type === "orbit_completed") {
    // Caller adds orbit-specific reward separately via unlockOrbitReward
  }

  return unlocked;
}

export async function unlockOrbitReward(
  supabase: SupabaseClient,
  userId: string,
  orbitProgressId: string,
  orbitKey: string,
  existingKeys: Set<string>,
): Promise<UserCelestialReward | null> {
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit) return null;
  const def = orbitRewardDefinition(orbitKey, orbit.title);
  if (existingKeys.has(def.rewardKey)) return null;

  return insertReward(supabase, userId, def, {
    sourceType: "orbit_completion",
    sourceId: orbitProgressId,
  });
}

export async function insertReward(
  supabase: SupabaseClient,
  userId: string,
  def: CelestialRewardDefinition,
  source: { sourceType: string; sourceId: string | null },
): Promise<UserCelestialReward | null> {
  const { data: existing } = await supabase
    .from("user_celestial_rewards")
    .select("id")
    .eq("user_id", userId)
    .eq("reward_key", def.rewardKey)
    .maybeSingle();

  if (existing) return null;

  const { data, error } = await supabase
    .from("user_celestial_rewards")
    .insert({
      user_id: userId,
      reward_key: def.rewardKey,
      reward_type: def.rewardType,
      source_type: source.sourceType,
      source_id: source.sourceId,
      title: def.title,
      description: def.description,
      placement: def.placement,
      planet: def.planet ?? null,
      reveal_priority: def.revealPriority,
    })
    .select(
      "id, user_id, reward_key, reward_type, source_type, source_id, title, description, placement, planet, reveal_priority, unlocked_at, viewed_at",
    )
    .maybeSingle();

  if (error) {
    // Unique race — treat as already unlocked
    if (error.code === "23505") return null;
    console.error("[gamification] reward insert failed:", error.message);
    return null;
  }
  if (!data) return null;
  return mapReward(data);
}

export function mapReward(row: {
  id: string;
  user_id: string;
  reward_key: string;
  reward_type: string;
  source_type: string;
  source_id: string | null;
  title: string;
  description: string | null;
  placement: string;
  planet: string | null;
  reveal_priority: string;
  unlocked_at: string;
  viewed_at: string | null;
}): UserCelestialReward {
  return {
    id: row.id,
    userId: row.user_id,
    rewardKey: row.reward_key,
    rewardType: row.reward_type as UserCelestialReward["rewardType"],
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    description: row.description,
    placement: row.placement as UserCelestialReward["placement"],
    planet: (row.planet as VoicePlanetId | null) ?? null,
    revealPriority: row.reveal_priority as UserCelestialReward["revealPriority"],
    unlockedAt: row.unlocked_at,
    viewedAt: row.viewed_at,
  };
}

export { planetCounts };
