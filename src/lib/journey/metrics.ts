/**
 * Journey metric definitions — internal visualization scores (1–100).
 *
 * Scores are observational communication qualities, not grades or personality.
 * UI shows qualitative levels only; numeric scores stay internal.
 */

import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { JourneyPlanetFilter } from "@/lib/journey/types";

/** Current metric rubric / mapping version. Bump when score meaning changes. */
export const JOURNEY_METRICS_VERSION = "1";

/** Prompt / calibration guidance version for journeyMetrics in analysis. */
export const JOURNEY_METRICS_PROMPT_VERSION = "1";

export type JourneyMetricKey =
  | "voice_confidence"
  | "directness"
  | "listener_clarity"
  | "thought_clarity"
  | "expressiveness";

export type JourneyMetricLevel = 1 | 2 | 3 | 4 | 5;

export type JourneyMetricStatus = "scored" | "insufficient_data";

export type JourneyMetricResult = {
  metric: JourneyMetricKey;
  /** Internal only — never show in normal UI */
  score: number | null;
  level: JourneyMetricLevel | null;
  status: JourneyMetricStatus;
};

export type JourneyMetricsPayload = {
  metrics: JourneyMetricResult[];
  /** Rubric/mapping version at score time */
  metricsVersion: string;
  /** Prompt calibration version at score time */
  promptVersion: string;
  /** Model id used when scored */
  model: string | null;
  scoredAt: string;
};

/** Minimum transcript words before we allow a confident score. */
export const JOURNEY_METRIC_MIN_WORDS = 8;

export const JOURNEY_METRIC_KEYS: readonly JourneyMetricKey[] = [
  "voice_confidence",
  "directness",
  "listener_clarity",
  "thought_clarity",
  "expressiveness",
] as const;

const PLANET_METRIC: Record<VoicePlanetId, JourneyMetricKey> = {
  stand: "directness",
  connect: "listener_clarity",
  explore: "thought_clarity",
  express: "expressiveness",
};

/** Display name for Journey Lens / tooltips (not the vertical-axis copy). */
export const JOURNEY_METRIC_LABELS: Record<JourneyMetricKey, string> = {
  voice_confidence: "Voice Confidence",
  directness: "Directness",
  listener_clarity: "Listener Clarity",
  thought_clarity: "Thought Clarity",
  expressiveness: "Expressiveness",
};

/**
 * Configurable 5-level labels per metric.
 * Stored sessions keep level 1–5 only; labels come from this config.
 */
export const JOURNEY_METRIC_LEVELS: Record<
  JourneyMetricKey,
  readonly [string, string, string, string, string]
> = {
  voice_confidence: ["Low", "Emerging", "Moderate", "Strong", "High"],
  directness: ["Low", "Emerging", "Moderate", "Strong", "High"],
  listener_clarity: ["Low", "Emerging", "Moderate", "Strong", "High"],
  thought_clarity: ["Low", "Emerging", "Moderate", "Strong", "High"],
  expressiveness: ["Low", "Emerging", "Moderate", "Strong", "High"],
};

/** Subtle constellation Y-axis copy (non-numeric). */
export const JOURNEY_AXIS_LABELS: Record<
  JourneyPlanetFilter,
  { top: string; bottom: string }
> = {
  all: {
    top: "More voice confidence",
    bottom: "Less voice confidence",
  },
  stand: {
    top: "More direct",
    bottom: "Less direct",
  },
  connect: {
    top: "Easier to follow",
    bottom: "Harder to follow",
  },
  explore: {
    top: "More clearly articulated",
    bottom: "Less clearly articulated",
  },
  express: {
    top: "More expressive",
    bottom: "Less expressive",
  },
};

export function planetMetricKey(
  planet: string | null | undefined,
): JourneyMetricKey | null {
  const key = planet?.trim().toLowerCase();
  if (key === "stand" || key === "connect" || key === "explore" || key === "express") {
    return PLANET_METRIC[key];
  }
  return null;
}

