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
  CosmeticsState,
  SlotAssignment,
} from "@/lib/cosmetics/types";
import { SLOT_LABELS } from "@/lib/cosmetics/types";
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

export function DecorateClient({ initialState }: DecorateClientProps) {
  const [state, setState] = useState(initialState);
  const [planet, setPlanet] = useState<CosmeticsPlanetId>("express");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    trackEvent("decorate_opened", {});
  }, []);

  useEffect(() => {
    setMessage(null);
  }, [planet]);

  const onPlanet = useMemo(
    () =>
      state.assignments.filter(
        (a) => a.planet === planet && a.cosmeticKey,
      ),
    [state.assignments, planet],
  );

  const ownedItems = useMemo(() => {
    return state.owned
      .map((o) => getCosmeticByKey(o.cosmeticKey))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [state.owned]);

  const planetMeta =
    planet === "universe"
      ? { label: "Outer space", color: "#5B4B8A" }
      : getVoicePlanetById(planet);

  function addDecoration(cosmeticKey: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await placeCosmeticAction({ planet, cosmeticKey });
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
            Add as many decorations as you want to a world — no per-spot limit.
            Tap an owned item to place another copy; remove any you don’t want.
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

      <section
        className="mt-10 rounded-[1.75rem] p-5"
        style={{
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
          border: "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
        }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">
            On {planetMeta?.label ?? "this world"}
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            {onPlanet.length === 0
              ? "Nothing yet"
              : `${onPlanet.length} decoration${onPlanet.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {onPlanet.length === 0 ? (
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Add decorations from your collection below — you can stack as many
            as you like.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {onPlanet.map((assignment) => {
              const item = getCosmeticByKey(assignment.cosmeticKey!);
              if (!item) return null;
              return (
                <li
                  key={assignment.id}
                  className="flex flex-col items-center gap-2 rounded-2xl p-3 text-center"
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
                    className="text-[0.6875rem]"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {SLOT_LABELS[assignment.slotKey]}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => removePlacement(assignment)}
                    className="mt-1 rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
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
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold">2. Add from your collection</h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--foreground-muted)" }}
        >
          Tap any item to place it. Tap again to place another — no limit.
        </p>

        {ownedItems.length === 0 ? (
          <p
            className="mt-5 text-sm leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            You don’t own any decorations yet.{" "}
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
            {ownedItems.map((item) => {
              const placedCount = onPlanet.filter(
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
                        "color-mix(in srgb, var(--surface) 85%, transparent)",
                      border:
                        "1px solid color-mix(in srgb, var(--violet) 12%, transparent)",
                    }}
                  >
                    <CosmeticSprite visual={item.visual} size={52} />
                    <span className="text-sm font-semibold leading-tight">
                      {item.name}
                    </span>
                    <span
                      className="text-[0.75rem] font-medium"
                      style={{ color: "var(--violet)" }}
                    >
                      {placedCount > 0
                        ? `Add another · ${placedCount} here`
                        : "Add to world"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
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
