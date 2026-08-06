/**
 * Journey ↔ Orbit integration tests (no network).
 *
 * Run: npx tsx scripts/test-journey-orbit-integration.ts
 */

import assert from "node:assert/strict";
import {
  buildOrbitClusterSessions,
  orderOrbitResponses,
  projectJourneySessions,
  selectCanonicalOrbitIndividuals,
} from "../src/lib/journey/orbitClusters";
import {
  getJourneyNodeVariant,
  type JourneySession,
} from "../src/lib/journey/types";
import type {
  OrbitSummativeAnalysisRow,
  UserOrbitProgressRow,
} from "../src/lib/orbits/types";

const ORBIT_KEY = "speaking_up_draw_the_line";
const PROGRESS_ID = "progress-draw-the-line";

function baseSession(
  overrides: Partial<JourneySession> &
    Pick<JourneySession, "sessionId" | "planet" | "prompt" | "recordedAt">,
): JourneySession {
  return {
    planetLabel:
      overrides.planet === "uncategorized"
        ? "Earlier session"
        : overrides.planet.charAt(0).toUpperCase() + overrides.planet.slice(1),
    promptId: null,
    sessionType: "main",
    clips: [],
    userReflection: null,
    haeloObservation: null,
    voiceNotes: [],
    themeLabel: null,
    changeObservation: null,
    isMilestone: false,
    isOrbitCluster: false,
    ...overrides,
  };
}

function orbitResponse(opts: {
  id: string;
  planet: JourneySession["planet"];
  questionKey: string;
  seq: number;
  recordedAt: string;
  progressId?: string;
}): JourneySession {
  return baseSession({
    sessionId: opts.id,
    planet: opts.planet,
    prompt: `Prompt for ${opts.questionKey}`,
    recordedAt: opts.recordedAt,
    sourceType: "orbit",
    orbitKey: ORBIT_KEY,
    orbitQuestionKey: opts.questionKey,
    orbitTitle: "Draw the Line",
    userOrbitProgressId: opts.progressId ?? PROGRESS_ID,
    orbitSequenceNumber: opts.seq,
  });
}

function planetSession(opts: {
  id: string;
  planet: JourneySession["planet"];
  recordedAt: string;
}): JourneySession {
  return baseSession({
    sessionId: opts.id,
    planet: opts.planet,
    prompt: "Normal planet prompt",
    recordedAt: opts.recordedAt,
    sourceType: "planet",
  });
}

const Q1 = orbitResponse({
  id: "q1",
  planet: "explore",
  questionKey: `${ORBIT_KEY}_q01`,
  seq: 1,
  recordedAt: "2026-08-01T12:00:00.000Z",
});
const Q2 = orbitResponse({
  id: "q2",
  planet: "explore",
  questionKey: `${ORBIT_KEY}_q02`,
  seq: 2,
  recordedAt: "2026-08-01T13:00:00.000Z",
});
const Q3 = orbitResponse({
  id: "q3",
  planet: "express",
  questionKey: `${ORBIT_KEY}_q03`,
  seq: 3,
  recordedAt: "2026-08-02T12:00:00.000Z",
});
const Q4 = orbitResponse({
  id: "q4",
  planet: "stand",
  questionKey: `${ORBIT_KEY}_q04`,
  seq: 4,
  recordedAt: "2026-08-02T13:00:00.000Z",
});
const Q5 = orbitResponse({
  id: "q5",
  planet: "stand",
  questionKey: `${ORBIT_KEY}_q05`,
  seq: 5,
  recordedAt: "2026-08-03T12:00:00.000Z",
});
const Q6 = orbitResponse({
  id: "q6",
  planet: "connect",
  questionKey: `${ORBIT_KEY}_q06`,
  seq: 6,
  recordedAt: "2026-08-03T13:00:00.000Z",
});

const NORMAL = planetSession({
  id: "planet-1",
  planet: "stand",
  recordedAt: "2026-07-20T12:00:00.000Z",
});

const completedProgress: UserOrbitProgressRow = {
  id: PROGRESS_ID,
  user_id: "user-1",
  orbit_key: ORBIT_KEY,
  status: "completed",
  current_question_index: 6,
  started_at: "2026-08-01T12:00:00.000Z",
  last_activity_at: "2026-08-03T13:00:00.000Z",
  completed_at: "2026-08-03T13:05:00.000Z",
  summative_analysis_id: "sum-1",
  orbit_version: 1,
  orbit_title_snapshot: "Draw the Line",
  created_at: "2026-08-01T12:00:00.000Z",
  updated_at: "2026-08-03T13:05:00.000Z",
};

const summativeReady: OrbitSummativeAnalysisRow = {
  id: "sum-1",
  user_id: "user-1",
  orbit_key: ORBIT_KEY,
  user_orbit_progress_id: PROGRESS_ID,
  status: "ready",
  analysis_json: {
    whatBecameClearer: "Clearer",
    whatKeptComingUp: "Coming up",
    howYourVoiceMoved: "Moved",
    carryThisWithYou: "Carry",
  },
  practice_prompt: null,
  model_metadata: null,
  version: 1,
  created_at: "2026-08-03T13:05:00.000Z",
  completed_at: "2026-08-03T13:06:00.000Z",
};

let passed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    throw err;
  }
}

