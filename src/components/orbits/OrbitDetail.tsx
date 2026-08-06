import { TransitionLink } from "@/components/transitions/TransitionLink";
import { OrbitCelestialMark } from "@/components/orbits/OrbitCelestialMark";
import { PlanetTags } from "@/components/orbits/PlanetTags";
import { beginOrbitAction } from "@/lib/orbits/actions";
import {
  deriveOrbitHelpPoints,
  formatOrbitMeta,
  orbitCtaLabel,
} from "@/lib/orbits/ui";
import type { OrbitDefinition, UserOrbitProgressRow } from "@/lib/orbits/types";
import type { Planet } from "@/lib/prompts";

export function OrbitDetail({
  orbit,
  regionTitle,
  planetSequence,
  planetsInvolved,
  progress,
  signedIn,
}: {
  orbit: OrbitDefinition;
  regionTitle: string;
  durationLabel: string;
  planetSequence: Planet[];
  planetsInvolved: Planet[];
  progress: UserOrbitProgressRow | null;
  signedIn: boolean;
}) {
  const status = progress?.status ?? "not_started";
  const cta = orbitCtaLabel(status);
  const helpPoints = deriveOrbitHelpPoints(orbit);
  const loginHref = `/login?next=${encodeURIComponent(`/orbits/${orbit.orbitKey}`)}`;

  return (
    <article>
      <TransitionLink
        href="/orbits"
        variant="fade"
        className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        style={{ color: "var(--violet)" }}
      >
        <span aria-hidden="true">←</span>
        {regionTitle}
      </TransitionLink>

      <header className="mt-6 flex gap-5 sm:gap-6">
        <OrbitCelestialMark
          orbitKey={orbit.orbitKey}
          regionKey={orbit.regionKey}
          status={status}
          size="lg"
          className="mt-1"
        />
        <div className="min-w-0">
          <p
            className="text-[0.75rem] font-medium uppercase tracking-[0.14em]"
            style={{ color: "var(--foreground-muted)" }}
          >
            Orbit · {regionTitle}
          </p>
          <h1
            className="mt-1.5 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight sm:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            {orbit.title}
          </h1>
          <p
            className="mt-2 max-w-2xl text-base leading-relaxed sm:text-[1.0625rem]"
            style={{ color: "var(--foreground-muted)" }}
          >
            {orbit.shortDescription}
          </p>
          {status === "completed" ? (
            <p
              className="mt-2 text-[0.6875rem] font-medium uppercase tracking-[0.12em]"
              style={{
                color:
                  "color-mix(in srgb, var(--gold) 85%, var(--foreground-muted))",
              }}
            >
              Completed
            </p>
          ) : null}
          {status === "in_progress" && progress ? (
            <p
              className="mt-2 text-[0.8125rem] font-medium"
              style={{ color: "var(--violet)" }}
            >
              {Math.min(6, Math.max(1, progress.current_question_index))} of 6
              reflections
            </p>
          ) : null}
        </div>
      </header>

      <div
        className="mt-8 space-y-4 whitespace-pre-line text-[0.9375rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {orbit.openingBody}
      </div>

      {helpPoints.length > 0 ? (
        <section className="mt-10" aria-labelledby="orbit-helps-heading">
          <h2
            id="orbit-helps-heading"
            className="text-[0.8125rem] font-semibold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            What this Orbit helps you do
          </h2>
          <ul className="mt-3 space-y-2.5">
            {helpPoints.map((point) => (
              <li key={point} className="flex gap-2.5">
                <span
                  className="mt-2 size-1 shrink-0 rounded-full"
                  style={{
                    background: "var(--violet)",
                    boxShadow:
                      "0 0 8px color-mix(in srgb, var(--violet) 40%, transparent)",
                  }}
                  aria-hidden="true"
                />
                <span
                  className="text-[0.875rem] leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="orbit-planets-heading">
        <h2
          id="orbit-planets-heading"
          className="text-[0.8125rem] font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Planets involved
        </h2>
        <PlanetTags
          planets={planetSequence}
          sequenced
          className="mt-3"
        />
        <p className="sr-only">
          Unique planets:{" "}
          {planetsInvolved.map((p) => p).join(", ")}
        </p>
      </section>

      <p
        className="mt-6 text-[0.8125rem]"
        style={{ color: "var(--foreground-muted)" }}
      >
        {formatOrbitMeta(orbit)}
      </p>

      <div className="mt-8">
        {signedIn ? (
          <form action={beginOrbitAction}>
            <input type="hidden" name="orbitKey" value={orbit.orbitKey} />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-full px-6 py-3 text-[0.875rem] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                background: "var(--violet)",
                color: "var(--on-violet)",
              }}
            >
              {cta}
            </button>
          </form>
        ) : (
          <TransitionLink
            href={loginHref}
            variant="fade"
            className="inline-flex min-h-11 items-center rounded-full px-6 py-3 text-[0.875rem] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background: "var(--violet)",
              color: "var(--on-violet)",
            }}
          >
            Sign in to begin
          </TransitionLink>
        )}
      </div>

      {status === "completed" ? (
        <p
          className="mt-4 max-w-md text-[0.8125rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          You&apos;ve completed this Orbit. Revisit to see what came into focus
          across your six reflections.
        </p>
      ) : null}

      {status === "in_progress" ? (
        <p
          className="mt-4 max-w-md text-[0.8125rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Continue when you&apos;re ready — one reflection at a time.
        </p>
      ) : null}
    </article>
  );
}
