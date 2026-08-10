/**
 * Product analytics contract: typed event names + property sanitization.
 *
 * Privacy rules (enforced by sanitizeAnalyticsProps):
 * - never send transcripts, recordings, AI analyses, personal messages,
 *   or raw search queries
 * - properties are structural only: ids, keys, categories, counts, flags
 */

export type AnalyticsEventName =
  // Account / onboarding
  | "signup_started"
  | "signup_completed"
  | "onboarding_started"
  | "onboarding_completed"
  | "onboarding_milestone_reached"
  // Voice sessions
  | "session_started"
  | "recording_started"
  | "recording_completed"
  | "session_completed"
  | "analysis_viewed"
  | "experiment_started"
  | "experiment_completed"
  // Journey
  | "journey_opened"
  | "journey_node_opened"
  | "journey_tab_changed"
  // Universe
  | "universe_opened"
  | "planet_opened"
  | "my_voice_opened"
  | "my_voice_generated"
  | "my_voice_updated"
  | "my_voice_journey_clicked"
  | "next_action_shown"
  | "next_action_followed"
  // Orbits
  | "orbits_opened"
  | "orbit_search_used"
  | "orbit_viewed"
  | "orbit_started"
  | "orbit_resumed"
  | "orbit_completed"
  | "orbit_question_started"
  | "orbit_question_completed"
  | "orbit_question_retried"
  | "orbit_analysis_viewed"
  | "orbit_practice_started"
  // Gamification
  | "weekly_goal_completed"
  | "planet_evolved"
  | "celestial_discovery_unlocked"
  | "milestone_unlocked"
  | "milestone_viewed"
  | "discovery_viewed"
  | "orbit_reward_unlocked"
  // Social / professional
  | "connection_request_sent"
  | "connection_accepted"
  | "connection_removed"
  | "user_blocked"
  | "report_submitted"
  | "orbit_recommendation_sent"
  | "orbit_recommendation_opened"
  | "recommended_orbit_started"
  // Feedback
  | "analysis_feedback_given"
  | "product_feedback_sent";

export type AnalyticsProps = Record<string, unknown>;

/**
 * Keys that must never reach analytics, even accidentally. Broad on purpose:
 * a dropped structural property is cheap, a leaked transcript is not.
 */
const FORBIDDEN_KEY_PATTERN =
  /transcript|audio|recording|message|query|text|content|prompt|quote|email|detail|body|name|reflection|analysis_json|synthesis/i;

/** Long strings are suspicious (free text) — never forward them. */
const MAX_STRING_LENGTH = 120;

export function sanitizeAnalyticsProps(
  props?: AnalyticsProps,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!props) return out;
  for (const [key, value] of Object.entries(props)) {
    if (FORBIDDEN_KEY_PATTERN.test(key)) continue;
    if (typeof value === "string") {
      if (value.length > 0 && value.length <= MAX_STRING_LENGTH) {
        out[key] = value;
      }
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      out[key] = value;
    }
  }
  return out;
}

export function posthogHost(): string {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com"
  );
}

export function posthogKey(): string | null {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || null;
}
