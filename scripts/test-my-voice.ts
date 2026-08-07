/**
 * Offline tests for My Voice thresholds, parsing, trends, and eligibility.
 */
import assert from "node:assert/strict";
import type { SessionWithAttempts } from "../src/lib/sessions/types";
import {
  decideMyVoiceRefresh,
  formatMyVoiceUpdatedLabel,
  MY_VOICE_BEGINNING_MAX_SESSIONS,
  MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS,
  MY_VOICE_NEW_SESSIONS_TO_REFRESH,
  myVoicePhaseFromSessionCount,
} from "../src/lib/myVoice/thresholds";
import {
  parseMyVoiceSummaryJson,
  assertMyVoiceLengthReasonable,
} from "../src/lib/myVoice/parse";
import { computeMetricTrend } from "../src/lib/myVoice/trends";
import {
  planetCoverageFromSessions,
  selectEligibleMyVoiceSessions,
} from "../src/lib/myVoice/evidence";
import { MY_VOICE_SYSTEM_PROMPT } from "../src/lib/myVoice/prompt";
import type { JourneyMetricResult } from "../src/lib/journey/metrics";

let passed = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`ok — ${name}`);
  } catch (e) {
    console.error(`FAIL — ${name}`);
    throw e;
  }
}

function session(partial: {
  id: string;
  planet?: "connect" | "stand" | "explore" | "express";
  source?: "planet" | "daily" | "orbit";
  status?: "completed" | "in_progress";
  completed_at?: string;
  orbit_question_key?: string | null;
  user_orbit_progress_id?: string | null;
}): SessionWithAttempts {
  return {
    id: partial.id,
    user_id: "user-1",
    planet: partial.planet ?? "stand",
    prompt_id: "p1",
    prompt_text_snapshot: "Say something",
    status: partial.status ?? "completed",
    source: partial.source ?? "planet",
    orbit_key: partial.source === "orbit" ? "figuring_things_out" : null,
    orbit_question_key: partial.orbit_question_key ?? null,
    user_orbit_progress_id: partial.user_orbit_progress_id ?? null,
    orbit_version: partial.source === "orbit" ? 1 : null,
    user_reflection: null,
    feeling_reflection: null,
    sounded_like_you: null,
    authenticity_choice: null,
    analysis_status: "ready",
    created_at: partial.completed_at ?? "2026-08-01T12:00:00.000Z",
    completed_at: partial.completed_at ?? "2026-08-01T12:00:00.000Z",
    session_attempts: [],
  };
}

function scored(metric: JourneyMetricResult["metric"], score: number): JourneyMetricResult {
  return {
    metric,
    score,
    level: 3,
    status: "scored",
  };
}

// --- Thresholds / phases ---

check("0 sessions → empty phase", () => {
  assert.equal(myVoicePhaseFromSessionCount(0), "empty");
});

check("1–4 sessions → beginning (no AI synthesis)", () => {
  assert.equal(MY_VOICE_BEGINNING_MAX_SESSIONS, 4);
  assert.equal(myVoicePhaseFromSessionCount(1), "beginning");
  assert.equal(myVoicePhaseFromSessionCount(2), "beginning");
  assert.equal(myVoicePhaseFromSessionCount(3), "beginning");
  assert.equal(myVoicePhaseFromSessionCount(4), "beginning");
});

check("5+ sessions → eligible for synthesis", () => {
  assert.equal(MY_VOICE_MIN_SESSIONS_FOR_SYNTHESIS, 5);
  assert.equal(myVoicePhaseFromSessionCount(5), "eligible");
  assert.equal(myVoicePhaseFromSessionCount(24), "eligible");
});

check("refresh: missing cache with enough history → generate", () => {
  const d = decideMyVoiceRefresh({
    eligibleSessionCount: 8,
    completedOrbitCount: 0,
    latestSessionAt: "2026-08-06T12:00:00.000Z",
    cached: null,
  });
  assert.equal(d.shouldGenerate, true);
  if (d.shouldGenerate) assert.equal(d.reason, "missing");
});

check("refresh: insufficient history never generates", () => {
  const d = decideMyVoiceRefresh({
    eligibleSessionCount: 3,
    completedOrbitCount: 1,
    latestSessionAt: "2026-08-06T12:00:00.000Z",
    cached: null,
  });
  assert.equal(d.shouldGenerate, false);
  if (!d.shouldGenerate) assert.equal(d.reason, "insufficient_history");
});

