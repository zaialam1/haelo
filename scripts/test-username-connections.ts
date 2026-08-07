/**
 * Unit tests for Haelo username validation + reserved list.
 * Run: npx tsx scripts/test-username-connections.ts
 */

import assert from "node:assert/strict";
import {
  formatUsernameDisplay,
  normalizeUsername,
  validateUsername,
} from "../src/lib/profiles/username";
import { isReservedUsername } from "../src/lib/profiles/reservedUsernames";

function testUsernameValidation() {
  const valid = ["zara17", "voice_girl", "samira2026", "abc", "a_b"];
  for (const v of valid) {
    const result = validateUsername(v);
    assert.equal(result.ok, true, `expected valid: ${v}`);
    if (result.ok) {
      assert.equal(result.normalized, v.toLowerCase());
    }
  }

  assert.equal(validateUsername("za").ok, false);
  assert.equal(validateUsername("zara 17").ok, false);
  assert.equal(validateUsername("zara!!!").ok, false);
  assert.equal(validateUsername("_zara").ok, false);
  assert.equal(validateUsername("zara_").ok, false);
  assert.equal(validateUsername("admin").ok, false);
  assert.equal(validateUsername("Haelo").ok, false);
  assert.equal(validateUsername("@Zara17").ok, true);

  const upper = validateUsername("ZARA17");
  assert.equal(upper.ok, true);
  if (upper.ok) assert.equal(upper.normalized, "zara17");

  assert.equal(normalizeUsername("@MoonVoice"), "moonvoice");
  assert.equal(formatUsernameDisplay("moonvoice"), "@moonvoice");
  assert.equal(isReservedUsername("counselor"), true);
  assert.equal(isReservedUsername("counsellor"), true);
  assert.equal(isReservedUsername("zara17"), false);

  console.log("✓ username validation");
}

function main() {
  testUsernameValidation();
  console.log("\nAll username foundation checks passed.");
}

main();
