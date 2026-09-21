import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type { SlotAssignment } from "@/lib/cosmetics/types";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";

const HERO_SLOT_STYLE: Record<
  string,
  { className: string; sizePct: number; z: number }
> = {
  ring: {
    className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
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

function stackOffset(index: number): { x: number; y: number; scale: number } {
  if (index === 0) return { x: 0, y: 0, scale: 1 };
  const angle = ((index - 1) * 47) % 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 14 + index * 8;
  return {
    x: Math.cos(rad) * dist,
    y: Math.sin(rad) * dist,
    scale: Math.max(0.72, 1 - index * 0.08),
  };
}

type CosmeticsPlanetOverlayProps = {
  assignments: SlotAssignment[];
  className?: string;
};

/** Zoomed planet-page overlays — supports many items per slot. */
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
        const style = HERO_SLOT_STYLE[slotKey];
        if (!style) return [];

        return list.map((assignment, index) => {
          const item = getCosmeticByKey(assignment.cosmeticKey!);
          if (!item) return null;
          const offset = stackOffset(index);
          const sizePct =
            slotKey === "ring"
              ? style.sizePct + index * 20
              : style.sizePct * offset.scale;

          return (
            <span
              key={assignment.id}
              className={style.className}
              style={{
                zIndex: style.z + index,
                ...(slotKey === "ring"
                  ? { transform: "translate(-50%, -50%)" }
                  : index > 0
                    ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
                    : {}),
              }}
            >
              <span
                className="block"
                style={{
                  width: `${sizePct}%`,
                  height: `${sizePct}%`,
                }}
              >
                <CosmeticSprite
                  visual={item.visual}
                  size={Math.round(2.2 * sizePct)}
                  className="h-full w-full"
                />
              </span>
            </span>
          );
        });
      })}
    </div>
  );
}
