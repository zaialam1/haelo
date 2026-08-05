import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNav } from "@/components/home/HomeNav";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { getVoicePlanetById } from "@/lib/home/voicePlanets";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import {
  getPlanetPageContent,
  getPlanetProgression,
} from "@/lib/planets/content";
import { PlanetHeroVisual } from "./PlanetHeroVisual";

type PlanetPageProps = {
  planetId: VoicePlanetId;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="text-[0.6875rem] font-semibold tracking-[0.16em] uppercase"
      style={{ color: "var(--violet)" }}
    >
      {children}
    </p>
  );
}

export function PlanetPage({ planetId }: PlanetPageProps) {
  const content = getPlanetPageContent(planetId);
  const planet = getVoicePlanetById(planetId);
  const progression = getPlanetProgression(planetId);
  const hasGrowth = content.growth.length > 0;
  const hasSessions = content.recentSessions.length > 0;

  if (!planet) {
    return null;
  }

  return (
    <div
      className="planet-page relative min-h-dvh"
      data-atmosphere={content.atmosphere}
      style={{ background: "var(--planet-page-bg, var(--universe-map))" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      />
      <div
        className="planet-page-haze pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <HomeNav pinned />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-16 sm:px-8 sm:pb-32 sm:pt-20 lg:px-10">
        <TransitionLink
          href="/home"
          variant="fade"
          className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full py-1.5 text-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:mb-8"
          style={{ color: "var(--foreground-muted)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Universe
        </TransitionLink>

        {/* Hero + practice — side by side on desktop */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 xl:gap-20">
          <header className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <PlanetHeroVisual planet={planet} progression={progression} />

            <h1
              className="mt-7 font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:mt-8 sm:text-4xl lg:mt-9 lg:text-5xl"
              style={{
                color: "var(--foreground)",
                fontVariationSettings: '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
              }}
            >
              {content.label}
            </h1>

            <p
              className="mt-3 max-w-md font-[family-name:var(--font-fraunces)] text-base leading-snug sm:text-lg lg:max-w-lg"
              style={{
                color: "var(--foreground)",
                fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
              }}
            >
              {content.shortLine}
            </p>

            <p
              className="mt-2.5 max-w-md text-sm leading-relaxed sm:text-[0.9375rem] lg:max-w-lg"
              style={{ color: "var(--foreground-muted)" }}
            >
              {content.description}
            </p>
          </header>

          <section
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
            aria-labelledby="try-this-heading"
          >
            <SectionLabel>Try this</SectionLabel>
            <h2 id="try-this-heading" className="sr-only">
              Featured practice for {content.label}
            </h2>
            <p
              className="mt-4 max-w-lg font-[family-name:var(--font-fraunces)] text-xl leading-snug sm:text-2xl lg:text-[1.65rem]"
              style={{
                color: "var(--foreground)",
                fontVariationSettings: '"opsz" 72, "SOFT" 35, "WONK" 0, "wght" 500',
              }}
            >
              &ldquo;{content.tryThis}&rdquo;
            </p>

            <TransitionLink
              href={content.sessionHref}
              variant="fade"
              accent={planet.color}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3 text-sm font-semibold tracking-wide transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] sm:mt-9 sm:text-base"
              style={{
                background: "var(--violet)",
                color: "var(--on-violet)",
                boxShadow: `0 8px 28px color-mix(in srgb, var(--violet) 28%, transparent)`,
              }}
            >
              {content.sessionCta}
            </TransitionLink>
          </section>
        </div>

        <div
          className="mx-auto my-12 h-px w-24 sm:my-14 lg:mx-0 lg:w-32"
          style={{
            background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${planet.color} 55%, transparent), transparent)`,
          }}
          aria-hidden="true"
        />

        {/* Growth + recent — two columns on desktop */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="growth-heading">
            <SectionLabel>Your growth</SectionLabel>
            <h2 id="growth-heading" className="sr-only">
              Growth observations for {content.label}
            </h2>
            {hasGrowth ? (
              <ul className="mt-5 flex max-w-md flex-col gap-4 lg:max-w-none">
                {content.growth.map((observation) => (
                  <li
                    key={observation}
                    className="text-sm leading-relaxed sm:text-[0.9375rem]"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {observation}
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="mt-5 max-w-md text-sm leading-relaxed sm:text-[0.9375rem] lg:max-w-none"
                style={{ color: "var(--foreground-muted)" }}
              >
                {content.growthEmpty}
              </p>
            )}
          </section>

          <section aria-labelledby="recent-heading">
            <SectionLabel>Recent sessions</SectionLabel>
            <h2 id="recent-heading" className="sr-only">
              Recent {content.label} sessions
            </h2>

            {hasSessions ? (
              <ul className="mt-5 w-full max-w-md lg:max-w-none">
                {content.recentSessions.map((session) => (
                  <li key={session.id}>
                    <TransitionLink
                      href={session.href}
                      variant="fade"
                      className="planet-session-row group flex items-baseline gap-4 rounded-xl px-3 py-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                    >
                      <time
                        className="shrink-0 text-xs font-medium tabular-nums tracking-wide"
                        style={{
                          color: "var(--foreground-muted)",
                          minWidth: "3.25rem",
                        }}
                      >
                        {session.dateLabel}
                      </time>
                      <span
                        className="text-left text-sm leading-snug transition-colors group-hover:text-[var(--violet)] sm:text-[0.9375rem]"
                        style={{ color: "var(--foreground)" }}
                      >
                        {session.title}
                      </span>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="mt-5 max-w-md text-sm leading-relaxed sm:text-[0.9375rem] lg:max-w-none"
                style={{ color: "var(--foreground-muted)" }}
              >
                {content.recentEmpty}
              </p>
            )}

            <TransitionLink
              href={content.journeyHref}
              variant="fade"
              className="mt-6 inline-flex text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{ color: "var(--violet)" }}
            >
              {content.journeyLabel}
            </TransitionLink>
          </section>
        </div>
      </main>

      <HomeBottomNav />
    </div>
  );
}
