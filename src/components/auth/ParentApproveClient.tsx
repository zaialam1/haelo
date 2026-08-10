"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AgeGateShell } from "@/components/auth/AgeGateShell";
import { approveParentalConsentAction } from "@/lib/age-gate/actions";

function ApproveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"working" | "ok" | "bad">("working");
  const [message, setMessage] = useState<string | undefined>();
  const [isChildSession, setIsChildSession] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("bad");
      setMessage("This approval link isn’t valid.");
      return;
    }

    let cancelled = false;
    let redirectTimer: number | undefined;

    async function run() {
      const result = await approveParentalConsentAction(token!);
      if (cancelled) return;

      if (!result.ok) {
        setStatus("bad");
        setMessage(result.message);
        return;
      }

      setStatus("ok");
      setIsChildSession(result.isChildSession);
      if (result.isChildSession && result.nextPath) {
        redirectTimer = window.setTimeout(() => {
          router.push(result.nextPath!);
          router.refresh();
        }, 1200);
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
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
            {isChildSession
              ? "You’re all set. Taking you to Haelo…"
              : "Thanks — you can close this page. Your child can continue in Haelo."}
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
            {message ??
              "Ask your child to send a new permission request from Haelo."}
          </p>
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
