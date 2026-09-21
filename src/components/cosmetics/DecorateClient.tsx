"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";
import { StardustChip } from "@/components/cosmetics/StardustChip";
import { assignCosmeticSlotAction } from "@/lib/cosmetics/actions";
import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type {
  CosmeticsPlanetId,
  CosmeticsSlotKey,
  CosmeticsState,
} from "@/lib/cosmetics/types";
import {
  PLANET_SLOT_KEYS,
  SLOT_LABELS,
  UNIVERSE_SLOT_KEYS,
} from "@/lib/cosmetics/types";
import { trackEvent } from "@/lib/analytics";
import { VOICE_PLANETS } from "@/lib/home/voicePlanets";

type DecorateClientProps = {
  initialState: CosmeticsState;
};

const PLANET_OPTIONS: Array<{ id: CosmeticsPlanetId; label: string }> = [
  ...VOICE_PLANETS.map((p) => ({ id: p.id as CosmeticsPlanetId, label: p.label })),
  { id: "universe", label: "Outer space" },
];

export function DecorateClient({ initialState }: DecorateClientProps) {
  const [state, setState] = useState(initialState);
  const [planet, setPlanet] = useState<CosmeticsPlanetId>("express");
  const [activeSlot, setActiveSlot] = useState<CosmeticsSlotKey>("creature");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    trackEvent("decorate_opened", {});
  }, []);

  const slots =
    planet === "universe" ? UNIVERSE_SLOT_KEYS : PLANET_SLOT_KEYS;

  useEffect(() => {
    if (!(slots as readonly string[]).includes(activeSlot)) {
      setActiveSlot(slots[0]!);
    }
  }, [planet, slots, activeSlot]);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const row of state.assignments) {
      map.set(`${row.planet}:${row.slotKey}`, row.cosmeticKey);
    }
    return map;
  }, [state.assignments]);

  const equippedKey = assignmentMap.get(`${planet}:${activeSlot}`) ?? null;

  const ownedForSlot = useMemo(() => {
    return state.owned
      .map((o) => getCosmeticByKey(o.cosmeticKey))
      .filter((item): item is NonNullable<typeof item> =>
        Boolean(item && item.slotTypes.includes(activeSlot)),
      );
  }, [state.owned, activeSlot]);

  function assign(cosmeticKey: string | null) {
    setMessage(null);
    startTransition(async () => {
      const result = await assignCosmeticSlotAction({
        planet,
        slotKey: activeSlot,
        cosmeticKey,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setState(result.state);
      setMessage(result.message ?? "Updated.");
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--violet)" }}
          >
            Decorate
          </p>
          <h1
            className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Place what you own
          </h1>
          <p
            className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Choose a planet, pick a slot, and assign a decoration. The same
            placement shows on the Universe map and when you zoom into that
            planet.
          </p>
        </div>
        <StardustChip balance={state.balance} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {PLANET_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setPlanet(option.id)}
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background:
                planet === option.id
                  ? "var(--violet)"
                  : "color-mix(in srgb, var(--violet) 10%, transparent)",
              color:
                planet === option.id
                  ? "var(--on-violet)"
                  : "var(--foreground)",
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {slots.map((slot) => {
          const filled = Boolean(assignmentMap.get(`${planet}:${slot}`));
          return (
            <button
              key={slot}
              type="button"
              onClick={() => setActiveSlot(slot)}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
              style={{
                background:
                  activeSlot === slot
                    ? "color-mix(in srgb, var(--gold) 40%, var(--surface))"
                    : "color-mix(in srgb, var(--gold) 12%, transparent)",
                color: "var(--foreground)",
                border: filled
                  ? "1px solid color-mix(in srgb, var(--gold) 55%, transparent)"
                  : "1px solid transparent",
              }}
            >
              {SLOT_LABELS[slot]}
              {filled ? " · on" : ""}
            </button>
          );
        })}
      </div>

      <section
        className="mt-8 rounded-3xl p-5"
        style={{
          background: "color-mix(in srgb, var(--surface) 78%, transparent)",
          border: "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
        }}
      >
        <h2 className="text-sm font-semibold">
          {SLOT_LABELS[activeSlot]} slot
        </h2>
        {equippedKey ? (
          <div className="mt-3 flex items-center gap-3">
            {(() => {
              const item = getCosmeticByKey(equippedKey);
              if (!item) return null;
              return (
                <>
                  <CosmeticSprite visual={item.visual} size={40} />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      Currently placed
                    </p>
                  </div>
                </>
              );
            })()}
            <button
              type="button"
              disabled={pending}
              onClick={() => assign(null)}
              className="ml-auto rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
              style={{
                background: "color-mix(in srgb, var(--violet) 12%, transparent)",
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Empty — choose a decoration below.
          </p>
        )}
      </section>

      {message ? (
        <p
          className="mt-4 text-sm"
          style={{ color: "var(--foreground-muted)" }}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <h2 className="mt-8 text-sm font-semibold tracking-tight">
        Your decorations for this slot
      </h2>
      {ownedForSlot.length === 0 ? (
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Nothing owned for this slot yet.{" "}
          <TransitionLink
            href="/store"
            variant="fade"
            className="font-semibold underline-offset-2 hover:underline"
            style={{ color: "var(--violet)" }}
          >
            Visit the store
          </TransitionLink>
          .
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ownedForSlot.map((item) => {
            const isOn = equippedKey === item.key;
            return (
              <li
                key={item.key}
                className="flex items-center gap-3 rounded-2xl p-3"
                style={{
                  background:
                    "color-mix(in srgb, var(--surface) 85%, transparent)",
                  border: isOn
                    ? "1px solid color-mix(in srgb, var(--gold) 50%, transparent)"
                    : "1px solid color-mix(in srgb, var(--violet) 10%, transparent)",
                }}
              >
                <CosmeticSprite visual={item.visual} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                </div>
                <button
                  type="button"
                  disabled={pending || isOn}
                  onClick={() => assign(item.key)}
                  className="rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                  style={{
                    background: isOn ? "transparent" : "var(--violet)",
                    color: isOn ? "var(--foreground-muted)" : "var(--on-violet)",
                  }}
                >
                  {isOn ? "Placed" : "Place"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        <TransitionLink
          href="/store"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--violet)] px-6 py-3 text-sm font-semibold text-[var(--on-violet)]"
        >
          Open store
        </TransitionLink>
        <TransitionLink
          href="/home"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
          style={{
            background: "color-mix(in srgb, var(--violet) 12%, transparent)",
          }}
        >
          Back to Universe
        </TransitionLink>
      </div>
    </div>
  );
}
