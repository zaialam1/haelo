/**
 * My Voice analytics event names — no-op until a provider is wired.
 */

export const MY_VOICE_EVENTS = {
  opened: "my_voice_opened",
  generated: "my_voice_generated",
  updated: "my_voice_updated",
  journeyClicked: "my_voice_journey_clicked",
} as const;

export type MyVoiceEventName =
  (typeof MY_VOICE_EVENTS)[keyof typeof MY_VOICE_EVENTS];

export function trackMyVoiceEvent(
  // Reserved for a future analytics provider.
  name: MyVoiceEventName,
  properties?: Record<string, unknown>,
): void {
  void name;
  void properties;
}
