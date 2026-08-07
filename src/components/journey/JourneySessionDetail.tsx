"use client";

import { type ReactNode } from "react";
import { ResponseReview } from "@/components/session/ResponseReview";
import { SessionAnalysisPanel } from "@/components/session/SessionAnalysisPanel";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { planetAccent } from "@/lib/journey/mapSession";
import {
  findMetricResult,
  JOURNEY_METRIC_LABELS,
  levelLabel,
  planetMetricKey,
  type JourneyMetricKey,
} from "@/lib/journey/metrics";
import type { JourneySession } from "@/lib/journey/types";
import type { AnalysisStatus, SessionAnalysis } from "@/lib/sessions/types";
import type { TranscriptStatus } from "@/lib/sessions/types";

function PanelSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-7">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
        style={{ color: "var(--foreground-muted)" }}
      >
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function feelingLabel(value: string | null | undefined): string | null {
  if (value === "held_back") return "Held back";
  if (value === "in_between") return "Somewhere in between";
  if (value === "said_it") return "Said what I meant";
  return null;
}

function soundedLabel(value: string | null | undefined): string | null {
  if (value === "not_really") return "Not really";
  if (value === "mostly") return "Mostly";
  if (value === "yes") return "Yes";
  return null;
}

function authenticityLabel(value: string | null | undefined): string | null {
  if (value === "first") return "First";
  if (value === "second") return "Second";
  if (value === "mix") return "A mix of both";
  return null;
}

export function formatJourneyPanelDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export function toJourneySessionAnalysis(
  session: JourneySession,
): SessionAnalysis | null {
  if (!session.analysisStatus) return null;
  const status = session.analysisStatus as AnalysisStatus;
  if (status !== "ready") {
    return { sessionId: session.sessionId, status };
  }
  return {
    sessionId: session.sessionId,
    status: "ready",
    strength: session.analysisStrength ?? undefined,
    observation: session.analysisObservation ?? undefined,
    evidence: session.analysisEvidence ?? undefined,
    experiment: session.analysisExperiment ?? undefined,
    comparisonObservation: session.changeObservation ?? undefined,
  };
}

type JourneySessionDetailProps = {
  session: JourneySession;
  /** Hide the orbit source line when already inside Orbit detail. */
  hideOrbitSource?: boolean;
  /** Compact header when nested inside Orbit detail. */
  compact?: boolean;
  /** Optional action rendered opposite the planet/date header (e.g. Close). */
  headerAction?: ReactNode;
};

/**
 * Shared response detail body used by Journey session panel and Orbit detail.
 * Does not include panel chrome (backdrop / close).
 */
