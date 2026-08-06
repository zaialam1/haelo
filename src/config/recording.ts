/** Single source of truth for recording limits. */
export const DEFAULT_MAX_RECORDING_SECONDS = 90;

/** Private Supabase Storage bucket for session (and legacy reflection) audio. */
export const SESSION_AUDIO_BUCKET = "reflections-audio";

/** Signed URL lifetime for playback (seconds). */
export const SESSION_AUDIO_SIGNED_URL_SECONDS = 3600;

/** Preferred MediaRecorder MIME types, best first. */
export const PREFERRED_AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mpeg",
] as const;
