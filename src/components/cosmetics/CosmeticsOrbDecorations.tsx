import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

/**
 * Decorations anchored to a planet orb's disc.
 * Multiple items in the same slot fan out slightly so they don’t stack.
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

/** Pixel offsets for the 2nd, 3rd, … item sharing a slot */
function stackOffset(index: number): { x: number; y: number; scale: number } {
  if (index === 0) return { x: 0, y: 0, scale: 1 };
  const angle = ((index - 1) * 47) % 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 10 + index * 6;
  return {
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    scale: Math.max(0.72, 1 - index * 0.08),
  };
}

type CosmeticsOrbDecorationsProps = {
  assignments: SlotAssignment[];
  planetSizeCss: string;
};

export function CosmeticsOrbDecorations({
  assignments,
  planetSizeCss,
}: CosmeticsOrbDecorationsProps) {
  const active = assignments.filter((a) => a.cosmeticKey);
  if (active.length === 0) return null;

  const bySlot = new Map<string, SlotAssignment[]>();
  for (const a of active) {
    const list = bySlot.get(a.slotKey) ?? [];
    list.push(a);
    bySlot.set(a.slotKey, list);
  }

  return (
    <>
      {[...bySlot.entries()].flatMap(([slotKey, list]) => {
        const layout = ORB_SLOTS[slotKey];
        if (!layout) return [];

        return list.map((assignment, index) => {
          const item = getCosmeticByKey(assignment.cosmeticKey!);
          if (!item) return null;
          const offset = stackOffset(index);
          // Rings grow slightly when stacked so each band stays visible
          const sizePct =
            slotKey === "ring"
              ? layout.sizePct + index * 18
              : layout.sizePct * offset.scale;

          return (
            <span
              key={assignment.id}
              className={`pointer-events-none ${layout.className}`}
              style={{
                zIndex: layout.z + index,
                ...(slotKey === "ring"
                  ? { transform: "translate(-50%, -50%)" }
                  : slotKey === "ground"
                    ? {
                        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
                      }
                    : index > 0
                      ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
                      : {}),
              }}
              aria-hidden="true"
            >
              <span
                className="block"
                style={{
                  width: `calc(${planetSizeCss} * ${sizePct / 100})`,
                  height: `calc(${planetSizeCss} * ${sizePct / 100})`,
                }}
              >
                <CosmeticSprite
                  visual={item.visual}
                  size={Math.round(120 * (sizePct / 100))}
                  className="h-full w-full"
                />
              </span>
            </span>
          );
        });
      })}
    </>
  );
}
