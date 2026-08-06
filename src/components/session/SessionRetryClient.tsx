"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponseReview } from "@/components/session/ResponseReview";
import { DEFAULT_MAX_RECORDING_SECONDS } from "@/config/recording";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { getPlanetPageContent } from "@/lib/planets/content";
import type { Planet } from "@/lib/prompts";
import type { SessionDetail } from "@/lib/sessions/sessionDetail";
import {
  kickoffSessionProcessing,
  saveSessionAttempt,
} from "@/lib/sessions/saveSession";

type SessionRetryClientProps = {
  planet: Planet;
  sessionId: string;
  initialSession: SessionDetail;
};

type Phase =
  | "ready"
  | "requesting"
  | "countdown"
  | "recording"
  | "review"
  | "uploading"
  | "error";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionRetryClient({
  planet,
  sessionId,
  initialSession,
}: SessionRetryClientProps) {
  const router = useRouter();
  const content = getPlanetPageContent(planet);
  const accent = getVoicePlanetById(planet)?.color ?? "var(--violet)";
  const statusId = useId();

  const experiment = initialSession.analysis?.experiment;
  const existingSecond = initialSession.session_attempts.find(
    (a) => a.attempt_number === 2,
  );

  const recorder = useAudioRecorder({
    maxSeconds: DEFAULT_MAX_RECORDING_SECONDS,
    countdownSeconds: 3,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingLockRef = useRef(false);

  // If attempt 2 already exists (refresh), go to compare.
  useEffect(() => {
    if (existingSecond) {
      router.replace(`/session/${planet}/${sessionId}/compare`);
    }
  }, [existingSecond, planet, router, sessionId]);

  let phase: Phase = "ready";
  if (saving) phase = "uploading";
  else if (recorder.status === "recorded") phase = "review";
  else if (recorder.status === "recording") phase = "recording";
  else if (recorder.status === "countdown") phase = "countdown";
  else if (recorder.status === "requesting_permission") phase = "requesting";
  else if (recorder.status === "error") phase = "error";

  async function handleSave() {
    if (savingLockRef.current || saving || !recorder.blob) return;
    savingLockRef.current = true;
    setSaving(true);
    setSaveError(null);

    try {
      await saveSessionAttempt({
        planet,
        promptId: initialSession.prompt_id,
        promptTextSnapshot: initialSession.prompt_text_snapshot,
        blob: recorder.blob,
        durationSeconds: recorder.elapsedSeconds,
        mimeType: recorder.mimeType || recorder.blob.type || "audio/webm",
        source: initialSession.source,
        sessionId,
        attemptNumber: 2,
        transcript: recorder.transcript,
      });
      kickoffSessionProcessing(sessionId);
      router.push(`/session/${planet}/${sessionId}/compare`);
    } catch (e) {
      setSaveError(
        e instanceof Error ? e.message : "Could not save this recording.",
      );
      setSaving(false);
      savingLockRef.current = false;
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header>
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
          style={{ color: accent }}
        >
          {content.label}
        </p>
        <h1
          className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl leading-tight"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Try Again
        </h1>
      </header>

      <section className="mt-10">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          {experiment ? "Your experiment" : "This time"}
        </p>
        {experiment ? (
          <>
            <p
              className="mt-3 font-[family-name:var(--font-fraunces)] text-xl leading-snug"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
              }}
            >
              {experiment.title}
            </p>
            <p
              className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              {experiment.instruction}
            </p>
          </>
        ) : (
          <p
            className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Answer the same prompt again. Focus on one thing you want to try
            differently — Haelo coaching will appear here once analysis is
            connected.
          </p>
        )}
      </section>

      <section className="mt-10">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          Same prompt
        </p>
        <p
          className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
          }}
        >
          &ldquo;{initialSession.prompt_text_snapshot}&rdquo;
        </p>
      </section>

      <div id={statusId} className="mt-8" aria-live="polite">
        {phase === "requesting" && (
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            Requesting microphone access…
          </p>
        )}
        {phase === "countdown" && recorder.countdownValue != null && (
          <p
            className="font-[family-name:var(--font-fraunces)] text-5xl tabular-nums"
            style={{ color: accent }}
          >
            {recorder.countdownValue}
          </p>
        )}
        {phase === "recording" && (
          <div>
            <p className="text-sm font-semibold" style={{ color: accent }}>
              Recording
            </p>
            <p className="mt-1 font-mono text-base tabular-nums">
              {formatTime(recorder.elapsedSeconds)}
            </p>
          </div>
        )}
        {phase === "uploading" && (
          <p className="text-sm font-medium" style={{ color: accent }}>
            Saving your second response…
          </p>
        )}
      </div>

      {phase === "review" && recorder.objectUrl ? (
        <div className="mt-8 max-w-lg">
          <ResponseReview
            src={recorder.objectUrl}
            durationSeconds={recorder.elapsedSeconds}
            transcript={recorder.transcript || null}
            transcriptStatus={
              recorder.transcript.trim() ? "ready" : "pending"
            }
            accentColor={accent}
            label="Second response"
          />
        </div>
      ) : null}

      {(saveError ||
        (recorder.error && phase === "error" ? recorder.error.message : null)) && (
        <p
          className="mt-6 text-sm"
          style={{ color: "var(--rose-deep, #D478A0)" }}
          role="alert"
        >
          {saveError || recorder.error?.message}
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {(phase === "ready" || phase === "error") && (
          <button
            type="button"
            onClick={() => void recorder.startRecording()}
            aria-describedby={statusId}
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)]"
          >
            Start Recording
          </button>
        )}
        {(phase === "countdown" || phase === "recording") && (
          <button
            type="button"
            onClick={() => recorder.stopRecording()}
            className="inline-flex min-h-12 items-center rounded-full px-6 py-3.5 text-sm font-semibold"
            style={{ background: "var(--gold)", color: "var(--on-warm)" }}
          >
            Stop Recording
          </button>
        )}
        {phase === "review" && (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="inline-flex min-h-12 items-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-50"
            >
              Save & Compare
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setSaveError(null);
                recorder.retake();
              }}
              className="inline-flex min-h-12 items-center rounded-full px-5 py-3.5 text-sm font-semibold"
              style={{
                background: "color-mix(in srgb, var(--violet) 10%, transparent)",
              }}
            >
              Retake
            </button>
          </>
        )}
      </div>
    </div>
  );
}
