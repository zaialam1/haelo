import { MIN_RECORDING_BYTES } from "@/config/recording";

/** Strip `codecs=` so Storage, `<audio>`, and Whisper get a container type. */
export function baseAudioMimeType(mime: string | null | undefined): string {
  const raw = (mime ?? "").trim().toLowerCase();
  if (!raw) return "audio/webm";
  const base = raw.split(";")[0]?.trim() || "audio/webm";
  return base.startsWith("audio/") ? base : "audio/webm";
}

export function isUsableRecordingBlob(blob: Blob | null | undefined): boolean {
  return Boolean(blob && blob.size >= MIN_RECORDING_BYTES);
}
