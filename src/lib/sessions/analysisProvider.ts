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
  getOpenAIAnalysisModel,
  getOpenAIApiKey,
} from "@/lib/openai";
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
  collectObservationEvidence,
  stripUngroundedQuotes,
} from "@/lib/sessions/quoteGrounding";
import {
  hasInsufficientJourneyEvidence,
  parseJourneyMetrics,
} from "@/lib/sessions/journeyMetricsParse";
import type { JourneyMetricResult } from "@/lib/journey/metrics";
import type { AnalysisEvidence } from "@/lib/sessions/types";

export type AnalysisProviderStatus =
  | { available: false; reason: string }
  | { available: true; provider: string };

export function getAnalysisProviderStatus(): AnalysisProviderStatus {
  const openaiRaw = process.env.OPENAI_API_KEY;
  const openaiKey = getOpenAIApiKey();
  const anthropicRaw = process.env.ANTHROPIC_API_KEY;
  if (openaiRaw !== undefined && !openaiKey) {
    return {
      available: false,
      reason:
        "OPENAI_API_KEY is present in the environment but empty. Paste your key into .env.local (no quotes, no comments on the same line), save the file, and restart npm run dev.",
    };
  }
  if (openaiKey) {
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
  /** Internal Journey scores — not shown in analysis UI */
  journeyMetrics: JourneyMetricResult[];
  /** Model id used for this analysis (for journey metric versioning) */
  model?: string | null;
};

type RawAnalysisJson = {
  strength?: { title?: unknown; description?: unknown } | string;
  observation?: { title?: unknown; description?: unknown } | string;
  evidence?: unknown;
  experiment?:
    | { title?: unknown; instruction?: unknown; description?: unknown }
    | string;
  comparisonObservation?: unknown;
  journeyMetrics?: unknown;
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

export type ParseAnalysisJsonOptions = {
  planet?: string;
  forceInsufficientJourneyMetrics?: boolean;
  model?: string | null;
};

/**
 * Parse + ground model JSON. Exported for offline tests.
 */
export function parseAnalysisJson(
  raw: RawAnalysisJson,
  transcript: string,
  includeComparison: boolean,
  opts?: ParseAnalysisJsonOptions,
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

  const planet = opts?.planet ?? "stand";
  const journeyMetrics = parseJourneyMetrics(raw.journeyMetrics, planet, {
    forceInsufficient: opts?.forceInsufficientJourneyMetrics,
  });

  const result: GenerateAnalysisResult = {
    strength: { title: strengthTitle, description: strengthDescription },
    observation: {
      title: observationTitle,
      description: observationDescription,
    },
    evidence: collectObservationEvidence(
      raw.evidence,
      observationDescription,
      transcript,
      { maxItems: 2 },
    ),
    experiment: {
      title: experimentTitle,
      instruction: experimentInstruction,
    },
    journeyMetrics,
    model: opts?.model ?? null,
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
  const apiKey = getOpenAIApiKey();
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
  const model = getOpenAIAnalysisModel();

  const userPayload = buildAnalysisUserPayload(input);
  const forceInsufficient = hasInsufficientJourneyEvidence(
    transcript,
    input.speechMetrics,
  );

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      // Slightly lower than prior 0.4 to improve journey metric consistency
      temperature: 0.3,
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

  return parseAnalysisJson(parsed, transcript, includeComparison, {
    planet: String(input.planet),
    forceInsufficientJourneyMetrics: forceInsufficient,
    model,
  });
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
