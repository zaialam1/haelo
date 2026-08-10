import {
  PLANET_EVOLUTION_CLOSE_REMAINING,
  PLANET_STAGE_THRESHOLDS,
} from "@/lib/gamification/config";
import type {
  PlanetEvolutionTeaser,
  PlanetExperienceCounts,
} from "@/lib/gamification/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { PlanetEvolutionLevel } from "@/lib/planets/evolution";
import { PLANET_EVOLUTION_LEVELS } from "@/lib/planets/evolution";

/**
 * Map planet visual experience count → evolution stage.
 * Uses gamification thresholds (not prompt unlock thresholds).
 */
export function evolutionStageFromExperience(
  experienceCount: number,
): PlanetEvolutionLevel {
  const count = Math.max(0, experienceCount);
  let level: PlanetEvolutionLevel = 1;
  for (const candidate of [5, 4, 3, 2, 1] as const) {
    if (count >= PLANET_STAGE_THRESHOLDS[candidate]) {
      level = candidate;
      break;
    }
  }
  return level;
}

export function nextStageThreshold(
  stage: PlanetEvolutionLevel,
): number | null {
  if (stage >= 5) return null;
  const next = (stage + 1) as PlanetEvolutionLevel;
  return PLANET_STAGE_THRESHOLDS[next];
}

export function reflectionsUntilNextStage(
  experienceCount: number,
): number | null {
  const stage = evolutionStageFromExperience(experienceCount);
  const next = nextStageThreshold(stage);
  if (next == null) return null;
  return Math.max(0, next - experienceCount);
}

/**
 * Mystery-preserving teaser — never names the next visual upgrade.
 */
export function planetEvolutionTeaser(
  planet: VoicePlanetId,
  experienceCount: number,
): PlanetEvolutionTeaser {
  const stage = evolutionStageFromExperience(experienceCount);
  const remaining = reflectionsUntilNextStage(experienceCount);

  let hint: string | null = null;
  if (remaining == null) {
    hint = null;
  } else if (remaining === 0) {
    hint = "Your planet is ready to change";
  } else if (remaining <= PLANET_EVOLUTION_CLOSE_REMAINING) {
    hint = "Your planet is close to changing";
  } else {
    hint = `${remaining} reflections until something changes`;
  }

  return {
    planet,
    stage,
    experienceCount,
    remainingToNext: remaining,
    hint,
  };
}

export function emptyPlanetExperience(): PlanetExperienceCounts {
  return { express: 0, stand: 0, connect: 0, explore: 0 };
}

export function stagesFromExperience(
  counts: PlanetExperienceCounts,
): Record<VoicePlanetId, PlanetEvolutionLevel> {
  return {
    express: evolutionStageFromExperience(counts.express),
    stand: evolutionStageFromExperience(counts.stand),
    connect: evolutionStageFromExperience(counts.connect),
    explore: evolutionStageFromExperience(counts.explore),
  };
}

export function detectStageChanges(
  before: PlanetExperienceCounts,
  after: PlanetExperienceCounts,
): Array<{
  planet: VoicePlanetId;
  stage: PlanetEvolutionLevel;
  previousStage: PlanetEvolutionLevel;
}> {
  const changes: Array<{
    planet: VoicePlanetId;
    stage: PlanetEvolutionLevel;
    previousStage: PlanetEvolutionLevel;
  }> = [];

  for (const planet of Object.keys(after) as VoicePlanetId[]) {
    const previousStage = evolutionStageFromExperience(before[planet] ?? 0);
    const stage = evolutionStageFromExperience(after[planet] ?? 0);
    if (stage > previousStage) {
      changes.push({ planet, stage, previousStage });
    }
  }
  return changes;
}

export { PLANET_EVOLUTION_LEVELS, PLANET_STAGE_THRESHOLDS };