/** Which metric drives Y for the active Journey tab. */
export function activeMetricForFilter(
  filter: JourneyPlanetFilter,
): JourneyMetricKey {
  if (filter === "all") return "voice_confidence";
  return PLANET_METRIC[filter];
}

/** Expected metrics for a session on a given planet (always includes voice confidence). */
export function expectedMetricsForPlanet(
  planet: string | null | undefined,
): JourneyMetricKey[] {
  const planetMetric = planetMetricKey(planet);
  if (!planetMetric) return ["voice_confidence"];
  return ["voice_confidence", planetMetric];
}

export function scoreToLevel(score: number): JourneyMetricLevel {
  if (score <= 20) return 1;
  if (score <= 40) return 2;
  if (score <= 60) return 3;
  if (score <= 80) return 4;
  return 5;
}

export function levelLabel(
  metric: JourneyMetricKey,
  level: JourneyMetricLevel | null | undefined,
): string | null {
  if (level == null || level < 1 || level > 5) return null;
  return JOURNEY_METRIC_LEVELS[metric][level - 1] ?? null;
}

export function isJourneyMetricKey(value: unknown): value is JourneyMetricKey {
  return (
    typeof value === "string" &&
    (JOURNEY_METRIC_KEYS as readonly string[]).includes(value)
  );
}

export function findMetricResult(
  metrics: JourneyMetricResult[] | null | undefined,
  key: JourneyMetricKey,
): JourneyMetricResult | null {
  if (!metrics?.length) return null;
  return metrics.find((m) => m.metric === key) ?? null;
}

export function getScoredMetricValue(
  metrics: JourneyMetricResult[] | null | undefined,
  key: JourneyMetricKey,
): number | null {
  const row = findMetricResult(metrics, key);
  if (!row || row.status !== "scored" || row.score == null) return null;
  if (!Number.isFinite(row.score)) return null;
  return row.score;
}

/**
 * Map internal score 1–100 → normalized Y in plot space.
 *
 * CRITICAL: use the exact integer score, never the 1–5 qualitative level.
 * Level is display-only (Journey Lens / tooltips). A score of 60 (Moderate)
 * must sit higher than 41 (also Moderate) — do not snap to band midpoints.
 *
 * Higher score → visually higher (smaller SVG y after toY).
 */
export function scoreToNormalizedY(
  score: number,
  opts?: { top?: number; bottom?: number },
): number {
  const top = opts?.top ?? 0.16;
  const bottom = opts?.bottom ?? 0.78;
  const clamped = Math.min(100, Math.max(1, Math.round(score)));
  const normalized = (clamped - 1) / 99;
  return bottom - normalized * (bottom - top);
}

/**
 * Historical / missing scores sit BELOW the scored metric range so they are
 * not confused with a mid-band (Moderate ≈ 50) score.
 * Scored 1 → near bottom of the metric band; unscored sits lower still.
 */
export const UNSCORED_NORMALIZED_Y = 0.88;

/**
 * Orbit cluster Voice Confidence: mean of valid individual voice_confidence scores.
 * Requires enough scored responses (at least 4, or all if fewer than 4 exist).
 */
export function averageOrbitVoiceConfidence(
  scores: Array<number | null | undefined>,
): number | null {
  const valid = scores.filter(
    (s): s is number => typeof s === "number" && Number.isFinite(s) && s >= 1 && s <= 100,
  );
  if (valid.length === 0) return null;
  const required = Math.min(4, scores.length > 0 ? scores.length : 4);
  if (valid.length < required) return null;
  return Math.round(valid.reduce((sum, s) => sum + s, 0) / valid.length);
}

export function insufficientMetricResult(
  metric: JourneyMetricKey,
): JourneyMetricResult {
  return {
    metric,
    score: null,
    level: null,
    status: "insufficient_data",
  };
}

export function scoredMetricResult(
  metric: JourneyMetricKey,
  score: number,
): JourneyMetricResult {
  const clamped = Math.round(Math.min(100, Math.max(1, score)));
  return {
    metric,
    score: clamped,
    level: scoreToLevel(clamped),
    status: "scored",
  };
}
