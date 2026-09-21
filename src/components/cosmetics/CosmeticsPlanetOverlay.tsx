import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

const HERO_SLOT_STYLE: Record<
  string,
  { className: string; sizePct: number; z: number }
> = {
  ring: {
    className:
      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    sizePct: 160,
    z: 0,
  },
  moon: {
    className: "absolute right-[-2%] top-[0%]",
    sizePct: 28,
    z: 2,
  },
  creature: {
    className: "absolute right-[-4%] bottom-[10%]",
    sizePct: 32,
    z: 2,
  },
  ground: {
    className: "absolute bottom-[-4%] left-1/2 -translate-x-1/2",
    sizePct: 34,
    z: 2,
  },
  sky: {
    className: "absolute left-[0%] top-[-4%]",
    sizePct: 40,
    z: 0,
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
      className={`pointer-events-none absolute inset-0 overflow-visible ${className ?? ""}`}
      aria-hidden="true"
    >
      {active.map((assignment) => {
        const item = getCosmeticByKey(assignment.cosmeticKey!);
        const style = HERO_SLOT_STYLE[assignment.slotKey];
        if (!item || !style) return null;
        return (
          <span
            key={assignment.id}
            className={style.className}
            style={{ zIndex: style.z }}
          >
            <span
              className="block"
              style={{
                width: `${style.sizePct}%`,
                height: `${style.sizePct}%`,
              }}
            >
              <CosmeticSprite
                visual={item.visual}
                size={Math.round(2.2 * style.sizePct)}
                className="h-full w-full"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
