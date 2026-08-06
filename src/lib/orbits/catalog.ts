import { FRIENDSHIPS_PEOPLE_ORBITS } from "./content/friendshipsPeople";
import { FIGURING_THINGS_OUT_ORBITS } from "./content/figuringThingsOut";
import { PUTTING_YOURSELF_OUT_THERE_ORBITS } from "./content/puttingYourselfOutThere";
import { SPEAKING_UP_ORBITS } from "./content/speakingUp";
import type { Planet } from "@/lib/prompts";
import type {
  OrbitDefinition,
  OrbitQuestionDefinition,
  OrbitRegionKey,
} from "./types";

export const ALL_ORBITS: readonly OrbitDefinition[] = [
  ...FRIENDSHIPS_PEOPLE_ORBITS,
  ...SPEAKING_UP_ORBITS,
  ...FIGURING_THINGS_OUT_ORBITS,
  ...PUTTING_YOURSELF_OUT_THERE_ORBITS,
];

export const ALL_ORBIT_QUESTIONS: readonly OrbitQuestionDefinition[] =
  ALL_ORBITS.flatMap((orbit) => [...orbit.questions]);

const ORBITS_BY_KEY = new Map(
  ALL_ORBITS.map((orbit) => [orbit.orbitKey, orbit] as const),
);

const QUESTIONS_BY_KEY = new Map(
  ALL_ORBIT_QUESTIONS.map((q) => [q.questionKey, q] as const),
);

export function getOrbitByKey(orbitKey: string): OrbitDefinition | undefined {
  return ORBITS_BY_KEY.get(orbitKey);
}

export function getOrbitQuestionByKey(
  questionKey: string,
): OrbitQuestionDefinition | undefined {
  return QUESTIONS_BY_KEY.get(questionKey);
}

export function getActiveOrbits(): OrbitDefinition[] {
  return ALL_ORBITS.filter((o) => o.isActive).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
  );
}

export function getOrbitsByRegion(
  regionKey: OrbitRegionKey,
  opts?: { activeOnly?: boolean },
): OrbitDefinition[] {
  const activeOnly = opts?.activeOnly ?? true;
  return ALL_ORBITS.filter(
    (o) =>
      o.regionKey === regionKey && (!activeOnly || o.isActive),
  ).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Ordered planet sequence derived from questions (single source of truth). */
export function getOrbitPlanetSequence(orbit: OrbitDefinition): Planet[] {
  return [...orbit.questions]
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    .map((q) => q.planet);
}

/** Unique planets involved, preserving first-appearance order. */
export function getOrbitPlanetsInvolved(orbit: OrbitDefinition): Planet[] {
  const seen = new Set<Planet>();
  const result: Planet[] = [];
  for (const planet of getOrbitPlanetSequence(orbit)) {
    if (seen.has(planet)) continue;
    seen.add(planet);
    result.push(planet);
  }
  return result;
}

export function getOrbitQuestion(
  orbit: OrbitDefinition,
  sequenceNumber: number,
): OrbitQuestionDefinition | undefined {
  return orbit.questions.find((q) => q.sequenceNumber === sequenceNumber);
}

/** Human-readable estimate shown in Orbit UI. */
export function formatOrbitDuration(orbit: OrbitDefinition): string {
  return `About ${orbit.estimatedMinutes} minutes`;
}
