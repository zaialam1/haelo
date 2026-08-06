import { createClient } from "@/lib/supabase/client";
import {
  normalizeSession,
  SESSION_DETAIL_SELECT,
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

  if (error || !data) return null;
  return normalizeSession(data as SessionWithAttempts);
}
