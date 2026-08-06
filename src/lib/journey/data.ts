import { createClient } from "@/lib/supabase/server";
import { buildJourneyViewModel } from "@/lib/journey/layout";
import {
  mapPracticeSessionsToJourneySessions,
  mapReflectionsToJourneySessions,
  mergeJourneySessions,
} from "@/lib/journey/mapSession";
import {
  JOURNEY_PREVIEW_SESSIONS,
  shouldUseJourneyPreview,
} from "@/lib/journey/preview";
import type { JourneyViewModel } from "@/lib/journey/types";
import type { SessionWithAttempts } from "@/lib/sessions/types";
import type { ReflectionRow } from "@/lib/topics/types";

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
  orbit_key,
  orbit_question_key,
  user_orbit_progress_id,
  orbit_version,
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

export async function getAllReflectionsForUser(
  userId: string,
): Promise<ReflectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reflections")
    .select(REFLECTION_SELECT)
    .eq("user_id", userId)
    .order("recorded_at", { ascending: true });

  if (error) {
    console.error("[journey] reflections fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as ReflectionRow[];
}

export async function getCompletedPracticeSessionsForUser(
  userId: string,
): Promise<SessionWithAttempts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_SELECT)
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("completed_at", { ascending: true });

  if (error) {
    console.error("[journey] sessions fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as SessionWithAttempts[];
}

export async function getJourneyPageData(
  userId: string | null,
  opts?: { preview?: boolean },
): Promise<JourneyViewModel> {
  const [reflectionRows, practiceRows] = userId
    ? await Promise.all([
        getAllReflectionsForUser(userId),
        getCompletedPracticeSessionsForUser(userId),
      ])
    : [[], []];

  const realSessions = mergeJourneySessions(
    mapReflectionsToJourneySessions(reflectionRows),
    mapPracticeSessionsToJourneySessions(practiceRows),
  );

  const usePreview = shouldUseJourneyPreview({
    forcePreviewParam: Boolean(opts?.preview),
    hasRealSessions: realSessions.length > 0,
  });

  if (usePreview) {
    return buildJourneyViewModel(JOURNEY_PREVIEW_SESSIONS, { isPreview: true });
  }

  return buildJourneyViewModel(realSessions, { isPreview: false });
}
