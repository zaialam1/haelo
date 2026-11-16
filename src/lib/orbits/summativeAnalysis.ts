/**
 * Summative Orbit analysis — what became clearer across six reflections.
 * Reuses the same OpenAI provider boundary as individual session analysis.
 */

import {
  getOpenAIAnalysisModel,
  getOpenAIApiKey,
} from "@/lib/openai";
import { tidyGeneratedCopy, withBrandVoice } from "@/lib/ai/brandVoice";
import type { OrbitDefinition } from "@/lib/orbits/types";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import { PLANET_LABEL } from "@/lib/orbits/ui";
import { getAnalysisProviderStatus } from "@/lib/sessions/analysisProvider";

export type OrbitReflectionForSynthesis = {
  sequenceNumber: number;
  planet: string;
  prompt: string;
  transcript: string | null;
  analysisSummary: string | null;
};

/**
 * Shared writing rules are appended by withBrandVoice
 * (see src/lib/ai/brandVoice.ts and docs/HAELO_BRAND_VOICE.md).
 */
const SUMMATIVE_SYSTEM_PROMPT = withBrandVoice(`You are Halo. A teenager (about 13 to 18) just answered six spoken questions about one real situation. This guided set is called an Orbit.
You are writing the summary they read at the end: what became clearer across all six answers.

Tone: warm but plain, specific, honest. Write like someone who listened to all six answers and is telling them what stood out. Not a therapist, not a teacher, not a cheerleader.

Focus on: what became clearer across the whole set. This is NOT a second pass of individual-response coaching.

Rules:
- Base every claim on the transcripts and context provided. Do not invent quotes or facts.
- Do NOT diagnose mental health conditions or personality.
- Do NOT claim another person definitely thinks or intends something.
- Do NOT treat speech speed/pitch as direct evidence of emotion.
- Do NOT tell the user what decision they must make.
- Do NOT manufacture improvement. If nothing shifted, say their position stayed consistent or that it still seems unsettled.
- Refer to specific answers ("In your second answer...", "By the last question..."). Useful framings: "You came back several times to...", "Early on you focused on...", "Later you described...", "It's still not clear whether...". Don't use the same framing twice.
- Keep each section to 2 to 4 sentences. Shorter is fine when there's less to say.
- carryThisWithYou: one concrete thing from their own answers that's worth remembering. Not a pep talk, not a life lesson.
- practicePrompt is optional: one short thing they could say out loud later, or null if nothing natural fits.
- Respond with a single JSON object matching the schema. No markdown fences.`);

type RawSummativeJson = {
  whatBecameClearer?: unknown;
  whatKeptComingUp?: unknown;
  howYourVoiceMoved?: unknown;
  carryThisWithYou?: unknown;
  practicePrompt?: unknown;
};

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Summative analysis missing ${field}.`);
  }
  return tidyGeneratedCopy(value.trim());
}

function parseSummativeJson(raw: string): OrbitSummativeAnalysisContent {
  let parsed: RawSummativeJson;
  try {
    parsed = JSON.parse(raw) as RawSummativeJson;
  } catch {
    throw new Error("Summative analysis returned invalid JSON.");
  }

  const practiceRaw = parsed.practicePrompt;
  let practicePrompt: string | null = null;
  if (typeof practiceRaw === "string" && practiceRaw.trim()) {
    practicePrompt = tidyGeneratedCopy(practiceRaw.trim());
  }

  return {
    whatBecameClearer: requireNonEmptyString(
      parsed.whatBecameClearer,
      "whatBecameClearer",
    ),
    whatKeptComingUp: requireNonEmptyString(
      parsed.whatKeptComingUp,
      "whatKeptComingUp",
    ),
    howYourVoiceMoved: requireNonEmptyString(
      parsed.howYourVoiceMoved,
      "howYourVoiceMoved",
    ),
    carryThisWithYou: requireNonEmptyString(
      parsed.carryThisWithYou,
      "carryThisWithYou",
    ),
    practicePrompt,
  };
}

export async function generateOrbitSummativeAnalysis(opts: {
  orbit: OrbitDefinition;
  reflections: OrbitReflectionForSynthesis[];
}): Promise<{
  content: OrbitSummativeAnalysisContent;
  modelMetadata: Record<string, unknown>;
}> {
  const status = getAnalysisProviderStatus();
  if (!status.available) {
    throw new Error(status.reason);
  }
  if (status.provider !== "openai") {
    throw new Error(
      "Summative Orbit analysis currently requires OPENAI_API_KEY.",
    );
  }

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  const model = getOpenAIAnalysisModel();

  const reflectionBlocks = opts.reflections
    .map((r) => {
      const planetLabel =
        PLANET_LABEL[r.planet as keyof typeof PLANET_LABEL] ?? r.planet;
      return [
        `Reflection ${r.sequenceNumber} (${planetLabel})`,
        `Prompt: ${r.prompt}`,
        `Transcript: ${r.transcript?.trim() || "(no transcript available)"}`,
        r.analysisSummary
          ? `Individual analysis notes: ${r.analysisSummary}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const userPrompt = `Orbit title: ${opts.orbit.title}
Situation: ${opts.orbit.situation}
Opening: ${opts.orbit.openingBody}

Six reflections in order:

${reflectionBlocks}

Return JSON with this shape:
{
  "whatBecameClearer": string,
  "whatKeptComingUp": string,
  "howYourVoiceMoved": string,
  "carryThisWithYou": string,
  "practicePrompt": string | null
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SUMMATIVE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `OpenAI summative analysis failed (${response.status}): ${errText.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
    usage?: unknown;
  };

  const contentText = payload.choices?.[0]?.message?.content;
  if (!contentText) {
    throw new Error("OpenAI returned an empty summative analysis.");
  }

  return {
    content: parseSummativeJson(contentText),
    modelMetadata: {
      provider: "openai",
      model: payload.model ?? model,
      usage: payload.usage ?? null,
    },
  };
}
