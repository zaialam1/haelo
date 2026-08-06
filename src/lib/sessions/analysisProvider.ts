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
 *
 * The model receives transcript + derived speech metrics — not raw audio.
 */

import {
  buildSessionAnalysisInput,
  type BuildSessionAnalysisInputArgs,
  type SessionAnalysisInput,
} from "@/lib/sessions/analysisInput";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPayload,
} from "@/lib/sessions/analysisPrompt";
import {
  groundEvidenceQuotes,
  stripUngroundedQuotes,
} from "@/lib/sessions/quoteGrounding";
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

/** @deprecated Prefer SessionAnalysisInput via generateSessionAnalysis. */
export type GenerateAnalysisInput = BuildSessionAnalysisInputArgs;

export type GenerateAnalysisResult = {
  strength: { title: string; description: string };
  observation: { title: string; description: string };
  evidence: AnalysisEvidence[];
  experiment: { title: string; instruction: string };
  comparisonObservation?: string;
};

type RawAnalysisJson = {
  strength?: { title?: unknown; description?: unknown } | string;
  observation?: { title?: unknown; description?: unknown } | string;
  evidence?: unknown;
  experiment?:
    | { title?: unknown; instruction?: unknown; description?: unknown }
    | string;
  comparisonObservation?: unknown;
};

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Analysis response missing ${field}.`);
  }
  return value.trim();
}

/**
 * Models sometimes return strength/observation/experiment as plain strings
 * instead of { title, description }. Normalize before strict field checks.
 */
function normalizeTitledSection(
  value: unknown,
  fallbackTitle: string,
  descriptionKeys: readonly string[] = ["description"],
): { title: unknown; description: unknown } {
  if (typeof value === "string") {
    return { title: fallbackTitle, description: value };
  }
  if (!value || typeof value !== "object") {
    return { title: undefined, description: undefined };
  }
  const obj = value as Record<string, unknown>;
  let description: unknown = undefined;
  for (const key of descriptionKeys) {
    if (typeof obj[key] === "string" && obj[key].trim()) {
      description = obj[key];
      break;
    }
  }
  if (description === undefined && typeof obj.body === "string") {
    description = obj.body;
  }
  return {
    title:
      typeof obj.title === "string" && obj.title.trim()
        ? obj.title
        : fallbackTitle,
    description,
  };
}

/**
 * Parse + ground model JSON. Exported for offline tests.
 */
export function parseAnalysisJson(
  raw: RawAnalysisJson,
  transcript: string,
  includeComparison: boolean,
): GenerateAnalysisResult {
  const strength = normalizeTitledSection(raw.strength, "What came through");
  const observation = normalizeTitledSection(raw.observation, "What I noticed");
  const experimentRaw = normalizeTitledSection(raw.experiment, "Try this", [
    "instruction",
    "description",
  ]);

  const strengthTitle = requireNonEmptyString(strength.title, "strength.title");
  const strengthDescription = requireNonEmptyString(
    strength.description,
    "strength.description",
  );
  const observationTitle = requireNonEmptyString(
    observation.title,
    "observation.title",
  );
  let observationDescription = requireNonEmptyString(
    observation.description,
    "observation.description",
  );
  const experimentTitle = requireNonEmptyString(
    experimentRaw.title,
    "experiment.title",
  );
  let experimentInstruction = requireNonEmptyString(
    experimentRaw.description,
    "experiment.instruction",
  );

  observationDescription = stripUngroundedQuotes(
    observationDescription,
    transcript,
  );
  experimentInstruction = stripUngroundedQuotes(
    experimentInstruction,
    transcript,
  );

  const result: GenerateAnalysisResult = {
    strength: { title: strengthTitle, description: strengthDescription },
    observation: {
      title: observationTitle,
      description: observationDescription,
    },
    evidence: groundEvidenceQuotes(raw.evidence, transcript, {
      maxItems: 2,
      // Prefer no evidence over a loosely related transcript slice.
      fallbackSnippet: false,
    }),
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
    result.comparisonObservation = stripUngroundedQuotes(
      comparison,
      transcript,
    );
  }

  return result;
}

async function generateWithOpenAI(
  input: SessionAnalysisInput,
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

  const userPayload = buildAnalysisUserPayload(input);

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
 *
 * Accepts either the canonical SessionAnalysisInput or legacy build args.
 */
export async function generateSessionAnalysis(
  input: SessionAnalysisInput | BuildSessionAnalysisInputArgs,
): Promise<GenerateAnalysisResult> {
  const status = getAnalysisProviderStatus();
  if (!status.available) {
    throw new Error(status.reason);
  }

  const normalized: SessionAnalysisInput =
    "questionPrompt" in input && "speechMetrics" in input
      ? (input as SessionAnalysisInput)
      : buildSessionAnalysisInput(input as BuildSessionAnalysisInputArgs);

  if (status.provider === "openai") {
    return generateWithOpenAI(normalized);
  }

  throw new Error(
    `Analysis provider "${status.provider}" is detected via env but not implemented yet. Use OPENAI_API_KEY.`,
  );
}

export { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPayload };
