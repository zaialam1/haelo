import { createClient } from "@/lib/supabase/client";
import {
  isMissingJourneyMetricsColumnError,
  normalizeSession,
  SESSION_DETAIL_SELECT,
  SESSION_DETAIL_SELECT_WITHOUT_JOURNEY_METRICS,
  type SessionDetail,
} from "@/lib/sessions/sessionDetail";
import type { SessionWithAttempts } from "@/lib/sessions/types";

export type { SessionDetail } from "@/lib/sessions/sessionDetail";

/** Client-side poll / refresh for review screens. */
export async function fetchSessionDetailClient(
  sessionId: string,
): Promise<SessionDetail | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_DETAIL_SELECT)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && data) {
    return normalizeSession(data as SessionWithAttempts);
  }

  if (error && isMissingJourneyMetricsColumnError(error.message)) {
    const fallback = await supabase
      .from("sessions")
      .select(SESSION_DETAIL_SELECT_WITHOUT_JOURNEY_METRICS)
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    return normalizeSession(fallback.data as SessionWithAttempts);
  }

  return null;
}
