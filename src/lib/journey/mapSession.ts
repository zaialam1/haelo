import { getVoicePlanetById, type VoicePlanetId } from "@/lib/home/voicePlanets";
import {
  getOrbitByKey,
  getOrbitQuestionByKey,
} from "@/lib/orbits/catalog";
import { isPlanet } from "@/lib/prompts";
import { mapAnalysisRow, pickAnalysisRow } from "@/lib/sessions/analysisMap";
import type {
  SessionAnalysisRow,
  SessionWithAttempts,
} from "@/lib/sessions/types";
import type { ReflectionRow, SessionType } from "@/lib/topics/types";
import type {
  JourneyClip,
  JourneyPlanet,
  JourneySession,
} from "@/lib/journey/types";
import { journeySourceFromSessionSource } from "@/lib/journey/types";
import { projectJourneySessions } from "@/lib/journey/orbitClusters";

function resolvePlanet(topicId: string): JourneyPlanet {
  if (isPlanet(topicId)) return topicId;
  return "uncategorized";
}

function planetLabel(planet: JourneyPlanet): string {
  if (planet === "uncategorized") return "Earlier session";
  return getVoicePlanetById(planet)?.label ?? planet;
}

function clipFromRow(row: ReflectionRow): JourneyClip {
  return {
    id: row.id,
    promptText: row.prompt_text,
    questionId: row.question_id,
    recordedAt: row.recorded_at,
    audioUrl: row.audio_url,
    transcript: row.transcript,
    transcriptStatus: row.transcript?.trim() ? "ready" : null,
    durationSeconds: row.duration_seconds,
  };
}

function sessionFromClips(
  sessionId: string,
  rows: ReflectionRow[],
): JourneySession {
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );
  const first = sorted[0]!;
  const planet = resolvePlanet(first.topic_id);

  const haeloParts: string[] = [];
  for (const r of sorted) {
    if (r.stood_out?.trim()) haeloParts.push(r.stood_out.trim());
  }
  const voiceNotes = sorted.flatMap((r) => r.voice_notes ?? []);
  const themeLabel =
    sorted.map((r) => r.theme_label).find((t) => t?.trim()) ?? null;

  const prompts =
    first.prompt_texts && first.prompt_texts.length > 0
      ? first.prompt_texts
      : sorted.map((r) => r.prompt_text);

  return {
    sessionId,
    recordedAt: first.recorded_at,
    planet,
    planetLabel: planetLabel(planet),
    prompt: prompts[0] ?? first.prompt_text,
    promptId: first.question_id,
    sessionType: first.session_type as SessionType | null,
    clips: sorted.map(clipFromRow),
    userReflection: null,
    haeloObservation: haeloParts.length > 0 ? haeloParts.join("\n\n") : null,
    voiceNotes: [...new Set(voiceNotes)],
    themeLabel,
    changeObservation: null,
    isMilestone: false,
  };
}

/**
 * Map raw reflection rows into Journey sessions.
 * Rows that share a session_id collapse into one constellation star.
 * Rows without session_id each become their own session.
 */
export function mapReflectionsToJourneySessions(
  rows: ReflectionRow[],
): JourneySession[] {
  const bySession = new Map<string, ReflectionRow[]>();
  const singles: ReflectionRow[] = [];

  for (const row of rows) {
    if (row.session_id) {
      const list = bySession.get(row.session_id) ?? [];
      list.push(row);
      bySession.set(row.session_id, list);
    } else {
      singles.push(row);
    }
  }

  const sessions: JourneySession[] = [];

  for (const [sessionId, group] of bySession) {
    sessions.push(sessionFromClips(sessionId, group));
  }

  for (const row of singles) {
    sessions.push(sessionFromClips(row.id, [row]));
  }

  return sessions.sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
}

/**
 * Map completed practice sessions (+ attempts) into Journey stars.
 * One completed session → one constellation node (regardless of attempt count).
 */
