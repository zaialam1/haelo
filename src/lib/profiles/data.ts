import { createClient } from "@/lib/supabase/server";
import { mapProfileRow, type Profile, type ProfileRow } from "./types";

export async function getOwnProfile(
  userId?: string,
): Promise<Profile | null> {
  const supabase = await createClient();

  let id = userId;
  if (!id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    id = user.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, username, username_normalized, account_role, age_gate_status, age_gate_cleared_at, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function ensureOwnProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await getOwnProfile(user.id);
  if (existing) return existing;

  // Backfill if trigger missed (e.g. user created before migration).
  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    account_role: "user",
  });

  if (error && error.code !== "23505") {
    return null;
  }

  return getOwnProfile(user.id);
}

export async function hasUsername(userId?: string): Promise<boolean> {
  const profile = await getOwnProfile(userId);
  return Boolean(profile?.usernameNormalized);
}
