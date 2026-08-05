import type {
  JourneyMonthAnchor,
  JourneyNode,
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

/**
 * Organic but chronological layout:
 * - X primarily follows time (older → newer, left → right)
 * - Y gently waves so the path reads as a constellation, not a chart
 */
export function layoutJourneyNodes(sessions: JourneySession[]): JourneyNode[] {
  const n = sessions.length;
  if (n === 0) return [];

  const times = sessions.map((s) => new Date(s.recordedAt).getTime());
  const first = times[0]!;
  const last = times[n - 1]!;
  const span = Math.max(last - first, 1);

  return sessions.map((session, i) => {
    const t = times[i]!;
    // Sparse few-session layout: spread with breathing room, not clustered at edges
    let x: number;
    if (n === 1) {
      x = 0.38;
    } else if (n === 2) {
      x = i === 0 ? 0.28 : 0.62;
    } else if (n <= 4) {
      x = 0.18 + (i / (n - 1)) * 0.64;
    } else {
      x = 0.06 + (t - first) / span * 0.88;
    }

    // Deterministic organic vertical placement from index
    const wave =
      Math.sin(i * 1.15 + 0.4) * 0.16 +
      Math.cos(i * 0.55) * 0.06 +
      (i % 2 === 0 ? -0.04 : 0.05);
    const y = Math.min(0.78, Math.max(0.22, 0.5 + wave));

    const size = session.isMilestone
      ? 1.25
      : 0.82 + ((i * 17) % 7) * 0.04;

    return {
      ...session,
      x,
      y,
      size,
    };
  });
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
  opts?: { isPreview?: boolean },
): JourneyViewModel {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  return {
    sessions: sorted,
    nodes: layoutJourneyNodes(sorted),
    monthAnchors: buildMonthAnchors(sorted),
    isEmpty: sorted.length === 0,
    isPreview: Boolean(opts?.isPreview),
    beganAt: sorted[0]?.recordedAt ?? null,
  };
}
