import { INITIAL_STREAK_DAYS } from "@/lib/home/universe";

const STAR_POSITIONS = [
  { left: "8%", top: "18%" },
  { left: "14%", top: "12%" },
  { left: "20%", top: "20%" },
  { left: "11%", top: "28%" },
  { left: "22%", top: "30%" },
  { left: "17%", top: "38%" },
  { left: "6%", top: "36%" },
];

export function StreakConstellation() {
  const lit = Math.min(INITIAL_STREAK_DAYS, STAR_POSITIONS.length);

  return (
    <div
      className="pointer-events-none absolute top-[4.75rem] left-3 z-20 sm:top-[5.25rem] sm:left-5"
      aria-label={`${INITIAL_STREAK_DAYS}-day streak`}
    >
      <p
        className="mb-2 text-[0.625rem] font-semibold tracking-[0.12em] uppercase"
        style={{ color: "var(--foreground-muted)" }}
      >
        Streak
      </p>
      <div className="relative h-16 w-20 sm:h-20 sm:w-24">
        {/* faint constellation lines */}
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path
            d="M20 30 L35 18 L50 32 L28 48 L42 58 L18 62"
            fill="none"
            stroke="color-mix(in srgb, var(--gold) 35%, transparent)"
            strokeWidth="1"
          />
        </svg>
        {STAR_POSITIONS.map((pos, i) => {
          const active = i < lit;
          return (
            <span
              key={i}
              className="absolute size-1.5 rounded-full sm:size-2"
              style={{
                left: pos.left,
                top: pos.top,
                background: active ? "var(--gold)" : "color-mix(in srgb, var(--foreground-muted) 35%, transparent)",
                boxShadow: active
                  ? "0 0 8px color-mix(in srgb, var(--gold) 70%, transparent)"
                  : undefined,
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}
