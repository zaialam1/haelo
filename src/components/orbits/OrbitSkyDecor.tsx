/**
 * Decorative constellations and star dust for the Orbits sky.
 * Non-interactive — sits behind region hubs and Orbit nodes.
 */
export function OrbitSkyDecor({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <div
      className="orbits-sky-decor pointer-events-none absolute inset-0 z-0"
      style={{ opacity: dimmed ? 0.4 : 1 }}
      aria-hidden="true"
    >
      {/* Dense starfield layer */}
      <div className="orbits-sky-stars absolute inset-0" />
      <div className="orbits-sky-stars orbits-sky-stars--far absolute inset-0" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="0.12"
          strokeLinecap="round"
          opacity="0.7"
        >
          {/* Upper left flourish */}
          <path d="M6 12 L11 8 L16 13 L12 18 L7 16" />
          <path d="M14 6 L18 9" />
          {/* Top center */}
          <path d="M42 5 L48 3 L53 7 L49 11 L44 9" />
          <path d="M50 4 L56 2 L58 6" />
          {/* Upper right */}
          <path d="M84 10 L90 7 L95 12 L91 16 L86 14" />
          <path d="M88 5 L93 4" />
          {/* Mid left */}
          <path d="M3 40 L8 36 L13 41 L9 46" />
          <path d="M5 48 L10 52 L7 56" />
          {/* Mid right */}
          <path d="M88 38 L94 34 L98 40 L93 44" />
          <path d="M90 48 L96 52" />
          {/* Lower left */}
          <path d="M8 86 L14 82 L18 88 L13 92 L9 89" />
          <path d="M4 78 L9 74 L12 79" />
          {/* Lower center */}
          <path d="M44 92 L50 88 L56 93 L51 97" />
          {/* Lower right */}
          <path d="M82 84 L88 80 L94 86 L89 90 L84 87" />
          {/* Soft arcs across the field */}
          <path d="M20 28 Q35 22 48 30" strokeOpacity="0.35" />
          <path d="M55 68 Q70 60 85 70" strokeOpacity="0.3" />
          <path d="M18 58 Q32 70 45 62" strokeOpacity="0.28" />
          <path d="M58 24 Q72 32 82 26" strokeOpacity="0.28" />
        </g>

        <g fill="rgba(255,255,255,0.75)">
          {[
            [6, 12],
            [11, 8],
            [16, 13],
            [12, 18],
            [42, 5],
            [48, 3],
            [53, 7],
            [49, 11],
            [84, 10],
            [90, 7],
            [95, 12],
            [91, 16],
            [8, 36],
            [13, 41],
            [94, 34],
            [98, 40],
            [14, 82],
            [18, 88],
            [50, 88],
            [56, 93],
            [88, 80],
            [94, 86],
            [28, 22],
            [62, 14],
            [35, 55],
            [70, 48],
            [25, 70],
            [75, 62],
            [40, 35],
            [60, 78],
          ].map(([cx, cy], i) => (
            <circle
              key={`${cx}-${cy}-${i}`}
              cx={cx}
              cy={cy}
              r={i % 3 === 0 ? 0.38 : 0.24}
              opacity={i % 4 === 0 ? 0.95 : 0.65}
            />
          ))}
        </g>

        {/* Soft gold / rose accent stars */}
        <g>
          <circle cx="30" cy="14" r="0.45" fill="color-mix(in srgb, var(--gold) 70%, white)" opacity="0.7" />
          <circle cx="72" cy="20" r="0.4" fill="color-mix(in srgb, var(--rose) 65%, white)" opacity="0.65" />
          <circle cx="48" cy="86" r="0.42" fill="color-mix(in srgb, var(--gold) 60%, white)" opacity="0.6" />
          <circle cx="16" cy="62" r="0.35" fill="color-mix(in srgb, var(--violet) 55%, white)" opacity="0.7" />
          <circle cx="86" cy="58" r="0.38" fill="color-mix(in srgb, var(--rose) 55%, white)" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
