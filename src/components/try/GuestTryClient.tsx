"use client";

import { useState } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

const DEMO_PROMPT =
  "What's something you've been thinking about lately but haven't really said out loud?";

type Phase = "intro" | "record" | "done";

/**
 * One free reflection without an account. Audio stays on-device;
 * signup is required to save a star / Universe.
 */
export function GuestTryClient() {
  const [phase, setPhase] = useState<Phase>("intro");
  const recorder = useAudioRecorder({ maxSeconds: 60, countdownSeconds: 0 });

  const isRecording = recorder.status === "recording";
  const hasRecording = recorder.status === "recorded" && Boolean(recorder.blob);

  function finishDemo() {
    recorder.stopRecording();
    setPhase("done");
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-5 py-10 sm:px-8 sm:py-14">
      <TransitionLink
        href="/"
        variant="fade"
        className="self-start text-sm font-medium text-[var(--violet)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        ← Home
      </TransitionLink>

      {phase === "intro" ? (
        <>
          <p
            className="mt-8 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Free demo · Express
          </p>
          <h1
            className="mt-3 font-[family-name:var(--font-fraunces)] text-[1.85rem] leading-tight sm:text-[2.15rem]"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
              letterSpacing: "-0.015em",
            }}
          >
            Try one reflection — no account needed.
          </h1>
          <p
            className="mt-4 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Speaking up takes courage. This is a private practice moment on
            Express. Nothing is saved until you create an account.
          </p>
          <button
            type="button"
            onClick={() => setPhase("record")}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Start the demo
          </button>
        </>
      ) : null}

      {phase === "record" ? (
        <>
          <p
            className="mt-8 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Express
          </p>
          <h1
            className="mt-3 font-[family-name:var(--font-fraunces)] text-[1.65rem] leading-snug sm:text-[1.85rem]"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            {DEMO_PROMPT}
          </h1>
          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Record for up to a minute, or skip ahead if you just want to see
            what happens next.
          </p>

          {recorder.error ? (
            <p className="mt-4 text-sm text-[#9B2C2C]" role="alert">
              {recorder.error.message}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col items-center gap-4">
            {!hasRecording ? (
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recorder.stopRecording();
                  } else {
                    void recorder.startRecording();
                  }
                }}
                className="inline-flex min-h-14 min-w-[12rem] items-center justify-center rounded-full bg-[var(--violet)] px-8 text-[0.9375rem] font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={
                  isRecording
                    ? {
                        background: "color-mix(in srgb, #9B2C2C 85%, var(--violet))",
                      }
                    : undefined
                }
              >
                {isRecording
                  ? `Stop · ${recorder.elapsedSeconds}s`
                  : "Hold space — tap to record"}
              </button>
            ) : (
              <p
                className="text-sm font-medium"
                style={{ color: "var(--violet)" }}
              >
                Nice — you spoke. That would become a star in your Universe.
              </p>
            )}

            <button
              type="button"
              onClick={finishDemo}
              className="min-h-11 text-sm font-semibold text-[var(--violet)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              {hasRecording || isRecording ? "Continue" : "Skip recording"}
            </button>
          </div>
        </>
      ) : null}

      {phase === "done" ? (
        <>
          <div
            className="mt-10 flex flex-col items-center rounded-3xl px-6 py-10 text-center motion-safe:animate-[reveal-rise_0.5s_ease-out]"
            style={{
              background:
                "linear-gradient(165deg, color-mix(in srgb, var(--violet) 16%, var(--surface)), var(--surface))",
              border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
            }}
          >
            <span
              className="inline-flex size-16 items-center justify-center rounded-full text-2xl motion-safe:animate-[star-wave_3s_ease-in-out_infinite]"
              style={{
                background:
                  "radial-gradient(circle, var(--gold), color-mix(in srgb, var(--rose) 50%, transparent))",
                color: "var(--violet)",
              }}
              aria-hidden="true"
            >
              ✦
            </span>
            <h1
              className="mt-5 font-[family-name:var(--font-fraunces)] text-[1.75rem] leading-snug"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
              }}
            >
              Your first star is ready to keep.
            </h1>
            <p
              className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Create a free account to save reflections, grow your planets, and
              build a private Universe that&rsquo;s only yours.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <TransitionLink
              href="/signup?next=/home"
              variant="fade"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              Save this to my Universe
            </TransitionLink>
            <TransitionLink
              href="/login?next=/home"
              variant="fade"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              I already have an account
            </TransitionLink>
          </div>
        </>
      ) : null}
    </div>
  );
}
