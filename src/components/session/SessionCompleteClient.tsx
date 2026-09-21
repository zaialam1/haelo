"use client";

import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ShareAchievementButton } from "@/components/session/ShareAchievementButton";
import { StardustChip } from "@/components/cosmetics/StardustChip";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import { getPlanetPageContent } from "@/lib/planets/content";
import type { Planet } from "@/lib/prompts";

type SessionCompleteClientProps = {
  planet: Planet;
  alreadyInJourney: boolean;
  promptText?: string | null;
  stardustEarned?: number;
  stardustBalance?: number;
};

export function SessionCompleteClient({
  planet,
  alreadyInJourney,
  promptText,
  stardustEarned = 0,
  stardustBalance = 0,
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

      {stardustEarned > 0 ? (
        <div
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "color-mix(in srgb, var(--gold) 18%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--gold) 40%, transparent)",
          }}
        >
          <p className="text-sm font-semibold">
            +{stardustEarned} Stardust earned
          </p>
          <StardustChip balance={stardustBalance} compact />
          <TransitionLink
            href="/store"
            variant="fade"
            className="text-sm font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--violet)" }}
          >
            Visit store
          </TransitionLink>
        </div>
      ) : null}

      <div className="mt-10 flex items-center gap-3" aria-hidden="true">
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

      <ShareAchievementButton
        className="mt-10"
        achievementLabel={content.label}
        promptText={promptText}
      />

      <div className="mt-8 flex flex-wrap gap-3">
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
