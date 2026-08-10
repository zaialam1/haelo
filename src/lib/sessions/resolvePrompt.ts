import { createClient } from "@/lib/supabase/server";
import {
  planetLevelFromSessionCount,
  selectPrompt,
  type DisplayLevel,
  type HaeloPrompt,
  type Planet,
} from "@/lib/prompts";
import { PLANET_PROGRESSION_SOURCES } from "@/lib/sessions/sourcePolicy";

const RECENT_PROMPT_LIMIT = 40;

export type ResolvedSessionPrompt = {
  prompt: HaeloPrompt;
  planetLevel: DisplayLevel;
  completedSessionCount: number;
  /** True when this is the user's first-ever recording (any planet). */
  firstSession: boolean;
};

/**
 * Resolve a curriculum prompt for a planet session.
 * Uses completed session count for level + recent prompt IDs for cooldown.
 * Falls back to Level 1 when the user has no history.
 *
 * Only planet + daily sources advance unlock level. Orbit sessions never do.
 */
export async function resolvePlanetSessionPrompt(
  userId: string,
  planet: Planet,
): Promise<ResolvedSessionPrompt> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("prompt_id, source")
    .eq("user_id", userId)
    .eq("planet", planet)
    .eq("status", "completed")
    .in("source", [...PLANET_PROGRESSION_SOURCES])
    .order("completed_at", { ascending: false })
    .limit(RECENT_PROMPT_LIMIT);

  if (error) {
    console.error("[session] recent prompts fetch failed:", error.message);
  }

  const recentPromptIds = (rows ?? [])
    .map((r) => r.prompt_id as string)
    .filter(Boolean);

  const completedSessionCount = recentPromptIds.length;
  // Exact count may exceed limit; for level unlock use a separate count when needed.
  // For new users this is 0 → Level 1. Cap is fine until they exceed RECENT_PROMPT_LIMIT.
  let exactCount = completedSessionCount;
  if (completedSessionCount >= RECENT_PROMPT_LIMIT) {
    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("planet", planet)
      .eq("status", "completed")
      .in("source", [...PLANET_PROGRESSION_SOURCES]);
    exactCount = count ?? completedSessionCount;
  }

  const planetLevel = planetLevelFromSessionCount(exactCount);

  // First-ever recording anywhere → gentle beginner/light prompt.
  let firstSession = false;
  if (exactCount === 0) {
    const { count: totalCompleted } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");
    firstSession = (totalCompleted ?? 0) === 0;
  }

  const prompt = selectPrompt({
    planet,
    planetLevel,
    recentPromptIds,
    firstSession,
  });

  if (!prompt) {
    // Bank should always yield something at level 1; hard fallback.
    const fallback = selectPrompt({ planet, planetLevel: 1 });
    if (!fallback) {
      throw new Error(`No prompts available for ${planet}.`);
    }
    return {
      prompt: fallback,
      planetLevel: 1,
      completedSessionCount: exactCount,
      firstSession,
    };
  }

  return {
    prompt,
    planetLevel,
    completedSessionCount: exactCount,
    firstSession,
  };
}
