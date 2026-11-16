/**
 * Regression tests for interaction/navigation fixes:
 * guest Leave exit destination, session flow exit labels, and
 * interactive cursor rules in globals.css.
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
    /button,\s*\n\[role="button"\][\s\S]*?\.halo-btn \{\s*\n\s*cursor: pointer;/,
    "Interactive controls must use pointer cursor by default",
  );
  assert.match(
    css,
    /button:disabled[\s\S]*?cursor: not-allowed;/,
    "Disabled controls must use not-allowed cursor",
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
    /guestMode\s*\n\s*\? flow\.exitLabel/,
    "Guest review exit should use Leave label",
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
