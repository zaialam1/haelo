"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { TODAYS_QUESTION } from "@/lib/home/voicePlanets";

export function TodaysQuestion() {
  return (
    <div className="todays-question pointer-events-auto mx-auto flex max-w-[18rem] flex-col items-center gap-2 px-3 text-center sm:max-w-[22rem]">
      <p
        className="text-[0.625rem] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--violet)" }}
      >
        Today&apos;s Question
      </p>
      <p
        className="font-[family-name:var(--font-fraunces)] text-sm leading-snug tracking-tight sm:text-[0.9375rem]"
        style={{
          color: "var(--foreground)",
          fontVariationSettings: '"opsz" 72, "SOFT" 35, "WONK" 0, "wght" 500',
        }}
      >
        {TODAYS_QUESTION.text}
      </p>
      <TransitionLink
        href="/practice?from=today"
        variant="fade"
        className="mt-0.5 text-xs font-medium transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:text-[0.8125rem]"
        style={{ color: "var(--violet)" }}
      >
        Answer in 60 seconds →
      </TransitionLink>
    </div>
  );
}
