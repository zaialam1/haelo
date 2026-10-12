/**
 * Live Web Speech + MediaRecorder often fight over the mic on phones
 * (especially Chrome Android), producing a header-only / empty recording.
 * Prefer server-side transcription on those devices.
 */
export function canUseLiveSpeechWithRecorder(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const narrowViewport =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 639px)").matches;
  const ua = navigator.userAgent || "";
  const mobileUa =
    /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      ua,
    );
  const touchPoints =
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;

  return !(coarsePointer || narrowViewport || mobileUa || touchPoints);
}
