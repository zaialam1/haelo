"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useEffect, useState } from "react";
import { DAILY_COMPLETED_KEY, DAILY_PROMPT } from "@/lib/home/universe";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function DailyPromptCard() {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    try {
      setCompleted(localStorage.getItem(DAILY_COMPLETED_KEY) === todayKey());
    } catch {
      setCompleted(false);
    }
  }, []);

  return (
    <section
      className="mx-auto w-full rounded-2xl border px-5 py-4 backdrop-blur-md sm:px-6 sm:py-5"
      style={{
        background: "color-mix(in srgb, var(--surface) 78%, transparent)",
        borderColor: "color-mix(in srgb, var(--rose) 35%, transparent)",
        boxShadow: "var(--shadow-soft)",
      }}
      aria-labelledby="daily-prompt-heading"
    >
      {completed ? (
        <>
          <p
            id="daily-prompt-heading"
            className="text-sm font-semibold"
            style={{ color: "var(--violet)" }}
          >
            Today&rsquo;s recording completed!
          </p>
          <p
            className="mt-2 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Nice work!
          </p>
        </>
      ) : (
        <>
          <p
            id="daily-prompt-heading"
            className="text-[0.6875rem] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            <span aria-hidden="true" className="mr-1">
              ✦
            </span>
            Daily Prompt
          </p>
          <p
            className="mt-3 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
            }}
          >
            &ldquo;{DAILY_PROMPT.text}&rdquo;
          </p>
          <TransitionLink
            href="/speak"
            variant="fade"
            className="mt-5 inline-flex rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Start Session
          </TransitionLink>
        </>
      )}
    </section>
  );
}
