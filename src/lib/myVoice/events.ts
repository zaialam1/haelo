/**
 * My Voice analytics event names — forwarded to the shared analytics layer.
 * Silent no-op when no provider key is configured.
 */

import { trackEvent } from "@/lib/analytics/track";

export const MY_VOICE_EVENTS = {
  opened: "my_voice_opened",
  generated: "my_voice_generated",
  updated: "my_voice_updated",
  journeyClicked: "my_voice_journey_clicked",
} as const;

export type MyVoiceEventName =
  (typeof MY_VOICE_EVENTS)[keyof typeof MY_VOICE_EVENTS];

export function trackMyVoiceEvent(
  name: MyVoiceEventName,
  properties?: Record<string, unknown>,
): void {
  trackEvent(name, properties);
}
