/**
 * Gather eligible My Voice history and build a compact synthesis input.
 */

import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { getCompletedPracticeSessionsForUser } from "@/lib/journey/data";
import type { JourneyMetricResult } from "@/lib/journey/metrics";
import { createClient } from "@/lib/supabase/server";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import type { SessionWithAttempts } from "@/lib/sessions/types";
import {
  MY_VOICE_MAX_ANALYSIS_SNIPPETS,
  MY_VOICE_MAX_ORBIT_SUMMARIES,
} from "./thresholds";
import { computeAllMetricTrends } from "./trends";
import type {
  MyVoiceAnalysisSnippet,
  MyVoiceOrbitSummativeSnippet,
  MyVoicePlanetCoverage,
  MyVoiceSynthesisInput,
} from "./types";

const EMPTY_COVERAGE: MyVoicePlanetCoverage = {
  connect: 0,
  stand: 0,
  explore: 0,
  express: 0,
};

function isVoicePlanet(value: string | null | undefined): value is VoicePlanetId {
  return (
    value === "connect" ||
    value === "stand" ||
    value === "explore" ||
    value === "express"
  );
}

function sessionTime(session: SessionWithAttempts): string {
  return session.completed_at ?? session.created_at;
}

/**
 * Eligible reflections for My Voice:
 * - completed planet / daily / orbit sessions
 * - Orbit: one canonical response per (progress, question) — earliest kept
 * - Abandoned retries are not separate sessions; attempt 2 stays on same session
 * - Summative Orbit Analysis is NOT counted as a user response
 */
export function selectEligibleMyVoiceSessions(
  sessions: SessionWithAttempts[],
): SessionWithAttempts[] {
  const completed = sessions.filter((s) => s.status === "completed");
  const nonOrbit: SessionWithAttempts[] = [];
  const byCanonKey = new Map<string, SessionWithAttempts>();

  for (const session of completed) {
    if (session.source !== "orbit") {
      nonOrbit.push(session);
      continue;
    }
    const qKey = session.orbit_question_key ?? session.id;
    const key = `${session.user_orbit_progress_id ?? "none"}:${qKey}`;
    const existing = byCanonKey.get(key);
    if (
      !existing ||
      new Date(sessionTime(session)).getTime() <
        new Date(sessionTime(existing)).getTime()
    ) {
      byCanonKey.set(key, session);
    }
  }

  return [...nonOrbit, ...byCanonKey.values()].sort(
    (a, b) =>
      new Date(sessionTime(a)).getTime() - new Date(sessionTime(b)).getTime(),
  );
}

export function planetCoverageFromSessions(
  sessions: SessionWithAttempts[],
): MyVoicePlanetCoverage {
  const coverage = { ...EMPTY_COVERAGE };
  for (const session of sessions) {
    if (isVoicePlanet(session.planet)) {
      coverage[session.planet] += 1;
    }
  }
  return coverage;
}

