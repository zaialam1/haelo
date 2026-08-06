"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponseReview } from "@/components/session/ResponseReview";
import { SessionAnalysisPanel } from "@/components/session/SessionAnalysisPanel";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { getPlanetPageContent } from "@/lib/planets/content";
import type { Planet } from "@/lib/prompts";
import {
  fetchSessionDetailClient,
  type SessionDetail,
} from "@/lib/sessions/fetchSessionClient";
import {
  completeSession,
  updateSessionReflection,
} from "@/lib/sessions/updateSession";
import {
  FEELING_OPTIONS,
  SOUNDED_LIKE_YOU_OPTIONS,
  type FeelingReflection,
  type SoundedLikeYou,
} from "@/lib/sessions/types";

type SessionReviewClientProps = {
  planet: Planet;
  sessionId: string;
  initialSession: SessionDetail;
};

export function SessionReviewClient({
  planet,
  sessionId,
  initialSession,
}: SessionReviewClientProps) {
  const router = useRouter();
  const content = getPlanetPageContent(planet);
  const accent = getVoicePlanetById(planet)?.color ?? "var(--violet)";

  const [session, setSession] = useState(initialSession);
  const [feeling, setFeeling] = useState<FeelingReflection | null>(
    initialSession.feeling_reflection,
  );
  const [soundedLike, setSoundedLike] = useState<SoundedLikeYou | null>(
    initialSession.sounded_like_you,
  );
  const [thought, setThought] = useState(initialSession.user_reflection ?? "");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [busy, setBusy] = useState(false);
  const [retryingAnalysis, setRetryingAnalysis] = useState(false);
  const [analysisFailure, setAnalysisFailure] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const attempt = session.session_attempts.find((a) => a.attempt_number === 1);
  const analysisPending = session.analysis_status === "pending";
  const hasSecondAttempt = session.session_attempts.some(
    (a) => a.attempt_number === 2,
  );

  useEffect(() => {
    if (session.analysis_status !== "pending") return;

    const id = window.setInterval(() => {
      void fetchSessionDetailClient(sessionId).then((next) => {
        if (next) setSession(next);
      });
    }, 4000);

    return () => window.clearInterval(id);
  }, [session.analysis_status, sessionId]);

  async function handleRetryAnalysis() {
    if (retryingAnalysis) return;
    setRetryingAnalysis(true);
    setAnalysisFailure(null);
    setSession((prev) => ({
      ...prev,
      analysis_status: "pending",
      analysis: prev.analysis
        ? { ...prev.analysis, status: "pending" }
        : { sessionId, status: "pending" },
    }));

    try {
      const res = await fetch(`/api/sessions/${sessionId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await res.json().catch(() => null)) as {
        analysisStatus?: string;
        message?: string;
        error?: string;
      } | null;

      const next = await fetchSessionDetailClient(sessionId);
      if (next) setSession(next);

      if (!res.ok) {
        setAnalysisFailure(
          body?.error || "Could not restart analysis. Check the server log.",
        );
      } else if (body?.analysisStatus === "failed") {
        setAnalysisFailure(
          body.message || "Analysis could not be completed.",
        );
      }
    } catch {
      setAnalysisFailure("Could not reach the analysis service.");
      const next = await fetchSessionDetailClient(sessionId);
      if (next) setSession(next);
    } finally {
      setRetryingAnalysis(false);
    }
  }

  function scheduleReflectionPersist(next: {
    feeling?: FeelingReflection | null;
    soundedLike?: SoundedLikeYou | null;
    thought?: string;
  }) {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      void updateSessionReflection(sessionId, {
        feelingReflection:
          next.feeling !== undefined ? next.feeling : feeling,
        soundedLikeYou:
          next.soundedLike !== undefined ? next.soundedLike : soundedLike,
        userReflection: next.thought !== undefined ? next.thought : thought,
      }).catch(() => {
        // Reflection is optional; keep UI usable if save fails briefly.
      });
    }, 400);
  }

  async function persistReflectionNow() {
    await updateSessionReflection(sessionId, {
      feelingReflection: feeling,
      soundedLikeYou: soundedLike,
      userReflection: thought,
    });
  }

  async function handleSeeAnalysis() {
    setError(null);
    setBusy(true);
    try {
      await persistReflectionNow();
      setShowAnalysis(true);
      const next = await fetchSessionDetailClient(sessionId);
      if (next) setSession(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open analysis.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLookLater() {
    setError(null);
    setBusy(true);
    try {
      await persistReflectionNow();
      await completeSession(sessionId);
      router.push(`/session/${planet}/${sessionId}/complete`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not finish this session.",
      );
      setBusy(false);
    }
  }

  async function handleFinish() {
    setError(null);
    setBusy(true);
    try {
      await persistReflectionNow();
      await completeSession(sessionId);
      router.push(`/session/${planet}/${sessionId}/complete`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not finish this session.",
      );
      setBusy(false);
    }
  }

  function handleTryAgain() {
    router.push(`/session/${planet}/${sessionId}/retry`);
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
          className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          }}
        >
          Session Review
        </h1>
      </header>

      <section className="mt-10">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          Original prompt
        </p>
        <p
          className="mt-3 max-w-2xl font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
          }}
        >
          &ldquo;{session.prompt_text_snapshot}&rdquo;
        </p>
      </section>

      <section className="mt-10">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          Your response
        </p>
        <div className="mt-4">
          {attempt ? (
            <ResponseReview
              storagePath={attempt.storage_path}
              durationSeconds={attempt.duration_seconds}
              transcript={attempt.transcript}
              transcriptStatus={attempt.transcript_status}
              accentColor={accent}
              label="First response"
            />
          ) : (
            <p style={{ color: "var(--foreground-muted)" }}>
              No recording found for this session.
            </p>
          )}
        </div>
      </section>

      {analysisPending && !showAnalysis ? (
        <p
          className="mt-8 text-sm"
          style={{ color: "var(--foreground-muted)" }}
          aria-live="polite"
        >
          Haelo is looking at your response…
        </p>
      ) : null}

      <section className="mt-12">
        <p
          className="font-[family-name:var(--font-fraunces)] text-xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 1, "wght" 500',
          }}
        >
          How did that feel?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FEELING_OPTIONS.map((opt) => {
            const selected = feeling === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const next = selected ? null : opt.id;
                  setFeeling(next);
                  scheduleReflectionPersist({ feeling: next });
                }}
                className="min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background: selected
                    ? `color-mix(in srgb, ${accent} 28%, var(--surface))`
                    : "color-mix(in srgb, var(--violet) 10%, transparent)",
                  color: "var(--foreground)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <p
          className="mt-8 font-[family-name:var(--font-fraunces)] text-xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 1, "wght" 500',
          }}
        >
          Did that sound like you?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SOUNDED_LIKE_YOU_OPTIONS.map((opt) => {
            const selected = soundedLike === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const next = selected ? null : opt.id;
                  setSoundedLike(next);
                  scheduleReflectionPersist({ soundedLike: next });
                }}
                className="min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background: selected
                    ? `color-mix(in srgb, ${accent} 28%, var(--surface))`
                    : "color-mix(in srgb, var(--violet) 10%, transparent)",
                  color: "var(--foreground)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <label className="mt-8 block">
          <span
            className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            Add a thought{" "}
            <span className="font-normal normal-case tracking-normal">
              (optional)
            </span>
          </span>
          <textarea
            value={thought}
            onChange={(e) => {
              setThought(e.target.value);
              scheduleReflectionPersist({ thought: e.target.value });
            }}
            rows={3}
            placeholder="Anything you noticed…"
            className="mt-3 w-full resize-y rounded-2xl border bg-transparent px-4 py-3 text-[0.9375rem] leading-relaxed outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              borderColor: "var(--hairline)",
              color: "var(--foreground)",
            }}
          />
        </label>
      </section>

      {!showAnalysis ? (
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSeeAnalysis()}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            See My Analysis
          </button>
          {!hasSecondAttempt ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleTryAgain}
              className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                background: "var(--gold)",
                color: "var(--on-warm)",
              }}
            >
              Try Again
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleLookLater()}
            className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "color-mix(in srgb, var(--violet) 10%, transparent)",
              color: "var(--foreground)",
            }}
          >
            Look at Analysis Later
          </button>
        </div>
      ) : (
        <section className="mt-12">
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: accent }}
          >
            Haelo analysis
          </p>
          <div className="mt-4">
            <SessionAnalysisPanel
              analysis={session.analysis}
              analysisStatus={
                retryingAnalysis ? "pending" : session.analysis_status
              }
              accentColor={accent}
              onRetry={
                session.analysis_status === "failed" && !retryingAnalysis
                  ? handleRetryAnalysis
                  : undefined
              }
              retrying={retryingAnalysis}
              failureMessage={analysisFailure}
            />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {!hasSecondAttempt ? (
              <button
                type="button"
                disabled={busy}
                onClick={handleTryAgain}
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background: "var(--gold)",
                  color: "var(--on-warm)",
                }}
              >
                Try Again
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  router.push(`/session/${planet}/${sessionId}/compare`)
                }
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background: "var(--gold)",
                  color: "var(--on-warm)",
                }}
              >
                Hear the Difference
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleFinish()}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            >
              Finish Session
            </button>
          </div>
        </section>
      )}

      {error ? (
        <p
          className="mt-6 text-sm"
          style={{ color: "var(--rose-deep, #D478A0)" }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-12">
        <TransitionLink
          href={`/${planet}`}
          variant="fade"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--foreground-muted)" }}
        >
          Back to {content.label}
        </TransitionLink>
      </div>
    </div>
  );
}
