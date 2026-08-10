"use server";

import { revalidatePath } from "next/cache";
import { SESSION_AUDIO_BUCKET } from "@/config/recording";
import { createClient } from "@/lib/supabase/server";

export type DeletableSessionSummary = {
  id: string;
  planet: string | null;
  promptText: string | null;
  source: string | null;
  completedAt: string | null;
  createdAt: string;
};

/**
 * List recent completed (or abandoned in-progress) sessions the user can delete.
 * Entire-session deletion: audio, transcript, analysis, and Journey star go together.
 */
export async function listDeletableSessionsAction(): Promise<
  DeletableSessionSummary[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, planet, prompt_text_snapshot, source, completed_at, created_at, status",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    planet: (row.planet as string | null) ?? null,
    promptText: (row.prompt_text_snapshot as string | null) ?? null,
    source: (row.source as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

/**
 * Delete an entire session owned by the signed-in user:
 * - remove audio objects from Storage
 * - delete the sessions row (attempts + analyses cascade)
 * Journey star disappears with the completed session.
 */
export async function deleteSessionAction(
  sessionId: string,
): Promise<{ ok: boolean; message?: string }> {
  const id = sessionId.trim();
  if (!id) return { ok: false, message: "Missing session." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to continue." };

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (sessionError || !session || session.user_id !== user.id) {
    return { ok: false, message: "Session not found." };
  }

  const { data: attempts } = await supabase
    .from("session_attempts")
    .select("storage_path")
    .eq("session_id", id);

  const paths = (attempts ?? [])
    .map((a) => a.storage_path as string | null)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(SESSION_AUDIO_BUCKET).remove(paths);
  }

  const { error: deleteError } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return {
      ok: false,
      message: deleteError.message || "Could not delete this recording.",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/journey");
  revalidatePath("/home");
  return { ok: true };
}
