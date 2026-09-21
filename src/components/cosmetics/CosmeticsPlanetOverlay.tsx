import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

const HERO_SLOT_STYLE: Record<
  string,
  { className: string; size: number }
> = {
  ring: {
    className:
      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90",
    size: 220,
  },
  moon: {
    className: "absolute right-[4%] top-[6%]",
    size: 40,
  },
  creature: {
    className: "absolute right-[2%] bottom-[18%]",
    size: 48,
  },
  ground: {
    className: "absolute bottom-[2%] left-1/2 -translate-x-1/2",
    size: 52,
  },
  sky: {
    className: "absolute left-[4%] top-[4%] opacity-90",
    size: 56,
  },
};

type CosmeticsPlanetOverlayProps = {
  assignments: SlotAssignment[];
  className?: string;
};

/** Zoomed planet-page overlays from the same slot assignments. */
export function CosmeticsPlanetOverlay({
  assignments,
  className,
}: CosmeticsPlanetOverlayProps) {
  const active = assignments.filter((a) => a.cosmeticKey);
  if (active.length === 0) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      aria-hidden="true"
    >
      {active.map((assignment) => {
        const item = getCosmeticByKey(assignment.cosmeticKey!);
        const style = HERO_SLOT_STYLE[assignment.slotKey];
        if (!item || !style) return null;
        return (
          <span key={assignment.id} className={style.className}>
            <CosmeticSprite visual={item.visual} size={style.size} />
          </span>
        );
      })}
    </div>
  );
}
