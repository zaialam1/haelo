/**
 * Orbit analytics event names — forwarded to the shared analytics layer.
 * Silent no-op when no provider key is configured.
 */

import { trackEvent } from "@/lib/analytics/track";

export const ORBIT_EVENTS = {
  viewed: "orbit_viewed",
  started: "orbit_started",
  questionStarted: "orbit_question_started",
  questionCompleted: "orbit_question_completed",
  questionRetried: "orbit_question_retried",
  resumed: "orbit_resumed",
  completed: "orbit_completed",
  analysisViewed: "orbit_analysis_viewed",
  practiceStarted: "orbit_practice_started",
} as const;

export type OrbitEventName = (typeof ORBIT_EVENTS)[keyof typeof ORBIT_EVENTS];

export function trackOrbitEvent(
  name: OrbitEventName,
  properties?: Record<string, unknown>,
): void {
  trackEvent(name, properties);
}
