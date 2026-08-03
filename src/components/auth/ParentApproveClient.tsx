"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AgeGateShell } from "@/components/auth/AgeGateShell";
import { approveParentConsentPrototype } from "@/lib/age-gate/prototype";

function ApproveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"working" | "ok" | "bad">("working");

  useEffect(() => {
    if (!token) {
      setStatus("bad");
      return;
    }
    const ok = approveParentConsentPrototype(token);
    setStatus(ok ? "ok" : "bad");
    if (ok) {
      const timer = window.setTimeout(() => router.push("/home"), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [token, router]);

  return (
    <AgeGateShell eyebrow="Parent approval">
      {status === "working" ? (
        <p style={{ color: "var(--foreground-muted)" }}>Confirming approval…</p>
      ) : null}

      {status === "ok" ? (
        <>
          <h1
            className="font-[family-name:var(--font-fraunces)] text-[2rem] leading-tight"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            Permission granted
          </h1>
          <p
            className="mt-4 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            Prototype approval succeeded. Taking you to Haelo…
          </p>
        </>
      ) : null}

      {status === "bad" ? (
        <>
          <h1
            className="font-[family-name:var(--font-fraunces)] text-[2rem] leading-tight"
            style={{
              fontVariationSettings: '"opsz" 84, "SOFT" 50, "WONK" 1, "wght" 550',
            }}
          >
            This approval link isn&rsquo;t valid
          </h1>
          <p
            className="mt-4 text-[1.0625rem] leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            In this prototype, approval only works with the link from the waiting
            step in the same browser session.
          </p>
          <Link
            href="/age-verification/parent"
            className="mt-8 inline-flex rounded-full bg-[var(--violet)] px-5 py-3 text-sm font-semibold text-[var(--on-violet)]"
          >
            Start parent permission again
          </Link>
        </>
      ) : null}
    </AgeGateShell>
  );
}

export function ParentApproveClient() {
  return (
    <Suspense
      fallback={
        <AgeGateShell eyebrow="Parent approval">
          <p style={{ color: "var(--foreground-muted)" }}>Loading…</p>
        </AgeGateShell>
      }
    >
      <ApproveContent />
    </Suspense>
  );
}
