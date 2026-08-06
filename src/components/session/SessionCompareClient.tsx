"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ResponseReview } from "@/components/session/ResponseReview";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { getPlanetPageContent } from "@/lib/planets/content";
import type { Planet } from "@/lib/prompts";
import {
  fetchSessionDetailClient,
  type SessionDetail,
} from "@/lib/sessions/fetchSessionClient";
import {
  completeSession,
  updateAuthenticityChoice,
} from "@/lib/sessions/updateSession";
import {
  AUTHENTICITY_OPTIONS,
  type AuthenticityChoice,
} from "@/lib/sessions/types";

type SessionCompareClientProps = {
  planet: Planet;
  sessionId: string;
  initialSession: SessionDetail;
};

export function SessionCompareClient({
  planet,
  sessionId,
  initialSession,
}: SessionCompareClientProps) {
  const router = useRouter();
  const content = getPlanetPageContent(planet);
  const accent = getVoicePlanetById(planet)?.color ?? "var(--violet)";

  const [session, setSession] = useState(initialSession);
  const [choice, setChoice] = useState<AuthenticityChoice | null>(
    initialSession.authenticity_choice,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const first = session.session_attempts.find((a) => a.attempt_number === 1);
  const second = session.session_attempts.find((a) => a.attempt_number === 2);
  const hasComparison =
    session.analysis?.status === "ready" &&
    Boolean(session.analysis.comparisonObservation);

  useEffect(() => {
    if (!second) {
      router.replace(`/session/${planet}/${sessionId}/review`);
    }
  }, [second, planet, router, sessionId]);

  useEffect(() => {
    if (session.analysis_status !== "pending") return;
    const id = window.setInterval(() => {
      void fetchSessionDetailClient(sessionId).then((next) => {
        if (next) setSession(next);
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, [session.analysis_status, sessionId]);

  async function handleFinish() {
    setBusy(true);
    setError(null);
    try {
      if (choice) {
        await updateAuthenticityChoice(sessionId, choice);
      }
      await completeSession(sessionId);
      router.push(`/session/${planet}/${sessionId}/complete`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not finish this session.",
      );
      setBusy(false);
    }
  }

  if (!first || !second) {
    return null;
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
          Hear the Difference
        </h1>
        <p
          className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          &ldquo;{session.prompt_text_snapshot}&rdquo;
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            First response
          </p>
          <div className="mt-4">
            <ResponseReview
              storagePath={first.storage_path}
              durationSeconds={first.duration_seconds}
              transcript={first.transcript}
              transcriptStatus={first.transcript_status}
              accentColor={accent}
              label="First response"
            />
          </div>
        </section>

        <section>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            Second response
          </p>
          <div className="mt-4">
            <ResponseReview
              storagePath={second.storage_path}
              durationSeconds={second.duration_seconds}
              transcript={second.transcript}
              transcriptStatus={second.transcript_status}
              accentColor={accent}
              label="Second response"
            />
          </div>
        </section>
      </div>

      <section className="mt-12">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
          style={{ color: accent }}
        >
          What changed
        </p>
        <div className="mt-4">
          {hasComparison && session.analysis?.comparisonObservation ? (
            <p
              className="text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {session.analysis.comparisonObservation}
            </p>
          ) : session.analysis_status === "pending" ? (
            <p
              className="text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
              aria-live="polite"
            >
              Haelo is looking at your responses…
            </p>
          ) : (
            <p
              className="text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              Comparison notes aren&rsquo;t available yet. You can still listen
              to both recordings and decide for yourself.
            </p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <p
          className="font-[family-name:var(--font-fraunces)] text-xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 1, "wght" 500',
          }}
        >
          Which sounded more like you?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {AUTHENTICITY_OPTIONS.map((opt) => {
            const selected = choice === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  const next = selected ? null : opt.id;
                  setChoice(next);
                  void updateAuthenticityChoice(sessionId, next).catch(() => {
                    // optional persistence
                  });
                }}
                className="min-h-11 rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
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
      </section>

      {error ? (
        <p
          className="mt-6 text-sm"
          style={{ color: "var(--rose-deep, #D478A0)" }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-10">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleFinish()}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-sm font-semibold text-[var(--on-violet)] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Finish Session
        </button>
      </div>
    </div>
  );
}
