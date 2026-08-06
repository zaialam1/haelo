import { isPlanet } from "@/lib/prompts";
import { ALL_ORBITS, ALL_ORBIT_QUESTIONS } from "./catalog";
import { ORBIT_REGIONS, ORBIT_REGION_KEYS } from "./regions";
import type { OrbitDefinition, OrbitRegionKey } from "./types";

export type OrbitValidationIssue = {
  code: string;
  message: string;
  orbitKey?: string;
  questionKey?: string;
};

export type OrbitValidationResult = {
  ok: boolean;
  issues: OrbitValidationIssue[];
  counts: {
    regions: number;
    orbits: number;
    questions: number;
    perRegion: Record<OrbitRegionKey, number>;
  };
};

const REQUIRED_SEQUENCES = [1, 2, 3, 4, 5, 6] as const;

/**
 * Content integrity checks for the Orbit bank.
 * Protects structure: 4 regions × 10 orbits × 6 questions.
 */
export function validateOrbitContent(
  orbits: readonly OrbitDefinition[] = ALL_ORBITS,
): OrbitValidationResult {
  const issues: OrbitValidationIssue[] = [];
  const perRegion = Object.fromEntries(
    ORBIT_REGION_KEYS.map((k) => [k, 0]),
  ) as Record<OrbitRegionKey, number>;

  if (ORBIT_REGIONS.length !== 4) {
    issues.push({
      code: "region_count",
      message: `Expected exactly 4 regions, found ${ORBIT_REGIONS.length}.`,
    });
  }

  const regionKeys = new Set<string>();
  for (const region of ORBIT_REGIONS) {
    if (regionKeys.has(region.key)) {
      issues.push({
        code: "duplicate_region_key",
        message: `Duplicate region key: ${region.key}`,
      });
    }
    regionKeys.add(region.key);
  }

  if (orbits.length !== 40) {
    issues.push({
      code: "orbit_count",
      message: `Expected exactly 40 orbits, found ${orbits.length}.`,
    });
  }

  const orbitKeys = new Set<string>();
  const questionKeys = new Set<string>();
  let questionTotal = 0;

  for (const orbit of orbits) {
    perRegion[orbit.regionKey] = (perRegion[orbit.regionKey] ?? 0) + 1;

    if (orbitKeys.has(orbit.orbitKey)) {
      issues.push({
        code: "duplicate_orbit_key",
        message: `Duplicate orbit key: ${orbit.orbitKey}`,
        orbitKey: orbit.orbitKey,
      });
    }
    orbitKeys.add(orbit.orbitKey);

    if (!regionKeys.has(orbit.regionKey)) {
      issues.push({
        code: "invalid_region",
        message: `Unknown regionKey: ${orbit.regionKey}`,
        orbitKey: orbit.orbitKey,
      });
    }

    if (orbit.questionCount !== 6) {
      issues.push({
        code: "question_count_field",
        message: `questionCount must be 6, found ${orbit.questionCount}`,
        orbitKey: orbit.orbitKey,
      });
    }

    if (orbit.questions.length !== 6) {
      issues.push({
        code: "question_count",
        message: `Expected 6 questions, found ${orbit.questions.length}`,
        orbitKey: orbit.orbitKey,
      });
    }

    if (!orbit.completionAnalysisEnabled) {
      issues.push({
        code: "completion_analysis",
        message: "completionAnalysisEnabled must be true",
        orbitKey: orbit.orbitKey,
      });
    }

    const sequences = orbit.questions.map((q) => q.sequenceNumber).sort();
    for (const n of REQUIRED_SEQUENCES) {
      if (!sequences.includes(n)) {
        issues.push({
          code: "missing_sequence",
          message: `Missing sequence number ${n}`,
          orbitKey: orbit.orbitKey,
        });
      }
    }
    if (new Set(sequences).size !== sequences.length) {
      issues.push({
        code: "duplicate_sequence",
        message: "Duplicate sequence numbers within orbit",
        orbitKey: orbit.orbitKey,
      });
    }

    for (const q of orbit.questions) {
      questionTotal += 1;

      if (questionKeys.has(q.questionKey)) {
        issues.push({
          code: "duplicate_question_key",
          message: `Duplicate question key: ${q.questionKey}`,
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }
      questionKeys.add(q.questionKey);

      const expectedKey = `${orbit.orbitKey}_q${String(q.sequenceNumber).padStart(2, "0")}`;
      if (q.questionKey !== expectedKey) {
        issues.push({
          code: "question_key_pattern",
          message: `Expected questionKey ${expectedKey}, found ${q.questionKey}`,
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }

      if (!isPlanet(q.planet)) {
        issues.push({
          code: "invalid_planet",
          message: `Invalid planet: ${q.planet}`,
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }

      if (q.sourceType !== "orbit") {
        issues.push({
          code: "source_type",
          message: `sourceType must be "orbit"`,
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }

      if (q.normalProgressionImpact !== "none") {
        issues.push({
          code: "progression_impact",
          message: `normalProgressionImpact must be "none"`,
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }

      if (!q.individualAnalysisEnabled) {
        issues.push({
          code: "individual_analysis",
          message: "individualAnalysisEnabled must be true",
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }

      if (!q.prompt.trim() || !q.explanation.trim()) {
        issues.push({
          code: "empty_copy",
          message: "prompt and explanation must be non-empty",
          orbitKey: orbit.orbitKey,
          questionKey: q.questionKey,
        });
      }
    }
  }

  for (const regionKey of ORBIT_REGION_KEYS) {
    if (perRegion[regionKey] !== 10) {
      issues.push({
        code: "orbits_per_region",
        message: `Region ${regionKey} expected 10 orbits, found ${perRegion[regionKey]}`,
      });
    }
  }

  if (questionTotal !== 240) {
    issues.push({
      code: "total_questions",
      message: `Expected exactly 240 questions, found ${questionTotal}`,
    });
  }

  // Ensure catalog flat list matches (when validating default bank).
  if (orbits === ALL_ORBITS && ALL_ORBIT_QUESTIONS.length !== 240) {
    issues.push({
      code: "catalog_questions",
      message: `ALL_ORBIT_QUESTIONS length ${ALL_ORBIT_QUESTIONS.length} !== 240`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      regions: ORBIT_REGIONS.length,
      orbits: orbits.length,
      questions: questionTotal,
      perRegion,
    },
  };
}
