"use server";

import { trackEvent } from "@/lib/analytics/track";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisFeedbackReason } from "@/lib/safety/types";
import { ANALYSIS_FEEDBACK_REASONS } from "@/lib/safety/types";

function isAnalysisReason(
  value: string | null | undefined,
): value is AnalysisFeedbackReason {
  if (!value) return false;
  return ANALYSIS_FEEDBACK_REASONS.some((r) => r.value === value);
}

/** General product feedback from Settings → Help. */
export async function submitProductFeedbackAction(input: {
  message: string;
  context?: string;
}): Promise<{ ok: boolean; message?: string }> {
  const message = input.message.trim().slice(0, 2000);
  if (message.length < 1) {
    return { ok: false, message: "Write a short note first." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to continue." };

  const { error } = await supabase.from("user_feedback").insert({
    user_id: user.id,
    message,
    context: input.context?.trim().slice(0, 200) || null,
  });

  if (error) {
    return { ok: false, message: "Couldn’t send feedback. Try again." };
  }

  trackEvent("product_feedback_sent", {
    userId: user.id,
    context: input.context?.trim().slice(0, 80) || "settings_help",
  });

  return { ok: true };
}

/** Subtle "Was this useful?" under individual AI analysis. */
export async function submitAnalysisFeedbackAction(input: {
  sessionId: string;
  rating: "up" | "down";
  reason?: AnalysisFeedbackReason | null;
  details?: string;
  model?: string | null;
  promptVersion?: string | null;
}): Promise<{ ok: boolean; message?: string }> {
  if (input.rating !== "up" && input.rating !== "down") {
    return { ok: false, message: "Invalid rating." };
  }
  const sessionId = input.sessionId.trim();
  if (!sessionId) return { ok: false, message: "Missing session." };

  const reason =
    input.rating === "down" && isAnalysisReason(input.reason)
      ? input.reason
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sign in to continue." };

  const { data: session } = await supabase
    .from("sessions")
    .select("id, user_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session || session.user_id !== user.id) {
    return { ok: false, message: "Session not found." };
  }

  const { error } = await supabase.from("analysis_feedback").upsert(
    {
      user_id: user.id,
      session_id: sessionId,
      rating: input.rating,
      reason,
      details:
        input.rating === "down"
          ? input.details?.trim().slice(0, 500) || null
          : null,
      model: input.model?.trim().slice(0, 80) || null,
      prompt_version: input.promptVersion?.trim().slice(0, 40) || null,
    },
    { onConflict: "user_id,session_id" },
  );

  if (error) {
    return { ok: false, message: "Couldn’t save feedback. Try again." };
  }

  trackEvent("analysis_feedback_given", {
    userId: user.id,
    rating: input.rating,
    reason: reason ?? undefined,
  });

  return { ok: true };
}
