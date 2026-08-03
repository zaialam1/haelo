import { TOPICS } from "@/lib/home/universe";
import { CenterStar } from "./CenterStar";
import { TopicPlanetOrb } from "./TopicPlanet";
import { StreakConstellation } from "./StreakConstellation";

const RINGS = [
  { pct: 48, color: "color-mix(in srgb, var(--violet) 20%, transparent)" },
  { pct: 40, color: "color-mix(in srgb, var(--rose) 18%, transparent)" },
  { pct: 32, color: "color-mix(in srgb, var(--gold) 16%, transparent)" },
  { pct: 24, color: "color-mix(in srgb, var(--violet) 22%, transparent)" },
  { pct: 16, color: "color-mix(in srgb, var(--rose) 20%, transparent)" },
  { pct: 10, color: "color-mix(in srgb, var(--gold) 18%, transparent)" },
];

export function ConversationUniverse() {
  return (
    <section
      className="absolute inset-0 overflow-hidden"
      style={{
        background: "var(--universe-map)",
      }}
      aria-label="Your conversation universe"
    >
      <div
        className="universe-starfield pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <p
        className="absolute top-[4.75rem] left-1/2 z-30 -translate-x-1/2 font-[family-name:var(--font-fraunces)] text-lg tracking-tight sm:top-[5.25rem] sm:text-xl"
        style={{
          color: "var(--foreground)",
          fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 500',
        }}
      >
        <span aria-hidden="true" className="mr-1.5 text-[var(--gold)]">
          ✦
        </span>
        Your Voice
      </p>

      <StreakConstellation />

      <div className="absolute inset-0">
        {RINGS.map((ring) => (
          <div
            key={ring.pct}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              width: `${ring.pct * 2}%`,
              height: `${ring.pct * 2}%`,
              maxWidth: "min(96vw, 900px)",
              maxHeight: "min(96vw, 900px)",
              borderColor: ring.color,
            }}
            aria-hidden="true"
          />
        ))}

        <CenterStar />

        {TOPICS.map((topic, index) => (
          <TopicPlanetOrb
            key={topic.id}
            topic={topic}
            floatDelaySec={(index * 0.37) % 2.8}
          />
        ))}
      </div>
    </section>
  );
}
