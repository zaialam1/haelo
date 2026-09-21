import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

/**
 * Decorations anchored to a planet orb's disc (not the label column).
 * Renders inside a `relative` wrapper around EvolvedPlanet.
 */
const ORB_SLOTS: Record<
  string,
  { className: string; sizePct: number; z: number }
> = {
  ring: {
    className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    sizePct: 155,
    z: 0,
  },
  sky: {
    className: "absolute left-[8%] top-[-6%]",
    sizePct: 48,
    z: 0,
  },
  moon: {
    className: "absolute right-[-4%] top-[2%]",
    sizePct: 36,
    z: 2,
  },
  creature: {
    className: "absolute right-[-8%] bottom-[8%]",
    sizePct: 40,
    z: 2,
  },
  ground: {
    className: "absolute bottom-[-6%] left-1/2 -translate-x-1/2",
    sizePct: 38,
    z: 2,
  },
};

type CosmeticsOrbDecorationsProps = {
  assignments: SlotAssignment[];
  /** CSS size of the planet disc, used to scale sprites */
  planetSizeCss: string;
};

export function CosmeticsOrbDecorations({
  assignments,
  planetSizeCss,
}: CosmeticsOrbDecorationsProps) {
  const active = assignments.filter((a) => a.cosmeticKey);
  if (active.length === 0) return null;

  return (
    <>
      {active.map((assignment) => {
        const item = getCosmeticByKey(assignment.cosmeticKey!);
        const layout = ORB_SLOTS[assignment.slotKey];
        if (!item || !layout) return null;

        return (
          <span
            key={assignment.id}
            className={`pointer-events-none ${layout.className}`}
            style={{ zIndex: layout.z }}
            aria-hidden="true"
          >
            {/* Scale sprite relative to planet disc via CSS width */}
            <span
              className="block"
              style={{
                width: `calc(${planetSizeCss} * ${layout.sizePct / 100})`,
                height: `calc(${planetSizeCss} * ${layout.sizePct / 100})`,
              }}
            >
              <CosmeticSprite
                visual={item.visual}
                size={Math.round(120 * (layout.sizePct / 100))}
                className="h-full w-full"
              />
            </span>
          </span>
        );
      })}
    </>
  );
}
