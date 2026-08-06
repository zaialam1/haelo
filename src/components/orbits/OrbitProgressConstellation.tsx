"use client";

/**
 * Celestial progress along an Orbit path — accessible text always accompanies stars.
 */
export function OrbitProgressConstellation({
  current,
  total = 6,
  completedCount,
}: {
  current: number;
  total?: number;
  /** How many reflections are fully completed (canonical). */
  completedCount?: number;
}) {
  const safeCurrent = Math.min(total, Math.max(1, current));
  const done =
    completedCount ??
    Math.max(0, safeCurrent - 1);

  return (
    <div className="orbit-progress-constellation">
      <p
        className="text-[0.8125rem] font-medium"
        style={{ color: "var(--foreground)" }}
      >
        Reflection {safeCurrent} of {total}
      </p>
      <ol
        className="mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2"
        aria-hidden="true"
      >
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const isCompleted = n <= done;
          const isCurrent = n === safeCurrent && done < total;
          const isFuture = !isCompleted && !isCurrent;

          return (
            <li key={n} className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="inline-flex size-3 items-center justify-center text-[0.65rem] leading-none sm:size-3.5 sm:text-[0.7rem]"
                style={{
                  color: isCompleted
                    ? "var(--gold)"
                    : isCurrent
                      ? "var(--violet)"
                      : "color-mix(in srgb, var(--foreground-muted) 45%, transparent)",
                  textShadow: isCurrent
                    ? "0 0 10px color-mix(in srgb, var(--violet) 55%, transparent)"
                    : isCompleted
                      ? "0 0 8px color-mix(in srgb, var(--gold) 40%, transparent)"
                      : undefined,
                  opacity: isFuture ? 0.55 : 1,
                  transform: isCurrent ? "scale(1.15)" : undefined,
                }}
              >
                ✦
              </span>
              {n < total ? (
                <span
                  className="h-px w-2 sm:w-3"
                  style={{
                    background: isCompleted
                      ? "color-mix(in srgb, var(--gold) 55%, transparent)"
                      : "color-mix(in srgb, var(--foreground-muted) 28%, transparent)",
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
