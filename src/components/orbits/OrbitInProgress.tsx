import { TransitionLink } from "@/components/transitions/TransitionLink";
import { OrbitCelestialMark } from "@/components/orbits/OrbitCelestialMark";
import { PlanetTags } from "@/components/orbits/PlanetTags";
import { orbitProgressLabel } from "@/lib/orbits/ui";
import type { OrbitListItem } from "@/lib/orbits/types";

type OrbitInProgressProps = {
  items: OrbitListItem[];
};

/**
 * Quiet resume area — only rendered when the user has unfinished Orbits.
 * Lives outside the star map so it doesn't interrupt exploration.
 */
export function OrbitInProgress({ items }: OrbitInProgressProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="relative mt-2 border-t pt-8"
      style={{ borderColor: "color-mix(in srgb, var(--violet) 14%, transparent)" }}
      aria-labelledby="orbit-in-progress-heading"
    >
      <div className="mb-5 max-w-md">
        <h2
          id="orbit-in-progress-heading"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Continue your Orbits
        </h2>
        <p
          className="mt-1 text-[0.8125rem] leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Pick up where you left off.
        </p>
      </div>

      <ul className="space-y-3" role="list">
        {items.map((item) => {
          const orbit = item.definition;
          const progress = orbitProgressLabel(item) ?? "In progress";

          return (
            <li key={orbit.orbitKey}>
              <TransitionLink
                href={`/orbits/${orbit.orbitKey}`}
                variant="fade"
                className="group flex items-center gap-3.5 rounded-2xl px-2 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] sm:gap-4 sm:px-3"
                style={{
                  background:
                    "color-mix(in srgb, var(--violet) 6%, transparent)",
                }}
                aria-label={`Continue ${orbit.title}. ${progress}`}
              >
                <OrbitCelestialMark
                  orbitKey={orbit.orbitKey}
                  regionKey={orbit.regionKey}
                  status="in_progress"
                  size="sm"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className="block font-[family-name:var(--font-display)] text-[0.9375rem] font-semibold tracking-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    {orbit.title}
                  </span>
                  <span
                    className="mt-0.5 block truncate text-[0.75rem]"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {orbit.shortDescription}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span
                      className="text-[0.6875rem] font-medium"
                      style={{ color: "var(--violet)" }}
                    >
                      {progress}
                    </span>
                    <PlanetTags planets={item.planetsInvolved} />
                  </span>
                </span>
                <span
                  className="shrink-0 text-[0.75rem] font-semibold"
                  style={{ color: "var(--violet)" }}
                >
                  Continue
                </span>
              </TransitionLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
