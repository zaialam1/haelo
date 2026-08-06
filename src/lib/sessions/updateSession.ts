import { createClient } from "@/lib/supabase/client";
import type {
  AuthenticityChoice,
  SessionReflectionUpdate,
} from "@/lib/sessions/types";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sign in to update your session.");
  }
  return { supabase, user };
}

export async function updateSessionReflection(
  sessionId: string,
  update: SessionReflectionUpdate,
): Promise<void> {
  const { supabase, user } = await requireUser();

  const patch: Record<string, string | null> = {};
  if (update.feelingReflection !== undefined) {
    patch.feeling_reflection = update.feelingReflection;
  }
  if (update.soundedLikeYou !== undefined) {
    patch.sounded_like_you = update.soundedLikeYou;
  }
  if (update.userReflection !== undefined) {
    const trimmed = update.userReflection?.trim() || null;
    patch.user_reflection = trimmed;
  }

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase
    .from("sessions")
    .update(patch)
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Could not save your reflection.");
  }
}

export async function updateAuthenticityChoice(
  sessionId: string,
  choice: AuthenticityChoice | null,
): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("sessions")
    .update({ authenticity_choice: choice })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Could not save your choice.");
  }
}

/**
 * Mark a session completed so it appears as one Journey star.
 * Safe to call more than once.
 *
 * When the session is Orbit-sourced, advances user_orbit_progress.
 * Does NOT touch normal planet progression indexes.
 */
export async function completeSession(sessionId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const completedAt = new Date().toISOString();

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select(
      "id, source, orbit_question_key, user_orbit_progress_id, status",
    )
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !session) {
    throw new Error(fetchError?.message || "Could not find this session.");
  }

  if (session.status !== "completed") {
    const { error } = await supabase
      .from("sessions")
      .update({
        status: "completed",
        completed_at: completedAt,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message || "Could not finish this session.");
    }
  }

  if (
    session.source === "orbit" &&
    session.user_orbit_progress_id &&
    session.orbit_question_key
  ) {
    await advanceOrbitProgressAfterQuestion({
      supabase,
      userId: user.id,
      progressId: session.user_orbit_progress_id,
      orbitQuestionKey: session.orbit_question_key,
    });
  }
}

async function advanceOrbitProgressAfterQuestion(opts: {
  supabase: ReturnType<typeof createClient>;
  userId: string;
  progressId: string;
  orbitQuestionKey: string;
}): Promise<void> {
  const { getOrbitByKey, getOrbitQuestionByKey } = await import(
    "@/lib/orbits/catalog"
  );

  const question = getOrbitQuestionByKey(opts.orbitQuestionKey);
  if (!question) return;

  const { data: progress } = await opts.supabase
    .from("user_orbit_progress")
    .select("*")
    .eq("id", opts.progressId)
    .eq("user_id", opts.userId)
    .maybeSingle();

  if (!progress || progress.status === "completed") return;

  const orbit = getOrbitByKey(progress.orbit_key);
  if (!orbit) return;

  const { data: sessions } = await opts.supabase
    .from("sessions")
    .select("orbit_question_key")
    .eq("user_id", opts.userId)
    .eq("user_orbit_progress_id", opts.progressId)
    .eq("source", "orbit")
    .eq("status", "completed");

  const completedKeys = new Set(
    (sessions ?? [])
      .map((s) => s.orbit_question_key as string | null)
      .filter(Boolean),
  );
  completedKeys.add(opts.orbitQuestionKey);

  const allRequiredDone = orbit.questions.every((q) =>
    completedKeys.has(q.questionKey),
  );

  const nextIndex = Math.min(
    6,
    Math.max(question.sequenceNumber + 1, progress.current_question_index),
  );
  const now = new Date().toISOString();

  const { data: updated } = await opts.supabase
    .from("user_orbit_progress")
    .update({
      status: allRequiredDone ? "completed" : "in_progress",
      current_question_index: allRequiredDone ? 6 : nextIndex,
      last_activity_at: now,
      updated_at: now,
      completed_at: allRequiredDone ? now : null,
    })
    .eq("id", opts.progressId)
    .select("*")
    .single();

  if (allRequiredDone && updated && !updated.summative_analysis_id) {
    const { data: analysis } = await opts.supabase
      .from("orbit_summative_analyses")
      .insert({
        user_id: opts.userId,
        orbit_key: progress.orbit_key,
        user_orbit_progress_id: opts.progressId,
        status: "pending",
        analysis_json: null,
        practice_prompt: null,
        version: 1,
      })
      .select("id")
      .single();

    if (analysis) {
      await opts.supabase
        .from("user_orbit_progress")
        .update({
          summative_analysis_id: analysis.id,
          updated_at: now,
        })
        .eq("id", opts.progressId);
    }
  }
}
