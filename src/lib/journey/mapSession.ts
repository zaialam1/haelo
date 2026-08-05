import { getVoicePlanetById, type VoicePlanetId } from "@/lib/home/voicePlanets";
import { isPlanet } from "@/lib/prompts";
import type { ReflectionRow, SessionType } from "@/lib/topics/types";
import type {
  JourneyClip,
  JourneyPlanet,
  JourneySession,
} from "@/lib/journey/types";

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

  const attuneParts: string[] = [];
  for (const r of sorted) {
    if (r.stood_out?.trim()) attuneParts.push(r.stood_out.trim());
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
    attuneObservation: attuneParts.length > 0 ? attuneParts.join("\n\n") : null,
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

export function filterSessionsByPlanet(
  sessions: JourneySession[],
  filter: "all" | VoicePlanetId,
): JourneySession[] {
  if (filter === "all") return sessions;
  return sessions.filter((s) => s.planet === filter);
}

export function planetAccent(planet: JourneyPlanet): string {
  if (planet === "uncategorized") return "var(--violet)";
  return getVoicePlanetById(planet)?.color ?? "var(--violet)";
}
