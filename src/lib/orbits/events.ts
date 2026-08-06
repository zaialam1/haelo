/**
 * Orbit analytics event names — ready for when product analytics exists.
 * Haelo does not currently ship an analytics provider; keep names centralized.
 */
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

/** No-op until an analytics provider is wired. */
export function trackOrbitEvent(
  _name: OrbitEventName,
  _properties?: Record<string, unknown>,
): void {
  // Intentionally empty — see ORBIT_EVENTS for the intended contract.
}
