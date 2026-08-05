"use client";

import type { JourneyPlanetFilter } from "@/lib/journey/types";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";

const FILTERS: Array<{ id: JourneyPlanetFilter; label: string }> = [
  { id: "all", label: "All" },
  ...VOICE_PLANETS.map((p) => ({ id: p.id as JourneyPlanetFilter, label: p.label })),
];

type JourneyPlanetFilterProps = {
  value: JourneyPlanetFilter;
  onChange: (next: JourneyPlanetFilter) => void;
  disabled?: boolean;
};

export function JourneyPlanetFilterBar({
  value,
  onChange,
  disabled = false,
}: JourneyPlanetFilterProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-1"
      role="group"
      aria-label="Filter journey by planet"
    >
      {FILTERS.map((f) => {
        const active = value === f.id;
        const planet = VOICE_PLANETS.find((p) => p.id === f.id);
        return (
          <button
            key={f.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(f.id)}
            aria-pressed={active}
            className="rounded-full px-3 py-1.5 text-[0.75rem] font-medium tracking-wide transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] disabled:opacity-50"
            style={{
              color: active ? "var(--foreground)" : "var(--foreground-muted)",
              background: active
                ? planet
                  ? `color-mix(in srgb, ${planet.color} 22%, transparent)`
                  : "color-mix(in srgb, var(--violet) 14%, transparent)"
                : "transparent",
              border: active
                ? `1px solid color-mix(in srgb, ${planet?.color ?? "var(--violet)"} 40%, transparent)`
                : "1px solid transparent",
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
