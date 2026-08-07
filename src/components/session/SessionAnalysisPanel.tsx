"use client";

import type { ReactNode } from "react";
import type { AnalysisStatus, SessionAnalysis } from "@/lib/sessions/types";

export type SessionAnalysisPanelProps = {
  analysis: SessionAnalysis | null;
  analysisStatus: AnalysisStatus | null;
  accentColor?: string;
  showComparison?: boolean;
  onRetry?: () => void;
  retrying?: boolean;
  failureMessage?: string | null;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase"
        style={{ color: "var(--foreground-muted)" }}
      >
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/**
 * Renders real analysis only. Never invents coaching copy.
 */
export function SessionAnalysisPanel({
  analysis,
  analysisStatus,
  accentColor = "var(--violet)",
  showComparison = false,
  onRetry,
  retrying = false,
  failureMessage = null,
}: SessionAnalysisPanelProps) {
  // Prefer the analysis row when it has real content; otherwise fall back to
  // the denormalized session status so a failed write cannot leave the UI
  // stuck on "looking…" forever.
  const status =
    analysis?.status === "ready" || analysis?.status === "failed"
      ? analysis.status
      : (analysisStatus ?? analysis?.status ?? null);

  if (status === "pending" || status == null) {
    return (
      <p
        className="text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
        aria-live="polite"
      >
        Haelo is looking at your response…
      </p>
    );
  }

  if (status === "failed" || !analysis || analysis.status !== "ready") {
    return (
      <div>
        <p
          className="text-[0.9375rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Analysis isn’t available for this session yet. Your recording is still
          saved — you can keep practicing normally.
        </p>
        {failureMessage ? (
          <p
            className="mt-3 text-[0.8125rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {failureMessage}
          </p>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            disabled={retrying}
            onClick={onRetry}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: accentColor,
              color: "var(--on-violet)",
            }}
          >
            {retrying ? "Trying again…" : "Try analysis again"}
          </button>
        ) : null}
      </div>
    );
  }

  const hasAnyContent =
    analysis.strength ||
    analysis.observation ||
    (analysis.evidence && analysis.evidence.length > 0) ||
    analysis.experiment ||
    (showComparison && analysis.comparisonObservation);

  if (!hasAnyContent) {
    return (
      <p
        className="text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        Analysis isn’t available for this session yet.
      </p>
    );
  }

  return (
    <div>
      {analysis.strength ? (
        <Section title="What came through">
          <p
            className="font-[family-name:var(--font-fraunces)] text-lg leading-snug"
            style={{
              color: "var(--foreground)",
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
            }}
          >
            {analysis.strength.title}
          </p>
          <p
            className="mt-2 text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.strength.description}
          </p>
        </Section>
      ) : null}

      {analysis.observation ? (
        <Section title="Something to notice">
          <p
            className="font-[family-name:var(--font-fraunces)] text-lg leading-snug"
            style={{
              color: "var(--foreground)",
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
            }}
          >
            {analysis.observation.title}
          </p>
          <p
            className="mt-2 text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.observation.description}
          </p>
          {analysis.evidence && analysis.evidence.length > 0 ? (
            <ul className="mt-4 space-y-2" aria-label="Lines from your recording">
              {analysis.evidence.map((item, index) => (
                <li
                  key={`${item.text}-${index}`}
                  className="rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed"
                  style={{
                    background: `color-mix(in srgb, ${accentColor} 10%, var(--surface))`,
                    color: "var(--foreground)",
                    border: "1px solid var(--hairline)",
                  }}
                >
                  &ldquo;{item.text}&rdquo;
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : analysis.evidence && analysis.evidence.length > 0 ? (
        <Section title="Something to notice">
          <ul className="space-y-2" aria-label="Lines from your recording">
            {analysis.evidence.map((item, index) => (
              <li
                key={`${item.text}-${index}`}
                className="rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed"
                style={{
                  background: `color-mix(in srgb, ${accentColor} 10%, var(--surface))`,
                  color: "var(--foreground)",
                  border: "1px solid var(--hairline)",
                }}
              >
                &ldquo;{item.text}&rdquo;
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {analysis.experiment ? (
        <Section title="Your next experiment">
          <p
            className="font-[family-name:var(--font-fraunces)] text-lg leading-snug"
            style={{
              color: "var(--foreground)",
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 500',
            }}
          >
            {analysis.experiment.title}
          </p>
          <p
            className="mt-2 text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.experiment.instruction}
          </p>
        </Section>
      ) : null}

      {showComparison && analysis.comparisonObservation ? (
        <Section title="What changed">
          <p
            className="text-[0.9375rem] leading-relaxed"
            style={{ color: "var(--foreground)" }}
          >
            {analysis.comparisonObservation}
          </p>
        </Section>
      ) : null}
    </div>
  );
}
