import { createClient } from "@/lib/supabase/server";
import {
  planetLevelFromSessionCount,
  selectPrompt,
  type DisplayLevel,
  type HaeloPrompt,
  type Planet,
} from "@/lib/prompts";

const RECENT_PROMPT_LIMIT = 40;

export type ResolvedSessionPrompt = {
  prompt: HaeloPrompt;
  planetLevel: DisplayLevel;
  completedSessionCount: number;
};

/**
 * Resolve a curriculum prompt for a planet session.
 * Uses completed session count for level + recent prompt IDs for cooldown.
 * Falls back to Level 1 when the user has no history.
 */
export async function resolvePlanetSessionPrompt(
  userId: string,
  planet: Planet,
): Promise<ResolvedSessionPrompt> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("sessions")
    .select("prompt_id")
    .eq("user_id", userId)
    .eq("planet", planet)
    .eq("status", "completed")
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
      .eq("status", "completed");
    exactCount = count ?? completedSessionCount;
  }

  const planetLevel = planetLevelFromSessionCount(exactCount);

  const prompt = selectPrompt({
    planet,
    planetLevel,
    recentPromptIds,
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
    };
  }

  return {
    prompt,
    planetLevel,
    completedSessionCount: exactCount,
  };
}
