import { VOICE_PLANETS } from "@/lib/home/voicePlanets";
import { MyVoiceOrb } from "./MyVoiceOrb";
import { VoicePlanetOrb } from "./VoicePlanet";

/** Soft white orbital paths — matching the reference nebula look */
const RINGS = [
  { w: 108, h: 96 },
  { w: 92, h: 82 },
  { w: 76, h: 68 },
  { w: 60, h: 54 },
  { w: 44, h: 40 },
  { w: 28, h: 25 },
];

export function ConversationUniverse() {
  return (
    <section
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "var(--universe-map)",
      }}
      aria-label="Your voice universe"
    >
      {/* Tiny white stars */}
      <div
        className="universe-nebula-stars pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* Soft haze */}
      <div
        className="universe-nebula-haze pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* Delicate constellation lines */}
      <svg
        className="universe-nebula-constellations pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.12"
          strokeLinecap="round"
        >
          <path d="M8 18 L14 12 L21 16 L17 23" />
          <path d="M78 11 L85 15 L91 10 L87 21" />
          <path d="M6 72 L12 78 L9 87 L18 83" />
          <path d="M82 74 L90 69 L95 78 L88 84" />
          <path d="M4 42 L10 38 L15 44" />
          <path d="M92 40 L97 47 L91 52" />
          <path d="M48 8 L54 12 L50 18" />
          <path d="M30 90 L36 86 L42 91" />
        </g>
        <g fill="rgba(255,255,255,0.7)">
          <circle cx="8" cy="18" r="0.28" />
          <circle cx="14" cy="12" r="0.38" />
          <circle cx="21" cy="16" r="0.25" />
          <circle cx="17" cy="23" r="0.28" />
          <circle cx="78" cy="11" r="0.28" />
          <circle cx="85" cy="15" r="0.36" />
          <circle cx="91" cy="10" r="0.24" />
          <circle cx="87" cy="21" r="0.28" />
          <circle cx="6" cy="72" r="0.26" />
          <circle cx="12" cy="78" r="0.34" />
          <circle cx="9" cy="87" r="0.24" />
          <circle cx="18" cy="83" r="0.28" />
          <circle cx="82" cy="74" r="0.26" />
          <circle cx="90" cy="69" r="0.36" />
          <circle cx="95" cy="78" r="0.24" />
          <circle cx="88" cy="84" r="0.28" />
          <circle cx="4" cy="42" r="0.22" />
          <circle cx="10" cy="38" r="0.3" />
          <circle cx="15" cy="44" r="0.22" />
          <circle cx="92" cy="40" r="0.24" />
          <circle cx="97" cy="47" r="0.32" />
          <circle cx="91" cy="52" r="0.22" />
          <circle cx="48" cy="8" r="0.24" />
          <circle cx="54" cy="12" r="0.3" />
          <circle cx="50" cy="18" r="0.22" />
          <circle cx="30" cy="90" r="0.24" />
          <circle cx="36" cy="86" r="0.3" />
          <circle cx="42" cy="91" r="0.22" />
        </g>
      </svg>

      <div className="absolute inset-x-0 top-14 bottom-20 sm:top-16 sm:bottom-24">
        {RINGS.map((ring, i) => (
          <div
            key={ring.w}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border motion-safe:animate-[orbit-breathe_11s_ease-in-out_infinite]"
            style={{
              width: `${ring.w}%`,
              height: `${ring.h}%`,
              maxWidth: "min(98vw, 880px)",
              maxHeight: "min(88vw, 760px)",
              borderColor: "rgba(255, 255, 255, 0.38)",
              borderWidth: "1px",
              animationDelay: `${i * 0.55}s`,
            }}
            aria-hidden="true"
          />
        ))}

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <MyVoiceOrb nested />
        </div>

        {VOICE_PLANETS.map((planet, index) => (
          <VoicePlanetOrb
            key={planet.id}
            planet={planet}
            floatDelaySec={(index * 0.55) % 2.6}
          />
        ))}
      </div>
    </section>
  );
}