export function mapPracticeSessionsToJourneySessions(
  rows: SessionWithAttempts[],
): JourneySession[] {
  const sessions: JourneySession[] = [];

  for (const row of rows) {
    if (row.status !== "completed") continue;

    const planet = resolvePlanet(row.planet);
    const attempts = [...(row.session_attempts ?? [])].sort(
      (a, b) => a.attempt_number - b.attempt_number,
    );

    const analysisRow = pickAnalysisRow(
      row.session_analyses as
        | SessionAnalysisRow
        | SessionAnalysisRow[]
        | null
        | undefined,
    );
    const analysis = mapAnalysisRow(analysisRow);

    const clips: JourneyClip[] = attempts.map((attempt) => ({
      id: attempt.id,
      promptText: row.prompt_text_snapshot,
      questionId: row.prompt_id,
      recordedAt: attempt.created_at,
      audioUrl: attempt.storage_path,
      transcript: attempt.transcript ?? null,
      transcriptStatus: attempt.transcript_status ?? null,
      durationSeconds: attempt.duration_seconds,
      attemptNumber: attempt.attempt_number,
    }));

    const recordedAt =
      row.completed_at ?? attempts[0]?.created_at ?? row.created_at;

    const strengthLine = analysis?.strength
      ? `${analysis.strength.title}: ${analysis.strength.description}`
      : null;
    const observationLine = analysis?.observation
      ? `${analysis.observation.title}: ${analysis.observation.description}`
      : null;

    const orbitDef = row.orbit_key ? getOrbitByKey(row.orbit_key) : undefined;
    const orbitQuestion = row.orbit_question_key
      ? getOrbitQuestionByKey(row.orbit_question_key)
      : undefined;
    // Prefer snapshotted prompt; fall back to current definition only if empty.
    const promptText =
      row.prompt_text_snapshot?.trim() ||
      orbitQuestion?.prompt ||
      row.prompt_text_snapshot;

    sessions.push({
      sessionId: row.id,
      recordedAt,
      planet,
      planetLabel: planetLabel(planet),
      prompt: promptText,
      promptId: row.prompt_id,
      sessionType: row.source === "daily" ? "daily" : "main",
      sourceType: journeySourceFromSessionSource(row.source),
      orbitKey: row.orbit_key ?? null,
      orbitQuestionKey: row.orbit_question_key ?? null,
      orbitTitle: row.orbit_key
        ? (orbitDef?.title ?? null)
        : null,
      userOrbitProgressId: row.user_orbit_progress_id ?? null,
      orbitSequenceNumber: orbitQuestion?.sequenceNumber ?? null,
      isOrbitCluster: false,
      clips,
      userReflection: row.user_reflection,
      feelingReflection: row.feeling_reflection ?? null,
      soundedLikeYou: row.sounded_like_you ?? null,
      authenticityChoice: row.authenticity_choice ?? null,
      analysisStatus: row.analysis_status,
      haeloObservation: strengthLine || observationLine,
      analysisStrength: analysis?.strength ?? null,
      analysisObservation: analysis?.observation ?? null,
      analysisEvidence: analysis?.evidence ?? null,
      analysisExperiment: analysis?.experiment ?? null,
      voiceNotes: [],
      themeLabel: null,
      changeObservation: analysis?.comparisonObservation ?? null,
      reviewHref:
        row.source === "orbit" && row.orbit_key
          ? `/orbits/${row.orbit_key}/session/${row.id}/review`
          : isPlanet(row.planet)
            ? `/session/${row.planet}/${row.id}/review`
            : null,
      isMilestone: false,
    });
  }

  return sessions.sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
}

export function mergeJourneySessions(
  ...groups: JourneySession[][]
): JourneySession[] {
  const byId = new Map<string, JourneySession>();
  for (const group of groups) {
    for (const session of group) {
      byId.set(session.sessionId, session);
    }
  }
  return [...byId.values()].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
}

/**
 * Project Journey sessions for the active filter.
 * Master Journey clusters completed Orbits; planet Journey keeps Orbit
 * responses as individual stars for that planet.
 */
export function filterSessionsByPlanet(
  sessions: JourneySession[],
  filter: "all" | VoicePlanetId,
): JourneySession[] {
  return projectJourneySessions(sessions, filter);
}

export function planetAccent(planet: JourneyPlanet): string {
  if (planet === "uncategorized") return "var(--violet)";
  return getVoicePlanetById(planet)?.color ?? "var(--violet)";
}
