/**
 * Centralized My Voice thresholds and refresh rules.
 * Do not scatter these constants across components.
 */

/** Below this, show empty / beginning states — no AI synthesis. */
export const MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS = 5;

/** 1 … (MIN - 1) → beginning-to-take-shape (no fabricated growth). */
export const MY_VOICE_BEGINNING_MAX_SESSIONS =
  MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS - 1;

/**
 * Regenerate when the user has completed at least this many new eligible
 * reflections since the last stored summary.
 */
export const MY_VOICE_NEW_SESSIONS_TO_REFRESH = 4;

/** Prompt / output schema version — bump when synthesis contract changes. */
export const MY_VOICE_PROMPT_VERSION = "1";

/** Soft cap on analysis snippets sent to the model. */
export const MY_VOICE_MAX_ANALYSIS_SNIPPETS = 14;

/** Soft cap on Orbit summative themes (not individual Orbit responses). */
export const MY_VOICE_MAX_ORBIT_SUMMARIES = 4;

export type MyVoiceRefreshDecision =
  | { shouldGenerate: false; reason: "insufficient_history" }
  | { shouldGenerate: false; reason: "cache_fresh" }
  | {
      shouldGenerate: true;
      reason: "missing" | "new_sessions" | "new_completed_orbit";
    };

/**
 * Decide whether to (re)generate My Voice from current activity vs cache.
 */
export function decideMyVoiceRefresh(opts: {
  eligibleSessionCount: number;
  completedOrbitCount: number;
  latestSessionAt: string | null;
  cached: {
    sessionCountAtGeneration: number;
    completedOrbitCountAtGeneration: number;
    latestSessionAtGeneration: string | null;
    status: "ready" | "failed";
  } | null;
}): MyVoiceRefreshDecision {
  if (opts.eligibleSessionCount < MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS) {
    return { shouldGenerate: false, reason: "insufficient_history" };
  }

  if (!opts.cached || opts.cached.status !== "ready") {
    return { shouldGenerate: true, reason: "missing" };
  }

  const newSessions =
    opts.eligibleSessionCount - opts.cached.sessionCountAtGeneration;
  if (newSessions >= MY_VOICE_NEW_SESSIONS_TO_REFRESH) {
    return { shouldGenerate: true, reason: "new_sessions" };
  }

  if (
    opts.completedOrbitCount > opts.cached.completedOrbitCountAtGeneration
  ) {
    return { shouldGenerate: true, reason: "new_completed_orbit" };
  }

  return { shouldGenerate: false, reason: "cache_fresh" };
}

export function myVoicePhaseFromSessionCount(
  count: number,
): "empty" | "beginning" | "eligible" {
  if (count <= 0) return "empty";
  if (count <= MY_VOICE_BEGINNING_MAX_SESSIONS) return "beginning";
  return "eligible";
}

export function formatMyVoiceUpdatedLabel(sessionCountAtGeneration: number): string {
  if (sessionCountAtGeneration <= 0) return "Updated recently";
  if (sessionCountAtGeneration === 1) return "Updated after 1 reflection";
  return `Updated after ${sessionCountAtGeneration} reflections`;
}
