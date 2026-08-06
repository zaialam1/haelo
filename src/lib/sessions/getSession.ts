import { createClient } from "@/lib/supabase/server";
import {
  normalizeSession,
  SESSION_DETAIL_SELECT,
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

  if (error) {
    console.error("[sessions] detail fetch failed:", error.message);
    return null;
  }
  if (!data) return null;

  return normalizeSession(data as SessionWithAttempts);
}
