import { SESSION_AUDIO_BUCKET } from "@/config/recording";
import {
  generateSessionAnalysis,
  getAnalysisProviderStatus,
} from "@/lib/sessions/analysisProvider";
import {
  getTranscriptionProviderStatus,
  transcribeAudio,
} from "@/lib/sessions/transcription";
import { createClient } from "@/lib/supabase/server";
import type {
  AnalysisEvidence,
  SessionAttemptRow,
  SessionRow,
} from "@/lib/sessions/types";

type ProcessResult = {
  transcriptStatus: string;
  analysisStatus: string;
  message: string;
};

async function markAttemptTranscript(
  attemptId: string,
  status: "pending" | "ready" | "failed" | "unavailable",
  transcript: string | null,
) {
  const supabase = await createClient();
  await supabase
    .from("session_attempts")
    .update({
      transcript_status: status,
      transcript,
    })
    .eq("id", attemptId);
}

async function upsertAnalysisPending(sessionId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("session_analyses")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("session_analyses")
      .update({ status: "pending", completed_at: null })
      .eq("session_id", sessionId);
  } else {
    await supabase.from("session_analyses").insert({
      session_id: sessionId,
      status: "pending",
    });
  }

  await supabase
    .from("sessions")
    .update({ analysis_status: "pending" })
    .eq("id", sessionId);
}

async function markAnalysisFailed(sessionId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from("sessions")
    .update({ analysis_status: "failed" })
    .eq("id", sessionId);

  const { data: existing } = await supabase
    .from("session_analyses")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("session_analyses")
      .update({ status: "failed", completed_at: now })
      .eq("session_id", sessionId);
  } else {
    await supabase.from("session_analyses").insert({
      session_id: sessionId,
      status: "failed",
      completed_at: now,
    });
  }
}

async function saveReadyAnalysis(
  sessionId: string,
  payload: {
    strength: { title: string; description: string };
    observation: { title: string; description: string };
    evidence: AnalysisEvidence[];
    experiment: { title: string; instruction: string };
    comparisonObservation?: string;
  },
) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const row = {
    status: "ready" as const,
    strength_title: payload.strength.title,
    strength_description: payload.strength.description,
    observation_title: payload.observation.title,
    observation_description: payload.observation.description,
    evidence: payload.evidence,
    experiment_title: payload.experiment.title,
    experiment_instruction: payload.experiment.instruction,
    comparison_observation: payload.comparisonObservation ?? null,
    completed_at: now,
  };

  const { data: existing } = await supabase
    .from("session_analyses")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("session_analyses")
      .update(row)
      .eq("session_id", sessionId);
  } else {
    await supabase.from("session_analyses").insert({
      session_id: sessionId,
      ...row,
    });
  }

  await supabase
    .from("sessions")
    .update({ analysis_status: "ready" })
    .eq("id", sessionId);
}

async function signedUrlForPath(storagePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(SESSION_AUDIO_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

async function ensureAttemptTranscript(
  attempt: SessionAttemptRow,
): Promise<string | null> {
  if (attempt.transcript_status === "ready" && attempt.transcript?.trim()) {
    return attempt.transcript;
  }

  const transcriptionStatus = getTranscriptionProviderStatus();
  if (!transcriptionStatus.available) {
    await markAttemptTranscript(attempt.id, "unavailable", null);
    return null;
  }

  try {
    const signedUrl = await signedUrlForPath(attempt.storage_path);
    const result = await transcribeAudio({
      storagePath: attempt.storage_path,
      mimeType: attempt.mime_type,
      signedUrl: signedUrl ?? undefined,
    });
    await markAttemptTranscript(attempt.id, "ready", result.text);
    return result.text;
  } catch {
    await markAttemptTranscript(attempt.id, "failed", null);
    return null;
  }
}

/**
 * Process transcript + analysis for a session.
 * Honest about missing providers: marks unavailable/failed, never fabricates content.
 */
export async function processSessionAnalysis(
  sessionId: string,
  userId: string,
): Promise<ProcessResult> {
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select(
      `
      id,
      user_id,
      planet,
      prompt_text_snapshot,
      analysis_status,
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
      )
    `,
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sessionError || !session) {
    throw new Error("Session not found.");
  }

  const sessionRow = session as SessionRow & {
    session_attempts: SessionAttemptRow[];
  };

  const attempts = [...(sessionRow.session_attempts ?? [])].sort(
    (a, b) => a.attempt_number - b.attempt_number,
  );
  const primary = attempts[0];
  if (!primary) {
    throw new Error("Session has no recordings to analyze.");
  }

  await upsertAnalysisPending(sessionId);

  const firstTranscript = await ensureAttemptTranscript(primary);
  const second = attempts.find((a) => a.attempt_number === 2) ?? null;
  const secondTranscript = second
    ? await ensureAttemptTranscript(second)
    : null;

  const analysisStatus = getAnalysisProviderStatus();
  if (!analysisStatus.available) {
    await markAnalysisFailed(sessionId);
    return {
      transcriptStatus: firstTranscript ? "ready" : "unavailable",
      analysisStatus: "failed",
      message: analysisStatus.reason,
    };
  }

  try {
    const result = await generateSessionAnalysis({
      sessionId,
      planet: sessionRow.planet,
      promptText: sessionRow.prompt_text_snapshot,
      transcript: second ? secondTranscript : firstTranscript,
      attemptNumber: second ? 2 : 1,
      priorTranscript: second ? firstTranscript : undefined,
    });

    await saveReadyAnalysis(sessionId, result);
    return {
      transcriptStatus: firstTranscript ? "ready" : "unavailable",
      analysisStatus: "ready",
      message: "Analysis complete.",
    };
  } catch (e) {
    await markAnalysisFailed(sessionId);
    return {
      transcriptStatus: firstTranscript ? "ready" : "unavailable",
      analysisStatus: "failed",
      message:
        e instanceof Error ? e.message : "Analysis could not be completed.",
    };
  }
}
