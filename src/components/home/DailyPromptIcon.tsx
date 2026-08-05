"use client";

import { useEffect, useId, useState } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import {
  formatDisplayDate,
  getDailyQuestionForDate,
} from "@/lib/questions/bank";
import { getTopicById, DAILY_COMPLETED_KEY } from "@/lib/home/universe";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function DailyPromptIcon() {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(false);
  const titleId = useId();
  const question = getDailyQuestionForDate();
  const topic =
    getTopicById(question.topicId) ?? getVoicePlanetById(question.topicId);

  useEffect(() => {
    try {
      setCompleted(localStorage.getItem(DAILY_COMPLETED_KEY) === todayKey());
    } catch {
      setCompleted(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="pointer-events-auto absolute top-[4.75rem] left-3 z-30 sm:top-[5.25rem] sm:left-5">
        {/* Spacer matching streak block so icon sits beneath it */}
        <div className="mb-2 h-[1.125rem]" aria-hidden="true" />
        <div className="h-16 w-20 sm:h-20 sm:w-24" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 flex w-20 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:w-24"
          aria-label={
            completed
              ? "Daily question completed — view details"
              : "Open today’s daily question"
          }
        >
          <span
            className="flex size-9 items-center justify-center rounded-full sm:size-10"
            style={{
              background: completed
                ? "color-mix(in srgb, var(--gold) 35%, var(--surface))"
                : "color-mix(in srgb, var(--rose) 40%, var(--surface))",
              border: "1px solid color-mix(in srgb, var(--violet) 25%, transparent)",
              boxShadow: "var(--shadow-soft)",
              color: "var(--violet)",
            }}
            aria-hidden="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>
          <span
            className="text-[0.625rem] font-semibold tracking-[0.1em] uppercase"
            style={{ color: "var(--foreground-muted)" }}
          >
            Daily
          </span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close daily prompt"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] w-full max-w-md rounded-3xl px-6 py-6 sm:mb-0 sm:px-7 sm:py-7"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-border)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id={titleId}
                  className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
                  style={{ color: "var(--violet)" }}
                >
                  Daily prompt
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {formatDisplayDate()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2.5 py-1 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{ color: "var(--foreground-muted)" }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {topic && (
              <p
                className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: `color-mix(in srgb, ${topic.color} 28%, var(--surface))`,
                  color: "var(--foreground)",
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: topic.color }}
                  aria-hidden="true"
                />
                {topic.label}
              </p>
            )}

            <p
              className="mt-4 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
              style={{
                fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
                color: "var(--foreground)",
              }}
            >
              &ldquo;{question.text}&rdquo;
            </p>

            {completed ? (
              <p
                className="mt-6 text-sm font-medium"
                style={{ color: "var(--violet)" }}
              >
                You already recorded today&rsquo;s daily. Come back tomorrow for
                a new question.
              </p>
            ) : (
              <TransitionLink
                href="/speak?mode=daily"
                variant="fade"
                className="mt-6 inline-flex rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                onClick={() => setOpen(false)}
              >
                Start
              </TransitionLink>
            )}
          </div>
        </div>
      )}
    </>
  );
}
