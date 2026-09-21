import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

/**
 * Decorations anchored to a planet orb disc (parent must be `relative` with
 * explicit width/height). Sizes use % of that disc — never `calc(clamp(...) * n)`,
 * which breaks in several browsers and caused rings to float off-planet.
 */
const ORB_SLOTS: Record<
  string,
  { left: string; top: string; sizePct: number; z: number; center?: boolean }
> = {
  ring: { left: "50%", top: "50%", sizePct: 158, z: 0, center: true },
  sky: { left: "12%", top: "0%", sizePct: 46, z: 0 },
  moon: { left: "88%", top: "10%", sizePct: 34, z: 2, center: true },
  creature: { left: "92%", top: "72%", sizePct: 38, z: 2, center: true },
  ground: { left: "50%", top: "96%", sizePct: 40, z: 2, center: true },
};

function stackOffset(index: number): { x: number; y: number; scale: number } {
  if (index === 0) return { x: 0, y: 0, scale: 1 };
  const angle = ((index - 1) * 52) % 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 8 + index * 5;
  return {
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    scale: Math.max(0.75, 1 - index * 0.07),
  };
}

type CosmeticsOrbDecorationsProps = {
  assignments: SlotAssignment[];
};

export function CosmeticsOrbDecorations({
  assignments,
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
          const sizePct =
            slotKey === "ring"
              ? layout.sizePct + index * 16
              : layout.sizePct * offset.scale;

          const center = layout.center !== false;
          return (
            <span
              key={assignment.id}
              className="pointer-events-none absolute"
              style={{
                left: layout.left,
                top: layout.top,
                width: `${sizePct}%`,
                height: `${sizePct}%`,
                zIndex: layout.z + index,
                transform: center
                  ? `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`
                  : `translate(${offset.x}px, ${offset.y}px)`,
              }}
              aria-hidden="true"
            >
              <CosmeticSprite
                visual={item.visual}
                size={64}
                className="h-full w-full"
              />
            </span>
          );
        });
      })}
    </>
  );
}
