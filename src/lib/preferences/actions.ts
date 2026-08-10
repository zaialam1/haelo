"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPreferencesWith } from "./withClient";
import {
  isNotificationCategory,
  isOnboardingMilestone,
  type NotificationCategory,
  type OnboardingMilestone,
} from "./types";

/**
 * Record that the user has seen an onboarding moment. Idempotent — an
 * existing timestamp is never overwritten, so moments never repeat.
 */
export async function markOnboardingMilestoneAction(
  milestone: OnboardingMilestone,
): Promise<{ ok: boolean }> {
  if (!isOnboardingMilestone(milestone)) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const prefs = await getPreferencesWith(supabase, user.id);
  if (prefs.onboarding[milestone]) return { ok: true };

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      onboarding: { ...prefs.onboarding, [milestone]: new Date().toISOString() },
      notification_prefs: prefs.notificationPrefs,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return { ok: !error };
}

/** Toggle a non-essential notification category on/off. */
export async function setNotificationPrefAction(
  category: NotificationCategory,
  enabled: boolean,
): Promise<{ ok: boolean }> {
  if (!isNotificationCategory(category)) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const prefs = await getPreferencesWith(supabase, user.id);

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      onboarding: prefs.onboarding,
      notification_prefs: { ...prefs.notificationPrefs, [category]: enabled },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (!error) revalidatePath("/settings");
  return { ok: !error };
}
