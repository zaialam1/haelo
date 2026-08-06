import type { SessionSource } from "@/lib/sessions/types";

/**
 * Sources that advance normal planet prompt unlock / level selection.
 * Orbit sessions practice the skill but must NOT unlock harder curriculum prompts.
 *
 * Daily currently still counts (legacy behavior) — only Orbit is excluded.
 */
export const PLANET_PROGRESSION_SOURCES: readonly SessionSource[] = [
  "planet",
  "daily",
] as const;

/**
 * Sources that contribute to visual planet growth / experience.
 * Orbit questions genuinely practice the planet skill.
 */
export const PLANET_EXPERIENCE_SOURCES: readonly SessionSource[] = [
  "planet",
  "daily",
  "orbit",
] as const;

export function countsTowardPlanetProgression(
  source: SessionSource | string | null | undefined,
): boolean {
  return (
    source === "planet" ||
    source === "daily" ||
    // Unknown/null treated as planet for legacy rows.
    source == null ||
    source === ""
  );
}

export function countsTowardPlanetExperience(
  source: SessionSource | string | null | undefined,
): boolean {
  return (
    source === "planet" ||
    source === "daily" ||
    source === "orbit" ||
    source == null ||
    source === ""
  );
}
