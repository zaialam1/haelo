/**
 * Parse + normalize journeyMetrics from the analysis LLM response.
 * Levels are always derived from score (never trusted from the model alone).
 */

import {
  expectedMetricsForPlanet,
  insufficientMetricResult,
  isJourneyMetricKey,
  JOURNEY_METRIC_MIN_WORDS,
  scoredMetricResult,
  type JourneyMetricKey,
  type JourneyMetricResult,
} from "@/lib/journey/metrics";
import type { SpeechMetrics } from "@/lib/sessions/speechMetrics";

type RawJourneyMetric = {
  metric?: unknown;
  score?: unknown;
  level?: unknown;
  status?: unknown;
};

function parseOneMetric(
  raw: RawJourneyMetric,
  allowed: Set<JourneyMetricKey>,
): JourneyMetricResult | null {
  if (!isJourneyMetricKey(raw.metric) || !allowed.has(raw.metric)) {
    return null;
  }

  const statusRaw =
    typeof raw.status === "string" ? raw.status.trim().toLowerCase() : "";

  if (
    statusRaw === "insufficient_data" ||
    raw.score === null ||
    raw.score === undefined
  ) {
    return insufficientMetricResult(raw.metric);
  }

  const scoreNum =
    typeof raw.score === "number"
      ? raw.score
      : typeof raw.score === "string" && raw.score.trim()
        ? Number(raw.score)
        : NaN;

  if (!Number.isFinite(scoreNum)) {
    return insufficientMetricResult(raw.metric);
  }

  return scoredMetricResult(raw.metric, scoreNum);
}

/**
 * Whether transcript + speech metrics are too thin to score confidently.
 */
export function hasInsufficientJourneyEvidence(
  transcript: string | null | undefined,
  speechMetrics: SpeechMetrics | null | undefined,
): boolean {
  const text = transcript?.trim() ?? "";
  if (!text) return true;
  const words =
    speechMetrics?.wordCount ??
    text.split(/\s+/).filter(Boolean).length;
  return words < JOURNEY_METRIC_MIN_WORDS;
}

/**
 * Normalize model journeyMetrics into the expected two metrics for the planet.
 * Missing expected metrics become insufficient_data.
 */
export function parseJourneyMetrics(
  raw: unknown,
  planet: string,
  opts?: {
    forceInsufficient?: boolean;
  },
): JourneyMetricResult[] {
  const expected = expectedMetricsForPlanet(planet);
  const allowed = new Set(expected);

  if (opts?.forceInsufficient) {
    return expected.map(insufficientMetricResult);
  }

  const byKey = new Map<JourneyMetricKey, JourneyMetricResult>();

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const parsed = parseOneMetric(entry as RawJourneyMetric, allowed);
      if (parsed) byKey.set(parsed.metric, parsed);
    }
  }

  return expected.map(
    (key) => byKey.get(key) ?? insufficientMetricResult(key),
  );
}
