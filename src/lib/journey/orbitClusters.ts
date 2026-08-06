import { getOrbitByKey } from "@/lib/orbits/catalog";
import { getOrbitRegion } from "@/lib/orbits/regions";
import type {
  OrbitSummativeAnalysisContent,
  OrbitSummativeAnalysisRow,
  UserOrbitProgressRow,
} from "@/lib/orbits/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import type { Planet } from "@/lib/prompts";
import type {
  JourneyPlanetFilter,
  JourneySession,
} from "@/lib/journey/types";
import { isOrbitIndividualSession } from "@/lib/journey/types";

function sortByRecordedAt(a: JourneySession, b: JourneySession): number {
  return new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
}

function uniquePlanets(planets: Planet[]): VoicePlanetId[] {
  const seen = new Set<VoicePlanetId>();
  const out: VoicePlanetId[] = [];
  for (const p of planets) {
    if (seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

/**
 * Keep one canonical Orbit response per (progress, question).
 * Prefer earliest completed session — matches getCanonicalOrbitSessions.
 * Retries on the same session are already one star (multiple attempts).
 */
export function selectCanonicalOrbitIndividuals(
  sessions: JourneySession[],
): JourneySession[] {
  const nonOrbit: JourneySession[] = [];
  const byCanonKey = new Map<string, JourneySession>();

  for (const session of sessions) {
    if (!isOrbitIndividualSession(session)) {
      nonOrbit.push(session);
      continue;
    }

    const key = `${session.userOrbitProgressId ?? "none"}:${session.orbitQuestionKey ?? session.sessionId}`;
    const existing = byCanonKey.get(key);
    if (
      !existing ||
      new Date(session.recordedAt).getTime() <
        new Date(existing.recordedAt).getTime()
    ) {
      byCanonKey.set(key, session);
    }
  }

  return [...nonOrbit, ...byCanonKey.values()].sort(sortByRecordedAt);
}

/**
 * Order canonical Orbit responses by definition sequence (1→6).
 * Falls back to recordedAt when definition/question key is missing.
 */
export function orderOrbitResponses(
  responses: JourneySession[],
  orbitKey: string | null | undefined,
): JourneySession[] {
  const orbit = orbitKey ? getOrbitByKey(orbitKey) : undefined;
  if (!orbit) {
    return [...responses].sort(sortByRecordedAt);
  }

  const seqByQuestion = new Map(
    orbit.questions.map((q) => [q.questionKey, q.sequenceNumber] as const),
  );

  return [...responses].sort((a, b) => {
    const sa =
      a.orbitSequenceNumber ??
      (a.orbitQuestionKey
        ? seqByQuestion.get(a.orbitQuestionKey)
        : undefined) ??
      99;
    const sb =
      b.orbitSequenceNumber ??
      (b.orbitQuestionKey
        ? seqByQuestion.get(b.orbitQuestionKey)
        : undefined) ??
      99;
    if (sa !== sb) return sa - sb;
    return sortByRecordedAt(a, b);
  });
}

function resolveSummative(
  row: OrbitSummativeAnalysisRow | null | undefined,
): {
  content: OrbitSummativeAnalysisContent | null;
  status: "pending" | "ready" | "failed" | "missing";
} {
  if (!row) return { content: null, status: "missing" };
  if (row.status === "ready" && row.analysis_json) {
    return { content: row.analysis_json, status: "ready" };
  }
  if (row.status === "failed") return { content: null, status: "failed" };
  if (row.status === "pending") return { content: null, status: "pending" };
  return { content: null, status: "missing" };
}

/**
 * Build master-Journey cluster nodes from completed Orbit progress rows.
 * Does not duplicate transcript/recording/analysis — nests references to
 * the same individual JourneySession objects used in planet Journey.
 */
export function buildOrbitClusterSessions(
  allSessions: JourneySession[],
  completedProgress: UserOrbitProgressRow[],
  analysesByProgressId: Map<string, OrbitSummativeAnalysisRow>,
): JourneySession[] {
  const canonical = selectCanonicalOrbitIndividuals(allSessions).filter(
    isOrbitIndividualSession,
  );

  const byProgress = new Map<string, JourneySession[]>();
  for (const session of canonical) {
    const progressId = session.userOrbitProgressId;
    if (!progressId) continue;
    const list = byProgress.get(progressId) ?? [];
    list.push(session);
    byProgress.set(progressId, list);
  }

  const clusters: JourneySession[] = [];

  for (const progress of completedProgress) {
    if (progress.status !== "completed" || !progress.completed_at) continue;

    const orbit = getOrbitByKey(progress.orbit_key);
    const region = orbit ? getOrbitRegion(orbit.regionKey) : undefined;
    const title =
      progress.orbit_title_snapshot?.trim() ||
      orbit?.title ||
      "Completed Orbit";

    const rawResponses = byProgress.get(progress.id) ?? [];
    const responses = orderOrbitResponses(rawResponses, progress.orbit_key).map(
      (r) => {
        const seq =
          r.orbitSequenceNumber ??
          (r.orbitQuestionKey && orbit
            ? orbit.questions.find((q) => q.questionKey === r.orbitQuestionKey)
                ?.sequenceNumber
            : null) ??
          null;
        return seq != null && r.orbitSequenceNumber == null
          ? { ...r, orbitSequenceNumber: seq }
          : r;
      },
    );

    const planets =
      orbit != null
        ? uniquePlanets(orbit.questions.map((q) => q.planet))
        : uniquePlanets(
            responses
              .map((r) => r.planet)
              .filter((p): p is VoicePlanetId => p !== "uncategorized"),
          );

    const summative = resolveSummative(analysesByProgressId.get(progress.id));

    clusters.push({
      sessionId: `orbit-cluster:${progress.id}`,
      recordedAt: progress.completed_at,
      planet: "uncategorized",
      planetLabel: "Orbit",
      prompt: title,
      promptId: null,
      sessionType: null,
      sourceType: "orbit",
      orbitKey: progress.orbit_key,
      orbitQuestionKey: null,
      orbitTitle: title,
      userOrbitProgressId: progress.id,
      isOrbitCluster: true,
      orbitStartedAt: progress.started_at,
      orbitCompletedAt: progress.completed_at,
      orbitRegionKey: orbit?.regionKey ?? null,
      orbitRegionTitle: region?.title ?? null,
      orbitSituation: orbit?.situation ?? null,
      orbitShortDescription: orbit?.shortDescription ?? null,
      orbitPlanets: planets,
      orbitResponses: responses,
      summativeAnalysis: summative.content,
      summativeStatus: summative.status,
      clips: [],
      userReflection: null,
      haeloObservation: null,
      voiceNotes: [],
      themeLabel: null,
      changeObservation: null,
      reviewHref: `/orbits/${progress.orbit_key}/complete`,
      isMilestone: false,
    });
  }

  return clusters.sort(sortByRecordedAt);
}

/**
 * Project sessions for the active Journey filter.
 *
 * Master (all):
 *   - exclude individual Orbit responses
 *   - include completed Orbit clusters
 *   - include normal / daily / reflection sessions
 *
 * Planet filter:
 *   - include individual Orbit responses for that planet
 *   - exclude Orbit clusters
 *   - include normal sessions for that planet
 */
export function projectJourneySessions(
  sessions: JourneySession[],
  filter: JourneyPlanetFilter,
): JourneySession[] {
  const canonical = selectCanonicalOrbitIndividuals(sessions);

  if (filter === "all") {
    return canonical
      .filter((s) => s.isOrbitCluster || !isOrbitIndividualSession(s))
      .sort(sortByRecordedAt);
  }

  return canonical
    .filter((s) => !s.isOrbitCluster && s.planet === filter)
    .sort(sortByRecordedAt);
}
