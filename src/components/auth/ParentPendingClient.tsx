"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useEffectEvent } from "react";
import { AgeGateShell } from "@/components/auth/AgeGateShell";
import {
  getAgeGateSnapshotAction,
  requestParentalConsentAction,
} from "@/lib/age-gate/actions";

export function ParentPendingClient() {
  const router = useRouter();
  const [parentEmail, setParentEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const onSnapshot = useEffectEvent(
    (snapshot: Awaited<ReturnType<typeof getAgeGateSnapshotAction>>) => {
      if (!snapshot.ok) {
        setError(snapshot.message);
        setLoading(false);
        return;
      }

      if (snapshot.cleared) {
        router.push("/onboarding/username");
        router.refresh();
        return;
      }

      if (snapshot.status !== "awaiting_parent") {
        router.push("/age-verification");
        router.refresh();
        return;
      }

      setParentEmail(snapshot.pendingParentEmail);
      setLoading(false);
    },
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const snapshot = await getAgeGateSnapshotAction();
      if (!cancelled) onSnapshot(snapshot);
    }

    void load();

    const interval = window.setInterval(() => {
      void load();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function resend() {
    if (!parentEmail) {
      router.push("/age-verification/parent");
      return;
    }
    setResending(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const result = await requestParentalConsentAction(parentEmail);
      if (!result.ok) {
        setError(result.message);
      } else {
        setMessage(`We sent another email to ${result.parentEmail}.`);
      }
    } catch {
      setError("Couldn’t resend the email. Try again.");
    } finally {
      setResending(false);
    }
  }

  if (loading) {
    return (
      <AgeGateShell eyebrow="Waiting">
        <p style={{ color: "var(--foreground-muted)" }}>Loading…</p>
      </AgeGateShell>
    );
  }

  return (
    <AgeGateShell eyebrow="Waiting">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Almost there
      </p>
      <h1
        className="mt-3 font-[family-name:var(--font-fraunces)] text-[2rem] leading-tight sm:text-[2.25rem]"
        style={{
          fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
          letterSpacing: "-0.02em",
        }}
      >
        Waiting for parent approval
      </h1>
      <p
        className="mt-4 text-[1.0625rem] leading-relaxed"
        style={{ color: "var(--foreground-muted)" }}
      >
        {parentEmail ? (
          <>
            We emailed{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {parentEmail}
            </span>{" "}
            an approval link. This page will continue once they approve.
          </>
        ) : (
          <>
            We sent a parent or guardian an approval link. This page will
            continue once they approve.
          </>
        )}
      </p>

      {message ? (
        <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-[#9B2C2C]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={resend}
        disabled={resending}
        className="mt-8 inline-flex w-full items-center justify-center rounded-full border-2 border-[var(--violet)] bg-[color-mix(in_srgb,var(--rose)_18%,var(--background))] px-6 py-3.5 text-[0.9375rem] font-semibold text-[var(--violet)] transition-colors hover:bg-[color-mix(in_srgb,var(--rose)_30%,var(--background))] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
      >
        {resending ? "Sending…" : "Resend email"}
      </button>

      <Link
        href="/age-verification/parent"
        className="mt-6 inline-flex text-sm font-semibold text-[var(--violet)] underline-offset-4 hover:underline"
      >
        ← Change email
      </Link>
    </AgeGateShell>
  );
}
