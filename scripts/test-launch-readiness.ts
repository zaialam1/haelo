/**
 * Offline tests for launch-readiness foundations:
 * analytics sanitization, preferences, orbit search parsing/fallback,
 * report/block shapes.
 */
import assert from "node:assert/strict";
import {
  sanitizeAnalyticsProps,
  type AnalyticsEventName,
} from "../src/lib/analytics/events";
import {
  hasSeenMilestone,
  isNotificationCategoryEnabled,
  isOnboardingMilestone,
  mapPreferencesRow,
  EMPTY_PREFERENCES,
} from "../src/lib/preferences/types";
import {
  fallbackOrbitSearch,
  parseOrbitSearchResponseForTest,
} from "../src/lib/orbits/search";
import { getActiveOrbits } from "../src/lib/orbits/catalog";
import { REPORT_REASONS, ANALYSIS_FEEDBACK_REASONS } from "../src/lib/safety/types";
import type { OrbitListItem } from "../src/lib/orbits/types";

console.log("launch-readiness tests…");

// --- Analytics sanitization ---
{
  const clean = sanitizeAnalyticsProps({
    sessionId: "abc-123",
    resultCount: 3,
    usedFallback: true,
    transcript: "should never leak",
    personal_message: "secret",
    query: "I feel left out",
    analysis_json: { nope: true },
    email: "teen@example.com",
    tooLong: "x".repeat(200),
  });
  assert.equal(clean.sessionId, "abc-123");
  assert.equal(clean.resultCount, 3);
  assert.equal(clean.usedFallback, true);
  assert.equal(clean.transcript, undefined);
  assert.equal(clean.personal_message, undefined);
  assert.equal(clean.query, undefined);
  assert.equal(clean.analysis_json, undefined);
  assert.equal(clean.email, undefined);
  assert.equal(clean.tooLong, undefined);
}

{
  // Named funnel events stay typed
  const events: AnalyticsEventName[] = [
    "signup_started",
    "universe_opened",
    "orbit_search_used",
    "analysis_feedback_given",
    "user_blocked",
    "report_submitted",
  ];
  assert.equal(events.length, 6);
}

// --- Preferences ---
{
  assert.equal(isOnboardingMilestone("universe_seen"), true);
  assert.equal(isOnboardingMilestone("not_a_thing"), false);

  const prefs = mapPreferencesRow({
    user_id: "u1",
    onboarding: { universe_seen: "2026-01-01T00:00:00.000Z" },
    notification_prefs: { orbit_reminders: false },
  });
  assert.equal(hasSeenMilestone(prefs, "universe_seen"), true);
  assert.equal(hasSeenMilestone(prefs, "orbits_discovered"), false);
  assert.equal(isNotificationCategoryEnabled(prefs, "orbit_reminders"), false);
  assert.equal(
    isNotificationCategoryEnabled(prefs, "milestones_discoveries"),
    true,
  );
  assert.equal(
    isNotificationCategoryEnabled(EMPTY_PREFERENCES, "weekly_encouragement"),
    true,
  );
}

// --- Orbit search AI response parsing ---
{
  const orbits = getActiveOrbits();
  assert.ok(orbits.length >= 3, "expected catalog of Orbits");
  const keyA = orbits[0]!.orbitKey;
  const keyB = orbits[1]!.orbitKey;

  const parsed = parseOrbitSearchResponseForTest({
    matches: [
      { orbitKey: keyA, why: "You mentioned a friendship tension." },
      { orbitKey: "not_a_real_orbit", why: "ignore" },
      { orbitKey: keyA, why: "duplicate ignored" },
      { orbitKey: keyB, why: "Also related to speaking up." },
      { orbitKey: orbits[2]!.orbitKey, why: "third" },
      { orbitKey: orbits[3]!.orbitKey, why: "fourth should be dropped" },
    ],
  });
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0]!.orbitKey, keyA);
  assert.equal(parsed[1]!.orbitKey, keyB);
  assert.ok(parsed[0]!.why.includes("friendship"));
}

{
  const empty = parseOrbitSearchResponseForTest({ matches: [] });
  assert.equal(empty.length, 0);
  const bad = parseOrbitSearchResponseForTest(null);
  assert.equal(bad.length, 0);
}

// --- Substring fallback ---
{
  const items: OrbitListItem[] = getActiveOrbits().slice(0, 10).map((definition) => {
    const planets = definition.questions.map((q) => q.planet);
    return {
      definition,
      progress: null,
      planetsInvolved: planets,
      planetSequence: planets,
    };
  });
  const needle = items[0]!.definition.title.split(" ")[0]!;
  const hits = fallbackOrbitSearch(needle, items);
  assert.ok(hits.length >= 1);
  assert.ok(hits.every((h) => h.why.length > 0));
  assert.equal(fallbackOrbitSearch("   ", items).length, 0);
}

// --- Safety enums ---
{
  assert.ok(REPORT_REASONS.some((r) => r.value === "unwanted_contact"));
  assert.ok(REPORT_REASONS.some((r) => r.value === "impersonation"));
  assert.ok(
    ANALYSIS_FEEDBACK_REASONS.some((r) => r.value === "didnt_match"),
  );
}

console.log("launch-readiness tests passed.");
