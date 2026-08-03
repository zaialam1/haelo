"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AgeGateShell } from "@/components/auth/AgeGateShell";
import { getParentEmailPrototype } from "@/lib/age-gate/prototype";

function PendingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const parentEmail = getParentEmailPrototype();

  const approveHref = token
    ? `/age-verification/approve?token=${encodeURIComponent(token)}`
    : "/age-verification/parent";

  return (
    <AgeGateShell eyebrow="Waiting">
      <p
        className="text-[0.6875rem] font-semibold tracking-[0.14em] uppercase"
        style={{ color: "var(--violet)" }}
      >
        Prototype
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
            In a finished product, we would email{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {parentEmail}
            </span>{" "}
            with an approval link. That email is <strong>not</strong> sent yet —
            there is no email service connected.
          </>
        ) : (
          <>
            In a finished product, a parent or guardian would get an approval
            email. That email is <strong>not</strong> sent yet.
          </>
        )}
      </p>

      <div
        className="mt-8 rounded-3xl border-2 p-5"
        style={{
          borderColor: "color-mix(in srgb, var(--gold) 50%, transparent)",
          backgroundColor:
            "color-mix(in srgb, var(--gold) 22%, var(--background))",
        }}
      >
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Demo only
        </p>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Use this button to pretend a parent clicked the approval link in their
          email.
        </p>
        <Link
          href={approveHref}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--violet)]"
        >
          Simulate parent approval
        </Link>
      </div>

      <Link
        href="/age-verification/parent"
        className="mt-6 inline-flex text-sm font-semibold text-[var(--violet)] underline-offset-4 hover:underline"
      >
        ← Change email
      </Link>
    </AgeGateShell>
  );
}

export function ParentPendingClient() {
  return (
    <Suspense
      fallback={
        <AgeGateShell eyebrow="Waiting">
          <p style={{ color: "var(--foreground-muted)" }}>Loading…</p>
        </AgeGateShell>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
