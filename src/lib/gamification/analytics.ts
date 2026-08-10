/**
 * Analytics stubs — same pattern as Orbit / My Voice events.
 * No third-party vendor; names ready for a future provider.
 */

export const GamificationAnalyticsEvents = {
  PLANET_EVOLVED: "planet_evolved",
  WEEKLY_GOAL_COMPLETED: "weekly_goal_completed",
  CELESTIAL_DISCOVERY_UNLOCKED: "celestial_discovery_unlocked",
  EXPERIMENT_STARTED: "experiment_started",
  EXPERIMENT_COMPLETED: "experiment_completed",
  MILESTONE_UNLOCKED: "milestone_unlocked",
  DISCOVERY_VIEWED: "discovery_viewed",
  ORBIT_REWARD_UNLOCKED: "orbit_reward_unlocked",
} as const;

export type GamificationAnalyticsEvent =
  (typeof GamificationAnalyticsEvents)[keyof typeof GamificationAnalyticsEvents];

export function trackGamificationEvent(
  _event: GamificationAnalyticsEvent,
  _payload?: Record<string, unknown>,
): void {
  // Provider wiring intentionally deferred.
}