// Case 1 — Partial Orbit
test("Case 1: partial Orbit shows in planet Journey, not master cluster", () => {
  const sessions = [NORMAL, Q1, Q2];
  const explore = projectJourneySessions(sessions, "explore");
  assert.equal(explore.length, 2);
  assert.ok(explore.every((s) => s.sourceType === "orbit"));
  assert.ok(explore.every((s) => !s.isOrbitCluster));

  const master = projectJourneySessions(sessions, "all");
  assert.equal(master.length, 1);
  assert.equal(master[0]!.sessionId, "planet-1");
  assert.ok(!master.some((s) => s.isOrbitCluster));
  assert.ok(!master.some((s) => s.sourceType === "orbit"));
});

// Case 2 — Complete Orbit
test("Case 2: complete Orbit → planet nodes + exactly one master cluster", () => {
  const individuals = [NORMAL, Q1, Q2, Q3, Q4, Q5, Q6];
  const clusters = buildOrbitClusterSessions(
    individuals,
    [completedProgress],
    new Map([[PROGRESS_ID, summativeReady]]),
  );
  assert.equal(clusters.length, 1);
  const cluster = clusters[0]!;
  assert.equal(cluster.isOrbitCluster, true);
  assert.equal(cluster.orbitTitle, "Draw the Line");
  assert.equal(cluster.recordedAt, completedProgress.completed_at);
  assert.equal(cluster.orbitResponses?.length, 6);
  assert.equal(cluster.summativeStatus, "ready");
  assert.equal(cluster.summativeAnalysis?.whatBecameClearer, "Clearer");

  const allSessions = [...individuals, ...clusters];

  const master = projectJourneySessions(allSessions, "all");
  assert.equal(master.length, 2); // normal + cluster
  assert.equal(master.filter((s) => s.isOrbitCluster).length, 1);
  assert.equal(
    master.filter((s) => s.sourceType === "orbit" && !s.isOrbitCluster).length,
    0,
  );

  const explore = projectJourneySessions(allSessions, "explore");
  assert.equal(explore.length, 2);
  assert.ok(explore.every((s) => !s.isOrbitCluster));

  const express = projectJourneySessions(allSessions, "express");
  assert.equal(express.length, 1);

  const stand = projectJourneySessions(allSessions, "stand");
  assert.equal(stand.length, 3); // normal + q4 + q5

  const connect = projectJourneySessions(allSessions, "connect");
  assert.equal(connect.length, 1);
});

// Case 3 — Cluster detail sequence + planets
test("Case 3: cluster preserves sequence and planet tags", () => {
  const individuals = [Q6, Q1, Q4, Q2, Q5, Q3]; // shuffled
  const [cluster] = buildOrbitClusterSessions(
    individuals,
    [completedProgress],
    new Map([[PROGRESS_ID, summativeReady]]),
  );
  assert.ok(cluster);
  const ordered = orderOrbitResponses(cluster!.orbitResponses ?? [], ORBIT_KEY);
  assert.deepEqual(
    ordered.map((r) => r.orbitSequenceNumber),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    ordered.map((r) => r.planet),
    ["explore", "explore", "express", "stand", "stand", "connect"],
  );
});

// Case 4 — Retry / duplicate question sessions → canonical only
test("Case 4: duplicate Orbit question keeps earliest canonical only", () => {
  const retryDuplicate = orbitResponse({
    id: "q4-retry-session",
    planet: "stand",
    questionKey: `${ORBIT_KEY}_q04`,
    seq: 4,
    recordedAt: "2026-08-04T12:00:00.000Z", // later than Q4
  });
  const sessions = [Q4, retryDuplicate];
  const canonical = selectCanonicalOrbitIndividuals(sessions);
  assert.equal(canonical.length, 1);
  assert.equal(canonical[0]!.sessionId, "q4");

  const stand = projectJourneySessions(sessions, "stand");
  assert.equal(stand.length, 1);
  assert.equal(stand[0]!.sessionId, "q4");
});

// Case 5 — Incomplete progress does not create cluster
test("Case 5: in-progress Orbit never becomes master cluster", () => {
  const inProgress: UserOrbitProgressRow = {
    ...completedProgress,
    status: "in_progress",
    completed_at: null,
    current_question_index: 2,
  };
  const clusters = buildOrbitClusterSessions(
    [Q1, Q2],
    [inProgress],
    new Map(),
  );
  assert.equal(clusters.length, 0);
});

// Case 6 — Missing summative is graceful
test("Case 6: missing summative analysis does not break cluster", () => {
  const [cluster] = buildOrbitClusterSessions(
    [Q1, Q2, Q3, Q4, Q5, Q6],
    [completedProgress],
    new Map(),
  );
  assert.ok(cluster);
  assert.equal(cluster!.summativeStatus, "missing");
  assert.equal(cluster!.summativeAnalysis, null);
  assert.equal(cluster!.orbitResponses?.length, 6);
});

// Variant helper
test("getJourneyNodeVariant distinguishes normal / orbit / cluster", () => {
  assert.equal(getJourneyNodeVariant(NORMAL), "normal");
  assert.equal(getJourneyNodeVariant(Q1), "orbit");
  const [cluster] = buildOrbitClusterSessions(
    [Q1, Q2, Q3, Q4, Q5, Q6],
    [completedProgress],
    new Map([[PROGRESS_ID, summativeReady]]),
  );
  assert.equal(getJourneyNodeVariant(cluster!), "orbit_cluster");
});

console.log(`\n${passed} tests passed.`);
