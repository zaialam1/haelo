import {
  activeMetricForFilter,
  getScoredMetricValue,
  scoreToNormalizedY,
  UNSCORED_NORMALIZED_Y,
} from "@/lib/journey/metrics";
import type {
  JourneyMonthAnchor,
  JourneyNode,
  JourneyPlanetFilter,
  JourneySession,
  JourneyViewModel,
} from "@/lib/journey/types";

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long" });
}

function monthLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function resolveMetricScore(
  session: JourneySession,
  filter: JourneyPlanetFilter,
): number | null {
  if (session.isOrbitCluster) {
    // All tab: cluster Y uses averaged Voice Confidence
    if (
      typeof session.clusterVoiceConfidenceScore === "number" &&
      Number.isFinite(session.clusterVoiceConfidenceScore)
    ) {
      return session.clusterVoiceConfidenceScore;
    }
    return getScoredMetricValue(session.journeyMetrics, "voice_confidence");
  }

  const metric = activeMetricForFilter(filter);
  return getScoredMetricValue(session.journeyMetrics, metric);
}

/**
 * Tiny horizontal stagger when nodes share nearly the same X/Y.
 * Never moves Y enough to distort metric meaning.
 */
function applySoftCollisionOffsets(nodes: JourneyNode[]): JourneyNode[] {
  if (nodes.length < 2) return nodes;

  const result = nodes.map((n) => ({ ...n }));
  const xNudge = 0.014;

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const a = result[i]!;
      const b = result[j]!;
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      if (dx < 0.03 && dy < 0.045) {
        const dir = j % 2 === 0 ? 1 : -1;
        b.x = Math.min(0.94, Math.max(0.06, b.x + dir * xNudge));
      }
    }
  }

  return result;
}

/**
 * Chronological constellation layout:
 * - X follows time (older → newer, left → right)
 * - Y follows the exact active metric score (1–100), continuous — NOT the
 *   5-level qualitative band. Level labels are for UI copy only.
 */
export function layoutJourneyNodes(
  sessions: JourneySession[],
  filter: JourneyPlanetFilter = "all",
): JourneyNode[] {
  const n = sessions.length;
  if (n === 0) return [];

  const times = sessions.map((s) => new Date(s.recordedAt).getTime());
  const first = times[0]!;
  const last = times[n - 1]!;
  const span = Math.max(last - first, 1);

  const nodes: JourneyNode[] = sessions.map((session, i) => {
    const t = times[i]!;
    let x: number;
    if (n === 1) {
      x = 0.38;
    } else if (n === 2) {
      x = i === 0 ? 0.28 : 0.62;
    } else if (n <= 4) {
      x = 0.18 + (i / (n - 1)) * 0.64;
    } else {
      x = 0.06 + ((t - first) / span) * 0.88;
    }

    // Exact 1–100 score drives Y. Never use level (1–5) for placement.
    const metricScore = resolveMetricScore(session, filter);
    const metricPositioned = metricScore != null;
    const y =
      metricScore != null
        ? scoreToNormalizedY(metricScore)
        : UNSCORED_NORMALIZED_Y;

    const size = session.isOrbitCluster
      ? 1.18
      : session.isMilestone
        ? 1.25
        : 0.82 + ((i * 17) % 7) * 0.04;

    return {
      ...session,
      x,
      y,
      size,
      metricPositioned,
      metricScore: metricScore ?? null,
    };
  });

  return applySoftCollisionOffsets(nodes);
}

export function buildMonthAnchors(
  sessions: JourneySession[],
): JourneyMonthAnchor[] {
  if (sessions.length === 0) return [];

  const times = sessions.map((s) => new Date(s.recordedAt).getTime());
  const first = times[0]!;
  const last = times[times.length - 1]!;
  const span = Math.max(last - first, 1);
  const n = sessions.length;

  const xForTime = (t: number, i: number): number => {
    if (n === 1) return 0.38;
    if (n === 2) return i === 0 ? 0.28 : 0.62;
    if (n <= 4) return 0.18 + (i / (n - 1)) * 0.64;
    return 0.06 + ((t - first) / span) * 0.88;
  };

  const seen = new Map<string, JourneyMonthAnchor>();
  sessions.forEach((s, i) => {
    const key = monthKey(s.recordedAt);
    if (seen.has(key)) return;
    const t = times[i]!;
    seen.set(key, {
      key,
      label: monthShort(s.recordedAt),
      longLabel: monthLong(s.recordedAt),
      x: xForTime(t, i),
    });
  });

  return Array.from(seen.values()).sort((a, b) => a.x - b.x);
}

export function buildJourneyViewModel(
  sessions: JourneySession[],
  opts?: { isPreview?: boolean; filter?: JourneyPlanetFilter },
): JourneyViewModel {
  const filter = opts?.filter ?? "all";
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  return {
    sessions: sorted,
    nodes: layoutJourneyNodes(sorted, filter),
    monthAnchors: buildMonthAnchors(sorted),
    isEmpty: sorted.length === 0,
    isPreview: Boolean(opts?.isPreview),
    beganAt: sorted[0]?.recordedAt ?? null,
    filter,
  };
}
