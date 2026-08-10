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
import {
  planetSessionFlow,
  orbitSessionFlowFromSession,
  type SessionFlowConfig,
} from "@/lib/sessions/sessionFlow";

type SessionReviewClientProps = {
  planet: Planet;
  sessionId: string;
  initialSession: SessionDetail;
  /** Prefer orbitKey over flow — flow contains functions and cannot cross RSC. */
  orbitKey?: string;
  flow?: SessionFlowConfig;
};

export function SessionReviewClient({
  planet,
  sessionId,
  initialSession,
  orbitKey,
  flow: flowProp,
}: SessionReviewClientProps) {
  const router = useRouter();
  const content = getPlanetPageContent(planet);
  const accent = getVoicePlanetById(planet)?.color ?? "var(--violet)";
  const flow =
    flowProp ??
    (orbitKey
      ? orbitSessionFlowFromSession({
          orbitKey,
          planet,
          orbitQuestionKey: initialSession.orbit_question_key,
          userOrbitProgressId: initialSession.user_orbit_progress_id,
          orbitVersion: initialSession.orbit_version,
        })
      : planetSessionFlow(planet));

  // #region agent log
  fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "965f52",
    },
    body: JSON.stringify({
      sessionId: "965f52",
      runId: "post-fix",
      hypothesisId: "B",
      location: "SessionReviewClient.tsx:init",
      message: "SessionReviewClient resolved flow on client",
      data: {
        flowSource: flow.source,
        usedOrbitKeyProp: Boolean(orbitKey),
        usedFlowProp: Boolean(flowProp),
        reviewHrefType: typeof flow.reviewHref,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
    // Keep polling until the analysis *row* is ready/failed, not only the
    // denormalized session flag (which can advance before the row saves).
    const rowStatus = session.analysis?.status;
    const sessionStatus = session.analysis_status;
    const stillWaiting =
      sessionStatus === "pending" ||
      (sessionStatus === "ready" && rowStatus !== "ready") ||
      rowStatus === "pending";

    if (!stillWaiting) return;

    const id = window.setInterval(() => {
      void fetchSessionDetailClient(sessionId).then((next) => {
        if (next) setSession(next);
      });
    }, 4000);

    return () => window.clearInterval(id);
  }, [session.analysis_status, session.analysis?.status, sessionId]);

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
      router.push(flow.afterCompleteHref(sessionId));
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
      router.push(flow.afterCompleteHref(sessionId));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not finish this session.",
      );
      setBusy(false);
    }
  }

  function handleTryAgain() {
    router.push(flow.retryHref(sessionId));
  }

  function handleTryExperiment() {
    const href = flow.retryHref(sessionId);
    const sep = href.includes("?") ? "&" : "?";
    router.push(`${href}${sep}intent=experiment`);
  }

  const hasExperiment = Boolean(session.analysis?.experiment);

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
          {flow.reviewTitle ?? "Session Review"}
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
              onClick={hasExperiment ? handleTryExperiment : handleTryAgain}
              className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                background: "var(--gold)",
                color: "var(--on-warm)",
              }}
            >
              {hasExperiment ? "Try the Experiment" : "Try Again"}
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
                !retryingAnalysis &&
                (session.analysis_status === "failed" ||
                  (session.analysis_status === "ready" &&
                    session.analysis?.status !== "ready"))
                  ? handleRetryAnalysis
                  : undefined
              }
              retrying={retryingAnalysis}
              failureMessage={analysisFailure}
            />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {!hasSecondAttempt ? (
              <>
                {hasExperiment ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleTryExperiment}
                    className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                    style={{
                      background: "var(--gold)",
                      color: "var(--on-warm)",
                    }}
                  >
                    Try the Experiment
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleTryAgain}
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                  style={{
                    background: hasExperiment
                      ? "color-mix(in srgb, var(--violet) 10%, transparent)"
                      : "var(--gold)",
                    color: hasExperiment ? "var(--foreground)" : "var(--on-warm)",
                  }}
                >
                  {hasExperiment ? "Record again" : "Try Again"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => router.push(flow.compareHref(sessionId))}
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
              {flow.finishLabel}
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
          href={flow.exitHref}
          variant="fade"
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--foreground-muted)" }}
        >
          {flow.source === "orbit"
            ? "Back to Orbit"
            : `Back to ${content.label}`}
        </TransitionLink>
      </div>
    </div>
  );
}
