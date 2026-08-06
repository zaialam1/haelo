import { SESSION_AUDIO_BUCKET } from "@/config/recording";
import { createClient } from "@/lib/supabase/client";
import { extensionForMime } from "@/lib/sessions/audio";
import type {
  SaveSessionInput,
  SaveSessionResult,
} from "@/lib/sessions/types";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function uploadAttemptAudio(opts: {
  userId: string;
  sessionId: string;
  attemptId: string;
  blob: Blob;
  mimeType: string;
}): Promise<string> {
  const supabase = createClient();
  const ext = extensionForMime(opts.mimeType);
  const storagePath = `${opts.userId}/${opts.sessionId}/${opts.attemptId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(SESSION_AUDIO_BUCKET)
    .upload(storagePath, opts.blob, {
      contentType: opts.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      uploadError.message || "Could not upload this recording. Try again.",
    );
  }

  return storagePath;
}

/**
 * Persist a planet (or daily) recording attempt.
 *
 * Attempt 1 (no sessionId):
 * 1. upload private audio
 * 2. create in_progress session (Journey waits until Finish)
 * 3. set analysis_status = pending
 * 4. create attempt with transcript_status = pending
 *
 * Attempt 2+ (sessionId provided):
 * 1. upload audio
 * 2. insert attempt on the same session
 *
 * On failure after upload, rolls back storage (and session if newly created).
 */
export async function saveSessionAttempt(
  input: SaveSessionInput,
): Promise<SaveSessionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sign in to save your session.");
  }

  if (!input.blob || input.blob.size === 0) {
    throw new Error("No audio was captured. Try recording again.");
  }

  const attemptNumber = input.attemptNumber ?? 1;
  const mimeType = input.mimeType || input.blob.type || "audio/webm";
  const attemptId = newId();
  let sessionId = input.sessionId;
  let createdNewSession = false;

  if (!sessionId) {
    if (attemptNumber !== 1) {
      throw new Error("A session is required for this recording attempt.");
    }
    sessionId = newId();
    createdNewSession = true;
  }

  const storagePath = await uploadAttemptAudio({
    userId: user.id,
    sessionId,
    attemptId,
    blob: input.blob,
    mimeType,
  });

  if (createdNewSession) {
    const { error: sessionError } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: user.id,
      planet: input.planet,
      prompt_id: input.promptId,
      prompt_text_snapshot: input.promptTextSnapshot,
      status: "in_progress",
      source: input.source ?? "planet",
      analysis_status: "pending",
      completed_at: null,
    });

    if (sessionError) {
      await supabase.storage.from(SESSION_AUDIO_BUCKET).remove([storagePath]);
      throw new Error(
        sessionError.message || "Could not create your session record.",
      );
    }
  } else {
    const { data: existing, error: existingError } = await supabase
      .from("sessions")
      .select("id, user_id, status")
      .eq("id", sessionId)
      .maybeSingle();

    if (existingError || !existing) {
      await supabase.storage.from(SESSION_AUDIO_BUCKET).remove([storagePath]);
      throw new Error("Could not find this session. Try starting again.");
    }
    if (existing.user_id !== user.id) {
      await supabase.storage.from(SESSION_AUDIO_BUCKET).remove([storagePath]);
      throw new Error("You can only add recordings to your own sessions.");
    }
  }

  const liveTranscript = input.transcript?.trim() || null;

  const { error: attemptError } = await supabase
    .from("session_attempts")
    .insert({
      id: attemptId,
      session_id: sessionId,
      attempt_number: attemptNumber,
      storage_path: storagePath,
      mime_type: mimeType,
      file_size_bytes: input.blob.size,
      duration_seconds: Math.max(0, Math.round(input.durationSeconds)),
      transcript: liveTranscript,
      transcript_status: liveTranscript ? "ready" : "pending",
    });

  if (attemptError) {
    await supabase.storage.from(SESSION_AUDIO_BUCKET).remove([storagePath]);
    if (createdNewSession) {
      await supabase.from("sessions").delete().eq("id", sessionId);
    }
    throw new Error(
      attemptError.message || "Could not save this recording. Try again.",
    );
  }

  return { sessionId, attemptId, storagePath };
}

/**
 * Fire-and-forget kickoff for transcript + analysis processing.
 * Safe to call after save; failures are handled server-side as status updates.
 */
export function kickoffSessionProcessing(sessionId: string): void {
  if (typeof window === "undefined") return;
  void fetch(`/api/sessions/${sessionId}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).catch(() => {
    // Processing continues independently; UI polls session status.
  });
}
