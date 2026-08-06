/**
 * Transcription integration boundary.
 *
 * OpenAI Whisper is implemented when OPENAI_API_KEY is set.
 * Deepgram / AssemblyAI keys are detected but not implemented yet.
 *
 * Required env:
 * - OPENAI_API_KEY (Whisper)
 * Optional:
 * - OPENAI_TRANSCRIPTION_MODEL (default whisper-1)
 */

export type TranscriptionProviderStatus =
  | { available: false; reason: string }
  | { available: true; provider: string };

export function getTranscriptionProviderStatus(): TranscriptionProviderStatus {
  if (process.env.OPENAI_API_KEY?.trim()) {
    return { available: true, provider: "openai-whisper" };
  }
  if (process.env.DEEPGRAM_API_KEY?.trim()) {
    return { available: true, provider: "deepgram" };
  }
  if (process.env.ASSEMBLYAI_API_KEY?.trim()) {
    return { available: true, provider: "assemblyai" };
  }
  return {
    available: false,
    reason:
      "No transcription provider configured. Set OPENAI_API_KEY, DEEPGRAM_API_KEY, or ASSEMBLYAI_API_KEY.",
  };
}

export type TranscribeAudioInput = {
  storagePath: string;
  mimeType: string;
  signedUrl?: string;
};

export type TranscribeAudioResult = {
  text: string;
};

function audioFilename(storagePath: string, mimeType: string): string {
  const fromPath = storagePath.split("/").pop();
  if (fromPath && fromPath.includes(".")) return fromPath;

  const normalized = mimeType.toLowerCase();
  let ext = "webm";
  if (
    normalized.includes("mp4") ||
    normalized.includes("m4a") ||
    normalized.includes("aac")
  ) {
    ext = "mp4";
  } else if (normalized.includes("ogg")) {
    ext = "ogg";
  } else if (normalized.includes("mpeg") || normalized.includes("mp3")) {
    ext = "mp3";
  } else if (normalized.includes("wav")) {
    ext = "wav";
  }
  return `audio.${ext}`;
}

async function transcribeWithOpenAIWhisper(
  input: TranscribeAudioInput,
): Promise<TranscribeAudioResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  if (!input.signedUrl) {
    throw new Error("Missing signed URL for session audio.");
  }

  const audioResponse = await fetch(input.signedUrl);
  if (!audioResponse.ok) {
    throw new Error(
      `Could not download session audio (${audioResponse.status}).`,
    );
  }

  const audioBytes = await audioResponse.arrayBuffer();
  if (audioBytes.byteLength === 0) {
    throw new Error("Session audio file was empty.");
  }

  const filename = audioFilename(input.storagePath, input.mimeType);
  const model =
    process.env.OPENAI_TRANSCRIPTION_MODEL?.trim() || "whisper-1";

  const form = new FormData();
  form.append(
    "file",
    new Blob([audioBytes], { type: input.mimeType || "application/octet-stream" }),
    filename,
  );
  form.append("model", model);

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `OpenAI transcription failed (${response.status})${detail ? `: ${detail.slice(0, 240)}` : "."}`,
    );
  }

  const payload = (await response.json()) as { text?: unknown };
  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    throw new Error("OpenAI transcription returned empty text.");
  }

  return { text };
}

/**
 * Real STT entry point. Throws if no provider is configured.
 * Do not call this to invent placeholder transcripts.
 */
export async function transcribeAudio(
  input: TranscribeAudioInput,
): Promise<TranscribeAudioResult> {
  const status = getTranscriptionProviderStatus();
  if (!status.available) {
    throw new Error(status.reason);
  }

  if (status.provider === "openai-whisper") {
    return transcribeWithOpenAIWhisper(input);
  }

  throw new Error(
    `Transcription provider "${status.provider}" is detected via env but not implemented yet. Use OPENAI_API_KEY for Whisper.`,
  );
}
