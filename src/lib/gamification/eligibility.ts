/**
 * Single source of truth: what counts as an eligible reflection
 * for weekly goal, planet visual growth, and exploration milestones.
 */

import type { SessionSource } from "@/lib/sessions/types";
import { countsTowardPlanetExperience } from "@/lib/sessions/sourcePolicy";

export type EligibilityContext = {
  status: string | null | undefined;
  source: SessionSource | string | null | undefined;
  /** True when this row is an experiment-only session (future). */
  isExperimentSession?: boolean;
  /**
   * Orbit canonical filter: when checking a set of orbit sessions for the
   * same question, only the earliest completed counts. Callers apply that
   * filter before asking isEligibleReflection when needed.
   */
};

/**
 * A completed canonical voice response.
 *
 * Counts:
 * - planet / daily / orbit completed sessions
 *
 * Does NOT count:
 * - drafts / abandoned recordings
 * - in-progress sessions
 * - experiment-only companion sessions (if introduced)
 * - Orbit summative analysis (not a session)
 *
 * Note: attempt 2 on the same session does not create a second unit —
 * the session itself is the unit, completed once.
 */
export function isEligibleReflection(ctx: EligibilityContext): boolean {
  if (ctx.status !== "completed") return false;
  if (ctx.isExperimentSession) return false;
  return countsTowardPlanetExperience(ctx.source);
}

/** Eligible for weekly voice goal (same rule as eligible reflection). */
export function countsTowardWeeklyGoal(ctx: EligibilityContext): boolean {
  return isEligibleReflection(ctx);
}

/** Eligible for planet visual experience (existing source policy). */
export function countsTowardPlanetVisualGrowth(
  ctx: EligibilityContext,
): boolean {
  return isEligibleReflection(ctx);
}

/**
 * Try the Experiment acknowledgments — intentional coaching retry.
 * Does not count as a new eligible reflection.
 */
export function isExperimentTry(experimentTriedAt: string | null | undefined): boolean {
  return Boolean(experimentTriedAt);
}
