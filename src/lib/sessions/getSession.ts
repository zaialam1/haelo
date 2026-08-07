import { createClient } from "@/lib/supabase/server";
import {
  isMissingJourneyMetricsColumnError,
  normalizeSession,
  SESSION_DETAIL_SELECT,
  SESSION_DETAIL_SELECT_WITHOUT_JOURNEY_METRICS,
  type SessionDetail,
} from "@/lib/sessions/sessionDetail";
import type { SessionWithAttempts } from "@/lib/sessions/types";

export type { SessionDetail } from "@/lib/sessions/sessionDetail";
export {
  getAttempt,
  SESSION_DETAIL_SELECT,
} from "@/lib/sessions/sessionDetail";

export async function getSessionDetailForUser(
  sessionId: string,
  userId: string,
): Promise<SessionDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_DETAIL_SELECT)
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && data) {
    return normalizeSession(data as SessionWithAttempts);
  }

  if (error && isMissingJourneyMetricsColumnError(error.message)) {
    const fallback = await supabase
      .from("sessions")
      .select(SESSION_DETAIL_SELECT_WITHOUT_JOURNEY_METRICS)
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (fallback.error) {
      console.error("[sessions] detail fetch failed:", fallback.error.message);
      return null;
    }
    if (!fallback.data) return null;
    return normalizeSession(fallback.data as SessionWithAttempts);
  }

  if (error) {
    console.error("[sessions] detail fetch failed:", error.message);
  }
  return null;
}
