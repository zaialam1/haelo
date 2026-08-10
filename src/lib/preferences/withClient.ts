import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EMPTY_PREFERENCES,
  mapPreferencesRow,
  type UserPreferences,
  type UserPreferencesRow,
} from "./types";

/** Low-level read with a caller-provided client (safe for shared pipelines). */
export async function getPreferencesWith(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("user_id, onboarding, notification_prefs")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return EMPTY_PREFERENCES;
  return mapPreferencesRow((data as UserPreferencesRow | null) ?? null);
}
