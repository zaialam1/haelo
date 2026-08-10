/**
 * Gamification core tests — eligibility, planet stages, weekly goal,
 * discoveries, milestones, orbit reward uniqueness, experiment counting.
 */
import assert from "node:assert/strict";
import {
  isEligibleReflection,
  countsTowardWeeklyGoal,
  isExperimentTry,
} from "../src/lib/gamification/eligibility";
import {
  evolutionStageFromExperience,
  reflectionsUntilNextStage,
  planetEvolutionTeaser,
  detectStageChanges,
} from "../src/lib/gamification/planetGrowth";
import { PLANET_STAGE_THRESHOLDS, WEEKLY_VOICE_GOAL } from "../src/lib/gamification/config";
import { weekKeyFromDate, isCurrentWeekKey } from "../src/lib/gamification/week";
import {
  evaluateCelestialDiscoveries,
  planetCounts,
} from "../src/lib/gamification/discoveries";
import {
  evaluateMilestones,
  detectSkillRangeShift,
} from "../src/lib/gamification/milestones";
import {
  orbitRewardKey,
  orbitRewardDefinition,
  CELESTIAL_CATALOG,
} from "../src/lib/gamification/catalog";
import {
  countsTowardPlanetExperience,
  countsTowardPlanetProgression,
} from "../src/lib/sessions/sourcePolicy";
import { planetLevelFromSessionCount } from "../src/lib/prompts/config";

console.log("gamification tests…");

// --- Eligibility ---
assert.equal(
  isEligibleReflection({ status: "completed", source: "planet" }),
  true,
);
assert.equal(
  isEligibleReflection({ status: "completed", source: "orbit" }),
  true,
);
assert.equal(
  isEligibleReflection({ status: "completed", source: "daily" }),
  true,
);
assert.equal(
  isEligibleReflection({ status: "in_progress", source: "planet" }),
  false,
  "abandoned / in-progress must not count",
);
assert.equal(
  isEligibleReflection({
    status: "completed",
    source: "planet",
    isExperimentSession: true,
  }),
  false,
  "experiment-only sessions must not count as normal reflections",
);
assert.equal(
  countsTowardWeeklyGoal({ status: "completed", source: "orbit" }),
  true,
);
assert.equal(isExperimentTry(null), false);
assert.equal(isExperimentTry("2026-08-07T12:00:00Z"), true);

// --- Planet progression isolation (Orbit) ---
assert.equal(countsTowardPlanetProgression("orbit"), false);
assert.equal(countsTowardPlanetExperience("orbit"), true);
assert.equal(planetLevelFromSessionCount(42), 5);
assert.equal(evolutionStageFromExperience(42), 5);

// Orbit must not advance prompt unlock
const progressionOnly = 5;
assert.equal(planetLevelFromSessionCount(progressionOnly), 2);
// Visual can include orbit extras
assert.equal(evolutionStageFromExperience(progressionOnly + 3), 3);

// --- Stage thresholds ---
assert.equal(evolutionStageFromExperience(0), 1);
assert.equal(evolutionStageFromExperience(PLANET_STAGE_THRESHOLDS[2]), 2);
assert.equal(evolutionStageFromExperience(PLANET_STAGE_THRESHOLDS[3]), 3);
assert.equal(evolutionStageFromExperience(PLANET_STAGE_THRESHOLDS[4]), 4);
assert.equal(evolutionStageFromExperience(PLANET_STAGE_THRESHOLDS[5]), 5);
assert.equal(
  evolutionStageFromExperience(PLANET_STAGE_THRESHOLDS[3] - 1),
  2,
);

// Threshold crossing is exact once
const before = { express: 0, stand: 2, connect: 0, explore: 0 };
const after = { express: 0, stand: 3, connect: 0, explore: 0 };
const changes = detectStageChanges(before, after);
assert.equal(changes.length, 1);
assert.equal(changes[0]!.planet, "stand");
assert.equal(changes[0]!.stage, 2);
assert.equal(changes[0]!.previousStage, 1);
// Same counts again → no change
assert.equal(detectStageChanges(after, after).length, 0);

