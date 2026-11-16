/**
 * Milestone evaluation — qualitative recognition from real behavior
 * and internal Journey metrics (scores never shown to users).
 */

import {
  SKILL_MILESTONE_MIN_BASELINE,
  SKILL_MILESTONE_MIN_DELTA,
  SKILL_MILESTONE_MIN_RECENT,
} from "@/lib/gamification/config";
import type {
  EligibleSessionLite,
  GamificationEvent,
  MilestoneCategory,
} from "@/lib/gamification/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { JourneyMetricKey } from "@/lib/journey/metrics";
import { JOURNEY_METRIC_LABELS } from "@/lib/journey/metrics";

export type MilestoneCandidate = {
  milestoneKey: string;
  title: string;
  body: string;
  category: MilestoneCategory;
  sourceMetadata?: Record<string, unknown>;
};

export type MetricSample = {
  sessionId: string;
  planet: VoicePlanetId;
  recordedAt: string;
  metric: JourneyMetricKey;
  /** Internal 1–100 — never surface in UI copy as a number */
  score: number;
};

type MilestoneContext = {
  event: GamificationEvent;
  eligibleSessions: EligibleSessionLite[];
  experienceByPlanet: Record<VoicePlanetId, number>;
  completedOrbitCount: number;
  completedRegions: string[];
  experimentCount: number;
  weeklyGoalsCompletedAllTime: number;
  existingMilestoneKeys: Set<string>;
  metricSamples: MetricSample[];
};

function tryPush(
  out: MilestoneCandidate[],
  have: Set<string>,
  candidate: MilestoneCandidate,
) {
  if (have.has(candidate.milestoneKey)) return;
  out.push(candidate);
  have.add(candidate.milestoneKey);
}

/**
 * Detect a sustained upward shift in an internal metric without exposing scores.
 * Requires enough baseline + recent samples and a meaningful average delta.
 */
export function detectSkillRangeShift(
  samples: MetricSample[],
  metric: JourneyMetricKey,
): { shifted: boolean; planetHint?: VoicePlanetId } {
  const forMetric = samples
    .filter((s) => s.metric === metric && Number.isFinite(s.score))
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

  if (
    forMetric.length <
    SKILL_MILESTONE_MIN_BASELINE + SKILL_MILESTONE_MIN_RECENT
  ) {
    return { shifted: false };
  }

  const baseline = forMetric.slice(0, SKILL_MILESTONE_MIN_BASELINE);
  const recent = forMetric.slice(-SKILL_MILESTONE_MIN_RECENT);
  const avg = (rows: MetricSample[]) =>
    rows.reduce((sum, r) => sum + r.score, 0) / rows.length;

  const baselineAvg = avg(baseline);
  const recentAvg = avg(recent);
  if (recentAvg - baselineAvg < SKILL_MILESTONE_MIN_DELTA) {
    return { shifted: false };
  }

  // Consistency: at least 3 of recent at or above midpoint between avgs
  const mid = (baselineAvg + recentAvg) / 2;
  const consistent = recent.filter((r) => r.score >= mid).length;
  if (consistent < 3) return { shifted: false };

  const planetHint = recent[recent.length - 1]?.planet;
  return { shifted: true, planetHint };
}

export function evaluateMilestones(ctx: MilestoneContext): MilestoneCandidate[] {
  const out: MilestoneCandidate[] = [];
  const have = ctx.existingMilestoneKeys;
  const total = ctx.eligibleSessions.length;
  const counts = ctx.experienceByPlanet;

  if (total >= 1) {
    tryPush(out, have, {
      milestoneKey: "first_session",
      title: "First session",
      body: "You recorded your first answer.",
      category: "exploration",
    });
  }

  if (
    counts.connect >= 1 &&
    counts.stand >= 1 &&
    counts.explore >= 1 &&
    counts.express >= 1
  ) {
    tryPush(out, have, {
      milestoneKey: "first_all_planets",
      title: "All four planets",
      body: "You've practiced on Connect, Stand, Explore, and Express.",
      category: "exploration",
    });
  }

  if (ctx.completedOrbitCount >= 1) {
    tryPush(out, have, {
      milestoneKey: "first_orbit",
      title: "First Orbit",
      body: "You finished your first Orbit.",
      category: "exploration",
    });
  }

  for (const region of ctx.completedRegions) {
    tryPush(out, have, {
      milestoneKey: `first_orbit_region:${region}`,
      title: "New Orbit region",
      body: "You finished an Orbit in a new region.",
      category: "exploration",
      sourceMetadata: { region },
    });
  }

  if (total >= 25) {
    tryPush(out, have, {
      milestoneKey: "reflections_25",
      title: "25 sessions",
      body: "Twenty-five sessions on the board.",
      category: "exploration",
    });
  }

  if (total >= 50) {
    tryPush(out, have, {
      milestoneKey: "reflections_50",
      title: "50 sessions",
      body: "Fifty sessions. That's a real history to look back on.",
      category: "exploration",
    });
  }

  if (ctx.experimentCount >= 1) {
    tryPush(out, have, {
      milestoneKey: "first_experiment",
      title: "First experiment",
      body: "You tried a new way of saying it.",
      category: "behavior",
    });
  }

  if (ctx.experimentCount >= 5) {
    tryPush(out, have, {
      milestoneKey: "experiments_5",
      title: "Five experiments",
      body: "You've tried five experiments.",
      category: "behavior",
    });
  }

  if (ctx.weeklyGoalsCompletedAllTime >= 3) {
    tryPush(out, have, {
      milestoneKey: "weekly_goal_x3",
      title: "Weekly goal x3",
      body: "You've hit your weekly constellation three times.",
      category: "behavior",
    });
  }

  // Skill milestones — qualitative only
  const skillChecks: Array<{
    metric: JourneyMetricKey;
    key: string;
    title: string;
    body: (planet?: VoicePlanetId) => string;
  }> = [
    {
      metric: "directness",
      key: "skill_directness_range",
      title: "More direct",
      body: (planet) =>
        planet === "stand"
          ? "Your recent Stand sessions get to the point sooner."
          : "Your recent sessions are stating the point more clearly.",
    },
    {
      metric: "listener_clarity",
      key: "skill_listener_clarity_range",
      title: "Easier to follow",
      body: () =>
        "Your recent Connect sessions would be easier for someone else to follow.",
    },
    {
      metric: "expressiveness",
      key: "skill_expressiveness_range",
      title: "More specific",
      body: () =>
        "Your recent Express sessions use more concrete detail.",
    },
    {
      metric: "thought_clarity",
      key: "skill_thought_clarity_range",
      title: "Clearer thinking out loud",
      body: () =>
        "Your recent Explore sessions spell out what you're figuring out more clearly.",
    },
  ];

  for (const check of skillChecks) {
    const result = detectSkillRangeShift(ctx.metricSamples, check.metric);
    if (!result.shifted) continue;
    tryPush(out, have, {
      milestoneKey: check.key,
      title: check.title,
      body: check.body(result.planetHint),
      category: "skill",
      sourceMetadata: {
        metric: check.metric,
        label: JOURNEY_METRIC_LABELS[check.metric],
        // Deliberately omit numeric scores from metadata shown to clients
      },
    });
  }

  return out;
}
