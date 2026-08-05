import type { DisplayLevel, PromptChallenge, PromptDepth } from "./types";

/**
 * Completed sessions in a planet → earliest unlocked display level.
 * Easy to extend later with non–session-count criteria.
 */
export const PLANET_LEVEL_THRESHOLDS: Record<DisplayLevel, number> = {
  1: 0,
  2: 3,
  3: 8,
  4: 15,
  5: 25,
};

/**
 * When the user is at planetLevel N, weight picks among display levels 1..N.
 * Does not force the highest unlocked level.
 */
export const LEVEL_WEIGHTS: Record<
  DisplayLevel,
  Partial<Record<DisplayLevel, number>>
> = {
  1: { 1: 1.0 },
  2: { 1: 0.4, 2: 0.6 },
  3: { 1: 0.2, 2: 0.35, 3: 0.45 },
  4: { 1: 0.15, 2: 0.2, 3: 0.3, 4: 0.35 },
  5: { 1: 0.1, 2: 0.15, 3: 0.2, 4: 0.3, 5: 0.25 },
};

/** Default Daily Question filters — inviting, low pressure. */
export const DAILY_PROMPT_DEFAULTS = {
  allowedDepths: ["light", "personal"] as const satisfies readonly PromptDepth[],
  allowedChallenges: [
    "beginner",
    "developing",
  ] as const satisfies readonly PromptChallenge[],
  /** Exclude Deep+Stretch even if depth/challenge lists would allow parts. */
  excludeDeepStretch: true,
} as const;

export type DepthPreference = "lighter" | "normal" | "deeper";

export const DEPTH_PREFERENCE_FILTERS: Record<
  DepthPreference,
  readonly PromptDepth[]
> = {
  lighter: ["light"],
  normal: ["light", "personal"],
  deeper: ["personal", "deep"],
};

/** Soft floor before relaxing recent-prompt exclusion. */
export const MIN_POOL_AFTER_COOLDOWN = 3;

/**
 * Derive planet display level from completed session count in that planet.
 * Structured so additional signals can be folded in later.
 */
export function planetLevelFromSessionCount(
  completedSessions: number,
): DisplayLevel {
  const count = Math.max(0, completedSessions);
  let level: DisplayLevel = 1;
  for (const candidate of [5, 4, 3, 2, 1] as const) {
    if (count >= PLANET_LEVEL_THRESHOLDS[candidate]) {
      level = candidate;
      break;
    }
  }
  return level;
}
