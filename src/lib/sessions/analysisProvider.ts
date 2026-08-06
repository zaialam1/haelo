/**
 * Session analysis integration boundary.
 *
 * OpenAI chat completions are used when OPENAI_API_KEY is set.
 * Anthropic is detected but not implemented yet.
 *
 * Required env:
 * - OPENAI_API_KEY
 * Optional:
 * - OPENAI_ANALYSIS_MODEL (default gpt-4o-mini)
 */

import type { AnalysisEvidence } from "@/lib/sessions/types";

export type AnalysisProviderStatus =
  | { available: false; reason: string }
  | { available: true; provider: string };

export function getAnalysisProviderStatus(): AnalysisProviderStatus {
  const openaiRaw = process.env.OPENAI_API_KEY;
  const anthropicRaw = process.env.ANTHROPIC_API_KEY;
  if (openaiRaw !== undefined && !openaiRaw.trim()) {
    return {
      available: false,
      reason:
        "OPENAI_API_KEY is present in the environment but empty. Paste your key into .env.local (no quotes), save the file, and restart npm run dev.",
    };
  }
  if (openaiRaw?.trim()) {
    return { available: true, provider: "openai" };
  }
  if (anthropicRaw?.trim()) {
    return { available: true, provider: "anthropic" };
  }
  return {
    available: false,
    reason:
      "No analysis provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
  };
}

export type GenerateAnalysisInput = {
  sessionId: string;
  planet: string;
  promptText: string;
  transcript: string | null;
  attemptNumber: number;
  priorTranscript?: string | null;
};

export type GenerateAnalysisResult = {
  strength: { title: string; description: string };
  observation: { title: string; description: string };
  evidence: AnalysisEvidence[];
  experiment: { title: string; instruction: string };
  comparisonObservation?: string;
};

const ANALYSIS_SYSTEM_PROMPT = `You are Haelo, a calm, warm coaching mirror for spoken reflection.
Your job is to help someone notice what came through in their voice — never to judge, score, or perform therapy.

Tone: reflective, specific, encouraging, personal, and safe. Youthful but not childish. Focus on self-discovery and growth.

Rules:
- Base every claim on the transcript(s). If something is unclear, say so gently — do not invent.
- Evidence quotes MUST be short verbatim excerpts from the current transcript (or prior transcript only when comparing). Never fabricate quotes.
- Keep titles short (a few words). Keep descriptions to 1–3 sentences.
- The experiment should be one small, concrete speaking practice they can try next.
- Prefer noticing patterns in clarity, honesty, hesitation, warmth, ownership, or energy — not grammar policing.
- Respond with a single JSON object matching the schema. No markdown fences.`;

type RawAnalysisJson = {
  strength?: { title?: unknown; description?: unknown };
  observation?: { title?: unknown; description?: unknown };
  evidence?: unknown;
  experiment?: { title?: unknown; instruction?: unknown };
  comparisonObservation?: unknown;
};

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Analysis response missing ${field}.`);
  }
  return value.trim();
}

function parseEvidence(raw: unknown, transcript: string): AnalysisEvidence[] {
  if (!Array.isArray(raw)) {
    throw new Error("Analysis response evidence must be an array.");
  }

  const items: AnalysisEvidence[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const text =
      "text" in entry && typeof entry.text === "string"
        ? entry.text.trim()
        : "";
    if (!text) continue;

    // Soft check: prefer quotes that appear in the transcript; skip invented ones.
    if (!transcript.toLowerCase().includes(text.toLowerCase())) {
      continue;
    }

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
    if (items.length >= 3) break;
  }

  if (items.length === 0) {
    // Fall back to a short slice of the transcript so UI has real evidence.
    const snippet = transcript.trim().slice(0, 140);
    if (snippet) {
      items.push({ text: snippet });
    }
  }

  return items;
}

function parseAnalysisJson(
  raw: RawAnalysisJson,
  transcript: string,
  includeComparison: boolean,
): GenerateAnalysisResult {
  const strengthTitle = requireNonEmptyString(
    raw.strength?.title,
    "strength.title",
  );
  const strengthDescription = requireNonEmptyString(
    raw.strength?.description,
    "strength.description",
  );
  const observationTitle = requireNonEmptyString(
    raw.observation?.title,
    "observation.title",
  );
  const observationDescription = requireNonEmptyString(
    raw.observation?.description,
    "observation.description",
  );
  const experimentTitle = requireNonEmptyString(
    raw.experiment?.title,
    "experiment.title",
  );
  const experimentInstruction = requireNonEmptyString(
    raw.experiment?.instruction,
    "experiment.instruction",
  );

  const result: GenerateAnalysisResult = {
    strength: { title: strengthTitle, description: strengthDescription },
    observation: {
      title: observationTitle,
      description: observationDescription,
    },
    evidence: parseEvidence(raw.evidence, transcript),
    experiment: {
      title: experimentTitle,
      instruction: experimentInstruction,
    },
  };

  if (includeComparison) {
    const comparison = requireNonEmptyString(
      raw.comparisonObservation,
      "comparisonObservation",
    );
    result.comparisonObservation = comparison;
  }

  return result;
}

async function generateWithOpenAI(
  input: GenerateAnalysisInput,
): Promise<GenerateAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const transcript = input.transcript?.trim() ?? "";
  if (!transcript) {
    throw new Error(
      "Cannot analyze without a transcript. Transcription may still be unavailable.",
    );
  }

  const includeComparison = Boolean(input.priorTranscript?.trim());
  const model =
    process.env.OPENAI_ANALYSIS_MODEL?.trim() || "gpt-4o-mini";

  const userPayload = {
    sessionId: input.sessionId,
    planet: input.planet,
    prompt: input.promptText,
    attemptNumber: input.attemptNumber,
    transcript,
    priorTranscript: includeComparison
      ? input.priorTranscript?.trim()
      : undefined,
    schema: {
      strength: { title: "string", description: "string" },
      observation: { title: "string", description: "string" },
      evidence: [{ text: "string", startTime: "number?", endTime: "number?" }],
      experiment: { title: "string", instruction: "string" },
      comparisonObservation: includeComparison
        ? "string (required when priorTranscript is present)"
        : "omit",
    },
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(userPayload),
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `OpenAI analysis failed (${response.status})${detail ? `: ${detail.slice(0, 240)}` : "."}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OpenAI analysis returned empty content.");
  }

  let parsed: RawAnalysisJson;
  try {
    parsed = JSON.parse(content) as RawAnalysisJson;
  } catch {
    throw new Error("OpenAI analysis returned invalid JSON.");
  }

  return parseAnalysisJson(parsed, transcript, includeComparison);
}

/**
 * Real analysis entry point. Throws if no provider is configured.
 * Never returns fabricated coaching content.
 */
export async function generateSessionAnalysis(
  input: GenerateAnalysisInput,
): Promise<GenerateAnalysisResult> {
  const status = getAnalysisProviderStatus();
  if (!status.available) {
    throw new Error(status.reason);
  }

  if (status.provider === "openai") {
    return generateWithOpenAI(input);
  }

  throw new Error(
    `Analysis provider "${status.provider}" is detected via env but not implemented yet. Use OPENAI_API_KEY.`,
  );
}
