"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponseReview } from "@/components/session/ResponseReview";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useOptionalPageTransition } from "@/components/transitions/PageTransitionProvider";
import { DEFAULT_MAX_RECORDING_SECONDS } from "@/config/recording";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { getPlanetPageContent } from "@/lib/planets/content";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import type { Planet } from "@/lib/prompts";
import {
  kickoffSessionProcessing,
  saveSessionAttempt,
} from "@/lib/sessions/saveSession";

export type SessionPromptPayload = {
  id: string;
  text: string;
};

type SessionUiPhase =
  | "ready"
  | "requesting"
  | "countdown"
  | "recording"
  | "review"
  | "uploading"
  | "error";

type RecordingSessionProps = {
  planet: Planet;
  prompt: SessionPromptPayload;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RecordingSession({ planet, prompt }: RecordingSessionProps) {
  const content = getPlanetPageContent(planet);
  const voicePlanet = getVoicePlanetById(planet);
  const accent = voicePlanet?.color ?? "var(--violet)";
  const transition = useOptionalPageTransition();
  const router = useRouter();
  const statusId = useId();

  const recorder = useAudioRecorder({
    maxSeconds: DEFAULT_MAX_RECORDING_SECONDS,
    countdownSeconds: 3,
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingLockRef = useRef(false);

  const hasUnsavedRecording = Boolean(recorder.blob) && !saving;

  useEffect(() => {
    if (!hasUnsavedRecording) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedRecording]);

  let phase: SessionUiPhase = "ready";
  if (saving) phase = "uploading";
  else if (recorder.status === "recorded") phase = "review";
  else if (recorder.status === "recording") phase = "recording";
  else if (recorder.status === "countdown") phase = "countdown";
  else if (recorder.status === "requesting_permission") phase = "requesting";
  else if (recorder.status === "error") phase = "error";
  else phase = "ready";

  const displayError =
    saveError ||
    (recorder.error && phase === "error" ? recorder.error.message : null);

  async function handleSave() {
    if (savingLockRef.current || saving) return;
    if (!recorder.blob) {
      setSaveError("No audio was captured. Try recording again.");
      return;
    }

    savingLockRef.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      const result = await saveSessionAttempt({
        planet,
        promptId: prompt.id,
        promptTextSnapshot: prompt.text,
        blob: recorder.blob,
        durationSeconds: recorder.elapsedSeconds,
        mimeType: recorder.mimeType || recorder.blob.type || "audio/webm",
        source: "planet",
        attemptNumber: 1,
        transcript: recorder.transcript,
      });
      kickoffSessionProcessing(result.sessionId);
      router.push(`/session/${planet}/${result.sessionId}/review`);
    } catch (e) {
      setSaveError(
        e instanceof Error
          ? e.message
          : "Could not save your session. Please try again.",
      );
      setSaving(false);
      savingLockRef.current = false;
    }
  }

  function handleRetake() {
    if (saving) return;
    setSaveError(null);
    recorder.retake();
  }

  function handleTryAgainPermission() {
    setSaveError(null);
    recorder.clearError();
    void recorder.startRecording();
  }

  function exitToPlanet() {
    const href = `/${planet}`;
    if (transition) {
      transition.navigate({ href, variant: "fade" });
    } else {
      window.location.href = href;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: accent }}
          >
            {content.label}
          </p>
          <p
            className="mt-1.5 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {content.shortLine}
          </p>
        </div>
        <button
          type="button"
          onClick={exitToPlanet}
          className="text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
        >
          Exit
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center py-8 sm:py-12">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          Your prompt
        </p>
        <h1
          className="mt-4 max-w-2xl font-[family-name:var(--font-fraunces)] text-2xl leading-snug sm:text-3xl lg:text-[2.15rem]"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          &ldquo;{prompt.text}&rdquo;
        </h1>

        {(phase === "ready" || phase === "error") && (
          <p
            className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Speak naturally. You can stop any time — up to{" "}
            {formatTime(DEFAULT_MAX_RECORDING_SECONDS)}.
          </p>
        )}

        <div
          id={statusId}
          className="mt-8"
          aria-live="polite"
          aria-atomic="true"
        >
          {phase === "requesting" && (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Requesting microphone access…
            </p>
          )}

          {phase === "countdown" && recorder.countdownValue != null && (
            <p
              className="font-[family-name:var(--font-fraunces)] text-5xl tabular-nums"
              style={{
                color: accent,
                fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
              }}
            >
              {recorder.countdownValue}
            </p>
          )}

          {phase === "recording" && (
            <div className="flex flex-col gap-2">
              <p
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold"
                style={{ color: accent }}
              >
                <span
                  className="size-2.5 animate-pulse rounded-full"
                  style={{ background: accent }}
                  aria-hidden="true"
                />
                Recording
              </p>
              <p
                className="font-mono text-base tabular-nums"
                style={{ color: "var(--foreground)" }}
              >
                {formatTime(recorder.elapsedSeconds)}
                <span
                  className="ml-2 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  · {formatTime(recorder.remainingSeconds)} left
                </span>
              </p>
            </div>
          )}

          {phase === "uploading" && (
            <p className="text-sm font-medium" style={{ color: accent }}>
              Saving your response…
            </p>
          )}
        </div>

        {phase === "review" && recorder.objectUrl && (
          <div className="mt-8 max-w-lg">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
              style={{ color: "var(--foreground-muted)" }}
            >
              Your response
            </p>
            <div className="mt-3">
              <ResponseReview
                src={recorder.objectUrl}
                durationSeconds={recorder.elapsedSeconds}
                transcript={recorder.transcript || null}
                transcriptStatus={
                  recorder.transcript.trim() ? "ready" : "pending"
                }
                accentColor={accent}
                label="Your response"
              />
            </div>
            <p
              className="mt-3 text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Listen once, then save to continue into Session Review.
            </p>
          </div>
        )}

        {displayError && (
          <p
            className="mt-6 max-w-lg text-sm leading-relaxed"
            style={{ color: "var(--rose-deep, #D478A0)" }}
            role="alert"
          >
            {displayError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {(phase === "ready" ||
          (phase === "error" &&
            recorder.error?.kind !== "unsupported")) && (
          <button
            type="button"
            onClick={() => {
              setSaveError(null);
              if (phase === "error") {
                handleTryAgainPermission();
              } else {
                void recorder.startRecording();
              }
            }}
            aria-describedby={statusId}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            {phase === "error" ? "Try Again" : "Start Recording"}
          </button>
        )}

        {(phase === "countdown" || phase === "recording") && (
          <button
            type="button"
            onClick={() => recorder.stopRecording()}
            aria-describedby={statusId}
            className="inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "var(--gold)",
              color: "var(--on-warm)",
            }}
          >
            Stop Recording
          </button>
        )}

        {phase === "review" && (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              {saveError ? "Retry Save" : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleRetake}
              disabled={saving}
              className="inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                background:
                  "color-mix(in srgb, var(--violet) 10%, transparent)",
                color: "var(--foreground)",
              }}
            >
              Retake
            </button>
          </>
        )}

        {phase === "uploading" && (
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] opacity-50"
          >
            Saving your response…
          </button>
        )}

        {phase === "error" && recorder.error?.kind === "unsupported" && (
          <TransitionLink
            href={`/${planet}`}
            variant="fade"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Return to {content.label}
          </TransitionLink>
        )}
      </div>
    </div>
  );
}
