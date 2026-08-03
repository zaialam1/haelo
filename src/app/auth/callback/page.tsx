"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { safeNextPath } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/client";

/**
 * PKCE email / OAuth redirects land here with ?code=.
 * Exchange must run in the browser so the code-verifier cookie is readable.
 * Cross-browser email confirmation should use /auth/confirm?token_hash=... instead.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your account…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = safeNextPath(params.get("next"), "/age-verification");
      const cookieNames = document.cookie
        ? document.cookie.split(";").map((part) => part.trim().split("=")[0])
        : [];
      const hasPkceVerifier = cookieNames.some(
        (name) =>
          name.includes("code-verifier") ||
          name.includes("code_verifier") ||
          name.includes("verifier"),
      );

      // #region agent log
      fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "15d12f",
        },
        body: JSON.stringify({
          sessionId: "15d12f",
          runId: "post-fix",
          hypothesisId: "A",
          location: "auth/callback/page.tsx:entry",
          message: "Client auth callback hit",
          data: {
            hasCode: Boolean(code),
            codeLength: code?.length ?? 0,
            next,
            hasPkceVerifier,
            cookieNameCount: cookieNames.length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (!code) {
        if (!cancelled) router.replace("/auth/error");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      // #region agent log
      fetch("http://127.0.0.1:7260/ingest/327a9bfd-1a4e-4e3a-9bbf-2eff52fa2f90", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "15d12f",
        },
        body: JSON.stringify({
          sessionId: "15d12f",
          runId: "post-fix",
          hypothesisId: "B",
          location: "auth/callback/page.tsx:exchange",
          message: "Client exchangeCodeForSession result",
          data: {
            ok: !error,
            errorMessage: error?.message ?? null,
            errorCode: (error as { code?: string } | null)?.code ?? null,
            hasSession: Boolean(data?.session),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      if (cancelled) return;

      if (error) {
        setMessage("That confirmation link didn’t work.");
        router.replace("/auth/error");
        return;
      }

      router.replace(next);
      router.refresh();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      className="flex min-h-dvh items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <p className="text-sm text-[var(--foreground-muted)]">{message}</p>
    </main>
  );
}
