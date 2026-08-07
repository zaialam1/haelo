/**
 * Structural tests for Orbit recommendation rules (no live DB required).
 *
 *   npm run test:orbit-recommendations
 */

import assert from "node:assert/strict";
import {
  MESSAGE_MAX_LENGTH,
  PURPOSE_MAX_LENGTH,
  isActiveRecommendationStatus,
} from "../src/lib/recommendations/types";
import { getActiveOrbits, getOrbitByKey } from "../src/lib/orbits/catalog";

function testLimits() {
  assert.equal(PURPOSE_MAX_LENGTH, 160);
  assert.equal(MESSAGE_MAX_LENGTH, 500);
  assert.equal(isActiveRecommendationStatus("new"), true);
  assert.equal(isActiveRecommendationStatus("viewed"), true);
  assert.equal(isActiveRecommendationStatus("started"), false);
  assert.equal(isActiveRecommendationStatus("completed"), false);
  assert.equal(isActiveRecommendationStatus("dismissed"), false);
  console.log("ok: status + length rules");
}

function testOrbitCatalogReusable() {
  const orbits = getActiveOrbits();
  assert.equal(orbits.length, 40);
  const sample = orbits[0];
  assert.ok(getOrbitByKey(sample.orbitKey));
  assert.ok(sample.version >= 1);
  console.log("ok: canonical 40 Orbits reusable for recommend UI");
}

function main() {
  testLimits();
  testOrbitCatalogReusable();
  console.log("\nAll orbit-recommendation structural tests passed.");
}

main();
