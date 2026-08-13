/**
 * OpenAI env helpers.
 *
 * Next.js does not strip inline `# comments` from `.env*` values. A line like
 * `OPENAI_API_KEY=sk-... # Optional overrides:` becomes the full string, which
 * then fails `fetch` with: Headers.append: "Bearer … # …" is an invalid header value.
 */

export function parseEnvValue(raw: string | undefined | null): string {
  if (raw == null) return "";
  let value = raw.trim();
  const quote = value[0];
  if (
    (quote === '"' || quote === "'") &&
    value.length >= 2 &&
    value.endsWith(quote)
  ) {
    value = value.slice(1, -1);
  }
  const commentAt = value.search(/\s#/);
  if (commentAt !== -1) {
    value = value.slice(0, commentAt);
  }
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function getOpenAIApiKey(): string | null {
  const parsed = parseEnvValue(process.env.OPENAI_API_KEY);
  if (!parsed) return null;
  const token = parsed.split(/\s+/)[0] ?? "";
  return token || null;
}

export function getOpenAIAnalysisModel(): string {
  return parseEnvValue(process.env.OPENAI_ANALYSIS_MODEL) || "gpt-4o-mini";
}

export function getOpenAITranscriptionModel(): string {
  return parseEnvValue(process.env.OPENAI_TRANSCRIPTION_MODEL) || "whisper-1";
}

/** Strip secrets from messages that may be shown in the UI or logs. */
export function toClientSafeErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const raw = error instanceof Error ? error.message : fallback;
  if (
    /invalid header value/i.test(raw) ||
    /sk-[a-zA-Z0-9_-]{8,}/.test(raw) ||
    /Bearer\s+\S+/i.test(raw)
  ) {
    return "OPENAI_API_KEY is invalid. Put the key alone on its line in .env.local (no comments), then restart npm run dev.";
  }
  return raw;
}
