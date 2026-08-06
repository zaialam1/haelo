import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import {
  filterSessionsByPlanet,
  mapPracticeSessionsToJourneySessions,
  mapReflectionsToJourneySessions,
  mergeJourneySessions,
} from "@/lib/journey/mapSession";
import type { JourneySession } from "@/lib/journey/types";
import {
  DEFAULT_PROGRESSION,
  getPlanetPageContent,
  getPlanetProgression,
  type PlanetPageContent,
  type PlanetProgression,
  type PlanetRecentSession,
} from "@/lib/planets/content";
import { planetLevelFromSessionCount } from "@/lib/prompts";
import { mapAnalysisRow, pickAnalysisRow } from "@/lib/sessions/analysisMap";
import type {
  SessionAnalysisRow,
  SessionWithAttempts,
} from "@/lib/sessions/types";
import { createClient } from "@/lib/supabase/server";
import type { ReflectionRow } from "@/lib/topics/types";

const RECENT_LIMIT = 6;
const GROWTH_LIMIT = 3;

const REFLECTION_SELECT =
  "id, user_id, topic_id, subtopic_id, prompt_text, recorded_at, audio_url, transcript, duration_seconds, confidence, meaningfulness, growth_signal, stood_out, voice_notes, theme_label, created_at, question_id, session_type, session_id, question_ids, prompt_texts, question_timestamps";

const SESSION_SELECT = `
  id,
  user_id,
  planet,
  prompt_id,
  prompt_text_snapshot,
  status,
  source,
  user_reflection,
  feeling_reflection,
  sounded_like_you,
  authenticity_choice,
  analysis_status,
  created_at,
  completed_at,
  session_attempts (
    id,
    session_id,
    attempt_number,
    storage_path,
    mime_type,
    file_size_bytes,
    duration_seconds,
    transcript,
    transcript_status,
    created_at
  ),
  session_analyses (
    id,
    session_id,
    status,
    strength_title,
    strength_description,
    observation_title,
    observation_description,
    evidence,
    experiment_title,
    experiment_instruction,
    comparison_observation,
    created_at,
    completed_at
  )
`;

export type VoicePlanetPageModel = {
  content: PlanetPageContent;
  progression: PlanetProgression;
  completedCount: number;
};

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function truncate(text: string, max = 72): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function sessionHref(session: JourneySession, planetId: VoicePlanetId): string {
  if (session.reviewHref) return session.reviewHref;
  // Legacy reflections land on Journey with this session focused.
  return `/journey?planet=${planetId}`;
}

function toRecentSession(
  session: JourneySession,
  planetId: VoicePlanetId,
): PlanetRecentSession {
  return {
    id: session.sessionId,
    dateLabel: shortDate(session.recordedAt),
    title: truncate(session.prompt),
    href: sessionHref(session, planetId),
  };
}

/**
 * Map in-progress practice sessions that already have audio so the planet
 * page can offer a path back into review.
 */
function mapInProgressPracticeSessions(
  rows: SessionWithAttempts[],
): JourneySession[] {
  const sessions: JourneySession[] = [];

  for (const row of rows) {
    if (row.status !== "in_progress") continue;
    const attempts = [...(row.session_attempts ?? [])].sort(
      (a, b) => a.attempt_number - b.attempt_number,
    );
    if (attempts.length === 0) continue;

    const analysisRow = pickAnalysisRow(
      row.session_analyses as
        | SessionAnalysisRow
        | SessionAnalysisRow[]
        | null
        | undefined,
    );
    const analysis = mapAnalysisRow(analysisRow);
    const recordedAt = attempts[0]?.created_at ?? row.created_at;

    sessions.push({
      sessionId: row.id,
      recordedAt,
      planet: row.planet,
      planetLabel: row.planet,
      prompt: row.prompt_text_snapshot,
      promptId: row.prompt_id,
      sessionType: row.source === "daily" ? "daily" : "main",
      clips: attempts.map((attempt) => ({
        id: attempt.id,
        promptText: row.prompt_text_snapshot,
        questionId: row.prompt_id,
        recordedAt: attempt.created_at,
        audioUrl: attempt.storage_path,
        transcript: attempt.transcript ?? null,
        transcriptStatus: attempt.transcript_status ?? null,
        durationSeconds: attempt.duration_seconds,
        attemptNumber: attempt.attempt_number,
      })),
      userReflection: row.user_reflection,
      feelingReflection: row.feeling_reflection ?? null,
      soundedLikeYou: row.sounded_like_you ?? null,
      authenticityChoice: row.authenticity_choice ?? null,
      analysisStatus: row.analysis_status,
      haeloObservation: null,
      analysisStrength: analysis?.strength ?? null,
      analysisObservation: analysis?.observation ?? null,
      analysisEvidence: analysis?.evidence ?? null,
      analysisExperiment: analysis?.experiment ?? null,
      voiceNotes: [],
      themeLabel: null,
      changeObservation: analysis?.comparisonObservation ?? null,
      reviewHref: `/session/${row.planet}/${row.id}/review`,
      isMilestone: false,
    });
  }

  return sessions;
}

