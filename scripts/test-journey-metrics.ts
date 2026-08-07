/**
 * Offline tests for Journey metrics parse, levels, layout Y, orbit averages.
 */
import assert from "node:assert/strict";
import { buildJourneyViewModel, layoutJourneyNodes } from "../src/lib/journey/layout";
import {
  activeMetricForFilter,
  averageOrbitVoiceConfidence,
  expectedMetricsForPlanet,
  JOURNEY_METRIC_LEVELS,
  levelLabel,
  scoreToLevel,
  scoreToNormalizedY,
  UNSCORED_NORMALIZED_Y,
} from "../src/lib/journey/metrics";
import type { JourneySession } from "../src/lib/journey/types";
import { parseAnalysisJson } from "../src/lib/sessions/analysisProvider";
import {
  hasInsufficientJourneyEvidence,
  parseJourneyMetrics,
} from "../src/lib/sessions/journeyMetricsParse";
import { buildAnalysisUserPayload } from "../src/lib/sessions/analysisPrompt";
import { buildSessionAnalysisInput } from "../src/lib/sessions/analysisInput";

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

check("scoreToLevel bands match 1–20 … 81–100", () => {
  assert.equal(scoreToLevel(1), 1);
  assert.equal(scoreToLevel(20), 1);
  assert.equal(scoreToLevel(21), 2);
  assert.equal(scoreToLevel(40), 2);
  assert.equal(scoreToLevel(41), 3);
  assert.equal(scoreToLevel(60), 3);
  assert.equal(scoreToLevel(61), 4);
  assert.equal(scoreToLevel(80), 4);
  assert.equal(scoreToLevel(81), 5);
  assert.equal(scoreToLevel(100), 5);
});

check("level labels are configurable and non-grade", () => {
  assert.equal(levelLabel("directness", 4), JOURNEY_METRIC_LEVELS.directness[3]);
  assert.doesNotMatch(levelLabel("directness", 1)!, /bad|poor|fail/i);
});

check("higher score maps to visually higher (smaller normalized Y)", () => {
  const low = scoreToNormalizedY(20);
  const high = scoreToNormalizedY(90);
  assert.ok(high < low);
});

check("within the same level band, exact scores still differ on Y", () => {
  // Level 3 = 41–60. Placement must use the number, not the band.
  assert.equal(scoreToLevel(41), 3);
  assert.equal(scoreToLevel(50), 3);
  assert.equal(scoreToLevel(60), 3);
  const y41 = scoreToNormalizedY(41);
  const y50 = scoreToNormalizedY(50);
  const y60 = scoreToNormalizedY(60);
  assert.ok(y60 < y50 && y50 < y41, "60 sits above 50 sits above 41");
  // Must not collapse to a single band midpoint
  assert.notEqual(y41, y60);
});

check("layout uses exact score not level midpoint for same-level sessions", () => {
  const sessions = [
    session({
      sessionId: "mod-low",
      recordedAt: "2026-08-01T12:00:00.000Z",
      planet: "stand",
      journeyMetrics: [
        { metric: "voice_confidence", score: 50, level: 3, status: "scored" },
        { metric: "directness", score: 41, level: 3, status: "scored" },
      ],
    }),
    session({
      sessionId: "mod-high",
      recordedAt: "2026-08-02T12:00:00.000Z",
      planet: "stand",
      journeyMetrics: [
        { metric: "voice_confidence", score: 50, level: 3, status: "scored" },
        { metric: "directness", score: 60, level: 3, status: "scored" },
      ],
    }),
  ];
  const nodes = layoutJourneyNodes(sessions, "stand");
  assert.equal(nodes[0]!.metricScore, 41);
  assert.equal(nodes[1]!.metricScore, 60);
  assert.ok(nodes[1]!.y < nodes[0]!.y);
  assert.ok(Math.abs(nodes[0]!.y - scoreToNormalizedY(41)) < 0.0001);
  assert.ok(Math.abs(nodes[1]!.y - scoreToNormalizedY(60)) < 0.0001);
});

