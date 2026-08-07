import { createClient } from "@/lib/supabase/server";
import {
  mapNotificationRow,
  type AppNotification,
  type NotificationRow,
} from "@/lib/connections/types";

export async function listOwnNotifications(): Promise<AppNotification[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, reference_id, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return (data as NotificationRow[]).map(mapNotificationRow);
}

export async function countUnreadNotifications(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
