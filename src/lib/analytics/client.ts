/**
 * Browser-side PostHog wrapper. Everything is a silent no-op when
 * NEXT_PUBLIC_POSTHOG_KEY is not configured, and no failure ever propagates.
 */

import posthog from "posthog-js";
import {
  posthogHost,
  posthogKey,
  sanitizeAnalyticsProps,
  type AnalyticsEventName,
  type AnalyticsProps,
} from "./events";

let initialized = false;

export function initAnalytics(): boolean {
  const key = posthogKey();
  if (!key || typeof window === "undefined") return false;
  if (!initialized) {
    try {
      posthog.init(key, {
        api_host: posthogHost(),
        // Structural events only — no DOM autocapture noise.
        autocapture: false,
        capture_pageview: true,
        person_profiles: "identified_only",
      });
      initialized = true;
    } catch {
      return false;
    }
  }
  return true;
}

export function identifyAnalyticsUser(userId: string): void {
  try {
    if (!initAnalytics()) return;
    posthog.identify(userId);
  } catch {
    // Analytics must never block the app.
  }
}

export function trackClientEvent(
  event: AnalyticsEventName,
  props?: AnalyticsProps,
): void {
  try {
    if (!initAnalytics()) return;
    posthog.capture(event, sanitizeAnalyticsProps(props));
  } catch {
    // Analytics must never block the app.
  }
}
