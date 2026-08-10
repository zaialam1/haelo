/**
 * Unlocked celestial decorations layered into the Universe map.
 * Secondary to planets — never block navigation.
 */

import type { UserCelestialReward } from "@/lib/gamification/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";

/** Stable decorative positions in percentage space (Universe stage). */
const PLACEMENTS: Record<
  string,
  { left: string; top: string; size: number }
> = {
  first_orbit_moon: { left: "78%", top: "22%", size: 14 },
  weekly_triad: { left: "12%", top: "16%", size: 18 },
  four_winds: { left: "50%", top: "10%", size: 20 },
  stand_lantern: { left: "72%", top: "58%", size: 10 },
  connect_thread: { left: "22%", top: "62%", size: 12 },
  explore_compass: { left: "18%", top: "28%", size: 11 },
  express_flare: { left: "82%", top: "42%", size: 12 },
  experiment_spark: { left: "48%", top: "48%", size: 8 },
  first_evolution_bloom: { left: "60%", top: "78%", size: 28 },
  voice_25: { left: "8%", top: "48%", size: 16 },
  voice_50: { left: "88%", top: "70%", size: 18 },
  region_friendships_people: { left: "30%", top: "12%", size: 10 },
  region_speaking_up: { left: "70%", top: "14%", size: 10 },
  region_figuring_things_out: { left: "26%", top: "84%", size: 10 },
  region_putting_yourself_out_there: { left: "74%", top: "82%", size: 10 },
};

const PLANET_ORBIT: Record<VoicePlanetId, { left: string; top: string }> = {
  express: { left: "78%", top: "28%" },
  stand: { left: "72%", top: "68%" },
  connect: { left: "22%", top: "68%" },
  explore: { left: "20%", top: "28%" },
};

type CelestialDecorationsProps = {
  rewards: UserCelestialReward[];
};

export function CelestialDecorations({ rewards }: CelestialDecorationsProps) {
  if (rewards.length === 0) return null;

  // Cap density — prefer older unlocked first, then newest if under cap
  const shown = rewards.slice(0, 14);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1]"
      aria-hidden="false"
    >
      <ul className="sr-only">
        {shown.map((r) => (
          <li key={r.id}>
            New celestial discovery: {r.title}
            {r.description ? `. ${r.description}` : ""}
          </li>
        ))}
      </ul>

      {shown.map((reward, index) => {
        const pos =
          PLACEMENTS[reward.rewardKey] ??
          (reward.planet && PLANET_ORBIT[reward.planet]
            ? {
                left: PLANET_ORBIT[reward.planet]!.left,
                top: PLANET_ORBIT[reward.planet]!.top,
                size: 10,
              }
            : {
                left: `${12 + ((index * 17) % 76)}%`,
                top: `${14 + ((index * 23) % 70)}%`,
                size: 10,
              });

        return (
          <span
            key={reward.id}
            className="celestial-decoration absolute motion-safe:animate-[celestial-drift_12s_ease-in-out_infinite]"
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.size,
              height: pos.size,
              animationDelay: `${index * 0.4}s`,
            }}
            title={reward.title}
          >
            <DecorationMark type={reward.rewardType} />
          </span>
        );
      })}
    </div>
  );
}

function DecorationMark({ type }: { type: UserCelestialReward["rewardType"] }) {
  const common = {
    className: "size-full",
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (type) {
    case "moon":
      return (
        <svg {...common}>
          <circle
            cx="13"
            cy="12"
            r="7"
            fill="color-mix(in srgb, var(--gold) 55%, white)"
            opacity="0.85"
          />
          <circle cx="9" cy="10" r="6" fill="var(--universe-map)" opacity="0.9" />
        </svg>
      );
    case "comet":
      return (
        <svg {...common}>
          <path
            d="M4 16 L14 8 L18 7"
            fill="none"
            stroke="color-mix(in srgb, var(--gold) 70%, white)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="18" cy="7" r="2.2" fill="var(--gold)" />
        </svg>
      );
    case "ring":
      return (
        <svg {...common}>
          <ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="4"
            fill="none"
            stroke="color-mix(in srgb, var(--rose) 50%, white)"
            strokeWidth="1.2"
            opacity="0.8"
          />
        </svg>
      );
    case "nebula":
    case "aurora":
      return (
        <svg {...common}>
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="6"
            fill="color-mix(in srgb, var(--violet) 35%, transparent)"
          />
          <ellipse
            cx="14"
            cy="11"
            rx="6"
            ry="3.5"
            fill="color-mix(in srgb, var(--rose) 30%, transparent)"
          />
        </svg>
      );
    case "constellation":
    case "star_cluster":
      return (
        <svg {...common}>
          <circle cx="6" cy="14" r="1.3" fill="var(--gold)" />
          <circle cx="12" cy="8" r="1.6" fill="var(--gold)" />
          <circle cx="18" cy="13" r="1.2" fill="var(--gold)" />
          <path
            d="M6 14 L12 8 L18 13"
            fill="none"
            stroke="color-mix(in srgb, var(--gold) 55%, white)"
            strokeWidth="0.8"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="color-mix(in srgb, var(--gold) 65%, white)"
          />
          <circle
            cx="12"
            cy="12"
            r="7"
            fill="none"
            stroke="color-mix(in srgb, var(--gold) 40%, transparent)"
            strokeWidth="0.8"
          />
        </svg>
      );
  }
}
