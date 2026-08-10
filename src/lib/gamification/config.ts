/**
 * Central gamification configuration.
 * Thresholds and rules live here — not scattered across components.
 */

import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";

/** Weekly voice moments target (Mon–Sun local week). */
export const WEEKLY_VOICE_GOAL = 3;

/**
 * Visual planet evolution thresholds (experience sessions).
 * Separate from prompt unlock (PLANET_LEVEL_THRESHOLDS in prompts/config).
 *
 * Kept close to the existing visual stage pacing so current art reads well,
 * while remaining independently tunable as Orbit practice adds volume.
 */
export const PLANET_STAGE_THRESHOLDS: Record<PlanetEvolutionLevel, number> = {
  1: 0,
  2: 3,
  3: 8,
  4: 15,
  5: 25,
};

/** Reflections remaining at/below this count → “close to changing” copy. */
export const PLANET_EVOLUTION_CLOSE_REMAINING = 2;

/** Min canonical sessions before introducing the weekly constellation UI. */
export const WEEKLY_GOAL_INTRO_AFTER_SESSIONS = 2;

/** Min sample for skill-trend milestones. */
export const SKILL_MILESTONE_MIN_RECENT = 4;
export const SKILL_MILESTONE_MIN_BASELINE = 3;

/** Score delta (1–100 internal) required for a skill-range milestone. */
export const SKILL_MILESTONE_MIN_DELTA = 12;

/** Max immediate reveals to surface after one completion path. */
export const MAX_IMMEDIATE_REVEALS = 2;

export const PLANET_IDS: readonly VoicePlanetId[] = [
  "connect",
  "stand",
  "explore",
  "express",
] as const;

export const gamificationConfig = {
  weeklyGoal: WEEKLY_VOICE_GOAL,
  planetStageThresholds: PLANET_STAGE_THRESHOLDS,
  planetEvolutionCloseRemaining: PLANET_EVOLUTION_CLOSE_REMAINING,
  weeklyGoalIntroAfterSessions: WEEKLY_GOAL_INTRO_AFTER_SESSIONS,
  skillMilestoneMinRecent: SKILL_MILESTONE_MIN_RECENT,
  skillMilestoneMinBaseline: SKILL_MILESTONE_MIN_BASELINE,
  skillMilestoneMinDelta: SKILL_MILESTONE_MIN_DELTA,
  maxImmediateReveals: MAX_IMMEDIATE_REVEALS,
} as const;
