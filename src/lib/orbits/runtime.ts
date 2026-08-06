import { createClient } from "@/lib/supabase/server";
import { getOrbitByKey } from "./catalog";
import type {
  OrbitDefinition,
  OrbitQuestionDefinition,
  UserOrbitProgressRow,
} from "./types";

export type OrbitQuestionSessionSummary = {
  id: string;
  orbit_question_key: string | null;
  status: "in_progress" | "completed";
  created_at: string;
};

export type ResolvedOrbitReflection = {
  orbit: OrbitDefinition;
  progress: UserOrbitProgressRow;
  question: OrbitQuestionDefinition;
  /** Existing in-progress session for this question, if any. */
  openSessionId: string | null;
  completedCount: number;
};

/**
 * Load completed + in-progress orbit sessions for a progress row.
 */
export async function listOrbitProgressSessions(
  userId: string,
  progressId: string,
): Promise<OrbitQuestionSessionSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, orbit_question_key, status, created_at")
    .eq("user_id", userId)
    .eq("user_orbit_progress_id", progressId)
    .eq("source", "orbit")
    .in("status", ["in_progress", "completed"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[orbits] session list failed:", error.message);
    return [];
  }

  return (data ?? []) as OrbitQuestionSessionSummary[];
}

/**
 * Resolve the next reflection the user should work on.
 * Skips questions that already have a completed canonical session.
 * Prefers resuming an in-progress session for the next incomplete question.
 */
export async function resolveNextOrbitReflection(
  userId: string,
  orbitKey: string,
  progress: UserOrbitProgressRow,
): Promise<
  | { kind: "reflection"; data: ResolvedOrbitReflection }
  | { kind: "completed"; orbit: OrbitDefinition; progress: UserOrbitProgressRow }
  | { kind: "missing_orbit" }
> {
  const orbit = getOrbitByKey(orbitKey);
  if (!orbit || !orbit.isActive) {
    return { kind: "missing_orbit" };
  }

  if (progress.status === "completed") {
    return { kind: "completed", orbit, progress };
  }

  const sessions = await listOrbitProgressSessions(userId, progress.id);

  const completedKeys = new Set(
    sessions
      .filter((s) => s.status === "completed" && s.orbit_question_key)
      .map((s) => s.orbit_question_key as string),
  );

  const allDone = orbit.questions.every((q) => completedKeys.has(q.questionKey));
  if (allDone) {
    // Heal progress row if sessions finished but status lagged (refresh / race).
    const supabase = await createClient();
    const now = new Date().toISOString();
    await supabase
      .from("user_orbit_progress")
      .update({
        status: "completed",
        current_question_index: 6,
        completed_at: progress.completed_at ?? now,
        last_activity_at: now,
        updated_at: now,
      })
      .eq("id", progress.id)
      .eq("user_id", userId);
    return {
      kind: "completed",
      orbit,
      progress: {
        ...progress,
        status: "completed",
        current_question_index: 6,
        completed_at: progress.completed_at ?? now,
      },
    };
  }

  const question =
    orbit.questions.find((q) => !completedKeys.has(q.questionKey)) ??
    orbit.questions[0];

  const openForQuestion = sessions
    .filter(
      (s) =>
        s.status === "in_progress" &&
        s.orbit_question_key === question.questionKey,
    )
    .at(-1);

  return {
    kind: "reflection",
    data: {
      orbit,
      progress,
      question,
      openSessionId: openForQuestion?.id ?? null,
      completedCount: completedKeys.size,
    },
  };
}

/**
 * Canonical completed sessions for summative analysis, ordered by sequence.
 */
export async function getCanonicalOrbitSessions(
  userId: string,
  progressId: string,
  orbit: OrbitDefinition,
): Promise<
  Array<{
    question: OrbitQuestionDefinition;
    sessionId: string;
    promptText: string;
    transcript: string | null;
    analysisSummary: string | null;
  }>
> {
  const supabase = await createClient();
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(
      `
      id,
      orbit_question_key,
      prompt_text_snapshot,
      status,
      session_attempts (
        attempt_number,
        transcript,
        transcript_status
      ),
      session_analyses (
        status,
        strength_title,
        strength_description,
        observation_title,
        observation_description
      )
    `,
    )
    .eq("user_id", userId)
    .eq("user_orbit_progress_id", progressId)
    .eq("source", "orbit")
    .eq("status", "completed");

  if (error) {
    throw new Error(error.message || "Could not load Orbit responses.");
  }

  const byQuestion = new Map<string, (typeof sessions)[number]>();
  for (const row of sessions ?? []) {
    const key = row.orbit_question_key as string | null;
    if (!key) continue;
    // Prefer the earliest completed session as canonical.
    if (!byQuestion.has(key)) {
      byQuestion.set(key, row);
    }
  }

  const results: Array<{
    question: OrbitQuestionDefinition;
    sessionId: string;
    promptText: string;
    transcript: string | null;
    analysisSummary: string | null;
  }> = [];

  for (const question of orbit.questions) {
    const row = byQuestion.get(question.questionKey);
    if (!row) continue;

    const attempts = Array.isArray(row.session_attempts)
      ? row.session_attempts
      : row.session_attempts
        ? [row.session_attempts]
        : [];
    const preferred =
      attempts.find((a) => a.attempt_number === 2) ??
      attempts.find((a) => a.attempt_number === 1) ??
      attempts[0];

    const analyses = Array.isArray(row.session_analyses)
      ? row.session_analyses
      : row.session_analyses
        ? [row.session_analyses]
        : [];
    const analysis = analyses.find((a) => a.status === "ready") ?? analyses[0];

    let analysisSummary: string | null = null;
    if (analysis?.status === "ready") {
      const parts = [
        analysis.strength_title && analysis.strength_description
          ? `${analysis.strength_title}: ${analysis.strength_description}`
          : null,
        analysis.observation_title && analysis.observation_description
          ? `${analysis.observation_title}: ${analysis.observation_description}`
          : null,
      ].filter(Boolean);
      analysisSummary = parts.length ? parts.join(" ") : null;
    }

    results.push({
      question,
      sessionId: row.id as string,
      promptText: (row.prompt_text_snapshot as string) || question.prompt,
      transcript: (preferred?.transcript as string | null) ?? null,
      analysisSummary,
    });
  }

  return results;
}
