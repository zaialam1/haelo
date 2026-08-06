import type { Planet } from "@/lib/prompts";
import { PLANET_COLOR, PLANET_LABEL } from "@/lib/orbits/ui";

type PlanetTagsProps = {
  planets: Planet[];
  /** Ordered sequence with arrows (preview detail). */
  sequenced?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function PlanetTags({
  planets,
  sequenced = false,
  size = "md",
  className = "",
}: PlanetTagsProps) {
  if (planets.length === 0) return null;

  const separator = sequenced ? "→" : "·";
  const dot = size === "sm" ? "size-1.5" : "size-2.5";
  const label =
    size === "sm"
      ? "text-[0.6875rem]"
      : "text-[0.8125rem] sm:text-[0.875rem]";
  const sepSize = size === "sm" ? "text-[0.625rem]" : "text-[0.75rem]";

  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 ${className}`}
      aria-label={
        sequenced
          ? `Planet path: ${planets.map((p) => PLANET_LABEL[p]).join(", then ")}`
          : `Planets involved: ${planets.map((p) => PLANET_LABEL[p]).join(", ")}`
      }
    >
      {planets.map((planet, index) => (
        <span key={`${planet}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span
              className={sepSize}
              style={{ color: "var(--foreground-muted)" }}
              aria-hidden="true"
            >
              {separator}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`${dot} rounded-full`}
              style={{
                background: PLANET_COLOR[planet],
                boxShadow: `0 0 8px color-mix(in srgb, ${PLANET_COLOR[planet]} 55%, transparent)`,
              }}
              aria-hidden="true"
            />
            <span
              className={`${label} font-medium tracking-wide`}
              style={{ color: "var(--foreground)" }}
            >
              {PLANET_LABEL[planet]}
            </span>
          </span>
        </span>
      ))}
    </p>
  );
}
