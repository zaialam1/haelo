/**
 * Quantitative Journey metric trends for My Voice (internal only).
 * Numbers never appear in the user-facing summary.
 */

import {
  getScoredMetricValue,
  JOURNEY_METRIC_KEYS,
  type JourneyMetricKey,
  type JourneyMetricResult,
} from "@/lib/journey/metrics";
import type { MyVoiceMetricTrend, MyVoiceTrendDirection } from "./types";

export type TimedMetricSample = {
  recordedAt: string;
  metrics: JourneyMetricResult[] | null | undefined;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Split chronological samples into earlier vs recent halves.
 * Requires enough scored points before claiming a direction.
 */
export function computeMetricTrend(
  metric: JourneyMetricKey,
  samples: TimedMetricSample[],
): MyVoiceMetricTrend {
  const scored = samples
    .map((s) => {
      const score = getScoredMetricValue(s.metrics, metric);
      if (score == null) return null;
      return { recordedAt: s.recordedAt, score };
    })
    .filter((x): x is { recordedAt: string; score: number } => x != null)
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

  const sampleSize = scored.length;
  if (sampleSize < 4) {
    return {
      metric,
      direction: "insufficient",
      sampleSize,
      note: "Not enough scored samples to compare earlier vs recent use.",
    };
  }

  const split = Math.floor(sampleSize / 2);
  const earlier = scored.slice(0, split).map((s) => s.score);
  const recent = scored.slice(split).map((s) => s.score);
  const earlierMed = median(earlier);
  const recentMed = median(recent);
  if (earlierMed == null || recentMed == null) {
    return {
      metric,
      direction: "insufficient",
      sampleSize,
      note: "Could not compute period medians.",
    };
  }

  const allScores = scored.map((s) => s.score);
  const spread = stdev(allScores);
  const delta = recentMed - earlierMed;

  // Meaningful change threshold scales with variability; floor of ~8 points.
  const threshold = Math.max(8, spread * 0.55);
  let direction: MyVoiceTrendDirection;
  if (spread >= 22 && Math.abs(delta) < threshold * 1.15) {
    direction = "variable";
  } else if (delta >= threshold) {
    direction = "rising";
  } else if (delta <= -threshold) {
    direction = "falling";
  } else {
    direction = "stable";
  }

  const noteByDirection: Record<MyVoiceTrendDirection, string> = {
    rising:
      "Recent period median is meaningfully higher than earlier period (use as soft evidence only; never quote numbers).",
    falling:
      "Recent period median is meaningfully lower than earlier period (describe carefully; do not invent decline narratives).",
    stable:
      "Earlier and recent period medians are similar — prefer language about consistency, not growth.",
    variable:
      "Scores vary widely across sessions — prefer context-dependent language over a single growth story.",
    insufficient: "Insufficient evidence.",
  };

  return {
    metric,
    direction,
    sampleSize,
    note: noteByDirection[direction],
  };
}

export function computeAllMetricTrends(
  samples: TimedMetricSample[],
): MyVoiceMetricTrend[] {
  return JOURNEY_METRIC_KEYS.map((metric) =>
    computeMetricTrend(metric, samples),
  );
}
