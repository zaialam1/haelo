/**
 * User preferences: onboarding milestone state + notification categories.
 *
 * Stored in public.user_preferences as two jsonb maps. Missing keys mean
 * "not seen yet" (onboarding) and "enabled" (notifications). Critical
 * account/security notices are never preference-gated.
 */

export type OnboardingMilestone =
  | "universe_seen"
  | "first_session_started"
  | "first_session_completed"
  | "first_analysis_viewed"
  | "journey_discovered"
  | "orbits_discovered"
  | "planet_growth_explained"
  | "my_voice_introduced";

export const ONBOARDING_MILESTONES: readonly OnboardingMilestone[] = [
  "universe_seen",
  "first_session_started",
  "first_session_completed",
  "first_analysis_viewed",
  "journey_discovered",
  "orbits_discovered",
  "planet_growth_explained",
  "my_voice_introduced",
];

export type NotificationCategory =
  | "weekly_encouragement"
  | "orbit_reminders"
  | "orbit_recommendations"
  | "milestones_discoveries";

export const NOTIFICATION_CATEGORIES: readonly NotificationCategory[] = [
  "weekly_encouragement",
  "orbit_reminders",
  "orbit_recommendations",
  "milestones_discoveries",
];

export const NOTIFICATION_CATEGORY_LABELS: Record<
  NotificationCategory,
  { title: string; description: string }
> = {
  weekly_encouragement: {
    title: "Weekly encouragement",
    description: "Gentle nudges about your weekly constellation.",
  },
  orbit_reminders: {
    title: "Unfinished Orbit reminders",
    description: "A quiet reminder when a recommended Orbit is waiting.",
  },
  orbit_recommendations: {
    title: "Orbit recommendations",
    description:
      "When someone you're connected with recommends an Orbit. Muted recommendations still appear on your Orbits page.",
  },
  milestones_discoveries: {
    title: "Milestones & discoveries",
    description: "Celestial discoveries and milestone moments.",
  },
};

/** Milestone key -> ISO timestamp of when the user saw it. */
export type OnboardingState = Partial<Record<OnboardingMilestone, string>>;

/** Category -> enabled. Missing key = enabled. */
export type NotificationPrefs = Partial<Record<NotificationCategory, boolean>>;

export type UserPreferences = {
  onboarding: OnboardingState;
  notificationPrefs: NotificationPrefs;
};

export const EMPTY_PREFERENCES: UserPreferences = {
  onboarding: {},
  notificationPrefs: {},
};

export type UserPreferencesRow = {
  user_id: string;
  onboarding: Record<string, unknown> | null;
  notification_prefs: Record<string, unknown> | null;
};

export function mapPreferencesRow(
  row: UserPreferencesRow | null,
): UserPreferences {
  if (!row) return EMPTY_PREFERENCES;
  return {
    onboarding: (row.onboarding ?? {}) as OnboardingState,
    notificationPrefs: (row.notification_prefs ?? {}) as NotificationPrefs,
  };
}

export function hasSeenMilestone(
  prefs: UserPreferences,
  milestone: OnboardingMilestone,
): boolean {
  return Boolean(prefs.onboarding[milestone]);
}

export function isNotificationCategoryEnabled(
  prefs: UserPreferences,
  category: NotificationCategory,
): boolean {
  return prefs.notificationPrefs[category] !== false;
}

export function isOnboardingMilestone(
  value: string,
): value is OnboardingMilestone {
  return (ONBOARDING_MILESTONES as readonly string[]).includes(value);
}

export function isNotificationCategory(
  value: string,
): value is NotificationCategory {
  return (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}
