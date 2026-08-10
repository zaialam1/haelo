import { createClient } from "@/lib/supabase/server";
import type { AccountRole } from "@/lib/profiles/types";
import {
  mapConnectionRow,
  type ConnectionRow,
  type HaeloConnection,
} from "./types";

type ConnectionListItem = ConnectionRow & {
  counterpart_username?: string | null;
  counterpart_account_role?: AccountRole | null;
};

export async function listMyConnections(): Promise<HaeloConnection[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc("list_my_connections");
  if (error || !data) return [];

  const rows = data as ConnectionListItem[];
  return rows.map((row) => ({
    ...mapConnectionRow(row),
    counterpartUsername: row.counterpart_username ?? null,
    counterpartAccountRole: row.counterpart_account_role ?? null,
  }));
}

export async function getConnectionById(
  id: string,
): Promise<HaeloConnection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .select(
      "id, requester_user_id, recipient_user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapConnectionRow(data as ConnectionRow);
}

/** Find a connection between two users in either direction. */
export async function getConnectionBetweenUsers(
  userA: string,
  userB: string,
): Promise<HaeloConnection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .select(
      "id, requester_user_id, recipient_user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .or(
      `and(requester_user_id.eq.${userA},recipient_user_id.eq.${userB}),and(requester_user_id.eq.${userB},recipient_user_id.eq.${userA})`,
    )
    .maybeSingle();

  if (error || !data) return null;
  return mapConnectionRow(data as ConnectionRow);
}

/** @deprecated Prefer getConnectionBetweenUsers */
export async function getConnectionWithUser(
  professionalUserId: string,
  userId: string,
): Promise<HaeloConnection | null> {
  return getConnectionBetweenUsers(professionalUserId, userId);
}