function growthFromSessions(sessions: JourneySession[]): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  // Newest first — only real analysis / Haelo notes, never invented copy.
  for (const session of [...sessions].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  )) {
    const candidates = [
      session.analysisObservation?.description,
      session.analysisStrength?.description,
      session.changeObservation,
      session.haeloObservation,
    ];

    for (const raw of candidates) {
      const line = raw?.trim();
      if (!line) continue;
      const key = line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(line);
      if (lines.length >= GROWTH_LIMIT) return lines;
    }
  }

  return lines;
}

function progressionFromPractice(
  planetId: VoicePlanetId,
  completedCount: number,
): PlanetProgression {
  const base = getPlanetProgression(planetId) ?? DEFAULT_PROGRESSION;
  const level = planetLevelFromSessionCount(completedCount);

  return {
    rings: base.rings || level >= 3,
    moons: Math.min(3, Math.max(base.moons, level - 1)),
    glow: Math.min(1, base.glow + (level - 1) * 0.08),
    showOrbitalDust: base.showOrbitalDust || level >= 4,
  };
}

async function getPlanetPracticeSessions(
  userId: string,
  planetId: VoicePlanetId,
): Promise<SessionWithAttempts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_SELECT)
    .eq("user_id", userId)
    .eq("planet", planetId)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("[planet] sessions fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as SessionWithAttempts[];
}

async function getPlanetReflections(
  userId: string,
  planetId: VoicePlanetId,
): Promise<ReflectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reflections")
    .select(REFLECTION_SELECT)
    .eq("user_id", userId)
    .eq("topic_id", planetId)
    .order("recorded_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("[planet] reflections fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as ReflectionRow[];
}

/**
 * Build live planet-page content from the user's real practice history.
 * Empty growth / recent lists stay empty until real data exists.
 */
export async function getVoicePlanetPageData(
  userId: string | null,
  planetId: VoicePlanetId,
): Promise<VoicePlanetPageModel> {
  const base = getPlanetPageContent(planetId);

  if (!userId) {
    return {
      content: base,
      progression: getPlanetProgression(planetId),
      completedCount: 0,
    };
  }

  const [practiceRows, reflectionRows] = await Promise.all([
    getPlanetPracticeSessions(userId, planetId),
    getPlanetReflections(userId, planetId),
  ]);

  const completedPractice = practiceRows.filter((r) => r.status === "completed");
  const journeySessions = mergeJourneySessions(
    mapPracticeSessionsToJourneySessions(completedPractice),
    mapInProgressPracticeSessions(practiceRows),
    filterSessionsByPlanet(
      mapReflectionsToJourneySessions(reflectionRows),
      planetId,
    ),
  );

  const recentSessions = [...journeySessions]
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )
    .slice(0, RECENT_LIMIT)
    .map((session) => toRecentSession(session, planetId));

  const completedCount = completedPractice.length;
  const growth = growthFromSessions(journeySessions);

  return {
    content: {
      ...base,
      growth,
      recentSessions,
    },
    progression: progressionFromPractice(planetId, completedCount),
    completedCount,
  };
}
