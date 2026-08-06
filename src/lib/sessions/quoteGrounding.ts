import type { AnalysisEvidence } from "@/lib/sessions/types";

/**
 * Case-insensitive, whitespace-tolerant check that `quote` appears in `transcript`.
 */
export function isQuoteGroundedInTranscript(
  quote: string,
  transcript: string,
): boolean {
  const q = normalizeForMatch(quote);
  const t = normalizeForMatch(transcript);
  if (!q || !t) return false;
  return t.includes(q);
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keep only evidence quotes that appear verbatim (normalized) in the transcript.
 * Prefer short quotes; cap at `maxItems`.
 * If none ground, optionally fall back to a short transcript slice.
 */
export function groundEvidenceQuotes(
  raw: unknown,
  transcript: string,
  opts?: { maxItems?: number; fallbackSnippet?: boolean },
): AnalysisEvidence[] {
  const maxItems = opts?.maxItems ?? 2;
  const fallbackSnippet = opts?.fallbackSnippet ?? true;
  const items: AnalysisEvidence[] = [];

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const text =
        "text" in entry && typeof entry.text === "string"
          ? entry.text.trim()
          : "";
      if (!text) continue;
      if (!isQuoteGroundedInTranscript(text, transcript)) continue;

      // Prefer concise evidence; skip very long dumps.
      if (text.length > 180) continue;

      const item: AnalysisEvidence = { text };
      if (
        "startTime" in entry &&
        typeof entry.startTime === "number" &&
        Number.isFinite(entry.startTime)
      ) {
        item.startTime = entry.startTime;
      }
      if (
        "endTime" in entry &&
        typeof entry.endTime === "number" &&
        Number.isFinite(entry.endTime)
      ) {
        item.endTime = entry.endTime;
      }
      items.push(item);
      if (items.length >= maxItems) break;
    }
  }

  if (items.length === 0 && fallbackSnippet) {
    const snippet = transcript.trim().slice(0, 140);
    if (snippet) {
      items.push({ text: snippet });
    }
  }

  return items;
}

const QUOTE_PATTERN =
  /"([^"]{1,200})"|'([^']{1,200})'|“([^”]{1,200})”|‘([^’]{1,200})’/g;

/**
 * Demote quotation-marked spans that are not grounded in the transcript.
 * Grounded quotes are kept. Ungrounded spans lose their quote marks so the
 * UI never presents fabricated verbatim speech.
 */
export function stripUngroundedQuotes(
  text: string,
  transcript: string,
): string {
  if (!text.trim()) return text;

  return text
    .replace(QUOTE_PATTERN, (full, d1, s1, c1, c2) => {
      const inner = (d1 ?? s1 ?? c1 ?? c2 ?? "").trim();
      if (!inner) return full;
      if (isQuoteGroundedInTranscript(inner, transcript)) return full;
      return inner;
    })
    .replace(/\s{2,}/g, " ")
    .trim();
}
