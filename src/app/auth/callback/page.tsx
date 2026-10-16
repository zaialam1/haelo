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
      const next = safeNextPath(params.get("next"), "/home");
      const isRecovery = next.startsWith("/auth/update-password");

      if (isRecovery) {
        setMessage("Opening password reset…");
      }

      if (!code) {
        if (!cancelled) {
          router.replace(
            `/auth/error?reason=${isRecovery ? "recovery" : "confirm"}`,
          );
        }
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (cancelled) return;

      if (error) {
        setMessage(
          isRecovery
            ? "That reset link didn’t work."
            : "That confirmation link didn’t work.",
        );
        router.replace(
          `/auth/error?reason=${isRecovery ? "recovery" : "confirm"}`,
        );
        return;
      }

      const { resolvePostAuthPathAction } = await import("@/lib/auth/postAuth");
      const destination = await resolvePostAuthPathAction(next, next);
      router.replace(destination);
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
