"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { useSyncExternalStore } from "react";
import { DAILY_COMPLETED_KEY, DAILY_PROMPT } from "@/lib/home/universe";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function subscribeDailyCompleted(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === DAILY_COMPLETED_KEY || event.key === null) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function readDailyCompleted(): boolean {
  try {
    return localStorage.getItem(DAILY_COMPLETED_KEY) === todayKey();
  } catch {
    return false;
  }
}

export function DailyPromptCard() {
  const completed = useSyncExternalStore(
    subscribeDailyCompleted,
    readDailyCompleted,
    () => false,
  );

  return (
    <section
      className="mx-auto w-full rounded-xl border px-5 py-4 sm:px-6 sm:py-5"
      style={{
        background: "var(--lilac-soft)",
        borderColor: "color-mix(in srgb, var(--violet) 22%, transparent)",
        boxShadow: "var(--shadow-soft)",
      }}
      aria-labelledby="daily-prompt-heading"
    >
      {completed ? (
        <>
          <p
            id="daily-prompt-heading"
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Today&rsquo;s question
          </p>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Answered. A new one lands tomorrow.
          </p>
        </>
      ) : (
        <>
          <p
            id="daily-prompt-heading"
            className="text-[0.75rem] font-semibold"
            style={{ color: "var(--foreground-muted)" }}
          >
            Today&rsquo;s question
          </p>
          <p
            className="mt-3 font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
              color: "var(--foreground)",
            }}
          >
            {DAILY_PROMPT.text}
          </p>
          <TransitionLink
            href="/speak"
            variant="fade"
            className="mt-5 inline-flex rounded-full bg-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          >
            Answer
          </TransitionLink>
        </>
      )}
    </section>
  );
}
