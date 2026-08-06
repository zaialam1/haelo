/**
 * Proves Orbit completions do not advance normal planet prompt unlock.
 *
 * Haelo uses completed session counts (filtered by source) → display level,
 * not a sequential question index. This test mirrors resolvePlanetSessionPrompt
 * counting rules.
 */
import assert from "node:assert/strict";
import { planetLevelFromSessionCount } from "../src/lib/prompts/config";
import {
  countsTowardPlanetExperience,
  countsTowardPlanetProgression,
} from "../src/lib/sessions/sourcePolicy";

type FakeSession = {
  planet: string;
  status: "completed" | "in_progress";
  source: "planet" | "daily" | "orbit";
};

function progressionCount(sessions: FakeSession[], planet: string): number {
  return sessions.filter(
    (s) =>
      s.planet === planet &&
      s.status === "completed" &&
      countsTowardPlanetProgression(s.source),
  ).length;
}

function experienceCount(sessions: FakeSession[], planet: string): number {
  return sessions.filter(
    (s) =>
      s.planet === planet &&
      s.status === "completed" &&
      countsTowardPlanetExperience(s.source),
  ).length;
}

// User has completed 42 normal Stand planet sessions.
const baseline: FakeSession[] = Array.from({ length: 42 }, () => ({
  planet: "stand",
  status: "completed" as const,
  source: "planet" as const,
}));

assert.equal(progressionCount(baseline, "stand"), 42);
assert.equal(planetLevelFromSessionCount(42), 5);

// Complete three Stand-tagged Orbit questions.
const afterOrbits: FakeSession[] = [
  ...baseline,
  {
    planet: "stand",
    status: "completed",
    source: "orbit",
  },
  {
    planet: "stand",
    status: "completed",
    source: "orbit",
  },
  {
    planet: "stand",
    status: "completed",
    source: "orbit",
  },
];

assert.equal(
  progressionCount(afterOrbits, "stand"),
  42,
  "Orbit sessions must not increment planet progression count",
);
assert.equal(
  experienceCount(afterOrbits, "stand"),
  45,
  "Orbit sessions should still count toward planet experience / visual growth",
);
assert.equal(
  planetLevelFromSessionCount(progressionCount(afterOrbits, "stand")),
  planetLevelFromSessionCount(42),
  "Planet level unlock must be unchanged after Orbit completions",
);

// Daily still counts toward progression (legacy behavior preserved).
const withDaily: FakeSession[] = [
  ...baseline,
  { planet: "stand", status: "completed", source: "daily" },
];
assert.equal(progressionCount(withDaily, "stand"), 43);

console.log("OK — Orbit sessions do not advance planet progression; experience still grows.\n");