function analysisRows(session: SessionWithAttempts) {
  const raw = session.session_analyses;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function readyAnalysis(session: SessionWithAttempts) {
  const rows = analysisRows(session);
  return rows.find((a) => a.status === "ready") ?? null;
}

function periodForIndex(
  index: number,
  total: number,
): "earlier" | "middle" | "recent" {
  if (total <= 3) return "recent";
  const third = total / 3;
  if (index < third) return "earlier";
  if (index < third * 2) return "middle";
  return "recent";
}

function pickRepresentativeSessions(
  sessions: SessionWithAttempts[],
  max: number,
): SessionWithAttempts[] {
  if (sessions.length <= max) return sessions;

  const withAnalysis = sessions.filter((s) => readyAnalysis(s));
  const pool = withAnalysis.length >= Math.min(5, max) ? withAnalysis : sessions;

  const earlierCount = Math.max(2, Math.floor(max * 0.3));
  const recentCount = Math.max(4, Math.floor(max * 0.5));
  const middleCount = Math.max(0, max - earlierCount - recentCount);

  const earlier = pool.slice(0, earlierCount);
  const recent = pool.slice(-recentCount);
  const middleStart = Math.floor(pool.length / 3);
  const middle = pool.slice(
    middleStart,
    middleStart + middleCount,
  );

  const seen = new Set<string>();
  const out: SessionWithAttempts[] = [];
  for (const s of [...earlier, ...middle, ...recent]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
  }
  return out.sort(
    (a, b) =>
      new Date(sessionTime(a)).getTime() - new Date(sessionTime(b)).getTime(),
  );
}

function toSnippet(
  session: SessionWithAttempts,
  index: number,
  total: number,
): MyVoiceAnalysisSnippet {
  const analysis = readyAnalysis(session);
  const strength =
    analysis?.strength_title && analysis.strength_description
      ? `${analysis.strength_title}: ${analysis.strength_description}`
      : analysis?.strength_description ?? null;
  const observation =
    analysis?.observation_title && analysis.observation_description
      ? `${analysis.observation_title}: ${analysis.observation_description}`
      : analysis?.observation_description ?? null;

  return {
    recordedAt: sessionTime(session),
    planet: isVoicePlanet(session.planet) ? session.planet : "uncategorized",
    source:
      session.source === "orbit" || session.source === "daily"
        ? session.source
        : "planet",
    period: periodForIndex(index, total),
    strength,
    observation,
  };
}

function parseOrbitContent(
  json: unknown,
): OrbitSummativeAnalysisContent | null {
  if (!json || typeof json !== "object") return null;
  const row = json as Record<string, unknown>;
  if (
    typeof row.whatBecameClearer !== "string" ||
    typeof row.howYourVoiceMoved !== "string"
  ) {
    return null;
  }
  return {
    whatBecameClearer: row.whatBecameClearer.trim(),
    whatKeptComingUp:
      typeof row.whatKeptComingUp === "string" ? row.whatKeptComingUp : "",
    howYourVoiceMoved: row.howYourVoiceMoved.trim(),
    carryThisWithYou:
      typeof row.carryThisWithYou === "string" ? row.carryThisWithYou : "",
    practicePrompt:
      typeof row.practicePrompt === "string" ? row.practicePrompt : null,
  };
}

export async function countCompletedOrbitsForUser(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("user_orbit_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) {
    console.error("[myVoice] completed orbit count failed:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function loadOrbitSummativeSnippets(
  userId: string,
): Promise<MyVoiceOrbitSummativeSnippet[]> {
  const supabase = await createClient();
  // Disambiguate dual FKs with user_orbit_progress (progress_id vs reverse summative_analysis_id).
  const { data, error } = await supabase
    .from("orbit_summative_analyses")
    .select(
      `
      orbit_key,
      completed_at,
      created_at,
      analysis_json,
      status,
      user_orbit_progress!orbit_summative_analyses_user_orbit_progress_id_fkey (
        orbit_title_snapshot,
        completed_at
      )
    `,
    )
    .eq("user_id", userId)
    .eq("status", "ready")
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(MY_VOICE_MAX_ORBIT_SUMMARIES);

  if (error) {
    console.error("[myVoice] orbit summatives fetch failed:", error.message);
    return [];
  }

  const snippets: MyVoiceOrbitSummativeSnippet[] = [];
  for (const row of data ?? []) {
    const content = parseOrbitContent(row.analysis_json);
    if (!content) continue;
    const progress = Array.isArray(row.user_orbit_progress)
      ? row.user_orbit_progress[0]
      : row.user_orbit_progress;
    const completedAt =
      (progress as { completed_at?: string | null } | null)?.completed_at ??
      (row.completed_at as string | null) ??
      (row.created_at as string);
    const title =
      (progress as { orbit_title_snapshot?: string | null } | null)
        ?.orbit_title_snapshot ??
      (row.orbit_key as string);

    snippets.push({
      orbitKey: row.orbit_key as string,
      orbitTitle: title,
      completedAt,
      whatBecameClearer: content.whatBecameClearer,
      howYourVoiceMoved: content.howYourVoiceMoved,
      whatKeptComingUp: content.whatKeptComingUp || null,
    });
  }

  return snippets;
}

export type MyVoiceHistoryBundle = {
  eligibleSessions: SessionWithAttempts[];
  planetCoverage: MyVoicePlanetCoverage;
  completedOrbitCount: number;
  latestSessionAt: string | null;
  firstSessionAt: string | null;
  synthesisInput: MyVoiceSynthesisInput | null;
};

export async function gatherMyVoiceHistory(
  userId: string,
): Promise<MyVoiceHistoryBundle> {
  const [allSessions, completedOrbitCount, orbitSummaries] = await Promise.all([
    getCompletedPracticeSessionsForUser(userId),
    countCompletedOrbitsForUser(userId),
    loadOrbitSummativeSnippets(userId),
  ]);

  const eligibleSessions = selectEligibleMyVoiceSessions(allSessions);
  const planetCoverage = planetCoverageFromSessions(eligibleSessions);
  const firstSessionAt =
    eligibleSessions.length > 0
      ? sessionTime(eligibleSessions[0]!)
      : null;
  const latestSessionAt =
    eligibleSessions.length > 0
      ? sessionTime(eligibleSessions[eligibleSessions.length - 1]!)
      : null;

  if (eligibleSessions.length === 0) {
    return {
      eligibleSessions,
      planetCoverage,
      completedOrbitCount,
      latestSessionAt,
      firstSessionAt,
      synthesisInput: null,
    };
  }

  const metricSamples = eligibleSessions.map((session) => {
    const analysis = readyAnalysis(session);
    return {
      recordedAt: sessionTime(session),
      metrics: (analysis?.journey_metrics as JourneyMetricResult[] | null) ?? null,
    };
  });

  const representative = pickRepresentativeSessions(
    eligibleSessions,
    MY_VOICE_MAX_ANALYSIS_SNIPPETS,
  );
  const total = eligibleSessions.length;
  const indexById = new Map(
    eligibleSessions.map((s, i) => [s.id, i] as const),
  );

  const representativeAnalyses = representative.map((session) =>
    toSnippet(session, indexById.get(session.id) ?? 0, total),
  );

  const synthesisInput: MyVoiceSynthesisInput = {
    totalSessions: eligibleSessions.length,
    planetCoverage,
    timeRange: {
      firstSessionAt: firstSessionAt!,
      latestSessionAt: latestSessionAt!,
    },
    metricTrends: computeAllMetricTrends(metricSamples),
    representativeAnalyses,
    orbitSummaries,
  };

  return {
    eligibleSessions,
    planetCoverage,
    completedOrbitCount,
    latestSessionAt,
    firstSessionAt,
    synthesisInput,
  };
}
