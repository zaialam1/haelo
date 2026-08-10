/**
 * Isomorphic event tracker.
 *
 * - Browser: forwards to posthog-js (loaded lazily so server code never pulls
 *   the browser SDK).
 * - Server: posts directly to the PostHog capture API with fetch. Requires a
 *   distinct id (pass `userId` in props); events without one are dropped.
 *
 * Always fire-and-forget: analytics can never block or fail a user action.
 */

import {
  posthogHost,
  posthogKey,
  sanitizeAnalyticsProps,
  type AnalyticsEventName,
  type AnalyticsProps,
} from "./events";

export function trackEvent(
  event: AnalyticsEventName,
  props?: AnalyticsProps,
): void {
  try {
    if (!posthogKey()) return;

    if (typeof window !== "undefined") {
      void import("./client")
        .then((m) => m.trackClientEvent(event, props))
        .catch(() => {});
      return;
    }

    const distinctId =
      typeof props?.userId === "string" && props.userId.length > 0
        ? props.userId
        : typeof props?.distinctId === "string" && props.distinctId.length > 0
          ? (props.distinctId as string)
          : null;
    if (!distinctId) return;

    const properties = sanitizeAnalyticsProps(props);
    delete properties.userId;
    delete properties.distinctId;

    void fetch(`${posthogHost()}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: posthogKey(),
        event,
        distinct_id: distinctId,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  } catch {
    // Analytics must never block the app.
  }
}