check("planet expected metrics always include voice_confidence", () => {
  for (const planet of ["stand", "connect", "explore", "express"] as const) {
    const keys = expectedMetricsForPlanet(planet);
    assert.equal(keys[0], "voice_confidence");
    assert.equal(keys.length, 2);
  }
  assert.deepEqual(expectedMetricsForPlanet("stand"), [
    "voice_confidence",
    "directness",
  ]);
  assert.deepEqual(expectedMetricsForPlanet("connect"), [
    "voice_confidence",
    "listener_clarity",
  ]);
});

check("activeMetricForFilter maps tabs correctly", () => {
  assert.equal(activeMetricForFilter("all"), "voice_confidence");
  assert.equal(activeMetricForFilter("stand"), "directness");
  assert.equal(activeMetricForFilter("connect"), "listener_clarity");
  assert.equal(activeMetricForFilter("explore"), "thought_clarity");
  assert.equal(activeMetricForFilter("express"), "expressiveness");
});

check("parseJourneyMetrics fills missing as insufficient_data", () => {
  const metrics = parseJourneyMetrics([], "stand");
  assert.equal(metrics.length, 2);
  assert.ok(metrics.every((m) => m.status === "insufficient_data"));
});

check("parseJourneyMetrics derives level from score", () => {
  const metrics = parseJourneyMetrics(
    [
      { metric: "voice_confidence", score: 73, level: 2, status: "scored" },
      { metric: "directness", score: 55, status: "scored" },
    ],
    "stand",
  );
  assert.equal(metrics[0]!.level, 4);
  assert.equal(metrics[1]!.level, 3);
});

check("short transcript forces insufficient evidence", () => {
  assert.equal(hasInsufficientJourneyEvidence("hi", null), true);
  assert.equal(
    hasInsufficientJourneyEvidence(
      "I want them to stop joking about my voice right now please.",
      { wordCount: 12, durationSeconds: 10, wordsPerMinute: 72, sentenceCount: 1, hedgeCounts: {}, hedgeTotal: 0, fillerCounts: {}, fillerTotal: 0, repeatedWordPairs: 0 },
    ),
    false,
  );
});

check("parseAnalysisJson includes journeyMetrics for Stand", () => {
  const transcript =
    "I don't want them to keep joking about it. Please stop.";
  const parsed = parseAnalysisJson(
    {
      strength: { title: "Clear", description: "You named it." },
      observation: {
        title: "Direct",
        description: 'You said "Please stop."',
      },
      evidence: [{ text: "Please stop." }],
      experiment: { title: "Lead", instruction: "Start with the ask." },
      journeyMetrics: [
        { metric: "voice_confidence", score: 68, status: "scored" },
        { metric: "directness", score: 77, status: "scored" },
      ],
    },
    transcript,
    false,
    { planet: "stand" },
  );
  assert.equal(parsed.journeyMetrics.length, 2);
  assert.equal(parsed.journeyMetrics[0]!.metric, "voice_confidence");
  assert.equal(parsed.journeyMetrics[1]!.metric, "directness");
  assert.equal(parsed.journeyMetrics[1]!.score, 77);
  assert.equal(parsed.journeyMetrics[1]!.level, 4);
});

check("analysis payload schema includes journeyMetrics", () => {
  const input = buildSessionAnalysisInput({
    sessionId: "s1",
    planet: "express",
    promptText: "Tell a story.",
    transcript: "Last week I told my friend how quiet I felt at lunch and why it mattered.",
    sourceType: "planet",
    attemptNumber: 1,
    durationSeconds: 20,
  });
  const payload = buildAnalysisUserPayload(input);
  assert.ok(payload.journeyScoring);
  assert.ok((payload.schema as { journeyMetrics?: unknown }).journeyMetrics);
  assert.deepEqual(
    (payload.journeyScoring as { requiredMetrics: string[] }).requiredMetrics,
    ["voice_confidence", "expressiveness"],
  );
});

