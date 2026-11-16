/**
 * Regression tests for interaction/navigation fixes:
 * guest Leave exit destination, session flow exit labels,
 * sticky/fixed chrome, Journey typography, and interactive cursor rules.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  guestSessionFlow,
  orbitSessionFlow,
  planetSessionFlow,
} from "../src/lib/sessions/sessionFlow";

console.log("interaction-regression tests…");

{
  const flow = guestSessionFlow("express");
  assert.equal(flow.exitHref, "/");
  assert.equal(flow.exitLabel, "Leave");
  assert.notEqual(
    flow.exitHref,
    "/try",
    "Leave must exit the demo, not restart /try",
  );
  assert.equal(flow.reviewHref("abc"), "/try/session/express/abc/review");
  assert.equal(flow.afterCompleteHref("abc"), "/try/session/express/abc/complete");
  assert.equal(flow.journeyHref, "/signup");
}

{
  const flow = planetSessionFlow("stand");
  assert.equal(flow.exitHref, "/stand");
  assert.equal(flow.exitLabel, "Exit");
}

{
  const flow = orbitSessionFlow({
    orbitKey: "speaking-up",
    planet: "stand",
    orbitQuestionKey: "q1",
    userOrbitProgressId: "progress-1",
    orbitVersion: 1,
  });
  assert.equal(flow.exitHref, "/orbits/speaking-up");
  assert.equal(flow.exitLabel, "Leave Orbit");
}

{
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.match(
    css,
    /button,\s*\n\[role="button"\][\s\S]*?a\[href\][\s\S]*?\.halo-btn \{\s*\n\s*cursor: pointer;/,
    "Interactive controls and links must use pointer cursor by default",
  );
  assert.match(
    css,
    /button:disabled[\s\S]*?cursor: not-allowed;/,
    "Disabled controls must use not-allowed cursor",
  );
  assert.match(
    css,
    /textarea[\s\S]*?cursor: text;/,
    "Text fields must use text cursor",
  );
  assert.match(
    css,
    /scroll-padding-top:/,
    "Document must account for sticky/fixed header height on anchors",
  );
}

{
  const homeNav = readFileSync(
    join(process.cwd(), "src/components/home/HomeNav.tsx"),
    "utf8",
  );
  assert.match(
    homeNav,
    /pinned = true/,
    "HomeNav must pin by default so long pages keep chrome reachable",
  );
  assert.match(
    homeNav,
    /safe-area-inset-top/,
    "HomeNav must respect mobile safe areas",
  );
  assert.doesNotMatch(
    homeNav,
    /backdrop-blur/,
    "HomeNav must not use glassmorphism blur",
  );
}

{
  const bottomNav = readFileSync(
    join(process.cwd(), "src/components/home/HomeBottomNav.tsx"),
    "utf8",
  );
  assert.match(
    bottomNav,
    /className="home-bottom-nav[^"]*\bfixed\b/,
    "Primary bottom nav must stay fixed so tabs remain reachable while scrolling",
  );
}

{
  const journey = readFileSync(
    join(process.cwd(), "src/components/journey/JourneyExperience.tsx"),
    "utf8",
  );
  assert.match(
    journey,
    /font-sans text-2xl font-semibold/,
    "Journey heading must use the standard sans heading font",
  );
  assert.doesNotMatch(
    journey,
    /font-fraunces|font-display|WONK|SOFT/,
    "Journey heading must not use Fraunces/display variation settings",
  );
  assert.doesNotMatch(
    journey,
    /contextLine|Finish a session to add a star\.|1 session so far/,
    "Journey must not render redundant subtitle copy under the title",
  );
  assert.match(
    journey,
    />\s*Journey\s*</,
    "Journey page must keep a clear Journey title",
  );
}

{
  const siteHeader = readFileSync(
    join(process.cwd(), "src/components/landing/SiteHeader.tsx"),
    "utf8",
  );
  assert.match(siteHeader, /sticky top-0/);
  assert.doesNotMatch(
    siteHeader,
    /backdrop-blur/,
    "Marketing header must stay solid, not glassmorphic",
  );
}

{
  const recording = readFileSync(
    join(process.cwd(), "src/components/recording/RecordingSession.tsx"),
    "utf8",
  );
  assert.match(
    recording,
    /onClick=\{handleExit\}/,
    "Recording session exit control must wire handleExit",
  );
  assert.match(
    recording,
    /aria-label=\{flow\.exitLabel\}/,
    "Exit control needs an accessible name",
  );
}

{
  const review = readFileSync(
    join(process.cwd(), "src/components/session/SessionReviewClient.tsx"),
    "utf8",
  );
  assert.match(
    review,
    /const exitLabel = guestMode/,
    "Guest review exit should use Leave label",
  );
  assert.match(
    review,
    /onClick=\{\(\) => void handleExit\(\)\}/,
    "Review exit must stay reachable near the top of long analysis pages",
  );
}

{
  const professional = readFileSync(
    join(process.cwd(), "src/app/professional/page.tsx"),
    "utf8",
  );
  assert.match(
    professional,
    /user\.is_anonymous/,
    "Anonymous guests must not see the personal professional shell",
  );
}

console.log("interaction-regression OK");
