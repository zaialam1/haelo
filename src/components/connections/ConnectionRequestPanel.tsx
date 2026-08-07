"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingConnectionRequestAction,
  respondToConnectionRequestAction,
} from "@/lib/connections/actions";
import { markNotificationReadAction } from "@/lib/notifications/actions";
import { formatUsernameDisplay } from "@/lib/profiles/username";
import type { AppNotification } from "@/lib/connections/types";

type Props = {
  notification: AppNotification;
  onClose: () => void;
  onResolved: () => void;
};

export function ConnectionRequestPanel({
  notification,
  onClose,
  onResolved,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);
  const [professionalUsername, setProfessionalUsername] = useState<
    string | null
  >(null);
  const [connectionId, setConnectionId] = useState<string | null>(
    notification.referenceId,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!notification.referenceId) {
        setLoading(false);
        setError("Connection request not found.");
        return;
      }
      const result = await getPendingConnectionRequestAction(
        notification.referenceId,
      );
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConnectionId(result.connection.id);
      setProfessionalUsername(result.connection.professionalUsername);
      void markNotificationReadAction(notification.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [notification.id, notification.referenceId]);

  async function markRead() {
    await markNotificationReadAction(notification.id);
  }

  async function respond(decision: "accepted" | "declined") {
    if (!connectionId) return;
    setBusy(true);
    setError(null);
    await markRead();
    const result = await respondToConnectionRequestAction(
      connectionId,
      decision,
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDone(decision === "accepted" ? "accepted" : "declined");
    onResolved();
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight"
            style={{
              fontVariationSettings: '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              color: "var(--foreground)",
            }}
          >
            Connection request
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            A Haelo professional wants to connect with you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void markRead();
            onClose();
          }}
          className="rounded-full px-2 py-0.5 text-lg leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
          style={{ color: "var(--foreground-muted)" }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Loading…
        </p>
      ) : done === "accepted" ? (
        <p className="text-sm font-semibold" style={{ color: "var(--violet)" }}>
          Connected
        </p>
      ) : done === "declined" ? (
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Request declined.
        </p>
      ) : (
        <>
          {professionalUsername ? (
            <p
              className="font-[family-name:var(--font-fraunces)] text-xl"
              style={{
                fontVariationSettings:
                  '"opsz" 72, "SOFT" 40, "WONK" 0, "wght" 550',
              }}
            >
              {formatUsernameDisplay(professionalUsername)}
            </p>
          ) : null}

          <div
            className="rounded-2xl border px-4 py-4"
            style={{ borderColor: "var(--hairline)" }}
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">
              Connecting lets this person recommend Orbits to you.
            </p>
            <p
              className="mt-3 text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--violet)" }}
            >
              They will NOT automatically be able to see
            </p>
            <ul
              className="mt-2 space-y-1 text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              <li>your recordings</li>
              <li>your transcripts</li>
              <li>your AI analyses</li>
              <li>your Journey</li>
              <li>your Journey levels/scores</li>
              <li>your Orbit responses</li>
            </ul>
          </div>

          {error ? (
            <p className="mt-1 text-sm text-[#9B2C2C]" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={busy || pending || !connectionId}
              onClick={() => void respond("accepted")}
              className="rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {busy ? "Saving…" : "Accept connection"}
            </button>
            <button
              type="button"
              disabled={busy || pending || !connectionId}
              onClick={() => void respond("declined")}
              className="rounded-full border px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--violet-soft)] disabled:opacity-70"
              style={{
                borderColor: "var(--hairline)",
                color: "var(--foreground)",
              }}
            >
              Decline
            </button>
          </div>
        </>
      )}
    </div>
  );
}
