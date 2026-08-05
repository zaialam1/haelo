"use client";

import type { GrowthArc } from "@/lib/topics/types";

type GrowthArcsProps = {
  planetLabel: string;
  arcs: GrowthArc[];
  isEmpty: boolean;
};

export function GrowthArcs({ planetLabel, arcs, isEmpty }: GrowthArcsProps) {
  return (
    <section className="relative z-10 px-5 sm:px-8">
      <h2
        className="font-[family-name:var(--font-fraunces)] text-lg sm:text-xl"
        style={{
          fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
          color: "var(--foreground)",
        }}
      >
        Your growth in {planetLabel}
      </h2>

      <ul className="mt-4 space-y-5">
        {arcs.map((arc) => (
          <li key={arc.id}>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {arc.label}
            </p>
            <div className="mt-2.5">
              <svg
                viewBox="0 0 320 28"
                className="h-7 w-full max-w-md"
                aria-hidden="true"
              >
                <line
                  x1="8"
                  y1="14"
                  x2="312"
                  y2="14"
                  stroke="var(--hairline)"
                  strokeWidth="1.5"
                />
                {arc.points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={
                      isEmpty || arc.id === "placeholder"
                        ? "color-mix(in srgb, var(--violet) 30%, transparent)"
                        : "color-mix(in srgb, var(--gold) 70%, var(--violet))"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    points={arc.points
                      .map((p) => `${8 + p * 304},14`)
                      .join(" ")}
                    opacity={0.7}
                  />
                )}
                {arc.points.map((p, i) => {
                  const x = 8 + p * 304;
                  const isLast = i === arc.points.length - 1;
                  return (
                    <circle
                      key={`${arc.id}-${i}`}
                      cx={x}
                      cy={14}
                      r={isLast ? 5 : 3.5}
                      fill={
                        isEmpty || arc.id === "placeholder"
                          ? "color-mix(in srgb, var(--violet) 35%, transparent)"
                          : "var(--gold)"
                      }
                      opacity={isEmpty || arc.id === "placeholder" ? 0.55 : 1}
                    />
                  );
                })}
              </svg>
              <div
                className="mt-1 flex max-w-md justify-between text-[0.6875rem]"
                style={{ color: "var(--foreground-muted)" }}
              >
                <span>{arc.startLabel}</span>
                <span>{arc.endLabel}</span>
              </div>
            </div>
            {arc.summary && (
              <p
                className="mt-2 max-w-lg text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                {arc.summary}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
