import { HomeBottomNav } from "@/components/home/HomeBottomNav";
import { HomeNav } from "@/components/home/HomeNav";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";

type UniverseEmptyPageProps = {
  title: string;
  description: string;
  /** Optional secondary hint under the description */
  hint?: string;
  /** Show planet shortcuts to start practicing */
  showPlanetLinks?: boolean;
};

/**
 * Warm empty state for Journey / My Voice / similar surfaces.
 * Not a "coming soon" wall — invites practice for new users.
 */
export function UniverseEmptyPage({
  title,
  description,
  hint,
  showPlanetLinks = true,
}: UniverseEmptyPageProps) {
  return (
    <div
      className="universe-empty-page relative min-h-dvh"
      style={{ background: "var(--universe-map)" }}
    >
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      />
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <HomeNav pinned />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-5 pb-28 pt-24 sm:px-8 sm:pt-28">
        <TransitionLink
          href="/home"
          variant="fade"
          className="mb-10 inline-flex w-fit items-center gap-1.5 text-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
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

        <h1
          className="font-[family-name:var(--font-fraunces)] text-3xl tracking-tight sm:text-4xl"
          style={{
            color: "var(--foreground)",
            fontVariationSettings: '"opsz" 72, "SOFT" 45, "WONK" 0, "wght" 550',
          }}
        >
          {title}
        </h1>

        <p
          className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
          style={{ color: "var(--foreground-muted)" }}
        >
          {description}
        </p>

        {hint ? (
          <p
            className="mt-3 max-w-lg text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {hint}
          </p>
        ) : null}

        {showPlanetLinks ? (
          <div className="mt-10">
            <p
              className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
              style={{ color: "var(--violet)" }}
            >
              Start practicing
            </p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {VOICE_PLANETS.map((planet) => (
                <li key={planet.id}>
                  <TransitionLink
                    href={planet.href}
                    variant="warp"
                    accent={planet.color}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                    style={{
                      background: `color-mix(in srgb, ${planet.color} 22%, var(--surface))`,
                      color: "var(--foreground)",
                      border: `1px solid color-mix(in srgb, ${planet.color} 35%, transparent)`,
                    }}
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{
                        background: planet.color,
                        boxShadow: `0 0 8px color-mix(in srgb, ${planet.color} 50%, transparent)`,
                      }}
                      aria-hidden="true"
                    />
                    {planet.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>

      <HomeBottomNav />
    </div>
  );
}
