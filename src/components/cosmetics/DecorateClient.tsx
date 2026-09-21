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
import { VOICE_PLANETS, getVoicePlanetById } from "@/lib/home/voicePlanets";

type DecorateClientProps = {
  initialState: CosmeticsState;
};

const PLANET_OPTIONS: Array<{ id: CosmeticsPlanetId; label: string; color: string }> = [
  ...VOICE_PLANETS.map((p) => ({
    id: p.id as CosmeticsPlanetId,
    label: p.label,
    color: p.color,
  })),
  { id: "universe", label: "Outer space", color: "#5B4B8A" },
];

/** Clickable positions around the preview globe. */
const PLANET_HOTSPOTS: Record<
  CosmeticsSlotKey,
  { left: string; top: string; hint: string }
> = {
  sky: { left: "18%", top: "12%", hint: "Sky" },
  moon: { left: "78%", top: "16%", hint: "Moon" },
  ring: { left: "50%", top: "48%", hint: "Ring" },
  creature: { left: "82%", top: "62%", hint: "Friend" },
  ground: { left: "50%", top: "86%", hint: "Ground" },
  outer_comet: { left: "78%", top: "28%", hint: "Comet" },
  nebula_haze: { left: "28%", top: "55%", hint: "Haze" },
};

export function DecorateClient({ initialState }: DecorateClientProps) {
  const [state, setState] = useState(initialState);
  const [planet, setPlanet] = useState<CosmeticsPlanetId>("express");
  const [activeSlot, setActiveSlot] = useState<CosmeticsSlotKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    trackEvent("decorate_opened", {});
  }, []);

  const slots =
    planet === "universe" ? UNIVERSE_SLOT_KEYS : PLANET_SLOT_KEYS;

  useEffect(() => {
    setActiveSlot(null);
    setMessage(null);
  }, [planet]);

  const assignmentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const row of state.assignments) {
      map.set(`${row.planet}:${row.slotKey}`, row.cosmeticKey);
    }
    return map;
  }, [state.assignments]);

  const equippedKey = activeSlot
    ? (assignmentMap.get(`${planet}:${activeSlot}`) ?? null)
    : null;

  const ownedForSlot = useMemo(() => {
    if (!activeSlot) return [];
    return state.owned
      .map((o) => getCosmeticByKey(o.cosmeticKey))
      .filter((item): item is NonNullable<typeof item> =>
        Boolean(item && item.slotTypes.includes(activeSlot)),
      );
  }, [state.owned, activeSlot]);

  const planetMeta =
    planet === "universe"
      ? { label: "Outer space", color: "#5B4B8A" }
      : getVoicePlanetById(planet);

  function assign(cosmeticKey: string | null) {
    if (!activeSlot) return;
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
      setMessage(
        cosmeticKey
          ? `Placed on ${SLOT_LABELS[activeSlot].toLowerCase()}.`
          : `${SLOT_LABELS[activeSlot]} cleared.`,
      );
    });
  }

  const step = !activeSlot ? 2 : 3;

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
            Dress up your Universe
          </h1>
        </div>
        <StardustChip balance={state.balance} />
      </div>

      {/* Simple 3-step guide */}
      <ol className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          { n: 1, label: "Pick a world" },
          { n: 2, label: "Tap a spot" },
          { n: 3, label: "Choose a decoration" },
        ].map((s) => (
          <li
            key={s.n}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background:
                step >= s.n
                  ? "color-mix(in srgb, var(--violet) 16%, transparent)"
                  : "color-mix(in srgb, var(--foreground) 5%, transparent)",
              color:
                step >= s.n ? "var(--foreground)" : "var(--foreground-muted)",
              fontWeight: step === s.n ? 600 : 500,
            }}
          >
            <span
              className="inline-flex size-5 items-center justify-center rounded-full text-[0.6875rem] font-bold"
              style={{
                background: step >= s.n ? "var(--violet)" : "transparent",
                color: step >= s.n ? "var(--on-violet)" : "inherit",
                border:
                  step >= s.n
                    ? "none"
                    : "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
              }}
            >
              {s.n}
            </span>
            {s.label}
          </li>
        ))}
      </ol>

      {/* Step 1 — worlds */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold">1. Which world?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PLANET_OPTIONS.map((option) => {
            const selected = planet === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPlanet(option.id)}
                className="flex flex-col items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  background: selected
                    ? "color-mix(in srgb, var(--violet) 14%, var(--surface))"
                    : "color-mix(in srgb, var(--surface) 70%, transparent)",
                  border: selected
                    ? "2px solid var(--violet)"
                    : "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
                }}
              >
                <span
                  className="size-9 rounded-full"
                  style={{
                    background: option.color,
                    boxShadow: `0 0 16px color-mix(in srgb, ${option.color} 45%, transparent)`,
                  }}
                  aria-hidden="true"
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2 — visual spot picker */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold">
          2. Tap a spot on {planetMeta?.label ?? "this world"}
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--foreground-muted)" }}
        >
          Empty spots are outlined. Filled spots show what you placed.
        </p>

        <div
          className="relative mx-auto mt-5 aspect-square w-full max-w-sm rounded-[2rem]"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--violet) 18%, #1a1428))",
            border: "1px solid color-mix(in srgb, var(--violet) 16%, transparent)",
          }}
        >
          {/* Center globe */}
          <div
            className="absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                planet === "universe"
                  ? "radial-gradient(circle at 35% 30%, #8B7CB0, #3D3358)"
                  : `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${planetMeta?.color ?? "#5B4B8A"} 70%, white), ${planetMeta?.color ?? "#5B4B8A"} 55%, color-mix(in srgb, ${planetMeta?.color ?? "#5B4B8A"} 70%, #1a1428))`,
              boxShadow:
                planet === "universe"
                  ? "0 0 40px color-mix(in srgb, var(--violet) 35%, transparent)"
                  : `0 0 40px color-mix(in srgb, ${planetMeta?.color ?? "#5B4B8A"} 40%, transparent)`,
            }}
            aria-hidden="true"
          />

          {/* Placed decorations preview on hotspots */}
          {slots.map((slot) => {
            const key = assignmentMap.get(`${planet}:${slot}`);
            const item = key ? getCosmeticByKey(key) : null;
            const pos = PLANET_HOTSPOTS[slot];
            const selected = activeSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
                style={{ left: pos.left, top: pos.top }}
                aria-label={`${SLOT_LABELS[slot]}${item ? `: ${item.name}` : " (empty)"}`}
                aria-pressed={selected}
              >
                <span
                  className="flex size-14 items-center justify-center rounded-full transition-transform"
                  style={{
                    background: item
                      ? "color-mix(in srgb, var(--surface) 85%, transparent)"
                      : "color-mix(in srgb, var(--surface) 45%, transparent)",
                    border: selected
                      ? "2px solid var(--gold)"
                      : item
                        ? "2px solid color-mix(in srgb, var(--violet) 35%, transparent)"
                        : "2px dashed color-mix(in srgb, var(--foreground) 35%, transparent)",
                    transform: selected ? "scale(1.08)" : undefined,
                    boxShadow: selected
                      ? "0 0 18px color-mix(in srgb, var(--gold) 45%, transparent)"
                      : undefined,
                  }}
                >
                  {item ? (
                    <CosmeticSprite visual={item.visual} size={36} />
                  ) : (
                    <span
                      className="text-lg font-light"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      +
                    </span>
                  )}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold"
                  style={{
                    background: "color-mix(in srgb, var(--surface) 80%, transparent)",
                    color: "var(--foreground)",
                  }}
                >
                  {pos.hint}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 3 — pick decoration */}
      <section
        className="mt-10 rounded-[1.75rem] p-5"
        style={{
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
          border: "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
        }}
      >
        {!activeSlot ? (
          <p
            className="text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Tap any glowing spot above to choose what goes there.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">
                  3. What goes on {SLOT_LABELS[activeSlot].toLowerCase()}?
                </h2>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {equippedKey
                    ? "Tap another decoration to swap, or clear the spot."
                    : "Pick one you own — or visit the store if this list is empty."}
                </p>
              </div>
              {equippedKey ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => assign(null)}
                  className="rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  style={{
                    background:
                      "color-mix(in srgb, var(--violet) 12%, transparent)",
                  }}
                >
                  Clear spot
                </button>
              ) : null}
            </div>

            {ownedForSlot.length === 0 ? (
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                You don’t own anything for this spot yet.{" "}
                <TransitionLink
                  href="/store"
                  variant="fade"
                  className="font-semibold underline-offset-2 hover:underline"
                  style={{ color: "var(--violet)" }}
                >
                  Browse the store
                </TransitionLink>
                .
              </p>
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ownedForSlot.map((item) => {
                  const isOn = equippedKey === item.key;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => assign(item.key)}
                        className="flex w-full flex-col items-center gap-2 rounded-2xl p-3 text-center transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                        style={{
                          background: isOn
                            ? "color-mix(in srgb, var(--gold) 22%, var(--surface))"
                            : "color-mix(in srgb, var(--background) 70%, transparent)",
                          border: isOn
                            ? "2px solid var(--gold)"
                            : "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
                        }}
                      >
                        <CosmeticSprite visual={item.visual} size={52} />
                        <span className="text-sm font-semibold leading-tight">
                          {item.name}
                        </span>
                        <span
                          className="text-[0.75rem] font-medium"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {isOn ? "On this spot" : "Place here"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {message ? (
          <p
            className="mt-4 text-sm font-medium"
            style={{ color: "var(--violet)" }}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </section>

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
          See it on Universe
        </TransitionLink>
      </div>
    </div>
  );
}
