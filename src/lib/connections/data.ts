import { createClient } from "@/lib/supabase/server";
import {
  mapConnectionRow,
  type ProfessionalConnection,
  type ProfessionalConnectionRow,
} from "./types";

type ConnectionListItem = ProfessionalConnectionRow & {
  counterpart_username?: string | null;
};

export async function listMyConnections(): Promise<ProfessionalConnection[]> {
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
  }));
}

export async function getConnectionById(
  id: string,
): Promise<ProfessionalConnection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_connections")
    .select(
      "id, professional_user_id, user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapConnectionRow(data as ProfessionalConnectionRow);
}

export async function getConnectionWithUser(
  professionalUserId: string,
  userId: string,
): Promise<ProfessionalConnection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_connections")
    .select(
      "id, professional_user_id, user_id, status, requested_at, responded_at, removed_at, created_at, updated_at",
    )
    .eq("professional_user_id", professionalUserId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapConnectionRow(data as ProfessionalConnectionRow);
}
