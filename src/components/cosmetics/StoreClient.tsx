"use client";

import { useMemo, useState, useTransition } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { CosmeticSprite } from "@/components/cosmetics/CosmeticSprite";
import { StardustChip } from "@/components/cosmetics/StardustChip";
import { purchaseCosmeticAction } from "@/lib/cosmetics/actions";
import { COSMETICS_CATALOG } from "@/lib/cosmetics/catalog";
import type {
  CosmeticDefinition,
  CosmeticsSlotKey,
  CosmeticsState,
} from "@/lib/cosmetics/types";
import { SLOT_LABELS } from "@/lib/cosmetics/types";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

const FILTERS: Array<{ id: "all" | CosmeticsSlotKey; label: string }> = [
  { id: "all", label: "All" },
  { id: "creature", label: SLOT_LABELS.creature },
  { id: "ground", label: SLOT_LABELS.ground },
  { id: "moon", label: SLOT_LABELS.moon },
  { id: "ring", label: SLOT_LABELS.ring },
  { id: "sky", label: SLOT_LABELS.sky },
  { id: "outer_comet", label: "Outer" },
  { id: "nebula_haze", label: "Nebula" },
];

type StoreClientProps = {
  initialState: CosmeticsState;
};

export function StoreClient({ initialState }: StoreClientProps) {
  const [state, setState] = useState(initialState);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    trackEvent("store_opened", {});
  }, []);

  const ownedKeys = useMemo(
    () => new Set(state.owned.map((o) => o.cosmeticKey)),
    [state.owned],
  );

  const items = useMemo(() => {
    const list =
      filter === "all"
        ? [...COSMETICS_CATALOG]
        : COSMETICS_CATALOG.filter((item) => item.slotTypes.includes(filter));
    return list.sort((a, b) => a.price - b.price);
  }, [filter]);

  function buy(item: CosmeticDefinition) {
    setMessage(null);
    setPendingKey(item.key);
    startTransition(async () => {
      const result = await purchaseCosmeticAction(item.key);
      setPendingKey(null);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setState(result.state);
      setMessage(result.message ?? "Purchased.");
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
            style={{ color: "var(--gold)" }}
          >
            Universe store
          </p>
          <h1
            className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl leading-tight sm:text-4xl"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Decorate with Stardust
          </h1>
          <p
            className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Earn Stardust by practicing. Spend it on companions, moons, and
            quiet details for your private Universe.
          </p>
        </div>
        <StardustChip balance={state.balance} href={undefined} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
            style={{
              background:
                filter === f.id
                  ? "var(--violet)"
                  : "color-mix(in srgb, var(--violet) 10%, transparent)",
              color:
                filter === f.id ? "var(--on-violet)" : "var(--foreground)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message ? (
        <p
          className="mt-4 text-sm"
          style={{ color: "var(--foreground-muted)" }}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const owned = ownedKeys.has(item.key);
          const canAfford = state.balance >= item.price;
          const busy = pending && pendingKey === item.key;
          return (
            <li
              key={item.key}
              className="rounded-3xl p-4"
              style={{
                background:
                  "color-mix(in srgb, var(--surface) 80%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--violet) 14%, transparent)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--gold) 16%, var(--background))",
                  }}
                >
                  <CosmeticSprite visual={item.visual} size={44} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-[1rem] font-semibold">{item.name}</h2>
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: "var(--violet)" }}
                    >
                      {item.price} ✦
                    </span>
                  </div>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {item.blurb}
                  </p>
                  <p
                    className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {item.rarity} ·{" "}
                    {item.slotTypes.map((s) => SLOT_LABELS[s]).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {owned ? (
                  <span
                    className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold"
                    style={{
                      background:
                        "color-mix(in srgb, var(--violet) 12%, transparent)",
                      color: "var(--foreground)",
                    }}
                  >
                    Owned
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={busy || !canAfford}
                    onClick={() => buy(item)}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--violet)] px-5 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                  >
                    {busy
                      ? "Buying…"
                      : canAfford
                        ? "Buy"
                        : "Need more Stardust"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <TransitionLink
          href="/decorate"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
          style={{
            background: "var(--gold)",
            color: "var(--foreground)",
          }}
        >
          Decorate Universe
        </TransitionLink>
        <TransitionLink
          href="/home"
          variant="fade"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
          style={{
            background: "color-mix(in srgb, var(--violet) 12%, transparent)",
            color: "var(--foreground)",
          }}
        >
          Back to Universe
        </TransitionLink>
      </div>
    </div>
  );
}
