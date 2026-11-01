import { createClient } from "@/lib/supabase/server";
import { GUEST_MAX_SESSIONS } from "./config";

export type GuestQuota = {
  used: number;
  max: number;
  remaining: number;
  allowed: boolean;
};

/**
 * Count sessions created by this user (any status). Guests are soft-capped
 * so anonymous AI usage stays bounded without changing registered limits.
 */
export async function getGuestSessionQuota(userId: string): Promise<GuestQuota> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("[guest] quota count failed:", error.message);
    // Fail closed for guests — better than unbounded AI spend.
    return {
      used: GUEST_MAX_SESSIONS,
      max: GUEST_MAX_SESSIONS,
      remaining: 0,
      allowed: false,
    };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, GUEST_MAX_SESSIONS - used);
  return {
    used,
    max: GUEST_MAX_SESSIONS,
    remaining,
    allowed: remaining > 0,
  };
}
