import type { AnalysisEvidence } from "@/lib/sessions/types";

/**
 * Case-insensitive, whitespace-tolerant check that `quote` appears in `transcript`.
 */
export function isQuoteGroundedInTranscript(
  quote: string,
  transcript: string,
): boolean {
  return resolveQuoteAgainstTranscript(quote, transcript) !== null;
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeWords(value: string): string[] {
  const normalized = normalizeForMatch(value);
  return normalized ? normalized.split(" ").filter(Boolean) : [];
}

/** Compare tokens ignoring apostrophe differences (dont vs don't). */
function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  return a.replace(/'/g, "") === b.replace(/'/g, "");
}

/**
 * Recover the best verbatim transcript span for a candidate quote.
 * Handles punctuation / apostrophe drift from the model vs Whisper.
 * Returns null if nothing reliably matches.
 */
export function resolveQuoteAgainstTranscript(
  quote: string,
  transcript: string,
): string | null {
  const trimmed = quote.trim();
  if (!trimmed || !transcript.trim()) return null;

  // 1) Direct case-insensitive / whitespace-tolerant includes, then recover casing.
  const lowerTranscript = transcript.toLowerCase();
  const lowerQuote = trimmed.toLowerCase();
  const directIdx = lowerTranscript.indexOf(lowerQuote);
  if (directIdx >= 0) {
    return transcript.slice(directIdx, directIdx + trimmed.length).trim();
  }

  // 2) Punctuation-normalized includes on the full strings.
  const normQuote = normalizeForMatch(trimmed);
  const normTranscript = normalizeForMatch(transcript);
  if (normQuote.length >= 8 && normTranscript.includes(normQuote)) {
    const recovered = recoverSpanByWords(tokenizeWords(trimmed), transcript);
    if (recovered) return recovered;
  }

  // 3) Consecutive word-sequence match (handles light rephrasing of punctuation only).
  const quoteWords = tokenizeWords(trimmed);
  if (quoteWords.length < 3) {
    // Short quotes need a near-exact hit to avoid false positives.
    if (quoteWords.length === 0) return null;
    const recovered = recoverSpanByWords(quoteWords, transcript);
    return recovered;
  }

  return recoverSpanByWords(quoteWords, transcript);
}

function recoverSpanByWords(
  quoteWords: string[],
  transcript: string,
): string | null {
  if (quoteWords.length === 0) return null;

  // Map transcript characters to word tokens with original offsets.
  const wordSpans: { word: string; start: number; end: number }[] = [];
  const wordRe = /[\p{L}\p{N}']+/gu;
  let match: RegExpExecArray | null;
  while ((match = wordRe.exec(transcript)) !== null) {
    wordSpans.push({
      word: match[0].toLowerCase().replace(/[‘’]/g, "'"),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  if (wordSpans.length < quoteWords.length) return null;

  for (let i = 0; i <= wordSpans.length - quoteWords.length; i++) {
    let ok = true;
    for (let j = 0; j < quoteWords.length; j++) {
      if (!tokensMatch(wordSpans[i + j].word, quoteWords[j])) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const start = wordSpans[i].start;
    const end = wordSpans[i + quoteWords.length - 1].end;
    return transcript.slice(start, end).trim();
  }

  return null;
}

/** Pull quoted spans out of free text (observation / experiment prose). */
export function extractQuotedSpans(text: string): string[] {
  if (!text.trim()) return [];
  const pattern =
    /"([^"]{1,200})"|'([^']{1,200})'|“([^”]{1,200})”|‘([^’]{1,200})’/g;
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const inner = (m[1] ?? m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (inner) found.push(inner);
  }
  return found;
}

/**
 * Keep only evidence quotes that appear (or can be recovered) in the transcript.
 * Prefer short quotes; cap at `maxItems`.
 */
export function groundEvidenceQuotes(
  raw: unknown,
  transcript: string,
  opts?: { maxItems?: number; fallbackSnippet?: boolean },
): AnalysisEvidence[] {
  const maxItems = opts?.maxItems ?? 2;
  const fallbackSnippet = opts?.fallbackSnippet ?? false;
  const items: AnalysisEvidence[] = [];
  const seen = new Set<string>();

  const pushResolved = (candidate: string, meta?: AnalysisEvidence) => {
    const resolved = resolveQuoteAgainstTranscript(candidate, transcript);
    if (!resolved) return;
    if (resolved.length > 180) return;
    const key = normalizeForMatch(resolved);
    if (!key || seen.has(key)) return;
    seen.add(key);
    const item: AnalysisEvidence = { text: resolved };
    if (meta?.startTime !== undefined) item.startTime = meta.startTime;
    if (meta?.endTime !== undefined) item.endTime = meta.endTime;
    items.push(item);
  };

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const text =
        "text" in entry && typeof entry.text === "string"
          ? entry.text.trim()
          : "";
      if (!text) continue;

      const meta: AnalysisEvidence = { text };
      if (
        "startTime" in entry &&
        typeof entry.startTime === "number" &&
        Number.isFinite(entry.startTime)
      ) {
        meta.startTime = entry.startTime;
      }
      if (
        "endTime" in entry &&
        typeof entry.endTime === "number" &&
        Number.isFinite(entry.endTime)
      ) {
        meta.endTime = entry.endTime;
      }

      pushResolved(text, meta);
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

/**
 * Merge evidence from the model array + any grounded quotes embedded in
 * observation prose, so Something to Notice always has supporting words when
 * the model put the quote inline but forgot the evidence field.
 */
export function collectObservationEvidence(
  rawEvidence: unknown,
  observationDescription: string,
  transcript: string,
  opts?: { maxItems?: number },
): AnalysisEvidence[] {
  const maxItems = opts?.maxItems ?? 2;
  const fromArray = groundEvidenceQuotes(rawEvidence, transcript, {
    maxItems,
    fallbackSnippet: false,
  });

  if (fromArray.length >= maxItems) return fromArray;

  const seen = new Set(fromArray.map((e) => normalizeForMatch(e.text)));
  const merged = [...fromArray];

  for (const span of extractQuotedSpans(observationDescription)) {
    const resolved = resolveQuoteAgainstTranscript(span, transcript);
    if (!resolved) continue;
    const key = normalizeForMatch(resolved);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push({ text: resolved });
    if (merged.length >= maxItems) break;
  }

  return merged;
}

const QUOTE_PATTERN =
  /"([^"]{1,200})"|'([^']{1,200})'|“([^”]{1,200})”|‘([^’]{1,200})’/g;

/**
 * Keep grounded quotation marks. Demote ungrounded spans to plain prose
 * so the UI never presents fabricated verbatim speech.
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
      const resolved = resolveQuoteAgainstTranscript(inner, transcript);
      if (!resolved) return inner;
      // Prefer the transcript's exact wording inside the same quote style.
      const open = full[0];
      const close = full[full.length - 1];
      return `${open}${resolved}${close}`;
    })
    .replace(/\s{2,}/g, " ")
    .trim();
}
