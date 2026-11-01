"use client";

import { useEffect, useRef } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { getPlanetPageContent } from "@/lib/planets/content";
import type { Planet } from "@/lib/prompts";

type GuestCompleteClientProps = {
  planet: Planet;
};

export function GuestCompleteClient({ planet }: GuestCompleteClientProps) {
  const content = getPlanetPageContent(planet);
  const accent = getVoicePlanetById(planet)?.color ?? "var(--violet)";
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    // Completions are primarily tracked in SessionReviewClient; this is a
    // safety net if the user lands here via a deep link after finish.
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center px-1">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: accent }}
      >
        Guest try · {content.label}
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        Nice work
      </h1>
      <p
        className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        This guest practice stays temporary — it isn’t saved to a permanent
        account, and it doesn’t earn Stardust. Create an account anytime if you
        want a private Universe of your own.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:max-w-sm">
        <TransitionLink
          href="/try"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--on-violet)] shadow-[0_10px_28px_color-mix(in_srgb,var(--violet)_30%,transparent)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Try another question
        </TransitionLink>
        <TransitionLink
          href="/signup"
          variant="fade"
          className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Create a free account
        </TransitionLink>
        <TransitionLink
          href="/"
          variant="fade"
          className="inline-flex min-h-11 items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
          style={{ color: "var(--foreground-muted)" }}
        >
          Leave
        </TransitionLink>
      </div>
    </div>
  );
}
