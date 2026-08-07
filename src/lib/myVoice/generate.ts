/**
 * Generate My Voice synthesis via the shared OpenAI analysis boundary.
 */

import { getAnalysisProviderStatus } from "@/lib/sessions/analysisProvider";
import { parseMyVoiceSummaryJson } from "./parse";
import { buildMyVoiceUserPrompt, MY_VOICE_SYSTEM_PROMPT } from "./prompt";
import { MY_VOICE_PROMPT_VERSION } from "./thresholds";
import type { MyVoiceSummaryContent, MyVoiceSynthesisInput } from "./types";

export async function generateMyVoiceSummaryContent(
  input: MyVoiceSynthesisInput,
): Promise<{
  content: MyVoiceSummaryContent;
  modelVersion: string;
  promptVersion: string;
  modelMetadata: Record<string, unknown>;
}> {
  const status = getAnalysisProviderStatus();
  if (!status.available) {
    throw new Error(status.reason);
  }
  if (status.provider !== "openai") {
    throw new Error("My Voice synthesis currently requires OPENAI_API_KEY.");
  }

  const apiKey = process.env.OPENAI_API_KEY!.trim();
  const model = process.env.OPENAI_ANALYSIS_MODEL?.trim() || "gpt-4o-mini";

  // Strip any accidental numeric leakage helpers — trends already qualitative.
  const safeInput = {
    ...input,
    metricTrends: input.metricTrends.map((t) => ({
      metric: t.metric,
      direction: t.direction,
      sampleSize: t.sampleSize,
      note: t.note,
    })),
  };

  const userPrompt = buildMyVoiceUserPrompt(JSON.stringify(safeInput, null, 2));

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.45,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: MY_VOICE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `OpenAI My Voice synthesis failed (${response.status}): ${errText.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
    usage?: unknown;
  };

  const contentText = payload.choices?.[0]?.message?.content;
  if (!contentText) {
    throw new Error("OpenAI returned an empty My Voice summary.");
  }

  const content = parseMyVoiceSummaryJson(contentText);
  const modelVersion = payload.model ?? model;

  return {
    content,
    modelVersion,
    promptVersion: MY_VOICE_PROMPT_VERSION,
    modelMetadata: {
      provider: "openai",
      model: modelVersion,
      usage: payload.usage ?? null,
    },
  };
}
