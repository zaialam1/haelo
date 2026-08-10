/**
 * Gamification analytics — forwards to the shared product analytics layer.
 * Silent no-op when no provider key is configured.
 */

import { trackEvent } from "@/lib/analytics/track";

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
  event: GamificationAnalyticsEvent,
  payload?: Record<string, unknown>,
): void {
  trackEvent(event, payload);
}
