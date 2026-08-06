/**
 * Transcript-derived speech metrics for individual analysis.
 *
 * These are NOT acoustic measurements from the audio waveform.
 * They approximate delivery signals available from text + duration only.
 */

export type SpeechMetrics = {
  wordCount: number;
  durationSeconds: number | null;
  /** Approximate speaking rate when duration is known. */
  wordsPerMinute: number | null;
  sentenceCount: number;
  /** Softeners / hedges counted from the transcript text. */
  hedgeCounts: Record<string, number>;
  hedgeTotal: number;
  /** Common filler-like tokens counted from the transcript text. */
  fillerCounts: Record<string, number>;
  fillerTotal: number;
  /** Rough restart cue: consecutive repeated words ("I I think"). */
  repeatedWordPairs: number;
};

const HEDGE_PHRASES = [
  "i don't know",
  "i dont know",
  "kind of",
  "sort of",
  "i guess",
  "maybe",
  "probably",
  "just",
  "sorry",
] as const;

const FILLER_TOKENS = ["like", "um", "uh", "basically", "literally"] as const;

function countPhrase(haystack: string, phrase: string): number {
  if (!phrase) return 0;
  const pattern = new RegExp(
    `\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}\\b`,
    "gi",
  );
  return haystack.match(pattern)?.length ?? 0;
}

function countToken(words: string[], token: string): number {
  const target = token.toLowerCase();
  return words.filter((w) => w === target).length;
}

/**
 * Derive lightweight speech metrics from transcript text and optional duration.
 * Safe to call when acoustic analysis is unavailable.
 */
export function deriveSpeechMetrics(
  transcript: string,
  durationSeconds?: number | null,
): SpeechMetrics {
  const text = transcript.trim();
  const words = text
    ? text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}'\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean)
    : [];

  const sentenceCount = text
    ? Math.max(
        1,
        (text.match(/[.!?]+/g)?.length ?? 0) ||
          (text.includes("\n") ? text.split(/\n+/).filter(Boolean).length : 1),
      )
    : 0;

  const hedgeCounts: Record<string, number> = {};
  let hedgeTotal = 0;
  for (const phrase of HEDGE_PHRASES) {
    const count = countPhrase(text, phrase);
    if (count > 0) {
      hedgeCounts[phrase] = count;
      hedgeTotal += count;
    }
  }

  const fillerCounts: Record<string, number> = {};
  let fillerTotal = 0;
  for (const token of FILLER_TOKENS) {
    const count = countToken(words, token);
    if (count > 0) {
      fillerCounts[token] = count;
      fillerTotal += count;
    }
  }

  let repeatedWordPairs = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1]) repeatedWordPairs += 1;
  }

  const duration =
    typeof durationSeconds === "number" &&
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0
      ? durationSeconds
      : null;

  const wordsPerMinute =
    duration && words.length > 0
      ? Math.round((words.length / duration) * 60)
      : null;

  return {
    wordCount: words.length,
    durationSeconds: duration,
    wordsPerMinute,
    sentenceCount,
    hedgeCounts,
    hedgeTotal,
    fillerCounts,
    fillerTotal,
    repeatedWordPairs,
  };
}