// Teaser mystery — no visual upgrade spoilers
const teaser = planetEvolutionTeaser("stand", 1);
assert.ok(teaser.hint);
assert.ok(!/level|stage|glow|ring|moon/i.test(teaser.hint!));
assert.equal(reflectionsUntilNextStage(1), PLANET_STAGE_THRESHOLDS[2] - 1);

const near = planetEvolutionTeaser("stand", PLANET_STAGE_THRESHOLDS[2] - 1);
assert.match(near.hint ?? "", /close to changing/i);

// --- Weekly goal ---
assert.equal(WEEKLY_VOICE_GOAL, 3);
const week = weekKeyFromDate(new Date(2026, 7, 7)); // Fri Aug 7 2026 local
assert.match(week, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(isCurrentWeekKey(weekKeyFromDate()), true);

// Simulated weekly contributions: unique sessions only
const contrib = new Set<string>();
function addWeekly(sessionId: string): number {
  if (contrib.has(sessionId)) return contrib.size;
  contrib.add(sessionId);
  return contrib.size;
}
assert.equal(addWeekly("s1"), 1);
assert.equal(addWeekly("s1"), 1, "retry / refresh must not double count");
assert.equal(addWeekly("s2"), 2);
assert.equal(addWeekly("s3"), 3);
assert.ok(contrib.size >= WEEKLY_VOICE_GOAL);

// --- Discoveries ---
const fakeSessions = [
  {
    id: "1",
    user_id: "u",
    planet: "stand" as const,
    status: "completed",
    source: "planet",
    completed_at: "2026-01-01",
    created_at: "2026-01-01",
    orbit_key: null,
    orbit_question_key: null,
    user_orbit_progress_id: null,
    experiment_tried_at: null,
  },
  {
    id: "2",
    user_id: "u",
    planet: "connect" as const,
    status: "completed",
    source: "planet",
    completed_at: "2026-01-02",
    created_at: "2026-01-02",
    orbit_key: null,
    orbit_question_key: null,
    user_orbit_progress_id: null,
    experiment_tried_at: null,
  },
  {
    id: "3",
    user_id: "u",
    planet: "explore" as const,
    status: "completed",
    source: "orbit",
    completed_at: "2026-01-03",
    created_at: "2026-01-03",
    orbit_key: "x",
    orbit_question_key: "q",
    user_orbit_progress_id: "p",
    experiment_tried_at: null,
  },
  {
    id: "4",
    user_id: "u",
    planet: "express" as const,
    status: "completed",
    source: "planet",
    completed_at: "2026-01-04",
    created_at: "2026-01-04",
    orbit_key: null,
    orbit_question_key: null,
    user_orbit_progress_id: null,
    experiment_tried_at: "2026-01-04",
  },
];

const counts = planetCounts(fakeSessions);
assert.equal(counts.stand, 1);
assert.equal(counts.connect, 1);
assert.equal(counts.explore, 1);
assert.equal(counts.express, 1);

const discovered = evaluateCelestialDiscoveries({
  supabase: {} as never,
  userId: "u",
  event: { type: "session_completed", sessionId: "4" },
  eligibleSessions: fakeSessions,
  experienceByPlanet: counts,
  completedOrbitProgressIds: ["p"],
  completedOrbitKeys: ["x"],
  completedRegions: ["speaking_up"],
  weeklyGoalsCompletedAllTime: 3,
  experimentCount: 1,
  existingRewardKeys: new Set(),
});

const keys = new Set(discovered.map((d) => d.rewardKey));
assert.ok(keys.has("four_winds"));
assert.ok(keys.has("first_orbit_moon"));
assert.ok(keys.has("experiment_spark"));
assert.ok(keys.has("weekly_triad"));
assert.ok(keys.has("region_speaking_up"));

// Idempotent: already unlocked skipped
const again = evaluateCelestialDiscoveries({
  supabase: {} as never,
  userId: "u",
  event: { type: "session_completed", sessionId: "4" },
  eligibleSessions: fakeSessions,
  experienceByPlanet: counts,
  completedOrbitProgressIds: ["p"],
  completedOrbitKeys: ["x"],
  completedRegions: ["speaking_up"],
  weeklyGoalsCompletedAllTime: 3,
  experimentCount: 1,
  existingRewardKeys: keys,
});
assert.equal(again.length, 0, "already-unlocked rewards must not duplicate");

// Orbit reward catalog uniqueness
const orbKey = orbitRewardKey("speaking_up_saying_no");
assert.equal(orbKey, "orbit_artifact:speaking_up_saying_no");
const def = orbitRewardDefinition("speaking_up_saying_no", "Saying No");
assert.equal(def.rewardKey, orbKey);
assert.ok(def.title.length > 0);
assert.ok(CELESTIAL_CATALOG.first_orbit_moon);

// --- Milestones ---
const milestones = evaluateMilestones({
  event: { type: "session_completed", sessionId: "1" },
  eligibleSessions: fakeSessions,
  experienceByPlanet: counts,
  completedOrbitCount: 1,
  completedRegions: ["speaking_up"],
  experimentCount: 1,
  weeklyGoalsCompletedAllTime: 0,
  existingMilestoneKeys: new Set(),
  metricSamples: [],
});
const mKeys = new Set(milestones.map((m) => m.milestoneKey));
assert.ok(mKeys.has("first_session"));
assert.ok(mKeys.has("first_all_planets"));
assert.ok(mKeys.has("first_orbit"));
assert.ok(mKeys.has("first_experiment"));
assert.ok(
  milestones.every((m) => !/\d{2,3}/.test(m.body) || /twenty|fifty/i.test(m.body)),
  "milestone copy should not expose raw scores",
);

// Skill milestone requires evidence
const noShift = detectSkillRangeShift(
  [
    {
      sessionId: "a",
      planet: "stand",
      recordedAt: "2026-01-01",
      metric: "directness",
      score: 40,
    },
    {
      sessionId: "b",
      planet: "stand",
      recordedAt: "2026-01-02",
      metric: "directness",
      score: 42,
    },
  ],
  "directness",
);
assert.equal(noShift.shifted, false, "insufficient sample must not trigger");

const baseline = [30, 32, 31].map((score, i) => ({
  sessionId: `b${i}`,
  planet: "stand" as const,
  recordedAt: `2026-01-0${i + 1}`,
  metric: "directness" as const,
  score,
}));
const recent = [55, 58, 60, 62].map((score, i) => ({
  sessionId: `r${i}`,
  planet: "stand" as const,
  recordedAt: `2026-02-0${i + 1}`,
  metric: "directness" as const,
  score,
}));
const shift = detectSkillRangeShift([...baseline, ...recent], "directness");
assert.equal(shift.shifted, true);

// 10 stand reflections → stand lantern eligibility
const standHeavy = Array.from({ length: 10 }, (_, i) => ({
  id: `st${i}`,
  user_id: "u",
  planet: "stand" as const,
  status: "completed",
  source: "planet",
  completed_at: `2026-03-0${(i % 9) + 1}`,
  created_at: `2026-03-0${(i % 9) + 1}`,
  orbit_key: null,
  orbit_question_key: null,
  user_orbit_progress_id: null,
  experiment_tried_at: null,
}));
const standDiscoveries = evaluateCelestialDiscoveries({
  supabase: {} as never,
  userId: "u",
  event: { type: "session_completed", sessionId: "st9" },
  eligibleSessions: standHeavy,
  experienceByPlanet: planetCounts(standHeavy),
  completedOrbitProgressIds: [],
  completedOrbitKeys: [],
  completedRegions: [],
  weeklyGoalsCompletedAllTime: 0,
  experimentCount: 0,
  existingRewardKeys: new Set(),
});
assert.ok(standDiscoveries.some((d) => d.rewardKey === "stand_lantern"));
assert.ok(standDiscoveries.some((d) => d.rewardKey === "first_evolution_bloom"));

console.log("gamification tests passed.");
