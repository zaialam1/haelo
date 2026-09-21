import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

/** Universe-wide slots only (comets / haze) — planet slots live on each orb. */
const UNIVERSE_PLACEMENTS: Record<
  string,
  { left: string; top: string; size: number }
> = {
  outer_comet: { left: "88%", top: "14%", size: 48 },
  nebula_haze: { left: "50%", top: "46%", size: 140 },
};

type CosmeticsUniverseLayerProps = {
  assignments: SlotAssignment[];
};

export function CosmeticsUniverseLayer({
  assignments,
}: CosmeticsUniverseLayerProps) {
  const active = assignments.filter(
    (a) => a.cosmeticKey && a.planet === "universe",
  );

  if (active.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden="true">
      {active.map((assignment) => {
        const item = getCosmeticByKey(assignment.cosmeticKey!);
        if (!item) return null;
        const pos =
          UNIVERSE_PLACEMENTS[assignment.slotKey] ?? {
            left: "50%",
            top: "50%",
            size: 40,
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
      })}
    </div>
  );
}