check("refresh: cache fresh under new-session threshold", () => {
  const d = decideMyVoiceRefresh({
    eligibleSessionCount: 10,
    completedOrbitCount: 1,
    latestSessionAt: "2026-08-06T12:00:00.000Z",
    cached: {
      sessionCountAtGeneration: 9,
      completedOrbitCountAtGeneration: 1,
      latestSessionAtGeneration: "2026-08-05T12:00:00.000Z",
      status: "ready",
    },
  });
  assert.equal(d.shouldGenerate, false);
  if (!d.shouldGenerate) assert.equal(d.reason, "cache_fresh");
});

check("refresh: enough new sessions triggers update", () => {
  assert.equal(MY_VOICE_NEW_SESSIONS_TO_REFRESH, 4);
  const d = decideMyVoiceRefresh({
    eligibleSessionCount: 14,
    completedOrbitCount: 1,
    latestSessionAt: "2026-08-06T12:00:00.000Z",
    cached: {
      sessionCountAtGeneration: 10,
      completedOrbitCountAtGeneration: 1,
      latestSessionAtGeneration: "2026-08-01T12:00:00.000Z",
      status: "ready",
    },
  });
  assert.equal(d.shouldGenerate, true);
  if (d.shouldGenerate) assert.equal(d.reason, "new_sessions");
});

check("refresh: new completed Orbit triggers update", () => {
  const d = decideMyVoiceRefresh({
    eligibleSessionCount: 12,
    completedOrbitCount: 2,
    latestSessionAt: "2026-08-06T12:00:00.000Z",
    cached: {
      sessionCountAtGeneration: 12,
      completedOrbitCountAtGeneration: 1,
      latestSessionAtGeneration: "2026-08-06T12:00:00.000Z",
      status: "ready",
    },
  });
  assert.equal(d.shouldGenerate, true);
  if (d.shouldGenerate) assert.equal(d.reason, "new_completed_orbit");
});

check("updated label is subtle and non-numeric-score", () => {
  assert.equal(formatMyVoiceUpdatedLabel(24), "Updated after 24 reflections");
  assert.doesNotMatch(formatMyVoiceUpdatedLabel(24), /\/100|%|score/i);
});

// --- Eligibility / orbit canonical / coverage ---

check("brand-new user: zero eligible sessions", () => {
  const eligible = selectEligibleMyVoiceSessions([]);
  assert.equal(eligible.length, 0);
});

check("orbit retries: only earliest canonical per question counts", () => {
  const eligible = selectEligibleMyVoiceSessions([
    session({
      id: "orbit-q1-first",
      source: "orbit",
      planet: "stand",
      orbit_question_key: "q1",
      user_orbit_progress_id: "prog-1",
      completed_at: "2026-08-01T10:00:00.000Z",
    }),
    session({
      id: "orbit-q1-retry-session",
      source: "orbit",
      planet: "stand",
      orbit_question_key: "q1",
      user_orbit_progress_id: "prog-1",
      completed_at: "2026-08-01T11:00:00.000Z",
    }),
    session({
      id: "orbit-q2",
      source: "orbit",
      planet: "explore",
      orbit_question_key: "q2",
      user_orbit_progress_id: "prog-1",
      completed_at: "2026-08-01T12:00:00.000Z",
    }),
    session({
      id: "planet-stand",
      source: "planet",
      planet: "stand",
      completed_at: "2026-08-02T12:00:00.000Z",
    }),
  ]);
  assert.equal(eligible.length, 3);
  assert.ok(eligible.some((s) => s.id === "orbit-q1-first"));
  assert.ok(!eligible.some((s) => s.id === "orbit-q1-retry-session"));
});

check("uneven coverage: Stand heavy, Connect zero", () => {
  const sessions = [
    ...Array.from({ length: 8 }, (_, i) =>
      session({
        id: `stand-${i}`,
        planet: "stand",
        completed_at: `2026-08-0${(i % 9) + 1}T12:00:00.000Z`,
      }),
    ),
    session({ id: "explore-1", planet: "explore", completed_at: "2026-08-10T12:00:00.000Z" }),
  ];
  const coverage = planetCoverageFromSessions(selectEligibleMyVoiceSessions(sessions));
  assert.equal(coverage.stand, 8);
  assert.equal(coverage.explore, 1);
  assert.equal(coverage.connect, 0);
  assert.equal(coverage.express, 0);
});

