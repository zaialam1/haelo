/**
 * Persist / load My Voice summaries (owner-scoped via RLS).
 */

import { createClient } from "@/lib/supabase/server";
import { parseStoredMyVoiceContent } from "./parse";
import { MY_VOICE_PROMPT_VERSION } from "./thresholds";
import type {
  MyVoiceSummaryContent,
  UserVoiceSummaryRow,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

export async function getOwnVoiceSummaryRow(
  userId: string,
): Promise<UserVoiceSummaryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_voice_summaries")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Migration not applied yet — treat as no cache.
    if (/user_voice_summaries|does not exist|schema cache/i.test(error.message)) {
      console.warn(
        "[myVoice] user_voice_summaries missing — apply migration 20260809_user_voice_summaries.sql",
      );
      return null;
    }
    console.error("[myVoice] load summary failed:", error.message);
    return null;
  }

  if (!data) return null;

  const content = parseStoredMyVoiceContent(data.synthesis_json);
  if (!content) {
    console.error("[myVoice] stored synthesis_json invalid");
    return null;
  }

  return {
    ...(data as Omit<UserVoiceSummaryRow, "synthesis_json">),
    synthesis_json: content,
  };
}

export async function upsertOwnVoiceSummary(opts: {
  userId: string;
  content: MyVoiceSummaryContent;
  sessionCount: number;
  latestSessionAt: string | null;
  completedOrbitCount: number;
  modelVersion: string | null;
  promptVersion?: string;
}): Promise<UserVoiceSummaryRow | null> {
  const supabase = await createClient();
  const generatedAt = nowIso();
  const payload = {
    user_id: opts.userId,
    summary_version: 1,
    generated_at: generatedAt,
    session_count_at_generation: opts.sessionCount,
    latest_session_at_generation: opts.latestSessionAt,
    completed_orbit_count_at_generation: opts.completedOrbitCount,
    synthesis_json: opts.content,
    model_version: opts.modelVersion,
    prompt_version: opts.promptVersion ?? MY_VOICE_PROMPT_VERSION,
    status: "ready" as const,
    updated_at: generatedAt,
  };

  const { data, error } = await supabase
    .from("user_voice_summaries")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[myVoice] upsert failed:", error?.message);
    return null;
  }

  const content = parseStoredMyVoiceContent(data.synthesis_json);
  if (!content) return null;

  return {
    ...(data as Omit<UserVoiceSummaryRow, "synthesis_json">),
    synthesis_json: content,
  };
}
