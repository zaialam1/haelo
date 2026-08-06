import { createClient } from "@/lib/supabase/server";
import { buildJourneyViewModel } from "@/lib/journey/layout";
import { buildOrbitClusterSessions } from "@/lib/journey/orbitClusters";
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
import type {
  OrbitSummativeAnalysisRow,
  UserOrbitProgressRow,
} from "@/lib/orbits/types";
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

/** Completed Orbit progress rows — used to build master Journey clusters. */
export async function getCompletedOrbitProgressForUser(
  userId: string,
): Promise<UserOrbitProgressRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: true });

  if (error) {
    console.error("[journey] orbit progress fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as UserOrbitProgressRow[];
}

/** All Orbit progress — title snapshots for historical Journey labels. */
export async function getAllOrbitProgressForUser(
  userId: string,
): Promise<UserOrbitProgressRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_activity_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[journey] orbit progress list failed:", error.message);
    return [];
  }

  return (data ?? []) as UserOrbitProgressRow[];
}

export async function getOrbitSummativeAnalysesForProgressIds(
  userId: string,
  progressIds: string[],
): Promise<Map<string, OrbitSummativeAnalysisRow>> {
  const map = new Map<string, OrbitSummativeAnalysisRow>();
  if (progressIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orbit_summative_analyses")
    .select("*")
    .eq("user_id", userId)
    .in("user_orbit_progress_id", progressIds);

  if (error) {
    console.error("[journey] orbit summative fetch failed:", error.message);
    return map;
  }

  for (const row of (data ?? []) as OrbitSummativeAnalysisRow[]) {
    map.set(row.user_orbit_progress_id, row);
  }
  return map;
}

export async function getJourneyPageData(
  userId: string | null,
  opts?: { preview?: boolean },
): Promise<JourneyViewModel> {
  const [reflectionRows, practiceRows, allOrbitProgress] = userId
    ? await Promise.all([
        getAllReflectionsForUser(userId),
        getCompletedPracticeSessionsForUser(userId),
        getAllOrbitProgressForUser(userId),
      ])
    : [[], [], [] as UserOrbitProgressRow[]];

  const completedOrbitProgress = allOrbitProgress.filter(
    (p) => p.status === "completed" && p.completed_at,
  );

  const titleByProgressId = new Map(
    allOrbitProgress
      .filter((p) => p.orbit_title_snapshot?.trim())
      .map((p) => [p.id, p.orbit_title_snapshot!.trim()] as const),
  );

  let practiceSessions = mapPracticeSessionsToJourneySessions(practiceRows);
  // Prefer title snapshot from progress so renamed Orbits keep historical names.
  practiceSessions = practiceSessions.map((s) => {
    if (!s.userOrbitProgressId) return s;
    const snapshot = titleByProgressId.get(s.userOrbitProgressId);
    if (!snapshot) return s;
    return { ...s, orbitTitle: snapshot };
  });

  const reflectionSessions = mapReflectionsToJourneySessions(reflectionRows);

  const analysesByProgressId = userId
    ? await getOrbitSummativeAnalysesForProgressIds(
        userId,
        completedOrbitProgress.map((p) => p.id),
      )
    : new Map<string, OrbitSummativeAnalysisRow>();

  const orbitClusters = buildOrbitClusterSessions(
    practiceSessions,
    completedOrbitProgress,
    analysesByProgressId,
  );

  // Model holds individuals + clusters. Client projection chooses which to show.
  const realSessions = mergeJourneySessions(
    reflectionSessions,
    practiceSessions,
    orbitClusters,
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
