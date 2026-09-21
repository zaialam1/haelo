import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

const HERO_SLOTS: Record<
  string,
  { left: string; top: string; sizePct: number; z: number }
> = {
  ring: { left: "50%", top: "50%", sizePct: 162, z: 0 },
  moon: { left: "90%", top: "8%", sizePct: 28, z: 2 },
  creature: { left: "94%", top: "74%", sizePct: 32, z: 2 },
  ground: { left: "50%", top: "98%", sizePct: 34, z: 2 },
  sky: { left: "10%", top: "2%", sizePct: 38, z: 0 },
};

function stackOffset(index: number): { x: number; y: number; scale: number } {
  if (index === 0) return { x: 0, y: 0, scale: 1 };
  const angle = ((index - 1) * 52) % 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 12 + index * 7;
  return {
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    scale: Math.max(0.75, 1 - index * 0.07),
  };
}

type CosmeticsPlanetOverlayProps = {
  assignments: SlotAssignment[];
  className?: string;
};

export function CosmeticsPlanetOverlay({
  assignments,
  className,
}: CosmeticsPlanetOverlayProps) {
  const active = assignments.filter((a) => a.cosmeticKey);
  if (active.length === 0) return null;

  const bySlot = new Map<string, typeof active>();
  for (const a of active) {
    const list = bySlot.get(a.slotKey) ?? [];
    list.push(a);
    bySlot.set(a.slotKey, list);
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-visible ${className ?? ""}`}
      aria-hidden="true"
    >
      {[...bySlot.entries()].flatMap(([slotKey, list]) => {
        const layout = HERO_SLOTS[slotKey];
        if (!layout) return [];

        return list.map((assignment, index) => {
          const item = getCosmeticByKey(assignment.cosmeticKey!);
          if (!item) return null;
          const offset = stackOffset(index);
          const sizePct =
            slotKey === "ring"
              ? layout.sizePct + index * 18
              : layout.sizePct * offset.scale;

          return (
            <span
              key={assignment.id}
              className="absolute"
              style={{
                left: layout.left,
                top: layout.top,
                width: `${sizePct}%`,
                height: `${sizePct}%`,
                zIndex: layout.z + index,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
              }}
            >
              <CosmeticSprite
                visual={item.visual}
                size={96}
                className="h-full w-full"
              />
            </span>
          );
        });
      })}
    </div>
  );
}
