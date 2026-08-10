/**
 * Server-side creators for user-scoped soft notifications.
 * Connection/recommendation notifications are created by SQL triggers/RPCs.
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Notify that the user's My Voice summary changed. Deduped: skipped while an
 * unread my_voice_updated notification is already waiting.
 */
export async function createMyVoiceUpdatedNotification(
  userId: string,
): Promise<void> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "my_voice_updated")
    .is("read_at", null);

  if ((count ?? 0) > 0) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type: "my_voice_updated",
    reference_id: null,
  });
  if (error) {
    console.warn("[notifications] my_voice_updated insert:", error.message);
  }
}
