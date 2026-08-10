import { createClient } from "@/lib/supabase/server";
import { EMPTY_PREFERENCES, type UserPreferences } from "./types";
import { getPreferencesWith } from "./withClient";

export { getPreferencesWith } from "./withClient";

/** Preferences for the authenticated user. Missing row = all defaults. */
export async function getOwnPreferences(): Promise<UserPreferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_PREFERENCES;
  return getPreferencesWith(supabase, user.id);
}
