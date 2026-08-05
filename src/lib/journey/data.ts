import { createClient } from "@/lib/supabase/server";
import { buildJourneyViewModel } from "@/lib/journey/layout";
import { mapReflectionsToJourneySessions } from "@/lib/journey/mapSession";
import {
  JOURNEY_PREVIEW_SESSIONS,
  shouldUseJourneyPreview,
} from "@/lib/journey/preview";
import type { JourneyViewModel } from "@/lib/journey/types";
import type { ReflectionRow } from "@/lib/topics/types";

const REFLECTION_SELECT =
  "id, user_id, topic_id, subtopic_id, prompt_text, recorded_at, audio_url, transcript, duration_seconds, confidence, meaningfulness, growth_signal, stood_out, voice_notes, theme_label, created_at, question_id, session_type, session_id, question_ids, prompt_texts, question_timestamps";

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

export async function getJourneyPageData(
  userId: string | null,
  opts?: { preview?: boolean },
): Promise<JourneyViewModel> {
  const rows = userId ? await getAllReflectionsForUser(userId) : [];
  const realSessions = mapReflectionsToJourneySessions(rows);

  const usePreview = shouldUseJourneyPreview({
    forcePreviewParam: Boolean(opts?.preview),
    hasRealSessions: realSessions.length > 0,
  });

  if (usePreview) {
    return buildJourneyViewModel(JOURNEY_PREVIEW_SESSIONS, { isPreview: true });
  }

  return buildJourneyViewModel(realSessions, { isPreview: false });
}
