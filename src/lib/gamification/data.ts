import { WEEKLY_VOICE_GOAL } from "@/lib/gamification/config";
import { mapReward } from "@/lib/gamification/discoveries";
import {
  evolutionStageFromExperience,
  emptyPlanetExperience,
  planetEvolutionTeaser,
} from "@/lib/gamification/planetGrowth";
import type {
  GamificationReveal,
  PlanetEvolutionTeaser,
  PlanetExperienceCounts,
  UserCelestialReward,
  UserMilestone,
  WeeklyVoiceProgress,
} from "@/lib/gamification/types";
import { weekKeyFromDate } from "@/lib/gamification/week";
import { isEligibleReflection } from "@/lib/gamification/eligibility";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { createClient } from "@/lib/supabase/server";

/** True when a migration has not been applied yet (safe to no-op in UI). */
function isMissingRelationError(message: string | null | undefined): boolean {
  if (!message) return false;
  return (
    /Could not find the table/i.test(message) ||
    /schema cache/i.test(message) ||
    /relation .* does not exist/i.test(message)
  );
}

function mapWeekly(row: {
  user_id: string;
  week_key: string;
  goal_count: number;
  completed_count: number;
  completed_at: string | null;
}): WeeklyVoiceProgress {
  return {
    userId: row.user_id,
    weekKey: row.week_key,
    goalCount: row.goal_count,
    completedCount: row.completed_count,
    completedAt: row.completed_at,
  };
}

function mapReveal(row: {
  id: string;
  user_id: string;
  reveal_key: string;
  reveal_type: string;
  priority: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  viewed_at: string | null;
}): GamificationReveal {
  return {
    id: row.id,
    userId: row.user_id,
    revealKey: row.reveal_key,
    revealType: row.reveal_type as GamificationReveal["revealType"],
    priority: row.priority as GamificationReveal["priority"],
    title: row.title,
    body: row.body,
    payload: row.payload ?? {},
    createdAt: row.created_at,
    viewedAt: row.viewed_at,
  };
}

function mapMilestone(row: {
  id: string;
  user_id: string;
  milestone_key: string;
  title: string;
  body: string;
  category: string;
  source_metadata: Record<string, unknown> | null;
  unlocked_at: string;
  viewed_at: string | null;
}): UserMilestone {
  return {
    id: row.id,
    userId: row.user_id,
    milestoneKey: row.milestone_key,
    title: row.title,
    body: row.body,
    category: row.category as UserMilestone["category"],
    sourceMetadata: row.source_metadata ?? {},
    unlockedAt: row.unlocked_at,
    viewedAt: row.viewed_at,
  };
}

export async function getPlanetExperienceCounts(
  userId: string | null,
): Promise<PlanetExperienceCounts> {
  const base = emptyPlanetExperience();
  if (!userId) return base;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("planet, source, status")
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) {
    console.error("[gamification] experience fetch failed:", error.message);
    return base;
  }

  for (const row of data ?? []) {
    const planet = row.planet as VoicePlanetId;
    if (!(planet in base)) continue;
    if (!isEligibleReflection({ status: row.status, source: row.source })) {
      continue;
    }
    base[planet] += 1;
  }
  return base;
}

export async function getUniversePlanetEvolutionLevelsFromExperience(
  userId: string | null,
): Promise<Record<VoicePlanetId, PlanetEvolutionLevel>> {
  const counts = await getPlanetExperienceCounts(userId);
  return {
    express: evolutionStageFromExperience(counts.express),
    stand: evolutionStageFromExperience(counts.stand),
    connect: evolutionStageFromExperience(counts.connect),
    explore: evolutionStageFromExperience(counts.explore),
  };
}

export async function getPlanetEvolutionTeaserForUser(
  userId: string | null,
  planetId: VoicePlanetId,
): Promise<PlanetEvolutionTeaser> {
  const counts = await getPlanetExperienceCounts(userId);
  return planetEvolutionTeaser(planetId, counts[planetId] ?? 0);
}

export async function getCurrentWeeklyVoiceProgress(
  userId: string | null,
): Promise<WeeklyVoiceProgress | null> {
  if (!userId) return null;
  const supabase = await createClient();
  const weekKey = weekKeyFromDate();

  const { data, error } = await supabase
    .from("weekly_voice_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (error) {
    // Migration not applied yet — return empty weekly progress, don't crash Home.
    if (isMissingRelationError(error.message)) {
      return {
        userId,
        weekKey,
        goalCount: WEEKLY_VOICE_GOAL,
        completedCount: 0,
        completedAt: null,
      };
    }
    console.error("[gamification] weekly fetch failed:", error.message);
    return null;
  }

  if (data) return mapWeekly(data);

  return {
    userId,
    weekKey,
    goalCount: WEEKLY_VOICE_GOAL,
    completedCount: 0,
    completedAt: null,
  };
}

export async function getUserCelestialRewards(
  userId: string | null,
): Promise<UserCelestialReward[]> {
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_celestial_rewards")
    .select(
      "id, user_id, reward_key, reward_type, source_type, source_id, title, description, placement, planet, reveal_priority, unlocked_at, viewed_at",
    )
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapReward);
}

export async function getPendingGamificationReveals(
  userId: string | null,
  opts?: { priority?: "immediate" | "deferred" | "any"; limit?: number },
): Promise<GamificationReveal[]> {
  if (!userId) return [];
  const supabase = await createClient();
  let query = supabase
    .from("user_gamification_reveals")
    .select("*")
    .eq("user_id", userId)
    .is("viewed_at", null)
    .order("created_at", { ascending: true })
    .limit(opts?.limit ?? 8);

  if (opts?.priority && opts.priority !== "any") {
    query = query.eq("priority", opts.priority);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapReveal);
}

export async function getRecentMilestones(
  userId: string | null,
  limit = 5,
): Promise<UserMilestone[]> {
  if (!userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_milestones")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapMilestone);
}

export async function countEligibleReflections(
  userId: string | null,
): Promise<number> {
  if (!userId) return 0;
  const counts = await getPlanetExperienceCounts(userId);
  return (
    counts.connect + counts.stand + counts.explore + counts.express
  );
}
