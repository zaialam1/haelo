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
      title: "Something shifted",
      body: "You recorded your first reflection. Your Universe has begun.",
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
      title: "Something shifted",
      body: "You’ve spoken across Connect, Stand, Explore, and Express.",
      category: "exploration",
    });
  }

  if (ctx.completedOrbitCount >= 1) {
    tryPush(out, have, {
      milestoneKey: "first_orbit",
      title: "Something shifted",
      body: "You completed your first Orbit — a fuller arc of practice.",
      category: "exploration",
    });
  }

  for (const region of ctx.completedRegions) {
    tryPush(out, have, {
      milestoneKey: `first_orbit_region:${region}`,
      title: "Something shifted",
      body: "You finished an Orbit in a new region of your practice.",
      category: "exploration",
      sourceMetadata: { region },
    });
  }

  if (total >= 25) {
    tryPush(out, have, {
      milestoneKey: "reflections_25",
      title: "Something shifted",
      body: "Twenty-five reflections — a steady body of practice is forming.",
      category: "exploration",
    });
  }

  if (total >= 50) {
    tryPush(out, have, {
      milestoneKey: "reflections_50",
      title: "Something shifted",
      body: "Fifty reflections. Your voice history is becoming a landscape.",
      category: "exploration",
    });
  }

  if (ctx.experimentCount >= 1) {
    tryPush(out, have, {
      milestoneKey: "first_experiment",
      title: "Something shifted",
      body: "You tested a new way of saying it.",
      category: "behavior",
    });
  }

  if (ctx.experimentCount >= 5) {
    tryPush(out, have, {
      milestoneKey: "experiments_5",
      title: "Something shifted",
      body: "You’ve tried five experiments — curiosity is becoming a habit.",
      category: "behavior",
    });
  }

  if (ctx.weeklyGoalsCompletedAllTime >= 3) {
    tryPush(out, have, {
      milestoneKey: "weekly_goal_x3",
      title: "Something shifted",
      body: "Your weekly constellation has completed three times.",
      category: "behavior",
    });
  }

  // Skill milestones — qualitative only
  const skillChecks: Array<{
    metric: JourneyMetricKey;
    key: string;
    body: (planet?: VoicePlanetId) => string;
  }> = [
    {
      metric: "directness",
      key: "skill_directness_range",
      body: (planet) =>
        planet === "stand"
          ? "Your recent Stand reflections are becoming more direct."
          : "A new range of Directness is showing up in your Journey.",
    },
    {
      metric: "listener_clarity",
      key: "skill_listener_clarity_range",
      body: () =>
        "Your recent Connect reflections have been landing in a stronger Listener Clarity range.",
    },
    {
      metric: "expressiveness",
      key: "skill_expressiveness_range",
      body: () =>
        "A fuller Expressiveness range is beginning to show in your Journey.",
    },
    {
      metric: "thought_clarity",
      key: "skill_thought_clarity_range",
      body: () =>
        "Your Thought Clarity is becoming more consistent across recent Explore reflections.",
    },
  ];

  for (const check of skillChecks) {
    const result = detectSkillRangeShift(ctx.metricSamples, check.metric);
    if (!result.shifted) continue;
    tryPush(out, have, {
      milestoneKey: check.key,
      title: "Something shifted",
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