export function JourneySessionDetail({
  session,
  hideOrbitSource = false,
  compact = false,
  headerAction,
}: JourneySessionDetailProps) {
  const first = session.clips[0] ?? null;
  const second = session.clips[1] ?? null;
  const accent = planetAccent(session.planet);
  const analysis = toJourneySessionAnalysis(session);
  const feeling = feelingLabel(session.feelingReflection);
  const sounded = soundedLabel(session.soundedLikeYou);
  const authenticity = authenticityLabel(session.authenticityChoice);

  const lensMetricKey: JourneyMetricKey | null =
    session.planet !== "uncategorized"
      ? planetMetricKey(session.planet)
      : null;
  const lensResult = lensMetricKey
    ? findMetricResult(session.journeyMetrics, lensMetricKey)
    : null;
  const lensLevelLabel =
    lensMetricKey && lensResult?.status === "scored"
      ? levelLabel(lensMetricKey, lensResult.level)
      : null;

  return (
    <div className={compact ? "" : "flex flex-1 flex-col"}>
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
            style={{ color: accent }}
          >
            {session.planetLabel}
            <span className="mx-2 font-normal opacity-40" aria-hidden="true">
              ·
            </span>
            <span style={{ color: "var(--foreground-muted)" }}>
              {formatJourneyPanelDate(session.recordedAt)}
            </span>
          </p>
          {session.sessionType === "daily" ? (
            <p
              className="mt-2 inline-flex rounded-full px-2.5 py-0.5 text-[0.625rem] font-semibold tracking-[0.08em] uppercase"
              style={{
                background:
                  "color-mix(in srgb, var(--gold) 40%, var(--surface))",
                color: "var(--violet)",
              }}
            >
              Daily prompt
            </p>
          ) : null}
          {!hideOrbitSource &&
          session.sourceType === "orbit" &&
          session.orbitTitle ? (
            <p className="mt-2 text-[0.75rem] font-medium">
              {session.orbitKey ? (
                <TransitionLink
                  href={`/orbits/${session.orbitKey}`}
                  variant="fade"
                  className="haelo-btn underline-offset-2 hover:opacity-80 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Orbit · {session.orbitTitle}
                </TransitionLink>
              ) : (
                <span style={{ color: "var(--foreground-muted)" }}>
                  Orbit · {session.orbitTitle}
                </span>
              )}
            </p>
          ) : null}
        </div>
        {headerAction}
      </div>

      <div className={compact ? "mt-5" : "mt-6"}>
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          Prompt
        </p>
        <p
          className="mt-2 font-[family-name:var(--font-fraunces)] text-xl leading-snug"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
            color: "var(--foreground)",
          }}
        >
          &ldquo;{session.prompt}&rdquo;
        </p>
      </div>

      {first ? (
        <PanelSection title="Your response">
          {first.audioUrl ? (
            <ResponseReview
              storagePath={first.audioUrl}
              durationSeconds={first.durationSeconds}
              transcript={first.transcript}
              transcriptStatus={
                (first.transcriptStatus as TranscriptStatus | null) ??
                (first.transcript?.trim() ? "ready" : "unavailable")
              }
              accentColor={accent}
              label="First response"
            />
          ) : (
            <p
              className="text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              No recording was saved for this response.
            </p>
          )}
        </PanelSection>
      ) : (
        <PanelSection title="Your response">
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            This reflection could not be loaded.
          </p>
        </PanelSection>
      )}

      {feeling || sounded || session.userReflection?.trim() ? (
        <PanelSection title="Your reflection">
          {feeling ? (
            <p
              className="text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              How it felt: {feeling}
            </p>
          ) : null}
          {sounded ? (
            <p
              className="mt-1 text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              Sounded like you: {sounded}
            </p>
          ) : null}
          {session.userReflection?.trim() ? (
            <p
              className="mt-2 text-[0.9375rem] leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {session.userReflection.trim()}
            </p>
          ) : null}
        </PanelSection>
      ) : null}

      {lensMetricKey && lensLevelLabel ? (
        <PanelSection title="Journey Lens">
          <p
            className="text-[0.8125rem] font-medium tracking-wide"
            style={{ color: "var(--foreground-muted)" }}
          >
            {JOURNEY_METRIC_LABELS[lensMetricKey]}
          </p>
          <p
            className="mt-1 font-[family-name:var(--font-fraunces)] text-xl leading-snug"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
              color: "var(--foreground)",
            }}
          >
            {lensLevelLabel}
          </p>
        </PanelSection>
      ) : null}

      <PanelSection title="What Haelo noticed">
        <SessionAnalysisPanel
          analysis={analysis}
          analysisStatus={
            (session.analysisStatus as AnalysisStatus | null) ?? null
          }
          accentColor={accent}
        />
        {session.voiceNotes.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {session.voiceNotes.map((note) => (
              <li
                key={note}
                className="text-[0.9375rem] leading-relaxed"
                style={{ color: "var(--foreground)" }}
              >
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </PanelSection>

      {second ? (
        <PanelSection title="Try again">
          {second.audioUrl ? (
            <ResponseReview
              storagePath={second.audioUrl}
              durationSeconds={second.durationSeconds}
              transcript={second.transcript}
              transcriptStatus={
                (second.transcriptStatus as TranscriptStatus | null) ??
                (second.transcript?.trim() ? "ready" : "unavailable")
              }
              accentColor={accent}
              label="Second response"
            />
          ) : null}
        </PanelSection>
      ) : null}

      {session.changeObservation?.trim() ? (
        <PanelSection title="What changed">
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {session.changeObservation.trim()}
          </p>
        </PanelSection>
      ) : null}

      {authenticity ? (
        <PanelSection title="Which sounded more like you">
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {authenticity}
          </p>
        </PanelSection>
      ) : null}

      {session.reviewHref ? (
        <div className="mt-8">
          <TransitionLink
            href={session.reviewHref}
            variant="fade"
            className="journey-btn haelo-btn inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "color-mix(in srgb, var(--violet) 12%, transparent)",
              color: "var(--foreground)",
            }}
          >
            Open full session review
          </TransitionLink>
        </div>
      ) : null}

      {!compact ? (
        <div
          className="mt-auto pt-10"
          style={{ borderTop: "1px solid var(--hairline)" }}
        >
          <span
            className="inline-block size-3.5 rounded-full"
            style={{
              background: accent,
              boxShadow: `0 0 14px color-mix(in srgb, ${accent} 60%, transparent)`,
            }}
            aria-hidden="true"
          />
        </div>
      ) : null}
    </div>
  );
}
