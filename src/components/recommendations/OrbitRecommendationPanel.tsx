"use client";

import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import { getOrbitByKey } from "@/lib/orbits/catalog";
import type { AppNotification } from "@/lib/connections/types";

export function OrbitRecommendationPanel({
  notification,
  onClose,
  onOpened,
}: {
  notification: AppNotification;
  onClose: () => void;
  onOpened?: () => void;
}) {
  const [orbitTitle, setOrbitTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await markNotificationReadAction(notification.id);
      onOpened?.();

      if (!notification.referenceId) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/recommendations/${notification.referenceId}/preview`,
        );
        if (res.ok) {
          const json = (await res.json()) as {
            orbitKey?: string;
            orbitTitle?: string;
          };
          if (!cancelled) {
            setOrbitTitle(
              json.orbitTitle ??
                (json.orbitKey
                  ? getOrbitByKey(json.orbitKey)?.title ?? null
                  : null),
            );
          }
        }
      } catch {
        // Preview is optional; Learn more still works with reference id.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per notification
  }, [notification.id]);

  const isReminder = notification.type === "orbit_recommendation_reminder";
  const href = notification.referenceId
    ? `/orbits/recommended/${notification.referenceId}`
    : "/orbits";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p
          className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
          }}
        >
          {isReminder
            ? "Orbit reminder"
            : "An Orbit was recommended to you"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-0.5 text-lg leading-none text-[var(--foreground-muted)]"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
      ) : (
        <>
          <p
            className="font-[family-name:var(--font-fraunces)] text-base"
            style={{
              fontVariationSettings:
                '"opsz" 72, "SOFT" 35, "WONK" 0, "wght" 500',
            }}
          >
            {orbitTitle ?? "A recommended Orbit"}
          </p>
          <p className="text-sm leading-relaxed text-[var(--foreground-muted)]">
            {isReminder
              ? `${orbitTitle ?? "This Orbit"} is still waiting in Recommended for you.`
              : "Someone you’re connected with thought this Orbit might be useful."}
          </p>
        </>
      )}

      <div className="flex flex-col gap-2">
        <TransitionLink
          href={href}
          variant="fade"
          className="inline-flex justify-center rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
          onClick={onClose}
        >
          Learn more
        </TransitionLink>
        <button
          type="button"
          onClick={onClose}
          className="text-center text-xs font-semibold text-[var(--foreground-muted)]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