check("in-progress sessions are excluded", () => {
  const eligible = selectEligibleMyVoiceSessions([
    session({ id: "done", status: "completed" }),
    session({ id: "wip", status: "in_progress" }),
  ]);
  assert.equal(eligible.length, 1);
  assert.equal(eligible[0]!.id, "done");
});

// --- Trends (internal; no UI numbers) ---

check("metric trend insufficient under 4 samples", () => {
  const trend = computeMetricTrend("directness", [
    { recordedAt: "2026-08-01T00:00:00.000Z", metrics: [scored("directness", 40)] },
    { recordedAt: "2026-08-02T00:00:00.000Z", metrics: [scored("directness", 50)] },
  ]);
  assert.equal(trend.direction, "insufficient");
});

check("metric trend rising when recent median clearly higher", () => {
  const trend = computeMetricTrend("directness", [
    { recordedAt: "2026-08-01T00:00:00.000Z", metrics: [scored("directness", 35)] },
    { recordedAt: "2026-08-02T00:00:00.000Z", metrics: [scored("directness", 38)] },
    { recordedAt: "2026-08-03T00:00:00.000Z", metrics: [scored("directness", 40)] },
    { recordedAt: "2026-08-04T00:00:00.000Z", metrics: [scored("directness", 70)] },
    { recordedAt: "2026-08-05T00:00:00.000Z", metrics: [scored("directness", 72)] },
    { recordedAt: "2026-08-06T00:00:00.000Z", metrics: [scored("directness", 75)] },
  ]);
  assert.equal(trend.direction, "rising");
  assert.doesNotMatch(trend.note, /\b\d{2,3}\b/);
});

check("metric trend stable when periods similar", () => {
  const trend = computeMetricTrend("voice_confidence", [
    { recordedAt: "2026-08-01T00:00:00.000Z", metrics: [scored("voice_confidence", 55)] },
    { recordedAt: "2026-08-02T00:00:00.000Z", metrics: [scored("voice_confidence", 57)] },
    { recordedAt: "2026-08-03T00:00:00.000Z", metrics: [scored("voice_confidence", 54)] },
    { recordedAt: "2026-08-04T00:00:00.000Z", metrics: [scored("voice_confidence", 56)] },
    { recordedAt: "2026-08-05T00:00:00.000Z", metrics: [scored("voice_confidence", 55)] },
    { recordedAt: "2026-08-06T00:00:00.000Z", metrics: [scored("voice_confidence", 58)] },
  ]);
  assert.equal(trend.direction, "stable");
});

// --- Parse / prompt rules ---

check("parses structured My Voice JSON", () => {
  const content = parseMyVoiceSummaryJson(
    JSON.stringify({
      openingSynthesis:
        "You're getting clearer about saying what you mean without needing to explain everything first.",
      takingShape:
        "Your Stand reflections more often name the request before the backstory.",
      stillExploring:
        "How much context you give still shifts depending on the topic.",
      acrossYourVoice:
        "Across Stand and Explore, you reach for clearer wording once you've found the point.",
      carryForward:
        "Keep noticing what happens when you state your main point before explaining it.",
    }),
  );
  assert.ok(content.openingSynthesis.includes("clearer"));
  assert.equal(typeof content.carryForward, "string");
});

check("rejects missing required sections", () => {
  assert.throws(() =>
    parseMyVoiceSummaryJson(
      JSON.stringify({
        openingSynthesis: "Hello",
        takingShape: "A",
        stillExploring: "B",
      }),
    ),
  );
});

check("rejects runaway length", () => {
  const long = "word ".repeat(100);
  assert.throws(() =>
    assertMyVoiceLengthReasonable({
      openingSynthesis: long,
      takingShape: long,
      stillExploring: long,
      acrossYourVoice: long,
      carryForward: long,
    }),
  );
});

check("system prompt forbids personality and numeric scores", () => {
  assert.match(MY_VOICE_SYSTEM_PROMPT, /COMMUNICATION BEHAVIOR/i);
  assert.match(MY_VOICE_SYSTEM_PROMPT, /Do NOT quote numeric Journey scores/i);
  assert.match(MY_VOICE_SYSTEM_PROMPT, /Only describe growth\/change when/i);
  assert.match(MY_VOICE_SYSTEM_PROMPT, /personality/i);
});

console.log(`\n${passed} My Voice checks passed`);
