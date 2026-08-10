/**
 * Progressive onboarding state, derived from user_preferences.onboarding +
 * real usage data. No slideshow, no checklist — each moment appears once, in
 * context, and established users are backfilled so nothing beginner-facing
 * ever appears for them.
 */

import { createClient } from "@/lib/supabase/server";
import { getPreferencesWith } from "@/lib/preferences/data";
import {
  ONBOARDING_MILESTONES,
  hasSeenMilestone,
  type UserPreferences,
} from "@/lib/preferences/types";

/** Users with this many completed sessions never see intro moments. */
const ESTABLISHED_SESSION_COUNT = 3;

export type OnboardingSnapshot = {
  preferences: UserPreferences;
  completedSessionCount: number;
};

export async function countCompletedSessions(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");
  if (error) return 0;
  return count ?? 0;
}

/**
 * True when finishing the current session would be the user's very first
 * completed session (and the moment hasn't been shown before).
 */
export async function shouldShowFirstStarMoment(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const [preferences, completed] = await Promise.all([
    getPreferencesWith(supabase, user.id),
    countCompletedSessions(user.id),
  ]);
  return (
    completed === 0 && !hasSeenMilestone(preferences, "first_session_completed")
  );
}

/**
 * Load preferences + completed session count, backfilling all onboarding
 * milestones for established users who predate the onboarding system.
 */
export async function getOnboardingSnapshot(
  userId: string,
): Promise<OnboardingSnapshot> {
  const supabase = await createClient();
  const [preferences, completedSessionCount] = await Promise.all([
    getPreferencesWith(supabase, userId),
    countCompletedSessions(userId),
  ]);

  const hasAnyMilestone = ONBOARDING_MILESTONES.some((m) =>
    hasSeenMilestone(preferences, m),
  );

  if (completedSessionCount >= ESTABLISHED_SESSION_COUNT && !hasAnyMilestone) {
    const now = new Date().toISOString();
    const backfilled = Object.fromEntries(
      ONBOARDING_MILESTONES.map((m) => [m, now]),
    );
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: userId,
        onboarding: backfilled,
        notification_prefs: preferences.notificationPrefs,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );
    if (!error) {
      return {
        preferences: { ...preferences, onboarding: backfilled },
        completedSessionCount,
      };
    }
  }

  return { preferences, completedSessionCount };
}
