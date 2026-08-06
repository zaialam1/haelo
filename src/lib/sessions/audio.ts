import {
  PREFERRED_AUDIO_MIME_TYPES,
  SESSION_AUDIO_BUCKET,
  SESSION_AUDIO_SIGNED_URL_SECONDS,
} from "@/config/recording";
import { createClient } from "@/lib/supabase/client";

export function pickSupportedMimeType(): string | null {
  if (typeof MediaRecorder === "undefined") return null;
  if (typeof MediaRecorder.isTypeSupported !== "function") {
    // Older browsers: let MediaRecorder choose a default.
    return "";
  }
  for (const type of PREFERRED_AUDIO_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function extensionForMime(mime: string): string {
  const normalized = mime.toLowerCase();
  if (
    normalized.includes("mp4") ||
    normalized.includes("m4a") ||
    normalized.includes("aac")
  ) {
    return "mp4";
  }
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";
  if (normalized.includes("wav")) return "wav";
  return "webm";
}

export function isMediaRecorderSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * Create a short-lived signed URL for a private session audio path.
 * Centralized so playback never assumes a public URL.
 */
export async function getSessionAudioUrl(
  storagePath: string,
  expiresInSeconds: number = SESSION_AUDIO_SIGNED_URL_SECONDS,
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(SESSION_AUDIO_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      error?.message || "Could not create a secure link to this recording.",
    );
  }

  return data.signedUrl;
}

export { SESSION_AUDIO_BUCKET };
