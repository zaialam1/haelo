import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import type { VoicePlanetId } from "@/lib/home/voicePlanets";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

/** Percentage offsets relative to a planet orb center on the Universe map. */
const SLOT_OFFSETS: Record<
  string,
  { dx: number; dy: number; size: number }
> = {
  creature: { dx: 6, dy: -2, size: 22 },
  ground: { dx: 0, dy: 7, size: 20 },
  moon: { dx: -7, dy: -6, size: 16 },
  ring: { dx: 0, dy: 0, size: 36 },
  sky: { dx: 4, dy: -8, size: 24 },
};

const UNIVERSE_PLACEMENTS: Record<
  string,
  { left: string; top: string; size: number }
> = {
  outer_comet: { left: "86%", top: "18%", size: 28 },
  nebula_haze: { left: "48%", top: "42%", size: 80 },
};

type CosmeticsUniverseLayerProps = {
  assignments: SlotAssignment[];
};

export function CosmeticsUniverseLayer({
  assignments,
}: CosmeticsUniverseLayerProps) {
  const planetById = new Map(VOICE_PLANETS.map((p) => [p.id, p]));
  const active = assignments.filter((a) => a.cosmeticKey);

  if (active.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      aria-hidden="true"
    >
      {active.map((assignment) => {
        const item = getCosmeticByKey(assignment.cosmeticKey!);
        if (!item) return null;

        if (assignment.planet === "universe") {
          const pos =
            UNIVERSE_PLACEMENTS[assignment.slotKey] ?? {
              left: "50%",
              top: "50%",
              size: 24,
            };
          return (
            <span
              key={assignment.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[celestial-drift_14s_ease-in-out_infinite]"
              style={{ left: pos.left, top: pos.top }}
            >
              <CosmeticSprite visual={item.visual} size={pos.size} />
            </span>
          );
        }

        const planet = planetById.get(assignment.planet as VoicePlanetId);
        if (!planet) return null;
        const offset = SLOT_OFFSETS[assignment.slotKey] ?? {
          dx: 0,
          dy: 0,
          size: 20,
        };

        return (
          <span
            key={assignment.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${planet.x + offset.dx}%`,
              top: `${planet.y + offset.dy}%`,
              zIndex: assignment.slotKey === "ring" ? 0 : 2,
            }}
          >
            <CosmeticSprite visual={item.visual} size={offset.size} />
          </span>
        );
      })}
    </div>
  );
}
