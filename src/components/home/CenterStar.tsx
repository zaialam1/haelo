type CenterStarProps = {
  /** When nested inside a positioned parent, skip absolute centering */
  nested?: boolean;
};

export function CenterStar({ nested = false }: CenterStarProps) {
  return (
    <div
      className={
        nested
          ? "pointer-events-none relative z-10 overflow-visible"
          : "pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
      }
      aria-hidden="true"
    >
      {/* Clip glow so it cannot cover the CTA / subtitle below */}
      <div className="relative flex size-32 items-center justify-center overflow-hidden rounded-full sm:size-40">
          <div className="relative flex size-28 items-center justify-center sm:size-32">
          <div
            className="absolute inset-[-6%] rounded-full motion-safe:animate-[star-wave_4.5s_ease-in-out_infinite]"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--gold) 55%, transparent), transparent 72%)",
            }}
          />
          <div
            className="absolute inset-[-14%] rounded-full motion-safe:animate-[star-wave_5.2s_ease-in-out_infinite]"
            style={{
              animationDelay: "1.4s",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--rose) 34%, transparent), transparent 70%)",
            }}
          />
          <svg
            className="relative z-10 size-20 motion-safe:animate-[star-pulse_3.6s_ease-in-out_infinite] sm:size-24"
            viewBox="0 0 64 64"
            fill="none"
          >
            <defs>
              <radialGradient id="haelo-star-core" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#FFF8F0" />
                <stop offset="45%" stopColor="#F6D365" />
                <stop offset="100%" stopColor="#E8A0BF" />
              </radialGradient>
            </defs>
            <path
              d="M32 4 L38.5 24.5 L60 26 L43 39 L48.5 60 L32 48 L15.5 60 L21 39 L4 26 L25.5 24.5 Z"
              fill="url(#haelo-star-core)"
              stroke="color-mix(in srgb, #FFF8F0 70%, transparent)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
