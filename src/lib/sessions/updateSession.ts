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
 */
export async function completeSession(sessionId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const completedAt = new Date().toISOString();

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
