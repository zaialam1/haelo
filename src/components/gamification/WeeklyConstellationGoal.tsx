"use client";

import { WEEKLY_VOICE_GOAL } from "@/lib/gamification/config";
import type { WeeklyVoiceProgress } from "@/lib/gamification/types";

type WeeklyConstellationGoalProps = {
  progress: WeeklyVoiceProgress | null;
  /** Hide until the user has enough practice (progressive reveal). */
  visible?: boolean;
  compact?: boolean;
  className?: string;
};

/**
 * Tiny weekly constellation — stars connect as voice moments complete.
 * Not a productivity progress bar.
 */
export function WeeklyConstellationGoal({
  progress,
  visible = true,
  compact = false,
  className = "",
}: WeeklyConstellationGoalProps) {
  if (!visible) return null;

  const goal = progress?.goalCount ?? WEEKLY_VOICE_GOAL;
  const count = Math.min(progress?.completedCount ?? 0, goal);
  const complete = Boolean(progress?.completedAt) || count >= goal;

  const label = complete
    ? "Weekly constellation complete"
    : `Weekly voice goal: ${count} of ${goal} moments`;

  return (
    <div
      className={`weekly-constellation ${className}`}
      role="status"
      aria-label={label}
    >
      {!compact ? (
        <p
          className="mb-2 text-[0.625rem] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--foreground-muted)" }}
        >
          This week
        </p>
      ) : null}

      <svg
        viewBox="0 0 120 36"
        className={compact ? "h-7 w-24" : "h-9 w-32"}
        aria-hidden="true"
      >
        {/* Connecting lines */}
        {[0, 1].map((i) => {
          const lit = count > i + 1 || (complete && count >= goal);
          const x1 = 18 + i * 42;
          const x2 = x1 + 42;
          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={18}
              x2={x2}
              y2={18}
              stroke={
                lit
                  ? "color-mix(in srgb, var(--gold) 75%, white)"
                  : "color-mix(in srgb, var(--foreground-muted) 28%, transparent)"
              }
              strokeWidth={lit ? 1.4 : 1}
              strokeLinecap="round"
              className={
                lit
                  ? "motion-safe:animate-[weekly-line-glow_1.2s_ease-out]"
                  : undefined
              }
            />
          );
        })}

        {/* Stars */}
        {Array.from({ length: goal }, (_, i) => {
          const lit = i < count;
          const cx = 18 + i * 42;
          return (
            <g key={`star-${i}`}>
              <circle
                cx={cx}
                cy={18}
                r={lit ? 4.2 : 3.2}
                fill={
                  lit
                    ? "var(--gold)"
                    : "color-mix(in srgb, var(--foreground-muted) 35%, transparent)"
                }
                className={
                  lit
                    ? "motion-safe:animate-[weekly-star-ignite_0.8s_ease-out]"
                    : undefined
                }
              />
              {lit ? (
                <circle
                  cx={cx}
                  cy={18}
                  r={8}
                  fill="color-mix(in srgb, var(--gold) 22%, transparent)"
                  className="motion-reduce:hidden"
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {!compact ? (
        <p
          className="mt-1.5 max-w-[11rem] text-[0.6875rem] leading-snug"
          style={{ color: "var(--foreground-muted)" }}
        >
          {complete
            ? "Your weekly constellation is complete."
            : count === 0
              ? "Three voice moments this week."
              : `${goal - count} more to complete the constellation.`}
        </p>
      ) : null}
    </div>
  );
}
