/**
 * Parse + validate My Voice structured JSON (mirrors orbit summative parsing).
 */

import type { MyVoiceSummaryContent } from "./types";

type RawMyVoiceJson = {
  openingSynthesis?: unknown;
  takingShape?: unknown;
  stillExploring?: unknown;
  acrossYourVoice?: unknown;
  carryForward?: unknown;
};

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`My Voice summary missing ${field}.`);
  }
  return value.trim();
}

function approximateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Soft length guard — prefer concise synthesis (~120–220 words total).
 * Throws only when wildly over (model runaway).
 */
export function assertMyVoiceLengthReasonable(
  content: MyVoiceSummaryContent,
): void {
  const total = [
    content.openingSynthesis,
    content.takingShape,
    content.stillExploring,
    content.acrossYourVoice,
    content.carryForward ?? "",
  ].join(" ");
  const words = approximateWordCount(total);
  if (words > 320) {
    throw new Error(
      `My Voice summary too long (${words} words). Expected under ~220.`,
    );
  }
}

export function parseMyVoiceSummaryJson(raw: string): MyVoiceSummaryContent {
  let parsed: RawMyVoiceJson;
  try {
    parsed = JSON.parse(raw) as RawMyVoiceJson;
  } catch {
    throw new Error("My Voice summary returned invalid JSON.");
  }

  const carryRaw = parsed.carryForward;
  let carryForward: string | null = null;
  if (typeof carryRaw === "string" && carryRaw.trim()) {
    carryForward = carryRaw.trim();
  }

  const content: MyVoiceSummaryContent = {
    openingSynthesis: requireNonEmptyString(
      parsed.openingSynthesis,
      "openingSynthesis",
    ),
    takingShape: requireNonEmptyString(parsed.takingShape, "takingShape"),
    stillExploring: requireNonEmptyString(
      parsed.stillExploring,
      "stillExploring",
    ),
    acrossYourVoice: requireNonEmptyString(
      parsed.acrossYourVoice,
      "acrossYourVoice",
    ),
    carryForward,
  };

  assertMyVoiceLengthReasonable(content);
  return content;
}

/** Validate a stored jsonb row shape. */
export function parseStoredMyVoiceContent(
  value: unknown,
): MyVoiceSummaryContent | null {
  if (!value || typeof value !== "object") return null;
  try {
    return parseMyVoiceSummaryJson(JSON.stringify(value));
  } catch {
    return null;
  }
}
