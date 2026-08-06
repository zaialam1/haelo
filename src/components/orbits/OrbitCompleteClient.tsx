"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { PlanetTags } from "@/components/orbits/PlanetTags";
import {
  retryOrbitSynthesisAction,
  runOrbitSynthesisAction,
} from "@/lib/orbits/actions";
import type { OrbitSummativeAnalysisContent } from "@/lib/orbits/types";
import type { Planet } from "@/lib/prompts";

export function OrbitCompleteClient({
  orbitKey,
  orbitTitle,
  planetsInvolved,
  analysis,
  analysisStatus,
  failureMessage,
}: {
  orbitKey: string;
  orbitTitle: string;
  planetsInvolved: Planet[];
  analysis: OrbitSummativeAnalysisContent | null;
  analysisStatus: "pending" | "ready" | "failed" | "missing";
  failureMessage?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(analysisStatus);
  const [localAnalysis, setLocalAnalysis] = useState(analysis);
  const [localFailure, setLocalFailure] = useState(failureMessage ?? null);
  const autoStarted = useRef(false);

  useEffect(() => {
    if (autoStarted.current) return;
    if (localStatus !== "pending" && localStatus !== "missing") return;
    autoStarted.current = true;

    startTransition(async () => {
      setLocalStatus("pending");
      setLocalFailure(null);
      const result = await runOrbitSynthesisAction(orbitKey);
      if (result.ok) {
        setLocalStatus("ready");
        setLocalAnalysis(result.content);
      } else {
        setLocalStatus("failed");
        setLocalFailure(result.message);
      }
    });
  }, [orbitKey, localStatus]);

  function handleRetry() {
    startTransition(async () => {
      setLocalStatus("pending");
      setLocalFailure(null);
      const result = await retryOrbitSynthesisAction(orbitKey);
      if (result.ok) {
        setLocalStatus("ready");
        setLocalAnalysis(result.content);
      } else {
        setLocalStatus("failed");
        setLocalFailure(result.message);
      }
    });
  }

  const showPending = localStatus === "pending" || pending;

  return (
    <article className="mx-auto w-full max-w-2xl">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--gold)" }}
      >
        Orbit Complete
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-5xl"
        style={{ color: "var(--foreground)" }}
      >
        {orbitTitle}
      </h1>
      <p
        className="mt-3 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Here&apos;s what came into focus.
      </p>

      {showPending ? (
        <p
          className="mt-10 text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
          aria-live="polite"
        >
          Completing your Orbit… Haelo is gathering what became clearer across
          your six reflections.
        </p>
      ) : null}

      {(localStatus === "failed" || localStatus === "missing") &&
      !showPending ? (
        <div className="mt-10">
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--rose-deep, #D478A0)" }}
            role="alert"
          >
            {localFailure ||
              "We're having trouble creating your final reflection. Try again."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{
              background: "var(--violet)",
              color: "var(--on-violet)",
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      {localStatus === "ready" && localAnalysis && !showPending ? (
        <div className="mt-10 space-y-10">
          <AnalysisSection
            title="What Became Clearer"
            body={localAnalysis.whatBecameClearer}
          />
          <AnalysisSection
            title="What Kept Coming Up"
            body={localAnalysis.whatKeptComingUp}
          />
          <AnalysisSection
            title="How Your Voice Moved"
            body={localAnalysis.howYourVoiceMoved}
          />
          <AnalysisSection
            title="Carry This With You"
            body={localAnalysis.carryThisWithYou}
          />
          {localAnalysis.practicePrompt ? (
            <section>
              <h2
                className="text-[0.8125rem] font-semibold tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                Practice this
              </h2>
              <p
                className="mt-3 text-[0.9375rem] leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                {localAnalysis.practicePrompt}
              </p>
              <p
                className="mt-2 text-[0.75rem]"
                style={{ color: "var(--foreground-muted)" }}
              >
                Optional — not required to complete this Orbit.
              </p>
            </section>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12">
        <h2
          className="text-[0.8125rem] font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          This Orbit moved through
        </h2>
        <PlanetTags planets={planetsInvolved} className="mt-3" />
      </section>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TransitionLink
          href="/home"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Return to Universe
        </TransitionLink>
        <TransitionLink
          href="/journey"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{
            background: "color-mix(in srgb, var(--violet) 12%, transparent)",
            color: "var(--foreground)",
          }}
        >
          View in Journey
        </TransitionLink>
      </div>
    </article>
  );
}

function AnalysisSection({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2
        className="text-[0.8125rem] font-semibold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h2>
      <p
        className="mt-3 text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {body}
      </p>
    </section>
  );
}
