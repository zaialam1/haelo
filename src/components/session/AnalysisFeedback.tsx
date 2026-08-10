"use client";

import { useState, useTransition } from "react";
import { submitAnalysisFeedbackAction } from "@/lib/feedback/actions";
import {
  ANALYSIS_FEEDBACK_REASONS,
  type AnalysisFeedbackReason,
} from "@/lib/safety/types";

type AnalysisFeedbackProps = {
  sessionId: string;
  model?: string | null;
  promptVersion?: string | null;
};

/**
 * Subtle "Was this useful?" under individual AI analysis.
 * Never blocks Finish Session.
 */
export function AnalysisFeedback({
  sessionId,
  model = null,
  promptVersion = null,
}: AnalysisFeedbackProps) {
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [reason, setReason] = useState<AnalysisFeedbackReason | null>(null);
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(nextRating: "up" | "down", nextReason?: AnalysisFeedbackReason | null) {
    setError(null);
    startTransition(async () => {
      const result = await submitAnalysisFeedbackAction({
        sessionId,
        rating: nextRating,
        reason: nextRating === "down" ? nextReason ?? reason : null,
        details: nextRating === "down" ? details : undefined,
        model,
        promptVersion,
      });
      if (!result.ok) {
        setError(result.message ?? "Couldn’t save feedback.");
        return;
      }
      setRating(nextRating);
      setDone(true);
    });
  }

  if (done) {
    return (
      <p
        className="mt-4 text-[0.8125rem]"
        style={{ color: "var(--foreground-muted)" }}
        role="status"
      >
        Thanks — that helps Haelo improve.
      </p>
    );
  }

  return (
    <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
      <p
        className="text-[0.8125rem] font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Was this useful?
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => submit("up")}
          className="haelo-btn rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold disabled:opacity-60"
          style={{
            borderColor: "var(--hairline)",
            color: "var(--violet)",
            background:
              rating === "up"
                ? "color-mix(in srgb, var(--violet) 12%, transparent)"
                : "transparent",
          }}
          aria-label="Yes, this was useful"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRating("down")}
          className="haelo-btn rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold disabled:opacity-60"
          style={{
            borderColor: "var(--hairline)",
            color: "var(--foreground-muted)",
            background:
              rating === "down"
                ? "color-mix(in srgb, var(--rose) 12%, transparent)"
                : "transparent",
          }}
          aria-label="No, this was not useful"
        >
          Not really
        </button>
      </div>

      {rating === "down" ? (
        <div className="mt-3 space-y-2">
          <p
            className="text-[0.75rem]"
            style={{ color: "var(--foreground-muted)" }}
          >
            What felt off? (optional)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ANALYSIS_FEEDBACK_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
                style={{
                  background:
                    reason === r.value
                      ? "color-mix(in srgb, var(--violet) 14%, transparent)"
                      : "color-mix(in srgb, var(--foreground) 6%, transparent)",
                  color: "var(--foreground)",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Anything else? (optional)"
            className="w-full resize-none rounded-xl px-3 py-2 text-[0.8125rem] outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet)]"
            style={{
              background: "var(--background)",
              border: "1px solid var(--hairline)",
              color: "var(--foreground)",
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("down", reason)}
            className="haelo-btn rounded-full bg-[var(--violet)] px-4 py-1.5 text-[0.75rem] font-semibold text-[var(--on-violet)] disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-2 text-[0.75rem] text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
