import { TransitionLink } from "@/components/transitions/TransitionLink";
import { formatOrbitDuration } from "@/lib/orbits/catalog";
import type { OrbitListItem, OrbitRegionDefinition } from "@/lib/orbits/types";
import type { OrbitRegionKey } from "@/lib/orbits/types";

const PLANET_LABEL: Record<string, string> = {
  express: "Express",
  stand: "Stand",
  connect: "Connect",
  explore: "Explore",
};

function statusLabel(item: OrbitListItem): string {
  const status = item.progress?.status;
  if (status === "completed") return "Completed";
  if (status === "in_progress") {
    const q = item.progress?.current_question_index ?? 1;
    return `Continue · Q${q} of 6`;
  }
  return "Begin";
}

function ctaLabel(item: OrbitListItem): string {
  const status = item.progress?.status;
  if (status === "completed") return "View";
  if (status === "in_progress") return "Continue Orbit";
  return "Begin Orbit";
}

export function OrbitsBrowse({
  regions,
  items,
  activeRegion,
}: {
  regions: OrbitRegionDefinition[];
  items: OrbitListItem[];
  activeRegion: OrbitRegionKey | null;
}) {
  const grouped = regions.map((region) => ({
    region,
    orbits: items
      .filter((i) => i.definition.regionKey === region.key)
      .sort(
        (a, b) =>
          a.definition.sortOrder - b.definition.sortOrder,
      ),
  }));

  const visible = activeRegion
    ? grouped.filter((g) => g.region.key === activeRegion)
    : grouped;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-2">
        <TransitionLink
          href="/orbits"
          variant="fade"
          className="rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors"
          style={{
            background: !activeRegion
              ? "color-mix(in srgb, var(--violet) 18%, transparent)"
              : "transparent",
            color: !activeRegion ? "var(--violet)" : "var(--foreground-muted)",
            border: "1px solid color-mix(in srgb, var(--violet) 25%, transparent)",
          }}
        >
          All regions
        </TransitionLink>
        {regions.map((region) => {
          const active = activeRegion === region.key;
          return (
            <TransitionLink
              key={region.key}
              href={`/orbits?region=${region.key}`}
              variant="fade"
              className="rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors"
              style={{
                background: active
                  ? "color-mix(in srgb, var(--violet) 18%, transparent)"
                  : "transparent",
                color: active ? "var(--violet)" : "var(--foreground-muted)",
                border:
                  "1px solid color-mix(in srgb, var(--violet) 25%, transparent)",
              }}
            >
              {region.title}
            </TransitionLink>
          );
        })}
      </div>

      {visible.map(({ region, orbits }) => (
        <section key={region.key} className="space-y-4">
          <div>
            <h2
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              {region.title}
            </h2>
            <p
              className="mt-1 text-[0.8125rem] leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              {region.description}
            </p>
          </div>

          <ul className="space-y-3">
            {orbits.map((item) => {
              const orbit = item.definition;
              const planets = item.planetsInvolved
                .map((p) => PLANET_LABEL[p] ?? p)
                .join(" · ");
              return (
                <li key={orbit.orbitKey}>
                  <TransitionLink
                    href={`/orbits/${orbit.orbitKey}`}
                    variant="fade"
                    className="block rounded-2xl px-4 py-4 transition-colors sm:px-5"
                    style={{
                      background:
                        "color-mix(in srgb, var(--foreground) 4%, transparent)",
                      border:
                        "1px solid color-mix(in srgb, var(--violet) 16%, transparent)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3
                          className="text-[1.0625rem] font-semibold tracking-tight"
                          style={{ color: "var(--foreground)" }}
                        >
                          {orbit.title}
                        </h3>
                        <p
                          className="mt-1 text-[0.8125rem] leading-relaxed"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {orbit.shortDescription}
                        </p>
                        <p
                          className="mt-2 text-[0.6875rem]"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {formatOrbitDuration(orbit)} · {planets}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className="block text-[0.6875rem] font-medium"
                          style={{ color: "var(--violet)" }}
                        >
                          {statusLabel(item)}
                        </span>
                        <span
                          className="mt-2 inline-block text-[0.75rem] font-semibold"
                          style={{ color: "var(--gold, var(--violet))" }}
                        >
                          {ctaLabel(item)}
                        </span>
                      </div>
                    </div>
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
