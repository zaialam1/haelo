"use client";

import { useState } from "react";
import { TransitionLink } from "@/components/transitions/TransitionLink";
import { ConnectionRequestPanel } from "@/components/connections/ConnectionRequestPanel";
import { OrbitRecommendationPanel } from "@/components/recommendations/OrbitRecommendationPanel";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import type { AppNotification, NotificationType } from "@/lib/connections/types";

const TYPE_COPY: Record<
  NotificationType,
  { title: string; context: string }
> = {
  connection_request: {
    title: "Connection request",
    context: "Someone wants to connect with you.",
  },
  orbit_recommendation: {
    title: "Orbit recommendation",
    context: "An Orbit was recommended to you.",
  },
  orbit_recommendation_reminder: {
    title: "Orbit reminder",
    context: "A recommended Orbit is still waiting.",
  },
  celestial_discovery: {
    title: "Celestial discovery",
    context: "Something new appeared in your Universe.",
  },
  milestone_moment: {
    title: "Something shifted",
    context: "A quiet change showed up in your practice.",
  },
  my_voice_updated: {
    title: "My Voice",
    context: "Your voice summary has taken new shape.",
  },
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function SimpleDetail({
  notification,
  href,
  cta,
  onDone,
}: {
  notification: AppNotification;
  href: string;
  cta: string;
  onDone: () => void;
}) {
  const copy = TYPE_COPY[notification.type];
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p
          className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            color: "var(--foreground)",
          }}
        >
          {copy.title}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <p
        className="mt-3 text-sm leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {copy.context}
      </p>
      <TransitionLink
        href={href}
        variant="fade"
        className="mt-5 inline-flex text-sm font-semibold"
        style={{ color: "var(--violet)" }}
        onClick={onDone}
      >
        {cta} →
      </TransitionLink>
    </div>
  );
}

/**
 * Unified notification panel. Groups items into New (unread) and Earlier
 * (read). Read is separate from resolved: opening a connection request marks
 * it read, but the request stays pending until Accept/Decline.
 */
export function NotificationCenter({
  notifications,
  recipientIsProfessional = false,
  onClose,
  titleId,
}: {
  notifications: AppNotification[];
  recipientIsProfessional?: boolean;
  onClose: () => void;
  /** id for the panel heading, for aria-labelledby on the host dialog */
  titleId?: string;
}) {
  const [active, setActive] = useState<AppNotification | null>(null);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const items = notifications.filter((n) => !resolvedIds.includes(n.id));
  const isRead = (n: AppNotification) =>
    Boolean(n.readAt) || readIds.includes(n.id);
  const fresh = items.filter((n) => !isRead(n));
  const earlier = items.filter((n) => isRead(n));

  function open(n: AppNotification) {
    if (!isRead(n)) {
      setReadIds((prev) => [...prev, n.id]);
      // Detail panels for connection/orbit types also mark read on load;
      // the action is idempotent (only sets read_at when null).
      void markNotificationReadAction(n.id).catch(() => {});
    }
    setActive(n);
  }

  if (active) {
    if (active.type === "connection_request") {
      return (
        <ConnectionRequestPanel
          notification={active}
          recipientIsProfessional={recipientIsProfessional}
          onClose={() => {
            setActive(null);
            onClose();
          }}
          onResolved={() => {
            setResolvedIds((prev) => [...prev, active.id]);
            setActive(null);
          }}
        />
      );
    }
    if (
      active.type === "orbit_recommendation" ||
      active.type === "orbit_recommendation_reminder"
    ) {
      return (
        <OrbitRecommendationPanel
          notification={active}
          onClose={() => {
            setActive(null);
            onClose();
          }}
        />
      );
    }
    if (active.type === "my_voice_updated") {
      return (
        <SimpleDetail
          notification={active}
          href="/my-voice"
          cta="Open My Voice"
          onDone={() => {
            setActive(null);
            onClose();
          }}
        />
      );
    }
    return (
      <SimpleDetail
        notification={active}
        href={active.type === "milestone_moment" ? "/journey" : "/home"}
        cta={
          active.type === "milestone_moment"
            ? "See it in Journey"
            : "Open Universe"
        }
        onDone={() => {
          setActive(null);
          onClose();
        }}
      />
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p
          id={titleId}
          className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight"
          style={{
            fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
            color: "var(--foreground)",
          }}
        >
          Notifications
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
          aria-label="Close notifications"
        >
          ×
        </button>
      </div>

      {items.length === 0 ? (
        <p
          className="mt-4 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          You&rsquo;re all caught up. New moments will appear here.
        </p>
      ) : (
        <div className="mt-4 max-h-[55vh] space-y-4 overflow-y-auto pr-0.5">
          {fresh.length > 0 ? (
            <NotificationGroup
              label="New"
              items={fresh}
              unread
              onOpen={open}
            />
          ) : null}
          {earlier.length > 0 ? (
            <NotificationGroup
              label="Earlier"
              items={earlier}
              onOpen={open}
            />
          ) : null}
        </div>
      )}
    </>
  );
}

function NotificationGroup({
  label,
  items,
  unread = false,
  onOpen,
}: {
  label: string;
  items: AppNotification[];
  unread?: boolean;
  onOpen: (n: AppNotification) => void;
}) {
  return (
    <div>
      <p
        className="text-[0.625rem] font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--foreground-muted)" }}
      >
        {label}
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((n) => {
          const copy = TYPE_COPY[n.type];
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onOpen(n)}
                className="w-full rounded-2xl border px-3 py-2.5 text-left transition-colors hover:bg-[var(--violet-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
                style={{
                  borderColor: unread
                    ? "color-mix(in srgb, var(--gold) 40%, var(--hairline))"
                    : "var(--hairline)",
                }}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--violet)" }}
                  >
                    {copy.title}
                    {unread ? (
                      <>
                        <span
                          className="ml-2 inline-block size-1.5 rounded-full align-middle"
                          style={{
                            background: "var(--gold)",
                            boxShadow:
                              "0 0 6px color-mix(in srgb, var(--gold) 55%, transparent)",
                          }}
                          aria-hidden="true"
                        />
                        <span className="sr-only"> (unread)</span>
                      </>
                    ) : null}
                  </span>
                  <span
                    className="shrink-0 text-[0.625rem]"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {relativeTime(n.createdAt)}
                  </span>
                </span>
                <span
                  className="mt-0.5 block text-xs leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {copy.context}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
