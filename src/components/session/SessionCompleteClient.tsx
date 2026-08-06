"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { getPlanetPageContent } from "@/lib/planets/content";
import type { Planet } from "@/lib/prompts";

type SessionCompleteClientProps = {
  planet: Planet;
  alreadyInJourney: boolean;
};

export function SessionCompleteClient({
  planet,
  alreadyInJourney,
}: SessionCompleteClientProps) {
  const content = getPlanetPageContent(planet);
  const accent = getVoicePlanetById(planet)?.color ?? "var(--violet)";

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: accent }}
      >
        {content.label}
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
        }}
      >
        Session complete
      </h1>
      <p
        className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {alreadyInJourney
          ? "This practice is saved privately and is part of your Journey."
          : "Your recording is saved. When this session is marked complete, it will appear as a star in Journey."}
      </p>

      <div
        className="mt-10 flex items-center gap-3"
        aria-hidden="true"
      >
        <span
          className="inline-block size-4 rounded-full"
          style={{
            background: accent,
            boxShadow: `0 0 18px color-mix(in srgb, ${accent} 55%, transparent)`,
          }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: "var(--foreground-muted)" }}
        >
          One session · one Journey star
        </span>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <TransitionLink
          href={`/${planet}`}
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Back to {content.label}
        </TransitionLink>
        <TransitionLink
          href={`/journey?planet=${planet}`}
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
    </div>
  );
}
