"use client";

import type { TimelineViewMode } from "@/lib/topics/types";

const MODES: { id: TimelineViewMode; label: string }[] = [
  { id: "all", label: "All reflections" },
  { id: "confidence", label: "Confidence" },
  { id: "topics", label: "Topics" },
  { id: "growth", label: "Growth" },
];

type ViewFilterProps = {
  value: TimelineViewMode;
  onChange: (mode: TimelineViewMode) => void;
  disabled?: boolean;
};

export function ViewFilter({ value, onChange, disabled }: ViewFilterProps) {
  return (
    <div className="relative z-10 px-5 sm:px-8">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
        style={{ color: "var(--foreground-muted)" }}
      >
        View by
      </p>
      <div
        className="mt-2 flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Timeline view"
      >
        {MODES.map((mode) => {
          const selected = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={disabled}
              onClick={() => onChange(mode.id)}
              className="planet-filter-pill rounded-full px-3.5 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)] disabled:cursor-not-allowed disabled:opacity-45"
              style={
                selected
                  ? {
                      background: "var(--violet)",
                      color: "var(--on-violet)",
                    }
                  : {
                      background:
                        "color-mix(in srgb, var(--violet) 10%, transparent)",
                      color: "var(--foreground)",
                    }
              }
            >
              {mode.label}
            </button>
          );
        })}
      </div>
      {disabled && (
        <p
          className="mt-2 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Filters unlock after your first reflection.
        </p>
      )}
    </div>
  );
}
