"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";
import { StardustChip } from "@/components/cosmetics/StardustChip";
import {
  placeCosmeticAction,
  removeCosmeticPlacementAction,
} from "@/lib/cosmetics/actions";
import { getCosmeticByKey } from "@/lib/cosmetics/catalog";
import type {
  CosmeticsPlanetId,
  CosmeticsSlotKey,
  CosmeticsState,
  SlotAssignment,
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

const PLANET_OPTIONS: Array<{
  id: CosmeticsPlanetId;
  label: string;
  color: string;
}> = [
  ...VOICE_PLANETS.map((p) => ({
    id: p.id as CosmeticsPlanetId,
    label: p.label,
    color: p.color,
  })),
  { id: "universe", label: "Outer space", color: "#5B4B8A" },
];

/** Visual placement spots around the preview globe. */
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

  const onPlanet = useMemo(
    () => state.assignments.filter((a) => a.planet === planet && a.cosmeticKey),
    [state.assignments, planet],
  );

  const onActiveSlot = useMemo(
    () =>
      activeSlot
        ? onPlanet.filter((a) => a.slotKey === activeSlot)
        : [],
    [onPlanet, activeSlot],
  );

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

  function countOnSlot(slot: CosmeticsSlotKey) {
    return onPlanet.filter((a) => a.slotKey === slot).length;
  }

  function addDecoration(cosmeticKey: string) {
    if (!activeSlot) return;
    setMessage(null);
    startTransition(async () => {
      const result = await placeCosmeticAction({
        planet,
        cosmeticKey,
        slotKey: activeSlot,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setState(result.state);
      setMessage(result.message ?? "Added.");
    });
  }

  function removePlacement(assignment: SlotAssignment) {
    setMessage(null);
    startTransition(async () => {
      const result = await removeCosmeticPlacementAction(assignment.id);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setState(result.state);
      setMessage(result.message ?? "Removed.");
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
            Dress up your Universe
          </h1>
          <p
            className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Tap a spot on the planet, then add as many decorations as you want
            there — no limit.
          </p>
        </div>
        <StardustChip balance={state.balance} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">1. Which world?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PLANET_OPTIONS.map((option) => {
            const selected = planet === option.id;
            const count = state.assignments.filter(
              (a) => a.planet === option.id && a.cosmeticKey,
            ).length;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPlanet(option.id)}
                className="flex flex-col items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
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
                {count > 0 ? (
                  <span
                    className="text-[0.6875rem] font-medium"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {count} placed
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold">
          2. Tap a spot on {planetMeta?.label ?? "this world"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Circles show where things can go. A number means how many you’ve
          already placed there.
        </p>

        <div
          className="relative mx-auto mt-5 aspect-square w-full max-w-sm rounded-[2rem]"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--violet) 18%, #1a1428))",
            border:
              "1px solid color-mix(in srgb, var(--violet) 16%, transparent)",
          }}
        >
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

          {slots.map((slot) => {
            const count = countOnSlot(slot);
            const pos = PLANET_HOTSPOTS[slot];
            const selected = activeSlot === slot;
            const preview = onPlanet.find((a) => a.slotKey === slot);
            const previewItem = preview?.cosmeticKey
              ? getCosmeticByKey(preview.cosmeticKey)
              : null;

            return (
              <button
                key={slot}
                type="button"
                onClick={() => setActiveSlot(slot)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
                style={{ left: pos.left, top: pos.top }}
                aria-label={`${SLOT_LABELS[slot]}${count ? `, ${count} placed` : " (empty)"}`}
                aria-pressed={selected}
              >
                <span
                  className="relative flex size-14 items-center justify-center rounded-full transition-transform"
                  style={{
                    background: previewItem
                      ? "color-mix(in srgb, var(--surface) 85%, transparent)"
                      : "color-mix(in srgb, var(--surface) 45%, transparent)",
                    border: selected
                      ? "2px solid var(--gold)"
                      : count > 0
                        ? "2px solid color-mix(in srgb, var(--violet) 40%, transparent)"
                        : "2px dashed color-mix(in srgb, var(--foreground) 35%, transparent)",
                    transform: selected ? "scale(1.08)" : undefined,
                    boxShadow: selected
                      ? "0 0 18px color-mix(in srgb, var(--gold) 45%, transparent)"
                      : undefined,
                  }}
                >
                  {previewItem ? (
                    <CosmeticSprite visual={previewItem.visual} size={34} />
                  ) : (
                    <span
                      className="text-lg font-light"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      +
                    </span>
                  )}
                  {count > 0 ? (
                    <span
                      className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full text-[0.625rem] font-bold"
                      style={{
                        background: "var(--gold)",
                        color: "var(--foreground)",
                      }}
                    >
                      {count}
                    </span>
                  ) : null}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold"
                  style={{
                    background:
                      "color-mix(in srgb, var(--surface) 80%, transparent)",
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
            Tap any spot above to choose where to place decorations.
          </p>
        ) : (
          <>
            <h2 className="text-sm font-semibold">
              3. Add to {SLOT_LABELS[activeSlot].toLowerCase()}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--foreground-muted)" }}
            >
              Tap an item to place another copy here — as many as you want.
            </p>

            {onActiveSlot.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {onActiveSlot.map((assignment) => {
                  const item = getCosmeticByKey(assignment.cosmeticKey!);
                  if (!item) return null;
                  return (
                    <li
                      key={assignment.id}
                      className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2"
                      style={{
                        background:
                          "color-mix(in srgb, var(--gold) 18%, var(--surface))",
                        border:
                          "1px solid color-mix(in srgb, var(--gold) 40%, transparent)",
                      }}
                    >
                      <CosmeticSprite visual={item.visual} size={28} />
                      <span className="text-sm font-semibold">{item.name}</span>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => removePlacement(assignment)}
                        className="rounded-full px-2 py-0.5 text-[0.75rem] font-semibold disabled:opacity-60"
                        style={{
                          background:
                            "color-mix(in srgb, var(--violet) 12%, transparent)",
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {ownedForSlot.length === 0 ? (
              <p
                className="mt-5 text-sm leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Nothing owned for this spot.{" "}
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
                  const placedHere = onActiveSlot.filter(
                    (a) => a.cosmeticKey === item.key,
                  ).length;
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => addDecoration(item.key)}
                        className="flex w-full flex-col items-center gap-2 rounded-2xl p-3 text-center transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                        style={{
                          background:
                            "color-mix(in srgb, var(--background) 70%, transparent)",
                          border:
                            "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
                        }}
                      >
                        <CosmeticSprite visual={item.visual} size={48} />
                        <span className="text-sm font-semibold leading-tight">
                          {item.name}
                        </span>
                        <span
                          className="text-[0.75rem] font-medium"
                          style={{ color: "var(--violet)" }}
                        >
                          {placedHere > 0
                            ? `Add another · ${placedHere} here`
                            : "Add here"}
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