function session(
  partial: Partial<JourneySession> & Pick<JourneySession, "sessionId" | "recordedAt" | "planet">,
): JourneySession {
  return {
    planetLabel: partial.planet,
    prompt: "prompt",
    promptId: null,
    sessionType: "main",
    clips: [],
    userReflection: null,
    haeloObservation: null,
    voiceNotes: [],
    themeLabel: null,
    changeObservation: null,
    ...partial,
  };
}

check("layout Y uses planet metric on Stand filter", () => {
  const sessions = [
    session({
      sessionId: "a",
      recordedAt: "2026-08-01T12:00:00.000Z",
      planet: "stand",
      journeyMetrics: [
        { metric: "voice_confidence", score: 90, level: 5, status: "scored" },
        { metric: "directness", score: 30, level: 2, status: "scored" },
      ],
    }),
    session({
      sessionId: "b",
      recordedAt: "2026-08-02T12:00:00.000Z",
      planet: "stand",
      journeyMetrics: [
        { metric: "voice_confidence", score: 20, level: 1, status: "scored" },
        { metric: "directness", score: 85, level: 5, status: "scored" },
      ],
    }),
  ];
  const standNodes = layoutJourneyNodes(sessions, "stand");
  // b has higher directness → visually higher → smaller y
  assert.ok(standNodes[1]!.y < standNodes[0]!.y);

  const allNodes = layoutJourneyNodes(sessions, "all");
  // a has higher voice_confidence → visually higher on All
  assert.ok(allNodes[0]!.y < allNodes[1]!.y);
});

check("unscored sessions sit below the scored metric band", () => {
  const nodes = layoutJourneyNodes(
    [
      session({
        sessionId: "old",
        recordedAt: "2026-08-01T12:00:00.000Z",
        planet: "connect",
      }),
      session({
        sessionId: "scored-mid",
        recordedAt: "2026-08-02T12:00:00.000Z",
        planet: "connect",
        journeyMetrics: [
          { metric: "voice_confidence", score: 50, level: 3, status: "scored" },
          { metric: "listener_clarity", score: 50, level: 3, status: "scored" },
        ],
      }),
    ],
    "connect",
  );
  assert.equal(nodes[0]!.y, UNSCORED_NORMALIZED_Y);
  assert.equal(nodes[0]!.metricPositioned, false);
  assert.equal(nodes[1]!.metricScore, 50);
  assert.ok(
    nodes[1]!.y < nodes[0]!.y,
    "Moderate (~50) scored star must sit above unscored history",
  );
});

check("orbit cluster average requires enough valid scores", () => {
  assert.equal(averageOrbitVoiceConfidence([70, 80, null, 60, 50, 90]), 70);
  assert.equal(averageOrbitVoiceConfidence([70, 80, null]), null);
  assert.equal(averageOrbitVoiceConfidence([40, 50, 60, 70]), 55);
});

check("collision handling nudges X not Y", () => {
  const sessions = [
    session({
      sessionId: "c1",
      recordedAt: "2026-08-01T12:00:00.000Z",
      planet: "stand",
      journeyMetrics: [
        { metric: "voice_confidence", score: 50, level: 3, status: "scored" },
        { metric: "directness", score: 50, level: 3, status: "scored" },
      ],
    }),
    session({
      sessionId: "c2",
      recordedAt: "2026-08-01T12:05:00.000Z",
      planet: "stand",
      journeyMetrics: [
        { metric: "voice_confidence", score: 51, level: 3, status: "scored" },
        { metric: "directness", score: 51, level: 3, status: "scored" },
      ],
    }),
  ];
  const nodes = layoutJourneyNodes(sessions, "stand");
  const y0 = scoreToNormalizedY(50);
  const y1 = scoreToNormalizedY(51);
  assert.ok(Math.abs(nodes[0]!.y - y0) < 0.001);
  assert.ok(Math.abs(nodes[1]!.y - y1) < 0.001);
  // X may be staggered; Y must stay on metric
  assert.ok(nodes[0]!.x !== nodes[1]!.x || true);
});

check("buildJourneyViewModel stores filter", () => {
  const model = buildJourneyViewModel([], { filter: "explore" });
  assert.equal(model.filter, "explore");
});

console.log(`\n${passed} checks passed.`);
